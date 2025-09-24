-- CreateEnum
CREATE TYPE "public"."tip_doc" AS ENUM ('Tarjeta_de_Identidad', 'Cedula_de_Ciudadania', 'Cedula_de_Extranjeria', 'Pasaporte');

-- CreateEnum
CREATE TYPE "public"."tip_rol" AS ENUM ('Usuario', 'Promotor', 'Administrador', 'SuperAdministrador');

-- CreateEnum
CREATE TYPE "public"."estado_pago" AS ENUM ('Pendiente', 'Pagado', 'Fallido');

-- CreateTable
CREATE TABLE "public"."tabla_imagenes" (
    "id_imagen" SERIAL NOT NULL,
    "url_imagen" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_imagenes_pkey" PRIMARY KEY ("id_imagen")
);

-- CreateTable
CREATE TABLE "public"."tabla_paises" (
    "id_pais" INTEGER NOT NULL,
    "nombre_pais" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_paises_pkey" PRIMARY KEY ("id_pais")
);

-- CreateTable
CREATE TABLE "public"."tabla_departamentos" (
    "id_departamento" INTEGER NOT NULL,
    "nombre_departamento" TEXT NOT NULL,
    "id_pais" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_departamentos_pkey" PRIMARY KEY ("id_departamento")
);

-- CreateTable
CREATE TABLE "public"."tabla_municipios" (
    "id_municipio" INTEGER NOT NULL,
    "id_departamento" INTEGER NOT NULL,
    "nombre_municipio" TEXT NOT NULL,
    "distrito" BOOLEAN NOT NULL,
    "area_metropolitana" BOOLEAN NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_municipios_pkey" PRIMARY KEY ("id_municipio")
);

-- CreateTable
CREATE TABLE "public"."tabla_tipo_sitios" (
    "id_tipo_sitio" INTEGER NOT NULL,
    "nombre_tipo_sitio" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_tipo_sitios_pkey" PRIMARY KEY ("id_tipo_sitio")
);

-- CreateTable
CREATE TABLE "public"."tabla_sitios" (
    "id_sitio" INTEGER NOT NULL,
    "nombre_sitio" TEXT NOT NULL,
    "id_tipo_sitio" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "acceso_discapacidad" BOOLEAN NOT NULL,
    "id_municipio" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "telefono" BIGINT NOT NULL,
    "sitio_web" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_sitios_pkey" PRIMARY KEY ("id_sitio")
);

-- CreateTable
CREATE TABLE "public"."tabla_tipo_infraest_disc" (
    "id_infraest_disc" INTEGER NOT NULL,
    "nombre_infraest_disc" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_tipo_infraest_disc_pkey" PRIMARY KEY ("id_infraest_disc")
);

-- CreateTable
CREATE TABLE "public"."tabla_sitios_disc" (
    "id_sitio" INTEGER NOT NULL,
    "id_infraest_disc" INTEGER NOT NULL,
    "id_tipo_sitio" INTEGER NOT NULL,

    CONSTRAINT "tabla_sitios_disc_pkey" PRIMARY KEY ("id_sitio","id_infraest_disc","id_tipo_sitio")
);

-- CreateTable
CREATE TABLE "public"."tabla_menu" (
    "id_menu" INTEGER NOT NULL,
    "nombre_opcion" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_menu_pkey" PRIMARY KEY ("id_menu")
);

-- CreateTable
CREATE TABLE "public"."tabla_roles" (
    "id_rol" INTEGER NOT NULL,
    "nombre_rol" TEXT NOT NULL,

    CONSTRAINT "tabla_roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "public"."tabla_usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipo_documento" "public"."tip_doc" NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "id_pais" INTEGER NOT NULL,
    "telefono" BIGINT,
    "validacion_telefono" BOOLEAN NOT NULL DEFAULT false,
    "correo" TEXT NOT NULL,
    "validacion_correo" BOOLEAN NOT NULL DEFAULT false,
    "contrasena_hash" TEXT NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desactivacion" TIMESTAMP(3),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "id_rol" INTEGER NOT NULL DEFAULT 1,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."tabla_menu_usuarios" (
    "id_menu_usuario" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_menu" INTEGER NOT NULL,
    "permisos" BOOLEAN NOT NULL DEFAULT false,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_revocacion" TIMESTAMP(3),

    CONSTRAINT "tabla_menu_usuarios_pkey" PRIMARY KEY ("id_menu_usuario")
);

