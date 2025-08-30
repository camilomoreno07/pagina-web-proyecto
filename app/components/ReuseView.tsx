"use client";
import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";

type StageKey = "beforeClass" | "duringClass" | "afterClass";
type SectionKey = "instructions" | "contents" | "evaluations";

interface CourseDTO {
  courseId: string;
  courseName: string;
}

interface FullCourseDTO {
  courseId: string;
  courseName?: string;
  courseDescription?: string | null;
  professorIds?: string[];
  studentIds?: string[];
  beforeClass?: { instructions?: any; contents?: any; evaluations?: any };
  duringClass?: { instructions?: any; contents?: any; evaluations?: any };
  afterClass?: { instructions?: any; contents?: any; evaluations?: any };
  isPublic?: boolean | null;
  imageUrl?: string | null;
  momentStatus?: any;
  teacherName?: string | null;
  teacherTitle?: string | null;
  teacherEmail?: string | null;
}

interface ReuseViewProps {
  onCancel: () => void;
  onSave: (payload: {
    sourceCourseId: string;
    targetCourseId: string;
    reuse: {
      beforeClass: { instructions: boolean; contents: boolean; evaluations: boolean };
      duringClass: { instructions: boolean; contents: boolean; evaluations: boolean };
      afterClass: { instructions: boolean; contents: boolean; evaluations: boolean };
    };
  }) => void;
  // curso destino (actual) — requerido para guardar
  targetCourse: { courseId: string; courseName: string };
}

const LABELS: Record<StageKey, string> = {
  beforeClass: "Antes de clase",
  duringClass: "Durante la clase",
  afterClass: "Después de clase",
};

