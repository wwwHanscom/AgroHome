import Image from "next/image";
import React from "react";
import { Contenedor } from "@/components/Contenedor";

import userOneImg from "../../public/img/user1.jpg";
import userTwoImg from "../../public/img/user2.jpg";
import userThreeImg from "../../public/img/user3.jpg";

export const Testimonials = () => {
  return (
    <Contenedor>
      <div className="grid gap-10 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-2 xl:col-auto">
          <div className="flex flex-col justify-between w-full h-full bg-gray-100 px-14 rounded-2xl py-14 dark:bg-trueGray-800">
            <p className="text-2xl leading-normal ">
              &quot;Antes sentía que el día no me alcanzaba entre la cosecha, la cocina y los niños. Al pegar el tablero en la pared, mi esposo y mis hijos vieron todo lo que hacía y empezamos a repartirnos mejor.&quot;
            </p>

            <Avatar
              image={userOneImg}
              name="María Elena Zambrano"
              title="Agricultora y madre de familia · Santa Lucía, Guayas"
            />
          </div>
        </div>
        <div className="">
          <div className="flex flex-col justify-between w-full h-full bg-gray-100 px-14 rounded-2xl py-14 dark:bg-trueGray-800">
            <p className="text-2xl leading-normal ">
              &quot;Lo que más me gusta es poder descargar la hoja e imprimirla. No necesito tener megas todos los días para que toda la casa sepa qué le toca hacer cada semana.&quot;
            </p>

            <Avatar
              image={userTwoImg}
              name="Rosa Angélica Vera"
              title="Productora de cacao y líder comunitaria"
            />
          </div>
        </div>
        <div className="">
          <div className="flex flex-col justify-between w-full h-full bg-gray-100 px-14 rounded-2xl py-14 dark:bg-trueGray-800">
            <p className="text-2xl leading-normal ">
              &quot;Ahora tengo dos tardes libres a la semana para dedicarme a mi huerto y a las reuniones de mi asociación. El tablero nos ayudó a conversar sin discutir.&quot;
            </p>

            <Avatar
              image={userThreeImg}
              name="Carmen Lucía Mendoza"
              title="Emprendedora rural y agricultora"
            />
          </div>
        </div>
      </div>
    </Contenedor>
  );
};

interface AvatarProps {
  image: any;
  name: string;
  title: string;
}

function Avatar(props: Readonly<AvatarProps>) {
  return (
    <div className="flex items-center mt-8 space-x-3">
      <div className="flex-shrink-0 overflow-hidden rounded-full w-14 h-14">
        <Image
          src={props.image}
          width="40"
          height="40"
          alt="Avatar"
          placeholder="blur"
        />
      </div>
      <div>
        <div className="text-lg font-medium">{props.name}</div>
        <div className="text-gray-600 dark:text-gray-400">{props.title}</div>
      </div>
    </div>
  );
}

function Mark(props: { readonly children: React.ReactNode }) {
  return (
    <>
      {" "}
      <mark className="text-green-800 bg-green-100 rounded-md ring-green-100 ring-4 dark:ring-green-900 dark:bg-green-900 dark:text-green-200">
        {props.children}
      </mark>{" "}
    </>
  );
}
