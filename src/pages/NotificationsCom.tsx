import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonToast,
  IonIcon,
  IonButton
} from "@ionic/react";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";
import { star, checkmarkCircleOutline, checkmarkCircle } from 'ionicons/icons';
import '../theme/variables.css';
interface Notification {
  idNotificacion: number;
  tipo_notificacione: {
    tipoNotificacion: string;
  };
  bitacora: {
    descripcion: string;
    fechaHora: string;
  };
  estado: number; // 1 para no leída, 0 para leída
}

const NotificationsCom: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Función para obtener notificaciones del backend
  const fetchNotifications = async () => {
    const userInfo = getInfoFromToken();
    const personId = userInfo?.idPersona;

    if (!personId) {
      console.error("personId no encontrado en el localStorage.");
      setToastMessage("Error: No se encontró el ID de la persona.");
      return;
    }

    try {
      const response = await axios.get<Notification[]>(
        `/notificaciones?idPersona=${personId}`
      );
      setNotifications(response.data);
    } catch (error: any) {
      console.error("Error al obtener las notificaciones:", error);
      setToastMessage("Error al obtener las notificaciones.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener notificaciones al cargar el componente
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Manejar el cambio de estado (marcar como revisada)
  const handleCheckNotification = async (idNotificacion: number) => {
    try {
      await axios.put(`/notificaciones/${idNotificacion}`, {
        estado: 0, // Cambiar el estado a 0 (marcar como revisada)
      });

      // Actualizar localmente la notificación específica
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.idNotificacion === idNotificacion
            ? { ...notification, estado: 0 }
            : notification
        )
      );

      setToastMessage("Notificación marcada como leída.");

      // Eliminar la notificación después de 5 segundos
      setTimeout(() => {
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification.idNotificacion !== idNotificacion
          )
        );
      }, 5000);
    } catch (error: any) {
      console.error("Error al actualizar la notificación:", error);
      setToastMessage("Error al actualizar la notificación.");
    }
  };

  return (
    <IonPage>
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
            <h2>Notificaciones</h2>
          </div>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonSpinner name="crescent" style={{ color: "#0274E5" }} />
          </div>
        ) : (
          <IonList>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <IonItem key={notification.idNotificacion} style={{  margin: "10px", borderRadius: "100px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%", backgroundColor: "#D6EAF8"}}>
                    <IonIcon icon={star} style={{ fontSize: "24px", color: "#0274E5", marginRight: "15px" }} />
                    <IonLabel style={{ flex: 1 , marginTop: "15px" }}>
                      <h2 style={{ color: "#0274E5", marginBottom: "5px" }}>
                        {notification.tipo_notificacione.tipoNotificacion}
                      </h2>
                      <p style={{ marginBottom: "5px" }}>{notification.bitacora.descripcion}</p>
                      <p style={{ fontSize: "12px"}}>
                        {new Date(notification.bitacora.fechaHora).toLocaleString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </IonLabel>
                    <IonButton fill="clear" onClick={() => handleCheckNotification(notification.idNotificacion)}>
                      <IonIcon
                        icon={notification.estado === 0 ? checkmarkCircle : checkmarkCircleOutline}
                        style={{
                          fontSize: "28px",
                          color: notification.estado === 0 ? "#10dc60" : "#ccc",
                        }}
                      />
                    </IonButton>
                  </div>
                </IonItem>
              ))
            ) : (
              <IonItem>
                <IonLabel>No hay notificaciones.</IonLabel>
              </IonItem>
            )}
            {/* Agrega este IonItem aquí para empujar el contenido hacia arriba */}
            <IonItem style={{ marginBottom: "60px"}}/>
          </IonList>
        )}
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

export default NotificationsCom;