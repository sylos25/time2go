// Categoría de evento
    export type Categoria = {
        id: number;
        nombre: string;
    };
  
// Tipo de evento (relacionado con una categoría)
    export type TipoEvento = {
        id: number;
        nombre: string;
        categoria_id: number;
    };
  
// Eventos
    export type Evento = {
        id_evento: number;
        nombre_evento: string;
        numero_documento?: string;
        id_tipo_evento: number;
        id_municipio: number;
        id_sitio: number;
        descripcion: string;
        telefono: string;
        fecha_inicio: string;
        fecha_final: string;
        dias_semana: string;
        hora_inicio: string;
        hora_final: string;
        costo: number;
        cupo: number;
        estado: boolean;
        id_imagen: number;
    };