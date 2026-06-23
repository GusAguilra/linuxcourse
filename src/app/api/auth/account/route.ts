import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUsername, clearSessionHeaders } from "@/lib/auth";

export async function DELETE() {
  try {
    const username = await getSessionUsername();
    if (!username) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await prisma.achievement.deleteMany({ where: { userId: user.id } });
    await prisma.progress.delete({ where: { userId: user.id } });
    await prisma.user.delete({ where: { username } });

    const [name, value] = clearSessionHeaders();
    return new NextResponse(
      JSON.stringify({ message: "Cuenta eliminada" }),
      { headers: { [name]: value } }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar la cuenta" },
      { status: 500 }
    );
  }
}
