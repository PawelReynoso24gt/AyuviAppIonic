import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonItem,
  IonTitle,
  IonText,
  IonLoading,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import axios from '../services/axios'; // Instancia de Axios
import { getInfoFromToken } from '../services/authService';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

const Sede: React.FC = () => {
  const [sedeData, setSedeData] = useState<any>(null);
  const [fotosSede, setFotosSede] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAlertMessage, setModalAlertMessage] = useState("");

  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  useEffect(() => {
    const fetchSedeData = async () => {
      try {
        const tokenInfo = getInfoFromToken();
        if (!tokenInfo || !tokenInfo.idSede) {
          throw new Error('No se pudo obtener el ID de la sede desde el token.');
        }

        const sedeResponse = await axios.get(`/sedes/${tokenInfo.idSede}`);
        setSedeData(sedeResponse.data);

        const fotosResponse = await axios.get(`/fotos_sedes/activos`);
        const fotosFiltradas = fotosResponse.data
          .filter((foto: any) => foto.idSede === tokenInfo.idSede && foto.estado === 1)
          .map((foto: any) => ({
            id: foto.idFotoSede,
            ruta: `http://localhost:5000/${foto.foto.replace(/\\/g, '/')}`,
          }));

        setFotosSede(fotosFiltradas);
      } catch (err) {
        setError('Error al cargar la información de la sede.');
      } finally {
        setLoading(false);
      }
    };

    fetchSedeData();
  }, []);

  return (
    <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Sede</IonTitle>
      </IonToolbar>
    </IonHeader>
  
    <IonContent className="ion-padding page-with-background"
    style={	{  padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left) '}}>
      {loading ? (
        <IonLoading isOpen={loading} message="Cargando..." />
      ) : error ? (
        <IonText color="danger">{error}</IonText>
      ) : sedeData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Contenedor de información */}
          <IonCard 
          style={{ boxShadow: 'none',
             border: 'none',
              width: '100%',  
              backgroundColor: "#F0F8FF",
                  margin: "10px",
                  borderRadius: "10px", }}>
            <IonCardContent
             style={{
              padding: '20px',
              textAlign: 'justify',
              overflowWrap: 'break-word', // Evita que palabras largas se desborden
              wordBreak: 'break-word', // Asegura que palabras largas se rompan correctamente  
              }}
              >
                 <div
                style={{
                    padding: "20px",
                    textAlign: "center",
                    background: "rgb(12, 146, 170)",
                    borderRadius: "10px",
                    margin: "10px",
                    color: "white",
                }}
            >
              <IonText
                style={{
                  textAlign: 'center',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  display: 'block',
                  marginBottom: '10px',
                  
                }}
              >
                {sedeData.nombreSede}
              </IonText>
              </div>
              <IonTitle 
                style={{
                  textAlign: 'center',
                  padding: "10px", 
                  fontWeight: "bold", 
                  fontSize: "25px",
                  color: "black"
                }}
              >
                Información
              </IonTitle>
              <IonText
                style={{
                  textAlign: 'justify',
                  display: 'block',
                  fontSize: '20px',
                  overflowWrap: 'break-word', // Aplica también al texto interno
                  wordBreak: 'break-word',
                  padding: "10px", 
                  fontWeight: "bold", 
                  color: "black"                  
                }}
              >
                {sedeData.informacion}
              </IonText>
            </IonCardContent>
          </IonCard>
  
          {/* Contenedor del carrusel de fotos */}
          <IonCard 
          style={{ boxShadow: 'none',
           border: 'none', 
           padding: '0',
           backgroundColor: "#F0F8FF",
           margin: "10px",
           borderRadius: "10px", }}>
            <IonCardContent style={{ padding: '0', paddingTop: '20px' }}>
              <IonTitle
                style={{
                  textAlign: 'center',
                  display: 'block',
                  fontSize: '25px',
                  padding: "10px", 
                  fontWeight: "bold", 
                  color: "black" 
                }}
              >
                Fotos de la Sede
              </IonTitle>
              {fotosSede.length > 0 ? (
                <Carousel
                  responsive={responsive}
                  infinite
                  autoPlay
                  autoPlaySpeed={3000}
                  keyBoardControl
                  showDots
                  containerClass="carousel-container"
                  arrows
                  customLeftArrow={
                    <div
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        cursor: 'pointer',
                        fontSize: '30px',
                        color: '#007AC3',
                      }}
                    >
                      &#9664;
                    </div>
                  }
                  customRightArrow={
                    <div
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        cursor: 'pointer',
                        fontSize: '30px',
                        color: '#007AC3',
                      }}
                    >
                      &#9654;
                    </div>
                  }
                >
                  {fotosSede.map((foto) => (
                    <div
                      key={foto.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '10px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <img
                        src={foto.ruta}
                        alt={`Foto de la sede ${foto.id}`}
                        style={{
                          width: '100%',
                          maxWidth: '800px',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <IonText
                  color="medium"
                  style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    display: 'block',
                  }}
                >
                  No hay fotos disponibles para esta sede.
                </IonText>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      ) : (
        <IonText color="danger" style={{ textAlign: 'center' }}>
          No se encontraron datos de la sede.
        </IonText>
      )}
    </IonContent>
   <IonItem style={{ marginBottom: "60px"}}/>
  </IonPage>
  
  );
};

export default Sede;
