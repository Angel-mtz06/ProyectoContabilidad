export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Crear cuenta
        </h1>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            className="w-full px-4 py-2 rounded border"
          />

          <input
            type="email"
            placeholder="Correo"
            className="w-full px-4 py-2 rounded border"
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full px-4 py-2 rounded border"
          />

          <button className="w-full bg-black text-white py-2 rounded">
            Registrarse
          </button>
        </form>
      </div>
    </main>
  );
}
