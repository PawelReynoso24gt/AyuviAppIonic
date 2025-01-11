import axios from 'axios';
import { getAuthToken } from './authService';

//console.log('API URL cargada desde .env:', import.meta.env.VITE_API_URL);

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
            //console.log('Token obtenido en el interceptor:', token);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
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
