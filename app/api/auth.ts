import axios from 'axios';

const API_URL = 'http://localhost:8081/auth'; // Cambia esto por tu URL del backend

// Interfaz actualizada para el registro de usuario
export interface User {
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT'; // Añadido para el rol del usuario
}

// Interfaz para la respuesta del inicio de sesión
export interface LoginResponse {
    token: string; // Cambia esto según la estructura de tu respuesta
}

// Función para registrar un usuario
export const registerUser = async (userData: User): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
    console.log(response);
    return response.data;
    } catch (error) {
        console.log(error)
    }
    
};

// Función para iniciar sesión
export const loginUser = async (loginData: Omit<User, 'firstname' | 'lastname' | 'country'>): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>(`${API_URL}/login`, loginData);
    return response.data;
};
