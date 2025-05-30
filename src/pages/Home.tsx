import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
} from "@ionic/react";
import axios from '../services/axios'; // Instancia de Axios
import { format, parseISO } from "date-fns";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useHistory } from "react-router-dom";
import { getInfoFromToken } from "../services/authService";
import './Home.css'; // Importa el archivo CSS
import '../theme/variables.css';

const Home: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();

  const colors = ["#0274E5", "#F36B00", "#49c92c", "#8500BC", "#ebe400", "#FF33A1"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  const randomColor = colors[randomIndex];

  useEffect(() => {
    const info = getInfoFromToken();
    if (info?.usuario) {
      setUsername(info.usuario);
    }

    const fetchPublicaciones = async () => {
      try {
        const response = await axios.get(
          "/publicaciones/completas"
        );
        const publicaciones = response.data.map((publicacion: any) => ({
          id: publicacion.id,
          nombre: publicacion.nombrePublicacion,
          descripcion: publicacion.descripcion,
          fecha: publicacion.fechaPublicacion,
          tipoPublicacion: publicacion.tipoPublicacion, // Incluye el tipo de publicación
          fotos: Array.from(
            new Set([
              ...publicacion.publicacionesGenerales.map((foto: any) => foto.foto),
              ...publicacion.publicacionesEventos.map((foto: any) => foto.foto),
              ...publicacion.publicacionesRifas.map((foto: any) => foto.foto),
            ])
          ),
        }));
        setPublicaciones(publicaciones);
      } catch (error) {
        console.error("Error fetching publicaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicaciones();
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    welcomeContainer: {
      textAlign: "center",
      margin: "20px 0",
      fontSize: "1.2rem",
      color: "#333",
    },
    spinnerContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100px",
    },
    publication: {
      marginBottom: "30px",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#1e1e1e",
      borderRadius: "10px",
      overflow: "hidden",
      cursor: "pointer", // Indica que es clickeable
    },
    photoContainer: {
      width: "100%",
      height: "523px", // Tamaño fijo para el contenedor
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: randomColor,
      overflow: "hidden",
    },
    photo: {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
    },
    content: {
      padding: "15px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      margin: "10px 0",
    },
    description: {
      fontSize: "14px",
      margin: "10px 0",
      color: "#666",
    },
    date: {
      fontSize: "12px",
      color: "#999",
      marginTop: "5px",
    },
  };

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  const handleRedirect = (tipoPublicacion: string) => {
    switch (tipoPublicacion) {
      case "eventos":
        history.push("/registroEventos");
        break;
      case "rifas":
        history.push("/request-talonario");
        break;
      default:
        //console.log("Tipo de publicación no manejado:", tipoPublicacion);
        break;
    }
  };

  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio</IonTitle>
        </IonToolbar>
      </IonHeader> */}
      {/* <IonContent className="page-with-background"> */}
      <IonContent>
        <div style={styles.welcomeContainer} className="page-with-background">
          {username ? (
            <h2 className="welcome-heading">
              Bienvenido <strong>{username}</strong>
            </h2>
          ) : (
            <p>Cargando información del usuario...</p>
          )}
        </div>

        {isLoading && (
          <div style={styles.spinnerContainer}>
            <IonSpinner name="crescent" />
          </div>
        )}

        {publicaciones.map((publicacion) => (
          <div
            key={publicacion.id}
            style={styles.publication}
            onClick={() => handleRedirect(publicacion.tipoPublicacion)}
          >
            <div style={styles.content}>
              <p style={styles.title}>{publicacion.nombre}</p>
              <p style={styles.description}>{publicacion.descripcion}</p>
              <p style={styles.date}>
                Publicado el:{" "}
                <em>
                  {publicacion.fecha
                    ? format(parseISO(publicacion.fecha), "dd-MM-yyyy hh:mm a")
                    : "Sin fecha"}
                </em>
              </p>
            </div>
            <Carousel
              responsive={responsive}
              infinite
              autoPlay
              autoPlaySpeed={3000}
            >
              {publicacion.fotos.map((foto: string, index: number) => (
                <div key={`${publicacion.id}-${index}`} style={styles.photoContainer}>
                  <img
                    src={`https://api.voluntariadoayuvi.com/${foto}`}
                    alt={`Foto ${index + 1}`}
                    style={styles.photo}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default Home;
