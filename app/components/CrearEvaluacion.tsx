import { useState, useEffect } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Question {
  question: string;
  questionDescription: string;
  type: string;
}

interface CrearEvaluacionProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  name: string;
}

export default function CrearEvaluacion({
  courseData,
  setCourseData,
  handleInputChange,
  name,
}: CrearEvaluacionProps) {
  // Inicializar courseData.evaluations si no existe
  useEffect(() => {
    if (!courseData.evaluations) {
      setCourseData({
        ...courseData,
        evaluations: [{ question: "", questionDescription: "", type: "Respuesta corta" }],
      });
    }
  }, [courseData, setCourseData]);

  const addQuestion = () => {
    const newQuestion: Question = {
      question: "",
      questionDescription: "",
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
    value: string
  ) => {
    const newQuestions = courseData.evaluations.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    );
    setCourseData({ ...courseData, evaluations: newQuestions });
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Crear Evaluación</h3>
      <hr className="mb-4 border-gray-300" />

      <div className="grid grid-cols-1 gap-4">
        {courseData.evaluations?.map((q, index) => (
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
            <input
              type="text"
              placeholder="Escribe la pregunta"
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(index, "question", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <label className="block font-medium mb-1 mt-3">
              Respuesta correcta
            </label>
            <textarea
              placeholder="Escribe la respuesta correcta"
              value={q.questionDescription}
              onChange={(e) =>
                handleQuestionChange(index, "questionDescription", e.target.value)
              }
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="mt-4 p-3 border-2 border-primary-40 text-primary-40 bg-white rounded-lg font-semibold flex items-center"
      >
        <FaPlus className="text-2xl leading-none mr-2" /> Agregar pregunta
      </button>
    </div>
  );
}