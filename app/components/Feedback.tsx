"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

/** ===== Tipos ===== */
type MomentKey = "beforeClass" | "duringClass" | "afterClass";

interface Evaluation {
  question: string;
  correctAnswer?: string;
  correctAnswers?: string[];
  options?: string[] | null;
  time?: number;
}

interface Course {
  courseId: string;
  courseName: string;
  studentIds: string[];
  beforeClass?: { evaluations?: Evaluation[] };
  duringClass?: { evaluations?: Evaluation[] };
  afterClass?: { evaluations?: Evaluation[] };
}

interface StudentRow {
  username: string; // correo
  firstname: string;
  lastname: string;
  hasSubmission: boolean;
}

interface GradeQuestion {
  response: string;
  feedback?: string;
}
interface GradeBlock {
  questions: GradeQuestion[];
  grade?: string | null;
}
interface Grade {
  id?: string;
  studentId: string;
  courseId: string;
  aulaInvertida?: GradeBlock;
  tallerHabilidad?: GradeBlock;
  actividadExperiencial?: GradeBlock;
}

/** ===== Constantes ===== */
const token = Cookies.get("token") ?? "";
const authHeaders = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
const momentNames: Record<MomentKey, string> = {
  beforeClass: "Prebriefing",
  duringClass: "Briefing",
  afterClass: "Debriefing",
};
const orderedMoments: MomentKey[] = ["beforeClass", "duringClass", "afterClass"];

/** ===== Helpers ===== */
const fetchJSON = async (url: string) => {
  const res = await fetch(url, { headers: authHeaders });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
};

const getUserName = async (email: string): Promise<{ firstname: string; lastname: string }> => {
  try {
    const d = await fetchJSON(`http://localhost:8081/api/users/${encodeURIComponent(email)}`);
    if (Array.isArray(d)) {
      const hit = d.find((u: any) => u?.username === email);
      if (hit) return { firstname: hit.firstname ?? "", lastname: hit.lastname ?? "" };
    } else if (d) {
      return { firstname: d.firstname ?? "", lastname: d.lastname ?? "" };
    }
  } catch { }
  return { firstname: "", lastname: "" };
};

const getGrade = async (email: string, courseId: string): Promise<Grade | null> => {
  const url = `http://localhost:8081/api/grades/student/${encodeURIComponent(email)}/course/${courseId}`;
  try {
    const res = await fetch(url, { headers: authHeaders });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as Grade;
  } catch {
    return null;
  }
};

const courseEvaluationsFor = (course: Course | null, key: MomentKey): Evaluation[] =>
  (course?.[key]?.evaluations ?? []) as Evaluation[];

const gradeBlockFor = (g: Grade | null, key: MomentKey): GradeBlock | undefined => {
  if (!g) return undefined;
  if (key === "beforeClass") return g.aulaInvertida;
  if (key === "duringClass") return g.tallerHabilidad;
  return g.actividadExperiencial;
};

const setGradeBlockFor = (g: Grade, key: MomentKey, block: GradeBlock) => {
  if (key === "beforeClass") g.aulaInvertida = block;
  else if (key === "duringClass") g.tallerHabilidad = block;
  else g.actividadExperiencial = block;
};

