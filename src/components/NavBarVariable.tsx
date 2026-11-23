"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeChanger from "./DarkSwitch";
import { LoginDialog } from "./LoginDialog";

type NavBarVariableProps = {
  title: string;
  userName?: string;
  onLogout?: () => void;
};

export function NavBarVariable({
  title,
  userName,
  onLogout,
}: NavBarVariableProps) {
  const pathname = usePathname();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-gray-100/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
        <nav className="container relative flex h-[104px] items-center justify-between px-4 mx-auto max-sm:h-[128px] max-sm:flex-wrap max-sm:content-center max-sm:gap-y-2 sm:px-8 xl:px-1">
          <Link href="/" aria-label="Ir a AgroHome" className="shrink-0">
            <Image
              src="/img/AgroHome.png"
              width="175"
              height="64"
              alt="AgroHome"
              className="h-[64px] w-[175px] object-contain max-sm:h-[48px] max-sm:w-[130px]"
            />
          </Link>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-center text-lg font-bold text-gray-900 max-sm:static max-sm:order-3 max-sm:w-full max-sm:translate-x-0 sm:text-2xl dark:text-white">
            {title}
          </h1>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeChanger />
            {userName && onLogout ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700 sm:px-5"
                >
                  Cerrar Sesión
                </button>
                <span className="max-w-32 truncate text-sm font-semibold text-gray-800 dark:text-gray-100 sm:max-w-none">
                  {userName}
                </span>
              </div>
            ) : (
              <>
                {pathname !== "/registro" && (
                  <Link
                    href="/registro"
                    className="rounded-md bg-gray-600 px-6 py-2 text-sm font-medium text-white hover:bg-gray-700 sm:px-5"
                  >
                    Registrarse
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsLoginDialogOpen(true)}
                  className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 sm:px-5"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      <LoginDialog
        open={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
      />
    </>
  );
}
