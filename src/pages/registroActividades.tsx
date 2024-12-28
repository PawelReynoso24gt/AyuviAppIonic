import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
  IonSpinner,
  IonModal,
  IonIcon,
} from "@ionic/react";
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

interface Actividad {
  idActividad: number;
  nombre: string;
  descripcion: string;
}

interface Inscripcion {
  idInscripcionEvento: number;
  idInscripcionComision: number;
}

const DetalleInscripcionActividad: React.FC = () => {
  const history = useHistory();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [selectedActividad, setSelectedActividad] = useState<number | null>(null);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Obtener información del voluntario autenticado
  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario ? Number(userInfo.idVoluntario) : null;

  useEffect(() => {
    if (idVoluntario) {
      fetchInscripciones(idVoluntario); // Obtener IDs de inscripción
      fetchActividades(); // Obtener lista de actividades
    } else {
      setToastMessage("No se encontró información del voluntario.");
    }
  }, [idVoluntario]);

  // Obtener los IDs de inscripción (evento y comisión)
  const fetchInscripciones = async (idVoluntario: number) => {
    try {
      const response = await axios.get<Inscripcion>(
        `http://localhost:5000/inscripciones/voluntario/${idVoluntario}`
      );
      setInscripcion(response.data);
    } catch (error: any) {
      console.error("Error al cargar inscripciones:", error.response || error);
      setToastMessage("Error al cargar inscripciones.");
    }
  };

  // Obtener lista de actividades
  const fetchActividades = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Actividad[]>("http://localhost:5000/actividades");

      if (Array.isArray(response.data)) {
        setActividades(response.data);
      } else {
        console.error("La respuesta no es un arreglo:", response.data);
        setToastMessage("Error: la respuesta del servidor no es válida.");
      }
    } catch (error: any) {
      console.error("Error al cargar actividades:", error.response || error);
      setToastMessage("Error al cargar actividades.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar registro de actividades
  const handleRegistroActividad = async () => {
    if (!selectedActividad || !inscripcion) {
      setToastMessage("Faltan datos para completar el registro de la actividad.");
      return;
    }

    try {
      const payload = {
        estado: 1, // Activo por defecto
        idInscripcionEvento: inscripcion.idInscripcionEvento,
        idInscripcionComision: inscripcion.idInscripcionComision,
        idActividad: selectedActividad,
      };

      console.log("Payload enviado:", payload);

      const response = await axios.post(
        "http://localhost:5000/detalle_inscripcion_actividades/create",
        payload
      );

      setToastMessage(response.data.message || "¡Actividad registrada con éxito!");
      setShowModal(false);
      setSelectedActividad(null);
    } catch (error: any) {
      console.error("Error al registrar actividad:", error.response || error);
      setToastMessage("Error al registrar actividad.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#4B0082" }}>
          <IonButton
            slot="start"
            fill="clear"
            onClick={() => history.push('/registroMateriales')}  // Acción para regresar
            style={{
            marginLeft: '10px',
            color: 'white',
            }}
          >
        <IonIcon icon={arrowBackOutline} slot="icon-only" />
          </IonButton>
          <IonTitle style={{ color: "#FFFFFF" }}>Registro de Actividades</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ backgroundColor: "#F0F8FF" }}>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonSpinner
              name="crescent"
              style={{
                color: "#4B0082",
                width: "50px",
                height: "50px",
              }}
            />
          </div>
        ) : (
          <IonList>
            {actividades.map((actividad) => (
              <IonItem
                key={actividad.idActividad}
                style={{
                  backgroundColor: "#D6EAF8",
                  margin: "10px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              >
                <IonLabel>
                  <h3
                    style={{
                      color: "#4B0082",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    {actividad.nombre}
                  </h3>
                  <p style={{ color: "#000080" }}>{actividad.descripcion}</p>
                </IonLabel>
                <IonButton
                  slot="end"
                  color="tertiary"
                  shape="round"
                  size="small"
                  onClick={() => {
                    setSelectedActividad(actividad.idActividad);
                    setShowModal(true);
                  }}
                  style={{
                    background: "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Registrar
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          style={{
            "--width": "500px",
            "--height": "250px",
            "--border-radius": "15px",
          }}
        >
          <div style={{ padding: "20px", borderRadius: "30px" }}>
            <h3>Registrar Actividad</h3>
            <IonButton
              expand="block"
              onClick={handleRegistroActividad}
              style={{
                marginTop: "10px",
                background: "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                color: "white",
              }}
            >
              Confirmar
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => setShowModal(false)}
              style={{ marginTop: "10px" }}
            >
              Cancelar
            </IonButton>
          </div>
        </IonModal>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default DetalleInscripcionActividad;
