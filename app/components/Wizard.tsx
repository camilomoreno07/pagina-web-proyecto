// components/Wizard.tsx
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
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
}

type QuestionType = "OPEN" | "MC3" | "MC5";

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
      imageUrl: string | File | null;
    }[];
  };
  evaluaciónCard: {
    preguntas: {
      // campos nuevos necesarios para persistir correctamente
      questionType: QuestionType;      // "OPEN" | "MC3" | "MC5"
      question: string;
      correctAnswer: string;            // si es MC*, debe coincidir con options
      time: number;                     // minutos (1..30)
      options?: string[];               // presente solo en MC3/MC5
      // si usas esto, consérvalo:
      questionDescription?: string;
      // opcionalmente un id local si lo necesitas para el UI:
      id?: string;
    }[];
  };
};


const Wizard = ({ course, onComplete, onCancel }: WizardProps) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [counter, setCounter] = useState<number>(0);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [courseData, setCourseData] = useState<any>({
    id: course ? course.courseId : "",
    courseName: course ? course.courseName || "" : "",
    courseDescription: course ? course.courseDescription || "" : "",
    professorIds: course ? course.professorIds || [] : [],
    studentIds: course ? course.studentIds || [] : [],
    activityName: course ? course.activityName || "" : "",
    activityDescription: course ? course.activityDescription || "" : "",
    contentTitle: course ? course.contentTitle || "" : "",
    contentDescription: course ? course.contentDescription || "" : "",
    isPublic: course ? course.isPublic || "" : "",
    startDate: course ? course.startDate || "" : "",
    imageUrl: course ? course.imageUrl || "" : "",
    files: [],
    beforeClass: course.beforeClass, // Asegura que no sea undefined
    duringClass: course.duringClass,
    afterClass: course.afterClass,
    teacherName: course ? course.teacherName : "",
    teacherTitle: course ? course.teacherTitle : "",
    teacherEmail: course ? course.teacherEmail : "",
  });

  useEffect(() => {
    if (courseData.imageUrl) {
      loadProtectedImage(courseData.imageUrl);
    }
  }, [courseData.imageUrl]);

  const setbeforeClass = (newbeforeClass: any) => {
    setCourseData((prevData) => ({
      ...prevData,
      beforeClass: newbeforeClass,
    }));
  };

  const setduringClass = (newduringClass: any) => {
    setCourseData((prevData) => ({
      ...prevData,
      duringClass: newduringClass,
    }));
  };

  const setafterClass = (newafterClass: any) => {
    setCourseData((prevData) => ({
      ...prevData,
      afterClass: newafterClass,
    }));
  };

  const isStepValid = (): boolean => {
    const validateMoment = (moment: any) => {
      return (
        getInstructionStatus(moment.instructions) === "completo" &&
        getContentStatus(moment.contents) === "completo" &&
        getEvaluationStatus(moment.evaluations) === "completo"
      );
    };

    if (step === 2) return validateMoment(courseData.beforeClass);
    if (step === 3) return validateMoment(courseData.duringClass);
    if (step === 4) return validateMoment(courseData.afterClass);
    return true; // Paso 1 y 5 no tienen validación
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Divide el nombre en partes (por ejemplo, "beforeClass.instruction.instructionTitle")
    const keys = name.split(".");

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

  const getInstructionStatus = (instructions: any): string => {
    return instructions?.instructionTitle?.trim() ||
      instructions?.instructionDescription?.trim() ||
      (Array.isArray(instructions?.steps) &&
        instructions.steps.some((s: string) => s.trim()))
      ? "completo"
      : "pendiente";
  };

  const getContentStatus = (contents: any[]): string =>
    Array.isArray(contents) && contents.length > 0 ? "completo" : "pendiente";

  const getEvaluationStatus = (evaluations: any[]): string =>
    Array.isArray(evaluations) && evaluations.length > 0
      ? "completo"
      : "pendiente";

  // Avanzar al siguiente paso
  const nextStep = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token found");

      // ⬇️ Si hay imagen, la subimos al backend primero
      if (courseData.image instanceof File) {
        const uploadResult = await uploadImageToBackend(courseData.image);
        if (!uploadResult) throw new Error("Error uploading image");

        // Guardar la URL o path del archivo en el objeto courseData
        courseData.image = uploadResult; // o extrae solo el path si tu backend lo devuelve así
      }

      const momentStatus = {
        beforeClass: {
          instructions: getInstructionStatus(
            courseData.beforeClass.instructions
          ),
          contents: getContentStatus(courseData.beforeClass.contents),
          evaluations: getEvaluationStatus(courseData.beforeClass.evaluations),
        },
        duringClass: {
          instructions: getInstructionStatus(
            courseData.duringClass.instructions
          ),
          contents: getContentStatus(courseData.duringClass.contents),
          evaluations: getEvaluationStatus(courseData.duringClass.evaluations),
        },
        afterClass: {
          instructions: getInstructionStatus(
            courseData.afterClass.instructions
          ),
          contents: getContentStatus(courseData.afterClass.contents),
          evaluations: getEvaluationStatus(courseData.afterClass.evaluations),
        },
      };

      courseData.momentStatus = momentStatus;

      const response = await fetch(
        `http://localhost:8081/api/courses/${courseData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to update course: ${response.statusText}`);
      console.log("Datos guardados:", courseData);

      // Avanza al siguiente paso si todo fue bien
      if (step < 5) setStep(step + 1);
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      alert(
        `Error al guardar: ${error instanceof Error ? error.message : "Ocurrió un error"
        }`
      );
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    onComplete(courseData);
  };

  const handleCardClick = (id: number) => {
    setActiveCardId(id); // Ahora sí activamos la vista de la card seleccionada
  };

  const handleCancel = () => {
    setActiveCardId(null); // Regresar a la lista de tarjetas
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previousUrl = courseData.imageUrl;

    // Vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Guardamos el File para que nextStep lo detecte
    setCourseData((prev) => ({
      ...prev,
      image: file,
    }));

    // Subida al backend
    const uploadResult = await uploadImageToBackend(file);
    if (uploadResult) {
      setCourseData((prev) => ({
        ...prev,
        imageUrl: uploadResult,
      }));

      // Eliminar la imagen anterior si existe y es URL válida
      if (previousUrl && previousUrl.includes("/media/files/")) {
        const token = Cookies.get("token");
        const filename = previousUrl.split("/media/files/")[1];

        await fetch(`http://localhost:8081/media/files/${filename}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => {
          if (!res.ok) console.warn("No se pudo eliminar la imagen anterior");
        });
      }
    } else {
      alert("Error al subir imagen");
    }
  };

  const uploadImageToBackend = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = Cookies.get("token");

    try {
      const response = await fetch("http://localhost:8081/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json(); // { url: "/media/files/nombre.jpg" }
      return `http://localhost:8081/media/files/${result.url}`;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }
  };

  const loadProtectedImage = async (url: string) => {
    const token = Cookies.get("token");
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Error cargando imagen protegida");
      return;
    }

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    setPreviewImage(objectURL); // esto lo puedes usar en <img src={previewImage} />
  };

  const renderStepper = () => {
    const steps = [
      "Identificación del curso",
      "Aula Invertida",
      "Taller de Habilidad",
      "Actividad Experiencial",
      "Revisión",
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
                className={`flex items-center ${index === steps.length - 1 ? "flex-none" : "flex-1"
                  }`}
              >
                {/* Contenedor del círculo */}
                <div className="flex flex-col items-center relative">
                  {/* Icono del paso */}
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300
                      ${isCompleted
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
                    className={`absolute top-12 text-sm font-medium text-center ${step === index + 1 || step > index + 1
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
                    className={`h-1 flex-1 mx-2 transition-all duration-300 ${step > index + 1 ? "bg-primary-95" : "bg-gray-300"
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
              {previewImage || courseData.imageUrl ? (
                <img
                  src={previewImage || courseData.imageUrl}
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
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>

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
              value={courseData.courseDescription}
              onChange={(e) =>
                setCourseData({
                  ...courseData,
                  courseDescription: e.target.value,
                })
              }
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              rows={3}
            />

            {/* Privacidad */}
            <div className="flex flex-col mt-4">
              <label htmlFor="privacy-switch" className="text-gray-700 mb-2">
                Tipo de curso
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="isPublic"
                    id="privacy-switch"
                    checked={courseData.isPublic}
                    onChange={(e) =>
                      setCourseData({
                        ...courseData,
                        isPublic: e.target.checked
                      })
                    }
                    className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-2 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out ${courseData.isPublic ? "translate-x-4" : "translate-x-0"
                      }`}
                    aria-checked={courseData.isPublic}
                    aria-labelledby="privacy-label"
                  />
                  <div
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${courseData.isPublic ? "bg-green-500" : "bg-gray-300"
                      }`}
                    id="privacy-label"
                  ></div>
                </div>
                <span className="text-gray-700">
                  {courseData.isPublic ? "Escenario Simulado" : "Tradicional"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {courseData.isPublic
                  ? "Este curso incluirá componentes de simulación."
                  : "Este curso no incluirá componentes de simulación."}
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            {activeCardId === null && (
              <>
                <h2 className="text-lg mb-2 font-semibold">Primer momento</h2>
                <h3 className="text-3xl mb-2 font-medium">Aula Invertida</h3>
                <p className="mb-4">
                  Esto ayudará al estudiante para que lleve una idea de lo que
                  verá en el encuentro presencial.
                </p>
                <hr className="mb-4 border-gray-300" />
                <p className="mb-2">
                  Agregue los siguientes elementos al material que el estudiante
                  debe consultar antes de clase.
                </p>
              </>
            )}
            <CardList
              activeCardId={activeCardId}
              onCardClick={handleCardClick}
              onCancel={handleCancel}
              courseId={courseData.id}
              course={courseData}
              handleInputChange={handleInputChange}
              name="beforeClass"
              courseData={courseData.beforeClass}
              setCourseData={setbeforeClass}
            />
          </div>
        );
      case 3:
        return (
          <div>
            {activeCardId === null && (
              <>
                <h2 className="text-lg mb-2 font-semibold">Segundo momento</h2>
                <h3 className="text-3xl mb-2 font-medium">Taller de Habilidad</h3>
                <p className="mb-4">
                  Esto ayudará al estudiante a guiarse durante los espacios de
                  clase.
                </p>
                <hr className="mb-4 border-gray-300" />
                <p className="mb-4">
                  Agregue los siguientes elementos al material que el estudiante
                  debe consultar durante de clase.
                </p>
              </>
            )}
            <CardList
              activeCardId={activeCardId}
              onCardClick={handleCardClick}
              onCancel={handleCancel}
              courseId={courseData.id}
              course={courseData}
              handleInputChange={handleInputChange}
              name="duringClass"
              courseData={courseData.duringClass}
              setCourseData={setduringClass}
            />
          </div>
        );
      case 4:
        return (
          <div>
            {activeCardId === null && (
              <>
                <h2 className="text-lg mb-2 font-semibold">Tercer momento</h2>
                <h3 className="text-3xl mb-2 font-medium">Actividad Experiencial</h3>
                <p className="mb-4">
                  Esto ayudará al estudiante a afianzar los conceptos vistos en
                  clase.
                </p>
                <hr className="mb-4 border-gray-300" />
                <p className="mb-4">
                  Agregue los siguientes elementos al material que el estudiante
                  debe consultar después de clase.
                </p>
              </>
            )}
            <CardList
              activeCardId={activeCardId}
              onCardClick={handleCardClick}
              onCancel={handleCancel}
              courseId={courseData.id}
              course={courseData}
              handleInputChange={handleInputChange}
              name="afterClass"
              courseData={courseData.afterClass}
              setCourseData={setafterClass}
            />
          </div>
        );
      case 5:
        return (
          <div>
            <h3 className="text-3xl font-semibold mb-4">Revisión del Curso</h3>
            <hr className="mb-4 border-gray-300" />

            {/* Imagen del curso */}
            <div className="w-full rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden h-48 mb-6">
              {previewImage || courseData.imageUrl ? (
                <img
                  src={previewImage || courseData.imageUrl}
                  alt="Imagen del curso"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-500">No hay imagen cargada</span>
              )}
            </div>

            {/* Datos básicos */}
            <div className="mb-6">
              <p>
                <strong>Nombre:</strong> {courseData.courseName}
              </p>
              <p>
                <strong>Descripción:</strong> {courseData.courseDescription}
              </p>
              <p>
                <strong>Tipo de curso:</strong>{" "}
                {courseData.isPublic ? "Escenario Simulado" : "Tradicional"}
              </p>
            </div>

            {/* Resumen de los momentos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-bold mb-2">Aula Invertida</h4>
                <p>
                  Instrucciones:{" "}
                  {courseData.beforeClass.instructions.instructionTitle ||
                    "Sin título"}
                </p>
                <p>Pasos:{" "}{courseData.beforeClass.instructions.steps.length}</p>
                <p>
                  Contenidos:{" "}
                  {courseData.beforeClass?.contents?.[0]?.contentTitle === "NA"
                    ? " 0"
                    : courseData.beforeClass?.contents?.length || 0}
                </p>
                <p>
                  Evaluaciones:{" "}
                  {courseData.beforeClass?.evaluations?.[0]?.question === "NA"
                    ? " 0"
                    : courseData.beforeClass?.evaluations?.length || 0}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-bold mb-2">Taller de Habilidad</h4>
                <p>
                  Instrucciones:{" "}
                  {courseData.duringClass.instructions.instructionTitle ||
                    "Sin título"}
                </p>
                <p>Pasos:{" "}{courseData.duringClass.instructions.steps.length}</p>
                <p>
                  Contenidos:{" "}
                  {courseData.duringClass?.contents?.[0]?.contentTitle === "NA"
                    ? " 0"
                    : courseData.duringClass?.contents?.length || 0}
                </p>
                <p>
                  Evaluaciones:{" "}
                  {courseData.duringClass?.evaluations?.[0]?.question === "NA"
                    ? " 0"
                    : courseData.duringClass?.evaluations?.length || 0}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-bold mb-2">Actividad Experiencial</h4>
                <p>
                  Instrucciones:{" "}
                  {courseData.afterClass.instructions.instructionTitle ||
                    "Sin título"}
                </p>
                <p>Pasos:{" "}{courseData.afterClass.instructions.steps.length}</p>
                <p>
                  Contenidos:{" "}
                  {courseData.afterClass?.contents?.[0]?.contentTitle === "NA"
                    ? " 0"
                    : courseData.afterClass?.contents?.length || 0}
                </p>
                <p>
                  Evaluaciones:{" "}
                  {courseData.afterClass?.evaluations?.[0]?.question === "NA"
                    ? " 0"
                    : courseData.afterClass?.evaluations?.length || 0}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Revisa la información. Si todo está correcto, haz clic en "Crear
              Curso".
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-2">
      <div className="mb-6 max-w-5xl mx-auto w-full">
        <button onClick={onCancel} className="text-primary-40">
          <span className="text-base">←</span> Salir
        </button>
      </div>

      {/* Stepper (se oculta si hay una tarjeta activa) */}
      {activeCardId === null && (
        <div className="mb-6 sm:mb-20 max-w-5xl mx-auto w-full">
          {renderStepper()}
        </div>
      )}

      {/* Contenido del Wizard */}
      <div className="max-w-5xl mx-auto w-full">{renderStep()}</div>

      {/* Footer del Wizard (se oculta si hay una tarjeta activa) */}
      {activeCardId === null && (
        <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row justify-end mt-6 gap-4">
          {/* Botones Anterior y Siguiente */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 w-full sm:w-auto">
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
                disabled={!isStepValid()}
                className={`w-full sm:w-auto px-4 py-2 rounded text-white transition ${isStepValid()
                  ? "bg-primary-40 hover:bg-primary-50"
                  : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-4 py-2 bg-primary-40 hover:bg-primary-50 text-white rounded"
              >
                Finalizar
                <FaCheck className="inline-block ml-2" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wizard;
