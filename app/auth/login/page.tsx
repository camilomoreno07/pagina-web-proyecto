"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { loginUser, User } from "../../api/auth";
import Link from "next/link";

import Image from "next/image";
import logo from "./logo.png";
import bgImage from "./background.png";

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<User, "role" | "firstname" | "lastname">>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
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

      if (response.token && response.role) {
        Cookies.set("token", response.token, { path: "/" });
        Cookies.set("role", response.role, { path: "/" });
        router.push("/home");
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error: any) {
      setError(
        "Error al iniciar sesión: " +
        (error.response?.data?.message || error.message)
      );
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="h-screen relative flex flex-col">
      {/* Background Image */}
      <Image
        src={bgImage}
        alt="Background"
        fill
        className="object-cover opacity-20"
        priority
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Navbar */}
        <nav className="bg-white/100 shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="h-8 w-auto mb-3">
              <Image
                src={logo}
                alt="EduLMS Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">¿No tienes cuenta?</span>
              <button className="border border-primary-40 text-primary-40 px-4 py-2 rounded-md hover:bg-primary-40 hover:text-white transition-colors duration-300">
                Contáctanos
              </button>
            </div>
          </div>
        </nav>

        {/* Formulario */}
        <div className="flex-grow flex items-center justify-center py-6 px-4">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
            <h1 className="text-3xl font-bold text-center mb-8 text-primary-40">
              ¡Bienvenido!
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Código o correo electrónico"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary-40/50"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary-40/50"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Recuérdame
                </label>
                <Link href="#" className="text-primary-40 hover:underline">
                  Olvidé mi contraseña
                </Link>
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary-40 text-white rounded-md hover:bg-primary-60 focus:ring focus:ring-primary-40/50 transition-colors"
              >
                Iniciar sesión
              </button>
            </form>

            {error && <p className="text-red-500 text-sm mt-6">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-6">{success}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
