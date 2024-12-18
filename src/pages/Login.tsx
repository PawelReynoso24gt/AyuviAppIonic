import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonText, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { loginUser  } from '../services/authService';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        try {
            setError(''); // Limpiar errores previos

            const data = await loginUser (usuario, contrasenia); // Llama al servicio de login

            // Redirige al usuario al Home
            history.push('/home'); // Asegúrate de que la ruta sea '/home'
        } catch (err) {
            console.error('Error capturado en handleLogin:', err);

            // Verifica si el error tiene una respuesta (es de Axios)
            if ((err as any).response) {
                setError((err as any).response.data.message || 'Error al iniciar sesión.');
            } else {
                setError('Error de conexión. Inténtalo de nuevo.');
            }
        }
    };

    const handleLogout = () => {
        // Borra el localStorage
        localStorage.clear();
        // Redirige al usuario a la página de login
        history.push('/login');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Iniciar Sesión</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <IonInput
                    placeholder="Usuario"
                    value={usuario}
                    onIonChange={(e) => setUsuario(e.detail.value!)}
                />
                <IonInput
                    type="password"
                    placeholder="Contraseña"
                    value={contrasenia}
                    onIonChange={(e) => setContrasenia(e.detail.value!)}
                />
                <IonButton expand="block" onClick={handleLogin}>
                    Iniciar Sesión
                </IonButton>
                {error && <IonText color="danger">{error}</IonText>}
                {/* Botón de cierre de sesión 
                <IonButton expand="block" onClick={handleLogout}>
                    Cerrar Sesión
                </IonButton>*/}
            </IonContent>
        </IonPage>
    );
};

export default Login;