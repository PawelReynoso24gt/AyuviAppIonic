import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonLabel,
  IonItem,
  IonLoading,
  IonAlert,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

const RequestTalonario: React.FC = () => {
  const [talonarios, setTalonarios] = useState<any[]>([]);
  const [selectedTalonario, setSelectedTalonario] = useState<number | null>(
    null
  );
  const [solicitudes, setSolicitudes] = useState<any[]>([]); // Para almacenar solicitudes del voluntario
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario; // Extraer idVoluntario del token

  // Cargar talonarios disponibles
  useEffect(() => {
    const fetchTalonarios = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/talonarios");
        setTalonarios(response.data);
      } catch (err) {
        setError("Error al cargar los talonarios.");
      } finally {
        setLoading(false);
      }
    };

    fetchTalonarios();
  }, []);

  // Cargar solicitudes del voluntario
  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/solicitudes/voluntario/${idVoluntario}`);
        setSolicitudes(response.data);
      } catch (err) {
        console.error("Error al cargar solicitudes:", err);
        setError("Error al cargar tus solicitudes.");
      } finally {
        setLoading(false);
      }
    };

    if (idVoluntario) fetchSolicitudes();
  }, [idVoluntario, showSuccess]); // Se vuelve a cargar cuando hay una nueva solicitud

  // Enviar solicitud
  const handleSubmit = async () => {
    if (!selectedTalonario) {
      setError("Por favor selecciona un talonario.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/solicitudes", {
        idTalonario: selectedTalonario,
        idVoluntario: idVoluntario,
        fechaSolicitud: new Date().toISOString().split("T")[0],
      });
      setShowSuccess(true);
    } catch (err) {
      console.error("Error al solicitar talonario:", err);
      setError("Error al enviar la solicitud de talonario.");
    } finally {
      setLoading(false);
    }
  };

  // Determinar el estado de la solicitud
  const getEstadoSolicitud = (estado: number) => {
    switch (estado) {
      case 0:
        return { text: "Denegado", color: "danger" };
      case 1:
        return { text: "Pendiente", color: "warning" };
      case 2:
        return { text: "Aceptado", color: "success" };
      default:
        return { text: "Desconocido", color: "medium" };
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Solicitar Talonario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message="Cargando..." />

        {/* Selección de talonarios */}
        <IonItem>
          <IonLabel>Selecciona un Talonario</IonLabel>
          <IonSelect
            placeholder="Selecciona uno"
            onIonChange={(e) => setSelectedTalonario(e.detail.value)}
          >
            {talonarios.map((talonario) => (
              <IonSelectOption
                key={talonario.idTalonario}
                value={talonario.idTalonario}
              >
                {`Código: ${talonario.codigoTalonario} - Cantidad: ${talonario.cantidadBoletos}`}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={handleSubmit}>
          Solicitar Talonario
        </IonButton>

        {error && <IonLabel color="danger">{error}</IonLabel>}

        <IonAlert
          isOpen={showSuccess}
          onDidDismiss={() => setShowSuccess(false)}
          header="Éxito"
          message="Solicitud enviada correctamente."
          buttons={["OK"]}
        />

        {/* Mostrar solicitudes del voluntario */}
        <IonList>
          <IonLabel className="ion-padding">Mis Solicitudes</IonLabel>
          {solicitudes.length > 0 ? (
            solicitudes.map((solicitud) => {
              const estado = getEstadoSolicitud(solicitud.estado);
              return (
                <IonCard key={solicitud.idSolicitud}>
                  <IonCardHeader>
                    <IonCardTitle>
                      Talonario #{solicitud.idTalonario}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>
                      <strong>Fecha de Solicitud:</strong>{" "}
                      {solicitud.fechaSolicitud}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      <IonLabel color={estado.color}>{estado.text}</IonLabel>
                    </p>
                  </IonCardContent>
                </IonCard>
              );
            })
          ) : (
            <IonLabel className="ion-padding">No tienes solicitudes aún.</IonLabel>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default RequestTalonario;
