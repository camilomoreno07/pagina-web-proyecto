import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

interface SubirContenidoProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  name: string;
}

export default function SubirContenido({
  courseData,
  setCourseData,
  handleInputChange,
  name,
}: SubirContenidoProps) {
  // Estado local `contents` con las mismas propiedades que `courseData.contents`
  const [contents, setContents] = useState<
    {
      contentTitle: string;
      contentDescription: string;
      time: number;
      image: string | null;
      completed: boolean;
    }[]
  >([]);

  // Sincronizar `contents` con `courseData.contents` al cargar el componente
  useEffect(() => {
    if (courseData?.contents) {
      setContents(courseData.contents);
    }
  }, [courseData?.contents]);

  // Función para agregar un nuevo paso
  const addContent = () => {
    const newContent = {
      contentTitle: "",
      contentDescription: "",
      time: 1,
      image: null,
      completed: false,
    };

    // Actualizar `courseData.contents`
    const newCourseContents = [...(courseData?.contents || []), newContent];
    setCourseData({ ...courseData, contents: newCourseContents });

    // Actualizar el estado local `contents`
    setContents((prevContents) => [...prevContents, newContent]);
  };

  // Función para actualizar un contenido
  const updateContent = (index: number, field: string, value: any) => {
    const newContents = [...contents];
    newContents[index] = { ...newContents[index], [field]: value };

    // Si todos los campos están llenos, marcar como "completado"
    if (
      newContents[index].contentTitle &&
      newContents[index].contentDescription &&
      newContents[index].image
    ) {
      newContents[index].completed = true;
    }

    // Actualizar el estado local `contents`
    setContents(newContents);

    // Actualizar `courseData.contents`
    setCourseData({ ...courseData, contents: newContents });
  };

  // Función para eliminar un contenido
  const removeContent = (index: number) => {
    const newContents = contents.filter((_, i) => i !== index);

    // Actualizar el estado local `contents`
    setContents(newContents);

    // Actualizar `courseData.contents`
    setCourseData({ ...courseData, contents: newContents });
  };

  // Función para manejar la subida de imágenes
  const handleImageUpload = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateContent(index, "image", e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Subir Contenido</h3>
      <hr className="mb-4 border-gray-300" />
  
      {/* Renderizar los Bloques de Contenido Guardados */}
      {contents.map((content, index) => (
        <div
          key={index}
          className="p-4 border border-gray-300 rounded-lg mb-4 shadow relative"
        >
          {content.completed ? (
            // 🔹 Vista bloqueada cuando el contenido está lleno
            <div className="space-y-4">
              {/* Fila de título y botón de eliminar */}
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">{content.contentTitle}</h4>
                <button
                  onClick={() => removeContent(index)}
                  className="flex items-center gap-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={16} />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
  
              {/* Descripción y tiempo */}
              <p className="text-gray-600">{content.contentDescription}</p>
              <p className="text-sm text-gray-500">
                Tiempo: {content.time} min
              </p>
  
              {/* Imagen */}
              {content.image && (
                <div className="w-full">
                  <img
                    src={content.image}
                    alt="Vista previa"
                    className="w-full h-40 md:h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            // 🔹 Modo editable
            <div className="space-y-3">
              {/* Botón de eliminar en modo edición */}
              <button
                onClick={() => removeContent(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <FaTrash size={20} />
              </button>
  
              <label className="block font-medium mb-1">
                Título del contenido
              </label>
              <input
                type="text"
                placeholder="Título del contenido"
                value={content.contentTitle}
                onChange={(e) => updateContent(index, "contentTitle", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <label className="block font-medium mb-1">
                Descripción del contenido
              </label>
              <input
                type="text"
                placeholder="Descripción del contenido"
                value={content.contentDescription}
                onChange={(e) =>
                  updateContent(index, "contentDescription", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />
  
              <label className="block font-medium mb-1">
                Tiempo de estudio
              </label>
              <div className="flex items-center mb-2">
                <button
                  onClick={() =>
                    updateContent(
                      index,
                      "time",
                      Math.max(1, content.time - 1)
                    )
                  }
                  className="px-4 py-2 bg-gray-300 text-black rounded-l"
                >
                  -
                </button>
                <span className="px-6 py-2 text-lg">
                  {content.time} min
                </span>
                <button
                  onClick={() =>
                    updateContent(
                      index,
                      "time",
                      Math.min(30, content.time + 1)
                    )
                  }
                  className="px-4 py-2 bg-gray-300 text-black rounded-r"
                >
                  +
                </button>
              </div>
  
              {/* Imagen */}
              <label className="relative w-full sm:w-64 h-40 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                {content.image ? (
                  <div className="relative w-full h-full">
                    <img
                      src={content.image}
                      alt="Vista previa"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                      <FaEdit className="text-white text-3xl" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FaCloudUploadAlt className="text-gray-500 text-3xl mb-2" />
                    <span className="text-gray-600 text-sm">Subir imagen</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      ))}
  
      {/* Botón para agregar nuevo contenido */}
      <button
        type="button"
        onClick={addContent}
        className="mt-2 p-2 border-2 border-primary-40 text-primary-40 bg-white rounded-lg font-semibold flex items-center justify-center"
      >
        <FaPlus className="text-2xl leading-none mr-2" /> Agregar Contenido
      </button>
    </div>
  );
}