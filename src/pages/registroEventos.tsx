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
} from "@ionic/react";
import axios from "axios";

interface Evento {
  idEvento: number;
  nombreEvento: string;
  descripcion: string;
  fechaInicio: string;
  estado: number; // 1 para activo, 0 para inactivo
}

const InscripcionesEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]); // Lista de eventos
  const [loading, setLoading] = useState<boolean>(false); // Indicador de carga
  const [toastMessage, setToastMessage] = useState<string>(""); // Mensajes de notificación
  const [usuarioId, setUsuarioId] = useState<number>(1); // ID del usuario autenticado (simulado)

  // Cargar eventos disponibles
  const fetchEventos = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Evento[]>("http://localhost:5000/eventos/activas");
      setEventos(response.data);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
      setToastMessage("Error al cargar eventos.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar inscripción a un evento
  const handleInscribirse = async (idEvento: number) => {
    try {
      // Enviar solicitud al backend para registrar la inscripción
      await axios.post("http://localhost:5000/inscripcion_eventos/create", {
        idEvento,
        idVoluntario: usuarioId, // ID del usuario autenticado
        estado: 1, // Por defecto, estado activo
      });

      setToastMessage("¡Te has inscrito con éxito!");
    } catch (error) {
      console.error("Error al inscribirse al evento:", error);
      setToastMessage("Error al inscribirse al evento.");
    }
  };

  useEffect(() => {
    fetchEventos(); // Cargar eventos al montar el componente
  }, []);

  return (
    <IonPage>
    <IonHeader>
      <IonToolbar style={{ backgroundColor: "#4B0082" }}>
        <IonTitle style={{ color: "#FFFFFF" }}>Inscripción a Eventos</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent style={{ backgroundColor: "#F0F8FF" }}>
      {/* Encabezado del contenido */}
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "linear-gradient(45deg, #6A5ACD, #9370DB)",
          borderRadius: "10px",
          margin: "10px",
          color: "white",
        }}
      >
        <h2>Eventos Disponibles</h2>
        <p>Selecciona un evento para inscribirte.</p>
      </div>
  
      {/* Spinner de carga */}
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
          {eventos.map((evento) => (
            <IonItem
              key={evento.idEvento}
              style={{
                backgroundColor: evento.estado === 1 ? "#D6EAF8" : "#FADBD8",
                margin: "10px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <IonLabel style={{ padding: "10px" }}>
                <h3
                  style={{
                    color: "#4B0082",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  {evento.nombreEvento}
                </h3>
                <p style={{ color: "#000080", marginBottom: "5px" }}>
                  {evento.descripcion}
                </p>
                <p style={{ color: "#000080" }}>
                  Fecha: {new Date(evento.fechaInicio).toLocaleDateString()}
                </p>
              </IonLabel>
              <IonButton
                slot="end"
                color="tertiary"
                shape="round"
                size="small"
                onClick={() => handleInscribirse(evento.idEvento)}
                style={{
                  background: "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                  color: "white",
                  fontWeight: "bold",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                }}
              >
                Inscribirse
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      )}
  
      {/* Toast para mensajes */}
      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage}
        duration={2000}
        onDidDismiss={() => setToastMessage("")}
        color="tertiary"
        style={{
          fontWeight: "bold",
          background: "linear-gradient(45deg, #6A5ACD, #9370DB)",
          color: "white",
        }}
      />
    </IonContent>
  </IonPage>  
  );
};

export default InscripcionesEventos;
