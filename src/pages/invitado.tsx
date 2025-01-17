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

const Home: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();

  useEffect(() => {
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

  const handlePublicationClick = () => {
    history.push("/login");
  };

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
      backgroundColor: "#fff",
      borderRadius: "10px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      cursor: "pointer", // Cambia el cursor al pasar sobre la publicación
    },
    photoContainer: {
      width: "100%",
      height: "523px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0274E5",
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Invitad@</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={styles.welcomeContainer}>
          <h2>Bienvenid@</h2>
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
            onClick={handlePublicationClick}
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
                    src={`https://lrr4gb41-5001.use.devtunnels.ms/${foto}`}
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
