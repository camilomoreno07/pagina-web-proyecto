"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: number;
  onChange: (next: number) => void;
  min?: number;          // default 0
  max?: number;          // default Infinity
  step?: number;         // default 1
  suffix?: string;       // default "min"
  className?: string;    // estilos externos
  disabled?: boolean;
};

export default function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  suffix = "min",
  className = "",
  disabled = false,
}: Props) {
  // modo edición al hacer click en el valor
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // clamp util
  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  // botones
  const dec = () => !disabled && onChange(clamp(value - step));
  const inc = () => !disabled && onChange(clamp(value + step));

  // abrir edición al click en el centro
  const startEdit = () => {
    if (disabled) return;
    setDraft(String(value));
    setEditing(true);
  };

  // commit / cancel
  const commit = () => {
    const parsed = Number(draft.replace(",", "."));
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
    setEditing(false);
  };
  const cancel = () => {
    setEditing(false);
    setDraft(String(value));
  };

  // foco al entrar en edición
  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  // accesibilidad teclado cuando NO está en edición
  const onContainerKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (e.key === "ArrowLeft" || e.key === "-") { e.preventDefault(); dec(); }
    else if (e.key === "ArrowRight" || e.key === "+") { e.preventDefault(); inc(); }
    else if (e.key === "Enter") { e.preventDefault(); startEdit(); }
  };

  // validación visual de draft
  const isValidDraft = useMemo(() => {
    const n = Number(draft.replace(",", "."));
    return !Number.isNaN(n) && n >= min && n <= max;
  }, [draft, min, max]);

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      role="group"
      aria-label="Number stepper"
      onKeyDown={onContainerKeyDown}
    >
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Disminuir"
        className={`px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50`}
      >
        –
      </button>

      <div className="mx-3 min-w-[72px] text-center">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              else if (e.key === "Escape") cancel();
            }}
            inputMode="decimal"
            className={`w-24 text-center border-b outline-none ${
              isValidDraft ? "border-gray-400" : "border-red-500"
            }`}
          />
        ) : (
          <button
            type="button"
            onClick={startEdit}
            disabled={disabled}
            className="w-24 text-center text-gray-800"
            aria-label="Editar valor"
            title="Click para editar"
          >
            {value} {suffix}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Aumentar"
        className={`px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50`}
      >
        +
      </button>
    </div>
  );
}
