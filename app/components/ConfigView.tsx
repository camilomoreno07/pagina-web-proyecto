"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // Form fields
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [password, setPassword] = useState("");

  // Fetch users
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

  useEffect(() => {
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

  // Open modal for new user
  const handleAdd = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setNombre("");
    setApellido("");
    setUsername("");
    setPassword("");
    setRole("STUDENT");
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (user: Usuario) => {
    setIsEditing(true);
    setSelectedUser(user);
    setNombre(user.firstname);
    setApellido(user.lastname);
    setUsername(user.username);
    setRole(user.role);
    setPassword("");
    setShowModal(true);
  };

  // Save new or edited user
  const handleSave = async () => {
    const token = Cookies.get("token");
    try {
      if (isEditing && selectedUser) {
        // EDIT
        await fetch(`http://localhost:8081/api/users/${selectedUser.username}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username,
            role,
            firstname: nombre,
            lastname: apellido,
            password, // backend may ignore if empty
          }),
        });
      } else {
        // CREATE
        await fetch(`http://localhost:8081/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username,
            role,
            firstname: nombre,
            lastname: apellido,
            password,
          }),
        });
      }

      await fetchUsuarios();
      setShowModal(false);
    } catch (error) {
      console.error("Error guardando usuario:", error);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!userToDelete) return;
    const token = Cookies.get("token");
    try {
      await fetch(`http://localhost:8081/api/users/${userToDelete.username}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsuarios();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error eliminando usuario:", error);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 max-w-6xl mx-auto w-full">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-primary-40 mb-4 hover:underline -ml-2 flex items-center gap-1"
      >
        <span className="text-lg">←</span> Volver
      </button>

      <h2 className="text-3xl font-bold mt-6 mb-4">Configuración de usuarios</h2>
      <p className="text-gray-600 mb-6">
        Administre los <span className="font-semibold">usuarios y roles</span> del sistema mediante la creación, modificación o eliminación de cuentas de forma sencilla y segura.
      </p>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center mb-6">
        <input
          type="text"
          placeholder="Buscar usuario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded p-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary-40"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-primary-40 text-white rounded hover:bg-primary-50 flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> Agregar usuario
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded">
        <table className="min-w-full border-collapse text-sm sm:text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-600 border-b">
                NOMBRE
              </th>
              <th className="p-3 text-left font-semibold text-gray-600 border-b">
                APELLIDO
              </th>
              <th className="p-3 text-left font-semibold text-gray-600 border-b">
                USUARIO
              </th>
              <th className="p-3 text-left font-semibold text-gray-600 border-b">
                ROL
              </th>
              <th className="p-3 text-center font-semibold text-gray-600 border-b">
                ACCIONES
              </th>
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
                <td className="p-3 border-b text-center">
                  <div className="flex justify-center gap-4 text-gray-600">
                    <button
                      onClick={() => handleEdit(u)}
                      className="hover:text-primary-40"
                    >
                      <FaPencilAlt />
                    </button>
                    <button
                      onClick={() => {
                        setUserToDelete(u);
                        setShowDeleteModal(true);
                      }}
                      className="hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 sm:w-96 shadow relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6">
              {isEditing ? "Editar usuario" : "Agregar usuario"}
            </h3>

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
                disabled={isEditing}
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
                placeholder={
                  isEditing ? "Nueva contraseña (Opcional)" : "Contraseña"
                }
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 sm:w-96 shadow relative text-center">
            <h3 className="text-xl font-bold mb-4">Eliminar usuario</h3>
            <p className="mb-6">
              ¿Está seguro que desea eliminar al usuario{" "}
              <span className="font-semibold">{userToDelete.username}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
