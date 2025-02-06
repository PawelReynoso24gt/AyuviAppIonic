import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonAlert,
  IonIcon,
} from '@ionic/react';
import { eyeOff, eye } from 'ionicons/icons';
import axios from '../services/axios';
import { getInfoFromToken } from '../services/authService';
import { useHistory } from 'react-router-dom';

const ChangePassword: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    if (name === "newPassword") {
      validatePassword(value);
    }

    if (name === "confirmPassword" || name === "newPassword") {
      checkPasswordMatch(updatedFormData.newPassword, updatedFormData.confirmPassword);
    }
  };

  // Validar la fortaleza de la contraseña
  const validatePassword = (password: string) => {
    let strength = "";
    if (password.length < 8) {
      strength = "La contraseña es demasiado corta.";
    } else if (!/[A-Z]/.test(password)) {
      strength = "La contraseña debe contener al menos una letra mayúscula.";
    } else if (!/[a-z]/.test(password)) {
      strength = "La contraseña debe contener al menos una letra minúscula.";
    } else if (!/[0-9]/.test(password)) {
      strength = "La contraseña debe contener al menos un número.";
    } else if (!/[!@#$%^&*]/.test(password)) {
      strength = "La contraseña debe contener al menos un carácter especial.";
    } else {
      strength = "La contraseña es fuerte.";
    }
    setPasswordStrength(strength);
  };

  // Verificar si las contraseñas coinciden
  const checkPasswordMatch = (newPassword: string, confirmPassword: string) => {
    if (newPassword && confirmPassword) {
      if (newPassword === confirmPassword) {
        setPasswordMatch("Las contraseñas coinciden.");
      } else {
        setPasswordMatch("Las contraseñas no coinciden.");
      }
    } else {
      setPasswordMatch("");
    }
  };

  // Alternar visibilidad de la contraseña
  const toggleShowPassword = (field: keyof typeof showPassword) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Verificar que las contraseñas nuevas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    try {
      // Obtener el userId desde el token
      const tokenInfo = getInfoFromToken();
      if (!tokenInfo || !tokenInfo.idUsuario) {
        throw new Error('No se pudo obtener la información del usuario.');
      }

      // Enviar la solicitud al backend
      await axios.put(`/usuarios/${tokenInfo.idUsuario}/contrasenia`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError('');
      setPasswordStrength('');
      setPasswordMatch('');
    } catch (err: any) {
      console.error('Error al actualizar la contraseña:', err);
      setError(
        err.response?.data?.message ||
          'Error al actualizar la contraseña. Verifica tus datos.'
      );
    }
  };

  return (
    <IonPage>
      <IonHeader >
        <IonToolbar>
          <IonTitle>Cambiar Contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-with-background">
        <form onSubmit={handleSubmit} style={{ marginTop: "50px" }}>
          {/* Contraseña Actual */}
          <IonItem>
            <IonLabel position="stacked"
            style={{
              color: "#FFFFFF",
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "20px"
            }}
            >Contraseña Actual</IonLabel>
            <IonInput
              type={showPassword.currentPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onIonInput={handleInputChange}
            />
            <IonIcon
              slot="end"
              icon={showPassword.currentPassword ? eyeOff : eye}
              style={{ color: "#0B0921", fontSize: "25px" }} 
              onClick={() => toggleShowPassword("currentPassword")}
            />
          </IonItem>

          {/* Nueva Contraseña */}
          <IonItem>
            <IonLabel position="stacked"  style={{
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      marginBottom: "5px",
                      fontSize: "20px"
                    }}
                    >Nueva Contraseña</IonLabel>
            <IonInput
              type={showPassword.newPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onIonInput={handleInputChange}
            />
            <IonIcon
              slot="end"
              icon={showPassword.newPassword ? eyeOff : eye}
              style={{ color: "#0B0921", fontSize: "25px" }} 
              onClick={() => toggleShowPassword("newPassword")}
            />
          </IonItem>
          {passwordStrength && (
            <IonText color={passwordStrength === "La contraseña es fuerte." ? "success" : "danger"} style={{ marginTop: '5px' }}>
              {passwordStrength}
            </IonText>
          )}

          {/* Confirmar Contraseña */}
          <IonItem>
            <IonLabel position="stacked"
            style={{
              color: "#FFFFFF",
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "20px"
            }}
            >Confirmar Contraseña</IonLabel>
            <IonInput
              type={showPassword.confirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onIonInput={handleInputChange}
            />
            <IonIcon
              slot="end"
              icon={showPassword.confirmPassword ? eyeOff : eye}
              style={{ color: "#0B0921", fontSize: "25px" }} 
              onClick={() => toggleShowPassword("confirmPassword")}
            />
          </IonItem>
          {passwordMatch && (
            <IonText color={passwordMatch === "Las contraseñas coinciden." ? "success" : "danger"} style={{ marginTop: '5px' }}>
              {passwordMatch}
            </IonText>
          )}

          {/* Botón de Enviar */}
          <IonButton expand="block" type="submit"
           style={{
            marginTop: "20px",
            margin: "10px auto",
            color: "white",
            width: "50%",
          }}>
            Actualizar Contraseña
          </IonButton>

          {/* Mostrar error */}
          {error && (
            <IonText color="danger" style={{ marginTop: '10px' }}>
              {error}
            </IonText>
          )}

          {/* Alerta de éxito */}
          <IonAlert
            isOpen={success}
            onDidDismiss={() => {
              setSuccess(false);
              history.push('/profile'); // Redirigir a perfil
            }}
            header="Éxito"
            message="Contraseña actualizada correctamente."
            buttons={['OK']}
          />
        </form>
      </IonContent>
    </IonPage>
  );
};

export default ChangePassword;
