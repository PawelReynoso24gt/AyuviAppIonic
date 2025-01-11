import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonAvatar,
  IonLoading,
  IonButton,
} from '@ionic/react';
import axios from '../services/axios'; // Instancia de Axios
import { getInfoFromToken } from '../services/authService';

const PerfilUsuario: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener el idUsuario desde el token
        const tokenInfo = getInfoFromToken();
        if (!tokenInfo || !tokenInfo.idUsuario) {
          throw new Error('No se pudo obtener el ID del usuario desde el token.');
        }

        // Petición al backend para obtener los usuarios activos
        const response = await axios.get('/usuarios/activos');
        const loggedUser = response.data.find(
          (user: any) => user.idUsuario === parseInt(tokenInfo.idUsuario as string)
        );

        if (!loggedUser) {
          throw new Error('Usuario no encontrado.');
        }

        setUserData(loggedUser);
      } catch (err) {
        setError('Error al cargar el perfil del usuario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil de Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <IonLoading isOpen={loading} message="Cargando..." />
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : userData ? (
          <>
            {/* Avatar del Usuario */}
            <IonAvatar style={{ margin: '0 auto', width: 100, height: 100 }}>
              <img src="/assets/avatar-placeholder.png" alt="Avatar" />
            </IonAvatar>

            {/* Datos del Usuario */}
            <IonList>
              <IonItem>
                <IonLabel><strong>Nombre:</strong> {userData.persona.nombre}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel><strong>Email:</strong> {userData.persona.correo}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel><strong>Teléfono:</strong> {userData.persona.telefono}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Fecha de Registro:</strong>{' '}
                  {new Date(userData.persona.createdAt).toLocaleDateString()}
                </IonLabel>
              </IonItem>
            </IonList>

            {/* Botón para Cambiar Contraseña */}
            <IonButton expand="block" routerLink="/change-password">
              Cambiar Contraseña
            </IonButton>
          </>
        ) : (
          <IonText color="danger">No se encontraron datos del usuario.</IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PerfilUsuario;
