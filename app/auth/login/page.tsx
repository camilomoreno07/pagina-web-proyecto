'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { loginUser, User } from '../../api/auth';
import Link from 'next/link';

const login = () => {
  const router = useRouter(); // Inicializa useRouter

  const [formData, setFormData] = useState<User>({
    username: '',
    password: '',
    firstname: '',
    lastname: '',
    role: 'USER', // Asumiendo que el rol es siempre 'USER'
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
      setSuccess('Registro exitoso!'); // Muestra mensaje de éxito
      console.log('Registro exitoso:', response);
      
      // Redirige a otra página después de recibir el token
      if (response.token) {
        // Almacena el token como cookie
        document.cookie = `token=${response.token}; path=/`; // Guarda el token en una cookie
        router.push('/home'); // Cambia '/home' a tu ruta deseada
      }
    } catch (error: any) {
      setError('Error al registrar: ' + error.response.data.message || error.message); // Muestra mensaje de error
      console.error('Error al registrar:', error);
    }
  };

  return (
    <div className="mx-auto h-screen">
      <div className="flex h-full">
        {/* Left side with title and form, centered vertically */}
        <div className="w-2/5 flex flex-col justify-center items-center pb-10 relative">
          {/* Title at the top left */}
          <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-500">Plataforma VR</h1>
          
          {/* Form centered vertically */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              placeholder="Codigo Estudiantil"
              className="p-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Contraseña"
              className="p-2 border border-gray-300 rounded-md"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Ingresar
            </button>

            {/* Link to register page, centered */}
            <div className="flex justify-center mt-4">
              <Link href="/auth/register" className="text-blue-500 underline hover:text-blue-700">
                ¿No estás registrado? Registrar
              </Link>
            </div>
          </form>
        </div>

        {/* Right side with a full background image */}
        <div
          className="w-3/5 bg-cover bg-center"
          style={{ backgroundImage: "url('https://visualise.com/wp-content/uploads/2017/09/medical-mr.jpg')" }}
        >
        </div>
      </div>
    </div>
  );
  
}

export default login
