import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type RespuestaGuardada = Record<string, unknown> & {
  fileName: string;
  registro?: {
    fechaRegistro?: string;
  };
};

type ConfiguracionRespuestasJson = {
  codigo: string;
  dir: string;
};

const carpetaRespuestas = (dir: string) => path.join(process.cwd(), "respuestas-json", dir);

const crearNombreArchivo = (codigo: string) => {
  const fecha = new Date().toISOString().replace(/[:.]/g, "-");
  return `respuesta-${codigo.toLowerCase()}-${fecha}.json`;
};

export const leerRespuestasJson = async ({ dir }: ConfiguracionRespuestasJson) => {
  const respuestasDir = carpetaRespuestas(dir);
  await mkdir(respuestasDir, { recursive: true });

  const archivos = await readdir(respuestasDir);
  const registros = await Promise.all(
    archivos
      .filter((archivo) => archivo.endsWith(".json"))
      .map(async (fileName): Promise<RespuestaGuardada> => {
        const contenido = await readFile(path.join(respuestasDir, fileName), "utf8");
        return {
          fileName,
          ...(JSON.parse(contenido) as Record<string, unknown>),
        };
      })
  );

  return registros.sort((a, b) => String(b.registro?.fechaRegistro || "").localeCompare(String(a.registro?.fechaRegistro || "")));
};

export const guardarRespuestaJson = async ({ codigo, dir }: ConfiguracionRespuestasJson, respuesta: unknown) => {
  const respuestasDir = carpetaRespuestas(dir);
  const fileName = crearNombreArchivo(codigo);
  const filePath = path.join(respuestasDir, fileName);

  await mkdir(respuestasDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(respuesta, null, 2), "utf8");

  if (process.env.NODE_ENV !== "production") {
    console.info(`Respuesta ${codigo} guardada en JSON: ${filePath}`);
  }

  return { fileName, filePath };
};

export const responderErrorConsulta = () =>
  Response.json(
    {
      ok: false,
      registros: [],
      message: "No se pudieron consultar las respuestas guardadas.",
    },
    { status: 500 }
  );

export const responderErrorGuardado = () =>
  Response.json(
    {
      ok: false,
      message: "No se pudo guardar la respuesta en JSON.",
    },
    { status: 500 }
  );
