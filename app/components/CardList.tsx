import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import CrearInstrucciones from "./CrearInstrucciones";
import SubirContenido from "./SubirContenido";
import CrearEvaluacion from "./CrearEvaluacion";

interface Card {
  id: number;
  title: string;
  status: string;
  isFilled: boolean;
}

interface CardListProps {
  courseId: string;
  course: any;
  courseData: any; // Estado del curso (puedes reemplazar "any" con una interfaz específica)
  setCourseData: (data: any) => void; 
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCardClick: (id: number) => void;
  onCancel: () => void;
  activeCardId: number | null
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
  name
}: CardListProps) {

  useEffect(() => {
    console.log("Este es el course", course); // ✅ Imprime courseData
  }, [courseData]); // ✅ Usa courseData como dependencia

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Archivo subido:", file);
    }
  };


  const handleSave = async () => {
    try {
        const token = Cookies.get("token");
        if (!token) {
            throw new Error("No token found");
        }

        // Combina el objeto `course` con `courseData` en la propiedad especificada por `name`
        const updatedCourse = {
            ...course, // Copia todas las propiedades de `course`
            [name]: courseData, // Asigna `courseData` a la propiedad con el nombre de `name`
        };

        // Imprime el cuerpo (body) antes de enviarlo
        console.log("Datos a enviar:", updatedCourse);

        const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedCourse), // Envía el objeto combinado
        });

        if (!response.ok) {
            throw new Error(`Failed to update course: ${response.statusText}`);
        }

        console.log("Datos guardados:", updatedCourse);
        // Restablece el activeCardId a null después de guardar
        onCancel();
    } catch (error) {
        console.error("Error al guardar el curso:", error);
        alert(`Error al guardar: ${error instanceof Error ? error.message : "Ocurrió un error"}`);
    }
};
  
  

  const cards = [
    { id: 1, title: "Crear instrucciones", status: "Pendiente", isFilled: false },
    { id: 2, title: "Subir contenido", status: "Pendiente", isFilled: false },
    { id: 3, title: "Crear evaluación", status: "Pendiente", isFilled: false },
  ];



  return (
    <div className="p-2">
      {/* Mostrar la lista de tarjetas si no hay una activa */}
      {!activeCardId ? (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => onCardClick(card.id)}
              className="flex-1 sm:w-auto px-4 py-2 border border-gray-300 text-black bg-white rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold">{card.title}</h2>
                  <p className="text-sm text-gray-500">{card.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Mostrar el contenido correspondiente a la tarjeta activa
        <div className="py-2">
          {activeCardId === 1 ? (
            <CrearInstrucciones
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
              handleFileUpload={handleFileUpload}
              name={name}
            />
          ) : (
            <CrearEvaluacion
              courseData={courseData}
              handleInputChange={handleInputChange}
            />
          )}

          {/* Botones de Guardar y Cancelar */}
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
