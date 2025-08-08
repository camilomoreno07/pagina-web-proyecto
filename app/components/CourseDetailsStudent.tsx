'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Resumen from './Resumen';
import { FaUser } from 'react-icons/fa';

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
  course: Course;
  images: Record<string, string>;
  onBack: () => void;
  onSelectCard: (section: string) => void;
}

const CourseDetailsStudent = ({
  course,
  images,
  onBack,
  onSelectCard,
}: CourseDetailsStudentProps) => {
  const [professors, setProfessors] = useState<User[]>([]);

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

  const sumTime = (items?: { time?: number }[]): number => {
    if (!Array.isArray(items)) {
      return items?.time || 0;
    }
    return items.reduce((total, item) => total + (item.time || 0), 0);
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
      title: 'Aula Invertida',
      description: 'Aquí podrás explorar una vista previa del contenido y las actividades que se abordarán durante la sesión presencial',
      section: course.beforeClass,
      sectionKey: 'Antes de clase',
    },
    {
      title: 'Taller de Habilidad',
      description: 'En esta sección encontrarás recursos e indicaciones que te acompañarán durante las sesiones de clase',
      section: course.duringClass,
      sectionKey: 'Durante la clase',
    },
    {
      title: 'Actividad Experiencial',
      description: 'Aquí tendrás acceso a materiales que te permitirán consolidar los conceptos vistos durante las clases',
      section: course.afterClass,
      sectionKey: 'Después de la clase',
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
          {sectionData.map(({ title, section, description, sectionKey }, idx) => {
            const totalTime = calculateTotalTime(section);

            return (
              <div
                key={idx}
                className="border rounded-lg p-5 bg-white hover:shadow transition cursor-pointer"
                onClick={() => onSelectCard(sectionKey)}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <hr className="border-t border-gray-200 mb-2" />
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-semibold text-gray-500">Tiempo estimado:</h2>
                  <p className="text-sm px-2 py-1 rounded text-green-700 bg-green-100 inline-block">
                    {totalTime} min
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-1 text-justify">
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
