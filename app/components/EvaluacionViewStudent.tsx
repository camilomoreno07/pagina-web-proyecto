import React, { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";

type QuestionType = "OPEN" | "MC3" | "MC5";

interface EvalItem {
  id?: string;
  type?: QuestionType;
  questionType?: QuestionType;
  question: string;
  correctAnswer?: string;        // single-correct
  correctAnswers?: string[];     // opcional: varias correctas
  time: number;                  // minutos
  options?: string[] | null;     // puede venir null
}

interface Props { evaluations?: EvalItem[]; }

const norm = (s?: string) =>
  (s ?? "").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const deriveType = (q: EvalItem): QuestionType => {
  const t = (q.type || q.questionType) as QuestionType | undefined;
  if (t) return t;
  const opts = Array.isArray(q.options) ? q.options.filter(o => (o ?? "").trim() !== "") : [];
  if (opts.length === 0) return "OPEN";
  return opts.length <= 3 ? "MC3" : "MC5";
};

const mmss = (s: number) =>
  `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

const Evaluacion: React.FC<Props> = ({ evaluations = [] }) => {
  // normaliza entrada
  const items = evaluations.map(q => ({
    ...q,
    options: Array.isArray(q.options) ? q.options.filter(o => (o ?? "").trim() !== "") : [],
    _type: deriveType(q)
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // seg
  const [checkedQ, setCheckedQ] = useState<boolean[]>([]);
  const [isCorrectQ, setIsCorrectQ] = useState<boolean[]>([]);
  const [openAnswers, setOpenAnswers] = useState<string[]>([]);
  const [selectedOpt, setSelectedOpt] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  // init
  useEffect(() => {
    setActiveIndex(0);
    setCheckedQ(Array(items.length).fill(false));
    setIsCorrectQ(Array(items.length).fill(false));
    setOpenAnswers(Array(items.length).fill(""));
    setSelectedOpt(Array(items.length).fill(""));
    setFinished(false);
    setTimeLeft(((items[0]?.time ?? 1) * 60) || 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluations]);

  // timer por pregunta
  useEffect(() => {
    if (!items.length || finished || activeIndex >= items.length) return;
    setTimeLeft((items[activeIndex]?.time ?? 1) * 60);
    const itv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleCheck(activeIndex);
          clearInterval(itv);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(itv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, finished, items.length]);

  const handleCheck = (idx: number) => {
    if (checkedQ[idx]) return;
    const q = items[idx];
    const isMC = q._type === "MC3" || q._type === "MC5";

    let ok = false;
    if (isMC) {
      const sel = selectedOpt[idx] || "";
      if (Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0) {
        ok = q.correctAnswers.map(norm).includes(norm(sel));
      } else {
        ok = norm(sel) === norm(q.correctAnswer);
      }
    } else {
      ok = norm(openAnswers[idx]) === norm(q.correctAnswer);
    }

    const ch = [...checkedQ]; ch[idx] = true;
    const ic = [...isCorrectQ]; ic[idx] = ok;
    setCheckedQ(ch); setIsCorrectQ(ic);

    if (idx + 1 < items.length) setActiveIndex(idx + 1);
    else setFinished(true);
  };

  const totalAnswered = checkedQ.filter(Boolean).length;
  const totalCorrect = isCorrectQ.filter(Boolean).length;
  const allAnswered = items.length > 0 && totalAnswered === items.length;
  const finalScore = items.length ? ((totalCorrect / items.length) * 5).toFixed(1) : "0.0";

  if (!items.length) return <p className="text-gray-500">No hay evaluaciones disponibles.</p>;

  return (
    <div className="space-y-6">
      {items.map((q, idx) => {
        const isActive = idx === activeIndex;
        const isDisabled = idx > activeIndex;
        const answered = checkedQ[idx];
        const isMC = q._type === "MC3" || q._type === "MC5";

        // lista de respuestas correctas a mostrar en el banner
        const correctList: string[] =
          Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0
            ? q.correctAnswers
            : (q.correctAnswer ? [q.correctAnswer] : []);

        // estilos de opción (sin mensajes dentro de radios)
        const optionClass = (opt: string) => {
          if (answered) {
            const selected = selectedOpt[idx] === opt;
            const right = correctList.map(norm).includes(norm(opt));
            if (right) return "border-green-500 bg-green-50";
            if (selected && !right) return "border-red-500 bg-red-50";
            return "border-gray-200 bg-gray-50 opacity-80";
          }
          const selected = selectedOpt[idx] === opt;
          return selected ? "border-primary-40 bg-primary-95/40" : "border-gray-300 bg-gray-50 hover:border-primary-40";
        };

        return (
          <div
            key={q.id ?? idx}
            className={`relative border p-5 rounded-xl ${isDisabled ? "bg-gray-100 opacity-60" : "bg-white"} shadow-sm`}
          >
            {isDisabled && (
              <div className="absolute inset-0 bg-gray-100/75 border border-gray-300 flex items-center justify-center rounded-xl z-10">
                <div className="text-center text-gray-700 text-sm font-medium">
                  <FaLock className="mx-auto mb-1 text-base" />
                  Responde la pregunta actual para continuar
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-700 font-semibold">Pregunta {idx + 1}</h4>
            </div>

            <p className="text-[15px] text-gray-900">{q.question}</p>

            {isActive && !allAnswered && (
              <p className="text-xs text-gray-500 mt-1">
                Tiempo restante: <span className="font-medium">{mmss(timeLeft)}</span>
              </p>
            )}

            {/* OPEN → texto ; MC → RADIO (1 columna) */}
            {isMC ? (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {q.options && q.options.length > 0 ? (
                  q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2 transition cursor-pointer ${optionClass(opt)} ${answered || isDisabled ? "cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id ?? idx}`}
                        className="h-4 w-4"
                        value={opt}
                        checked={selectedOpt[idx] === opt}
                        onChange={(e) => {
                          if (answered || isDisabled) return;
                          const next = [...selectedOpt]; next[idx] = e.target.value; setSelectedOpt(next);
                        }}
                        disabled={answered || isDisabled}
                      />
                      <span className="text-sm text-gray-900">{opt}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-amber-600 mt-2">(No hay opciones configuradas para esta pregunta)</p>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <input
                  type="text"
                  value={openAnswers[idx] || ""}
                  onChange={(e) => {
                    if (answered || isDisabled) return;
                    const next = [...openAnswers]; next[idx] = e.target.value; setOpenAnswers(next);
                  }}
                  disabled={answered || isDisabled}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full max-w-md bg-gray-50"
                  placeholder="Tu respuesta..."
                />
              </div>
            )}

            {/* BANNER de feedback (único lugar del mensaje) */}
            {answered && (
              <div
                className={`mt-3 p-3 border rounded-md ${
                  isCorrectQ[idx]
                    ? "bg-green-50 border-green-500 text-green-700"
                    : "bg-red-50 border-red-500 text-red-700"
                }`}
              >
                <p className="text-sm font-medium">
                  {isCorrectQ[idx] ? "¡Correcto!" : "Incorrecto."}{" "}
                  Respuesta{correctList.length > 1 ? "s" : ""} correcta{correctList.length > 1 ? "s" : ""}:{" "}
                  <strong>{correctList.join(", ") || "—"}</strong>
                </p>
              </div>
            )}

            {/* Corroborar */}
            {isActive && !checkedQ[idx] && (
              <button
                onClick={() => handleCheck(idx)}
                className="mt-3 text-sm bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-sm transition"
                disabled={
                  (q._type === "MC3" || q._type === "MC5")
                    ? (selectedOpt[idx] || "") === ""
                    : (openAnswers[idx] || "").trim() === ""
                }
              >
                Corroborar
              </button>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <div className={`p-4 border border-gray-300 rounded-md mt-6 text-center ${parseFloat(finalScore) >= 3 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <p className="text-md font-semibold">
            Resultado obtenido: {isCorrectQ.filter(Boolean).length}/{items.length}
          </p>
          <p className="text-sm">
            Nota final: <span className="font-bold">{finalScore}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Evaluacion;
