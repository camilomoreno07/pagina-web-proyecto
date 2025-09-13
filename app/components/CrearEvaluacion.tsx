import { useEffect, useMemo, useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import NumberStepper from "./NumberStepper";

// Tipos
type QuestionType = "OPEN" | "MC3" | "MC5" | "TF";

interface Question {
  id: string;
  question: string;
  correctAnswer: string;     // en MC/TF debe coincidir con alguna opción
  type: QuestionType;
  time: number;              // minutos
  options?: string[];        // MC/TF
  experienceUrl?: string;
}

interface CrearEvaluacionProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  name: string;
  hasSimulation: boolean;
}

export default function CrearEvaluacion({
  courseData,
  setCourseData,
  handleInputChange,
  name,
  hasSimulation,
}: CrearEvaluacionProps) {
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Asegura evaluations
  useEffect(() => {
    if (!courseData.evaluations) {
      setCourseData({ ...courseData, evaluations: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // IDs para preguntas que vengan sin id
  useEffect(() => {
    const list: Question[] = courseData?.evaluations || [];
    if (!Array.isArray(list) || list.length === 0) return;

    const someMissingId = list.some((q) => !q?.id);
    if (!someMissingId) return;

    const mkId = (i: number) =>
      (typeof crypto !== "undefined" && "randomUUID" in crypto)
        ? crypto.randomUUID()
        : `q_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`;

    const fixed = list.map((q, i) => (q?.id ? q : { ...q, id: mkId(i) }));
    setCourseData({ ...courseData, evaluations: fixed });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData?.evaluations]);

  const evaluations: Question[] = useMemo(
    () => courseData?.evaluations || [],
    [courseData?.evaluations]
  );

  const addQuestionOfType = (type: QuestionType) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const base: Question = {
      id,
      question: "",
      correctAnswer: "",
      time: 1,
      type,
    };

    // TF con dos opciones fijas
    const withType: Question =
      type === "OPEN"
        ? { ...base }
        : type === "TF"
          ? { ...base, options: ["Verdadero", "Falso"], correctAnswer: "" }
          : type === "MC3"
            ? { ...base, options: ["", "", ""], correctAnswer: "" }
            : { ...base, options: ["", "", "", "", ""], correctAnswer: "" };

    const newQuestions = [...evaluations, withType];
    setCourseData({ ...courseData, evaluations: newQuestions });
    setShowTypePicker(false);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = evaluations.filter((_, i) => i !== index);
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  const handleQuestionChange = <K extends keyof Question>(
    index: number,
    field: K,
    value: Question[K]
  ) => {
    const newQuestions = evaluations.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    value: string
  ) => {
    const q = evaluations[qIndex];
    if (!q.options) return;

    // Si es TF, mantener siempre 2 opciones
    const nextOpts = q.options
      .map((opt, i) => (i === optIndex ? value : opt))
      .slice(0, q.type === "TF" ? 2 : undefined);

    const stillValid = nextOpts.includes(q.correctAnswer);
    const updated: Question = {
      ...q,
      options: nextOpts,
      correctAnswer: stillValid ? q.correctAnswer : "",
    };

    const newQuestions = evaluations.map((item, i) =>
      i === qIndex ? updated : item
    );
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  const setCorrectFromOption = (qIndex: number, optIndex: number) => {
    const q = evaluations[qIndex];
    if (!q.options) return;
    handleQuestionChange(qIndex, "correctAnswer", q.options[optIndex] || "");
  };

  const omitEvaluation = () => {
    const omittedEval: Question = {
      id: "omitted",
      question: "NA",
      correctAnswer: "NA",
      time: 0,
      type: "OPEN",
    };
    setCourseData({ ...courseData, evaluations: [omittedEval] });
  };

  const cancelOmission = () => {
    setCourseData({ ...courseData, evaluations: [] });
  };

  const isOmitted =
    evaluations?.length === 1 &&
    evaluations[0].question === "NA" &&
    evaluations[0].correctAnswer === "NA";

  const typeLabel = (q: Question) =>
    !q.options
      ? "Respuesta abierta"
      : q.options.length === 2
        ? "Verdadero / Falso"
        : q.options.length === 3
          ? "Selección (3)"
          : "Selección (5)";

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">
        Crear Evaluación
      </h3>
      <hr className="mb-4 border-gray-300" />

      {isOmitted ? (
        <div className="text-center text-gray-600 border border-gray-300 p-6 bg-gray-50 rounded-lg shadow">
          <p className="text-lg font-semibold mb-2">Evaluación omitida</p>
          <p className="text-sm">
            Esta sección no incluirá una evaluación de conocimientos para los estudiantes
          </p>
          <button
            onClick={cancelOmission}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Cancelar omisión
          </button>
        </div>
      ) : (
        <>
          {/* Listado de preguntas */}
          <div className="grid grid-cols-1 gap-4">
            {evaluations?.map((q: Question, index: number) => (
              <div
                key={q.id ?? index}
                className="p-6 bg-white rounded-lg shadow-md border border-gray-300 relative"
              >


                <div className="flex items-center justify-between mb-2">
                  <label className="block text-lg font-bold text-gray-600">Pregunta {index + 1}</label>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-300">
                      {typeLabel(q)}
                    </span>
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-2 rounded-full bg-red-100 text-red-500 transition hover:bg-red-500 hover:text-white"
                      aria-label={`Eliminar pregunta ${index + 1}`}
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>

                <textarea
                  placeholder="Escribe la pregunta"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  rows={2}
                />

                {/* Render según tipo */}
                {!q.options ? (
                  <>
                    <label className="block font-medium mb-1 mt-3">Respuesta correcta</label>
                    <input
                      type="text"
                      placeholder="Escribe la respuesta correcta"
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(index, "correctAnswer", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </>
                ) : q.options?.length === 2 ? (
                  <>
                    <label className="block font-medium mb-2 mt-3">Marca la correcta</label>
                    <div className="space-y-2">
                      {(q.options ?? ["Verdadero", "Falso"]).slice(0, 2).map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${q.id ?? index}`}
                            checked={q.correctAnswer === opt && opt !== ""}
                            onChange={() => setCorrectFromOption(index, oi)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {q.correctAnswer === "" && (
                      <p className="text-xs text-amber-600 mt-2">Selecciona Verdadero o Falso como correcta.</p>
                    )}
                  </>
                ) : (
                  <>
                    <label className="block font-medium mb-2 mt-3">Opciones (marca la correcta)</label>
                    <div className="space-y-2">
                      {q.options?.map((opt, oi) => (
                        <div key={`${q.id ?? index}-${oi}`} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${q.id ?? index}`}
                            checked={q.correctAnswer === opt && opt !== ""}
                            onChange={() => setCorrectFromOption(index, oi)}
                            className="h-4 w-4"
                          />
                          <input
                            type="text"
                            placeholder={`Opción ${oi + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(index, oi, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                    {q.correctAnswer === "" && (
                      <p className="text-xs text-amber-600 mt-2">Selecciona cuál opción es la correcta.</p>
                    )}
                  </>
                )}

                {/* ⬇️ Aquí va el NumberStepper CORRECTO por pregunta */}
                <label className="block font-medium mb-1 mt-3">Tiempo de estudio</label>
                <NumberStepper
                  value={q.time}
                  onChange={(next) => handleQuestionChange(index, "time", next)}
                  min={1}
                  max={30}     // ajustable
                  step={1}
                  suffix="min"
                />
                <p className="text-xs text-gray-500">Entre 1 y 30 minutos.</p>
              </div>
            ))}
          </div>

          {/* Botonera */}
          <div className="flex justify-center gap-4 mt-6 relative">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={() => setShowTypePicker((s) => !s)}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary-40 text-primary-40 bg-white 
      rounded-xl font-medium shadow-sm hover:bg-primary-40 hover:text-white 
      active:scale-95 transition"
              >
                <FaPlus /> Agregar pregunta
              </button>

              {showTypePicker && (
                <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow p-2">
                  <p className="text-sm font-medium px-2 py-1 text-gray-700">Tipo de pregunta</p>
                  <div className="flex flex-col">
                    <button onClick={() => addQuestionOfType("OPEN")} className="text-left px-3 py-2 hover:bg-gray-100 rounded">Respuesta abierta</button>
                    <button onClick={() => addQuestionOfType("TF")} className="text-left px-3 py-2 hover:bg-gray-100 rounded">Verdadero / Falso</button>
                    <button onClick={() => addQuestionOfType("MC3")} className="text-left px-3 py-2 hover:bg-gray-100 rounded">Selección múltiple (3 opciones)</button>
                    <button onClick={() => addQuestionOfType("MC5")} className="text-left px-3 py-2 hover:bg-gray-100 rounded">Selección múltiple (5 opciones)</button>
                  </div>
                </div>
              )}

              <button
                onClick={omitEvaluation}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-gray-500 text-white bg-gray-400 
      rounded-xl font-medium shadow-sm hover:bg-gray-600 hover:text-white 
      active:scale-95 transition"
              >
                Omitir evaluación
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
