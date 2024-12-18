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
} from '@ionic/react';
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Función para manejar cambios en los campos
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    // Validar que las contraseñas nuevas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cambiar Contraseña</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Contraseña Actual */}
        <IonItem>
          <IonLabel position="stacked">Contraseña Actual</IonLabel>
          <IonInput
            type="password"
            value={formData.currentPassword}
            onIonChange={(e) => handleInputChange('currentPassword', e.detail.value!)}
          />
        </IonItem>

        {/* Nueva Contraseña */}
        <IonItem>
          <IonLabel position="stacked">Nueva Contraseña</IonLabel>
          <IonInput
            type="password"
            value={formData.newPassword}
            onIonChange={(e) => handleInputChange('newPassword', e.detail.value!)}
          />
        </IonItem>

        {/* Confirmar Contraseña */}
        <IonItem>
          <IonLabel position="stacked">Confirmar Contraseña</IonLabel>
          <IonInput
            type="password"
            value={formData.confirmPassword}
            onIonChange={(e) => handleInputChange('confirmPassword', e.detail.value!)}
          />
        </IonItem>

        {/* Botón de Enviar */}
        <IonButton expand="block" onClick={handleSubmit}>
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
      </IonContent>
    </IonPage>
  );
};

export default ChangePassword;
