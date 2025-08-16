"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Activity from "../components/Activity";
import ActivityStudent from "../components/ActivityStudent";
import CourseViewStudent from "../components/CourseViewStudent";
import Wizard from "../components/Wizard";
import CreateCourse from "../components/CreateCourse";
import EditCourse from "../components/EditCourse";
import ConfigView from "../components/ConfigView";
import { useAuth } from "../hooks/useAuth";
import {
  FaBook,
  FaEnvelope,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaBell,
  FaUser,
  FaCog,
} from "react-icons/fa";

const AddNewCourseCard = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="w-64 h-64 flex flex-col items-center justify-center border-2 border-dashed border-primary-40 rounded cursor-pointer hover:bg-primary-95 transition"
  >
    <span className="text-4xl text-primary-40 mb-4">+</span>
    <span className="text-lg font-bold text-primary-40">
      Agregar nuevo curso
    </span>
  </div>
);

const Dashboard = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [showCreateCourse, setShowCreateCourse] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const { role } = useAuth();
  const isTeacher = role === "TEACHER";
  const isStudent = role === "STUDENT";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    setHasMounted(true);
    setMounted(true);
    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch("http://localhost:8081/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data: Course[] = await response.json();
        console.log("Cursos obtenidos del API:", data);
        setCourses(data);
      } catch (error) {
        console.error("Error al obtener cursos:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    const intervalId = setInterval(fetchCourses, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    try {
      Cookies.remove("token");
      Cookies.remove("role");
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleCourseClick = (course: Course) => {
    console.log("Curso clickeado:", course);
    if (isAdmin) {
      setSelectedCourse(course);
      setShowCreateCourse(false);
      setShowWizard(false);
      setShowEditCourse(true); // Nuevo estado
    } else {
      setSelectedCourse(course);
      setShowWizard(true);
    }
  };

  const handleWizardComplete = (data: WizardData) => {
    console.log("Datos del curso:", data);
    setShowWizard(false);
    setSelectedCourse(null);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setSelectedCourse(null);
  };

  const handleAddNewCourse = () => {
    setShowCreateCourse(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary-40 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">EduLMS</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-primary-30 rounded-full">
            <FaBell className="text-xl" />
          </button>
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-primary-30 cursor-pointer">
            <FaUser className="text-xl text-gray-700" />
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded hidden sm:block"
          >
            Cerrar Sesión
          </button>
        </div>
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
              <li className="p-2 flex flex-row items-center rounded hover:bg-primary-95 cursor-pointer">
                <FaBook className="text-primary-40 text-xl mr-2" />
                <span className="text-primary-40 font-medium">Temas</span>
              </li>
              <li className="p-2 flex flex-row items-center rounded hover:bg-primary-95 cursor-pointer">
                <FaEnvelope className="text-primary-40 text-xl mr-2" />
                <span className="text-primary-40 font-medium">Mensajes</span>
              </li>
              <li className="p-2 flex flex-row items-center rounded hover:bg-primary-95 cursor-pointer">
                <FaCalendarAlt className="text-primary-40 text-xl mr-2" />
                <span className="text-primary-40 font-medium">Calendario</span>
              </li>

              {mounted && isAdmin && (
                <li
                  className="p-2 flex flex-row items-center rounded hover:bg-primary-95 cursor-pointer"
                  onClick={() => {
                    setShowConfig(true);
                    setShowCreateCourse(false);
                    setShowEditCourse(false);
                    setShowWizard(false);
                  }}
                >
                  <FaCog className="text-primary-40 text-xl mr-2" />
                  <span className="text-primary-40 font-medium">
                    Configuración
                  </span>
                </li>
              )}
            </ul>
          </nav>

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
        <div className="flex-1 p-6 space-y-6 bg-white shadow-none border-none">
          {!showWizard &&
            !showCreateCourse &&
            !showEditCourse &&
            !showConfig &&
            hasMounted && (
              <h2 className="text-2xl font-bold mb-4">
                {isTeacher && "¡Hola, profesor!"}
                {isStudent && "¡Hola, estudiante!"}
                {isAdmin && "¡Hola, administrador!"}
              </h2>
            )}

          {showConfig ? (
            <ConfigView onBack={() => setShowConfig(false)} />
          ) : showEditCourse ? (
            <EditCourse
              course={selectedCourse}
              onCancel={() => setShowEditCourse(false)}
              onComplete={(updatedCourse) => {
                setShowEditCourse(false);
                setCourses(
                  courses.map((c) =>
                    c.courseId === updatedCourse.courseId ? updatedCourse : c
                  )
                );
              }}
            />
          ) : showCreateCourse ? (
            <CreateCourse
              onCancel={() => setShowCreateCourse(false)}
              onComplete={(newCourse) => {
                setShowCreateCourse(false);
                setCourses([...courses, newCourse]);
              }}
            />
          ) : showWizard ? (
            isStudent ? (
              <CourseViewStudent
                course={selectedCourse}
                onClose={handleWizardCancel}
              />
            ) : (
              <Wizard
                course={selectedCourse}
                onComplete={handleWizardComplete}
                onCancel={handleWizardCancel}
              />
            )
          ) : (
            <section>
              <div className="flex flex-wrap gap-4 p-6">
                {loading ? (
                  <p>Cargando cursos...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : isAdmin ? (
                  <>
                    {courses.map((course) => (
                      <Activity
                        key={course.courseId}
                        id={course.courseId}
                        image={course.imageUrl}
                        title={course.courseName}
                        date="2025-2"
                        onClick={() => handleCourseClick(course)}
                      />
                    ))}
                    <AddNewCourseCard onClick={handleAddNewCourse} />
                  </>
                ) : isStudent ? (
                  courses.map((course) => (
                    <ActivityStudent
                      key={course.courseId}
                      id={course.courseId}
                      image={course.imageUrl}
                      title={course.courseName}
                      date="2025-2"
                      onClick={() => handleCourseClick(course)}
                    />
                  ))
                ) : (
                  courses.map((course) => (
                    <Activity
                      key={course.courseId}
                      id={course.courseId}
                      image={course.imageUrl}
                      title={course.courseName}
                      date="2025-2"
                      onClick={() => handleCourseClick(course)}
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
