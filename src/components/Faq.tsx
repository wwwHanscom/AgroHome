"use client";
import React from "react";
import { Container } from "@/components/Container";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

export const Faq = () => {
  return (
    <Container className="!p-0">
      <div className="w-full max-w-2xl p-2 mx-auto rounded-2xl">
        {faqdata.map((item, index) => (
          <div key={item.question} className="mb-5">
            <Disclosure>
              {({ open }) => (
                <>
                  <DisclosureButton className="flex items-center justify-between w-full px-4 py-4 text-lg text-left text-gray-800 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-green-100 focus-visible:ring-opacity-75 dark:bg-trueGray-800 dark:text-gray-200">
                    <span>{item.question}</span>
                    <ChevronUpIcon
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5 text-green-500`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="px-4 pt-4 pb-2 text-gray-500 dark:text-gray-300">
                    {item.answer}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          </div>
        ))}
      </div>
    </Container>
  );
}

const faqdata = [
  {
    question: "¿AgroHome es completamente gratuito?",
    answer: "Sí, AgroHome es una herramienta gratuita creada para apoyar a las mujeres rurales y sus familias en la gestión equitativa del hogar y los cuidados.",
  },
  {
    question: "¿Necesito internet todos los días para usarlo?",
    answer: "No. Solo necesitas conexión unos minutos para armar o actualizar tu horario semanal; luego puedes descargar el tablero en formato PDF e imprimirlo para usarlo sin conexión.",
  },
  {
    question: "¿Puedo personalizar las tareas según las actividades de mi finca y hogar?",
    answer: "Sí, puedes agregar tareas del hogar (cocina, limpieza, cuidado de niños o adultos mayores) y labores agrícolas o comunitarias adaptadas a la rutina de cada integrante.",
  },
  {
    question: "¿Cómo funciona la alerta de sobrecarga de trabajo?",
    answer: "El sistema suma las horas asignadas a cada miembro de la familia y te avisa visualmente si una persona está asumiendo una carga desproporcionada, sugiriendo reasignar tareas.",
  },
];
