const fs = require('fs');

const path = 'src/components/registration/WorkshopForm.tsx';
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
      const objectPath = \`payments/workshop/temp_\${tempId}.\${ext}\`;
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


data = data.replace(/const onSubmit = async \(values: WorkshopFormValues\) => \{[\s\S]*?finally \{\s*setIsSubmitting\(false\);\s*\}\s*\};/,
`const onSubmit = async (values: WorkshopFormValues) => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!selectedFile) {
      setFileError("Payment screenshot is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const participantsRef = collection(db, "participants");
      const q = query(participantsRef, where("email", "==", values.email.trim().toLowerCase()));
      const existingDocs = await getDocs(q);

      if (!existingDocs.empty) {
        setSubmitError("Email already registered.");
        setIsSubmitting(false);
        return;
      }

      const uploadedUrl = await uploadScreenshot(selectedFile);
      if (!uploadedUrl) {
        setIsSubmitting(false);
        return;
      }

      const batch = writeBatch(db);
      
      const participantRef = doc(collection(db, "participants"));
      const workshopRef = doc(collection(db, "workshop_registrations"));
      const transactionRef = doc(collection(db, "transactions"));

      batch.set(participantRef, {
        participant_id: participantRef.id,
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        registration_type: "workshop",
        registration_ref: workshopRef.id,
        created_at: serverTimestamp(),
      });

      batch.set(workshopRef, {
        workshop_id: workshopRef.id,
        participant_id: participantRef.id,
        transaction_id: transactionRef.id,
        college: values.college.trim(),
        payment_verified: false,
        created_at: serverTimestamp(),
      });

      batch.set(transactionRef, {
        transaction_id: transactionRef.id,
        registration_type: "workshop",
        registration_ref: workshopRef.id,
        upi_transaction_id: values.transactionId.trim(),
        screenshot_url: uploadedUrl,
        amount: 60,
        status: "pending",
        verified_by: null,
        verified_at: null,
        created_at: serverTimestamp(),
      });

      const analyticsRef = doc(db, "analytics", "summary");
      batch.update(analyticsRef, {
        total_workshop: increment(1),
        [\`colleges.\${values.college.trim()}\`]: increment(1),
        updated_at: serverTimestamp()
      });

      await batch.commit();

      setSubmitSuccess(
        "Registration submitted successfully. Verification is pending from the admin panel."
      );
      reset();
      setSelectedFile(null);
      setFileName("");
      setUploadMessage("");
      setFileError(undefined);
    } catch (error) {
      console.error("Workshop registration failed:", error);
      setSubmitError("Connection error. Please check your internet and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };`);

fs.writeFileSync(path, data);
console.log("Done Workshop");