import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
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

      <IonContent className="ion-padding">
        {loading ? (
          <IonLoading isOpen={loading} message="Cargando..." />
        ) : error ? (
          <IonText color="danger">{error}</IonText>
        ) : sedeData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Contenedor de información */}
            <IonCard style={{ boxShadow: 'none', border: 'none' }}>
              <IonCardContent>
                <IonText
                  color="primary"
                  style={{
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '10px',
                  }}
                >
                  {sedeData.nombreSede}
                </IonText>

                <IonTitle
                  style={{
                    textAlign: 'center',
                    marginTop: '10px',
                    fontSize: '20px',
                    marginBottom: '10px',
                  }}
                >
                  Información
                </IonTitle>
                <IonText
                  style={{
                    textAlign: 'center',
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '16px',
                  }}
                >
                  {sedeData.informacion}
                </IonText>
              </IonCardContent>
            </IonCard>

            {/* Contenedor del carrusel de fotos */}
            <IonCard style={{ boxShadow: 'none', border: 'none' }}>
              <IonCardContent>
                <IonTitle
                  style={{
                    textAlign: 'center',
                    fontSize: '20px',
                    marginBottom: '10px',
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
                  >
                    {fotosSede.map((foto) => (
                      <div
                        key={foto.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: '10px',
                        }}
                      >
                        <img
                          src={foto.ruta}
                          alt={`Foto de la sede ${foto.id}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
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
    </IonPage>
  );
};

export default Sede;
