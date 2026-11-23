import path from "node:path";

export type UserRecord = {
  personType: "usuario" | "empresa";
  name: string;
  role: "agricultora" | "comprador" | "inversionista";
  email: string;
  phone: string;
  address: string;
  passwordHash: string;
  createdAt: string;
};

export const usersFile = path.join(process.cwd(), ".data", "users.json");
