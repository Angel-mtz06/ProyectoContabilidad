export type UserRole = "USER" | "ACCOUNTANT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
