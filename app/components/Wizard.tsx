"use client";
import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaPencilAlt,
  FaTrash,
} from "react-icons/fa";
import { Course, WizardData } from "../interfaces/Course";

interface WizardProps {
  course: Course | null;
  onComplete: (data: WizardData) => void;
  onCancel: () => void;
}

const Wizard = ({ course, onComplete, onCancel }: WizardProps) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [instructionSteps, setInstructionSteps] = useState([]);
  const [counter, setCounter] = useState<number>(0);
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

  // Sincroniza el contador con el paso actual cada vez que cambie
  useEffect(() => {
    setCounter(step);
  }, [step]);

  // Función para disminuir el contador
  // Función para disminuir el contador
  const handleDecrease = () => {
    if (counter > 1) { // Aseguramos que el contador no baje de 1
      setCounter(counter - 1);  // Decrementa el contador
    }
  };

  // Función para aumentar el contador
  const handleIncrease = () => {
    if (counter < 31) { // Aseguramos que el contador no suba de 4
      setCounter(counter + 1);  // Incrementa el contador
    }
  };

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

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (step === 3) {
      // Si estamos en el paso 3, mostramos el modal
      setShowModal(true);
    } else if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete(courseData);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowModal(false); // Cierra el modal y avanza al paso 4
    setStep(step + 1);
  };

  const renderStepper = () => {
    const steps = ["Información", "Actividad", "Contenido", "Finalizar"];

    return (
      <div className="flex items-center justify-between mb-6 w-full">
        {steps.map((label, index) => {
          const isActive = step === index + 1;
          const isCompleted = step > index + 1;

          return (
            <div
              key={index}
              className={`flex items-center ${
                index < steps.length - 1 ? "w-full" : ""
              }`}
            >
              {/* Icono del paso */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                  ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-primary-40 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
              >
                {isCompleted ? "✔" : index + 1}
              </div>

              {/* Línea de conexión entre pasos, solo si NO es el último paso */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 transition-all duration-300 mx-2 flex-1 ${
                    step > index + 1 ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            {/* Banner del curso */}
            <div className="w-full rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden relative group h-48">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Banner del curso"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No hay imagen
                </div>
              )}

              {/* Hover con lápiz siempre presente */}
              <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <div className="bg-white p-2 rounded-full shadow-lg">
                  <FaPencilAlt className="w-5 h-5 text-gray-700" />
                </div>
                {/* Input de archivo invisible pero funcional */}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Input oculto para cargar la imagen */}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Margen superior agregado al h3 */}
            <h3 className="text-3xl font-semibold mt-6 mb-4">
              Identificación del curso
            </h3>
            <hr className="mb-4 border-gray-300" />

            {/* Descripción del curso */}
            <label className="block font-medium mt-4 mb-1">
              Descripción del curso
            </label>
            <textarea
              name="description"
              placeholder="Dile a tus estudiantes de qué tratará este curso"
              value={courseData.description}
              onChange={(e) =>
                setCourseData({ ...courseData, description: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
            />

            {/* Privacidad */}
            <div className="flex items-center space-x-4 mt-4">
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
                    setCourseData({ ...courseData, isPublic: e.target.checked })
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
        );
      case 2:
        return (
          <div>
            <h3 className="text-3xl font-medium mb-4">Crear instrucciones</h3>
            <hr className="mb-4 border-gray-300" />
            <div className="space-y-3">
              <label className="block font-medium mb-1">
                Nombre de la actividad
              </label>
              <input
                type="text"
                name="activityName"
                placeholder="¿Como se llamará el tema?"
                value={courseData.activityName}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <label className="block font-medium mb-1">
                Descripción de la actividad
              </label>
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
      case 3:
        return (
          <div>
            <h3 className="text-3xl font-medium mb-4">Subir Contenido</h3>
            <hr className="mb-4 border-gray-300" />
            <div className="space-y-3">
              <label className="block font-medium mb-1">
                Titulo del contenido
              </label>
              <input
                type="text"
                name="contentTitle"
                placeholder="¿Cómo se llamará el tema?"
                value={courseData.contentTitle}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <label className="block font-medium mb-1">
                Descripción del contenido
              </label>
              <input
                type="text"
                name="contentDescription"
                placeholder="Dile a tus estudiantes de que tratará este curso"
                value={courseData.contentDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <label className="block font-medium mb-1">
                Sube el contenido de apoyo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            {/* Modal de confirmación */}
            {showModal && (
              <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-xs sm:max-w-sm md:max-w-md w-full">
                {/* Primer texto */}
                <h2 className="text-xl mb-4 text-center">
                  ¿Cuantos minutos aproximadamente demorará el estudiante en completar este módulo?
                </h2>
        
                {/* Contador con botones menos y más */}
                <div className="flex items-center justify-center mb-4">
                  <button
                    onClick={handleDecrease}
                    className="px-4 py-2 bg-gray-300 text-black rounded-l"
                    disabled={counter <= 1} // Deshabilita el botón cuando está en el paso 1
                  >
                    -
                  </button>
                  <span className="px-6 py-2 text-lg">{counter}</span>
                  <button
                    onClick={handleIncrease}
                    className="px-4 py-2 bg-gray-300 text-black rounded-r"
                    disabled={counter >= 30} // Deshabilita el botón cuando está en el paso 4
                  >
                    +
                  </button>
                </div>
        
                {/* Segundo texto */}
                <p className="text-center mb-6">
                  No pueden ser más de 30 minutos.
                </p>
        
                {/* Botones de Volver y Continuar */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded"
                  >
                    Volver
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        );

      case 4:
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
              <label className="block font-medium mb-1">
                Respuesta correcta
              </label>
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
    <div className="bg-white p-6">
      {/* Stepper */}
      <div className="mb-6 w-full">{renderStepper()}</div>

      {/* Contenido del Wizard */}
      <div className="max-w-2xl mx-auto w-full">{renderStep()}</div>

      {/* Footer del Wizard */}
      <div className="max-w-2xl mx-auto w-full flex flex-col sm:flex-row justify-between mt-6 gap-4">
        {/* Botón Cancelar (queda al inicio en web, al final en mobile) */}
        <div className="order-3 sm:order-1 w-full sm:w-auto">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 border border-primary-40 text-primary-40 bg-white rounded hover:bg-gray-100"
          >
            <FaTimes className="inline-block mr-2" />
            Cancelar
          </button>
        </div>

        {/* Botones Anterior y Siguiente */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 w-full sm:w-auto order-1 sm:order-2">
          {step > 1 && ( // Oculta el botón "Anterior" si está en el paso 1
            <button
              onClick={prevStep}
              className="w-full sm:w-auto px-4 py-2 border border-gray-500 text-gray-500 bg-white rounded hover:bg-gray-100"
            >
              <FaArrowLeft className="inline-block mr-2" />
              Anterior
            </button>
          )}
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
