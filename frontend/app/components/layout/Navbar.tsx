import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">
        IA Contable 🇲🇽
      </h1>

      <div className="flex gap-4">
        <Link 
        href="/chat" 
        className="bg-black text-white px-4 py-2 rounded">
          Chat
        </Link>

        <Link 
          href="/login" 
          className="bg-black text-white px-4 py-2 rounded">
          Iniciar sesión
        </Link>

        <Link
          href="/register"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Registrarse
        </Link>
      </div>
    </nav>
  );
}
