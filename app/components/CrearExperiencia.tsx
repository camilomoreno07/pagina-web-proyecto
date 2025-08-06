"use client";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";

interface CrearExperienciaProps {
  courseData: any;
  setCourseData: (data: any) => void;
}

export default function CrearExperiencia({
  courseData,
  setCourseData,
}: CrearExperienciaProps) {
  const [experience, setExperience] = useState<any | null>(null);
  const [componentKey, setComponentKey] = useState(0);

  useEffect(() => {
    if (courseData?.contents && courseData.contents.length > 0) {
      setExperience(courseData.contents[0]);
    } else {
      setExperience(null);
    }
  }, [courseData?.contents]);

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
      contentTitle: file.name.replace(".zip", ""),
      contentDescription: "",
      time: 1,
      experienceUrl: url,
      completed: true,
    };

    setCourseData({ ...courseData, contents: [newExperience] });
    setExperience(newExperience);
    setComponentKey((prev) => prev + 1);
  };

  const removeExperience = () => {
    setCourseData({ ...courseData, contents: [] });
    setExperience(null);
  };

  const updateTime = (newTime: number) => {
    if (!experience) return;
    const updated = { ...experience, time: newTime };
    setCourseData({ ...courseData, contents: [updated] });
    setExperience(updated);
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

      {experience && (
        <div className="p-4 border border-gray-300 rounded-lg mb-4 shadow relative">
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={removeExperience}
              className="flex items-center gap-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaTrash size={16} />
              <span className="text-sm">Eliminar</span>
            </button>
          </div>

          <h4 className="text-lg font-bold">{experience.contentTitle}</h4>

          {/* Number stepper */}
          <div className="flex items-center gap-2 mt-2">
            <label className="text-gray-700 text-sm">Tiempo (horas):</label>
            <input
              type="number"
              min={1}
              value={experience.time}
              onChange={(e) => updateTime(parseInt(e.target.value) || 1)}
              className="border rounded p-1 w-20"
            />
          </div>

          {experience.experienceUrl && (
            <iframe
              key={componentKey}
              src={experience.experienceUrl}
              className="w-full h-[500px] border rounded mt-4"
              allow="autoplay; fullscreen; vr"
            />
          )}
        </div>
      )}

      {!experience && (
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
      )}
    </div>
  );
}
