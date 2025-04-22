"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Cookies from "js-cookie";
import Resumen from "./Resumen";

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
            className={clsx(
              "py-3 text-center text-sm md:text-base font-medium transition-colors",
              activeTab === tab
                ? "bg-primary-50 text-primary-600"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
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
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">Recursos Disponibles</h2>
            {currentSection?.contents?.length ? (
              currentSection.contents.map((content, idx) => {
                const imageSrc = content.imageUrl.startsWith("blob:")
                  ? content.imageUrl
                  : images[content.imageUrl] || "";

                return (
                  <div
                    key={idx}
                    className="border p-4 rounded-md bg-gray-50 space-y-2"
                  >
                    <h4 className="text-md font-semibold text-gray-800">
                      {content.contentTitle}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {content.contentDescription}
                    </p>
                    <p className="text-xs text-gray-400">{content.time} min</p>
                    {imageSrc && (
                      <img
                        src={imageSrc}
                        alt="Contenido visual"
                        className="w-full max-h-64 object-contain rounded-md mt-2 mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No hay contenido disponible.</p>
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
