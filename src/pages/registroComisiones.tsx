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
import { useLocation } from "react-router-dom";
import { parse, format } from "date-fns";

interface LocationState {
  eventoId?: number;
}

interface Comision {
  idComision: number;
  comision: string;
  descripcion: string;
  estado: number; // 1 para activo, 0 para inactivo
  isInscrito: boolean; // Indica si el voluntario ya está inscrito
  detalleHorario?: {
    horario?: {
      horarioInicio: string;
      horarioFinal: string;
    };
  };
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
  const location = useLocation<LocationState>();
  const eventoId = location.state?.eventoId;  

  // Cargar comisiones disponibles
  const fetchComisiones = async (eventoId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/comisiones/active?eventoId=${eventoId}&idVoluntario=${idVoluntario}`
      );
      const allComisiones = response.data;
      console.log(response.data)
  
      // Filtrar comisiones activas
      const activeComisiones = allComisiones.filter((comision: Comision) => comision.estado === 1);
  
      if (activeComisiones.length === 0) {
        setToastMessage("No hay comisiones activas para este evento.");
        setTimeout(() => history.push("/registroEventos"), 1000);
      } else {
        setComisiones(activeComisiones); // Actualizar estado
      }
    } catch (error: any) {
      console.error("Error al cargar comisiones:", error);
      const errorMessage =
        error.response?.data?.message || "Error desconocido al cargar las comisiones.";
      setToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  
useEffect(() => {
  if (eventoId) {
      fetchComisiones(eventoId);
  } else {
      setToastMessage("No se proporcionó el ID del evento.");
      history.push('/registroEventos'); // Redirige si no hay eventoId
  }
}, [eventoId]);


  // Manejar inscripción a una comisión
  const handleInscripcion = async () => {
    if (!idVoluntario || !selectedComision) {
      setToastMessage("Faltan datos para completar la inscripción.");
      return;
    }
  
    try {
      const response = await axios.post("/inscripcion_comisiones/create", {
        fechaHoraInscripcion: new Date().toISOString(),
        idVoluntario,
        idComision: selectedComision,
        estado: 1,
      });
  
      setToastMessage(response.data.message || "¡Inscripción registrada con éxito!");
      setShowModal(false);
  
      // Actualizar el estado local para reflejar la inscripción
      setComisiones((prevComisiones) =>
        prevComisiones.map((comision) =>
          comision.idComision === selectedComision
            ? { ...comision, isInscrito: true } // Cambiar a inscrito
            : comision
        )
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Error desconocido al registrar inscripción.";
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
      <IonHeader style={{
        paddingTop: "50px",
      }}>
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
      <IonContent className="page-with-background">
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "linear-gradient(45deg, #79A637, #79A637)",
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
                  
                  {comision.detalleHorario?.horario && (
                  <p style={{ color: "#000080", fontStyle: "bold" }}>
                  Horario: {format(parse(comision.detalleHorario.horario.horarioInicio, "HH:mm:ss", new Date()), "hh:mm a")} -{" "}
                  {format(parse(comision.detalleHorario.horario.horarioFinal, "HH:mm:ss", new Date()), "hh:mm a")}
              </p>
                  )}
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

                {/* Contenedor para los botones */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginLeft: "auto",
                    marginRight: "10px",
                    width: "50%",
                    alignItems: "flex-end",                  
                  }}
                >
                  <IonButton
                    shape="round"
                    size="small"
                    className="custom-green-button"
                    onClick={() => {
                      setSelectedComision(comision.idComision);
                      setShowModal(true);
                    }}
                    disabled={comision.isInscrito} // Actualiza según el estado de la comisión
                   
                  >
                    {comision.isInscrito ? "Ya inscrito" : "Inscribirse"}
                  </IonButton>
                  {comision.isInscrito && (
                    <>
                      <IonButton
                        shape="round"
                        size="small"
                        className="custom-green-button"
                        onClick={() => handleIrMateriales(comision.idComision)}
                      
                      >
                        Materiales
                      </IonButton>
                      <IonButton
                        className="custom-green-button"
                        shape="round"
                        size="small"
                        onClick={() => handleIrActividades(comision.idComision)}
                        
                      >
                        Actividades
                      </IonButton>
                    </>
                  )}
                </div>
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
              className="custom-green-button"
              onClick={handleInscripcion}
              style={{
                marginTop: "20px",
                margin: "10px auto",
                background: "linear-gradient(45deg, #79A637, #79A637)",
                color: "white",
                width: "50%",
              }}
            >
              Confirmar Inscripción
            </IonButton>
            <IonButton
            className="custom-green-button"
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