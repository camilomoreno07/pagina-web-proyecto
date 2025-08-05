"use client";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaTrash, FaPlus, FaCheck } from "react-icons/fa";
import Cookies from "js-cookie";

interface CrearExperienciaProps {
  courseData: any;
  setCourseData: (data: any) => void;
  name: string; // viene desde CardList, ej: "afterClass"
}

export default function CrearExperiencia({
  courseData,
  setCourseData,
  name,
}: CrearExperienciaProps) {
  const [contents, setContents] = useState<any[]>([]);
  const [componentKey, setComponentKey] = useState(0);

  useEffect(() => {
    const section = courseData[name] || {};
    setContents(section.contents || []);
  }, [courseData, name]);

  const uploadExperienceToBackend = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8081/media/upload/experience", {
        method: "POST",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Error al subir experiencia");
      const result = await response.json();
      return `http://localhost:8081${result.url}/index.html?token=${Cookies.get("token")}`;
    } catch (error) {
      console.error("Error subiendo experiencia:", error);
      return null;
    }
  };

  const addExperience = async (file: File) => {
    const url = await uploadExperienceToBackend(file);
    if (!url) return alert("Error al subir experiencia");

    const newExperience = {
      contentTitle: "Experiencia Unity",
      contentDescription: "",
      time: 1,
      experienceUrl: url,
      completed: true,
    };
    const updated = [...contents, newExperience];

    setContents(updated);
    setCourseData({
      ...courseData,
      [name]: {
        ...courseData[name],
        contents: updated,
      },
    });

    setComponentKey((prev) => prev + 1);
  };

  const removeExperience = (idx: number) => {
    const updated = contents.filter((_, i) => i !== idx);
    setContents(updated);
    setCourseData({
      ...courseData,
      [name]: {
        ...courseData[name],
        contents: updated,
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addExperience(file);
  };

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">Crear Experiencia</h3>
      <hr className="mb-4 border-gray-300" />

      {contents.map((c, i) => (
        <div
          key={i}
          className="p-4 border border-gray-300 rounded-lg mb-4 shadow relative"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => removeExperience(i)}
                  className="flex items-center gap-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FaTrash size={16} />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
              <h4 className="text-lg font-bold">{c.contentTitle}</h4>
              <p className="text-gray-600">Tiempo: {c.time} horas</p>
            </div>
          </div>

          <div className="mt-4 border rounded">
            {c.experienceUrl && (
              <web-experience-viewer
                key={`${componentKey}-${i}`}
                url={c.experienceUrl}
              ></web-experience-viewer>
            )}
          </div>
        </div>
      ))}

      <label className="relative w-full h-40 flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition">
        <FaCloudUploadAlt className="text-gray-400 text-4xl mb-2" />
        <span className="text-gray-600 text-sm text-center">
          Clic para cargar experiencia ZIP
        </span>
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      </label>
    </div>
  );
}
