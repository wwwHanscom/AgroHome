"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LoginDialogProps = {
  open: boolean;
  initialEmail?: string;
  registrationSuccess?: boolean;
  onClose: () => void;
};

export function LoginDialog({
  open,
  initialEmail = "",
  registrationSuccess = false,
  onClose,
}: LoginDialogProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(initialEmail);
    setPassword("");
    setNotice("");
  }, [initialEmail, open]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setNotice(result.error ?? "No se pudo iniciar la sesión.");
        return;
      }

      router.replace("/inicio");
      router.refresh();
    } catch {
      setNotice("No se pudo conectar con el servidor. Inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-8"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-trueGray-800"
      >
        {registrationSuccess && (
          <>
            <h2 className="mb-2 text-xl font-bold text-green-700 dark:text-green-400">
              ¡Cuenta creada correctamente!
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-200">
              Tu cuenta quedó registrada. Completa el formulario para iniciar sesión.
            </p>
          </>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2
            id="login-dialog-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Iniciar sesión
          </h2>
          <label className="block">
            <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
              Correo electrónico
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
              Contraseña
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
              required
            />
          </label>
          {notice && (
            <p role="status" className="text-sm text-amber-700">
              {notice}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-trueGray-700"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
