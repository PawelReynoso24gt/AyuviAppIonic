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
import profileImg from '../img/LOGOAYUVI.png'; // Importa la imagen de perfil por defecto

const PerfilUsuario: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(profileImg);
  const [successMessage, setSuccessMessage] = useState('');

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
        const photoPath = loggedUser.persona.foto !== "sin foto" ? `http://localhost:5000/${loggedUser.persona.foto.replace(/\\/g, '/')}` : profileImg;
        setPreview(photoPath);
      } catch (err) {
        setError('Error al cargar el perfil del usuario.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      alert("Solo se permiten archivos JPG, JPEG y PNG.");
    }
  };

  const handleSaveChanges = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('foto', selectedFile);

      try {
        const response = await axios.put(`/personasFoto/${userData.idPersona}/foto`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log("Foto actualizada:", response.data);
        setSuccessMessage("Se han guardado los cambios correctamente.");
        setSelectedFile(null);
        const photoPath = response.data.foto !== "sin foto" ? `http://localhost:5000/${response.data.foto.replace(/\\/g, '/')}` : profileImg;
        setPreview(photoPath);
      } catch (err) {
        console.error("Error al actualizar la foto:", err);
      }
    }
  };

  const handleDiscardChanges = () => {
    setSelectedFile(null);
    const photoPath = userData.persona.foto !== "sin foto" ? `http://localhost:5000/${userData.persona.foto.replace(/\\/g, '/')}` : profileImg;
    setPreview(photoPath);
  };

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
            <div className="profile-container">
              {preview ? (
                <IonAvatar style={{ margin: '0 auto', width: 100, height: 100 }}>
                  <img src={preview} alt="Avatar" />
                </IonAvatar>
              ) : (
                <IonText color="medium">No hay imagen de perfil disponible</IonText>
              )}
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                style={{ display: "none" }}
                id="fileInput"
                onChange={handleFileChange}
              />
              <button className="update-photo-btn" onClick={() => document.getElementById('fileInput')?.click()}>
                Actualizar mi foto
              </button>
              {selectedFile && (
                <>
                  <button className="save-photo-btn" onClick={handleSaveChanges}>
                    Guardar cambios
                  </button>
                  <button className="discard-photo-btn" onClick={handleDiscardChanges}>
                    Descartar cambios
                  </button>
                </>
              )}
              {successMessage && <p>{successMessage}</p>}
            </div>

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
