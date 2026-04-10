const fs = require("fs");

if (process.platform === "win32") {
  const originalSymlink = fs.symlink;
  const originalSymlinkSync = fs.symlinkSync;

  function normalizeType(type) {
    if (type === "file") {
      return "file";
    }

    return "junction";
  }

  fs.symlink = function patchedSymlink(target, path, type, callback) {
    if (typeof type === "function") {
      return originalSymlink.call(fs, target, path, "junction", type);
    }

    return originalSymlink.call(fs, target, path, normalizeType(type), callback);
  };

  fs.symlinkSync = function patchedSymlinkSync(target, path, type) {
    return originalSymlinkSync.call(fs, target, path, normalizeType(type));
  };

  if (fs.promises?.symlink) {
    const originalPromiseSymlink = fs.promises.symlink.bind(fs.promises);

    fs.promises.symlink = function patchedPromiseSymlink(target, path, type) {
      return originalPromiseSymlink(target, path, normalizeType(type));
    };
  }
}
