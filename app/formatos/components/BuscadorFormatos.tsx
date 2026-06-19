"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type BuscadorFormatosProps = {
  valorInicial: string;
  totalResultados: number;
};

const RETARDO_BUSQUEDA_MS = 300;

export default function BuscadorFormatos({ valorInicial, totalResultados }: BuscadorFormatosProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(valorInicial);
  const ultimoValorEnviado = useRef(valorInicial);

  useEffect(() => {
    if (valorInicial !== ultimoValorEnviado.current) {
      ultimoValorEnviado.current = valorInicial;
      setValor(valorInicial);
    }
  }, [valorInicial]);

  useEffect(() => {
    const valorLimpio = valor.trim();

    if (valorLimpio === ultimoValorEnviado.current) return;

    const temporizador = window.setTimeout(() => {
      const parametros = new URLSearchParams(searchParams.toString());

      parametros.set("vista", "formatos");
      if (valorLimpio) {
        parametros.set("buscarFormato", valorLimpio);
      } else {
        parametros.delete("buscarFormato");
      }

      ultimoValorEnviado.current = valorLimpio;
      router.replace(`${pathname}?${parametros.toString()}`, { scroll: false });
    }, RETARDO_BUSQUEDA_MS);

    return () => window.clearTimeout(temporizador);
  }, [pathname, router, searchParams, valor]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Buscar formato</span>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={valor}
          onChange={(evento) => setValor(evento.target.value)}
          placeholder="Buscar por código, nombre o área..."
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition placeholder:font-medium placeholder:text-slate-400 focus:border-[#006948] focus:ring-2 focus:ring-emerald-100"
        />
      </label>
      <span
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600"
        aria-live="polite"
      >
        {totalResultados} {totalResultados === 1 ? "formato" : "formatos"}
      </span>
    </div>
  );
}
