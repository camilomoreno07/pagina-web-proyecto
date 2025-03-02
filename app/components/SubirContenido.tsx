// components/SubirContenido.tsx
import { useState } from "react";

interface SubirContenidoProps {
  courseData: {
    contentTitle: string;
    contentDescription: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SubirContenido({
  courseData,
  handleInputChange,
  handleFileUpload,
}: SubirContenidoProps) {
  const [showModal, setShowModal] = useState(false);
  const [counter, setCounter] = useState(1);

  const handleIncrease = () => {
    if (counter < 30) setCounter(counter + 1);
  };

  const handleDecrease = () => {
    if (counter > 1) setCounter(counter - 1);
  };

  const closeModal = () => {
    setShowModal(false);
    // Aquí puedes agregar lógica adicional al cerrar el modal
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Subir Contenido</h3>
      <hr className="mb-4 border-gray-300" />
      <div className="space-y-3">
        <label className="block font-medium mb-1">Título del contenido</label>
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
          placeholder="Dile a tus estudiantes de qué tratará este curso"
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
            <h2 className="text-xl mb-4 text-center">
              ¿Cuántos minutos aproximadamente demorará el estudiante en
              completar este módulo?
            </h2>

            <div className="flex items-center justify-center mb-4">
              <button
                onClick={handleDecrease}
                className="px-4 py-2 bg-gray-300 text-black rounded-l"
                disabled={counter <= 1}
              >
                -
              </button>
              <span className="px-6 py-2 text-lg">{counter}</span>
              <button
                onClick={handleIncrease}
                className="px-4 py-2 bg-gray-300 text-black rounded-r"
                disabled={counter >= 30}
              >
                +
              </button>
            </div>

            <p className="text-center mb-6">No pueden ser más de 30 minutos.</p>

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
}