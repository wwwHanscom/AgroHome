"use client";

import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavBarVariable } from "@/components/NavBarVariable";

type UserRole = "agricultora" | "comprador" | "inversionista";

type Profile = {
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  address: string;
};

const PHOTO_STORAGE_KEY = "agrohome-profile-photo";
const FORMSPREE_URL = "https://formspree.io/f/xyewbljg";

const posts = [
  {
    name: "Rosa Paredes",
    location: "Cayambe, Pichincha",
    time: "Hace 2 horas",
    image: "/img/Agricultora.png",
    imageAlt: "Cultivo de una agricultora",
    crop: "Hortalizas frescas",
    content:
      "Esta semana tenemos lechuga, acelga y espinaca cosechadas de nuestra huerta familiar. Cultivamos sin apuro y con mucho cuidado de la tierra.",
  },
  {
    name: "Carmen Toapanta",
    location: "Ambato, Tungurahua",
    time: "Hace 5 horas",
    image: "/img/benefit-one.png",
    imageAlt: "Productos de agricultura familiar",
    crop: "Mora y frutilla",
    content:
      "La cosecha de mora y frutilla ya está lista. Busco conectar con compradores que quieran fruta fresca de productoras locales.",
  },
  {
    name: "Lucía Guamangate",
    location: "Latacunga, Cotopaxi",
    time: "Ayer",
    image: "/img/benefit-two.png",
    imageAlt: "Productos cosechados en el campo",
    crop: "Papa y melloco",
    content:
      "Compartimos una parte de nuestra cosecha de papa y melloco. Cada temporada es fruto del trabajo de toda nuestra comunidad.",
  },
];

const recommendations = {
  buyers: [
    { name: "Mercado Tierra Viva", detail: "Compra hortalizas · Quito", tag: "Comprador" },
    { name: "Andes Orgánicos", detail: "Alimentos locales · Ibarra", tag: "Comprador" },
    { name: "Fundación Semilla", detail: "Impulsa emprendimientos rurales", tag: "Inversionista" },
  ],
  farmers: [
    { name: "Rosa Paredes", detail: "Hortalizas · Cayambe", tag: "Agricultora" },
    { name: "Carmen Toapanta", detail: "Mora y frutilla · Ambato", tag: "Agricultora" },
    { name: "Lucía Guamangate", detail: "Papa y melloco · Latacunga", tag: "Agricultora" },
  ],
};

