import { Contenedor } from "@/components/Contenedor";
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
      <div id="beneficios" className="scroll-mt-24">
        <SectionTitle
          preTitle="Beneficios"
          title="Estos son algunos de los beneficios del Tablero Familiar de AgroHome"
        >
          Un tablero familiar es un espacio visual donde los integrantes de un hogar organizan, comparten y consultan de forma transparente las actividades, responsabilidades y acuerdos del día a día.
          Diseñada junto a las realidades del campo ecuatoriano, nuestra plataforma convierte la planificación diaria del hogar en un acuerdo visible, equilibrado y práctico para toda la familia.
        </SectionTitle>
      </div>

      <Beneficios data={benefitOne} />
      <Beneficios imgPos="right" data={benefitTwo} />

      <div id="video-pitch" className="scroll-mt-24">
        <SectionTitle
          preTitle="Video Pitch"
          title="Mira nuestro video pitch aquí"
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
        <SectionTitle preTitle="Preguntas frecuentes" title="A continuación...">
          Resolvemos tus principales dudas sobre cómo funciona AgroHome y cómo empezar a usarlo con tu familia.
        </SectionTitle>
      </div>

      <Faq />
      <Cta />
    </Contenedor>
  );
}
