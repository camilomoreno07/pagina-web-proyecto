// components/Wizard.tsx
import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaPencilAlt,
  FaTrash,
} from "react-icons/fa";
import CardList from "../components/CardList";
import SegundoCardList from "../components/SegundoCardList";

interface WizardProps {
  course: any | null;
  onComplete: (data: any) => void;
  onCancel: () => void;
  beforeClassCards: Card[];
  duringClassCards: Card[];
  afterClassCards: Card[];
}

type CardList = {
  instruccionesCard: {
    activityName: string;
    activityDescription: string;
    instructionSteps: string[];
  };
  contenidoCard: {
    contenidos: {
      contentTitle: string;
      contentDescription: string;
      image: string | File | null; // Manejo flexible de imagen
    }[];
  };
  evaluaciónCard: {
    preguntas: {
      question: string;
      questionDescription: string;
    }[];
  };
};

const defaultCardList: CardList = {
  instruccionesCard: {
    activityName: "",
    activityDescription: "",
    instructionSteps: [],
  },
  contenidoCard: {
    contenidos: [
      {
        contentTitle: "",
        contentDescription: "",
        image: null,
      },
    ],
  },
  evaluaciónCard: {
    preguntas: [
      {
        question: "",
        questionDescription: "",
      },
    ],
  },
};


