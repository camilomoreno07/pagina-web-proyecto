"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser, User } from "../../api/auth";

const Register = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<User>({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
    role: "",
  });

  const [formType, setFormType] = useState<string>("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement> | string
  ) => {
    const value = typeof e === "string" ? e : e.target.value; // Detecta si es un evento o un valor directo
    setFormType(value); // Actualiza el estado del tipo de formulario
    handleChange({ target: { name: "role", value } }); // Llama a handleChange con un evento simulado
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await registerUser(formData);
      setSuccess("Registro exitoso!");
      if (response.token) {
        document.cookie = `token=${response.token}; path=/`;
        router.push("/home");
      }
    } catch (error: any) {
      setError(
        "Error al registrar: " + error.response?.data.message || error.message
      );
    }
  };

  useEffect(() => {
    handleFormTypeChange("STUDENT"); // Valor inicial
  }, []);

  return (
    <div className="mx-auto h-screen">
      <div className="flex h-full flex-col sm:flex-row">
        {/* Form Section */}
        <div className="w-full sm:w-2/5 flex flex-col justify-center items-center pb-10 relative">
          <h1 className="hidden sm:block absolute top-4 left-4 text-2xl font-bold text-blue-500">
            Plataforma VR
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-4 w-full max-w-md mx-auto p-4 sm:p-0"
          >
            <h2 className="text-2xl font-bold text-center mb-4">Registro</h2>

            <select
              name="role"
              value={formType}
              onChange={handleFormTypeChange}
              className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none hover:bg-gray-50 appearance-none"
              style={{ backgroundImage: "none" }} // Asegura que no se muestre una flecha predeterminada
            >
              <option value="STUDENT">Estudiante</option>
              <option value="TEACHER">Profesor</option>
              <option value="ADMIN">Administrador</option>
            </select>

            {formType === "STUDENT" && (
              <>
                <input
                  type="text"
                  name="firstname"
                  onChange={handleChange}
                  placeholder="Nombre"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  onChange={handleChange}
                  placeholder="Apellido"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  placeholder="Código Estudiantil"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
              </>
            )}

            {formType === "TEACHER" && (
              <>
                <input
                  type="text"
                  name="firstname"
                  onChange={handleChange}
                  placeholder="Nombre"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  onChange={handleChange}
                  placeholder="Apellido"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="email"
                  name="username"
                  onChange={handleChange}
                  placeholder="Correo Electrónico"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
              </>
            )}

            {formType === "ADMIN" && (
              <>
                <input
                  type="text"
                  name="firstname"
                  onChange={handleChange}
                  placeholder="Nombre"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  onChange={handleChange}
                  placeholder="Apellido"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="email"
                  name="username"
                  onChange={handleChange}
                  placeholder="Correo Electrónico"
                  className="p-2 border border-gray-300 rounded-md"
                  required
                />
              </>
            )}

            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Contraseña"
              className="p-2 border border-gray-300 rounded-md"
              required
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Registrar
            </button>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-500 mt-4">{success}</p>}
        </div>

        {/* Image Section */}
        <div
          className="hidden sm:block w-3/5 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://visualise.com/wp-content/uploads/2017/09/medical-mr.jpg')",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Register;
