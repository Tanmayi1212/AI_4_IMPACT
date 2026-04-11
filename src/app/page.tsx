import RegistrationPortal from "../components/registration/RegistrationPortal";

export default function HomePage() {
  return (
    <RegistrationPortal
      workshopQrSrc="/payments/workshop-qr.png"
      hackathonQrSrc="/payments/hackathon-qr.png"
      hackathonDuoQrSrc="/payments/hackathon-duo-qr.png"
    />
  );
}
