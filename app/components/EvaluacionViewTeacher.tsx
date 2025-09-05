"use client";
import React, { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";

const token = Cookies.get("token");
let username: string | null = null;
if (token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    username = payload.sub;
  } catch (err) {
    console.error("Error decoding token:", err);
  }
}

type QuestionType = "OPEN" | "MC3" | "MC5";
type SectionKey = "aulaInvertida" | "tallerHabilidad" | "actividadExperiencial";

interface EvalItem {
  id?: string;
  type?: QuestionType;
  questionType?: QuestionType;
  question: string;
  correctAnswer?: string;
  correctAnswers?: string[];
  time: number;
  options?: string[] | null;
}

interface QuestionGrade {
  response: string;
  feedback?: string | null;
}

interface SectionGrade {
  questions: QuestionGrade[];
  grade?: number;
}

interface Props {
  evaluations?: EvalItem[];
  course: { courseId: string };
  section?: SectionKey;
  gradeId?: string; // optional if editing existing grade
  onComplete?: (sectionGrade: SectionGrade) => void;
}

const norm = (s?: string) =>
  (s ?? "").toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

const deriveType = (q: EvalItem): QuestionType => {
  const t = q.type || q.questionType;
  if (t) return t;
  const opts = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
  if (opts.length === 0) return "OPEN";
  return opts.length <= 3 ? "MC3" : "MC5";
};

