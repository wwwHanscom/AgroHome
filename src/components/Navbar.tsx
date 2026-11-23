"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeChanger from "./DarkSwitch";
import Image from "next/image"
import { Disclosure } from "@headlessui/react";

const navigation = [
  { label: "Inicio", href: "#inicio" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Tutorial", href: "#video-pitch" },
  { label: "Testimonios", href: "#testimonios" },
  { label: "Consultas", href: "#preguntas-frecuentes" },
];

export const Navbar = () => {
  const pathname = usePathname();
  if (pathname === "/tablero" || pathname === "/registro" || pathname === "/inicio") return null;

  return (
    <div className="sticky top-0 z-50 w-full border-b border-gray-200 bg-gray-100/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
      <nav className="container relative flex flex-wrap items-center justify-between px-8 py-5 mx-auto lg:justify-between xl:px-1">
        <Link href="/" aria-label="Ir a AgroHome">
          <span className="flex items-center">
            <Image
              src="/img/AgroHome.png"
              width="175"
              height="64"
              alt="AgroHome"
              className="w-[175px] h-[64px] object-contain"
            />
          </span>
        </Link>

        <div className="gap-3 nav__item mr-2 lg:flex ml-auto lg:ml-0 lg:order-2">
          <ThemeChanger />
          <div className="hidden mr-3 lg:flex lg:items-center nav__item">
            <a
              href="/TableroFamiliar.pdf"
              download="TableroFamiliar.pdf"
              className="px-6 py-2 text-white bg-gray-700/90 rounded-md md:ml-5">
              Descargar tablero
            </a>
            <Link
              href="/tablero"
              className="px-6 py-2 ml-3 text-white bg-green-600 rounded-md">
              Crear tablero
            </Link>
          </div>
        </div>

        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button
                aria-label="Abrir menú"
                className="px-2 py-1 text-gray-500 rounded-md lg:hidden hover:text-green-500 focus:text-green-500 focus:bg-green-100 focus:outline-none dark:text-gray-300 dark:focus:bg-trueGray-700">
                <svg
                  className="w-6 h-6 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24">
                  {open ? (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                    />
                  ) : (
                    <path
                      fillRule="evenodd"
                      d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                    />
                  )}
                </svg>
              </Disclosure.Button>

              <Disclosure.Panel className="flex flex-wrap w-full my-5 lg:hidden">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={`/${item.href}`}
                    className="w-full px-4 py-2 -ml-4 text-gray-500 rounded-md hover:text-green-600 hover:bg-green-50 focus:text-green-600 focus:bg-green-50 dark:text-gray-300 dark:hover:text-green-300 dark:hover:bg-green-900/40">
                    {item.label}
                  </Link>
                ))}
                <a
                  href="/TableroFamiliar.pdf"
                  download="TableroFamiliar.pdf"
                  className="w-full px-6 py-2 mt-3 text-center text-white bg-gray-700/90 rounded-md lg:ml-5">
                  Descargar tablero
                </a>
                <Link
                  href="/tablero"
                  className="w-full px-6 py-2 mt-3 text-center text-white bg-green-600 rounded-md lg:ml-5">
                  Crear tablero
                </Link>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex">
            {navigation.map((menu) => (
              <li className="mr-3 nav__item" key={menu.href}>
                <Link
                  href={`/${menu.href}`}
                  className="inline-block px-4 py-2 text-lg font-normal text-gray-800 no-underline rounded-md hover:text-green-600 hover:bg-green-50 focus:text-green-600 focus:bg-green-50 dark:text-gray-200 dark:hover:text-green-300 dark:hover:bg-green-900/40">
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}

