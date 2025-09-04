'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Resumen from './Resumen';
import { FaUser } from 'react-icons/fa';

const token = Cookies.get("token");
let username: string | null = null;
if (token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    username = payload.sub;
  } catch (err) {
    console.error("Error decoding token:", err);
  }
}

interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
}

interface TimeItem {
  time?: number;
}

interface CourseSection {
  contents?: TimeItem[];
  evaluations?: TimeItem[];
  instructions?: TimeItem[];
}

interface Course {
  professorIds?: string[];
  courseDescription: string;
  beforeClass?: CourseSection;
  duringClass?: CourseSection;
  afterClass?: CourseSection;
}

interface CourseDetailsStudentProps {
  courseId: string;
  course: Course;
  images: Record<string, string>;
  onBack: () => void;
  onSelectCard: (section: string) => void;
}

/** ===== Nuevos tipos para progreso ===== */
interface ContentProgress {
  contentsCompleted: boolean[];
}

interface MomentProgress {
  instructionCompleted: boolean;
  contentProgress: ContentProgress;
  evaluationCompleted: boolean;
  omittedMoments?: number;
}

interface Progress {
  id: string;
  courseId: string;
  studentId: string;
  aulaInvertida: MomentProgress;
  tallerHabilidad: MomentProgress;
  actividadExperiencial: MomentProgress;
}

/** ===== Helpers ===== */
const getProgressPercentage = (moment: MomentProgress): number => {
  if (!moment) return 0;

  const contents = moment.contentProgress?.contentsCompleted || [];
  const completedContents = contents.filter(Boolean).length;
  const totalContents = contents.length;

  // Instrucción + contenidos + evaluación
  const baseTotal = 2 + totalContents;

  // Descuento por omitidos
  const totalItems = Math.max(baseTotal - (moment.omittedMoments || 0), 0);

  const completed =
    (moment.instructionCompleted ? 1 : 0) +
    completedContents +
    (moment.evaluationCompleted ? 1 : 0);
    
  return totalItems > 0 ? completed / totalItems : 0;
};

const ProgressBadge = ({ value }: { value: number }) => {
  if (value === 0) {
    return (
      <p className="text-sm px-2 py-1 rounded text-gray-600 bg-gray-200 inline-block">
        Sin Iniciar
      </p>
    );
  }
  if (value === 1) {
    return (
      <p className="text-sm px-2 py-1 rounded text-green-700 bg-green-100 inline-block">
        Completado
      </p>
    );
  }
  return (
    <p className="text-sm px-2 py-1 rounded text-yellow-700 bg-yellow-100 inline-block">
      En Progreso
    </p>
  );
};

const CourseDetailsStudent = ({
  courseId,
  course,
  images,
  onBack,
  onSelectCard,
}: CourseDetailsStudentProps) => {
  const [professors, setProfessors] = useState<User[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);

  /** ===== Cargar profesores ===== */
  useEffect(() => {
    const fetchProfessors = async () => {
      const token = Cookies.get('token');
      if (!token || !course.professorIds?.length) return;

      try {
        const loadedProfessors: User[] = [];

        for (const username of course.professorIds) {
          const res = await fetch(`http://localhost:8081/api/users/${username}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const user: User = await res.json();
            loadedProfessors.push(user);
          } else if (res.status !== 404) {
            console.error(`Error al obtener usuario ${username}:`, await res.text());
          }
        }

        setProfessors(loadedProfessors);
      } catch (err) {
        console.error('Error al cargar información de los docentes:', err);
      }
    };

    fetchProfessors();
  }, [course.professorIds]);

  /** ===== Cargar progreso del estudiante ===== */
  useEffect(() => {
    const fetchProgress = async () => {
      const token = Cookies.get('token');
      if (!token || !username) return;

      console.log(courseId);
      console.log(username);

      try {
        const res = await fetch(
          `http://localhost:8081/api/progress/course/${courseId}/student/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data: Progress = await res.json();
          console.log(data)
          setProgress(data);
        }
      } catch (err) {
        console.error('Error al cargar progreso:', err);
      }
    };

    fetchProgress();
  }, [courseId]);

  /** ===== Utilidades de tiempo ===== */
  const sumTime = (items?: TimeItem | TimeItem[]): number => {
    if (!items) return 0;

    if (Array.isArray(items)) {
      if (items.length > 0 && (items[0] as any)?.experienceUrl) {
        // quitar si se desea manejar xr en minutos
        return (items[0].time || 0) * 60;
      }

      return items.reduce((total, item) => total + (item.time || 0), 0);
    }

    return items.time || 0;
  };

  const calculateTotalTime = (section?: CourseSection): number => {
    if (!section) return 0;
    return (
      sumTime(section.contents) +
      sumTime(section.evaluations) +
      sumTime(section.instructions)
    );
  };

  const sectionData = [
    {
      title: 'Prebriefing',
      description:
        'Aquí podrás explorar una vista previa del contenido y las actividades que se abordarán durante la sesión presencial',
      section: course.beforeClass,
      sectionKey: 'Antes de clase',
      progressKey: 'aulaInvertida' as const,
    },
    {
      title: 'Briefing',
      description:
        'En esta sección encontrarás recursos e indicaciones que te acompañarán durante las sesiones de clase',
      section: course.duringClass,
      sectionKey: 'Durante la clase',
      progressKey: 'tallerHabilidad' as const,
    },
    {
      title: 'Debriefing',
      description:
        'Aquí tendrás acceso a materiales que te permitirán consolidar los conceptos vistos durante las clases',
      section: course.afterClass,
      sectionKey: 'Después de la clase',
      progressKey: 'actividadExperiencial' as const,
    },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl px-8 py-8 space-y-8 bg-white">
        {/* Resumen */}
        <h2 className="text-2xl font-semibold text-gray-800">Resumen</h2>
        <Resumen description={course.courseDescription} />

        {/* Tarjetas de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sectionData.map(({ title, section, description, sectionKey, progressKey }, idx) => {
            const totalTime = calculateTotalTime(section);
            const value = progress ? getProgressPercentage(progress[progressKey]) : 0;

            return (
              <div
                key={idx}
                className="border rounded-lg p-5 bg-white hover:shadow transition cursor-pointer"
                onClick={() => onSelectCard(sectionKey)}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-semibold text-gray-500">Progreso:</h2>
                  {progress ? (
                    <ProgressBadge value={value} />
                  ) : (
                    <p className="text-sm text-gray-400">Cargando...</p>
                  )}
                </div>
                <hr className="border-t border-gray-200 mt-2 mb-2" />
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-semibold text-gray-500">Tiempo estimado:</h2>
                  <p className="text-sm px-2 py-1 rounded text-gray-600 bg-gray-200 inline-block">
                    {totalTime} min
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-1 mb-4 text-justify">
                  {description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Información del docente */}
        <div className="w-full border border-gray-200 rounded-xl p-6 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-500 mb-6">Información del docente</h3>
          {professors.length > 0 ? (
            <div className="space-y-4">
              {professors.map((prof, index) => (
                <div key={prof.id}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl">
                      <FaUser />
                    </div>
                    <div>
                      <h4 className="text-md font-semibold text-gray-800">
                        {prof.firstname} {prof.lastname}
                      </h4>
                      <p className="text-sm text-gray-600">{prof.username}</p>
                    </div>
                  </div>
                  {index < professors.length - 1 && <hr className="my-4 border-gray-300" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay información de docentes disponible
            </p>
          )}
        </div>

        {/* Botón volver */}
        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-300"
          >
            Volver al listado
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsStudent;
