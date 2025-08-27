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
  username: string;        // correo
  firstname: string;
  lastname: string;
  hasSubmission: boolean;  // true => mostrar botón retroalimentar
}

interface GradeQuestion {
  response: string;
  feeback?: string;  // (sic) tu backend/cliente lo usa así
  feedback?: string; // por si el backend lo devuelve bien escrito
}
interface GradeBlock {
  questions: GradeQuestion[];
}
interface Grade {
  id?: string;                 // necesario para PUT /grades/{id}
  studentId: string;           // email
  courseId: string;
  aulaVirtual?: GradeBlock;
  tallerHabilidad?: GradeBlock;
  actividadExperiencial?: GradeBlock;
}

interface FeedbackProps {
  course: Course | null;
  onClose: () => void;
}

/** ===== Constantes/UI ===== */
const token = Cookies.get("token") ?? "";
const authHeaders = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const momentNames: Record<MomentKey, string> = {
  beforeClass: "Aula Invertida",
  duringClass: "Taller de Habilidad",
  afterClass: "Actividad Experiencial",
};
const orderedMoments: MomentKey[] = ["beforeClass", "duringClass", "afterClass"];

/** ===== Helpers de datos ===== */
const fetchJSON = async (url: string) => {
  const res = await fetch(url, { headers: authHeaders });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
};

const getUserName = async (email: string): Promise<{ firstname: string; lastname: string }> => {
  // 1) path variable
  try {
    const d = await fetchJSON(`http://localhost:8081/api/users/${encodeURIComponent(email)}`);
    if (Array.isArray(d)) {
      const hit = d.find((u: any) => u?.username === email);
      if (hit) return { firstname: hit.firstname ?? "", lastname: hit.lastname ?? "" };
    } else if (d) {
      return { firstname: d.firstname ?? "", lastname: d.lastname ?? "" };
    }
  } catch {}
  // 2) query param
  try {
    const d = await fetchJSON(`http://localhost:8081/api/users?id=${encodeURIComponent(email)}`);
    const hit = Array.isArray(d) ? d.find((u: any) => u?.username === email) : d;
    if (hit) return { firstname: hit.firstname ?? "", lastname: hit.lastname ?? "" };
  } catch {}
  return { firstname: "", lastname: "" };
};

const getGrade = async (email: string, courseId: string): Promise<Grade | null> => {
  const url = `http://localhost:8081/api/grades/student/${encodeURIComponent(email)}/course/${courseId}`;
  try {
    const res = await fetch(url, { headers: authHeaders });
    if (res.status === 404) return null;       // no hay entrega
    if (!res.ok) throw new Error(String(res.status));
    const g = (await res.json()) as Grade;
    return g;
  } catch {
    return null;
  }
};

const courseEvaluationsFor = (course: Course | null, key: MomentKey): Evaluation[] =>
  (course?.[key]?.evaluations ?? []) as Evaluation[];

const gradeBlockFor = (g: Grade | null, key: MomentKey): GradeBlock | undefined => {
  if (!g) return undefined;
  if (key === "beforeClass") return g.aulaVirtual;
  if (key === "duringClass") return g.tallerHabilidad;
  return g.actividadExperiencial;
};

const setGradeBlockFor = (g: Grade, key: MomentKey, block: GradeBlock) => {
  if (key === "beforeClass") g.aulaVirtual = block;
  else if (key === "duringClass") g.tallerHabilidad = block;
  else g.actividadExperiencial = block;
};

