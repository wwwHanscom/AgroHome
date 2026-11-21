import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "../../public/img/benefit-one.png";
import benefitTwoImg from "../../public/img/benefit-two.png";

const benefitOne = {
  title: "Visualiza y equilibra las tareas del hogar",
  desc: "Registra las actividades diarias de cada integrante de la familia para identificar de inmediato quién asume mayor carga de trabajo y redistribuir responsabilidades con justicia.",
  image: benefitOneImg,
  bullets: [
    {
      title: "Detecta sobrecargas de tiempo",
      desc: "Identifica alertas visuales cuando una persona supera las horas recomendadas de trabajo doméstico y de cuidados.",
      icon: <FaceSmileIcon />,
    },
    {
      title: "Corresponsabilidad familiar",
      desc: "Asigna tareas claras entre pareja, hijos y familiares para fomentar el trabajo en equipo en casa y en la finca.",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Más tiempo para ti",
      desc: "Libera horas semanales para tu descanso, emprendimiento agrícola o participación comunitaria.",
      icon: <CursorArrowRaysIcon />,
    },
  ],
};

const benefitTwo = {
  title: "Simple, accesible y listo para usar sin internet",
  desc: "Sabemos que la conectividad en zonas rurales puede ser intermitente. Por eso AgroHome te permite armar tu plan en minutos y llevarlo al papel.",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Descarga en PDF imprimible",
      desc: "Exporta tu tablero semanal listo para pegar en la cocina o en un lugar visible del hogar.",
      icon: <DevicePhoneMobileIcon />,
    },
    {
      title: "Fácil de usar desde el celular",
      desc: "Interfaz clara, con íconos intuitivos y adaptable a cualquier teléfono móvil sin consumir muchos datos.",
      icon: <AdjustmentsHorizontalIcon />,
    },
    {
      title: "Modo Claro y Oscuro",
      desc: "Lectura cómoda tanto bajo la luz del día como en la noche.",
      icon: <SunIcon />,
    },
  ],
};


export {benefitOne, benefitTwo};
