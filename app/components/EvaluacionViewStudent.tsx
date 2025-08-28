"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";

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
  `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

const EvaluacionViewStudent: React.FC<Props> = ({ evaluations = [], course }) => {
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
  const [feedbacks, setFeedbacks] = useState<string[]>([]);

  useEffect(() => {
    if (existingGrade) return;
    setActiveIndex(0);
    setCheckedQ(Array(items.length).fill(false));
    setIsCorrectQ(Array(items.length).fill(false));
    setOpenAnswers(Array(items.length).fill(""));
    setSelectedOptIdx(Array(items.length).fill(-1));
    setFeedbacks(Array(items.length).fill(""));
    setFinished(false);
    if (items.length) setTimeLeft(clampSecs(items[0]?.time));
  }, [items, existingGrade]);

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

        const prev = data?.aulaVirtual?.questions ?? [];
        const newChecked = Array(items.length).fill(false);
        const newIsCorrect = Array(items.length).fill(false);
        const newOpen = Array(items.length).fill("");
        const newSelected = Array(items.length).fill(-1);
        const newFeedbacks = Array(items.length).fill("");

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
          newFeedbacks[i] = feedback;

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
        setFeedbacks(newFeedbacks);

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
    [checkedQ, items, openAnswers, selectedOptIdx, course, finished]
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
        const isDisabled = idx > activeIndex;
        const answered = checkedQ[idx];
        const isMC = q._type === "MC3" || q._type === "MC5";

        return (
          <div
            key={q.id ?? idx}
            className={`border p-4 rounded-md relative ${
              isDisabled ? "bg-gray-100 opacity-60" : "bg-gray-50"
            }`}
          >
            {isDisabled && (
              <div className="absolute inset-0 bg-gray-100 border border-gray-300 flex items-center justify-center rounded-md z-10">
                <div className="text-center text-gray-700 text-sm font-medium">
                  <FaLock className="mx-auto mb-1 text-base" />
                  <span className="mb-1 block">
                    Responde la pregunta actual para continuar
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-semibold mr-1">
                Pregunta {idx + 1}
              </h4>
              {isActive && !finished && (
                <span className="text-sm text-gray-500">
                  Tiempo restante: {mmss(timeLeft)}
                </span>
              )}
            </div>

            <p className="mb-2 text-gray-700">{q.question}</p>

            {isMC ? (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
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
              <div className="flex items-center gap-2 mt-2">
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
                  className="border border-gray-300 rounded px-3 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400"
                  placeholder="Tu respuesta..."
                />
              </div>
            )}

            {isActive && !answered && !finished && (
              <button
                onClick={() => handleCheck(idx)}
                className="mt-2 text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded shadow-sm transition"
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
                <p className="flex items-center gap-2">
                  {isCorrectQ[idx] ? <FaCheckCircle /> : <FaTimesCircle />}
                  {isCorrectQ[idx] ? "¡Correcto!" : "Incorrecto."}
                </p>
                {feedbacks[idx] && (
                  <p className="mt-1 text-sm text-gray-700">
                    <span className="text-gray-600 font-semibold mr-1">Feedback:</span>{feedbacks[idx]}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {allAnswered && (
        <div
              className={`p-4 border border-gray-300 rounded-md mt-6 text-center ${parseFloat(finalScore) >= 3
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
              }`}
            >
              <p className="text-md font-semibold">
                Resultado obtenido: {totalCorrect}/{evaluations.length}
              </p>
              <p className="text-sm">
                Nota final: <span className="font-bold">{finalScore}</span>
              </p>
            </div>
      )}
    </div>
  );
};

export default EvaluacionViewStudent;
