"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, User } from "../../api/auth";
import Link from "next/link";
import { FaChalkboardTeacher, FaUserGraduate, FaUserCog } from "react-icons/fa";

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    role: "STUDENT", // Rol por defecto
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("STUDENT"); // Estado para manejar la selección del rol

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role); // Actualiza el rol seleccionado
    setFormData((prevData) => ({
      ...prevData,
      role: role.toUpperCase(), // Actualiza el rol en el formulario
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await loginUser(formData);
      setSuccess("Inicio de sesión exitoso!");
      console.log("Inicio de sesión exitoso:", response);

      if (response.token) {
        document.cookie = `token=${response.token}; path=/`;
        router.push("/home");
      }
    } catch (error: any) {
      setError(
        "Error al iniciar sesión: " + error.response.data.message ||
          error.message
      );
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logotipo */}
          <div className="text-xl font-bold text-primary-40">EduLMS</div> {/* Usamos el color primary-40 definido en la configuración */}
  
          {/* Texto y botón "Contáctanos" */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">¿No tienes cuenta?</span>
            <button className="border border-primary-40 text-primary-40 px-4 py-2 rounded-md hover:bg-primary-40 hover:text-white transition-colors duration-300">
              Contáctanos
            </button>
          </div>
        </div>
      </nav>
  
      {/* Formulario de Login */}
      <div className="flex-grow flex items-center justify-center py-6 px-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary-40">¡Bienvenido!</h1> {/* Usamos el color primary-40 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Selecciona un rol</label>
              <div className="flex justify-between gap-4 flex-wrap">
                {/* Botón Profesor */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("TEACHER")}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-4 border rounded-md transition-colors
                    ${
                      selectedRole === "TEACHER"
                        ? "border-primary-40 text-primary-40" // Usamos el color primary-40
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FaChalkboardTeacher
                    className={`text-2xl mb-2 ${
                      selectedRole === "TEACHER" ? "text-primary-40" : "text-gray-700"
                    }`}
                  />
                  Profesor
                </button>
  
                {/* Botón Estudiante */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("STUDENT")}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-4 border rounded-md transition-colors
                    ${
                      selectedRole === "STUDENT"
                        ? "border-primary-40 text-primary-40"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FaUserGraduate
                    className={`text-2xl mb-2 ${
                      selectedRole === "STUDENT" ? "text-primary-40" : "text-gray-700"
                    }`}
                  />
                  Estudiante
                </button>
  
                {/* Botón Administrador */}
                <button
                  type="button"
                  onClick={() => handleRoleChange("ADMIN")}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-4 border rounded-md transition-colors
                    ${
                      selectedRole === "ADMIN"
                        ? "border-primary-40 text-primary-40"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FaUserCog
                    className={`text-2xl mb-2 ${
                      selectedRole === "ADMIN" ? "text-primary-40" : "text-gray-700"
                    }`}
                  />
                  Administrador
                </button>
              </div>
            </div>
  
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Codigo o correo electrónico"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary-40/50" /* Usamos el color primary-40 */
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary-40/50" /* Usamos el color primary-40 */
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Recuérdame
              </label>
              <Link href="#" className="text-primary-40 hover:underline"> {/* Usamos el color primary-40 */}
                Olvidé mi contraseña
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary-40 text-white rounded-md hover:bg-primary-60 focus:ring focus:ring-primary-40/50 transition-colors" /* Usamos el color primary-40 y primary-60 */
            >
              Iniciar sesión
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-6">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-6">{success}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;