/** ===== Componente principal ===== */
export default function Feedback({ course, onClose }: { course: Course | null; onClose: () => void }) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Editor modal
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorStudent, setEditorStudent] = useState<StudentRow | null>(null);
  const [editorGrade, setEditorGrade] = useState<Grade | null>(null);
  const [editorMoment, setEditorMoment] = useState<MomentKey>("beforeClass");
  const [editorText, setEditorText] = useState<string[]>([]);

  const activeKey = orderedMoments[activeIndex];
  const [grades, setGrades] = useState<Record<string, Grade | null>>({});

  /** Cargar filas */
  useEffect(() => {
    if (!course || !token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const out: StudentRow[] = [];
        const gradeMap: Record<string, Grade | null> = {};

        for (const email of course.studentIds ?? []) {
          const grade = await getGrade(email, course.courseId);
          const { firstname, lastname } = await getUserName(email);

          out.push({
            username: email,
            firstname,
            lastname,
            hasSubmission: !!grade,
          });

          gradeMap[email] = grade;
        }

        if (!cancelled) {
          setRows(out);
          setGrades(gradeMap);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [course?.courseId, activeKey]);

  /** Abrir modal */
  const onOpenEditor = async (row: StudentRow) => {
    if (!course) return;
    setEditorStudent(row);
    setEditorMoment(activeKey);
    setEditorOpen(true);
    setEditorLoading(true);

    try {
      let grade = await getGrade(row.username, course.courseId);

      if (!grade) {
        grade = null;
      }

      const evs = courseEvaluationsFor(course, activeKey);
      const block = gradeBlockFor(grade, activeKey) ?? { questions: [] };
      const qs: GradeQuestion[] = [...(block.questions ?? [])];
      while (qs.length < evs.length) qs.push({ response: "", feedback: "" });

      const prefill = qs.map((q) => q.feedback ?? "");
      setEditorGrade(grade);
      setEditorText(prefill);
    } finally {
      setEditorLoading(false);
    }
  };

  /** Guardar feedback */
  const onSaveFeedback = async () => {
    if (!course || !editorStudent) return;
    setEditorLoading(true);
    try {
      const evs = courseEvaluationsFor(course, editorMoment);
      // clone existing or create new Grade
      const current: Grade = editorGrade
        ? JSON.parse(JSON.stringify(editorGrade))
        : {
          studentId: editorStudent.username,
          courseId: course.courseId,
        };

      // prepare questions only if we have evaluations
      if (evs.length > 0) {
        const block = gradeBlockFor(current, editorMoment) ?? { questions: [] };
        const qs: GradeQuestion[] = [...(block.questions ?? [])];
        while (qs.length < evs.length) qs.push({ response: "", feedback: "" });

        const updated = qs.map((q, i) => ({
          ...q,
          feedback: editorText[i] ?? "",
        }));

        // only set the block if there’s actual feedback
        if (updated.some((q) => (q.feedback ?? "").trim() !== "")) {
          setGradeBlockFor(current, editorMoment, {
            questions: updated,
            grade: block.grade ?? null,   // keep the grade
          });
        } else {
          // leave block undefined (so backend sees null)
          setGradeBlockFor(current, editorMoment, undefined as any);
        }
      }

      let url = `http://localhost:8081/api/grades`;
      let method: "POST" | "PUT" = "POST";
      if (current.id) {
        url = `http://localhost:8081/api/grades/${current.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(current),
      });
      if (!res.ok) throw new Error(`Guardar feedback falló: ${res.status}`);

      setEditorOpen(false);
      setGrades((prev) => ({
        ...prev,
        [editorStudent.username]: current,
      }));
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el feedback. Revisa la consola para detalles.");
    } finally {
      setEditorLoading(false);
    }
  };

  /** Stepper nav */
  const next = () => setActiveIndex((i) => Math.min(i + 1, orderedMoments.length - 1));
  const prev = () => setActiveIndex((i) => Math.max(i - 1, 0));

  /** Helpers */
  const normalizeText = (s?: string) => (s ?? "").toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /** Helpers */
  const isFeedbackComplete = (block: GradeBlock | undefined, evs?: Evaluation[]) => {
    if (!block || !evs) return false;

    return evs.every((ev, i) => {
      const q = block.questions[i];
      if (!q) return true;

      const corrects = [
        ...(ev.correctAnswers ?? []),
        ...(ev.correctAnswer ? [ev.correctAnswer] : []),
      ].filter(Boolean);

      const isCorrect = corrects.length > 0 && corrects.map(normalizeText).includes(normalizeText(q.response));

      // Si es correcta, no requiere feedback
      if (isCorrect) return true;

      // Si es incorrecta, feedback obligatorio
      return (q.feedback ?? "").trim() !== "";
    });
  };


  const FeedbackBadge = ({ block, evs }: { block: GradeBlock | undefined; evs: Evaluation[] }) => {
    if (!block) return null;
    const complete = isFeedbackComplete(block, evs);

    return complete ? (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-800 text-sm font-medium shadow-sm">
        <span className="text-green-600 font-bold">✔</span> Completo
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-800 text-sm font-medium shadow-sm">
        <span className="text-yellow-700 font-bold">⚠️</span> Incompleto
      </span>
    );
  };

  /** ===== UI ===== */
  return (
    <div className="max-w-6xl mx-auto p-4">
      <button onClick={onClose} className="text-sm text-primary-40 hover:underline mb-4">
        ← Volver al curso
      </button>

      {/* Stepper */}
      <div className="flex flex-col items-center w-full my-8">
        <div className="flex items-center w-full justify-center relative">
          {orderedMoments.map((key, idx) => {
            const active = idx === activeIndex;
            const isMoment = idx >= 0 && idx <= 2; // all three are "momentos"
            const isCompleted = idx < activeIndex;

            return (
              <div
                key={key}
                className={`flex items-center ${idx === orderedMoments.length - 1 ? "flex-none" : "flex-1"}`}
              >
                <div className="flex flex-col items-center relative">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all
                ${isCompleted
                        ? isMoment
                          ? "bg-primary-95 text-primary-40"
                          : "bg-primary-95 text-primary-40"
                        : active
                          ? isMoment
                            ? "bg-primary-40 text-white"
                            : "bg-primary-40 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                  >
                    {isCompleted ? "✔" : idx + 1}
                  </div>
                  <span className="absolute top-12 text-sm text-center w-28">
                    {momentNames[key]}
                  </span>
                </div>
                {idx < orderedMoments.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${activeIndex > idx ? "bg-primary-95" : "bg-gray-300"}`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Space to next element */}
        <div className="mt-6 flex justify-center">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          </span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-1">Revisión — {momentNames[activeKey]}</h2>
      <p className="text-gray-600 mb-6">Selecciona un estudiante para revisar y agregar retroalimentación.</p>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-md shadow hidden md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Apellido</th>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                  Cargando estudiantes...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-center text-gray-500">
                  Sin estudiantes inscritos
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const evs = courseEvaluationsFor(course, activeKey);
                const block = gradeBlockFor(grades[r.username] ?? null, activeKey);

                return (
                  <tr key={r.username} className="border-b last:border-b-0">
                    <td className="py-3 px-4">{r.firstname || "-"}</td>
                    <td className="py-3 px-4">{r.lastname || "-"}</td>
                    <td className="py-3 px-4">{r.username}</td>
                    <td className="py-3 px-4">
                      {evs[0]?.question === "NA" ? (
                        <span className="text-gray-500 text-sm">
                          Esta sección no cuenta con evaluación
                        </span>
                      ) : !r.hasSubmission || !(block?.questions?.length) ? (
                        <span className="text-gray-500 text-sm">
                          El estudiante aún no ha completado esta evaluación
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenEditor(r)}
                            className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30"
                          >
                            Retroalimentar
                          </button>
                          <FeedbackBadge block={block} evs={evs} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cards en mobile */}
      <div className="grid gap-4 md:hidden">
        {rows.map((r) => {
          const evs = courseEvaluationsFor(course, activeKey);
          const block = gradeBlockFor(grades[r.username] ?? null, activeKey);

          return (
            <div key={r.username} className="border rounded-lg p-4 shadow-sm bg-white">
              <p className="font-medium text-gray-800">{r.firstname} {r.lastname}</p>
              <p className="text-sm text-gray-500">{r.username}</p>
              <div className="mt-3">
                {evs[0]?.question === "NA" ? (
                  <span className="text-gray-500 text-sm">
                    Esta sección no cuenta con evaluación
                  </span>
                ) : !r.hasSubmission || !(block?.questions?.length) ? (
                  <span className="text-gray-500 text-sm">
                    El estudiante aún no ha completado esta evaluación
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenEditor(r)}
                      className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30"
                    >
                      Retroalimentar
                    </button>
                    <FeedbackBadge block={block} evs={evs} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer + Modal unchanged ... */}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={prev}
          disabled={activeIndex === 0}
          className={`px-4 py-2 rounded border text-sm ${activeIndex === 0
            ? "text-gray-400 border-gray-200 cursor-not-allowed"
            : "text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
        >
          Anterior
        </button>
        {activeIndex < orderedMoments.length - 1 ? (
          <button
            onClick={next}
            className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30 text-sm"
          >
            Siguiente
          </button>
        ) : (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30 text-sm"
          >
            Finalizar
          </button>
        )}
      </div>

      {/* === Modal === */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditorOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold mb-2">
              Retroalimentación — {editorStudent?.firstname} {editorStudent?.lastname}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Revise las respuestas del estudiante y ofrezca retroalimentación respecto a los errores identificados.
            </p>

            {editorLoading ? (
              <div className="text-center py-6 text-gray-500">Cargando respuestas...</div>
            ) : !editorGrade ? (
              <p className="text-gray-500">No hay respuestas para este estudiante.</p>
            ) : (
              <div className="space-y-5">
                {(() => {
                  const evs = courseEvaluationsFor(course, editorMoment);
                  const block = gradeBlockFor(editorGrade, editorMoment) ?? { questions: [] };
                  const qs: GradeQuestion[] = [...(block.questions ?? [])];
                  while (qs.length < evs.length) qs.push({ response: "", feedback: "" });

                  return evs.map((ev, i) => {
                    const resp = qs[i]?.response ?? "";
                    const corrects = [
                      ...(ev.correctAnswers ?? []),
                      ...(ev.correctAnswer ? [ev.correctAnswer] : []),
                    ].filter(Boolean);
                    const isCorrect = corrects.length > 0 && corrects.map(normalizeText).includes(normalizeText(resp));

                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-4 shadow-sm ${resp.trim() === ""
                          ? "bg-orange-50 border border-orange-400"
                          : isCorrect
                            ? "bg-green-50 border border-green-400"
                            : "bg-red-50 border border-red-400"
                          }`}
                      >
                        <p className="font-bold text-lg text-gray-600 mb-2">Pregunta {i + 1}</p>

                        <p className="mb-2 text-gray-800 text-justify">{ev.question}</p>

                        <hr
                          className={`my-2 border-t ${resp.trim() === ""
                            ? "border-orange-400"
                            : isCorrect
                              ? "border-green-400"
                              : "border-red-400"
                            }`}
                        />

                        <p className="text-sm mb-2 text-gray-600">
                          {resp.trim() !== "" ? (
                            <>
                              <span className="font-semibold">Respuesta del estudiante:</span>{" "}
                              {resp}
                            </>
                          ) : (
                            <span className="font-semibold">
                              — El estudiante no respondió esta pregunta —
                            </span>
                          )}
                        </p>

                        {corrects.length > 0 && (
                          <p className="text-sm mb-2 text-gray-600">
                            <span className="font-semibold">Respuesta correcta:</span>{" "}
                            {corrects.join(" | ")}
                          </p>
                        )}

                        {!isCorrect && (
                          <>
                            <hr className="my-2 border-t border-red-400" />
                            <p className="text-sm mb-2 text-gray-600">
                              <span className="font-semibold">Retroalimentación:</span>
                            </p>
                            <textarea
                              className="w-full border rounded-md p-3 text-sm"
                              rows={2}
                              placeholder="Escribe tu retroalimentación..."
                              value={editorText[i] ?? ""}
                              onChange={(e) => {
                                const copy = [...editorText];
                                copy[i] = e.target.value;
                                setEditorText(copy);
                              }}
                            />
                          </>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 rounded border text-gray-700 border-gray-300 hover:bg-gray-50 text-sm"
                disabled={editorLoading}
              >
                Cancelar
              </button>
              <button
                onClick={onSaveFeedback}
                disabled={editorLoading || !editorGrade}
                className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30 text-sm disabled:opacity-50"
              >
                {editorLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
