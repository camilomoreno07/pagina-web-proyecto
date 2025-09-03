"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface ConfigViewProps {
  onBack: () => void;
}

interface Usuario {
  firstname: string;
  lastname: string;
  username: string;
  role: "TEACHER" | "STUDENT";
}

export default function ConfigView({ onBack }: ConfigViewProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Campos del modal
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchUsuarios = async () => {
      const token = Cookies.get("token");
      try {
        const res = await fetch(`http://localhost:8081/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data: Usuario[] = await res.json();
        setUsuarios(data.filter((u) => u.role !== "ADMIN"));
      } catch (err) {
        console.error("Error al obtener usuarios:", err);
      }
    };
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((u) =>
    `${u.firstname} ${u.lastname} ${u.username}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getRoleStyle = (role: string) => {
    if (role === "TEACHER") {
      return "bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold";
    }
    if (role === "STUDENT") {
      return "bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-semibold";
    }
    return "bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-semibold";
  };

  const handleSave = async () => {
    const token = Cookies.get("token");
    try {
      await fetch(`http://localhost:8081/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username,
          role,
          firstname: nombre,
          lastname: apellido,
          password,
        }),
      });
  
      // volver a cargar la lista desde el backend
      const res = await fetch(`http://localhost:8081/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(data.filter((u: any) => u.role !== "ADMIN"));
  
      // reset campos
      setShowModal(false);
      setNombre("");
      setApellido("");
      setUsername("");
      setPassword("");
      setRole("STUDENT");
    } catch (error) {
      console.error("Error registrando usuario:", error);
    }
  };
  
  return (
    <div className="bg-white p-6 max-w-6xl mx-auto w-full">
      <button onClick={onBack} className="text-primary-40 mb-4 hover:underline">
        ← Volver
      </button>

      <h2 className="text-3xl font-bold mb-2">Configuración de usuarios</h2>
      <p className="text-gray-600 mb-6">
        <span className="font-semibold">Agregue y edite</span> los usuarios y roles del sistema.
      </p>

      {/* Buscador + botón */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Buscar usuario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary-40"
        />
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-primary-40 text-white rounded hover:bg-primary-50 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Agregar usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">NOMBRE</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">APELLIDO</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">USUARIO</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border-b">ROL</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((u, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 border-b">{u.firstname}</td>
                <td className="p-3 border-b">{u.lastname}</td>
                <td className="p-3 border-b font-semibold">{u.username}</td>
                <td className="p-3 border-b">
                  <span className={getRoleStyle(u.role)}>
                    {u.role === "TEACHER" ? "Profesor" : "Estudiante"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación básica */}
      <div className="flex justify-end mt-4 gap-2">
        <button className="px-3 py-1 border rounded hover:bg-gray-100">Previous</button>
        <button className="px-3 py-1 border rounded bg-gray-200">1</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-100">3</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-100">Next</button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 shadow relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6">Agregar usuario</h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="border rounded p-3 w-full"
              />
              <input
                type="text"
                placeholder="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="border rounded p-3 w-full"
              />
              <input
                type="text"
                placeholder="Usuario (correo)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded p-3 w-full"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border rounded p-3 w-full"
              >
                <option value="TEACHER">Profesor</option>
                <option value="STUDENT">Estudiante</option>
              </select>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded p-3 w-full"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary-40 text-white rounded hover:bg-primary-50"
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
