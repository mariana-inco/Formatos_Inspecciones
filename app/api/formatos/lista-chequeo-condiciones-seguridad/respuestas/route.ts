import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const respuestasDir = path.join(process.cwd(), "respuestas-json", "lista-chequeo-condiciones-seguridad");

const crearNombreArchivo = () => {
  const fecha = new Date().toISOString().replace(/[:.]/g, "-");
  return `respuesta-hse-f010-${fecha}.json`;
};

export async function GET() {
  try {
    await mkdir(respuestasDir, { recursive: true });
    const archivos = await readdir(respuestasDir);
    const registros = await Promise.all(
      archivos
        .filter((archivo) => archivo.endsWith(".json"))
        .map(async (fileName) => {
          const contenido = await readFile(path.join(respuestasDir, fileName), "utf8");
          return {
            fileName,
            ...JSON.parse(contenido),
          };
        })
    );

    registros.sort((a, b) => String(b.registro?.fechaRegistro || "").localeCompare(String(a.registro?.fechaRegistro || "")));

    return Response.json({
      ok: true,
      registros,
    });
  } catch (error) {
    console.error("Error consultando respuestas en JSON:", error);

    return Response.json(
      {
        ok: false,
        registros: [],
        message: "No se pudieron consultar las respuestas guardadas.",
      },
      { status: 500 }
    );
  }
}

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