const Wizard = ({ course, onComplete, onCancel }: WizardProps) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [counter, setCounter] = useState<number>(0);
  const [courseData, setCourseData] = useState<any>({
    name: course ? course.courseName : "",
    description: course ? course.description || "" : "",
    activityName: course ? course.activityName || "" : "",
    activityDescription: course ? course.activityDescription || "" : "",
    contentTitle: course ? course.contentTitle || "" : "",
    contentDescription: course ? course.contentDescription || "" : "",
    isPublic: false,
    startDate: course ? course.startDate || "" : "",
    image: null,
    files: [],
    beforeClassCards: course.beforeClass,  // Asegura que no sea undefined
    duringClassCards: course.duringClass,
    afterClassCards: course.afterClass,
  });

  // Sincroniza el contador con el paso actual cada vez que cambie
  useEffect(() => {
    console.log("Wizard", setCourseData);
    setCounter(step);
  }, [step]);

  const setBeforeClassCards = (newBeforeClassCards: any) => {
    setCourseData((prevData) => ({
      ...prevData,
      beforeClassCards: newBeforeClassCards,
    }));
  };

  const setDuringClassCards = (newDuringClassCards: any) => {
    setCourseData((prevData) => ({
      ...prevData,
      duringClassCards: newDuringClassCards,
    }));
  };

  const setAfterClassCards = (newAfterClassCards: any) => {
    setCourseData((prevData) => ({
      ...prevData,
      afterClassCards: newAfterClassCards,
    }));
  };

  // Función para disminuir el contador
  const handleDecrease = () => {
    if (counter > 1) {
      setCounter(counter - 1);
    }
  };

  // Función para aumentar el contador
  const handleIncrease = () => {
    if (counter < 31) {
      setCounter(counter + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // Divide el nombre en partes (por ejemplo, "beforeClassCards.instruction.instructionTitle")
    const keys = name.split('.');
  
    // Función recursiva para actualizar el estado
    const updateNestedState = (obj: any, keys: string[], value: any): any => {
      const [currentKey, ...remainingKeys] = keys;
  
      if (remainingKeys.length === 0) {
        // Si no hay más claves, actualiza el valor
        return { ...obj, [currentKey]: value };
      }
  
      // Si hay más claves, sigue profundizando
      return {
        ...obj,
        [currentKey]: updateNestedState(obj[currentKey], remainingKeys, value),
      };
    };
  
    // Actualiza el estado usando la función recursiva
    setCourseData((prev) => updateNestedState(prev, keys, value));
  };
  

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCourseData({ ...courseData, image: file });
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete(courseData);
  };

  const handleCardClick = (id: number) => {
    console.log("Card clickeada:", id);
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

  const renderStepper = () => {
    const steps = [
      "Identificación del curso",
      "Antes de clase",
      "Durante la clase",
      "Después de la clase",
      "Revisión"
    ];

    return (
      <div className="flex flex-col items-center w-full mb-6">
        {/* Contenedor de los círculos y líneas */}
        <div className="flex items-center w-full relative">
          {steps.map((label, index) => {
            const isActive = step === index + 1;
            const isCompleted = step > index + 1;

            return (
              <div
                key={index}
                className={`flex items-center ${
                  index === steps.length - 1 ? "flex-none" : "flex-1"
                }`}
              >
                {/* Contenedor del círculo */}
                <div className="flex flex-col items-center relative">
                  {/* Icono del paso */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                      ${
                        isCompleted
                          ? "bg-primary-95 text-primary-40"
                          : isActive
                          ? "bg-primary-40 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {isCompleted ? "✔" : index + 1}
                  </div>

                  {/* Texto debajo del círculo */}
                  <span
                    className={`absolute top-12 text-sm font-medium text-center ${
                      step === index + 1 || step > index + 1
                        ? "text-gray-800"
                        : "text-gray-500"
                    } hidden md:block`} 
                    style={{
                      width: "100px", 
                      wordWrap: "break-word", 
                    }}
                  >
                    {label}
                  </span>
                </div>

                {/* Línea de conexión entre pasos, solo si NO es el último paso */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                      step > index + 1 ? "bg-primary-95" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
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
            <h2 className="text-lg mb-2 font-semibold">Primer momento</h2>
            <h3 className="text-3xl mb-2 font-medium">Antes de clase</h3>
            <p className="mb-4">
              Esto ayudará al estudiante para que lleve una idea de lo que verá
              en el encuentro presencial.
            </p>
            <hr className="mb-4 border-gray-300" />
            <p className="mb-4">
              Agregue los siguientes elementos al material que el estudiante
              debe consultar antes de clase.
            </p>
            <CardList
              courseData={courseData.beforeClassCards}
              setCourseData={setBeforeClassCards}
              handleInputChange={handleInputChange}
              name="beforeClassCards"
            />
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-lg mb-2 font-semibold">Segundo momento</h2>
            <h3 className="text-3xl mb-2 font-medium">Durante de clase</h3>
            <p className="mb-4">
              Esto ayudará al estudiante a guiarse durante los espacios de
              clase.
            </p>
            <hr className="mb-4 border-gray-300" />
            <p className="mb-4">
              Agregue los siguientes elementos al material que el estudiante
              debe consultar durante de clase.
            </p>
            <CardList
            courseData={courseData.duringClassCards} 
            setCourseData={setDuringClassCards}
            handleInputChange={handleInputChange}
            name="duringClassCards" 
            />
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-lg mb-2 font-semibold">Tercer momento</h2>
            <h3 className="text-3xl mb-2 font-medium">Después de clase</h3>
            <p className="mb-4">
              Esto ayudará al estudiante a guiarse durante los espacios de
              clase.
            </p>
            <hr className="mb-4 border-gray-300" />
            <p className="mb-4">
              Agregue los siguientes elementos al material que el estudiante
              debe consultar después de clase.
            </p>
            <CardList
            courseData={courseData.afterClassCards} 
            setCourseData={setAfterClassCards}
            handleInputChange={handleInputChange}
            />
          </div>
        );
      case 5:
        return <div>{/* Contenido del paso 5 */}</div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-6 max-w-5xl mx-auto w-full">
        <button onClick={onCancel} className="text-primary-40">
          &lt; Salir
        </button>
      </div>

      {/* Stepper */}
      <div className="mb-6 sm:mb-20 max-w-5xl mx-auto w-full">
        {renderStepper()}
      </div>

      {/* Contenido del Wizard */}
      <div className="max-w-5xl mx-auto w-full">{renderStep()}</div>

      {/* Footer del Wizard */}
      <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row justify-between mt-6 gap-4">
        {/* Botones Anterior y Siguiente */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 w-full sm:w-auto order-1 sm:order-2">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="w-full sm:w-auto px-4 py-2 border border-gray-500 text-gray-500 bg-white rounded hover:bg-gray-100"
            >
              Anterior
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={nextStep}
              className="w-full sm:w-auto px-4 py-2 bg-primary-40 hover:bg-primary-50 text-white rounded"
            >
              Siguiente
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
