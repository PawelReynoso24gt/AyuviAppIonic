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
import { useHistory, useLocation } from 'react-router-dom';
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

interface Actividad {
  idActividad: number;
  nombre: string;
  descripcion: string;
  isInscrito: boolean; // Nuevo campo para saber si ya está inscrito
}

interface Inscripcion {
  idInscripcionComision: number;
  idInscripcionEvento: number;
}

const DetalleInscripcionActividad: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ idComision: number | string }>();
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const [selectedActividad, setSelectedActividad] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);

  // Obtener ID del voluntario desde el token
  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario ? Number(userInfo.idVoluntario) : null;

  // Obtener el idComision desde la navegación
  const idComision = location.state?.idComision ? Number(location.state.idComision) : null;

  useEffect(() => {
    const numericIdVoluntario = Number(idVoluntario);
    const numericIdComision = Number(idComision);
  
    if (numericIdComision && numericIdVoluntario) {
      const actividadesGuardadas = localStorage.getItem('actividades');
      if (actividadesGuardadas) {
        setActividades(JSON.parse(actividadesGuardadas));
      } else {
        fetchActividades(numericIdComision);
      }
      
      // Recuperar inscripciones previas guardadas en localStorage
      const inscripcionesGuardadas = JSON.parse(localStorage.getItem('inscripciones') || "[]");
      
      fetchInscripciones(numericIdVoluntario);
      
      // Verificar inscripciones previas
      setActividades((prevActividades) =>
        prevActividades.map((actividad) => ({
          ...actividad,
          isInscrito: inscripcionesGuardadas.includes(actividad.idActividad),
        }))
      );
    } else {
      setToastMessage("Faltan datos para cargar las actividades.");
      history.push("/registroComisiones");
    }
  }, [idComision, idVoluntario]);
  
  // Obtener los IDs de inscripción (evento y comisión)
  const fetchInscripciones = async (idVoluntario: number) => {
    try {
      const response = await axios.get<Inscripcion>(
        `/inscripciones/voluntario/${idVoluntario}`
      );
      setInscripcion(response.data);
    } catch (error: any) {
      console.error("Error al cargar inscripciones:", error.response || error);
      setToastMessage("Error al cargar inscripciones.");
    }
  };

  // Obtener lista de actividades por comisión
  const fetchActividades = async (idComision: number) => {
    setLoading(true);
    try {
      const response = await axios.get<Actividad[]>(`/actividades/comision/${idComision}`);
      
      if (Array.isArray(response.data)) {
        const inscripcionesGuardadas = JSON.parse(localStorage.getItem('inscripciones') || "[]");
  
        const actividadesConEstado = response.data.map((actividad) => ({
          ...actividad,
          isInscrito: inscripcionesGuardadas.includes(actividad.idActividad),
        }));
  
        setActividades(actividadesConEstado);
        localStorage.setItem('actividades', JSON.stringify(actividadesConEstado));
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
    if (!selectedActividad || !inscripcion || !idVoluntario) {
      setToastMessage("Faltan datos para completar el registro de la actividad.");
      return;
    }
  
    try {
      const payload = {
        estado: 1,
        idInscripcionEvento: inscripcion.idInscripcionEvento,
        idInscripcionComision: inscripcion.idInscripcionComision,
        idActividad: selectedActividad,
        idVoluntario: idVoluntario,
      };
  
      const actividadExistente = actividades.find(
        (actividad) => actividad.idActividad === selectedActividad && actividad.isInscrito
      );
  
      if (actividadExistente) {
        setToastMessage("Ya estás inscrito en esta actividad.");
        return;
      }
  
      const response = await axios.post("/detalle_inscripcion_actividades/create", payload);
  
      setToastMessage(response.data.message || "¡Actividad registrada con éxito!");
      setShowModal(false);
      setSelectedActividad(null);
  
      // Actualizar la lista de actividades con el nuevo estado
      const nuevasActividades = actividades.map((actividad) =>
        actividad.idActividad === selectedActividad
          ? { ...actividad, isInscrito: true }
          : actividad
      );
  
      setActividades(nuevasActividades);
      localStorage.setItem('actividades', JSON.stringify(nuevasActividades));
  
      // Recuperar inscripciones previas guardadas en localStorage
      const inscripcionesGuardadas = JSON.parse(localStorage.getItem('inscripciones') || "[]");
  
      // Guardar la nueva inscripción en localStorage
      localStorage.setItem('inscripciones', JSON.stringify([...inscripcionesGuardadas, selectedActividad]));
  
    } catch (error: any) {
      console.error("Error al registrar actividad:", error.response || error);
      setToastMessage("Error al registrar actividad.");
    }
  };
  
  
  

  return (
    <IonPage>
      <IonHeader style={{ paddingTop: "50px" }}>
        <IonToolbar style={{ backgroundColor: "#4B0082" }}>
          <IonButton
            slot="start"
            fill="clear"
            onClick={() => history.push('/registroMateriales')} // Acción para regresar
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
      <IonContent className="page-with-background">
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "linear-gradient(45deg, #1DA6AD, #1DA6AD)",
            borderRadius: "10px",
            margin: "10px",
            color: "white",
          }}
        >
          <h2>Actividades Disponibles</h2>
          <p>Selecciona una actividad para inscribirte.</p>
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
                  shape="round"
                  size="small"
                  className="tom-greenBlue-button"
                  onClick={() => {
                    setSelectedActividad(actividad.idActividad);
                    setShowModal(true);
                  }}
                  disabled={actividad.isInscrito} // Deshabilitar el botón si ya está inscrito
                >
                  {actividad.isInscrito ? "Ya inscrito" : "Inscribirse"} {/* Cambiar el texto del botón */}
                </IonButton>
              </IonItem>
            ))}
             <IonItem style={{ marginBottom: "60px" }} />
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
              className="tom-greenBlue-button"
              expand="block"
              onClick={handleRegistroActividad}
              style={{
                marginTop: "10px",
                background: "linear-gradient(45deg, #1DA6AD, #1DA6AD)",
                color: "white",
              }}
            >
              Confirmar
            </IonButton>
            <IonButton
              className="tom-greenBlue-button"
              expand="block"
              fill="outline"
              onClick={() => setShowModal(false)}
              style={{
                marginTop: "10px",
              }}
            >
              Cancelar
            </IonButton>
          </div>
        </IonModal>
        <IonToast
          isOpen={toastMessage !== ""}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default DetalleInscripcionActividad;
