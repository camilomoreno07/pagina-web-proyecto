// components/CrearInstrucciones.tsx
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

interface CrearInstruccionesProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  name: string;
}

export default function CrearInstrucciones({
  courseData,
  setCourseData,
  handleInputChange,
  name,
}: CrearInstruccionesProps) {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    console.log("CrearInstrucciones", courseData);
  }, [setCourseData]);

  const addStep = () => {
    const newSteps = [...(courseData.instructions?.steps || []), ""];
    setCourseData({
      ...courseData,
      instructions: {
        ...courseData.instructions,
        steps: newSteps,
      },
    });
    console.log("Añadir paso", courseData.instructions);
  };

  const removeStep = (index: number) => {
    const newSteps = courseData.instructions.steps.filter(
      (_, i) => i !== index
    );
    setCourseData({
      ...courseData,
      instructions: {
        ...courseData.instructions,
        steps: newSteps,
      },
    });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...courseData.instructions.steps];
    newSteps[index] = value;
    setCourseData({
      ...courseData,
      instructions: {
        ...courseData.instructions,
        steps: newSteps,
      },
    });
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Crear instrucciones</h3>
      <hr className="mb-4 border-gray-300" />
      <div className="space-y-3">
        <label className="block font-medium mb-1">Nombre de la actividad</label>
        <input
          type="text"
          name={`${name}.instructions.instructionTitle`}
          placeholder="¿Cómo se llamará el tema?"
          value={courseData.instructions.instructionTitle}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
        />

        <label className="block font-medium mb-1">
          Descripción de la actividad
        </label>
        <input
          type="text"
          name={`${name}.instructions.instructionDescription`}
          placeholder="Dile a tus estudiantes de qué tratará este módulo"
          value={courseData.instructions.instructionDescription}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
        />

        <label className="block font-medium mb-1">Tiempo de estudio</label>
        <div className="flex items-center mb-2">
          <button
            onClick={() =>
              setCourseData({
                ...courseData,
                instructions: {
                  ...courseData.instructions,
                  time: Math.max(1, courseData.instructions.time - 1),
                },
              })
            }
            className="px-4 py-2 bg-gray-300 text-black rounded-l"
          >
            -
          </button>
          <span className="px-6 py-2 text-lg">
            {courseData.instructions.time} min
          </span>
          <button
            onClick={() =>
              setCourseData({
                ...courseData,
                instructions: {
                  ...courseData.instructions,
                  time: Math.min(30, courseData.instructions.time + 1),
                },
              })
            }
            className="px-4 py-2 bg-gray-300 text-black rounded-r"
          >
            +
          </button>
        </div>

        <div>
          <label className="block font-medium mb-1">Paso a paso</label>
          {courseData.instructions?.steps?.map((step, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <span>{index + 1}.</span>
              <input
                type="text"
                placeholder={`Paso ${index + 1}`}
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="text-primary-40 hover:text-primary-50"
              >
                <FaTrash className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="mt-2 p-2 border-2 border-primary-40 text-primary-40 bg-white rounded-lg font-semibold flex items-center justify-center"
          >
            <span className="text-2xl leading-none">+</span> Agregar paso
          </button>
        </div>
      </div>
    </div>
  );
}