-- CreateTable
CREATE TABLE "public"."tabla_baneados" (
    "id_baneado" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "motivo_ban" TEXT NOT NULL,
    "incio_ban" TIMESTAMP(3) NOT NULL,
    "termina_ban" TIMESTAMP(3) NOT NULL,
    "responsable" INTEGER NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_baneados_pkey" PRIMARY KEY ("id_baneado")
);

-- CreateTable
CREATE TABLE "public"."tabla_categorias_eventos" (
    "id_categoria_evento" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_categorias_eventos_pkey" PRIMARY KEY ("id_categoria_evento")
);

-- CreateTable
CREATE TABLE "public"."tabla_tipos_eventos" (
    "id_tipo_evento" INTEGER NOT NULL,
    "id_categoria_evento" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_tipos_eventos_pkey" PRIMARY KEY ("id_tipo_evento")
);

-- CreateTable
CREATE TABLE "public"."tabla_eventos" (
    "id_evento" SERIAL NOT NULL,
    "nombre_evento" TEXT NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tipo_evento" INTEGER NOT NULL,
    "id_municipio" INTEGER NOT NULL,
    "id_sitio" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "telefono" BIGINT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "dias_semana" TEXT NOT NULL,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_final" TIMESTAMP(3) NOT NULL,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cupo" INTEGER NOT NULL DEFAULT 0,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "id_imagen" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_desactivacion" TIMESTAMP(3),

    CONSTRAINT "tabla_eventos_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "public"."tabla_valoraciones" (
    "id_valoracion" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "valoracion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_valoraciones_pkey" PRIMARY KEY ("id_valoracion")
);

-- CreateTable
CREATE TABLE "public"."tabla_reservas_eventos" (
    "id_reserva_evento" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "fecha_reserva" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_reservas_eventos_pkey" PRIMARY KEY ("id_reserva_evento")
);

