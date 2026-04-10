const fs = require('fs');

const path = 'src/components/registration/HackathonForm.tsx';
let data = fs.readFileSync(path, 'utf8');

// 1. Add imports
const importsToAdd = `import { collection, doc, writeBatch, query, where, getDocs, serverTimestamp, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../lib/firebase";\n`;

data = data.replace('import { zodResolver } from "@hookform/resolvers/zod";\n', 'import { zodResolver } from "@hookform/resolvers/zod";\n' + importsToAdd);

data = data.replace(/const uploadScreenshot = async \(file: File\): Promise<string \| null> => \{[\s\S]*?finally \{\s*setIsUploading\(false\);\s*\}\s*\};/,
`const uploadScreenshot = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadMessage("Uploading screenshot securely...");
    setUploadMessageTone("info");

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const tempId = Math.random().toString(36).substring(2, 15);
      const objectPath = \`payments/hackathon/temp_\${tempId}.\${ext}\`;
      const storageRef = ref(storage, objectPath);
      
      await uploadBytes(storageRef, file);
      const uploadedUrl = await getDownloadURL(storageRef);

      setUploadMessage("Screenshot uploaded successfully.");
      setUploadMessageTone("ok");
      setFileError(undefined);
      return uploadedUrl;
    } catch (error) {
      console.error(error);
      setUploadMessage("Connection issue while uploading. Please try again.");
      setUploadMessageTone("error");
      setFileError("Payment screenshot upload failed.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };`);


data = data.replace(/const onSubmit = async \(values: HackathonFormValues\) => \{[\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/,
`const onSubmit = async (values: HackathonFormValues) => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!selectedFile) {
      setFileError("Payment screenshot is required.");
      return;
    }

    setIsSubmitting(true);

    const membersData = values.members.slice(0, values.teamSize).map((member) => ({
      name: member.name.trim(),
      email: member.email.trim().toLowerCase(),
      phone: member.phone.trim(),
      roll_number: member.rollNumber.trim(),
      department: member.department.trim(),
      year_of_study: member.yearOfStudy.trim(),
    }));

    const memberEmails = membersData.map((m) => m.email);
    const uniqueEmails = new Set(memberEmails);
    if (uniqueEmails.size !== memberEmails.length) {
      setSubmitError("Duplicate emails found in the form.");
      setIsSubmitting(false);
      return;
    }

    try {
      const participantsRef = collection(db, "participants");
      const q = query(participantsRef, where("email", "in", memberEmails));
      const existingDocs = await getDocs(q);

      if (!existingDocs.empty) {
        const existingEmails = existingDocs.docs.map(d => d.data().email);
        const dup = memberEmails.find(e => existingEmails.includes(e));
        setSubmitError(\`Email \${dup || memberEmails[0]} is already registered.\`);
        setIsSubmitting(false);
        return;
      }

      const uploadedUrl = await uploadScreenshot(selectedFile);
      if (!uploadedUrl) {
        setIsSubmitting(false);
        return;
      }

      const batch = writeBatch(db);
      const teamRef = doc(collection(db, "hackathon_registrations"));
      const transactionRef = doc(collection(db, "transactions"));
      
      const participantIds = membersData.map(() => doc(collection(db, "participants")).id);

      membersData.forEach((member, index) => {
        const pRef = doc(db, "participants", participantIds[index]);
        batch.set(pRef, {
          participant_id: pRef.id,
          ...member,
          registration_type: "hackathon",
          registration_ref: teamRef.id,
          created_at: serverTimestamp(),
        });
      });

      batch.set(teamRef, {
        team_id: teamRef.id,
        team_name: values.teamName.trim(),
        college: values.college.trim(),
        team_size: values.teamSize,
        member_ids: participantIds,
        transaction_id: transactionRef.id,
        payment_verified: false,
        created_at: serverTimestamp(),
      });

      batch.set(transactionRef, {
        transaction_id: transactionRef.id,
        registration_type: "hackathon",
        registration_ref: teamRef.id,
        upi_transaction_id: values.transactionId.trim(),
        screenshot_url: uploadedUrl,
        amount: 800,
        status: "pending",
        verified_by: null,
        verified_at: null,
        created_at: serverTimestamp(),
      });

      const analyticsRef = doc(db, "analytics", "summary");
      batch.update(analyticsRef, {
        total_hackathon: increment(1),
        [values.teamSize === 3 ? "team_size_3" : "team_size_4"]: increment(1),
        [\`colleges.\${values.college.trim()}\`]: increment(1),
        updated_at: serverTimestamp()
      });

      await batch.commit();

      setSubmitSuccess(
        "Registration submitted successfully. Verification is pending from the admin panel."
      );
      reset({
        teamName: "",
        college: "",
        teamSize: 3,
        members: [
          createEmptyMember(),
          createEmptyMember(),
          createEmptyMember(),
          createEmptyMember(),
        ],
        transactionId: "",
      });
      setSelectedFile(null);
      setFileName("");
      setUploadMessage("");
      setFileError(undefined);
    } catch (error) {
      console.error(error);
      setSubmitError("Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };`);

fs.writeFileSync(path, data);
console.log("Done Hackathon");
