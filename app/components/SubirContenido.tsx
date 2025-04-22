import { useState, useEffect } from "react";
import { FaCloudUploadAlt, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Cookies from "js-cookie";

interface SubirContenidoProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  name: string;
}

export default function SubirContenido({
  courseData,
  setCourseData,
  handleInputChange,
}: SubirContenidoProps) {
  const [contents, setContents] = useState<
    {
      contentTitle: string;
      contentDescription: string;
      time: number;
      imageUrl: string | null;
      completed: boolean;
    }[]
  >([]);

  const [images, setImages] = useState<Record<string, string>>({});

  /* ---------- carga inicial ---------- */
  useEffect(() => {
    if (courseData?.contents) {
      setContents(courseData.contents);
      courseData.contents.forEach((c: any) => {
        if (typeof c.imageUrl === "string" && c.imageUrl.startsWith("http")) {
          loadProtectedImage(c.imageUrl);
        }
      });
    }
  }, [courseData?.contents]);

  /* ---------- helpers backend ---------- */
  const deleteImageFromBackend = async (url?: string | null) => {
    if (!url || !url.includes("/media/files/")) return;
    const filename = url.split("/media/files/")[1];
    try {
      await fetch(`http://localhost:8081/media/files/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
    } catch {
      console.warn("No se pudo eliminar la imagen:", filename);
    }
  };

  const uploadImageToBackend = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8081/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      return `http://localhost:8081${result.url}`;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }
  };

  const loadProtectedImage = async (url: string) => {
    if (images[url]) return;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${Cookies.get("token")}` },
    });
    if (!r.ok) return;
    const blob = await r.blob();
    setImages((p) => ({ ...p, [url]: URL.createObjectURL(blob) }));
  };

  /* ---------- mutaciones ---------- */
  const addContent = () => {
    const newContent = {
      contentTitle: "",
      contentDescription: "",
      time: 1,
      imageUrl: null,
      completed: false,
    };
    const updated = [...(courseData?.contents || []), newContent];
    setCourseData({ ...courseData, contents: updated });
    setContents(updated);
  };

  const updateContent = (idx: number, field: string, value: any) => {
    const next = [...contents];
    next[idx] = { ...next[idx], [field]: value };
    next[idx].completed =
      !!next[idx].contentTitle &&
      !!next[idx].contentDescription &&
      !!next[idx].imageUrl;
    setCourseData({ ...courseData, contents: next });
    setContents(next);
  };

  const removeContent = async (idx: number) => {
    await deleteImageFromBackend(contents[idx].imageUrl);
    const next = contents.filter((_, i) => i !== idx);
    setCourseData({ ...courseData, contents: next });
    setContents(next);
  };

  const handleImageUpload = async (
    idx: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const prevUrl = contents[idx].imageUrl;
    const url = await uploadImageToBackend(file);
    if (url) {
      await deleteImageFromBackend(prevUrl);
      updateContent(idx, "imageUrl", url);
    } else alert("Error al subir imagen");
  };

  /* ---------- render (sin cambios visuales) ---------- */
  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Subir Contenido</h3>
      <hr className="mb-4 border-gray-300" />

      {contents.map((c, i) => (
        <div
          key={i}
          className="p-4 border border-gray-300 rounded-lg mb-4 shadow relative"
        >
          {c.completed ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">{c.contentTitle}</h4>
                <button
                  onClick={() => removeContent(i)}
                  className="flex items-center gap-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={16} />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>

              <p className="text-gray-600">{c.contentDescription}</p>
              <p className="text-sm text-gray-500">Tiempo: {c.time} min</p>

              {c.imageUrl && (
                <div className="w-full">
                  <img
                    src={images[c.imageUrl] || c.imageUrl}
                    alt="Vista previa"
                    className="w-full h-40 md:h-48 object-cover rounded-lg"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => removeContent(i)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <FaTrash size={20} />
              </button>

              <label className="block font-medium mb-1">Título del contenido</label>
              <input
                type="text"
                value={c.contentTitle}
                onChange={(e) => updateContent(i, "contentTitle", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <label className="block font-medium mb-1">
                Descripción del contenido
              </label>
              <input
                type="text"
                value={c.contentDescription}
                onChange={(e) =>
                  updateContent(i, "contentDescription", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
              />

              <label className="block font-medium mb-1">Tiempo de estudio</label>
              <div className="flex items-center mb-2">
                <button
                  onClick={() =>
                    updateContent(i, "time", Math.max(1, c.time - 1))
                  }
                  className="px-4 py-2 bg-gray-300 text-black rounded-l"
                >
                  -
                </button>
                <span className="px-6 py-2 text-lg">{c.time} min</span>
                <button
                  onClick={() =>
                    updateContent(i, "time", Math.min(30, c.time + 1))
                  }
                  className="px-4 py-2 bg-gray-300 text-black rounded-r"
                >
                  +
                </button>
              </div>

              <label className="relative w-full sm:w-64 h-40 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                {c.imageUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={images[c.imageUrl] || c.imageUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => (e.currentTarget.style.display = "none")}
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
                  onChange={(e) => handleImageUpload(i, e)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      ))}

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
