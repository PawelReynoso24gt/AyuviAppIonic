import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonText, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { eyeOff, eye } from 'ionicons/icons';
import { loginUser } from '../services/authService';
import { useHistory } from 'react-router-dom';
import './Login.css'; // Importa el archivo de estilos

const Login: React.FC = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasenia, setContrasenia] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const history = useHistory();

    const handleLogin = async () => {
        try {
            setError(''); // Limpiar errores previos

            const data = await loginUser(usuario, contrasenia); // Llama al servicio de login

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
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <div className="login-container">
                    <IonItem className="ion-margin-bottom">
                        <IonLabel position="floating">Usuario</IonLabel>
                        <IonInput className="custom-input" value={usuario} onIonChange={e => setUsuario(e.detail.value!)} />
                    </IonItem>
                    <IonItem className="password-item">
                        <IonLabel position="floating">Contraseña</IonLabel>
                        <IonInput className="custom-input" type={showPassword ? "text" : "password"} value={contrasenia} onIonChange={e => setContrasenia(e.detail.value!)} />
                        <IonIcon className="password-toggle-icon" slot="end" icon={showPassword ? eyeOff : eye} onClick={() => setShowPassword(!showPassword)} />
                    </IonItem>
                    {error && <IonText color="danger">{error}</IonText>}
                    <IonButton expand="block" onClick={handleLogin}>Iniciar Sesión</IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;