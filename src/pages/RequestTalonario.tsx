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
} from "@ionic/react";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

const RequestTalonario: React.FC = () => {
  const [rifas, setRifas] = useState<any[]>([]);
  const [selectedRifa, setSelectedRifa] = useState<number | null>(null);
  const [selectedTalonario, setSelectedTalonario] = useState<number | null>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userInfo = getInfoFromToken();
  const idVoluntario = userInfo?.idVoluntario;
  const idUsuario = userInfo?.idUsuario;

  // Cargar rifas con talonarios disponibles
  useEffect(() => {
    const fetchRifas = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/rifas");
        const rifasData = response.data;

        const rifasWithTalonarios = await Promise.all(
          rifasData.map(async (rifa: any) => {
            const talonariosResponse = await axios.get(`/rifas/withTalonarios/${rifa.idRifa}`);
            return { ...rifa, talonarios: talonariosResponse.data.talonarios };
          })
        );

        setRifas(rifasWithTalonarios);
      } catch (err) {
        setError("Error al cargar las rifas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRifas();
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
  }, [idVoluntario, showSuccess]);

  // * bitacora
  const logBitacora = async (descripcion: string, idCategoriaBitacora: number) => {
    const bitacoraData = {
      descripcion,
      idCategoriaBitacora,
      idUsuario,
      fechaHora: new Date().toISOString()
    };

    try {
      await axios.post("/bitacora/create", bitacoraData);
    } catch (error) {
      console.error("Error logging bitacora:", error);
    }
  };

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
      logBitacora(`Solicitud de talonario #${selectedTalonario}`, 22);
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

  // Filtrar talonarios disponibles
  const getAvailableTalonarios = (rifa: any) => {
    const talonariosSolicitados = solicitudes
      .filter((solicitud) => solicitud.estado !== 0 || solicitud.idVoluntario !== idVoluntario)
      .map((solicitud) => solicitud.idTalonario);

    return rifa.talonarios.filter(
      (talonario: any) => !talonariosSolicitados.includes(talonario.idTalonario)
    );
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

        {/* Selección de rifas */}
        <IonItem>
          <IonLabel>Selecciona una Rifa</IonLabel>
          <IonSelect
            placeholder="Selecciona una rifa"
            onIonChange={(e) => {
              setSelectedRifa(e.detail.value);
              setSelectedTalonario(null); // Reset talonario selection
            }}
          >
            {rifas.map((rifa) => (
              <IonSelectOption key={rifa.idRifa} value={rifa.idRifa}>
                {`${rifa.nombreRifa} - Precio: ${rifa.precioBoleto} - Fecha Fin: ${rifa.fechaFin}`}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        {/* Selección de talonarios */}
        {selectedRifa && (
          <IonItem>
            <IonLabel>Selecciona un Talonario</IonLabel>
            <IonSelect
              placeholder="Selecciona un talonario"
              onIonChange={(e) => setSelectedTalonario(e.detail.value)}
            >
              {getAvailableTalonarios(rifas.find((rifa) => rifa.idRifa === selectedRifa)).map(
                (talonario: any) => (
                  <IonSelectOption
                    key={talonario.idTalonario}
                    value={talonario.idTalonario}
                  >
                    {`Código: ${talonario.codigoTalonario} - Cantidad: ${talonario.cantidadBoletos}`}
                  </IonSelectOption>
                )
              )}
            </IonSelect>
          </IonItem>
        )}

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
          <IonLabel className="ion-padding" style={{ color: 'black', background: 'white'}}>Mis Solicitudes:</IonLabel>
          {solicitudes.length > 0 ? (
            solicitudes.map((solicitud, index) => {
              const estado = getEstadoSolicitud(solicitud.estado);
              const talonario = rifas
                .flatMap((rifa) => rifa.talonarios)
                .find((talonario: any) => talonario.idTalonario === solicitud.idTalonario);
              const rifa = rifas.find((rifa) =>
                rifa.talonarios.some((t: any) => t.idTalonario === solicitud.idTalonario)
              );
              return (
                <IonItem key={`${solicitud.idSolicitud}-${index}`}>
                  <IonLabel>
                    <h2>Talonario #{solicitud.idTalonario}</h2>
                    <p>
                      <strong>Código del Talonario:</strong> {talonario?.codigoTalonario}
                    </p>
                    <p>
                      <strong>Rifa:</strong> {rifa?.nombreRifa}
                    </p>
                    <p>
                      <strong>Fecha de Solicitud:</strong>{" "}
                      {solicitud.fechaSolicitud}
                    </p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      <IonLabel color={estado.color}>{estado.text}</IonLabel>
                    </p>
                  </IonLabel>
                </IonItem>
              );
            })
          ) : (
            <IonLabel className="ion-padding" style={{ color: 'black', background: 'white'}}>No tienes solicitudes aún.</IonLabel>
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default RequestTalonario;
