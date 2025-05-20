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
import moment from 'moment';
import 'moment/locale/es';
import './perfilUsuario.css';

const PerfilUsuario: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(profileImg);
  const [successMessage, setSuccessMessage] = useState('');
  const [fechaRegistro, setFechaRegistro] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtener el idUsuario desde el token
        const tokenInfo = getInfoFromToken();
        if (!tokenInfo || !tokenInfo.idUsuario || !tokenInfo.idVoluntario) {
          throw new Error('No se pudo obtener el ID del usuario desde el token.');
        }
        // Petición al backend para obtener la fecha de registro del voluntario
        const volunteerResponse = await axios.get(`/voluntarios/${tokenInfo.idVoluntario}`);
        const volunteerData = volunteerResponse.data;

        if (!volunteerData || !volunteerData.fechaRegistro) {
          throw new Error('No se pudo obtener la fecha de registro del voluntario.');
        }

        setFechaRegistro(volunteerData.fechaRegistro);
        // Petición al backend para obtener los usuarios activos
        const response = await axios.get('/usuarios/activos');
        const loggedUser = response.data.find(
          (user: any) => user.idUsuario === parseInt(tokenInfo.idUsuario as string)
        );

        if (!loggedUser) {
          throw new Error('Usuario no encontrado.');
        }

        setUserData(loggedUser);
        const photoPath = loggedUser.persona.foto !== "sin foto" ? `${axios.defaults.baseURL}/${loggedUser.persona.foto.replace(/\\/g, '/')}` : profileImg;
        setPreview(photoPath);

        // Generar URL del código QR
        setQrCodeUrl(`${axios.defaults.baseURL}/generateQR?data=${loggedUser.idUsuario}`);
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
        //console.log("Foto actualizada:", response.data);
        setSuccessMessage("Se han guardado los cambios correctamente.");
        setSelectedFile(null);
        const photoPath = response.data.foto !== "sin foto" ? `${axios.defaults.baseURL}/${response.data.foto.replace(/\\/g, '/')}` : profileImg;
        setPreview(photoPath);
      } catch (err) {
        console.error("Error al actualizar la foto:", err);
      }
    }
  };

  const handleDiscardChanges = () => {
    setSelectedFile(null);
    const photoPath = userData.persona.foto !== "sin foto" ? `${axios.defaults.baseURL}/${userData.persona.foto.replace(/\\/g, '/')}` : profileImg;
    setPreview(photoPath);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil de Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-with-background">
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
              <button className="update-photo-btn custom-btn" onClick={() => document.getElementById('fileInput')?.click()}
                style={{
                  marginTop: "20px",
                  margin: "10px auto",
                  color: "white",
                  width: "50%",
                }}>
                Actualizar mi foto
              </button>
              {selectedFile && (
                <div className="button-group">
                  <button className="save-photo-btn custom-btn save-btn" onClick={handleSaveChanges}>
                    Guardar cambios
                  </button>
                  <button className="discard-photo-btn custom-btn discard-btn" onClick={handleDiscardChanges}>
                    Descartar cambios
                  </button>
                </div>
              )}
              {successMessage && <p>{successMessage}</p>}
            </div>

            {/* Datos del Usuario */}
            <IonList>
              <IonItem style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <IonLabel><strong>Nombre:</strong> {userData.persona.nombre}</IonLabel>
              </IonItem>
              <IonItem style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <IonLabel><strong>Email:</strong> {userData.persona.correo}</IonLabel>
              </IonItem>
              <IonItem style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <IonLabel><strong>Teléfono:</strong> {userData.persona.telefono}</IonLabel>
              </IonItem>
              <IonItem style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
                <IonLabel>
                  <strong>Fecha de Registro:</strong>{' '}
                  {fechaRegistro ? moment(fechaRegistro).format('DD/MM/YYYY') : 'No disponible'}
                </IonLabel>
              </IonItem>
            </IonList>

            {/* Botón para Cambiar Contraseña */}
            <IonButton  expand="block" routerLink="/change-password"  
            style={{
                marginTop: "20px",
                margin: "10px auto",
                color: "white",
                width: "50%",
              }}>
              Cambiar Contraseña
            </IonButton>

            {/* Código QR */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <div><IonLabel style={{ width: "100%" }}><strong>Mi Código QR</strong></IonLabel></div>
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="Código QR"
                  style={{ width: "100%", maxWidth: "300px", marginTop: "10px" }}
                />
              )}
            </div>
          </>
        ) : (
          <IonText color="danger">No se encontraron datos del usuario.</IonText>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PerfilUsuario;
