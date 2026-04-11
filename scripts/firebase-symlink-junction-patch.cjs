const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const crossSpawn = require("cross-spawn");

const originalSpawn = childProcess.spawn;

function isNextBuildCommand(command, args) {
  if (!Array.isArray(args) || args.length === 0) {
    return false;
  }

  if (String(args[0] || "").trim() !== "build") {
    return false;
  }

  if (args.includes("--webpack") || args.includes("--turbo") || args.includes("--turbopack")) {
    return false;
  }

  const commandBaseName = path.basename(String(command || "")).toLowerCase();
  return commandBaseName === "next" || commandBaseName === "next.cmd" || commandBaseName === "next.exe";
}

childProcess.spawn = function patchedSpawn(command, args, options) {
  if (isNextBuildCommand(command, args)) {
    return originalSpawn.call(childProcess, command, [...args, "--webpack"], options);
  }

  return originalSpawn.call(childProcess, command, args, options);
};

if (typeof crossSpawn.spawn === "function") {
  const originalCrossSpawn = crossSpawn.spawn.bind(crossSpawn);

  crossSpawn.spawn = function patchedCrossSpawn(command, args, options) {
    if (isNextBuildCommand(command, args)) {
      return originalCrossSpawn(command, [...args, "--webpack"], options);
    }

    return originalCrossSpawn(command, args, options);
  };
}

if (process.platform === "win32") {
  const originalSymlink = fs.symlink;
  const originalSymlinkSync = fs.symlinkSync;

  function normalizePath(value) {
    return String(value || "").replace(/\\/g, "/").toLowerCase();
  }

  function isFirebaseAdminAlias(linkPath) {
    const baseName = path.basename(String(linkPath || ""));
    return /^firebase-admin-[a-f0-9]{8,}$/i.test(baseName);
  }

  function isFirebaseAdminTarget(target) {
    const normalizedTarget = normalizePath(target);
    return (
      normalizedTarget === "firebase-admin" ||
      normalizedTarget.endsWith("/firebase-admin") ||
      normalizedTarget.endsWith("/firebase-admin/")
    );
  }

  function shouldMaterializeFirebaseAdminAlias(target, linkPath) {
    return isFirebaseAdminAlias(linkPath) && isFirebaseAdminTarget(target);
  }

  function resolveTargetPath(target, linkPath) {
    if (path.isAbsolute(target)) {
      return target;
    }

    return path.resolve(path.dirname(linkPath), target);
  }

  function findBuildRootFromAliasPath(linkPath) {
    const absolutePath = path.resolve(linkPath);
    const parts = absolutePath.split(path.sep).filter(Boolean);

    for (let index = 0; index < parts.length - 2; index += 1) {
      if (parts[index] === ".next" && parts[index + 1] === "node_modules") {
        const rootParts = parts.slice(0, index);
        if (absolutePath.startsWith(path.sep)) {
          return `${path.sep}${rootParts.join(path.sep)}`;
        }

        return rootParts.join(path.sep);
      }
    }

    return null;
  }

  function mirrorAliasIntoRootNodeModulesSync(target, linkPath) {
    const buildRoot = findBuildRootFromAliasPath(linkPath);
    if (!buildRoot) {
      return;
    }

    const aliasName = path.basename(String(linkPath || ""));
    const mirroredAliasPath = path.join(buildRoot, "node_modules", aliasName);
    const normalizedMirroredPath = normalizePath(mirroredAliasPath);
    const normalizedLinkPath = normalizePath(path.resolve(linkPath));

    if (normalizedMirroredPath === normalizedLinkPath) {
      return;
    }

    fs.mkdirSync(path.dirname(mirroredAliasPath), { recursive: true });
    fs.rmSync(mirroredAliasPath, { recursive: true, force: true });
    fs.cpSync(resolveTargetPath(target, linkPath), mirroredAliasPath, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
  }

  async function mirrorAliasIntoRootNodeModules(target, linkPath) {
    const buildRoot = findBuildRootFromAliasPath(linkPath);
    if (!buildRoot) {
      return;
    }

    const aliasName = path.basename(String(linkPath || ""));
    const mirroredAliasPath = path.join(buildRoot, "node_modules", aliasName);
    const normalizedMirroredPath = normalizePath(mirroredAliasPath);
    const normalizedLinkPath = normalizePath(path.resolve(linkPath));

    if (normalizedMirroredPath === normalizedLinkPath) {
      return;
    }

    await fs.promises.mkdir(path.dirname(mirroredAliasPath), { recursive: true });
    await fs.promises.rm(mirroredAliasPath, { recursive: true, force: true });
    await fs.promises.cp(resolveTargetPath(target, linkPath), mirroredAliasPath, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });
  }

  function materializeDirectoryAliasSync(target, linkPath) {
    const resolvedTarget = resolveTargetPath(target, linkPath);

    fs.rmSync(linkPath, { recursive: true, force: true });
    fs.cpSync(resolvedTarget, linkPath, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });

    mirrorAliasIntoRootNodeModulesSync(target, linkPath);
  }

  async function materializeDirectoryAlias(target, linkPath) {
    const resolvedTarget = resolveTargetPath(target, linkPath);

    await fs.promises.rm(linkPath, { recursive: true, force: true });
    await fs.promises.cp(resolvedTarget, linkPath, {
      recursive: true,
      force: true,
      errorOnExist: false,
    });

    await mirrorAliasIntoRootNodeModules(target, linkPath);
  }

  function normalizeType(type) {
    if (type === "file") {
      return "file";
    }

    return "junction";
  }

  fs.symlink = function patchedSymlink(target, path, type, callback) {
    if (shouldMaterializeFirebaseAdminAlias(target, path)) {
      let cb = callback;
      if (typeof type === "function") {
        cb = type;
      }

      try {
        materializeDirectoryAliasSync(target, path);
        if (typeof cb === "function") {
          process.nextTick(cb, null);
        }
      } catch (error) {
        if (typeof cb === "function") {
          process.nextTick(cb, error);
        } else {
          throw error;
        }
      }

      return;
    }

    if (typeof type === "function") {
      return originalSymlink.call(fs, target, path, "junction", type);
    }

    return originalSymlink.call(fs, target, path, normalizeType(type), callback);
  };

  fs.symlinkSync = function patchedSymlinkSync(target, path, type) {
    if (shouldMaterializeFirebaseAdminAlias(target, path)) {
      materializeDirectoryAliasSync(target, path);
      return;
    }

    return originalSymlinkSync.call(fs, target, path, normalizeType(type));
  };

  if (fs.promises?.symlink) {
    const originalPromiseSymlink = fs.promises.symlink.bind(fs.promises);

    fs.promises.symlink = function patchedPromiseSymlink(target, path, type) {
      if (shouldMaterializeFirebaseAdminAlias(target, path)) {
        return materializeDirectoryAlias(target, path);
      }

      return originalPromiseSymlink(target, path, normalizeType(type));
    };
  }
}
