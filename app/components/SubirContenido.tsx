import { useState, useEffect } from "react";
import {
  FaCloudUploadAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheck,
  FaFilePdf,
  FaFileWord,
  FaFileAlt,
} from "react-icons/fa";
import Cookies from "js-cookie";

interface SubirContenidoProps {
  courseData: any;
  setCourseData: (data: any) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  name: string;
}

export default function SubirContenido({
  courseData,
  setCourseData,
}: SubirContenidoProps) {
  const [contents, setContents] = useState<any[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});

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
      if (!response.ok) throw new Error("Upload failed");
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

    const previewUrl = URL.createObjectURL(file);
    updateContent(idx, "imageUrl", previewUrl);

    const realUrl = await uploadImageToBackend(file);
    if (realUrl) {
      updateContent(idx, "imageUrl", realUrl);
    } else {
      alert("Error al subir imagen");
    }
  };

  const renderPreview = (url: string | null) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();

    if (lowerUrl.startsWith("blob:")) {
      return (
        <img
          src={url}
          alt="Vista previa local"
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }

    if (images[url]) {
      return (
        <img
          src={images[url]}
          alt="Vista previa protegida"
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }

    if (lowerUrl.endsWith(".pdf")) return <FaFilePdf className="text-red-500 text-6xl" />;
    if (lowerUrl.endsWith(".doc") || lowerUrl.endsWith(".docx"))
      return <FaFileWord className="text-blue-500 text-6xl" />;

    if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".png")) {
      return (
        <img
          src={url}
          alt="Vista previa directa"
          className="w-full h-full object-cover rounded-lg"
        />
      );
    }

    return <FaFileAlt className="text-gray-500 text-6xl" />;
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Subir Contenido</h3>
      <hr className="mb-4 border-gray-300" />

      {contents.map((c, i) => (
        <div key={i} className="p-4 border border-gray-300 rounded-lg mb-4 shadow relative">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-3">
              {!c.completed && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => updateContent(i, "completed", true)}
                    className="flex items-center gap-2 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <FaCheck size={16} />
                    <span className="text-sm">Listo</span>
                  </button>
                  <button
                    onClick={() => removeContent(i)}
                    className="flex items-center gap-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <FaTrash size={16} />
                    <span className="text-sm">Eliminar</span>
                  </button>
                </div>
              )}

              {c.completed ? (
                <>
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold">{c.contentTitle}</h4>
                  </div>
                  <p className="text-gray-600">{c.contentDescription}</p>
                  <p className="text-sm text-gray-500">Tiempo: {c.time} min</p>
                </>
              ) : (
                <>
                  <label className="block font-medium mb-1">Título del contenido</label>
                  <input
                    type="text"
                    value={c.contentTitle}
                    onChange={(e) => updateContent(i, "contentTitle", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <label className="block font-medium mb-1">Descripción del contenido</label>
                  <input
                    type="text"
                    value={c.contentDescription}
                    onChange={(e) => updateContent(i, "contentDescription", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <label className="block font-medium mb-1">Tiempo de estudio</label>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateContent(i, "time", Math.max(1, c.time - 1))}
                      className="px-4 py-2 bg-gray-300 text-black rounded-l"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 text-lg">{c.time} min</span>
                    <button
                      onClick={() => updateContent(i, "time", Math.min(30, c.time + 1))}
                      className="px-4 py-2 bg-gray-300 text-black rounded-r"
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="w-full md:w-64 flex justify-center items-center">
              {c.completed ? (
                <div className="relative w-full h-40 flex items-center justify-center bg-white border border-gray-300 rounded-lg">
                  {renderPreview(c.imageUrl)}
                </div>
              ) : (
                <label className="relative w-full h-40 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                  {c.imageUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {renderPreview(c.imageUrl)}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <FaEdit className="text-white text-3xl" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <FaCloudUploadAlt className="text-gray-400 text-4xl mb-2" />
                      <span className="text-gray-600 text-sm text-center">
                        Dele click para cargar archivo
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => handleImageUpload(i, e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {c.completed && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => removeContent(i)}
                className="flex items-center gap-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaTrash size={16} />
                <span className="text-sm">Eliminar</span>
              </button>
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
