"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck } from "react-icons/fa";

const CreateCourseWizard = ({ onClose }) => {
  const [step, setStep] = useState(1); // Paso actual del wizard
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    category: "",
    startDate: "",
    duration: "",
    difficulty: "beginner",
    image: null,
    files: [],
  });

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  // Manejar subida de archivos
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData({ ...courseData, image: file });
    }
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Enviar los datos del curso
  const handleSubmit = () => {
    console.log("Curso creado:", courseData);
    onClose(); // Cerrar el wizard después de enviar
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 lg:w-1/2">
        <h2 className="text-2xl font-bold mb-4">Crear Nuevo Curso</h2>

        {/* Paso 1: Información básica */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Paso 1: Información Básica</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nombre del curso"
                value={courseData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <textarea
                name="description"
                placeholder="Descripción del curso"
                value={courseData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="category"
                placeholder="Categoría"
                value={courseData.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        )}

        {/* Paso 2: Configuración del curso */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Paso 2: Configuración</h3>
            <div className="space-y-4">
              <input
                type="date"
                name="startDate"
                value={courseData.startDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="duration"
                placeholder="Duración (ej: 4 semanas)"
                value={courseData.duration}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
              <select
                name="difficulty"
                value={courseData.difficulty}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>
        )}

        {/* Paso 3: Subida de materiales */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Paso 3: Materiales</h3>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border rounded"
              />
              <p className="text-sm text-gray-600">
                Sube una imagen representativa del curso.
              </p>
            </div>
          </div>
        )}

        {/* Paso 4: Resumen y confirmación */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Paso 4: Resumen</h3>
            <div className="space-y-4">
              <p><strong>Nombre:</strong> {courseData.name}</p>
              <p><strong>Descripción:</strong> {courseData.description}</p>
              <p><strong>Categoría:</strong> {courseData.category}</p>
              <p><strong>Fecha de inicio:</strong> {courseData.startDate}</p>
              <p><strong>Duración:</strong> {courseData.duration}</p>
              <p><strong>Dificultad:</strong> {courseData.difficulty}</p>
              {courseData.image && (
                <p><strong>Imagen:</strong> {courseData.image.name}</p>
              )}
            </div>
          </div>
        )}

        {/* Controles del wizard */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Anterior
          </button>
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Siguiente
              <FaArrowRight className="inline-block ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Crear Curso
              <FaCheck className="inline-block ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourseWizard;