"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import Cookies from "js-cookie";

import Activity from "../components/Activity";
import ActivityStudent from "../components/ActivityStudent";
import CourseViewStudent from "../components/CourseViewStudent";
import Wizard from "../components/Wizard";
import CreateCourse from "../components/CreateCourse";
import EditCourse from "../components/EditCourse";
import ConfigView from "../components/ConfigView";
import Feedback from "../components/Feedback";
import ReuseView from "../components/ReuseView"; // 👁️ NUEVO

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

// Tipos mínimos (ajústalos a tu backend si lo deseas)
interface Course {
  courseId: string;
  courseName: string;
  imageUrl: string;
  [k: string]: any;
}
type WizardData = any;

const AddNewCourseCard = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    className="w-80 h-80 flex flex-col items-center justify-center rounded-lg shadow-md cursor-pointer hover:shadow-lg hover:scale-105 transition-transform bg-white border-2 border-dashed border-primary-50"
  >
    <span className="text-4xl text-primary-40 mb-4 font-bold">+</span>
    <span className="text-lg font-semibold text-gray-800 text-center">
      Agregar nuevo curso
    </span>
  </div>

);

const Dashboard = () => {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReuse, setShowReuse] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // ✅ Solo un estado de montaje
  const [hasMounted, setHasMounted] = useState(false);

  const { role } = useAuth();
  const isTeacher = role === "TEACHER";
  const isStudent = role === "STUDENT";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    setHasMounted(true);

    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch(`http://localhost:8081/api/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch courses");

        const data: Course[] = await response.json();
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

  // ✏️ Editar → Wizard o EditCourse (según rol)
  const handleCourseClick = (course: Course) => {
    if (isAdmin) {
      setSelectedCourse(course);
      setShowCreateCourse(false);
      setShowWizard(false);
      setShowFeedback(false);
      setShowEditCourse(true);
    } else {
      setSelectedCourse(course);
      setShowCreateCourse(false);
      setShowEditCourse(false);
      setShowFeedback(false);
      setShowWizard(true);
    }
  };

  // 👁️ Ver/Feedback en el mismo dashboard
  const handleCourseView = (course: Course) => {
    setSelectedCourse(course);
    setShowWizard(false);
    setShowEditCourse(false);
    setShowCreateCourse(false);
    setShowConfig(false);
    setShowFeedback(true);
  };

  // 📋 Clonar
  const handleCourseClone = (course: Course) => {
    console.log("Clonar curso:", course);
    // Aquí puedes abrir un Wizard con data precargada o crear un duplicado
  };

  // 🔁 Reutilizar
  const handleCourseRepeat = (course: Course) => {
    setSelectedCourse(course);
    setShowWizard(false);
    setShowEditCourse(false);
    setShowCreateCourse(false);
    setShowConfig(false);
    setShowFeedback(false);
    setShowReuse(true);
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

  const handleAddNewCourse = () => setShowCreateCourse(true);

  // 🗑️ Delete handler

  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:8081/api/courses/${courseToDelete.courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete course");

      setCourses((prev) => prev.filter((c) => c.courseId !== courseToDelete.courseId));
      setCourseToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("No se pudo eliminar el curso");
    }
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
          className={`${isSidebarOpen ? "fixed inset-0 z-50 bg-white shadow-md" : "hidden"
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

              {hasMounted && isAdmin && (
                <>
                  <hr></hr>
                  <li
                    className="p-2 flex flex-row items-center rounded hover:bg-primary-95 cursor-pointer"
                    onClick={() => {
                      setShowConfig(true);
                      setShowCreateCourse(false);
                      setShowEditCourse(false);
                      setShowWizard(false);
                      setShowFeedback(false);
                    }}
                  >
                    <FaUser className="text-primary-40 text-xl mr-2" />
                    <span className="text-primary-40 font-medium">
                      Usuarios
                    </span>
                  </li>
                </>
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
            !showFeedback &&
            !showReuse && // 👈 añade esto
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
              onComplete={(updatedCourse: Course) => {
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
              onComplete={(newCourse: Course) => {
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
          ) : showFeedback ? (
            <Feedback
              course={selectedCourse}
              onClose={() => {
                setShowFeedback(false);
                setSelectedCourse(null);
              }}
            />
          ) : showReuse ? (
            <ReuseView
              targetCourse={
                selectedCourse
                  ? {
                    courseId: selectedCourse.courseId,
                    courseName: selectedCourse.courseName,
                  }
                  : (undefined as any)
              }
              onCancel={() => {
                setShowReuse(false);
                setSelectedCourse(null);
              }}
              onSave={async ({ sourceCourseId, targetCourseId, reuse }) => {
                console.log("Reuso guardado:", {
                  sourceCourseId,
                  targetCourseId,
                  reuse,
                });
                // refrescar cursos después de guardar
                try {
                  const token = Cookies.get("token");
                  const resp = await fetch(
                    `http://localhost:8081/api/courses`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (resp.ok) {
                    const data: Course[] = await resp.json();
                    setCourses(data);
                  }
                } catch (e) {
                  console.error("No se pudieron refrescar los cursos", e);
                }
                setShowReuse(false);
                setSelectedCourse(null);
              }}
            />
          ) : (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {loading ? (
                  <p>Cargando cursos...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : isAdmin ? (
                  <>
                    {courses.map((course) => (
                      <Activity
                        id={course.courseId}
                        image={course.imageUrl}
                        title={course.courseName}
                        date="2025-2"
                        onClick={() => handleCourseClick(course)} // edit
                        onDelete={() => openDeleteModal(course)} // delete
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
                      onView={() => handleCourseView(course)} // 👁️ Feedback
                      onRepeat={() => handleCourseRepeat(course)} // 🔁 Reutilizar
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </div>
        {/* Modal para eliminar curso */}
        {showDeleteModal && courseToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                Eliminar curso
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                ¿Estás seguro de que deseas eliminar el curso{" "}
                <span className="font-bold">{courseToDelete.courseName}</span>?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-500 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
