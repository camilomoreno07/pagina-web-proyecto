'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, User } from '../../api/auth';
import Link from 'next/link';
import { FaChalkboardTeacher, FaUserGraduate, FaUserCog } from 'react-icons/fa';

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    role: 'STUDENT',
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
      setSuccess('Inicio de sesión exitoso!');
      console.log('Inicio de sesión exitoso:', response);

      if (response.token) {
        document.cookie = `token=${response.token}; path=/`;
        router.push('/home');
      }
    } catch (error: any) {
      setError('Error al iniciar sesión: ' + error.response.data.message || error.message);
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logotipo */}
          <div className="text-xl font-bold text-primary">MiApp</div>

          {/* Texto y botón "Contáctanos" */}
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">¿No tienes cuenta?</span>
            <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark">
              Contáctanos
            </button>
          </div>
        </div>
      </nav>

      {/* Formulario de Login */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6">¡Bienvenido!</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Selecciona un rol</label>
              <div className="flex justify-between">
                {/* Botón Profesor con Icono */}
                <button
                  type="button"
                  className="flex flex-col items-center justify-center flex-1 py-2 px-4 border rounded-l-md border-gray-300 focus:ring focus:ring-primary/50"
                >
                  <FaChalkboardTeacher className="text-2xl mb-2" />
                  Profesor
                </button>

                {/* Botón Estudiante con Icono */}
                <button
                  type="button"
                  className="flex flex-col items-center justify-center flex-1 py-2 px-4 border-t border-b border-gray-300 focus:ring focus:ring-primary/50"
                >
                  <FaUserGraduate className="text-2xl mb-2" />
                  Estudiante
                </button>

                {/* Botón Administrador con Icono */}
                <button
                  type="button"
                  className="flex flex-col items-center justify-center flex-1 py-2 px-4 border rounded-r-md border-gray-300 focus:ring focus:ring-primary/50"
                >
                  <FaUserCog className="text-2xl mb-2" />
                  Administrador
                </button>
              </div>
            </div>

            <input
              type="email"
              name="username"
              onChange={handleChange}
              placeholder="Correo Electrónico"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary/50"
            />
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-primary/50"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Recuérdame
              </label>
              <Link href="#" className="text-primary hover:underline">
                Olvidé mi contraseña
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark focus:ring focus:ring-primary/50"
            >
              Iniciar sesión
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
          <p className="text-center mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="#" className="text-primary hover:underline">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;