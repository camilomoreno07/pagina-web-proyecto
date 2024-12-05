"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

const Page = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('token'); // Eliminar el token de las cookies
    router.push('/auth/login'); // Redirigir a la página de inicio de sesión
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-100">
      <header className="bg-white shadow-md rounded-lg p-4 mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard Estudiantil</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="flex flex-1 space-x-6">
        {/* Sidebar */}
        <aside className="w-1/4 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Navegación</h2>
          <ul>
            <li className="py-2 hover:bg-gray-200 rounded"><a href="#">Cursos</a></li>
            <li className="py-2 hover:bg-gray-200 rounded"><a href="#">Notas</a></li>
            <li className="py-2 hover:bg-gray-200 rounded"><a href="#">Perfil</a></li>
            <li className="py-2 hover:bg-gray-200 rounded"><a href="#">Configuración</a></li>
          </ul>
        </aside>

        {/* Contenido Principal */}
        <div className="flex-1 space-y-6">
          {/* Sección de Cursos */}
          <section className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Mis Cursos</h2>
            <ul className="space-y-2">
              <li className="p-4 border rounded hover:bg-gray-100">Curso de Medicina</li>
              <li className="p-4 border rounded hover:bg-gray-100">Curso de Medicina</li>
              <li className="p-4 border rounded hover:bg-gray-100">Curso de Medicina</li>
            </ul>
          </section>

          {/* Sección de Notas */}
          <section className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Notas</h2>
            <ul className="space-y-2">
              <li className="p-4 border rounded hover:bg-gray-100">Curso de Medicina: 4.5</li>
              <li className="p-4 border rounded hover:bg-gray-100">Curso de Medicina: 4.6</li>
              <li className="p-4 border rounded hover:bg-gray-100">Curso de Medicina: 4.9</li>
            </ul>
          </section>
        </div>
      </main>

      <footer className="mt-6 text-center text-gray-600">
        <p>&copy; 2024 Plataforma Estudiantil. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Page;
