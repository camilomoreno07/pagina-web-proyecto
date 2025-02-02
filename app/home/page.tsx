"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Card from "../components/Card";
import {
  FaBook,
  FaEnvelope,
  FaCalendarAlt,
  FaPlus,
  FaBars,
  FaEdit,
  FaTimes,
} from "react-icons/fa"; // Añadí FaTimes

const Dashboard = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCourse, setNewCourse] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulating fetching data for courses
    const fetchCourses = async () => {
      try {
        // Replace with actual API call to fetch courses
        const data = [
          "Curso de Anatomía",
          "Curso de Fisiología",
          "Curso de Patología",
        ];
        setCourses(data);
      } catch (error) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleLogout = () => {
    try {
      Cookies.remove("token"); // Eliminar el token de las cookies
      router.push("/auth/login"); // Redirigir a la página de inicio de sesión
    } catch (err) {
      console.error("Logout failed", err);
      // Handle logout error (e.g., show a message to the user)
    }
  };

  const handleAddCourse = () => {
    if (newCourse.trim()) {
      setCourses([...courses, newCourse]);
      setNewCourse("");
      setShowModal(false);
    } else {
      alert("Por favor, ingrese un nombre de curso válido.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">EduLMS</h1>
        {/* Botón de cerrar sesión en pantalla web */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded hidden sm:block"
        >
          Cerrar Sesión
        </button>
        {/* Hamburger Menu Icon for Mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="block sm:hidden px-4 py-2 text-white"
        >
          {isSidebarOpen ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaBars className="text-2xl" />
          )}
        </button>
      </header>

      <main className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "fixed inset-0 z-50 bg-white shadow-md" : "hidden"
          } sm:block sm:relative sm:inset-auto sm:z-auto w-full sm:w-64 bg-white shadow-md p-4 space-y-6`}
        >
          {/* Close Button for Mobile */}
          <div className="flex justify-end sm:hidden">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          <nav>
            <ul className="space-y-4">
              <li className="p-2 flex flex-col items-center bg-primary/10 rounded hover:bg-primary/20 cursor-pointer">
                <FaBook className="text-primary text-2xl mb-1" />
                <span className="text-primary font-medium">Cursos</span>
              </li>
              <li className="p-2 flex flex-col items-center bg-primary/10 rounded hover:bg-primary/20 cursor-pointer">
                <FaEnvelope className="text-primary text-2xl mb-1" />
                <span className="text-primary font-medium">Mensajes</span>
              </li>
              <li className="p-2 flex flex-col items-center bg-primary/10 rounded hover:bg-primary/20 cursor-pointer">
                <FaCalendarAlt className="text-primary text-2xl mb-1" />
                <span className="text-primary font-medium">Calendario</span>
              </li>
            </ul>
          </nav>

          {/* Add Logout button inside sidebar for mobile */}
          <div className="mt-4 sm:hidden">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4">¡Hola, profesor!</h2>

          {/* Courses Section */}
          <section>
            <div className="flex flex-wrap gap-4 p-6">
              <Card
                image="https://cdn-prod.medicalnewstoday.com/content/images/articles/248/248743/anatomy-class.jpg"
                title="Curso de Anatomía"
                date="Febrero 2, 2025"
              />
              <Card
                image="https://media.istockphoto.com/id/1369379344/photo/diverse-students-stand-around-professor-lecturing-on-human-skeletal-system.jpg?s=2048x2048&w=is&k=20&c=nKCP0PBUVjK_xiDPf_W0PsWZuPwmxkr1U73dbi7vdQc="
                title="Curso de Fisiología"
                date="Febrero 3, 2025"
              />
              <Card
                image="https://ce.mayo.edu/sites/default/files/pulmonology.png"
                title="Curso de Patología"
                date="Febrero 4, 2025"
              />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 Plataforma Educativa. Todos los derechos reservados.</p>
      </footer>

      {/* Floating Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-16 right-8 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300"
      >
        <FaEdit className="text-2xl" />
      </button>

      {/* Modal for Adding Course */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96">
            <h3 className="text-xl font-bold mb-4">Añadir Nuevo Curso</h3>
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="Nombre del curso"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddCourse}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
