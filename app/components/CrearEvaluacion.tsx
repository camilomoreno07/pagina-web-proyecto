import { useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Question {
  question: string;
  answer: string;
  type: string;
}

export default function CrearEvaluacion() {
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", answer: "", type: "Respuesta corta" },
  ]);

  const handleInputChange = (index: number, field: keyof Question, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", answer: "", type: "Respuesta corta" }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Crear Evaluación</h3>
      <hr className="mb-4 border-gray-300" />
      
      <div className="grid grid-cols-1 gap-4">
        {questions.map((q, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-md border border-gray-300 relative">
            <button onClick={() => removeQuestion(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <FaTrash size={20} />
            </button>
            <label className="block font-medium mb-1">Pregunta {index + 1}</label>
            <input
              type="text"
              placeholder="Escribe la pregunta"
              value={q.question}
              onChange={(e) => handleInputChange(index, "question", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <label className="block font-medium mb-1 mt-3">Respuesta correcta</label>
            <textarea
              placeholder="Escribe la respuesta correcta"
              value={q.answer}
              onChange={(e) => handleInputChange(index, "answer", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        ))}
      </div>
      
      <button onClick={addQuestion} className="mt-4 p-3 border-2 border-primary-40 text-primary-40 bg-white rounded-lg font-semibold flex items-center">
        <FaPlus className="text-2xl leading-none mr-2" /> Agregar pregunta
      </button>
    </div>
  );
}
