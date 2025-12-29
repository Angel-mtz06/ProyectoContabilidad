import "./globals.css";
import Navbar from "./components/layout/Navbar";

export const metadata = {
  title: "IA Contable México",
  description: "Asistente contable y fiscal con IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen dark">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
