import RegistrationPortal from "../../components/registration/RegistrationPortal";

export const metadata = {
  title: "AI4IMPACT Registration",
  description: "Register for AI4IMPACT workshops and hackathon tracks.",
};

export default function RegisterPage() {
  return (
    <RegistrationPortal
      workshopQrSrc="/payment-qr/workshop-qr.png"
      hackathonQrSrc="/payment-qr/hackathon-qr.png"
      hackathonDuoQrSrc="/payment-qr/hackathon-duo-qr.png"
    />
  );
}