export default function InicioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photo, setPhoto] = useState("/img/Agricultora.png");
  const [photoMessage, setPhotoMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const response = await fetch("/api/sesion");
        if (response.status === 401) {
          router.replace("/");
          return;
        }
        if (!response.ok) {
          throw new Error("No se pudo verificar la sesión.");
        }

        const result = (await response.json()) as { user: Profile };
        if (active) {
          setProfile(result.user);
          const savedPhoto = window.localStorage.getItem(PHOTO_STORAGE_KEY);
          if (savedPhoto) setPhoto(savedPhoto);
        }
      } catch (error) {
        console.error("No se pudo cargar la sesión.", error);
        if (active) {
          setSessionMessage("No se pudo cargar tu sesión. Inténtalo de nuevo.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadSession();
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    setSessionMessage("");
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) throw new Error("No se pudo cerrar la sesión.");
      window.localStorage.removeItem(PHOTO_STORAGE_KEY);
      router.replace("/");
    } catch (error) {
      console.error("No se pudo cerrar la sesión.", error);
      setSessionMessage("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setPhotoMessage("");
    if (!file) return;
    if (!profile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoMessage("Elige una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setPhotoMessage("La imagen debe pesar 1 MB o menos.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("_subject", `Foto de perfil: ${profile.name}`);

      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Formspree rechazó la foto (${response.status}).`);
      }

      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("No se pudo leer el archivo de imagen."));
        };
        reader.onerror = () => reject(new Error("No se pudo leer el archivo de imagen."));
        reader.readAsDataURL(file);
      });

      window.localStorage.setItem(PHOTO_STORAGE_KEY, imageData);
      setPhoto(imageData);
      setPhotoMessage("Foto enviada y guardada correctamente.");
    } catch (error) {
      console.error("No se pudo actualizar la foto de perfil.", error);
      setPhotoMessage(
        error instanceof Error
          ? `${error.message} Inténtalo de nuevo.`
          : "No se pudo actualizar la foto. Inténtalo de nuevo.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <NavBarVariable title="Inicio" />
        <main className="min-h-screen bg-gray-50 px-4 py-8 text-center text-gray-700 dark:bg-trueGray-900 dark:text-gray-200">
          Verificando sesión...
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <NavBarVariable title="Inicio" />
        <main className="min-h-screen bg-gray-50 px-4 py-8 text-center text-gray-700 dark:bg-trueGray-900 dark:text-gray-200">
          {sessionMessage || "Redirigiendo al inicio de sesión..."}
        </main>
      </>
    );
  }

  const suggestions =
    profile.role === "agricultora"
      ? recommendations.buyers
      : recommendations.farmers;
  const suggestionsTitle =
    profile.role === "agricultora"
      ? "Posibles compradores e inversionistas"
      : "Agricultoras para conectar";
  const roleLabel = {
    agricultora: "Agricultora",
    comprador: "Comprador",
    inversionista: "Inversionista",
  }[profile.role];

  return (
    <>
      <NavBarVariable
        title="Inicio"
        userName={profile.name}
        onLogout={handleLogout}
      />
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-trueGray-900 sm:px-6">
        {sessionMessage && (
          <p role="alert" className="mx-auto mb-4 max-w-7xl text-sm text-red-600">
            {sessionMessage}
          </p>
        )}
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)_290px]">
          <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-trueGray-800">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-green-100">
                <Image
                  src={photo}
                  alt={`Foto de perfil de ${profile.name}`}
                  fill
                  unoptimized={photo.startsWith("data:")}
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <label className="mt-3 cursor-pointer text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400">
                {isUploading ? "Subiendo foto..." : "Cambiar foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
              {photoMessage && (
                <p
                  role="status"
                  className="mt-2 text-xs text-gray-600 dark:text-gray-300"
                >
                  {photoMessage}
                </p>
              )}
              <h2 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h2>
              <span className="mt-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                {roleLabel}
              </span>
            </div>

            <div className="my-5 border-t border-gray-200 dark:border-gray-700" />
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Mis datos
            </h3>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Correo</dt>
                <dd className="break-words font-medium text-gray-800 dark:text-gray-100">
                  {profile.email}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Teléfono</dt>
                <dd className="font-medium text-gray-800 dark:text-gray-100">
                  {profile.phone}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Ubicación</dt>
                <dd className="font-medium text-gray-800 dark:text-gray-100">
                  {profile.address}
                </dd>
              </div>
            </dl>
          </aside>

          <section aria-labelledby="publicaciones-title" className="space-y-5">
            <div>
              <h2
                id="publicaciones-title"
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                Comunidad AgroHome
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Historias y cosechas de nuestras agricultoras.
              </p>
            </div>
            {posts.map((post) => (
              <article
                key={post.name}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-trueGray-800"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-green-100">
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                      {post.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {post.location} · {post.time}
                    </p>
                  </div>
                </div>
                <div className="relative h-52 w-full bg-green-50 sm:h-64">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">
                    {post.crop}
                  </p>
                  <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">
                    {post.content}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-trueGray-800">
            <h2 className="text-lg font-bold leading-snug text-gray-900 dark:text-white">
              {suggestionsTitle}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Perfiles que podrían interesarte.
            </p>
            <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
              {suggestions.map((suggestion) => (
                <li key={suggestion.name} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {suggestion.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {suggestion.detail}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {suggestion.tag}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}
