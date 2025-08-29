// components/CrearInstrucciones.tsx
"use client";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import NumberStepper from "./NumberStepper"; // ⬅️ importa el stepper

interface CrearInstruccionesProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  name: string;
  hasSimulation: boolean;
}

export default function CrearInstrucciones({
  courseData,
  setCourseData,
  handleInputChange,
  name,
  hasSimulation,
}: CrearInstruccionesProps) {
  const [step, setStep] = useState<number>(1);

  // ✅ observar courseData (no setCourseData)
  useEffect(() => {
    console.log("CrearInstrucciones", courseData);
  }, [courseData]);

  // asegúrate de tener estructura por defecto
  const instructions = courseData?.instructions ?? {
    instructionTitle: "",
    instructionDescription: "",
    time: 1,
    steps: [] as string[],
  };

  const addStep = () => {
    const newSteps = [...(instructions.steps || []), ""];
    setCourseData({
      ...courseData,
      instructions: { ...instructions, steps: newSteps },
    });
  };

  const removeStep = (index: number) => {
    const newSteps = (instructions.steps || []).filter((_, i) => i !== index);
    setCourseData({
      ...courseData,
      instructions: { ...instructions, steps: newSteps },
    });
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...(instructions.steps || [])];
    newSteps[index] = value;
    setCourseData({
      ...courseData,
      instructions: { ...instructions, steps: newSteps },
    });
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">
        {hasSimulation ? "Prebriefing" : "Crear instrucciones"}
      </h3>
      <hr className="mb-4 border-gray-300" />

      <div className="space-y-3">
        <label className="block font-medium mb-1">Nombre de la actividad</label>
        <input
          type="text"
          name={`${name}.instructions.instructionTitle`}
          placeholder="¿Cómo se llamará el tema?"
          value={instructions.instructionTitle}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
        />

        <label className="block font-medium mb-1">Descripción de la actividad</label>
        <textarea
          name={`${name}.instructions.instructionDescription`}
          placeholder="Dile a tus estudiantes de qué tratará este módulo"
          value={instructions.instructionDescription}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
          rows={3}
        />

        <label className="block font-medium mb-1">Tiempo de estudio</label>
        {/* ⬇️ Reemplazo del bloque -/+ por el componente reutilizable */}
        <NumberStepper
          value={Number(instructions.time ?? 1)}
          onChange={(next) =>
            setCourseData({
              ...courseData,
              instructions: { ...instructions, time: next },
            })
          }
          min={1}
          max={30}     // ⬅️ ajusta tu máximo aquí
          step={1}
          suffix="min"
          className="mb-2"
        />

        <div>
          <label className="block font-medium mb-1">Paso a paso</label>
          {(instructions.steps || []).map((s: string, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <span>{index + 1}.</span>
              <input
                type="text"
                placeholder={`Paso ${index + 1}`}
                value={s}
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
