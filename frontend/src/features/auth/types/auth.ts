export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id: number;
  plant_id: number | null;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};
