import { useState, useEffect } from "react";
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
  courseData: any; // Estado del curso (puedes reemplazar "any" con una interfaz específica)
  setCourseData: (data: any) => void; 
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCardClick: (id: number) => void;
  onCancel: () => void;
  activeCardId: number | null
  name: string; 
}

export default function CardList({
  courseData,
  handleInputChange,
  setCourseData,
  onCardClick,
  onCancel,
  activeCardId,
  name
}: CardListProps) {

  useEffect(() => {
    console.log("Este es el courseData", courseData); // ✅ Imprime courseData
  }, [courseData]); // ✅ Usa courseData como dependencia

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Archivo subido:", file);
    }
  };


  const handleSave = () => {
    console.log("Datos guardados:", courseData);
    alert("Datos guardados correctamente");
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
