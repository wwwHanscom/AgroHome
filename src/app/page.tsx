import { Contenedor } from "@/components/Contenedor";
import Image from "next/image";
import { Hero } from "@/components/Hero";
import { SectionTitle } from "@/components/SectionTitle";
import { Beneficios } from "@/components/Beneficios";
import { Video } from "@/components/Video";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";

import { benefitOne, benefitTwo } from "@/components/data";
export default function Home() {
  return (
    <Contenedor>


      <div id="inicio" className="scroll-mt-24">
        <Hero />
      </div>

      <div className="mt-10 max-w-2xl mx-auto rounded-xl bg-white px-6 py-8 text-center text-gray-900 dark:bg-trueGray-800 dark:text-white">
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Contacto y Ayuda</h2>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                Si tienes problemas o necesitas ayuda con el registro, contáctanos:
              </p>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-8">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <Image
                    src="/img/brands/whatsapp.png"
                    width={32}
                    height={32}
                    alt="WhatsApp"
                    className="h-8 w-8 object-contain"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-lg font-bold">Whatsapp</span>
                    <span className="text-lg">0991507567</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <Image
                    src="/img/brands/llamada.png"
                    width={32}
                    height={32}
                    alt="Llamada telefónica"
                    className="h-8 w-8 object-contain"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-lg font-bold">Llamada telefónica</span>
                    <span className="text-lg">(02) 1234 123</span>
                  </div>
                </div>
              </div>
            </div>

      <div id="beneficios" className="scroll-mt-24">
        <SectionTitle
          preTitle="Beneficios"
          title="Estos son algunos de los beneficios del Tablero Familiar de AgroHome"
        >
          Diseñada junto a las realidades del campo ecuatoriano, nuestra plataforma convierte la planificación diaria del hogar en un acuerdo visible, equilibrado y práctico para toda la familia.
        </SectionTitle>
      </div>

      <Beneficios data={benefitOne} />
      <Beneficios imgPos="right" data={benefitTwo} />

      <div id="video-pitch" className="scroll-mt-24">
        <SectionTitle
          preTitle="Tutorial"
          title="Mira el tutorial aquí"
        >
          Conoce en menos de dos minutos cómo nace AgroHome, el problema de la doble jornada en las mujeres rurales y una demostración rápida de cómo funciona nuestro tablero familiar.
        </SectionTitle>
      </div>

      <Video videoId="fZ0D0cnR88E" />

      <div id="testimonios" className="scroll-mt-24">
        <SectionTitle
          preTitle="Testimonios"
          title="Lo que dicen las mujeres que ya lo usan"
        >
          Historias reales de agricultoras y jefas de hogar que transformaron la organización diaria de sus familias con AgroHome.
        </SectionTitle>
      </div>

      <Testimonials />

      <div id="preguntas-frecuentes" className="scroll-mt-24">
        <SectionTitle preTitle="Consultas" title="A continuación...">
          Resolvemos tus principales dudas sobre cómo funciona AgroHome y cómo empezar a usarlo con tu familia.
        </SectionTitle>
      </div>

      <Faq />
      <Cta />
    </Contenedor>
  );
}
