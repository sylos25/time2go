import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { tipDoc, document, firstName, lastName, pais, telefono, email, password, confirmPassword, acceptTerms } =
      body

    // Validation
    if (!tipDoc || !document || !firstName || !lastName || !pais || !telefono || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (!acceptTerms) {
      return NextResponse.json({ error: "Debes aceptar los términos y condiciones" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    // TODO: Hash password before storing
    // const hashedPassword = await bcrypt.hash(password, 10)

    // TODO: Store user in database
    // Example with your database:
    // const user = await db.insert({
    //   tipDoc,
    //   document,
    //   firstName,
    //   lastName,
    //   pais,
    //   telefono,
    //   email,
    //   password: hashedPassword,
    // })

    // For now, return success response
    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          email,
          firstName,
          lastName,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
