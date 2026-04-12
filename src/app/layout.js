import "./globals.css";

export const metadata = {
  title: "AI 4 Impact | CBIT",
  description: "Learn. Build. Impact.",
  icons: {
    icon: [
      { url: "/site-icon.svg", type: "image/svg+xml" },
      { url: "/site-icon.png", type: "image/png" },
    ],
    shortcut: [
      { url: "/site-icon.svg", type: "image/svg+xml" },
      { url: "/site-icon.png", type: "image/png" },
    ],
    apple: [{ url: "/site-icon.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
