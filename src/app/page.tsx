import { cookies } from "next/headers";
import HomeClient from "@/components/HomeClient";
import { login } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/session";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const store = await cookies();
  const isAuthed = store.get(SESSION_COOKIE)?.value === SESSION_VALUE;

  if (!isAuthed) {
    const { error } = await searchParams;
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-sm p-8">
          <h1 className="text-lg font-bold text-zinc-900 mb-1">ABAS-3</h1>
          <p className="text-sm text-zinc-500 mb-6">Contenido con fines académicos sin comercialización</p>

          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoFocus
                required
                className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm bg-white text-zinc-900"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">Contraseña incorrecta. Intenta de nuevo.</p>
            )}

            <button
              type="submit"
              className="w-full bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium py-2 rounded-md"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <HomeClient />;
}
