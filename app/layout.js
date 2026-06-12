import "./globals.css";

export const metadata = {
  title: "Simple To-Do List",
  description: "A small Next.js to-do list for VM, container, and PostgreSQL deployment testing."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
