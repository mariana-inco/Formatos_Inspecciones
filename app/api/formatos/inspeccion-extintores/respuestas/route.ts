import { guardarRespuestaJson, leerRespuestasJson, responderErrorConsulta, responderErrorGuardado } from "../../respuestasJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const config = { codigo: "HSE-F003", dir: "inspeccion-extintores" };

export async function GET() {
  try {
    return Response.json({
      ok: true,
      registros: await leerRespuestasJson(config),
    });
  } catch (error) {
    console.error("Error consultando respuestas en JSON:", error);
    return responderErrorConsulta();
  }
}

export async function POST(request: Request) {
  try {
    const respuesta = await request.json();
    return Response.json({
      ok: true,
      ...(await guardarRespuestaJson(config, respuesta)),
    });
  } catch (error) {
    console.error("Error guardando la respuesta en JSON:", error);
    return responderErrorGuardado();
  }
}
