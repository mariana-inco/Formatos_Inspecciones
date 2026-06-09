"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BorradorGuardado<T> = {
  guardadoEn: string;
  datos: T;
};

type ProteccionDatosFormularioProps<T> = {
  storageKey: string;
  datos: T;
  datosIniciales: T;
  onRestaurar: (datos: T) => void;
  onDescartar: () => void;
};

const textoFecha = (fecha: string) =>
  new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(fecha));

export default function ProteccionDatosFormulario<T>({
  storageKey,
  datos,
  datosIniciales,
  onRestaurar,
  onDescartar,
}: ProteccionDatosFormularioProps<T>) {
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState(false);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [fechaBorrador, setFechaBorrador] = useState("");
  const [hrefPendiente, setHrefPendiente] = useState<string | null>(null);
  const borradorPendiente = useRef<BorradorGuardado<T> | null>(null);

  const datosSerializados = useMemo(() => JSON.stringify(datos), [datos]);
  const datosInicialesSerializados = useMemo(() => JSON.stringify(datosIniciales), [datosIniciales]);
  const tieneCambios = datosSerializados !== datosInicialesSerializados;

  const guardarBorrador = () => {
    const borrador: BorradorGuardado<T> = {
      guardadoEn: new Date().toISOString(),
      datos,
    };
    localStorage.setItem(storageKey, JSON.stringify(borrador));
    setFechaBorrador(borrador.guardadoEn);
    setMensaje("Borrador guardado correctamente. Puedes continuar este registro más tarde.");
  };

  const cerrarMensajeLuego = () => {
    window.setTimeout(() => setMensaje(""), 4000);
  };

  const navegarPendiente = () => {
    if (hrefPendiente) {
      window.location.assign(hrefPendiente);
      return;
    }
    setModalSalidaAbierto(false);
  };

  useEffect(() => {
    const borradorRaw = localStorage.getItem(storageKey);
    if (!borradorRaw) return;

    try {
      const borrador = JSON.parse(borradorRaw) as BorradorGuardado<T>;
      borradorPendiente.current = borrador;
      setFechaBorrador(borrador.guardadoEn);
      setModalRestaurarAbierto(true);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    const manejarCierre = (event: BeforeUnloadEvent) => {
      if (!tieneCambios) return;
      guardarBorrador();
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", manejarCierre);
    return () => window.removeEventListener("beforeunload", manejarCierre);
  }, [datosSerializados, tieneCambios]);

  useEffect(() => {
    const manejarClick = (event: MouseEvent) => {
      if (!tieneCambios) return;
      const enlace = (event.target as HTMLElement | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!enlace || enlace.target === "_blank" || enlace.hasAttribute("download")) return;

      const url = new URL(enlace.href, window.location.href);
      if (url.href === window.location.href || url.hash && url.pathname === window.location.pathname) return;

      event.preventDefault();
      setHrefPendiente(url.href);
      setConfirmarDescarte(false);
      setModalSalidaAbierto(true);
    };

    document.addEventListener("click", manejarClick, true);
    return () => document.removeEventListener("click", manejarClick, true);
  }, [tieneCambios]);

  const restaurarBorrador = () => {
    if (!borradorPendiente.current) return;
    onRestaurar(borradorPendiente.current.datos);
    setModalRestaurarAbierto(false);
    setMensaje("Borrador restaurado. Puedes continuar desde donde lo dejaste.");
    cerrarMensajeLuego();
  };

  const descartarBorradorGuardado = () => {
    localStorage.removeItem(storageKey);
    borradorPendiente.current = null;
    setModalRestaurarAbierto(false);
    setFechaBorrador("");
    setMensaje("El borrador guardado fue descartado.");
    cerrarMensajeLuego();
  };

  const continuarDiligenciando = () => {
    setHrefPendiente(null);
    setConfirmarDescarte(false);
    setModalSalidaAbierto(false);
    setMensaje("Continúa diligenciando. Tus datos siguen intactos.");
    cerrarMensajeLuego();
  };

  const guardarYSalir = () => {
    guardarBorrador();
    navegarPendiente();
  };

  const descartarRegistro = () => {
    const destino = hrefPendiente;
    onDescartar();
    localStorage.removeItem(storageKey);
    setHrefPendiente(null);
    setFechaBorrador("");
    setConfirmarDescarte(false);
    setModalSalidaAbierto(false);
    setMensaje("El registro fue descartado. Los datos ingresados fueron eliminados.");
    cerrarMensajeLuego();
    if (destino) window.location.assign(destino);
  };

  return (
    <>
      {fechaBorrador ? (
        <div className="fixed bottom-4 left-4 z-40 max-w-sm rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 shadow-lg">
          Borrador guardado: {textoFecha(fechaBorrador)}
        </div>
      ) : null}

      {mensaje ? (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg">
          {mensaje}
        </div>
      ) : null}

      {modalRestaurarAbierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Borrador encontrado</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Tienes información sin guardar.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Encontramos un avance guardado de este formato. Puedes restaurarlo para continuar o descartarlo si ya no lo necesitas.
            </p>
            {fechaBorrador ? <p className="mt-3 text-xs font-semibold text-slate-500">Último guardado: {textoFecha(fechaBorrador)}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={descartarBorradorGuardado} className="rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50">
                Descartar borrador
              </button>
              <button type="button" onClick={restaurarBorrador} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                Restaurar borrador
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modalSalidaAbierto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            {!confirmarDescarte ? (
              <>
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">Salida del formato</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Tienes información sin guardar.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Si sales ahora, puedes conservar este registro como borrador. No borraremos tus datos sin tu confirmación.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={continuarDiligenciando} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                    Continuar diligenciando
                  </button>
                  <button type="button" onClick={guardarYSalir} className="rounded-full border border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">
                    Guardar como borrador
                  </button>
                  <button type="button" onClick={guardarYSalir} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    Salir y conservar
                  </button>
                  <button type="button" onClick={() => setConfirmarDescarte(true)} className="rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50">
                    Descartar registro
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-bold uppercase tracking-wide text-red-700">Acción de riesgo</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Confirmar descarte del registro</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Esta acción eliminará los datos ingresados en este registro. Para borrar el registro, confirma tu decisión.
                </p>
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setConfirmarDescarte(false)} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                    Cancelar y conservar datos
                  </button>
                  <button type="button" onClick={descartarRegistro} className="rounded-full border border-red-300 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100">
                    Sí, descartar registro
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
