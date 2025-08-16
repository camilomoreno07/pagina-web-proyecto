import { useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Question {
  question: string;
  correctAnswer: string;
  type: string;
  time: number;
  experienceUrl?: string;
}

interface CrearEvaluacionProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
  useEffect(() => {
    if (!courseData.evaluations) {
      setCourseData({
        ...courseData,
        evaluations: [],
      });
    }
  }, [courseData, setCourseData]);

  const addQuestion = () => {
    const newQuestion: Question = {
      question: "",
      correctAnswer: "",
      time: 1,
      type: "Respuesta corta",
    };

    const newQuestions = [...(courseData?.evaluations || []), newQuestion];
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = courseData.evaluations.filter((_, i) => i !== index);
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string | number
  ) => {
    const newQuestions = courseData.evaluations.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  const updateTime = (index: number, delta: number) => {
    const current = courseData.evaluations[index].time || 1;
    const updated = Math.max(1, Math.min(30, current + delta));
    handleQuestionChange(index, "time", updated);
  };

  const omitEvaluation = () => {
    const omittedEval: Question = {
      question: "NA",
      correctAnswer: "NA",
      time: 0,
      type: "NA",
    };
    setCourseData({ ...courseData, evaluations: [omittedEval] });
  };

  const cancelOmission = () => {
    setCourseData({ ...courseData, evaluations: [] });
  };

  const isOmitted =
    courseData?.evaluations?.length === 1 &&
    courseData.evaluations[0].question === "NA" &&
    courseData.evaluations[0].correctAnswer === "NA";

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">
        {hasSimulation ? "Debriefing" : "Crear Evaluación"}
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
          <div className="grid grid-cols-1 gap-4">
            {courseData.evaluations?.map((q: Question, index: number) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow-md border border-gray-300 relative"
              >
                <button
                  onClick={() => removeQuestion(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <FaTrash size={20} />
                </button>
                <label className="block font-medium mb-1">
                  Pregunta {index + 1}
                </label>
                <textarea
                  placeholder="Escribe la pregunta"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(index, "question", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  rows={2}
                />
                <label className="block font-medium mb-1 mt-3">
                  Respuesta correcta
                </label>
                <input
                  type="text"
                  placeholder="Escribe la respuesta correcta"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(index, "correctAnswer", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <label className="block font-medium mb-1 mt-3">
                  Tiempo límite
                </label>
                <div className="flex items-center mb-3">
                  <button
                    onClick={() => updateTime(index, -1)}
                    className="px-4 py-2 bg-gray-300 text-black rounded-l"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 text-lg">{q.time} min</span>
                  <button
                    onClick={() => updateTime(index, 1)}
                    className="px-4 py-2 bg-gray-300 text-black rounded-r"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 border-2 border-primary-40 text-primary-40 bg-white rounded-lg font-semibold"
            >
              <FaPlus /> Agregar pregunta
            </button>

            <button
              onClick={omitEvaluation}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Omitir evaluación
            </button>
          </div>
        </>
      )}
    </div>
  );
}
