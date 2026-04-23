export type ResetPasswordTokenRow = {
  id_token_recuperacion: number;
  id_usuario: number;
  estado: "Pendiente" | "Caducado" | "Validado";
  fecha_expiracion: string;
};

export type ResetPasswordUserRow = {
  id_usuario: string | number;
  correo: string;
};

export type PasswordResetConfirmInput = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};
