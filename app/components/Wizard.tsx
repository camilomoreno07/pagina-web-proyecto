"use client";
import { useState } from "react";
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes } from "react-icons/fa";
import { Course, WizardData } from "../interfaces/Course";

interface WizardProps {
  course: Course | null;
  onComplete: (data: WizardData) => void;
  onCancel: () => void;
}

const Wizard = ({ course, onComplete, onCancel }: WizardProps) => {
  const [step, setStep] = useState<number>(1);
  const [instructionSteps, setInstructionSteps] = useState([]);
  const [courseData, setCourseData] = useState<WizardData>({
    name: course ? course.courseName : "",
    description: course ? course.description || "" : "",
    activityName: course ? course.activityName || "" : "",
    activityDescription: course ? course.activityDescription || "" : "",
    contentTitle: course ? course.contentTitle || "" : "",
    contentDescription: course ? course.contentDescription || "" : "",
    firstQuestion: course ? course.firstQuestion || "" : "",
    questionDescription: course ? course.questionDescription || "" : "",
    isPublic: false,
    category: course ? course.category || "" : "",
    startDate: course ? course.startDate || "" : "",
    duration: course ? course.duration || "" : "",
    difficulty: course ? course.difficulty || "beginner" : "beginner",
    image: null,
    files: [],
  });

  const addStep = () => {
    setInstructionSteps([...instructionSteps, ""]);
  };

  const removeStep = (index) => {
    setInstructionSteps((prevSteps) => prevSteps.filter((_, i) => i !== index));
  };
  

  const updateStep = (index, value) => {
    const newSteps = [...instructionSteps];
    newSteps[index] = value;
    setInstructionSteps(newSteps);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCourseData({ ...courseData, image: file });
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete(courseData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-3xl font-semibold mb-4">
              Identificación del curso
            </h3>
            <hr className="mb-4 border-gray-300"/>
            <div className="space-y-3">
              {/*<input
                type="text"
                name="name"
                placeholder="Nombre del curso"
                value={courseData.name}
                onChange={handleInputChange} 
                className="w-full p-2 border rounded"
              />*/}
              <label className="block font-medium mb-1">Descripción del curso</label>
              <textarea
                name="description"
                placeholder="Dile a tus estudiantes de que tratará este curso"
                value={courseData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <div className="flex items-center space-x-4">
                <label htmlFor="privacy-switch" className="text-gray-700">
                  Privacidad del Curso
                </label>
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="isPublic"
                    id="privacy-switch"
                    checked={courseData.isPublic}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        isPublic: e.target.checked,
                      })
                    }
                    className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out ${
                      courseData.isPublic ? "translate-x-4" : "translate-x-0"
                    }`}
                    aria-checked={courseData.isPublic}
                    aria-labelledby="privacy-label"
                  />
                  <div
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      courseData.isPublic ? "bg-green-500" : "bg-gray-300"
                    }`}
                    id="privacy-label"
                  ></div>
                </div>
                <span className="text-gray-700">
                  {courseData.isPublic ? "Público" : "Privado"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {courseData.isPublic
                  ? "Este curso se visualizará en la biblioteca pública."
                  : "Este curso no será visible en la biblioteca pública."}
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-3xl font-medium mb-4">Crear instrucciones</h3>
            <hr className="mb-4 border-gray-300"/>
            <div className="space-y-3">
              <label className="block font-medium mb-1">Nombre de la actividad</label>
              <input
                type="text"
                name="activityName"
                placeholder="¿Como se llamará el tema?"
                value={courseData.activityName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              
              <label className="block font-medium mb-1">Descripción de la actividad</label>
              <input
                type="text"
                name="activityDescription"
                placeholder="Dile a tus estudiantes de que tratará este módulo"
                value={courseData.activityDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              
              <div>
                <label className="block font-medium mb-1">Paso a paso</label>
                {instructionSteps.map((step, index) => (
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
                className="p-2 bg-red-500 text-white rounded-lg"
              >
                ×
              </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
                >
                  + Agregar paso
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-3xl font-medium mb-4">Subir Contenido</h3>
            <hr className="mb-4 border-gray-300"/>
            <div className="space-y-3">
            <label className="block font-medium mb-1">Titulo del contenido</label>
            <input
                type="text"
                name="contentTitle"
                placeholder="¿Cómo se llamará el tema?"
                value={courseData.contentTitle}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <label className="block font-medium mb-1">Descripción del contenido</label>
              <input
                type="text"
                name="contentDescription"
                placeholder="Dile a tus estudiantes de que tratará este curso"
                value={courseData.contentDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <label className="block font-medium mb-1">Sube el contenido de apoyo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h3 className="text-3xl font-medium mb-4">Crear Evaluación</h3>
            <hr className="mb-4 border-gray-300"/>
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
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/*<h2 className="text-2xl font-bold mb-4">Crear Nuevo Curso</h2>*/}
      {renderStep()}
      <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
        <div className="w-full sm:w-auto">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            <FaTimes className="inline-block mr-2" />
            Volver a Cursos
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="w-full sm:w-auto px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
          >
            <FaArrowLeft className="inline-block mr-2" />
            Anterior
          </button>
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="w-full sm:w-auto px-4 py-2 bg-primary-40 hover:bg-primary-50 text-white rounded"
            >
              Siguiente
              <FaArrowRight className="inline-block ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
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

export default Wizard;
