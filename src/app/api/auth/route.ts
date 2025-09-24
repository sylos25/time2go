import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password, nombres, apellidos, tipo_documento, numero_documento, id_pais, id_rol } = await req.json();

  try {
    const user = await prisma.tabla_usuarios.create({
      data: { 
        correo:             email,
        contrasena_hash:    password,
        nombres:            nombres,
        apellidos:          apellidos,
        tipo_documento:     tipo_documento,
        numero_documento:   numero_documento,
        id_pais:            id_pais,
        id_rol:             id_rol, 
        },
    });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error al crear usuario' }), { status: 500 });
  }
}