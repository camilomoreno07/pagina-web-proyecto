import { useEffect, useState } from "react";
import {
  FaCloudUploadAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheck,
  FaDownload,
  FaFileAlt,
  FaBan,
  FaEye,
  FaArrowUp, FaArrowDown
} from "react-icons/fa";
import Cookies from "js-cookie";
import NumberStepper from "./NumberStepper";

interface Content {
  contentTitle: string;
  contentDescription: string;
  time: number;
  imageUrl: string | null;
  completed: boolean;
  moduleName: string;
}

interface SubirContenidoProps {
  courseData: any;
  setCourseData: (data: any) => void;
  hasSimulation: boolean;
}

export default function SubirContenido({
  courseData,
  setCourseData,
  hasSimulation,
}: SubirContenidoProps) {
  // images map: key = url (backend url or preview objectURL), value = localObjectURL (for display)
  const [images, setImages] = useState<Record<string, string>>({});

  // ensure contents array exists
  const contents: Content[] = courseData?.contents ?? [];

  // preload protected images (only for http(s) backend urls)
  useEffect(() => {
    (async () => {
      for (let c of contents) {
        if (typeof c.imageUrl === "string" && c.imageUrl.startsWith("http")) {
          await loadProtectedImage(c.imageUrl);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseData?.contents]);

  /** =============== IMAGE HELPERS ================= */
  const uploadImageToBackend = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`http://localhost:8081/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      return `http://localhost:8081/media/files/${result.url}`;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      return null;
    }
  };

  const loadProtectedImage = async (url: string) => {
    if (!url || images[url]) return;
    if (!url.startsWith("http")) return; // only fetch remote/protected urls
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
      if (!r.ok) return;
      const blob = await r.blob();
      const local = URL.createObjectURL(blob);
      setImages((p) => ({ ...p, [url]: local }));
    } catch (err) {
      console.warn("No se pudo cargar protected image", url, err);
    }
  };

  const getMimeTypeFromUrl = (url: string | null): string => {
    if (!url) return "unknown";
    const lowerUrl = url.toLowerCase().split("?")[0];
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return "image/*";
    if (lowerUrl.match(/\.(mp4|webm|mov)$/)) return "video/*";
    if (lowerUrl.match(/\.(mp3|wav|ogg)$/)) return "audio/*";
    if (lowerUrl.endsWith(".pdf") || lowerUrl.endsWith(".doc") || lowerUrl.endsWith(".docx") || lowerUrl.endsWith(".txt"))
      return "document/*";
    return "unknown";
  };

  const renderPreview = (url: string | null) => {
    if (!url) return null;
    const mimeType = getMimeTypeFromUrl(url);

    // for backend http urls we may have converted to a local object URL in images[url]
    const src = images[url] ?? url;

    if (mimeType.startsWith("image/")) {
      return (
        <img
          src={src}
          alt="Vista previa"
          className="w-full h-full object-cover rounded-lg"
        />
      );
    } else if (mimeType.startsWith("video/")) {
      return (
        <video src={src} controls className="w-full h-full object-cover rounded-lg" />
      );
    } else if (mimeType.startsWith("audio/")) {
      return <audio src={src} controls className="w-full rounded-lg" />;
    } else {
      return <FaFileAlt className="text-gray-500 text-7xl" />;
    }
  };

  // update a content in the flat array by index
  const updateContentByIndex = (index: number, field: keyof Content, value: any) => {
    const updated = [...contents];
    updated[index] = { ...updated[index], [field]: value };
    setCourseData({ ...courseData, contents: updated });
  };

  const deleteContentByIndex = (index: number) => {
    const updated = contents.filter((_, i) => i !== index);
    setCourseData({ ...courseData, contents: updated });
  };

  // handle file upload for a specific content index
  const handleImageUpload = async (contentIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // set temporary preview using local object URL
    const previewUrl = URL.createObjectURL(file);
    updateContentByIndex(contentIndex, "imageUrl", previewUrl);
    // store preview in images so renderPreview can show it
    setImages((p) => ({ ...p, [previewUrl]: previewUrl }));

    const realUrl = await uploadImageToBackend(file);
    if (realUrl) {
      // replace preview with real URL in content
      updateContentByIndex(contentIndex, "imageUrl", realUrl);
      // preload protected image (so we have an object URL in images map)
      if (realUrl.startsWith("http")) await loadProtectedImage(realUrl);
    } else {
      alert("Error al subir archivo");
    }
  };

  /** =============== GROUPING FOR RENDER ================= */
  // produce grouped structure preserving original indices: { [moduleName]: Array<{ item: Content, idx: number }> }
  const grouped = (() => {
    const acc: Record<string, Array<{ item: Content; idx: number }>> = {};
    contents.forEach((c, idx) => {
      const key = c.moduleName && c.moduleName.trim() !== "" ? c.moduleName : "SIN_SECCION";
      if (!acc[key]) acc[key] = [];
      acc[key].push({ item: c, idx });
    });
    return acc;
  })();

  /** =============== ACTIONS ================= */
  // Add a "section" placeholder (an empty content that expects moduleName)
  const addSection = () => {
    const newContent: Content = {
      contentTitle: "",
      contentDescription: "",
      time: 1,
      imageUrl: null,
      completed: false,
      moduleName: "",
    };
    setCourseData({ ...courseData, contents: [...contents, newContent] });
  };

  // Add a content into a given moduleName (moduleName could be "SIN_SECCION")
  const addContentToModule = (moduleName: string) => {
    const newContent: Content = {
      contentTitle: "",
      contentDescription: "",
      time: 1,
      imageUrl: null,
      completed: false,
      moduleName: moduleName === "SIN_SECCION" ? "" : moduleName,
    };
    setCourseData({ ...courseData, contents: [...contents, newContent] });
  };

  const normalizeModuleName = (name?: string | null) =>
    name && name.trim() !== "" ? name : "SIN_SECCION";

  // rename module: update all contents that match oldName
  const renameModule = (oldName: string, newName: string) => {
    const updated = contents.map((c) =>
      normalizeModuleName(c.moduleName) === oldName
        ? { ...c, moduleName: newName }
        : c
    );
    setCourseData({ ...courseData, contents: updated });
  };

  // remove whole module (all contents with that moduleName)
  const removeModule = (moduleName: string) => {
    const updated = contents.filter(
      (c) => normalizeModuleName(c.moduleName) !== moduleName
    );
    setCourseData({ ...courseData, contents: updated });
  };

  const omitContents = () => {
    const omitted: Content[] = [
      {
        contentTitle: "NA",
        contentDescription: "NA",
        time: 0,
        imageUrl: null,
        completed: false,
        moduleName: "NA",
      },
    ];
    setCourseData({ ...courseData, contents: omitted });
  };

  const cancelOmission = () => {
    setCourseData({ ...courseData, contents: [] });
  };

  const moveModule = (moduleName: string, direction: "up" | "down") => {
    const moduleKeys = Object.keys(grouped);
    const index = moduleKeys.indexOf(moduleName);

    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= moduleKeys.length) return;

    // Swap module keys
    const newOrder = [...moduleKeys];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];

    // Rebuild contents array in new order
    const newContents: Content[] = [];
    newOrder.forEach((key) => {
      newContents.push(...grouped[key].map(({ item }) => item));
    });

    setCourseData({ ...courseData, contents: newContents });
  };

  /** =============== RENDER ================= */
  const isOmitted =
    courseData.contents.length === 1 && courseData.contents[0].contentTitle === "NA";

  return (
    <div>
      <h3 className="text-3xl font-medium mb-4">
        Subir Contenido
      </h3>
      <hr className="mb-4 border-gray-300" />

      {isOmitted ? (
        <div className="text-center text-gray-600 border border-gray-300 p-6 bg-gray-50 rounded-lg shadow">
          <p className="text-lg font-semibold mb-2">Contenido omitido</p>
          <p className="text-sm">
            Esta sección no incluirá contenidos para los estudiantes
          </p>
          <button
            onClick={cancelOmission}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Cancelar omisión
          </button>
        </div>
      ) : (
        <>
          {Object.entries(grouped).map(([moduleName, items], sIdx) => (
            <div
              key={sIdx}
              className="border-2 border-gray-300 rounded-2xl p-6 mb-8 bg-gray-50 shadow-sm"
            >
              {/* === MODULE NAME === */}
              <div className="flex flex-wrap items-center gap-3 mb-6 bg-gray-100 border-l-4 border-primary-40 rounded-lg p-3 shadow-sm">
                <FaFileAlt className="text-primary-40 text-lg ml-2" />

                <input
                  type="text"
                  value={moduleName === "SIN_SECCION" ? "" : moduleName}
                  onChange={(e) => renameModule(moduleName, e.target.value)}
                  placeholder="Debes ingresar un nombre para la sección"
                  className={`flex-1 text-lg font-semibold tracking-wide bg-transparent border-b-2 
      border-transparent focus:border-primary-40 hover:border-gray-400 transition-colors duration-200 
      focus:outline-none cursor-text
      ${!moduleName || moduleName === "SIN_SECCION"
                      ? "text-red-500 placeholder-red-400"
                      : "text-gray-800"
                    }`}
                />

                <button
                  onClick={() => moveModule(moduleName, "up")}
                  className="p-2 bg-primary-40 text-white rounded-md hover:bg-primary-60 transition"
                  title="Mover sección arriba"
                >
                  <FaArrowUp />
                </button>

                <button
                  onClick={() => moveModule(moduleName, "down")}
                  className="p-2 bg-primary-40 text-white rounded-md hover:bg-primary-60 transition"
                  title="Mover sección abajo"
                >
                  <FaArrowDown />
                </button>

                <button
                  onClick={() => removeModule(moduleName)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  title="Eliminar sección"
                >
                  <FaTrash />
                </button>
              </div>

              {/* === CONTENTS INSIDE SECTION === */}
              {items.map(({ item: c, idx }) => (
                <div
                  key={idx}
                  className="p-5 border border-gray-300 rounded-xl mb-5 bg-white shadow-md"
                >
                  {/* CONTENT FIELDS */}
                  {!c.completed ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* FORM FIELDS */}
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Título del contenido
                          </label>
                          <input
                            type="text"
                            value={c.contentTitle}
                            onChange={(e) =>
                              updateContentByIndex(idx, "contentTitle", e.target.value)
                            }
                            placeholder="Título del contenido"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Descripción del contenido
                          </label>
                          <textarea
                            value={c.contentDescription}
                            onChange={(e) =>
                              updateContentByIndex(idx, "contentDescription", e.target.value)
                            }
                            placeholder="Descripción del contenido"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Tiempo de estudio
                          </label>
                          <NumberStepper
                            value={c.time}
                            onChange={(next) => updateContentByIndex(idx, "time", next)}
                            min={1}
                            max={30}
                            step={1}
                            suffix="min"
                          />
                        </div>
                      </div>

                      {/* UPLOAD PREVIEW */}
                      <div className="flex justify-center items-center">
                        <label className="relative w-full h-40 flex flex-col items-center justify-center 
    bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer 
    hover:bg-gray-200 transition overflow-hidden">

                          {c.imageUrl ? (
                            <div className="w-full h-40 rounded-lg overflow-hidden border bg-white flex items-center justify-center relative">
                              {renderPreview(c.imageUrl)}

                              {/* === INTERACTION-BLOCKING OVERLAY === */}
                              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                                <FaCloudUploadAlt className="text-white text-5xl mb-1" />
                                <span className="text-white text-l text-center">
                                  Click para cargar archivo
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <FaCloudUploadAlt className="text-gray-400 text-5xl mb-1" />
                              <span className="text-gray-600 text-l text-center">
                                Click para cargar archivo
                              </span>
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                            onChange={(e) => handleImageUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    /* === PREVIEW MODE === */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <h4 className="font-bold text-gray-800">{c.contentTitle}</h4>
                        <p className="text-gray-700 text-sm text-justify">{c.contentDescription}</p>
                        <p className="text-sm text-gray-500">Tiempo estimado: {c.time} min</p>
                      </div>

                      {/* FILE PREVIEW */}
                      <div className="flex justify-center items-center">
                        {c.imageUrl ? (
                          (() => {
                            const mime = getMimeTypeFromUrl(c.imageUrl);

                            if (
                              mime?.startsWith("image/") ||
                              mime?.startsWith("video/") ||
                              mime?.startsWith("audio/")
                            ) {
                              // Media → normal preview
                              return (
                                <div className="w-full h-40 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                                  {renderPreview(c.imageUrl)}
                                </div>
                              );
                            } else {
                              // Docs → styled card
                              return (
                                <div className="w-full max-w-xs bg-primary-98 rounded-xl border border-gray-200 px-6 py-5 shadow-sm">
                                  <h4 className="text-base font-medium text-primary-10 mb-2 text-center">
                                    {c.contentTitle || "Sin título"}
                                  </h4>
                                  <a
                                    href={images[c.imageUrl] ?? c.imageUrl}
                                    download={`doc-${Date.now()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center text-sm font-semibold text-primary-40 hover:underline"
                                  >
                                    Descargar Documento{" "}
                                    <FaDownload className="text-base inline ml-1" />
                                  </a>
                                </div>
                              );
                            }
                          })()
                        ) : (
                          <p className="text-gray-400 text-sm">Sin archivo adjunto</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex justify-end gap-2 mt-4 border-t pt-3">
                    {!c.completed ? (
                      <button
                        onClick={() => updateContentByIndex(idx, "completed", true)}
                        className="flex items-center gap-1 px-3 py-1 bg-primary-40 text-white rounded hover:bg-primary-50 text-sm"
                        title="Previsualizar"
                      >
                        <FaEye /> Previsualizar
                      </button>
                    ) : (
                      <button
                        onClick={() => updateContentByIndex(idx, "completed", false)}
                        className="flex items-center gap-1 px-3 py-1 bg-primary-40 text-white rounded hover:bg-primary-50 text-sm"
                        title="Editar"
                      >
                        <FaEdit /> Editar
                      </button>
                    )}

                    <button
                      onClick={() => deleteContentByIndex(idx)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      title="Eliminar contenido"
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              ))}

              {/* === BUTTON ADD CONTENT === */}
              <button
                type="button"
                onClick={() => addContentToModule(moduleName)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-primary-40 text-primary-40 bg-white 
             rounded-xl mt-3 font-medium shadow-sm hover:bg-primary-40 hover:text-white 
             active:scale-95 transition"
              >
                <FaPlus className="text-sm" /> Agregar Contenido
              </button>
            </div>
          ))}

          {/* === BUTTONS ADD/OMIT SECTION === */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-2 px-4 py-2 border-2 border-primary-40 text-primary-40 bg-white 
             rounded-xl mt-3 font-medium shadow-sm hover:bg-primary-40 hover:text-white 
             active:scale-95 transition"
            >
              <FaPlus className="mr-2" /> Agregar Sección
            </button>

            <button
              type="button"
              onClick={omitContents}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-500 text-white bg-gray-400 
             rounded-xl mt-3 font-medium shadow-sm hover:bg-gray-600 hover:text-white 
             active:scale-95 transition"
            >
              Omitir Contenido
            </button>
          </div>
        </>
      )}
    </div>
  );



}