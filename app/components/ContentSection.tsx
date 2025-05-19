"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Cookies from "js-cookie";
import Resumen from "./Resumen";
import { FaDownload } from "react-icons/fa";


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
            className={`py-3 text-center text-sm md:text-base font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#EDFAFA] text-[#096874]"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔸 CONTENIDO CENTRADO */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* 🔹 Instrucciones */}
        {activeTab === "Instrucciones" && currentSection?.instructions && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold mb-4">
              {currentSection.instructions.instructionTitle}
            </h2>
            <p className="text-sm text-gray-500">
              {currentSection.instructions.time} min
            </p>
            <Resumen
              description={currentSection.instructions.instructionDescription}
            />
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

        {/* 🔹 Contenido */}
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
                    const imageSrc = content.imageUrl.startsWith("blob:")
                      ? content.imageUrl
                      : images[content.imageUrl] || "";

                    const isPdf = content.imageUrl
                      .toLowerCase()
                      .endsWith(".pdf");

                    return (
                      <>
                        {imageSrc && isPdf ? (
                          <div className="w-full max-w-xs bg-primary-98 rounded-xl border border-gray-200 px-6 py-5 shadow-sm">
                            <h4 className="text-base font-medium text-primary-10 mb-2 text-center">
                              {content.contentTitle}
                            </h4>
                            <a
                              href={imageSrc}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-center text-sm font-semibold text-primary-40 hover:underline"
                            >
                              Documento PDF <FaDownload className="text-base" />
                            </a>
                          </div>
                        ) : imageSrc ? (
                          <img
                            src={imageSrc}
                            alt="Contenido visual"
                            className="w-full max-h-64 object-contain rounded-md mx-auto"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}

                        <h4 className="text-lg font-semibold text-primary-10 mt-4">
                          Descripción
                        </h4>
                        <p className="text-sm text-primary-30">
                          {content.contentDescription}
                        </p>
                        <p className="text-xs text-primary-20">
                          {content.time} min
                        </p>
                        <div className="pt-2">
                          <label className="inline-flex items-center gap-2 text-sm text-primary-30">
                            <input type="checkbox" />
                            Marcar como completado
                          </label>
                        </div>
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

        {/* 🔹 Evaluaciones */}
        {activeTab === "Evaluación" && (
          <div className="space-y-3">
            {currentSection?.evaluations?.length ? (
              currentSection.evaluations.map((evalItem, idx) => (
                <div
                  key={idx}
                  className="border p-4 rounded-md bg-gray-50 space-y-2"
                >
                  <h4 className="text-md font-semibold text-gray-800">
                    {evalItem.question}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {evalItem.questionDescription}
                  </p>
                  <p className="text-xs text-gray-400">{evalItem.time} min</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No hay evaluaciones disponibles.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;
