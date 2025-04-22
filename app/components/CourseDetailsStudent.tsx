'use client';
import React from 'react';
import Resumen from './Resumen';

interface CourseDetailsStudentProps {
  course: Course;
  images: Record<string, string>;
  onBack: () => void;
  onSelectCard: (section: string) => void;
}

const CourseDetailsStudent = ({ course, images, onBack, onSelectCard }: CourseDetailsStudentProps) => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl px-8 py-8 space-y-8 bg-white">
        {/* Resumen */}
        <h2 className="text-2xl font-semibold text-gray-800">Resumen</h2>
        <Resumen description={course.courseDescription} />

        {/* Tarjetas de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Antes de clase', status: 'Sin iniciar' },
            { title: 'Durante la clase', status: 'Sin iniciar' },
            { title: 'Después de la clase', status: 'Sin iniciar' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-5 bg-white hover:shadow transition cursor-pointer"
              onClick={() => onSelectCard(item.title)}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              {item.status && (
                <span className="inline-block text-sm text-gray-500 mb-2">
                  {item.status}
                </span>
              )}
              <p className="text-sm font-semibold text-gray-700">
                Nombre de la actividad
              </p>
              <p className="text-sm font-semibold text-gray-700">
                Tiempo estimado
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Descripción máximo se mostrarán dos líneas.
              </p>
            </div>
          ))}
        </div>

        {/* Información del docente */}
        <div className="w-full border border-gray-200 rounded-xl p-6 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Información del docente
          </h3>
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl">
              😊
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {course.teacherName}
              </h4>
              <p className="text-sm text-gray-600">{course.teacherTitle}</p>
              <a
                href={`mailto:${course.teacherEmail}`}
                className="text-sm text-gray-500 hover:text-primary-600"
              >
                {course.teacherEmail}
              </a>
            </div>
          </div>
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
