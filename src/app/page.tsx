import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="page-fade min-h-screen px-6 py-8 sm:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="rise-in flex items-center justify-between">
          <p className="rounded-full border border-[#c6bcae] bg-[#fff7ea] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#115e59]">
            DocuSense
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn-ghost px-4 py-2 text-sm font-semibold">
              Iniciar sesion
            </Link>
          </div>
        </header>

        <section className="panel rise-in grid overflow-hidden p-6 sm:grid-cols-2 sm:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <h1 className="max-w-md text-3xl font-extrabold leading-tight text-[var(--text-main)] sm:text-5xl">
                Conversa con tus PDFs sin perder contexto.
              </h1>
              <p className="max-w-md text-base leading-relaxed text-[var(--text-soft)] sm:text-lg">
                Sube documentos, organiza tu biblioteca y consulta respuestas en tiempo real basadas solo en el contenido cargado.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-5 py-3 text-sm sm:text-base">
                Crear cuenta gratis
              </Link>
              <Link href="/documents" className="btn-ghost px-5 py-3 text-sm font-semibold sm:text-base">
                Ver mis documentos
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center sm:mt-0">
            <div className="panel-muted w-full max-w-sm p-4">
              <div className="rounded-xl border border-[#c6bcae] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4f6572]">
                  Simulacion de chat
                </p>
                <div className="mt-3 space-y-3 text-sm">
                  <p className="rounded-xl bg-[#fff7ea] px-3 py-2 text-[var(--text-main)]">
                    Resume la metodologia del documento.
                  </p>
                  <p className="rounded-xl bg-[#daf1ec] px-3 py-2 text-[#123f3a]">
                    El documento describe 3 fases: recoleccion, validacion y sintesis.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-[var(--text-soft)]">
                <li>Streaming de respuestas</li>
                <li>Soporte para multiples documentos</li>
                <li>Autenticacion por token</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
