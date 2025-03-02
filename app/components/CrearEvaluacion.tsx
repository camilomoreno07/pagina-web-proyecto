// components/CrearEvaluacion.tsx
interface CrearEvaluacionProps {
    courseData: {
      firstQuestion: string;
      questionDescription: string;
    };
    handleInputChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
  }
  
  export default function CrearEvaluacion({
    courseData,
    handleInputChange,
  }: CrearEvaluacionProps) {
    return (
      <div>
        <h3 className="text-3xl font-medium mb-4">Crear Evaluación</h3>
        <hr className="mb-4 border-gray-300" />
        <div className="space-y-3">
          <label className="block font-medium mb-1">Pregunta 1</label>
          <input
            type="text"
            name="firstQuestion"
            placeholder="Escribe la pregunta"
            value={courseData.firstQuestion}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
          />
  
          <label className="block font-medium mb-1">Respuesta correcta</label>
          <textarea
            name="questionDescription"
            placeholder="Escribe la respuesta correcta"
            value={courseData.questionDescription}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
          />
        </div>
      </div>
    );
  }