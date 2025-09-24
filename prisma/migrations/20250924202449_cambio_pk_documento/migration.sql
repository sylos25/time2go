/*
  Warnings:

  - You are about to drop the column `id_usuario` on the `tabla_baneados` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `tabla_eventos` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `tabla_pagos` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `tabla_reservas_eventos` table. All the data in the column will be lost.
  - The primary key for the `tabla_usuarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_usuario` on the `tabla_usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `id_usuario` on the `tabla_valoraciones` table. All the data in the column will be lost.
  - Added the required column `numero_documento` to the `tabla_baneados` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_documento` to the `tabla_eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_documento` to the `tabla_pagos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_documento` to the `tabla_reservas_eventos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_documento` to the `tabla_valoraciones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."tabla_baneados" DROP CONSTRAINT "tabla_baneados_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."tabla_baneados" DROP CONSTRAINT "tabla_baneados_responsable_fkey";

-- DropForeignKey
ALTER TABLE "public"."tabla_eventos" DROP CONSTRAINT "tabla_eventos_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."tabla_pagos" DROP CONSTRAINT "tabla_pagos_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."tabla_reservas_eventos" DROP CONSTRAINT "tabla_reservas_eventos_id_usuario_fkey";

-- DropForeignKey
ALTER TABLE "public"."tabla_valoraciones" DROP CONSTRAINT "tabla_valoraciones_id_usuario_fkey";

-- DropIndex
DROP INDEX "public"."tabla_usuarios_numero_documento_key";

-- AlterTable
ALTER TABLE "public"."tabla_baneados" DROP COLUMN "id_usuario",
ADD COLUMN     "numero_documento" TEXT NOT NULL,
ALTER COLUMN "responsable" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."tabla_eventos" DROP COLUMN "id_usuario",
ADD COLUMN     "numero_documento" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."tabla_pagos" DROP COLUMN "id_usuario",
ADD COLUMN     "numero_documento" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."tabla_reservas_eventos" DROP COLUMN "id_usuario",
ADD COLUMN     "numero_documento" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."tabla_usuarios" DROP CONSTRAINT "tabla_usuarios_pkey",
DROP COLUMN "id_usuario",
ADD CONSTRAINT "tabla_usuarios_pkey" PRIMARY KEY ("numero_documento");

-- AlterTable
ALTER TABLE "public"."tabla_valoraciones" DROP COLUMN "id_usuario",
ADD COLUMN     "numero_documento" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."tabla_baneados" ADD CONSTRAINT "tabla_baneados_numero_documento_fkey" FOREIGN KEY ("numero_documento") REFERENCES "public"."tabla_usuarios"("numero_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_baneados" ADD CONSTRAINT "tabla_baneados_responsable_fkey" FOREIGN KEY ("responsable") REFERENCES "public"."tabla_usuarios"("numero_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_eventos" ADD CONSTRAINT "tabla_eventos_numero_documento_fkey" FOREIGN KEY ("numero_documento") REFERENCES "public"."tabla_usuarios"("numero_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_valoraciones" ADD CONSTRAINT "tabla_valoraciones_numero_documento_fkey" FOREIGN KEY ("numero_documento") REFERENCES "public"."tabla_usuarios"("numero_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_reservas_eventos" ADD CONSTRAINT "tabla_reservas_eventos_numero_documento_fkey" FOREIGN KEY ("numero_documento") REFERENCES "public"."tabla_usuarios"("numero_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tabla_pagos" ADD CONSTRAINT "tabla_pagos_numero_documento_fkey" FOREIGN KEY ("numero_documento") REFERENCES "public"."tabla_usuarios"("numero_documento") ON DELETE RESTRICT ON UPDATE CASCADE;
