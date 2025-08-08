"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Cookies from "js-cookie";
import Resumen from "./Resumen";
import { FaDownload } from "react-icons/fa";
import EvaluacionViewStudent from "../components/EvaluacionViewStudent";

interface ContentSectionProps {
  title: string;
  onBack: () => void;
  course: Course;
}

const TABS = ["Instrucciones", "Contenido", "Evaluación"] as const;
type Tab = (typeof TABS)[number];

const ContentSection = ({ title, onBack, course }: ContentSectionProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Instrucciones");
  const [images, setImages] = useState<Record<string, string>>({});
  const [activeContentIndex, setActiveContentIndex] = useState(0);

  const sectionMap = {
    "Antes de clase": course.beforeClass,
    "Durante la clase": course.duringClass,
    "Después de la clase": course.afterClass,
  };

  const currentSection = sectionMap[title];

  useEffect(() => {
    const loadImages = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      const contents = currentSection?.contents || [];
      const loadedImages: Record<string, string> = {};

      await Promise.all(
        contents.map(async (content) => {
          if (!content.imageUrl || content.imageUrl.startsWith("blob:")) return;
          try {
            const res = await fetch(content.imageUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;

            const blob = await res.blob();
            const objectURL = URL.createObjectURL(blob);
            loadedImages[content.imageUrl] = objectURL;
          } catch (err) {
            console.error("Error al cargar imagen de contenido:", err);
          }
        })
      );

      setImages(loadedImages);
    };

    loadImages();
  }, [course, title]);

  const getMimeTypeFromUrl = (url: string): string => {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.endsWith(".pdf")) return "application/pdf";
    if (lowerUrl.endsWith(".doc")) return "application/msword";
    if (lowerUrl.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (lowerUrl.endsWith(".xls")) return "application/vnd.ms-excel";
    if (lowerUrl.endsWith(".xlsx")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (lowerUrl.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
    if (lowerUrl.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";

    if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg")) return "image/jpeg";
    if (lowerUrl.endsWith(".png")) return "image/png";
    if (lowerUrl.endsWith(".gif")) return "image/gif";
    if (lowerUrl.endsWith(".svg")) return "image/svg+xml";
    if (lowerUrl.endsWith(".webp")) return "image/webp";

    if (lowerUrl.endsWith(".mp4")) return "video/mp4";
    if (lowerUrl.endsWith(".webm")) return "video/webm";
    if (lowerUrl.endsWith(".mov")) return "video/quicktime";

    if (lowerUrl.endsWith(".mp3")) return "audio/mpeg";
    if (lowerUrl.endsWith(".wav")) return "audio/wav";
    if (lowerUrl.endsWith(".ogg")) return "audio/ogg";

    if (lowerUrl.endsWith(".zip")) return "application/zip";
    if (lowerUrl.endsWith(".rar")) return "application/vnd.rar";
    if (lowerUrl.endsWith(".7z")) return "application/x-7z-compressed";

    if (lowerUrl.endsWith(".txt")) return "text/plain";
    if (lowerUrl.endsWith(".csv")) return "text/csv";
    if (lowerUrl.endsWith(".json")) return "application/json";

    return "unknown";
  };

  return (
    <div className="w-full px-6 py-6 space-y-6 bg-white">
      {/* 🔙 Volver */}
      <button
        onClick={onBack}
        className="mb-3 text-sm text-gray-500 hover:text-primary-600 transition flex items-center gap-1"
      >
        <span className="text-base">←</span> Volver a detalles del curso
      </button>

      {/* 🔹 Título */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

      {/* 🔹 Tabs */}
      <div className="grid grid-cols-3 mb-6 rounded-lg overflow-hidden border border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-center text-sm md:text-base font-medium transition-colors ${activeTab === tab
              ? "bg-[#EDFAFA] text-[#096874]"
              : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENIDO CENTRADO */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Instrucciones */}
        {activeTab === "Instrucciones" && currentSection?.instructions && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-4">
              {currentSection.instructions.instructionTitle}
            </h2>
            <p className="text-sm text-gray-500">
              {currentSection.instructions.time} min
            </p>
            <Resumen description={currentSection.instructions.instructionDescription} />
            {currentSection.instructions.steps?.length > 0 && (
              <ol className="list-decimal list-inside text-gray-700 space-y-1 mt-2">
                {currentSection.instructions.steps
                  .filter((step) => step.trim() !== "")
                  .map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
              </ol>
            )}
            <div className="mt-4 flex items-center gap-2">
              <input type="checkbox" id="completado" />
              <label htmlFor="completado" className="text-gray-600 text-sm">
                Marcar como completado
              </label>
            </div>
          </div>
        )}

        {/* Contenido */}
        {activeTab === "Contenido" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-primary-10">
              Recursos Disponibles
            </h2>

            {currentSection?.contents?.length ? (
              <>
                <div className="p-4 rounded-md space-y-4">
                  {(() => {
                    const content = currentSection.contents[activeContentIndex];

                    // 👉 Si es experiencia WebGL
                    if (content.experienceUrl && content.experienceUrl !== "NA") {
                      return (
                        <>
                          <h4 className="text-lg font-semibold text-primary-10">
                            {content.contentTitle}
                          </h4>
                          <iframe
                            src={content.experienceUrl}
                            className="w-full h-[500px] border rounded"
                            allow="autoplay; fullscreen; vr"
                          />
                          <p className="text-sm text-primary-30 mt-2">
                            {content.contentDescription}
                          </p>
                          <p className="text-xs text-primary-20">{content.time} min</p>
                          <div className="pt-2">
                            <label className="inline-flex items-center gap-2 text-sm text-primary-30">
                              <input type="checkbox" />
                              Marcar como completado
                            </label>
                          </div>
                        </>
                      );
                    } else if(content.experienceUrl === "NA") {
                      return (
                        <>
                          <div className="w-full h-[200px] border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 text-sm italic">
                            Este curso no cuenta con una experiencia de realidad aumentada para navegador
                          </div>
                        </>
                      );
                    }

                    // 👉 Caso normal (imagen/pdf)
                    const mimeType = content.imageUrl ? getMimeTypeFromUrl(content.imageUrl) : "unknown";
                    const imageSrc = content.imageUrl?.startsWith("blob:")
                      ? content.imageUrl
                      : images[content.imageUrl] || "";

                    return (
                      <>
                        {imageSrc && mimeType.startsWith("image/") && (
                          <img
                            src={imageSrc}
                            alt="Contenido visual"
                            className="w-full max-h-64 object-contain rounded-md mx-auto"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}

                        {imageSrc && mimeType.startsWith("video/") && (
                          <video
                            src={imageSrc}
                            controls
                            className="w-full max-h-64 object-contain rounded-md mx-auto"
                          />
                        )}

                        {imageSrc && mimeType.startsWith("audio/") && (
                          <audio
                            src={imageSrc}
                            controls
                            className="w-full rounded-md mx-auto"
                          />
                        )}

                        {/* Bloque genérico para PDF, DOC, TXT, etc. */}
                        {imageSrc &&
                          !mimeType.startsWith("image/") &&
                          !mimeType.startsWith("video/") &&
                          !mimeType.startsWith("audio/") && (
                            <div className="w-full max-w-xs bg-primary-98 rounded-xl border border-gray-200 px-6 py-5 shadow-sm">
                              <h4 className="text-base font-medium text-primary-10 mb-2 text-center">
                                {content.contentTitle}
                              </h4>
                              <a
                                href={imageSrc}
                                download={`doc-${Date.now()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-center text-sm font-semibold text-primary-40 hover:underline"
                              >
                                Descargar Documento <FaDownload className="text-base inline ml-1" />
                              </a>
                            </div>
                          )}
                      </>
                    );
                  })()}
                </div>

                {/* Navegación */}
                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() =>
                      setActiveContentIndex((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={activeContentIndex === 0}
                    className="text-primary-30 px-4 py-2 border border-primary-30 rounded disabled:opacity-30"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-primary-20">
                    {activeContentIndex + 1} de {currentSection.contents.length}
                  </span>

                  <button
                    onClick={() =>
                      setActiveContentIndex((prev) =>
                        Math.min(prev + 1, currentSection.contents.length - 1)
                      )
                    }
                    disabled={
                      activeContentIndex === currentSection.contents.length - 1
                    }
                    className="text-primary-100 bg-primary-40 px-4 py-2 rounded hover:opacity-90 disabled:opacity-30"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            ) : (
              <p className="text-primary-20">No hay contenido disponible.</p>
            )}
          </div>
        )}

        {/* Evaluaciones */}
        {activeTab === "Evaluación" && (
          <EvaluacionViewStudent evaluations={currentSection?.evaluations} />
        )}
      </div>
    </div>
  );
};

export default ContentSection;
