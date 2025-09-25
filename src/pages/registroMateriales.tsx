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
  IonInput,
  IonIcon,
} from "@ionic/react";
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { getInfoFromToken } from "../services/authService";
import axios from "../services/axios";

interface Material {
  idMaterial: number;
  nombre: string;
  descripcion: string;
}

const DetalleInscripcionMaterial: React.FC = () => {
  const history = useHistory();
  const location = useLocation<{ idComision: number }>();
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [cantidadMaterial, setCantidadMaterial] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const [inscripcion, setInscripcion] = useState<{ idInscripcionEvento: number; idInscripcionComision: number } | null>(null);
  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario ? Number(userInfo.idVoluntario) : null;
  const idComision = location.state?.idComision ? Number(location.state.idComision) : null;

  useEffect(() => {
    const numericIdVoluntario = Number(idVoluntario);
    const numericIdComision = Number(idComision);

    if (numericIdComision && numericIdVoluntario) {
      fetchInscripciones(numericIdVoluntario); // Obtener inscripción
      fetchMateriales(numericIdComision); // Cargar materiales de la comisión
    } else {
      setToastMessage("Faltan datos para cargar los materiales.");
      history.push("/registroComisiones");
    }
  }, [idComision, idVoluntario]);

  const fetchInscripciones = async (idVoluntario: number) => {
    try {
      const response = await axios.get<{ idInscripcionEvento: number; idInscripcionComision: number }>(
        `/inscripciones/voluntario/${idVoluntario}`
      );
      setInscripcion(response.data);
    } catch (error: any) {
      console.error("Error al cargar inscripciones:", error.response || error);
      setToastMessage("Error al cargar inscripciones.");
    }
  };

  // Obtener lista de materiales por comisión
  const fetchMateriales = async (idComision: number) => {
    setLoading(true);
    try {
      const response = await axios.get<Material[]>(
        `/materiales/comision/${idComision}` // Asegúrate de tener esta ruta en tu backend
      );

      if (Array.isArray(response.data)) {
        setMateriales(response.data); // Actualiza el estado con los materiales obtenidos
      } else {
        console.error("La respuesta no es un arreglo:", response.data);
        setMateriales([]);
        setToastMessage("Error: la respuesta del servidor no es válida.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error al cargar materiales.";
      console.error("Error al cargar materiales:", error.response || error);
      setToastMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar inscripción a un material
  const handleIngresoMaterial = async () => {
    if (!cantidadMaterial || !selectedMaterial || !userInfo?.idVoluntario || !inscripcion) {
      setToastMessage("Faltan datos para completar el ingreso de material.");
      return;
    }
  
    try {
      const payload = {
        idVoluntario: userInfo.idVoluntario,
        idMaterial: selectedMaterial,
        cantidadMaterial,
        idInscripcionEvento: inscripcion.idInscripcionEvento,
        idInscripcionComision: inscripcion.idInscripcionComision,
      };
  
      const response = await axios.post(
        "/detalle_inscripcion_materiales/create",
        payload
      );
  
      setToastMessage(response.data.message || "¡Inscripción realizada con éxito!");
      setShowModal(false);
      setCantidadMaterial(null);
      setSelectedMaterial(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error al inscribirse al material.";
      console.error("Error al inscribirse al material:", error.response || error);
      setToastMessage(errorMessage);
    }
  };
  

  return (
    <IonPage>
      <IonHeader style={{
        paddingTop: "20px",}}>
        <IonToolbar style={{ backgroundColor: "#4B0082" ,  paddingBottom: "40px" }}>
          <IonButton
            slot="start"
            fill="clear"
            onClick={() => history.push('/registroComisiones')}
            style={{
              marginLeft: '10px',
              color: 'white',
            }}
          >
            <IonIcon icon={arrowBackOutline} slot="icon-only" />
          </IonButton>
          <IonTitle style={{ color: "#FFFFFF" }}>Materiales de la Comisión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="page-with-background"  >
         <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "linear-gradient(45deg, #67198A, #67198A)",
            borderRadius: "10px",
            margin: "10px",
            color: "white",
          }}
        >
          <h2>Materiales Disponibles</h2>
          <p>Selecciona una comisión para inscribirte.</p>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonSpinner
              name="crescent"
              style={{
                color: "#4B0082",
                background: "linear-gradient(45deg, #67198A, #67198A)",
                width: "50px",
                height: "50px",
              }}
            />
          </div>
        ) : (
          <IonList>
            {materiales.map((material) => (
              <IonItem
                key={material.idMaterial}
                style={{
                  backgroundColor: "#D6EAF8",
                  margin: "10px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  minHeight: "80px", // Altura mínima del recuadro
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
                    {material.nombre}
                  </h3>
                  <p style={{ color: "#000080", fontSize: "16px" }}>{material.descripcion}</p>
                </IonLabel>
                <IonButton
                  slot="end"
                  className="custom-purple-button"
                  shape="round"
                  size="small"
                  onClick={() => {
                    if (!inscripcion) {
                      setToastMessage("No se encontraron datos de inscripción.");
                      return;
                    }
                    setSelectedMaterial(material.idMaterial);
                    setShowModal(true);
                  }}
                >
                  Inscribirse
                </IonButton>
              </IonItem>
            ))}
             <IonItem style={{ marginBottom: "60px" }} />
          </IonList>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonButton
              className="custom-purple-button"
              shape="round"
              size="small"
              onClick={() =>
                history.push("/registroActiviades", { idComision }) // Navegar al componente de actividades
              }
           
            >
              Ir a Actividades
            </IonButton>
          </div>

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
            <h3>Ingresar Cantidad de Material</h3>
            <IonInput
              type="number"
              placeholder="Cantidad"
              value={cantidadMaterial || ""}
              onIonChange={(e) => setCantidadMaterial(Number(e.detail.value))}
              style={{ marginBottom: "20px", padding: "10px" }}
            />
            <IonButton
            className="custom-green-button"
              expand="block"
              onClick={handleIngresoMaterial}
          
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

export default DetalleInscripcionMaterial;