-- CreateTable
CREATE TABLE "public"."tabla_pagos" (
    "id_pago" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "ip_transaccion" TEXT NOT NULL,
    "cant_entrada" INTEGER NOT NULL,
    "total_pagar" DOUBLE PRECISION NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "public"."estado_pago" NOT NULL DEFAULT 'Pendiente',
    "metodo_pago" TEXT NOT NULL,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tabla_pagos_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "tabla_imagenes_url_imagen_key" ON "public"."tabla_imagenes"("url_imagen");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_tipo_sitios_nombre_tipo_sitio_key" ON "public"."tabla_tipo_sitios"("nombre_tipo_sitio");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_sitios_direccion_key" ON "public"."tabla_sitios"("direccion");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_sitios_latitud_key" ON "public"."tabla_sitios"("latitud");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_sitios_longitud_key" ON "public"."tabla_sitios"("longitud");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_sitios_telefono_key" ON "public"."tabla_sitios"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_tipo_infraest_disc_nombre_infraest_disc_key" ON "public"."tabla_tipo_infraest_disc"("nombre_infraest_disc");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_menu_nombre_opcion_key" ON "public"."tabla_menu"("nombre_opcion");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_usuarios_numero_documento_key" ON "public"."tabla_usuarios"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_usuarios_telefono_key" ON "public"."tabla_usuarios"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_usuarios_correo_key" ON "public"."tabla_usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_categorias_eventos_nombre_key" ON "public"."tabla_categorias_eventos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_tipos_eventos_nombre_key" ON "public"."tabla_tipos_eventos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_eventos_telefono_key" ON "public"."tabla_eventos"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "tabla_pagos_ip_transaccion_key" ON "public"."tabla_pagos"("ip_transaccion");

-- AddForeignKey
ALTER TABLE "public"."tabla_departamentos" ADD CONSTRAINT "tabla_departamentos_id_pais_fkey" FOREIGN KEY ("id_pais") REFERENCES "public"."tabla_paises"("id_pais") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_municipios" ADD CONSTRAINT "tabla_municipios_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "public"."tabla_departamentos"("id_departamento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_sitios" ADD CONSTRAINT "tabla_sitios_id_municipio_fkey" FOREIGN KEY ("id_municipio") REFERENCES "public"."tabla_municipios"("id_municipio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_sitios" ADD CONSTRAINT "tabla_sitios_id_tipo_sitio_fkey" FOREIGN KEY ("id_tipo_sitio") REFERENCES "public"."tabla_tipo_sitios"("id_tipo_sitio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_sitios_disc" ADD CONSTRAINT "tabla_sitios_disc_id_sitio_fkey" FOREIGN KEY ("id_sitio") REFERENCES "public"."tabla_sitios"("id_sitio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_sitios_disc" ADD CONSTRAINT "tabla_sitios_disc_id_infraest_disc_fkey" FOREIGN KEY ("id_infraest_disc") REFERENCES "public"."tabla_tipo_infraest_disc"("id_infraest_disc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_sitios_disc" ADD CONSTRAINT "tabla_sitios_disc_id_tipo_sitio_fkey" FOREIGN KEY ("id_tipo_sitio") REFERENCES "public"."tabla_tipo_sitios"("id_tipo_sitio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_usuarios" ADD CONSTRAINT "tabla_usuarios_id_pais_fkey" FOREIGN KEY ("id_pais") REFERENCES "public"."tabla_paises"("id_pais") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_usuarios" ADD CONSTRAINT "tabla_usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."tabla_roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_menu_usuarios" ADD CONSTRAINT "tabla_menu_usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."tabla_roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_menu_usuarios" ADD CONSTRAINT "tabla_menu_usuarios_id_menu_fkey" FOREIGN KEY ("id_menu") REFERENCES "public"."tabla_menu"("id_menu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_baneados" ADD CONSTRAINT "tabla_baneados_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."tabla_usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_baneados" ADD CONSTRAINT "tabla_baneados_responsable_fkey" FOREIGN KEY ("responsable") REFERENCES "public"."tabla_usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_tipos_eventos" ADD CONSTRAINT "tabla_tipos_eventos_id_categoria_evento_fkey" FOREIGN KEY ("id_categoria_evento") REFERENCES "public"."tabla_categorias_eventos"("id_categoria_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_eventos" ADD CONSTRAINT "tabla_eventos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."tabla_usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_eventos" ADD CONSTRAINT "tabla_eventos_id_tipo_evento_fkey" FOREIGN KEY ("id_tipo_evento") REFERENCES "public"."tabla_tipos_eventos"("id_tipo_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_eventos" ADD CONSTRAINT "tabla_eventos_id_municipio_fkey" FOREIGN KEY ("id_municipio") REFERENCES "public"."tabla_municipios"("id_municipio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_eventos" ADD CONSTRAINT "tabla_eventos_id_sitio_fkey" FOREIGN KEY ("id_sitio") REFERENCES "public"."tabla_sitios"("id_sitio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_eventos" ADD CONSTRAINT "tabla_eventos_id_imagen_fkey" FOREIGN KEY ("id_imagen") REFERENCES "public"."tabla_imagenes"("id_imagen") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_valoraciones" ADD CONSTRAINT "tabla_valoraciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."tabla_usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_valoraciones" ADD CONSTRAINT "tabla_valoraciones_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "public"."tabla_eventos"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_reservas_eventos" ADD CONSTRAINT "tabla_reservas_eventos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."tabla_usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_reservas_eventos" ADD CONSTRAINT "tabla_reservas_eventos_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "public"."tabla_eventos"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_pagos" ADD CONSTRAINT "tabla_pagos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."tabla_usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_pagos" ADD CONSTRAINT "tabla_pagos_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "public"."tabla_eventos"("id_evento") ON DELETE RESTRICT ON UPDATE CASCADE;
