import type { Metadata } from "next";
import { TableroFamiliar } from "@/components/TableroFamiliar";
import { TableroNavbar } from "@/components/TableroNavbar";

export const metadata: Metadata = {
  title: "Tablero Familiar | AgroHome",
  description: "Organiza las tareas y responsabilidades del hogar en un horario semanal.",
};

export default function TableroPage() {
  return (
    <>
      <TableroNavbar />
      <TableroFamiliar />
    </>
  );
}