/** ===== Componente principal ===== */
export default function Feedback({ course, onClose }: FeedbackProps) {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Editor lateral
  const [openEditor, setOpenEditor] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorStudent, setEditorStudent] = useState<StudentRow | null>(null);
  const [editorGrade, setEditorGrade] = useState<Grade | null>(null);
  const [editorMoment, setEditorMoment] = useState<MomentKey>("beforeClass");
  const [editorText, setEditorText] = useState<string[]>([]); // feedback por pregunta

  const activeKey = orderedMoments[activeIndex];
  const activeLabel = momentNames[activeKey];

  /** Cargar filas (estudiantes + estado de entrega) */
  useEffect(() => {
    if (!course || !token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const out: StudentRow[] = [];
        for (const email of course.studentIds ?? []) {
          const grade = await getGrade(email, course.courseId);
          let firstname = "";
          let lastname = "";

          if ((grade as any)?.firstname || (grade as any)?.lastname) {
            firstname = (grade as any).firstname ?? "";
            lastname  = (grade as any).lastname ?? "";
          } else {
            const u = await getUserName(email);
            firstname = u.firstname;
            lastname  = u.lastname;
          }

          out.push({
            username: email,
            firstname,
            lastname,
            hasSubmission: !!grade,
          });
        }
        if (!cancelled) setRows(out);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [course?.courseId]);

  /** Abrir editor lateral con grade y prefill */
  const onOpenEditor = async (row: StudentRow) => {
    if (!course) return;
    setEditorStudent(row);
    setEditorMoment(activeKey);
    setOpenEditor(true);
    setEditorLoading(true);

    try {
      let grade = await getGrade(row.username, course.courseId);
      if (!grade) {
        // por seguridad, aunque el botón solo aparece si hay entrega
        grade = {
          studentId: row.username,
          courseId: course.courseId,
          aulaVirtual: { questions: [] },
          tallerHabilidad: { questions: [] },
          actividadExperiencial: { questions: [] },
        };
      } else {
        grade.aulaVirtual ??= { questions: [] };
        grade.tallerHabilidad ??= { questions: [] };
        grade.actividadExperiencial ??= { questions: [] };
      }

      // preparar feedbacks del momento activo
      const evs = courseEvaluationsFor(course, activeKey);
      const block = gradeBlockFor(grade, activeKey) ?? { questions: [] };
      const qs: GradeQuestion[] = [...(block.questions ?? [])];
      while (qs.length < evs.length) qs.push({ response: "", feeback: "" });

      const prefill = qs.map((q) => q.feeback ?? q.feedback ?? "");
      setEditorGrade(grade);
      setEditorText(prefill);
    } finally {
      setEditorLoading(false);
    }
  };

  /** Guardar feedback: PUT /api/grades/{id} si existe; si no, POST /api/grades */
  const onSaveFeedback = async () => {
    if (!course || !editorStudent || !editorGrade) return;
    setEditorLoading(true);
    try {
      // reconstruir bloque para el momento seleccionado en el panel
      const evs = courseEvaluationsFor(course, editorMoment);
      const current = JSON.parse(JSON.stringify(editorGrade)) as Grade;

      const block = gradeBlockFor(current, editorMoment) ?? { questions: [] };
      const qs: GradeQuestion[] = [...(block.questions ?? [])];
      while (qs.length < evs.length) qs.push({ response: "", feeback: "" });

      const updated = qs.map((q, i) => ({ ...q, feeback: editorText[i] ?? "" }));
      setGradeBlockFor(current, editorMoment, { questions: updated });

      // decide método/URL
      let url = "http://localhost:8081/api/grades";
      let method: "POST" | "PUT" = "POST";
      if (current.id) {
        url = `http://localhost:8081/api/grades/${current.id}`;
        method = "PUT";
      }

      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(current) });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Guardar feedback falló: ${res.status} ${txt}`);
      }

      setOpenEditor(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el feedback. Revisa la consola para detalles.");
    } finally {
      setEditorLoading(false);
    }
  };

  /** Navegación del stepper */
  const next = () => setActiveIndex((i) => Math.min(i + 1, orderedMoments.length - 1));
  const prev = () => setActiveIndex((i) => Math.max(i - 1, 0));

  /** ===== UI ===== */
  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onClose} className="text-sm text-primary-40 hover:underline mb-4">← Salir</button>

      {/* Stepper */}
      <div className="flex items-center gap-10 mb-8">
        {orderedMoments.map((key, idx) => {
          const active = idx === activeIndex;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full border ${active ? "bg-primary-40 text-white border-primary-40" : "bg-gray-200 text-gray-700 border-gray-300"}`}>{idx + 1}</div>
              <div className="text-sm text-gray-700 w-28">{momentNames[key]}</div>
              {idx < orderedMoments.length - 1 && <div className="w-16 h-[2px] bg-gray-300" />}
            </div>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold mb-1">Revisión de resultados - {momentNames[orderedMoments[activeIndex]]}</h2>
      <p className="text-gray-600 mb-6">Selecciona a un estudiante para brindar retroalimentación</p>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Apellido</th>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Estado / Acción</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-6 px-4 text-center text-gray-500">Cargando estudiantes...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} className="py-6 px-4 text-center text-gray-500">Sin inscritos aún</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.username} className="border-b last:border-b-0">
                  <td className="py-3 px-4">{r.firstname || "-"}</td>
                  <td className="py-3 px-4">{r.lastname || "-"}</td>
                  <td className="py-3 px-4">{r.username}</td>
                  <td className="py-3 px-4">
                    {r.hasSubmission ? (
                      <button
                        onClick={() => onOpenEditor(r)}
                        className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30"
                      >
                        Retroalimentar
                      </button>
                    ) : (
                      <span className="text-gray-600 text-sm">El estudiante aún no ha presentado la evaluación</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6">
        <button onClick={prev} disabled={activeIndex === 0}
          className={`px-4 py-2 rounded border ${activeIndex === 0 ? "text-gray-400 border-gray-200 cursor-not-allowed" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
          Anterior
        </button>
        {activeIndex < orderedMoments.length - 1 ? (
          <button onClick={next} className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30">Siguiente</button>
        ) : (
          <button onClick={onClose} className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30">Finalizar</button>
        )}
      </div>

      {/* Slide-over editor */}
      {openEditor && (
        <div className="fixed inset-0 z-50 flex">
          {/* overlay */}
          <div className="flex-1 bg-black/30" onClick={() => !editorLoading && setOpenEditor(false)} />
          {/* panel */}
          <div className="w-full max-w-xl bg-white h-full p-5 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Retroalimentar — {editorStudent?.firstname} {editorStudent?.lastname} ({editorStudent?.username})
              </h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => !editorLoading && setOpenEditor(false)}>✕</button>
            </div>

            {/* Selector de momento dentro del panel */}
            <div className="flex gap-2 mb-4">
              {orderedMoments.map((k) => (
                <button
                  key={k}
                  onClick={() => setEditorMoment(k)}
                  className={`px-3 py-1 rounded border ${editorMoment === k ? "bg-primary-40 text-white border-primary-40" : "bg-white text-gray-700 border-gray-300"}`}
                  disabled={editorLoading}
                >
                  {momentNames[k]}
                </button>
              ))}
            </div>

            {editorLoading ? (
              <p className="text-gray-500">Cargando…</p>
            ) : !editorGrade ? (
              <p className="text-gray-500">No hay respuestas para este estudiante.</p>
            ) : (
              <div className="space-y-4">
                {(() => {
                  const evs = courseEvaluationsFor(course, editorMoment);
                  const block = gradeBlockFor(editorGrade, editorMoment) ?? { questions: [] };
                  const qs: GradeQuestion[] = [...(block.questions ?? [])];
                  while (qs.length < evs.length) qs.push({ response: "", feeback: "" });

                  return evs.map((ev, i) => {
                    const resp = qs[i]?.response ?? "";
                    const corrects = [
                      ...(ev.correctAnswers ?? []),
                      ...(ev.correctAnswer ? [ev.correctAnswer] : []),
                    ].filter(Boolean);

                    return (
                      <div key={i} className="border rounded p-3">
                        <p className="font-medium mb-1">Pregunta {i + 1}</p>
                        <p className="text-gray-800 mb-2">{ev.question}</p>

                        <div className="text-sm mb-2">
                          <span className="font-semibold">Respuesta del estudiante: </span>
                          <span className="text-gray-700 break-words">{resp || "—"}</span>
                        </div>

                        {corrects.length > 0 && (
                          <div className="text-sm mb-2">
                            <span className="font-semibold">Respuesta(s) correcta(s): </span>
                            <span className="text-gray-700">{corrects.join(" | ")}</span>
                          </div>
                        )}

                        <label className="block text-sm font-medium mb-1">Feedback</label>
                        <textarea
                          className="w-full border rounded px-3 py-2 text-sm"
                          rows={3}
                          value={editorText[i] ?? ""}
                          onChange={(e) => {
                            const copy = [...editorText];
                            copy[i] = e.target.value;
                            setEditorText(copy);
                          }}
                          disabled={editorLoading}
                          placeholder="Escribe tu retroalimentación…"
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setOpenEditor(false)}
                disabled={editorLoading}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-primary-40 text-white hover:bg-primary-30 disabled:opacity-60"
                onClick={onSaveFeedback}
                disabled={editorLoading || !editorGrade}
              >
                {editorLoading ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
