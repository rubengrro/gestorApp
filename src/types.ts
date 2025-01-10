export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  plant: string;
  password?: string; // Opcional
  image?: string; // Opcional
  createdAt?: Date; // Agregado
  updatedAt?: Date; // Agregado
}
