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
import { useHistory } from "react-router-dom";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

interface Comision {
  idComision: number;
  comision: string;
  descripcion: string;
  estado: number; // 1 para activo, 0 para inactivo
  isInscrito: boolean; // Indica si el voluntario ya está inscrito
}

const InscripcionesComisiones: React.FC = () => {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [selectedComision, setSelectedComision] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario; // Obtener el ID del voluntario
  const history = useHistory(); // Hook para redirigir

  // Cargar comisiones disponibles
  const fetchComisiones = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Comision[]>(`http://localhost:5000/comisiones/active?idVoluntario=${idVoluntario}`);
      setComisiones(response.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error desconocido al cargar comisiones.";
      console.error("Detalles del error:", error.response || error);
      setToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComisiones();
  }, [history.location]);

  // Manejar inscripción a una comisión
  const handleInscripcion = async () => {
    if (!idVoluntario || !selectedComision) {
      setToastMessage("Faltan datos para completar la inscripción.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/inscripcion_comisiones/create", {
        idComision: selectedComision,
        idVoluntario,
        estado: 1, // Por defecto activo
      });


      setToastMessage(response.data.message || "¡Inscripción registrada con éxito!");
      setShowModal(false); // Cerrar modal
      setSelectedComision(null);

      fetchComisiones();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error desconocido al registrar inscripción.";
      console.error("Error al registrar inscripción:", error.response || error);
      setToastMessage(errorMessage);
    }
  };

  // Redirigir al registro de materiales
  const handleIrMateriales = (idComision: number) => {
    history.push("/registroMateriales", { idComision }); // Pasar idComision en el state
  };

  // Redirigir al registro de actividades
  const handleIrActividades = (idComision: number) => {
    history.push("/registroActiviades", { idComision }); // Pasar `idComision` en el state
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#4B0082" }}>
           <IonButton
              slot="start"
              fill="clear"
              onClick={() => history.push('/registroEventos')}  // Acción para regresar
              style={{
              marginLeft: '10px',
              color: 'white',
              }}
              >
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          <IonTitle style={{ color: "#FFFFFF" }}>Inscripción a Comisiones</IonTitle>
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
          <h2>Comisiones Disponibles</h2>
          <p>Selecciona una comisión para inscribirte.</p>
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
            {comisiones.map((comision) => (
              <IonItem
                key={comision.idComision}
                style={{
                  backgroundColor: comision.estado === 1 ? "#D6EAF8" : "#FADBD8",
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
                    Comisión: {comision.comision}
                  </h3>
                  <p style={{ color: "#000080", marginBottom: "5px" }}>
                    Descripción: {comision.descripcion}
                  </p>
                  <p
                    style={{
                      color: comision.estado === 1 ? "green" : "red",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Estado de la comisión: {comision.estado === 1 ? "Activo" : "Inactivo"}
                  </p>
                </IonLabel>
                <IonButton
                  slot="end"
                  color="tertiary"
                  shape="round"
                  size="small"
                  onClick={() => {
                    setSelectedComision(comision.idComision);
                    setShowModal(true);
                  }}
                  disabled={!!comision.isInscrito}
                  style={{
                    background: comision.isInscrito
                      ? "#A9A9A9"
                      : "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                    color: "white",
                    fontWeight: "bold",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {comision.isInscrito ? "Ya inscrito" : "Inscribirse"}
                </IonButton>
                {comision.isInscrito && (
                  <>
                    <IonButton
                      slot="end"
                      color="primary"
                      shape="round"
                      size="small"
                      onClick={() => handleIrMateriales(comision.idComision)}
                      style={{
                        marginLeft: "10px",
                        background: "linear-gradient(45deg, #228B22, #32CD32)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Materiales
                    </IonButton>
                    <IonButton
                      slot="end"
                      color="secondary"
                      shape="round"
                      size="small"
                      onClick={() => handleIrActividades(comision.idComision)}
                      style={{
                        marginLeft: "10px",
                        background: "linear-gradient(45deg, #FFD700, #FFA500)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      Actividades
                    </IonButton>
                  </>
                )}
              </IonItem>
            ))}
          </IonList>
        )}

        {/* Modal para confirmar inscripción */}
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
            <h3>Confirmar Inscripción</h3>
            <p>¿Estás seguro de que deseas inscribirte a la comisión seleccionada?</p>
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

export default InscripcionesComisiones;
