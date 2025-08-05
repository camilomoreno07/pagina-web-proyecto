import { useEffect } from "react";
import Cookies from "js-cookie";
import CrearInstrucciones from "./CrearInstrucciones";
import SubirContenido from "./SubirContenido";
import CrearEvaluacion from "./CrearEvaluacion";
import CrearExperiencia from "./CrearExperiencia";
import { FaCheckCircle } from "react-icons/fa";

interface CardListProps {
  courseId: string;
  course: any;
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onCardClick: (id: number) => void;
  onCancel: () => void;
  activeCardId: number | null;
  name: string;
}

export default function CardList({
  courseId,
  course,
  courseData,
  handleInputChange,
  setCourseData,
  onCardClick,
  onCancel,
  activeCardId,
  name,
}: CardListProps) {
  const getInstructionStatus = (instructions: any): boolean => {
    return (
      instructions?.instructionTitle?.trim() ||
      instructions?.instructionDescription?.trim() ||
      (Array.isArray(instructions?.steps) &&
        instructions.steps.some((s: string) => s.trim()))
    );
  };

  const getContentStatus = (contents: any[]): boolean =>
    Array.isArray(contents) && contents.length > 0;

  const getEvaluationStatus = (evaluations: any[]): boolean =>
    Array.isArray(evaluations) && evaluations.length > 0;

  const currentData = courseData;

  const cards = [
    {
      id: 1,
      title: "Crear instrucciones",
      isFilled: getInstructionStatus(currentData.instructions),
    },
    {
      id: 2,
      title: "Subir contenido",
      isFilled: getContentStatus(currentData.contents),
    },
    {
      id: 3,
      title: "Crear evaluación",
      isFilled: getEvaluationStatus(currentData.evaluations),
    },
  ];

  const handleSave = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      const updatedCourse = {
        ...course,
        [name]: courseData,
      };

      const response = await fetch(
        `http://localhost:8081/api/courses/${courseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedCourse),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to update course: ${response.statusText}`);

      console.log("Datos guardados:", updatedCourse);
      onCancel();
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      alert(
        `Error al guardar: ${
          error instanceof Error ? error.message : "Ocurrió un error"
        }`
      );
    }
  };

  return (
    <div className="p-2">
      {!activeCardId ? (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onCardClick(card.id)}
              className="flex-1 sm:w-auto px-4 py-3 border border-gray-300 text-black bg-white rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-bold">{card.title}</h2>
                <p
                  className={`text-sm px-2 py-1 rounded ${
                    card.isFilled
                      ? "text-green-700 bg-green-100"
                      : "text-gray-600 bg-gray-200"
                  } inline-block`}
                >
                  {card.isFilled ? "Completado" : "Pendiente"}
                </p>
              </div>
              <FaCheckCircle
                className={`text-xl ${
                  card.isFilled ? "text-blue-500" : "text-gray-400"
                }`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-2">
          {activeCardId === 1 ? (
            <CrearInstrucciones
              courseData={courseData}
              setCourseData={setCourseData}
              handleInputChange={handleInputChange}
              name={name}
            />
          ): activeCardId === 2 && name === "afterClass" ? ( // <-- SI ES afterClass CAMBIA
            <CrearExperiencia
              courseData={courseData}
              setCourseData={setCourseData}
              handleInputChange={handleInputChange}
              name={name}
            />
          ) : activeCardId === 2 ? (
            <SubirContenido
              courseData={courseData}
              setCourseData={setCourseData}
              handleInputChange={handleInputChange}
              name={name}
            />
          )  : (
            <CrearEvaluacion
              courseData={courseData}
              setCourseData={setCourseData}
              handleInputChange={handleInputChange}
              name={name}
            />
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-500 text-gray-500 bg-white rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-40 hover:bg-primary-50 text-white rounded"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
