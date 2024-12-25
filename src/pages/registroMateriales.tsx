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
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

interface Material {
  idMaterial: number;
  nombre: string;
  descripcion: string;
}

interface Inscripcion {
  idInscripcionEvento: number;
  idInscripcionComision: number;
}

const DetalleInscripcionMaterial: React.FC = () => {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [cantidadMaterial, setCantidadMaterial] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [inscripcion, setInscripcion] = useState<Inscripcion | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);

  // Obtener información del voluntario autenticado
  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario;

  useEffect(() => {
    if (idVoluntario) {
      fetchInscripciones(idVoluntario); // Obtener los IDs de inscripción
      fetchMateriales(); // Obtener lista de materiales
    } else {
      setToastMessage("No se encontró información del voluntario.");
    }
  }, [idVoluntario]);

  // Obtener los IDs de inscripción (evento y comisión) del backend
  const fetchInscripciones = async (idVoluntario: number) => {
    try {
      const response = await axios.get<Inscripcion>(
        `http://localhost:5000/inscripciones/voluntario/${idVoluntario}`
      );

      setInscripcion(response.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error al cargar inscripciones.";
      console.error("Error al cargar inscripciones:", error.response || error);
      setToastMessage(errorMessage);
    }
  };

  // Obtener lista de materiales
  const fetchMateriales = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Material[]>("http://localhost:5000/materiales/all");

      if (Array.isArray(response.data)) {
        setMateriales(response.data);
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

  // Manejar ingreso de materiales
  const handleIngresoMaterial = async () => {
    if (!cantidadMaterial || !selectedMaterial || !inscripcion) {
      setToastMessage("Faltan datos para completar el ingreso de material.");
      return;
    }

    try {
      const payload = {
        cantidadMaterial,
        estado: 1,
        idInscripcionEvento: inscripcion.idInscripcionEvento,
        idInscripcionComision: inscripcion.idInscripcionComision,
        idMaterial: selectedMaterial,
      };

      const response = await axios.post(
        "http://localhost:5000/detalle_inscripcion_materiales/create",
        payload
      );

      setToastMessage(response.data.message || "¡Material ingresado con éxito!");
      setShowModal(false);
      setCantidadMaterial(null);
      setSelectedMaterial(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error al ingresar material.";
      console.error("Error al ingresar material:", error.response || error);
      setToastMessage(errorMessage);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#4B0082" }}>
          <IonTitle style={{ color: "#FFFFFF" }}>Ingreso de Materiales</IonTitle>
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
                  Ingresar Cantidad
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
