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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

interface Evento {
  idEvento: number;
  nombreEvento: string;
  descripcion: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  estado: number; // 1 para activo, 0 para inactivo
  isInscrito: boolean; // Indica si el voluntario ya está inscrito
}

const InscripcionesEventos: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [selectedEvento, setSelectedEvento] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario; // Obtener el ID del voluntario
  const history = useHistory();

  // Cargar eventos disponibles
  const fetchEventos = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Evento[]>("http://localhost:5000/eventos/activas");
      setEventos(response.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error desconocido al cargar eventos.";
      console.error("Detalles del error:", error.response || error);
      setToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  // Manejar inscripción a un evento
  const handleInscripcion = async () => {
    if (!idVoluntario || !selectedEvento) {
      setToastMessage("Faltan datos para completar la inscripción.");
      return;
    }

    const fechaHoraInscripcion = new Date().toISOString();

    try {
      const response = await axios.post("http://localhost:5000/inscripcion_eventos/create", {
        fechaHoraInscripcion,
        idVoluntario,
        idEvento: selectedEvento,
      });

      // Actualizar lista de eventos para reflejar inscripción
      setEventos((prevEventos) =>
        prevEventos.map((evento) =>
          evento.idEvento === selectedEvento
            ? { ...evento, isInscrito: true }
            : evento
        )
      );

      setToastMessage(response.data.message || "¡Inscripción registrada con éxito!");
      setShowModal(false); // Cerrar modal
      setSelectedEvento(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error desconocido al registrar inscripción.";
      console.error("Error al registrar inscripción:", error.response || error);
      setToastMessage(errorMessage);
    }
  };

  const handleIrAComision = (idEvento: number) => {
    history.push(`/registroComisiones?eventoId=${idEvento}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#4B0082" }}>
          <IonTitle style={{ color: "#FFFFFF" }}>Inscripción a Eventos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ backgroundColor: "#F0F8FF" }}>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "linear-gradient(45deg, #A6BC09, #A6BC09)",
            borderRadius: "10px",
            margin: "10px",
            color: "white",
          }}
        >
          <h2>Eventos Disponibles</h2>
          <p>Selecciona un evento para inscribirte.</p>
        </div>

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
                    Evento: {evento.nombreEvento}
                  </h3>
                  <p style={{ color: "#000080", marginBottom: "5px" }}>
                    Descripción: {evento.descripcion}
                  </p>
                  <p style={{ color: "#000080" }}>
                    Fecha Inicio: {new Date(evento.fechaHoraInicio).toLocaleDateString()}
                  </p>
                  <p style={{ color: "#000080" }}>
                    Fecha Finalización: {new Date(evento.fechaHoraFin).toLocaleDateString()}
                  </p>
                  <p
                    style={{
                      color: evento.estado === 1 ? "green" : "red",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Estado del evento: {evento.estado === 1 ? "Activo" : "Inactivo"}
                  </p>
                </IonLabel>
                <div>
                  <IonButton
                    slot="end"
                    color="tertiary"
                    shape="round"
                    size="small"
                    onClick={() => {
                      setSelectedEvento(evento.idEvento);
                      setShowModal(true);
                    }}
                    disabled={evento.isInscrito}
                    style={{
                      background: evento.isInscrito
                        ? "#A9A9A9"
                        : "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                      color: "white",
                      fontWeight: "bold",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                      marginBottom: "10px",
                    }}
                  >
                    {evento.isInscrito ? "Ya inscrito" : "Inscribirse"}
                  </IonButton>
                  {evento.isInscrito && (
                    <IonButton
                      slot="end"
                      color="success"
                      shape="round"
                      size="small"
                      onClick={() => handleIrAComision(evento.idEvento)}
                      style={{
                        background: "linear-gradient(45deg, #28a745, #218838)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Ir a Comisión
                    </IonButton>
                  )}
                </div>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          style={{
            "--width": "500px",
            "--height": "200px",
            "--border-radius": "15px",
          }}
        >
          <div style={{ padding: "20px", borderRadius: "30px" }}>
            <h3>Confirmar Inscripción</h3>
            <p>¿Estás seguro de que deseas inscribirte al evento seleccionado?</p>
            <IonButton
              expand="block"
              onClick={handleInscripcion}
              style={{
                marginTop: "20px",
                margin: "10px auto",
                background: "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                color: "white",
                width: "50%",
              }}
            >
              Confirmar Inscripción
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => setShowModal(false)}
              style={{ marginTop: "10px", width: "50%", margin: "10px auto" }}
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

export default InscripcionesEventos;
