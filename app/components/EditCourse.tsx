"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Select from "react-select";

interface EditCourseProps {
  course: any;
  onCancel: () => void;
  onComplete: (data: any) => void;
}

interface Usuario {
  username: string;
  firstname: string;
  lastname: string;
  role: "TEACHER" | "STUDENT" | "ADMIN";
}

export default function EditCourse({ course, onCancel, onComplete }: EditCourseProps) {
  const [courseName, setCourseName] = useState(course.courseName || "");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [professors, setProfessors] = useState<Usuario[]>([]);
  const [students, setStudents] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);

  const roleStyles: Record<string, React.CSSProperties> = {
    TEACHER: { background: "#16a34a", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem" },
    STUDENT: { background: "#2563eb", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem" },
  };

  const customOption = (props: any) => {
    const { innerProps, innerRef, data } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
      >
        <span>{data.label}</span>
        <span style={roleStyles[data.role]}>
          {data.role === "TEACHER" ? "Profesor" : "Estudiante"}
        </span>
      </div>
    );
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      const token = Cookies.get("token");
      try {
        // Traemos todos los usuarios disponibles
        const res = await fetch(`http://localhost:8081/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data: Usuario[] = await res.json();
        const allUsers = data.filter((u) => u.role !== "ADMIN");
        setUsuarios(allUsers);
  
        // Convertimos usernames a usuarios completos
        if (course.professorIds?.length) {
          const profs = allUsers.filter((u) =>
            course.professorIds.includes(u.username)
          );
          setProfessors(profs);
        }
        if (course.studentIds?.length) {
          const studs = allUsers.filter((u) =>
            course.studentIds.includes(u.username)
          );
          setStudents(studs);
        }
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
  
    fetchUsuarios();
  }, [course]);
  

  const handleAddIntegrante = () => {
    if (!selectedUser) return;
    const user = usuarios.find((u) => u.username === selectedUser.value);
    if (!user) return;

    if (user.role === "TEACHER" && !professors.some((p) => p.username === user.username)) {
      setProfessors([...professors, user]);
    } else if (user.role === "STUDENT" && !students.some((s) => s.username === user.username)) {
      setStudents([...students, user]);
    }
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    const token = Cookies.get("token");

    const payload = {
      ...course,
      courseName,
      professorIds: professors.map((p) => p.username),
      studentIds: students.map((s) => s.username),
    };

    try {
      const res = await fetch(`http://localhost:8081/api/courses/${course.courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onComplete(data);
    } catch (err) {
      alert("Error actualizando curso: " + err);
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-4 max-w-5xl mx-auto w-full">
      <button onClick={onCancel} className="text-primary-40 mb-4">
        ← Salir
      </button>

      <h2 className="text-2xl font-semibold mb-2">Editar curso</h2>
      <p className="text-gray-600 mb-6">
        Actualiza el nombre del curso y los integrantes.
      </p>

      <label className="block font-medium mb-2">Nombre del curso</label>
      <input
        type="text"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        className="w-full p-2 border rounded mb-6"
        placeholder="Nombre del curso"
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Integrantes</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-40 text-white rounded hover:bg-primary-50"
        >
          + Agregar integrante
        </button>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b p-2">Nombre</th>
            <th className="border-b p-2">Apellido</th>
            <th className="border-b p-2">Usuario</th>
            <th className="border-b p-2">Rol</th>
          </tr>
        </thead>
        <tbody>
          {professors.map((p, idx) => (
            <tr key={`prof-${idx}`} className="border-b">
              <td className="p-2">{p.firstname}</td>
              <td className="p-2">{p.lastname}</td>
              <td className="p-2">{p.username}</td>
              <td className="p-2 text-green-600 font-bold">Profesor</td>
            </tr>
          ))}
          {students.map((s, idx) => (
            <tr key={`stud-${idx}`} className="border-b">
              <td className="p-2">{s.firstname}</td>
              <td className="p-2">{s.lastname}</td>
              <td className="p-2">{s.username}</td>
              <td className="p-2 text-blue-600 font-bold">Estudiante</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-500 text-gray-500 rounded hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-40 hover:bg-primary-50 text-white rounded"
        >
          Guardar cambios
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 shadow">
            <h3 className="text-xl font-semibold mb-4">Agregar integrante</h3>

            <Select
              options={usuarios.map((u) => ({
                value: u.username,
                label: `${u.firstname} ${u.lastname} (${u.username})`,
                role: u.role,
              }))}
              onChange={(option) => setSelectedUser(option)}
              placeholder="Buscar usuario..."
              isClearable
              components={{ Option: customOption }}
            />

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddIntegrante}
                disabled={!selectedUser}
                className="px-4 py-2 bg-primary-40 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
