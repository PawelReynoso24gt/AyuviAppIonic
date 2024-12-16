import api from './axios'; // Instancia de Axios
import { Storage } from '@ionic/storage'; // Si usas Ionic Storage

const storage = new Storage(); // Instancia del almacenamiento

// Función para iniciar sesión
export async function loginUser(usuario: string, contrasenia: string) {
    try {
        //console.log('Datos enviados al backend:', { usuario, contrasenia });

        const response = await api.post('/usuarios/login', {
            usuario,
            contrasenia,
        });

        //console.log('Respuesta completa del backend:', response);

        const { token, usuario: userData } = response.data;

        //console.log('Token recibido:', token);
        //console.log('Datos de usuario:', userData);

        // Guardar el token y datos en almacenamiento seguro
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));

        return response.data;
    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        if (error instanceof Error && (error as any).response) {
            console.error('Detalles del error del backend:', (error as any).response.data);
        }

        throw error;
    }
}

// Función para cerrar sesión
export async function logoutUser(userId: number) {
    try {
        await api.post(`/usuarios/logout/${userId}`); // Enviar solicitud de logout al backend

        // Limpiar el almacenamiento local
        await storage.clear();

        console.log('Sesión cerrada exitosamente.');
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error al cerrar sesión:', (error as any).response?.data || error.message);
        } else {
            console.error('Error al cerrar sesión:', error);
        }
        throw error;
    }
}

// Función para obtener el token almacenado
export function getAuthToken(): string | null {
    const token = localStorage.getItem('authToken');
    //console.log('Token obtenido de localStorage:', token);
    return token;
}

export async function isAuthenticated(): Promise<boolean> {
    try {
        const token = localStorage.getItem('authToken');
        //console.log('Token almacenado:', token);

        // Verifica si el token existe y es válido
        return !!token; // Retorna true si hay token, false si no
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return false;
    }
}