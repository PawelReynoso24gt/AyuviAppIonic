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
  const userInfo = getInfoFromToken();

  // Obtener el idComision desde la navegación
  const idComision = location.state?.idComision;

  useEffect(() => {
    if (idComision) {
      fetchMateriales(idComision); // Cargar materiales de la comisión
    } else {
      setToastMessage("No se proporcionó el ID de la comisión.");
      history.push("/registroComisiones"); // Redirigir si no hay idComision
    }
  }, [idComision]);

  // Obtener lista de materiales por comisión
  const fetchMateriales = async (idComision: number) => {
    setLoading(true);
    try {
      const response = await axios.get<Material[]>(
        `http://localhost:5000/materiales/comision/${idComision}` // Asegúrate de tener esta ruta en tu backend
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
    if (!cantidadMaterial || !selectedMaterial || !userInfo?.idVoluntario) {
      setToastMessage("Faltan datos para completar el ingreso de material.");
      return;
    }
  
    try {
      const payload = {
        idVoluntario: userInfo.idVoluntario,
        idMaterial: selectedMaterial,
        cantidadMaterial,
      };
  
      const response = await axios.post(
        "http://localhost:5000/detalle_inscripcion_materiales/create",
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
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#4B0082" }}>
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
            {materiales.map((material) => (
              <IonItem
                key={material.idMaterial}
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
                    {material.nombre}
                  </h3>
                  <p style={{ color: "#000080" }}>{material.descripcion}</p>
                </IonLabel>
                <IonButton
                  slot="end"
                  color="tertiary"
                  shape="round"
                  size="small"
                  onClick={() => {
                    setSelectedMaterial(material.idMaterial);
                    setShowModal(true);
                  }}
                  style={{
                    background: "linear-gradient(45deg, #6A5ACD, #7B68EE)",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Inscribirse
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonButton
              color="success"
              shape="round"
              size="small"
              onClick={() =>
                history.push("/registroActiviades", { idComision }) // Navegar al componente de actividades
              }
              style={{
                background: "linear-gradient(45deg, #28a745, #218838)",
                color: "white",
                fontWeight: "bold",
                width: "10%",
              }}
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
              expand="block"
              onClick={handleIngresoMaterial}
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

export default DetalleInscripcionMaterial;