export default function ReuseView({ onCancel, onSave, targetCourse }: ReuseViewProps) {
  // Lista de cursos (para elegir fuente)
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Guardado
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Curso fuente seleccionado
  const [sourceCourseId, setSourceCourseId] = useState<string>("");

  // Qué reusar por etapa
  const [reuse, setReuse] = useState({
    beforeClass: { instructions: false, contents: false, evaluations: false },
    duringClass: { instructions: false, contents: false, evaluations: false },
    afterClass:  { instructions: false, contents: false, evaluations: false },
  });

  // Acordeones
  const [open, setOpen] = useState<{ [K in StageKey]: boolean }>({
    beforeClass: true,
    duringClass: false,
    afterClass: false,
  });

  // Cargar cursos para el select
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch("http://localhost:8081/api/courses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("No se pudo cargar la lista de cursos");
        const data: CourseDTO[] = await res.json();
        setCourses(data);
        setLoadError(null);
      } catch (e: any) {
        setLoadError(e?.message || "Error cargando cursos");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const anyChecked = useMemo(() => {
    const s = reuse;
    return (
      s.beforeClass.instructions || s.beforeClass.contents || s.beforeClass.evaluations ||
      s.duringClass.instructions || s.duringClass.contents || s.duringClass.evaluations ||
      s.afterClass.instructions  || s.afterClass.contents  || s.afterClass.evaluations
    );
  }, [reuse]);

  const toggleStage = (stage: StageKey) =>
    setOpen((p) => ({ ...p, [stage]: !p[stage] }));

  const toggleBox = (stage: StageKey, key: keyof (typeof reuse)["beforeClass"]) =>
    setReuse((p) => ({ ...p, [stage]: { ...p[stage], [key]: !p[stage][key] } }));

  // Deep clone naive
  const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

  // Aplica reuso: copia lo marcado de source → target
  const applyReuse = (source: FullCourseDTO, target: FullCourseDTO): FullCourseDTO => {
    const out = deepClone(target);
    (["beforeClass","duringClass","afterClass"] as StageKey[]).forEach((stage) => {
      const marks = reuse[stage];
      (out as any)[stage] = (out as any)[stage] ?? {};
      const outStage = (out as any)[stage];
      const srcStage = (source as any)[stage] ?? {};
      (["instructions","contents","evaluations"] as SectionKey[]).forEach((sec) => {
        if (marks[sec] && srcStage?.[sec] !== undefined) {
          outStage[sec] = deepClone(srcStage[sec]);
        }
      });
    });
    return out;
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Falta token");
      if (!sourceCourseId) throw new Error("Selecciona un curso fuente");
      if (!anyChecked) throw new Error("Marca al menos una sección a reusar");
      if (!targetCourse?.courseId) throw new Error("No hay curso destino (actual)");

      // 1) GET curso fuente (completo)
      const srcRes = await fetch(`http://localhost:8081/api/courses/${sourceCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!srcRes.ok) throw new Error((await srcRes.text()) || "No se pudo cargar el curso fuente");
      const sourceCourse: FullCourseDTO = await srcRes.json();

      // 2) GET curso destino (actual, completo)
      const tgtRes = await fetch(`http://localhost:8081/api/courses/${targetCourse.courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!tgtRes.ok) throw new Error((await tgtRes.text()) || "No se pudo cargar el curso actual");
      const currentTarget: FullCourseDTO = await tgtRes.json();

      // 3) Merge según selecciones
      const merged: FullCourseDTO = applyReuse(sourceCourse, currentTarget);

      // 4) Guardar curso destino (PUT completo; cambia a PATCH si tu API lo prefiere)
      const saveRes = await fetch(`http://localhost:8081/api/courses/${targetCourse.courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(merged),
      });
      if (!saveRes.ok) throw new Error((await saveRes.text()) || "Error guardando curso actual");

      // 5) Notifica al padre con ambos IDs
      onSave({
        sourceCourseId,
        targetCourseId: targetCourse.courseId,
        reuse,
      });
    } catch (e: any) {
      setSaveError(e?.message || "Error guardando reuso");
      console.error("Reuse save error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 bg-white shadow-none border-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Reuso</h2>
          {targetCourse && (
            <p className="text-sm text-gray-500">
              Reusando en: <span className="font-medium">{targetCourse.courseName}</span>
            </p>
          )}
        </div>
      </div>

      {/* 1) Select del curso fuente */}
      <div className="space-y-2">
        <label className="block text-gray-700">
          Selecciona el curso del cual deseas reusar contenido
        </label>
        <div className="w-full border rounded-lg px-4 py-3 bg-gray-50">
          {loading ? (
            <span className="text-gray-500">Cargando cursos...</span>
          ) : loadError ? (
            <span className="text-red-500">{loadError}</span>
          ) : (
            <select
              value={sourceCourseId}
              onChange={(e) => setSourceCourseId(e.target.value)}
              className="w-full bg-transparent outline-none"
            >
              <option value="">— Selecciona un curso —</option>
              {courses.map((c) => (
                <option key={c.courseId} value={c.courseId}>
                  {c.courseName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 2) Acordeones por etapa */}
      <div className="space-y-4">
        {(["beforeClass","duringClass","afterClass"] as StageKey[]).map((stage) => (
          <div key={stage} className="border rounded-lg">
            <button
              type="button"
              onClick={() => toggleStage(stage)}
              className="w-full flex items-center justify-between px-4 py-3"
            >
              <span className="font-medium">{LABELS[stage]}</span>
              <span className="text-gray-500">{open[stage] ? "▴" : "▾"}</span>
            </button>
            {open[stage] && (
              <div className="px-4 pb-4 flex flex-wrap gap-6 items-center">
                {(["instructions","contents","evaluations"] as SectionKey[]).map((sec) => (
                  <label key={sec} className="flex items-center gap-2 capitalize">
                    <input
                      type="checkbox"
                      checked={(reuse as any)[stage][sec]}
                      onChange={() => toggleBox(stage, sec)}
                    />
                    <span className="font-medium">{sec}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Errores y acciones */}
      {saveError && <div className="text-red-600 text-sm">{saveError}</div>}

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-primary-40 text-primary-40 hover:bg-primary-95 transition"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg bg-primary-40 text-white hover:bg-primary-30 transition disabled:opacity-60"
          disabled={!sourceCourseId || !anyChecked || !targetCourse?.courseId || saving}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
