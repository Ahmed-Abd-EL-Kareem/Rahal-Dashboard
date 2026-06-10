export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  provider?: 'local' | 'google';
  subscription?: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  data: { user: User };
}
