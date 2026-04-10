import "./globals.css";

export const metadata = {
  title: "AI 4 Impact | CBIT",
  description: "Learn. Build. Impact.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
