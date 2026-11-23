"use client";

import { FormEvent, useState } from "react";
import { NavBarVariable } from "@/components/NavBarVariable";
import { LoginDialog } from "@/components/LoginDialog";

export default function RegistroPage() {
  const [personType, setPersonType] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!email.includes("@")) {
      setFormError("Ingrese un correo electrónico válido que contenga @.");
      return;
    }

    if (!/^\d+$/.test(phone)) {
      setFormError("El número de teléfono solo puede contener dígitos.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personType,
          name,
          role,
          email,
          phone,
          address,
          password,
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormError(result.error ?? "No se pudo crear la cuenta.");
        return;
      }

      setLoginEmail(email);
      setPassword("");
      setConfirmPassword("");
      setShowSuccessDialog(true);
    } catch {
      setFormError("No se pudo conectar con el servidor. Inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <NavBarVariable title="Registro" />
      <main className="min-h-[calc(100vh-104px)] bg-gray-50 px-4 py-10 dark:bg-trueGray-900">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8 dark:border-gray-700 dark:bg-trueGray-800"
        >
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
            Crea tu cuenta
          </h2>

          <div className="space-y-6">
            <label className="block">
              <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                Usted es:
              </span>
              <select
                value={personType}
                onChange={(event) => {
                  setPersonType(event.target.value);
                  setName("");
                  setRole("");
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                required
              >
                <option value="">-- Seleccione --</option>
                <option value="usuario">Usuario</option>
                <option value="empresa">Empresa</option>
              </select>
            </label>

            {personType && (
              <label className="block">
                <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                  {personType === "empresa"
                    ? "Nombre de la empresa:"
                    : "Nombre:"}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setRole("");
                  }}
                  placeholder={
                    personType === "empresa"
                      ? "Ingrese el nombre de la empresa"
                      : "Ingrese su nombre"
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                  required
                />
              </label>
            )}

            {name && (
              <label className="block">
                <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                  Quiero registrarme como:
                </span>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                  required
                >
                  <option value="">-- Seleccione --</option>
                  <option value="agricultora">Agricultora</option>
                  <option value="comprador">Comprador</option>
                  <option value="inversionista">Inversionista</option>
                </select>
              </label>
            )}

            {role && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                    Correo electrónico
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                    title="Ingrese un correo electrónico válido"
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                    Número de teléfono
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    inputMode="numeric"
                    pattern="[0-9]+"
                    title="Solo se permiten números"
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\D/g, ""))
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                    Dirección
                  </span>
                  <input
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
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
                    minLength={8}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block font-medium text-gray-800 dark:text-gray-100">
                    Verificar contraseña
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 dark:border-gray-600 dark:bg-trueGray-900 dark:text-white"
                    required
                  />
                </label>
                {formError && (
                  <p
                    role="alert"
                    className="md:col-span-2 text-sm font-medium text-red-600"
                  >
                    {formError}
                  </p>
                )}
                <button
                  type="submit"
                  className="md:col-span-2 rounded-md bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  Registrarme
                </button>
              </div>
            )}
          </div>
        </form>
      </main>
      <LoginDialog
        open={showSuccessDialog}
        initialEmail={loginEmail}
        registrationSuccess
        onClose={() => setShowSuccessDialog(false)}
      />
    </>
  );
}
