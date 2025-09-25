import React from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonText,
} from "@ionic/react";

import "./../theme/desarrollador.css";

import fotoAll from "../theme/Alejandra.jpeg";
import fotoAngy from "../theme/Angely.jpeg";
import fotoPawel from "../theme/Pawel.jpeg";
import fotoPablo from "../theme/Pablo.jpeg";

const Desarrolladores: React.FC = () => {
  const developers = [
        {
      name: "Angely Esmeralda Thomas Cortéz",
      role: "Diseñador UI, Desarrollador de backend y frontend (SCRUM Master)",
      description:
        "Nacida en Quetzaltenango, Guatemala, el 10 de noviembre de 2004. Cuenta con pénsum cerrado de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango, en 2024. Además, obtuvo el título de Bachiller en Ciencias Exactas con orientación en Computación en el colegio IEA Los Altos de Quetzaltenango en 2020.",
      image: fotoAngy,
    },
    {
      name: "Pawel Alessandro Reynoso Marquez",
      role: "Diseñador de base de datos, Desarrollador de backend y frontend (Product Owner)",
      description:
        "Nacido en Santa Cruz del Quiché, Quiché, Guatemala, el 24 de julio de 2002. Actualmente cuenta con pénsum cerrado de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango, en 2024. Además, obtuvo el título de Perito Contador con Especialidad en Computación en el Colegio Evangélico Metodista UTATLÁN de Santa Cruz del Quiché en 2020.",
      image: fotoPawel,
    },
    {
      name: "Pablo Daniel Vásquez Monzón",
      role: "Administrador de seguridad, Desarrollador de backend y frontend",
      description:
        "Nacido en San Marcos, Guatemala el 16 de Diciembre de 2003. Actualmente cuenta con pensum cerrado de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la computación en la Universidad Mesoamericana, sede Quetzaltenango, en 2024. Además obtuvo el titulo de Bachiller en computación con orientación científica en el Colegio Pre Universitario Galileo en San Marcos 2020.",
      image: fotoPablo,
    },
    {
      name: "Alejandra González Monterrosa",
      role: "Diseñador de base de datos, Desarrollador de backend y frontend",
      description:
        "Nacida en Retalhuleu, Guatemala el 27 de julio de 2003. Actualmente cuenta con pensum cerrado de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la computación en la Universidad Mesoamericana, sede Quetzaltenango, en 2024. Además obtuvo el titulo de Bachiller en ciencias y letras con orientación en computación en el Colegio Mixto Dantoni en Retalhuleu 2020",
      image: fotoAll,
    },
  ];

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2 className="desarrolladores-title">Equipo de Desarrolladores</h2>

        <IonCard color="light" className="desarrolladores-info-card">
          <IonCardContent>
            <IonText color="dark">
              <p>
                Este proyecto fue desarrollado por estudiantes de la Facultad de Ingeniería de la Universidad Mesoamericana, sede Quetzaltenango,
                como parte de los requisitos del Proyecto de Carrera para la obtención del título de Ingeniería en Sistemas, Informática y Ciencias de la Computación.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard color="light" className="desarrolladores-info-card">
          <IonCardContent>
            <IonText color="dark">
              <p>
                Todas las imágenes utilizadas en este proyecto son propiedad exclusiva de AYUVI, y su uso está destinado únicamente para los fines específicos de este sistema.
                El sistema será donado en su totalidad a la organización, bajo la condición de que su uso se limite exclusivamente a AYUVI y sus operaciones.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonGrid>
          <IonRow>
            {developers.map((dev, idx) => (
              <IonCol key={idx} size="12" sizeMd="6">
                <IonCard className="desarrollador-card">
                  <IonImg
                    src={dev.image}
                    alt={dev.name}
                    className="desarrollador-img"
                  />
                  <IonCardHeader>
                    <IonCardTitle className="desarrollador-nombre">{dev.name}</IonCardTitle>
                    <IonCardSubtitle className="desarrollador-rol">{dev.role}</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText color="dark">
                      <p className="desarrollador-descripcion">{dev.description}</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Desarrolladores;
