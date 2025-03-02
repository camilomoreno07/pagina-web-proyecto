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
  name: string; 
}

export default function CardList({
  courseData,
  handleInputChange,
  setCourseData,
  name
}: CardListProps) {

  useEffect(() => {
    console.log("Este es el courseData", courseData); // ✅ Imprime courseData
  }, [courseData]); // ✅ Usa courseData como dependencia


  const [activeCardId, setActiveCardId] = useState<number | null>(null);

  const handleCardClick = (id: number) => {
    setActiveCardId(id); // Ahora sí activamos la vista de la card seleccionada
  };

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

  const handleCancel = () => {
    setActiveCardId(null); // Regresar a la lista de tarjetas
  };

  const cards = [
    { id: 1, title: "Crear instrucciones", status: "Pendiente", isFilled: false },
    { id: 2, title: "Subir contenido", status: "Pendiente", isFilled: false },
    { id: 3, title: "Crear evaluación", status: "Pendiente", isFilled: false },
  ];



  return (
    <div className="p-4">
      {/* Mostrar la lista de tarjetas si no hay una activa */}
      {!activeCardId ? (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="flex-1 sm:w-auto px-4 py-2 border border-gray-300 text-black bg-white rounded hover:bg-gray-100 cursor-pointer"
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
              handleInputChange={handleInputChange}
              handleFileUpload={handleFileUpload}
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
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-500 text-gray-500 bg-white rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
