import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const respuestasDir = path.join(process.cwd(), "respuestas-json", "verificacion-alcohol-drogas");

const crearNombreArchivo = () => {
  const fecha = new Date().toISOString().replace(/[:.]/g, "-");
  return `respuesta-hse-f020-${fecha}.json`;
};

export async function POST(request: Request) {
  try {
    const respuesta = await request.json();
    const fileName = crearNombreArchivo();
    const filePath = path.join(respuestasDir, fileName);

    await mkdir(respuestasDir, { recursive: true });
    await writeFile(filePath, JSON.stringify(respuesta, null, 2), "utf8");

    console.log(`Respuesta guardada en JSON: ${filePath}`);

    return Response.json({
      ok: true,
      fileName,
      filePath,
    });
  } catch (error) {
    console.error("Error guardando la respuesta en JSON:", error);

    return Response.json(
      {
        ok: false,
        message: "No se pudo guardar la respuesta en JSON.",
      },
      { status: 500 }
    );
  }
}
