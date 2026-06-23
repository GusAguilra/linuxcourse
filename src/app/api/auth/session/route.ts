import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUsername, createSessionHeaders, clearSessionHeaders } from "@/lib/auth";

export async function GET() {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        progress: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Nombre de usuario requerido" },
        { status: 400 }
      );
    }

    const clean = username.trim().toLowerCase();
    if (clean.length < 2 || clean.length > 20) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 2 y 20 caracteres" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      return NextResponse.json(
        { error: "Solo letras, números y guión bajo" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { username: clean } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: clean,
          progress: {
            create: {
              completedModules: "[]",
              score: 0,
              streak: 0,
            },
          },
        },
      });
    }

    const [name, value] = createSessionHeaders(clean);
    return new NextResponse(
      JSON.stringify({
        user: {
          id: user.id,
          username: user.username,
          progress: await prisma.progress.findUnique({ where: { userId: user.id } }),
        },
      }),
      { headers: { [name]: value } }
    );
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const [name, value] = clearSessionHeaders();
  return new NextResponse(
    JSON.stringify({ message: "Sesión cerrada" }),
    { headers: { [name]: value } }
  );
}

export async function PATCH(req: Request) {
  try {
    const currentUsername = await getSessionUsername();
    if (!currentUsername) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { username } = await req.json();
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Nombre de usuario requerido" },
        { status: 400 }
      );
    }

    const clean = username.trim().toLowerCase();
    if (clean.length < 2 || clean.length > 20) {
      return NextResponse.json(
        { error: "El nombre debe tener entre 2 y 20 caracteres" },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(clean)) {
      return NextResponse.json(
        { error: "Solo letras, números y guión bajo" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username: clean } });
    if (existing) {
      return NextResponse.json(
        { error: "Ese nombre ya está en uso" },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({ where: { username: currentUsername } });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { username: currentUsername },
      data: { username: clean },
    });

    const [name, value] = createSessionHeaders(clean);
    return new NextResponse(
      JSON.stringify({
        user: {
          id: user.id,
          username: clean,
          progress: await prisma.progress.findUnique({ where: { userId: user.id } }),
        },
      }),
      { headers: { [name]: value } }
    );
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Error al cambiar el nombre" },
      { status: 500 }
    );
  }
}
