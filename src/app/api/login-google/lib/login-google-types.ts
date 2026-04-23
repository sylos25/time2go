export type GoogleTokenInfo = {
  aud?: string;
  email_verified?: boolean | string;
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
};

export type GoogleIdentity = {
  googleId: string;
  email: string;
  nombres: string;
  apellidos: string;
};

export type GoogleLoginUser = {
  id_usuario: string | number;
  id_publico?: string;
  id_rol: number;
  correo: string;
  nombres?: string | null;
  estado?: boolean;
};
