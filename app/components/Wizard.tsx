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
import CourseViewTeacher from "../components/CourseViewTeacher";

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
    isPublic: false,
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
      const response = await fetch(`http://localhost:8081/media/upload`, {
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
      "Prebriefing", //"Aula Invertida",
      "Briefing", //"Taller de Habilidad",
      "Debriefing", //"Actividad Experiencial",
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
          </div>
        );
      case 2:
        return (
          <div>
            {activeCardId === null && (
              <>
                <h2 className="text-lg mb-3 font-semibold text-primary-40">Primer momento</h2>
                <h3 className="text-3xl mb-2 font-bold">Prebriefing</h3>
                <p className="mb-4 text-justify text-gray-600">
                  Este momento ayudará a los estudiantes a nivelarse teóricamente y a familiarizarse con los acuerdos que guiarán la simulación, de modo que estén preparados para lo que enfrentarán.
                </p>
                <hr className="mb-4 border-gray-300" />
                <p className="text-base text-gray-600 mb-2 text-justify">
                  Para este momento se recomienda crear en{" "}
                  <span className="bg-gray-200 px-2 py-1 rounded font-semibold whitespace-nowrap">
                    Subir contenido
                  </span> las siguientes secciones:
                </p>
                <ul className="list-disc pl-6 mb-2 text-gray-600">
                  <li>Material de Apoyo</li>
                  <li>Acuerdos</li>
                </ul>
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
                <h2 className="text-lg mb-3 font-semibold text-primary-40">Segundo momento</h2>
                <h3 className="text-3xl mb-2 font-bold">Briefing</h3>
                <p className="mb-4 text-justify text-gray-600">
                  Este momento ayudará a los estudiantes a comprender el contexto del caso clínico, la información necesaria sobre la situación que enfrentarán, las limitaciones de la simulación y el uso adecuado de los recursos.
                </p>
                <hr className="mb-4 border-gray-300" />
                <p className="text-base text-gray-600 mb-2 text-justify">
                  Para este momento se recomienda crear en{" "}
                  <span className="bg-gray-200 px-2 py-1 rounded font-semibold whitespace-nowrap">
                    Subir contenido
                  </span> las siguientes secciones:
                </p>
                <ul className="list-disc pl-6 mb-2 text-gray-600">
                  <li>Ficha Técnica</li>
                  <li>Protocolo de Uso del Simulador</li>
                </ul>
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
                <h2 className="text-lg mb-3 font-semibold text-primary-40">Tercer momento</h2>
                <h3 className="text-3xl mb-2 font-bold">Debriefing</h3>
                <p className="mb-4 text-justify text-gray-600">
                  Este momento ayudará a los estudiantes a consolidar los conocimientos adquiridos en la simulación, orientándolos sobre qué reflexionar y cómo aprovechar los recursos disponibles para profundizar en su aprendizaje.
                </p>
                <hr className="mb-4 border-gray-300" />
                <p className="text-base text-gray-600 mb-2 text-justify">
                  Para este momento en{" "}
                  <span className="bg-gray-200 px-2 py-1 rounded font-semibold whitespace-nowrap">
                    Subir simulación
                  </span> puedes optar por:
                </p>
                <ul className="list-disc pl-6 mb-2 text-gray-600">
                  <li><strong>Subir experiencia de navegador:</strong> permite que los estudiantes repitan la simulación varias veces y se familiaricen de manera natural con el caso clínico.</li>
                  <li><strong>Indicar que la simulación será presencial:</strong> los estudiantes podrán revisar las decisiones que tomaron una vez finalizada la actividad.</li>
                </ul>
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
          <div className="bg-white shadow-md rounded-xl p-6 md:p-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-3">Revisión del Curso</h3>
            <hr className="border-gray-200 mb-6" />
            <p className="text-base text-gray-600 mb-4 text-justify">
              Revisa cuidadosamente toda la información del curso como lo haría un estudiante.
            </p>
            <p className="text-base text-gray-600 mb-7 text-justify">
              Asegúrate de que todo esté correcto y cuando lo esté haz clic en{" "}
              <span className="bg-gray-200 px-2 py-1 rounded font-semibold whitespace-nowrap">
                Finalizar
              </span> para completar el proceso.
            </p>
            <div className="border border-gray-300 bg-gray-100 p-6 rounded-xl shadow-sm">
              <CourseViewTeacher
                course={courseData}
                onClose={() => { }}
              />
            </div>
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