const clampSecs = (mins?: number) => Math.max(5, Math.floor((mins ?? 1) * 60));
const mmss = (s: number) =>
  `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

const EvaluacionViewStudent: React.FC<Props> = ({
  evaluations = [],
  course,
  section,
  gradeId,
  onComplete,
}) => {
  const resolvedSection: SectionKey = section ?? "aulaInvertida";

  const items = evaluations.map((q) => {
    const options = Array.isArray(q.options) ? q.options.filter(Boolean) : [];
    const _type = deriveType({ ...q, options });
    const correct =
      _type === "OPEN"
        ? q.correctAnswers ?? (q.correctAnswer ? [q.correctAnswer] : [])
        : [q.correctAnswer ?? options[0]];
    return { ...q, options, _type, correctAnswers: correct };
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(clampSecs(items[0]?.time));
  const [checkedQ, setCheckedQ] = useState<boolean[]>(items.map(() => false));
  const [isCorrectQ, setIsCorrectQ] = useState<boolean[]>(items.map(() => false));
  const [openAnswers, setOpenAnswers] = useState<string[]>(items.map(() => ""));
  const [selectedOptIdx, setSelectedOptIdx] = useState<number[]>(items.map(() => -1));
  const [finished, setFinished] = useState(false);
  const [onCompleteFired, setOnCompleteFired] = useState(false);

  const [finalGrade, setFinalGrade] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const [feedbacks, setFeedbacks] = useState<string[]>(items.map(() => ""));

  // Timer
  useEffect(() => {
    if (finished || items.length === 0 || activeIndex >= items.length) return;
    setTimeLeft((prev) => (prev > 0 ? prev : clampSecs(items[activeIndex]?.time)));

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleCheck(activeIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeIndex, finished, items]);

  const handleCheck = useCallback(
    (idx: number) => {
      if (checkedQ[idx]) return;

      const q = items[idx];
      let ok = false;
      if (q._type === "OPEN") {
        ok = q.correctAnswers?.map(norm).includes(norm(openAnswers[idx])) ?? false;
      } else {
        const sel = selectedOptIdx[idx];
        const selText = q.options?.[sel] ?? "";
        ok = norm(selText) === norm(q.correctAnswers?.[0]);
      }

      const newChecked = [...checkedQ];
      newChecked[idx] = true;
      setCheckedQ(newChecked);

      const newCorrect = [...isCorrectQ];
      newCorrect[idx] = ok;
      setIsCorrectQ(newCorrect);

      // move to next pending question
      const next = newChecked.findIndex((v, i) => i > idx && !v);
      if (next !== -1) {
        setActiveIndex(next);
        setTimeLeft(clampSecs(items[next].time));
        return;
      }

      const anyPending = newChecked.findIndex((v) => !v);
      if (anyPending === -1) {
        setFinished(true);

        setTotalQuestions(items.length);
        setCorrectAnswers(newCorrect.filter(Boolean).length);

        if (!onCompleteFired) {
          const answered: QuestionGrade[] = items.map((qq, i) => ({
            response: qq._type === "OPEN" ? openAnswers[i] : qq.options?.[selectedOptIdx[i]] ?? "",
            feedback: feedbacks[i] ?? null, // include feedback if any
          }));
          const grade = items.length
            ? (newCorrect.filter(Boolean).length / items.length) * 5
            : 0;
          setFinalGrade(grade ?? null);
          const sectionGrade: SectionGrade = {
            questions: answered,
            grade: parseFloat(grade.toFixed(1)),
          };
          onComplete?.(sectionGrade);
          setOnCompleteFired(true);
        }
      }
    },
    [checkedQ, isCorrectQ, items, openAnswers, selectedOptIdx, onComplete, onCompleteFired]
  );

  if (!items.length) return <p className="text-gray-500">No hay evaluaciones disponibles.</p>;

  return (
    <div className="space-y-6">
      {items.map((q, idx) => { // Add { ... } to map over the items
        const isActive = idx === activeIndex;
        const isDisabled = !finished && idx > activeIndex;
        const answered = checkedQ[idx];
        const isMC = q._type === "MC3" || q._type === "MC5";

        return (
          <div
            key={q.id ?? idx}
            className={`border p-4 rounded-md relative ${isDisabled ? "bg-gray-100 opacity-60" : "bg-gray-50"}`}
          >
            {isDisabled && (
              <div className="absolute inset-0 bg-gray-100 border border-gray-300 flex items-center justify-center rounded-md z-10">
                <div className="text-center text-gray-700 text-sm font-medium">
                  <FaLock className="mx-auto mb-1 text-base" />
                  <span className="mb-1 block">Responde la pregunta actual para continuar</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-semibold mr-1">Pregunta {idx + 1}</h4>
              {isActive && !finished && (
                <span className="text-sm text-gray-500">Tiempo restante: {mmss(timeLeft)}</span>
              )}
            </div>

            <p className="mb-2 text-gray-700">{q.question}</p>

            {isMC ? (
              <div className="space-y-2">
                {q.options?.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center border px-3 py-1 rounded cursor-pointer select-none
                      ${selectedOptIdx[idx] === oi
                        ? "bg-gray-200 text-gray-900 border-gray-400"
                        : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
                      }`}
                  >
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      value={oi}
                      checked={selectedOptIdx[idx] === oi}
                      onChange={() => {
                        if (answered || isDisabled) return;
                        const next = [...selectedOptIdx];
                        next[idx] = oi;
                        setSelectedOptIdx(next);
                      }}
                      disabled={answered || isDisabled}
                      className="form-radio text-gray-600 mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex items-center border px-3 py-1 rounded bg-white
             hover:bg-gray-50 hover:border-gray-400
             focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-400">
                <input
                  type="text"
                  value={openAnswers[idx] ?? ""}
                  onChange={(e) => {
                    if (answered || isDisabled) return;
                    const next = [...openAnswers];
                    next[idx] = e.target.value;
                    setOpenAnswers(next);
                  }}
                  disabled={answered || isDisabled}
                  className="flex-1 bg-transparent outline-none"
                  placeholder="Tu respuesta..."
                />
              </div>
            )}

            {isActive && !answered && !finished && (
              <button
                onClick={() => handleCheck(idx)}
                disabled={
                  (q._type === "OPEN" && openAnswers[idx].trim() === "") ||
                  ((q._type === "MC3" || q._type === "MC5") && selectedOptIdx[idx] === -1)
                }
                className={`mt-2 text-sm px-4 py-1.5 rounded shadow-sm transition
      ${((q._type === "OPEN" && openAnswers[idx].trim() === "") ||
                    ((q._type === "MC3" || q._type === "MC5") && selectedOptIdx[idx] === -1))
                    ? "bg-gray-300 cursor-not-allowed text-white"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
              >
                Corroborar
              </button>
            )}

            {answered && (
              <div
                className={`mt-4 p-3 rounded ${(q._type === "OPEN" && openAnswers[idx].trim() === "") ||
                    ((q._type === "MC3" || q._type === "MC5") && selectedOptIdx[idx] === -1)
                    ? "bg-orange-100 text-orange-800"
                    : isCorrectQ[idx]
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
              >
                <p className="flex items-center gap-2">
                  {isCorrectQ[idx] ? <FaCheckCircle /> : <FaTimesCircle />}
                  {(q._type === "OPEN" && openAnswers[idx].trim() === "") ||
                    ((q._type === "MC3" || q._type === "MC5") && selectedOptIdx[idx] === -1)
                    ? "No respondiste esta pregunta"
                    : isCorrectQ[idx]
                      ? "¡Correcto!"
                      : "Incorrecto."
                  }
                </p>
                {feedbacks[idx] && (
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="text-gray-600 font-semibold mr-1">Feedback:</span>
                    {feedbacks[idx]}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {finished && finalGrade !== null && (
        <div
          className={`p-4 border border-gray-300 rounded-md mt-6 text-center ${parseFloat(finalGrade) >= 3
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
            }`}
        >
          <p className="text-md">
            <span className="font-bold">Resultado obtenido:</span> {correctAnswers}/{totalQuestions}
          </p>
          <p className="text-sm">
            <span className="font-bold">Nota final:</span> {finalGrade}
          </p>
        </div>
      )}
    </div>
  );
};

export default EvaluacionViewStudent;