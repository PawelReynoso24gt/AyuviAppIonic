import axios from 'axios';
import { getAuthToken } from './authService';

// Crear instancia de Axios
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Cargar la variable de entorno
    timeout: 10000, // Tiempo de espera opcional
});

// Interceptor para añadir token a las solicitudes
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await getAuthToken();
            const noAuthRoutes = ['/publicaciones/invitado']; // Rutas que no requieren autenticación

            // Verificar si la URL incluye alguna de las rutas que no requieren autenticación
            const requiresAuth = !noAuthRoutes.some(route => config.url?.includes(route));

            if (token && requiresAuth) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (!token && requiresAuth) {
                console.warn('No se encontró ningún token.');
            }
            return config;
        } catch (error) {
            console.error('Error en el interceptor:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('Error en la configuración de la solicitud:', error);
        return Promise.reject(error);
    }
);

export default api;
