import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import './About.css';

const About: React.FC = () => {
  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle>Términos y Condiciones</IonTitle>
        </IonToolbar>
      </IonHeader> */}
      <IonContent fullscreen >
        <div id="about-container">
          <h2>Términos y Condiciones</h2>
          <p>Bienvenido a la aplicación web y móvil "AYUDANDO A VIVIR". 
            Al utilizar esta aplicación, usted acepta cumplir con estos 
            Términos y Condiciones de Uso. Esta aplicación ha sido desarrollada 
            por estudiantes de la carrera de Ingeniería en Sistemas, Informática y 
            Ciencias de la Computación de la Universidad Mesoamericana, sede Quetzaltenango, para la Fundación AYUVI en Quetzaltenango, Guatemala.</p>

          
          <h3>1. Aceptación de los Términos</h3>
          <p>Al acceder o utilizar nuestra aplicación, usted acepta estar sujeto a estos Términos y Condiciones. 
            Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestra aplicación. </p>
          
          <h3>2. Modificaciones de los Términos</h3>
          <p>Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento.
             Notificaremos a los usuarios sobre cualquier cambio a través de nuestra aplicación o por correo electrónico. 
             El uso continuo de la aplicación después de tales modificaciones constituirá su reconocimiento y aceptación de los términos modificados. </p>
          
          <h3>3. Descripción del Servicio</h3>
          <p>La aplicación "AYUDANDO A VIVIR" está diseñada para facilitar la gestión del voluntariado de la Fundación AYUVI.
             Los usuarios pueden registrarse, crear un perfil y participar en tareas y actividades organizadas por el equipo administrativo. 
             Estas actividades están enfocadas en recaudar fondos destinados al tratamiento de niños con cáncer. </p>
          
          <h3>4. Uso del Servicio</h3>
          <p>Registro y Cuentas: Los usuarios deben proporcionar información precisa y completa al registrarse. 
            Es responsabilidad del usuario mantener la confidencialidad de sus credenciales de acceso.</p>
          <br></br>
          <p>Conducta del Usuario: Los usuarios deben comportarse de manera respetuosa y no utilizar la aplicación para actividades ilegales o no autorizadas.  </p>
          <br></br>
          <p>Seguridad: Nos comprometemos a implementar medidas de seguridad para proteger la información personal de los usuarios,
             pero no garantizamos que la aplicación sea completamente segura frente a posibles amenazas.</p>

          <h3>5. Propiedad Intelectual</h3>
          <p>Todo el código y diseño de esta aplicación ha sido donado a la Fundación AYUVI por elTodo el código y diseño de esta aplicación ha sido donado a 
            a Fundación AYUVI por el grupo de desarrollo y está disponible para su uso por el equipo de TI de la fundación. </p>

          <h3>6. Privacidad y Protección de Datos</h3>
          <p>Datos Personales: Recopilamos y manejamos información personal, como CUI, fecha de nacimiento, teléfonos y direcciones, 
            con el fin de conocer quiénes son responsables de las actividades que se llevan a cabo dentro del sistema. </p>

          <h3>7. Limitación de Responsabilidad</h3>
          <p>La Fundación AYUVI no será responsable por cualquier daño que pueda ocurrir al usar la aplicación o si no puedes
             usarla por algún problema. Esto incluye, pero no se limita a, la pérdida de dinero, datos u otros daños, incluso 
             si te hemos advertido que esto podría pasar. Esta limitación de responsabilidad se aplicará en la medida permitida por la ley. </p>

          <h3>8. Desarrolladores y Licencias</h3>
          <p>La Fundación AYUVI no será responsable por cualquier daño que pueda ocurrir al usar la aplicación o si no puedes 
            usarla por algún problema. Esto incluye, pero no se limita a, la pérdida de dinero, datos u otros daños, incluso 
            si te hemos advertido que esto podría pasar. Esta limitación de responsabilidad se aplicará en la medida permitida por la ley. </p>
          <br></br>
          <p>Todo el software y las plantillas utilizadas en la aplicación han sido adquiridos legalmente y cuentan con las licencias correspondientes. El uso de 
            este software y plantillas es exclusivamente para apoyar a la fundación en la automatización de sus procesos.</p>
          <br></br>
          <p>Los desarrolladores se desligan de cualquier demanda o responsabilidad legal que pueda surgir después de la implementación final de la aplicación.  </p>

          <h3>9. Ley Aplicable y Jurisdicción</h3>
          <p>Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de Guatemala. Cualquier disputa que surja en relación con estos términos
             estará sujeta a la jurisdicción exclusiva de los tribunales de Guatemala.   </p>

          <h3>10. Contacto</h3>
          <p>Si tiene alguna pregunta sobre estos Términos y Condiciones, puede contactarnos a través de eduardo.godinez@ayuvi.org.gt o +502 35757028. </p>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default About;
