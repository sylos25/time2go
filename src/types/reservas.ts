export type Nullable<T> = T | null;

export type ReservaAsistente = Readonly<{
  id_reserva_asistente: Nullable<number>;
  nombre_asistente: Nullable<string>;
  tipo_documento: Nullable<string>;
  numero_documento: Nullable<string>;
  nombres: Nullable<string>;
  apellidos: Nullable<string>;
  telefono: Nullable<string>;
  correo: Nullable<string>;
}>;

export type ReservaDetalle = Readonly<{
  id_reserva_evento: Nullable<number>;
  /** Para enlaces (p. ej. PDF /eventos/{slug}). */
  id_evento: Nullable<number>;
  id_publico_evento: Nullable<string>;
  nombre_evento: Nullable<string>;
  url_imagen_evento: Nullable<string>;
  categoria_nombre: Nullable<string>;
  tipo_nombre: Nullable<string>;
  pulep_evento: Nullable<string>;
  nombre_sitio: Nullable<string>;
  sitio_direccion: Nullable<string>;
  nombre_municipio: Nullable<string>;
  cupo: Nullable<number>;
  responsable_evento: Nullable<string>;
  creador_nombres: Nullable<string>;
  creador_apellidos: Nullable<string>;
  telefono_1: Nullable<string>;
  telefono_2: Nullable<string>;
  gratis_pago: Nullable<boolean>;
  cuantos_asistiran: Nullable<number>;
  fecha_inicio: Nullable<string>;
  fecha_fin: Nullable<string>;
  hora_inicio: Nullable<string>;
  hora_final: Nullable<string>;
  tipo_documento: Nullable<string>;
  numero_documento: Nullable<string>;
  nombres: Nullable<string>;
  apellidos: Nullable<string>;
  telefono_titular: Nullable<string>;
  correo_titular: Nullable<string>;
  quienes_asistiran: Nullable<string>;
  asistentes: ReservaAsistente[];
}>;

export type ReservaDetalleApiOk = Readonly<{
  ok: true;
  reserva: ReservaDetalle;
}>;

export type ReservaDetalleApiError = Readonly<{
  ok: false;
  message: string;
}>;

export type ReservaDetalleApiResponse = ReservaDetalleApiOk | ReservaDetalleApiError;

export type ReservaListadoItem = Readonly<{
  id_reserva_evento: Nullable<number>;
  id_usuario: Nullable<number>;
  id_evento: Nullable<number>;
  tipo_documento: Nullable<string>;
  numero_documento: Nullable<string>;
  cuantos_asistiran: Nullable<number>;
  quienes_asistiran: Nullable<string>;
  fecha_reserva: Nullable<string>;
  estado: Nullable<boolean>;
  nombre_evento: Nullable<string>;
  fecha_inicio: Nullable<string>;
  fecha_fin: Nullable<string>;
  hora_inicio: Nullable<string>;
  hora_final: Nullable<string>;
  gratis_pago: Nullable<boolean>;
  id_publico_evento: Nullable<string>;
  nombre_sitio: Nullable<string>;
  sitio_direccion: Nullable<string>;
  nombre_municipio: Nullable<string>;
  url_imagen_evento: Nullable<string>;
  nombres: Nullable<string>;
  apellidos: Nullable<string>;
  correo: Nullable<string>;
}>;

export type ReservaListadoApiOk = Readonly<{
  ok: true;
  reservas: ReservaListadoItem[];
}>;

export type ReservaListadoApiError = Readonly<{
  ok: false;
  message: string;
}>;

export type ReservaListadoApiResponse = ReservaListadoApiOk | ReservaListadoApiError;
