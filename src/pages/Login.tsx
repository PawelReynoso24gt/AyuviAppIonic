import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonButton, IonText, IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { eyeOff, eye } from 'ionicons/icons';
import { loginUser } from '../services/authService';
import { useHistory } from 'react-router-dom';
import './Login.css'; // Importa el archivo de estilos
import logo from '../img/LOGOAYUVI.png'; // Importa la imagen

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

    const handleGuestLogin = () => {
        // Redirige al usuario como invitado
        history.push('/invitado');
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
                    <img src={logo} alt="Logo Ayuvi" className="logo" />
                    <IonItem className="ion-margin-bottom custom-item">
                        <IonLabel className="usuario-label">Usuario</IonLabel>
                        <IonInput className="custom-input" value={usuario} onIonChange={e => setUsuario(e.detail.value!)} />
                    </IonItem>
                    <IonItem className="password-item custom-item">
                        <IonLabel className="contrasenia-label">Contraseña</IonLabel>
                        <IonInput className="custom-input" type={showPassword ? "text" : "password"} value={contrasenia} onIonChange={e => setContrasenia(e.detail.value!)} />
                        <IonIcon className="password-toggle-icon" slot="end" icon={showPassword ? eyeOff : eye} onClick={() => setShowPassword(!showPassword)} />
                    </IonItem>

                    <IonButton expand="block" onClick={handleLogin}>Iniciar Sesión</IonButton>
                    {error && <IonText color="danger">{error}</IonText>}

                    <IonText
                        onClick={() => history.push('/registroAspirante')}
                        color="primary"
                        style={{
                            marginTop: '20px',
                            display: 'block',
                            textAlign: 'center',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        ¿No tienes una cuenta? Regístrate como aspirante
                    </IonText>

                    <IonButton
                        expand="block"
                        color="secondary"
                        onClick={handleGuestLogin}
                        style={{ marginTop: '10px' }}
                    >
                        Entrar como invitad@
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;