import React from "react";

interface ContenedorProps {
  children: React.ReactNode;
  className?: string;
}

export function Contenedor(props: Readonly<ContenedorProps>) {
  return (
    <div
      className={`container p-8 mx-auto xl:px-0 ${
        props.className ? props.className : ""
      }`}>
      {props.children}
    </div>
  );
}

