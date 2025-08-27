"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";

const token = Cookies.get("token");
let username: string | null = null;
if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    username = payload.sub;
  } catch (err) {
    console.error("Error al decodificar token:", err);
  }
}

type QuestionType = "OPEN" | "MC3" | "MC5";

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

interface Props {
  evaluations?: EvalItem[];
  course: { courseId: string };
}

const norm = (s?: string) =>
  (s ?? "").toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

const deriveType = (q: EvalItem): QuestionType => {
  const t = q.type || q.questionType;
  if (t) return t;
  const opts = Array.isArray(q.options)
    ? q.options.filter((o) => (o ?? "").trim() !== "")
    : [];
  if (opts.length === 0) return "OPEN";
  return opts.length <= 3 ? "MC3" : "MC5";
};

const clampSecs = (mins?: number) => Math.max(5, Math.floor(((mins ?? 1) * 60)));
const mmss = (s: number) =>
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60)
    .toString()
    .padStart(2, "0")}`;

const Evaluacion: React.FC<Props> = ({ evaluations = [], course }) => {
  const items = useMemo(
    () =>
      evaluations.map((q) => {
        const options = Array.isArray(q.options)
          ? q.options.filter((o) => (o ?? "").trim() !== "")
          : [];
        const _type = deriveType({ ...q, options });
        const corrArr = Array.isArray(q.correctAnswers)
          ? q.correctAnswers.filter(Boolean)
          : [];
        const singleCorrect =
          _type === "MC3" || _type === "MC5"
            ? corrArr[0] ?? q.correctAnswer ?? undefined
            : q.correctAnswer;
        return {
          ...q,
          options,
          _type,
          correctAnswer: singleCorrect,
          correctAnswers: _type === "OPEN" ? corrArr : undefined,
        };
      }),
    [evaluations]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [checkedQ, setCheckedQ] = useState<boolean[]>([]);
  const [isCorrectQ, setIsCorrectQ] = useState<boolean[]>([]);
  const [openAnswers, setOpenAnswers] = useState<string[]>([]);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [existingGrade, setExistingGrade] = useState<any | null>(null);

  // ---------- INIT base (cuando NO hay grade existente) ----------
  useEffect(() => {
    if (existingGrade) return; // no sobreescribir si ya cargamos algo previo
    setActiveIndex(0);
    setCheckedQ(Array(items.length).fill(false));
    setIsCorrectQ(Array(items.length).fill(false));
    setOpenAnswers(Array(items.length).fill(""));
    setSelectedOptIdx(Array(items.length).fill(-1));
    setFinished(false);
    if (items.length) setTimeLeft(clampSecs(items[0]?.time));
  }, [items, existingGrade]);

  // ---------- Timer por pregunta (si no está finalizado) ----------
  useEffect(() => {
    if (!items.length || finished || activeIndex >= items.length) return;
    setTimeLeft(clampSecs(items[activeIndex]?.time));
    const itv = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(itv);
          handleCheck(activeIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(itv);
  }, [activeIndex, finished, items]);

  // ---------- GET grade existente y prefilling en inputs ----------
  useEffect(() => {
    if (!username || !course?.courseId) return;

    fetch(
      `http://localhost:8081/api/grades/student/${username}/course/${course.courseId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((res) => (res.status === 404 ? null : res.json()))
      .then((data) => {
        if (!data) return;
        setExistingGrade(data);

        // Prefill respuestas en inputs y marcar validación
        const prev = data?.aulaVirtual?.questions ?? [];
        const newChecked = Array(items.length).fill(false);
        const newIsCorrect = Array(items.length).fill(false);
        const newOpen = Array(items.length).fill("");
        const newSelected = Array(items.length).fill(-1);

        for (let i = 0; i < items.length; i++) {
          const q = items[i];
          const resp = prev[i]?.response ?? "";
          const feedback = prev[i]?.feeback ?? prev[i]?.feedback ?? "";

          const isMC = q._type === "MC3" || q._type === "MC5";
          if (isMC) {
            const idx = q.options.findIndex((o) => norm(o) === norm(resp));
            newSelected[i] = idx;
            newOpen[i] = "";
          } else {
            newOpen[i] = resp;
          }

          newChecked[i] = true;

          // Si viene feedback lo usamos; si no, calculamos.
          if (feedback) {
            newIsCorrect[i] = /correcto/i.test(feedback);
          } else {
            if (isMC) {
              const selText = q.options[newSelected[i]] || "";
              newIsCorrect[i] = norm(selText) === norm(q.correctAnswer);
            } else {
              const corrList =
                Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0
                  ? q.correctAnswers
                  : q.correctAnswer
                  ? [q.correctAnswer]
                  : [];
              newIsCorrect[i] = corrList.map(norm).includes(norm(newOpen[i]));
            }
          }
        }

        setCheckedQ(newChecked);
        setIsCorrectQ(newIsCorrect);
        setOpenAnswers(newOpen);
        setSelectedOptIdx(newSelected);

        // Mostrar todo como ya finalizado (bloquea edición)
        setFinished(true);
        setActiveIndex(items.length - 1);
        setTimeLeft(0);
      })
      .catch((err) => console.error("Error consultando grade:", err));
  }, [username, course?.courseId, items]);

  const handleCheck = useCallback(
    (idx: number) => {
      if (checkedQ[idx] || finished) return;
      const q = items[idx];
      const isMC = q._type === "MC3" || q._type === "MC5";
      let ok = false;

      if (isMC) {
        const selOptText = q.options[selectedOptIdx[idx]] || "";
        ok = norm(selOptText) === norm(q.correctAnswer);
      } else {
        const corrList =
          Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0
            ? q.correctAnswers
            : q.correctAnswer
            ? [q.correctAnswer]
            : [];
        ok = corrList.map(norm).includes(norm(openAnswers[idx]));
      }

      setCheckedQ((prev) => {
        const ch = [...prev];
        ch[idx] = true;
        return ch;
      });
      setIsCorrectQ((prev) => {
        const ic = [...prev];
        ic[idx] = ok;
        return ic;
      });

      if (idx + 1 < items.length) setActiveIndex(idx + 1);
      else {
        setFinished(true);
        const payload = {
          studentId: username,
          courseId: course?.courseId || "",
          aulaVirtual: {
            questions: items.map((q, i) => ({
              response:
                q._type === "OPEN"
                  ? openAnswers[i]
                  : q.options[selectedOptIdx[i]] || "",
              feeback: "",
            })),
          },
          tallerHabilidad: { questions: [] },
          actividadExperiencial: { questions: [] },
        };
        fetch("http://localhost:8081/api/grades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => console.log("Grade saved:", data))
          .catch((err) => console.error("Error saving grade:", err));
      }
    },
    [checkedQ, items, openAnswers, selectedOptIdx, course, finished, isCorrectQ]
  );

  const totalAnswered = checkedQ.filter(Boolean).length;
  const totalCorrect = isCorrectQ.filter(Boolean).length;
  const allAnswered = items.length > 0 && totalAnswered === items.length;
  const finalScore = items.length
    ? ((totalCorrect / items.length) * 5).toFixed(1)
    : "0.0";

  if (!items.length)
    return <p className="text-gray-500">No hay evaluaciones disponibles.</p>;

  return (
    <div className="space-y-6">
      {items.map((q, idx) => {
        const isActive = idx === activeIndex;
        const isDisabled = finished || idx > activeIndex;
        const answered = checkedQ[idx];
        const isMC = q._type === "MC3" || q._type === "MC5";

        return (
          <div key={q.id ?? idx} className="border p-4 rounded relative">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">Pregunta {idx + 1}</h4>
              {!finished && isActive && (
                <span className="text-sm text-gray-600">
                  Tiempo: {mmss(timeLeft)}
                </span>
              )}
            </div>

            <p className="mb-2">{q.question}</p>

            {isMC ? (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`block border px-3 py-2 rounded ${
                      selectedOptIdx[idx] === oi ? "bg-blue-100" : "bg-white"
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
                      className="mr-2"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={openAnswers[idx]}
                onChange={(e) => {
                  if (answered || isDisabled) return;
                  const next = [...openAnswers];
                  next[idx] = e.target.value;
                  setOpenAnswers(next);
                }}
                disabled={answered || isDisabled}
                className="border px-3 py-2 rounded w-full mt-2"
                placeholder="Tu respuesta..."
              />
            )}

            {isActive && !answered && !finished && (
              <button
                onClick={() => handleCheck(idx)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Corroborar
              </button>
            )}

            {answered && (
              <div
                className={`mt-4 p-3 rounded ${
                  isCorrectQ[idx]
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {isCorrectQ[idx] ? "¡Correcto!" : "Incorrecto."}
              </div>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <div className="p-4 bg-gray-100 rounded text-center mt-6">
          <p className="text-xl font-semibold">
            Resultado final: {finalScore}/5
          </p>
        </div>
      )}
    </div>
  );
};

export default Evaluacion;
