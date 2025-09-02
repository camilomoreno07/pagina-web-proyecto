"use client";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import Cookies from "js-cookie";
import { FaDownload } from "react-icons/fa";
import Resumen from "./Resumen";
import ReviewExperience from "../components/ReviewExperience";
import EvaluacionViewStudent from "../components/EvaluacionViewStudent";

const token = Cookies.get("token");
let username: string | null = null;

if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    username = payload.sub;
  } catch (err) {
    console.error("Error decoding token:", err);
  }
}

interface Course {
  courseId: string;
  courseName?: string;
  beforeClass?: any;
  duringClass?: any;
  afterClass?: any;
}

interface ContentSectionProps {
  title: "Antes de clase" | "Durante la clase" | "Después de la clase";
  onBack: () => void;
  course: Course;
}

const TABS = ["Instrucciones", "Contenido", "Evaluación"] as const;
type Tab = (typeof TABS)[number];

const SECTION_KEY_BY_TITLE: Record<
  ContentSectionProps["title"],
  "aulaInvertida" | "tallerHabilidad" | "actividadExperiencial"
> = {
  "Antes de clase": "aulaInvertida",
  "Durante la clase": "tallerHabilidad",
  "Después de la clase": "actividadExperiencial",
};

const ContentSection = ({ title, onBack, course }: ContentSectionProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("Instrucciones");
  const [allTabsLocked, setAllTabsLocked] = useState(false);

  // eval modal
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [selectedEvalTime, setSelectedEvalTime] = useState(0);
  const [thirdTabCompleted, setThirdTabCompleted] = useState(false);

  // completions
  const [instructionsCompleted, setInstructionsCompleted] = useState(false);
  const [completedContents, setCompletedContents] = useState<boolean[]>([]);
  const [activeContentIndex, setActiveContentIndex] = useState(0);

  const [existingSectionGrade, setExistingSectionGrade] = useState<any | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});

  const [progress, setProgress] = useState<any | null>(null);

  const sectionKey = SECTION_KEY_BY_TITLE[title];

  const sectionMap = {
    "Antes de clase": course.beforeClass,
    "Durante la clase": course.duringClass,
    "Después de la clase": course.afterClass,
  } as const;

  const titleMap = {
    "Antes de clase": "Aula Invertida",
    "Durante la clase": "Taller de Habilidad",
    "Después de la clase": "Actividad Experiencial",
  } as const;

  const currentSection = sectionMap[title];

  // fetch existing grade
  useEffect(() => {
    if (!username || !course?.courseId) return;
    const url = `http://localhost:8081/api/grades/student/${encodeURIComponent(
      username
    )}/course/${encodeURIComponent(course.courseId)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.status === 404 ? null : res.json()))
      .then((data) => {
        if (!data) return;
        setExistingSectionGrade(data?.[sectionKey] ?? null);
        if (data?.[sectionKey]?.questions?.length > 0) {
          setThirdTabCompleted(true);
        }
      })
      .catch((err) => console.error("Error fetching grade:", err));
  }, [username, course?.courseId, sectionKey]);

  // fetch existing progress
  useEffect(() => {
    if (!username || !course?.courseId) return;
    const url = `http://localhost:8081/api/progress/course/${encodeURIComponent(
      course.courseId
    )}/student/${encodeURIComponent(username)}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.status === 404 ? null : res.json()))
      .then((data) => {
        if (!data) return;

        setProgress(data);

        const section = data[sectionKey];
        if (section) {
          setInstructionsCompleted(section.instructionCompleted ?? false);
          setCompletedContents(section.contentProgress?.contentsCompleted ?? []);
          setThirdTabCompleted(section.evaluationCompleted ?? false);
        }
      })
      .catch((err) => console.error("Error fetching progress:", err));
  }, [username, course?.courseId, sectionKey]);

  // init content completion state
  useEffect(() => {
    if (currentSection?.contents?.length) {
      setCompletedContents(new Array(currentSection.contents.length).fill(false));
    } else {
      setCompletedContents([]);
    }
  }, [currentSection]);

  // preload images with token
  useEffect(() => {
    const loadImages = async () => {
      const token = Cookies.get("token");
      if (!token) return;
      const contents = currentSection?.contents || [];
      const loaded: Record<string, string> = {};

      await Promise.all(
        contents.map(async (content: any) => {
          if (!content.imageUrl || content.imageUrl.startsWith("blob:")) return;
          try {
            const res = await fetch(content.imageUrl, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return;
            const blob = await res.blob();
            loaded[content.imageUrl] = URL.createObjectURL(blob);
          } catch (err) {
            console.error("Error loading content image:", err);
          }
        })
      );
      setImages(loaded);
    };
    loadImages();
  }, [course, title]);

  const toggleInstructions = () => {
    const next = !instructionsCompleted;
    setInstructionsCompleted(next);

    updateProgress({
      instructionCompleted: next,
      contentProgress: { contentsCompleted: completedContents },
      evaluationCompleted: thirdTabCompleted,
      ommitedContent: currentSection?.ommitedContent ?? 0,
    });
  };

  const toggleCompleted = (i: number) => {
    const next = [...completedContents];
    next[i] = !next[i];
    setCompletedContents(next);

    updateProgress({
      instructionCompleted: instructionsCompleted,
      contentProgress: { contentsCompleted: next },
      evaluationCompleted: thirdTabCompleted,
      ommitedContent: currentSection?.ommitedContent ?? 0,
    });
  };

  const getMimeTypeFromUrl = (url: string): string => {
    const lowerUrl = url.toLowerCase();

    if (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".png") || lowerUrl.endsWith(".gif") || lowerUrl.endsWith(".svg") || lowerUrl.endsWith(".webp")) return "image/*";
    if (lowerUrl.endsWith(".mp4") || lowerUrl.endsWith(".webm") || lowerUrl.endsWith(".mov")) return "video/*";
    if (lowerUrl.endsWith(".mp3") || lowerUrl.endsWith(".wav") || lowerUrl.endsWith(".ogg")) return "audio/*";

    return "unknown";
  };

  const hasEvaluation = currentSection?.evaluations?.[0]?.question !== "NA";

  // tab click handler
  const handleTabClick = (tab: Tab) => {
    const isLocked = allTabsLocked && tab !== "Evaluación";
    if (isLocked) return;

    if (tab === "Evaluación") {
      if (!hasEvaluation) {
        setActiveTab("Evaluación");
        return;
      }

      if (thirdTabCompleted) {
        setActiveTab("Evaluación");
        return;
      }
      const totalTime = (currentSection?.evaluations ?? []).reduce(
        (sum: number, ev: any) => sum + (ev?.time ?? 0),
        0
      );
      setSelectedEvalTime(totalTime);
      setShowEvalModal(true);
      return;
    }
    setActiveTab(tab);
  };

  // Utility to update progress
  const updateProgress = (updatedSection: any) => {
    if (!username || !course?.courseId) return;

    const newProgress = {
      ...(progress ?? {
        courseId: course.courseId,
        studentId: username,
      }),
      [sectionKey]: {
        ...(progress?.[sectionKey] ?? {}), // keep existing ommitedContent
        ...updatedSection,                 // overwrite with new updates
      },
    };

    setProgress(newProgress);

    fetch("http://localhost:8081/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newProgress),
    }).catch((err) => console.error("Error updating progress:", err));
  };

  const confirmEvalModal = () => {
    setActiveTab("Evaluación");
    setShowEvalModal(false);
    setAllTabsLocked(true); // block others during eval
  };

  return (
    <>
      <div className="w-full px-6 py-6 space-y-6 bg-white">
        <button
          onClick={onBack}
          className="mb-3 text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1"
        >
          ← Volver a detalles del curso
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">{titleMap[title]}</h2>

        {/* Tabs */}
        <div className="grid grid-cols-3 mb-6 rounded-lg overflow-hidden border border-gray-200">
          {TABS.map((tab) => {
            // 🔹 Disable ALL tabs when evaluation in progress
            // 🔹 But allow "Evaluación" if already completed (for review)
            const isDisabled =
              allTabsLocked || (tab === "Evaluación" && !thirdTabCompleted && allTabsLocked);

            return (
              <button
                key={tab}
                onClick={() => {
                  if (isDisabled) return;
                  handleTabClick(tab);
                }}
                className={clsx(
                  "py-3 text-center text-sm md:text-base font-medium transition-colors",
                  activeTab === tab
                    ? "bg-[#EDFAFA] text-[#096874]"
                    : "bg-white text-gray-600 hover:bg-gray-100",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="w-full max-w-4xl mx-auto space-y-6">

          {/* Instrucciones*/}
          {activeTab === "Instrucciones" && (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold mb-4">
                {currentSection.instructions.instructionTitle}
              </h2>
              <Resumen description={currentSection.instructions.instructionDescription} />
              {currentSection.instructions.steps?.length > 0 && (
                <ol className="list-decimal list-inside text-gray-700 space-y-1 mt-2">
                  {currentSection.instructions.steps
                    .filter((step: string) => step.trim() !== "")
                    .map((step: string, idx: number) => (
                      <li key={idx}>{step}</li>
                    ))}
                </ol>
              )}
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-500">Tiempo sugerido de estudio:</h2>
                <p className="text-sm px-2 py-1 rounded text-gray-600 bg-gray-200 inline-block">
                  {currentSection.instructions.time} min
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completado"
                  checked={instructionsCompleted}
                  onChange={toggleInstructions}
                />
                <label htmlFor="completado" className="text-gray-600 text-sm">
                  Marcar como completado
                </label>
              </div>
            </div>
          )}

          {/* Contenido */}
          {activeTab === "Contenido" && (
            <div className="space-y-6">
              {currentSection?.contents?.length ? (
                <>
                  <div className="p-4 rounded-md space-y-4">
                    {(() => {
                      const content = currentSection.contents[activeContentIndex];

                      // Experiencia WebGL
                      if (content?.experienceUrl && content.experienceUrl !== "NA") {
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
                            <div className="flex items-center gap-2 mb-2">
                              <h2 className="text-sm font-semibold text-gray-500">
                                Tiempo sugerido de estudio:
                              </h2>
                              <p className="text-sm px-2 py-1 rounded text-gray-600 bg-gray-200 inline-block">
                                {content.time*60} min
                              </p>
                            </div>
                            <div className="pt-2">
                              <label className="inline-flex items-center gap-2 text-sm text-primary-30">
                                <input
                                  type="checkbox"
                                  checked={completedContents[activeContentIndex] || false}
                                  onChange={() => toggleCompleted(activeContentIndex)}
                                />
                                Marcar como completado
                              </label>
                            </div>
                          </>
                        );
                      } else if (content?.experienceUrl === "NA") {
                        return (
                          <ReviewExperience
                            idEstudiante={username ?? ""}
                            nombreCurso={course.courseName}
                          />
                        );
                      }

                      // Contenido normal (imagen/video/pdf/etc.)
                      if (currentSection?.contents?.[0]?.contentTitle === "NA") {
                        return (
                          <div className="w-full min-h-[120px] border border-dashed border-gray-300 rounded flex items-center justify-center px-4 py-6 text-center text-gray-500 text-sm italic">
                            Esta sección no cuenta con ningún contenido asociado
                          </div>
                        );
                      }

                      const mimeType = content?.imageUrl
                        ? getMimeTypeFromUrl(content.imageUrl)
                        : "unknown";
                      const imageSrc = content?.imageUrl?.startsWith("blob:")
                        ? content.imageUrl
                        : (content?.imageUrl ? images[content.imageUrl] : "");

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

                          {/* Genérico para docs */}
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

                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-sm font-semibold text-gray-500">Tiempo sugerido de estudio:</h2>
                            <p className="text-sm px-2 py-1 rounded text-gray-600 bg-gray-200 inline-block">
                              {content?.time ?? 0} min
                            </p>
                          </div>
                          <div className="pt-2">
                            <label className="inline-flex items-center gap-2 text-sm text-primary-30">
                              <input
                                type="checkbox"
                                checked={completedContents[activeContentIndex] || false}
                                onChange={() => toggleCompleted(activeContentIndex)}
                              />
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
                      onClick={() => setActiveContentIndex((prev) => Math.max(prev - 1, 0))}
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
                        setActiveContentIndex((prev) => Math.min(prev + 1, currentSection.contents.length - 1))
                      }
                      disabled={activeContentIndex === currentSection.contents.length - 1}
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

          {/* Evaluacion */}
          {activeTab === "Evaluación" && currentSection?.evaluations?.[0]?.question !== "NA" && (
            <EvaluacionViewStudent
              evaluations={currentSection?.evaluations ?? []}
              course={{ courseId: course.courseId }}
              section={sectionKey}
              onComplete={() => {
                setAllTabsLocked(false);
                setThirdTabCompleted(true);
                updateProgress({
                  instructionCompleted: instructionsCompleted,
                  contentProgress: { contentsCompleted: completedContents },
                  evaluationCompleted: true,
                  ommitedContent: currentSection?.ommitedContent ?? 0,
                });
              }}
            />
          )}

          {/* Placeholder when no evaluation */}
          {activeTab === "Evaluación" && !hasEvaluation && (
            <div className="w-full min-h-[120px] border border-dashed border-gray-300 rounded flex items-center justify-center px-4 py-6 text-center text-gray-500 text-sm italic">
              Esta sección no cuenta con una evaluación de conocimientos
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {hasEvaluation && showEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 h-screen w-screen px-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl flex flex-col items-center text-center overflow-y-auto max-h-[90vh]">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-4">
              ¿Desea proceder con la presentación de la evaluación?
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-2 mb-6 justify-center">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500">
                Tiempo estimado:
              </h2>
              <p className="text-xs sm:text-sm px-2 py-1 rounded text-green-700 bg-green-100 inline-block">
                {selectedEvalTime} min
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowEvalModal(false)}
                className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEvalModal}
                className="px-3 sm:px-4 py-2 rounded-lg bg-primary-40 text-white hover:bg-primary-60 text-sm sm:text-base w-full sm:w-auto"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}


    </>
  );
};

export default ContentSection;
