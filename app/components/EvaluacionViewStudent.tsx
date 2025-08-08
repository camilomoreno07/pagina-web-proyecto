import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";

interface EvaluacionViewStudent {
  question: string;
  correctAnswer: string;
  time: number; // en minutos
}

interface EvaluacionProps {
  evaluations?: EvaluacionViewStudent[];
}

const Evaluacion = ({ evaluations }: EvaluacionProps) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);

  // Ref para mantener la respuesta más reciente del input activo
  const currentAnswerRef = useRef<string>("");

  useEffect(() => {
    if (!evaluations || activeIndex >= evaluations.length || isFinished) return;

    setTimeLeft(evaluations[activeIndex].time * 60); // convertir minutos a segundos

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleCheck(activeIndex); // tiempo agotado → forzar corroborar
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeIndex, isFinished]);

  const handleChange = (value: string, index: number) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);

    if (index === activeIndex) {
      currentAnswerRef.current = value;
    }
  };

  const handleCheck = (index: number) => {
    if (checked[index]) return;

    const currentAnswer =
      (index === activeIndex ? currentAnswerRef.current : answers[index])?.trim().toLowerCase() || "";
    const correctAnswer = evaluations?.[index].correctAnswer.trim().toLowerCase() || "";

    const updatedChecked = [...checked];
    updatedChecked[index] = true;
    setChecked(updatedChecked);

    const updatedCorrect = [...isCorrect];
    updatedCorrect[index] = currentAnswer === correctAnswer;
    setIsCorrect(updatedCorrect);

    if (index + 1 < (evaluations?.length || 0)) {
      setActiveIndex(index + 1);
    } else {
      setIsFinished(true);
    }
  };

  const totalAnswered = checked.filter(Boolean).length;
  const totalCorrect = isCorrect.filter(Boolean).length;
  const allAnswered = evaluations && totalAnswered === evaluations.length;
  const finalScore = evaluations ? ((totalCorrect / evaluations.length) * 5).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {evaluations?.length ? (
        <>
          {evaluations.map((evalItem, idx) => {
            const isActive = idx === activeIndex;
            const isDisabled = idx > activeIndex;

            return (
              <div
                key={idx}
                className={`border p-4 rounded-md ${isDisabled ? "bg-gray-100 opacity-60" : "bg-gray-50"} space-y-2 relative`}
              >
                {isDisabled && (
                  <div className="absolute inset-0 bg-gray-100 border border-gray-300 flex items-center justify-center rounded-md z-10">
                    <div className="text-center text-gray-700 text-sm font-medium">
                      <FaLock className="mx-auto mb-1 text-base" />
                      Responde la pregunta actual para continuar
                    </div>
                  </div>
                )}

                <h4 className="text-gray-500 font-semibold mr-1">Pregunta {idx + 1}</h4>
                <h4 className="text-md text-gray-800">{evalItem.question}</h4>

                {isActive && !allAnswered && (
                  <p className="text-xs text-gray-500">
                    Tiempo restante: <span className="font-medium">{timeLeft}s</span>
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={answers[idx] || ""}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    disabled={checked[idx] || isDisabled}
                    className="border border-gray-300 rounded px-3 py-1 text-sm w-full max-w-xs"
                    placeholder="Tu respuesta..."
                  />

                  {checked[idx] &&
                    (isCorrect[idx] ? (
                      <FaCheckCircle className="text-green-500 text-lg" />
                    ) : (
                      <FaTimesCircle className="text-red-500 text-lg" />
                    ))}
                </div>

                {isActive && !checked[idx] && (
                  <button
                    onClick={() => handleCheck(idx)}
                    className="mt-2 text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded shadow-sm transition"
                  >
                    Corroborar
                  </button>
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
        </>
      ) : (
        <p className="text-gray-500">No hay evaluaciones disponibles.</p>
      )}
    </div>
  );
};

export default Evaluacion;
