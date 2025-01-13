import api from './axios'; // Instancia de Axios
import { Storage } from '@ionic/storage'; // Si usas Ionic Storage
import { jwtDecode } from 'jwt-decode'; // Usar la named export

const storage = new Storage(); // Instancia del almacenamiento

// Función para iniciar sesión
export async function loginUser(usuario: string, contrasenia: string) {
    try {
        //console.log('Datos enviados al backend:', { usuario, contrasenia });

        const response = await api.post('/usuarios/login', { usuario, contrasenia });
        const { token } = response.data;

        // Guardar el token en el localStorage
        localStorage.setItem('authToken', token);

        // Decodificar el token para obtener el userId
        const decodedToken: any = jwtDecode(token); // Ahora usa jwtDecode
        const userId = decodedToken.idUsuario;

        //console.log('Token decodificado:', decodedToken); // Para depuración
        //console.log('ID del usuario:', userId);

        return { token, userId }; // Retorna el token y el userId si lo necesitas
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

export function getInfoFromToken(): { idUsuario?: string; usuario?: string; idVoluntario?: string; idSede?: string} | null {
    const token = localStorage.getItem('authToken'); // Recuperar el token del localStorage
    if (!token) return null; // Si no hay token, retorna null
    
    try {
        const decodedToken: any = jwtDecode(token);
        return {
            idUsuario: decodedToken.idUsuario, // Extraer el ID del usuario
            usuario: decodedToken.usuario,     // Extraer el nombre del usuario
            idVoluntario: decodedToken.idVoluntario, // Extraer el ID del voluntario
            idSede : decodedToken.idSede
        };
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
    }
}