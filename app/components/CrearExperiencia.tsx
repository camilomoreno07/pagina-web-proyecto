"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface CrearExperienciaProps {
  courseData: any;
  setCourseData: (data: any) => void;
}

export default function CrearExperiencia({ courseData, setCourseData }: CrearExperienciaProps) {
  const [experienceName, setExperienceName] = useState(courseData?.experienceName || "");
  const [file, setFile] = useState<File | null>(null);
  const [timeRequired, setTimeRequired] = useState(courseData?.timeRequired || 1);

  useEffect(() => {
    // Registrar el Web Component solo una vez
    if (!customElements.get("web-experience-viewer")) {
      class WebExperienceViewer extends HTMLElement {
        connectedCallback() {
          const url = this.getAttribute("url");
          const shadow = this.attachShadow({ mode: "open" });
          shadow.innerHTML = `
            <style>
              :host {
                display: block;
                width: 100%;
                height: 100%;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
            <iframe src="${url}" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
          `;
        }
      }
      customElements.define("web-experience-viewer", WebExperienceViewer);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Selecciona un archivo ZIP antes de continuar");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8081/media/upload/experience", {
        method: "POST",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Error al subir experiencia");

      const expNameWithoutZip = file.name.replace(/\.zip$/i, "");
      setExperienceName(expNameWithoutZip);
      setCourseData({ ...courseData, experienceName: expNameWithoutZip, timeRequired });
    } catch (error) {
      console.error("Error subiendo experiencia:", error);
      alert("Error al subir experiencia");
    }
  };

  const experienceUrl =
    experienceName &&
    `http://localhost:8081/media/experiences/${experienceName}/index.html?token=${Cookies.get(
      "token"
    )}`;

  return (
    <div className="space-y-4">
      <h3 className="text-3xl font-medium mb-4">Crear Experiencia</h3>
      <hr className="mb-4 border-gray-300" />

      <div className="flex flex-col space-y-4">
        <input
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-primary-40 text-white rounded hover:bg-primary-50"
        >
          Subir experiencia
        </button>

        <div>
          <label className="block font-medium mb-1">Tiempo mínimo requerido (horas)</label>
          <input
            type="number"
            min={1}
            step={1}
            value={timeRequired}
            onChange={(e) => {
              const value = Number(e.target.value);
              setTimeRequired(value);
              setCourseData({ ...courseData, timeRequired: value, experienceName });
            }}
            className="border p-2 rounded w-32"
          />
        </div>
      </div>

      {experienceName && (
        <div className="mt-4 border rounded h-96">
          {/* Aquí usamos el Web Component */}
          <web-experience-viewer url={experienceUrl}></web-experience-viewer>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={() => setCourseData({ ...courseData, experienceName, timeRequired })}
          className="px-4 py-2 bg-primary-40 hover:bg-primary-50 text-white rounded"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
