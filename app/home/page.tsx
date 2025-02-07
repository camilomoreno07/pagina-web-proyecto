"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Card from "../components/Card";
import {
  FaBook,
  FaEnvelope,
  FaCalendarAlt,
  FaBars,
  FaEdit,
  FaTimes,
  FaBell,
  FaUser,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";

const Dashboard = () => {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false); // Estado para controlar el wizard

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">EduLMS</h1>
        {/* Botón de cerrar sesión en pantalla web */}
        <div className="flex items-center space-x-4">
          {/* Ícono de campana para notificaciones */}
          <button className="p-2 hover:bg-primary/20 rounded-full">
            <FaBell className="text-xl" />
          </button>
          {/* Círculo de perfil */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-primary/20 cursor-pointer">
            <FaUser className="text-xl text-gray-700" />
          </div>
          {/* Botón de cerrar sesión */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded hidden sm:block"
          >
            Cerrar Sesión
          </button>
        </div>
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
          } sm:block sm:relative sm:inset-auto sm:z-auto w-full sm:w-48 bg-white shadow-md p-4 space-y-6`}
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
            <ul className="space-y-2">
              <li className="p-2 flex flex-row items-center rounded hover:bg-primary/20 cursor-pointer">
                <FaBook className="text-primary text-xl mr-2" />
                <span className="text-primary font-medium">Cursos</span>
              </li>
              <li className="p-2 flex flex-row items-center rounded hover:bg-primary/20 cursor-pointer">
                <FaEnvelope className="text-primary text-xl mr-2" />
                <span className="text-primary font-medium">Mensajes</span>
              </li>
              <li className="p-2 flex flex-row items-center rounded hover:bg-primary/20 cursor-pointer">
                <FaCalendarAlt className="text-primary text-xl mr-2" />
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
          {/* Botón para crear nuevo curso */}
          <button
            onClick={() => setShowWizard(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Crear Nuevo Curso
          </button>

          {/* Wizard para crear nuevo curso */}
          {showWizard && (
            <CreateCourseWizard onClose={() => setShowWizard(false)} />
          )}

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
    </div>
  );
};

// Componente del Wizard
const CreateCourseWizard = ({ onClose }) => {
  const [step, setStep] = useState(1); // Paso actual del wizard
  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    category: "",
    startDate: "",
    duration: "",
    difficulty: "beginner",
    image: null,
    files: [],
  });

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  // Manejar subida de archivos
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourseData({ ...courseData, image: file });
    }
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Enviar los datos del curso
  const handleSubmit = () => {
    console.log("Curso creado:", courseData);
    onClose(); // Cerrar el wizard después de enviar
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-2xl font-bold mb-4">Crear Nuevo Curso</h2>

      {/* Paso 1: Información básica */}
      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Paso 1: Información Básica</h3>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre del curso"
              value={courseData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <textarea
              name="description"
              placeholder="Descripción del curso"
              value={courseData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="category"
              placeholder="Categoría"
              value={courseData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      )}

      {/* Paso 2: Configuración del curso */}
      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Paso 2: Configuración</h3>
          <div className="space-y-4">
            <input
              type="date"
              name="startDate"
              value={courseData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="duration"
              placeholder="Duración (ej: 4 semanas)"
              value={courseData.duration}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <select
              name="difficulty"
              value={courseData.difficulty}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>
      )}

      {/* Paso 3: Subida de materiales */}
      {step === 3 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Paso 3: Materiales</h3>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-600">
              Sube una imagen representativa del curso.
            </p>
          </div>
        </div>
      )}

      {/* Paso 4: Resumen y confirmación */}
      {step === 4 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Paso 4: Resumen</h3>
          <div className="space-y-4">
            <p><strong>Nombre:</strong> {courseData.name}</p>
            <p><strong>Descripción:</strong> {courseData.description}</p>
            <p><strong>Categoría:</strong> {courseData.category}</p>
            <p><strong>Fecha de inicio:</strong> {courseData.startDate}</p>
            <p><strong>Duración:</strong> {courseData.duration}</p>
            <p><strong>Dificultad:</strong> {courseData.difficulty}</p>
            {courseData.image && (
              <p><strong>Imagen:</strong> {courseData.image.name}</p>
            )}
          </div>
        </div>
      )}

      {/* Controles del wizard */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded disabled:opacity-50"
        >
          <FaArrowLeft className="inline-block mr-2" />
          Anterior
        </button>
        {step < 4 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Siguiente
            <FaArrowRight className="inline-block ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            Crear Curso
            <FaCheck className="inline-block ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;