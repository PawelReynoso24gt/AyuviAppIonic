import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonLabel,
  IonButton,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonModal,
  IonText,
  IonDatetime,
} from '@ionic/react';
import axios from '../services/axios';
import { useHistory } from 'react-router-dom';
import '../theme/variables.css'; 

const Registro: React.FC = () => {
  const history = useHistory();
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    telefono: '',
    domicilio: '',
    CUI: '',
    correo: '',
    foto: 'SIN FOTO',
    estado: 1,
    idDepartamento: '',
    idMunicipio: '',
  });
  const [municipios, setMunicipios] = useState([]); // Lista de municipios
  const [allMunicipios, setAllMunicipios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]); 
  const [toastMessage, setToastMessage] = useState(''); // Mensajes de error o éxito
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // Control para abrir/cerrar el DatePicker
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Obtener los municipios al cargar la pantalla
  useEffect(() => {
    const fetchData = async () => {
        try {
          const departamentosResponse = await axios.get('http://localhost:5000/departamentos');
          const municipiosResponse = await axios.get('http://localhost:5000/municipios');
          setDepartamentos(departamentosResponse.data);
          setAllMunicipios(municipiosResponse.data); // Guardar todos los municipios
        } catch (error) {
          console.error('Error al cargar los datos:', error);
          setToastMessage('No se pudieron cargar los datos.');
        }
      };
      fetchData();
    }, []);


    const handleDepartamentoChange = (idDepartamento: string) => {
        setFormData({ ...formData, idDepartamento, idMunicipio: '' }); // Limpiar el municipio seleccionado
        const filteredMunicipios = allMunicipios.filter(
          (municipio: any) => municipio.idDepartamento === idDepartamento
        );
        setMunicipios(filteredMunicipios); // Actualizar los municipios filtrados
    };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/personas/create', formData);
      setToastMessage('¡Registro exitoso! Redirigiendo...');
      history.push('/solicitudPendiente'); // Cambia al componente correspondiente
    } catch (error: any) {
      // Verifica si es un error de Axios y maneja el mensaje
      const errorMessage = error?.response?.data?.message || 'Error al registrar. Por favor, intenta de nuevo.';
      console.error('Error durante el registro:', errorMessage);
      setToastMessage(errorMessage);
    }
  };
  

  const handleDateConfirm = (event: any) => {
    setFormData({ ...formData, fechaNacimiento: event.detail.value }); // Guardar fecha seleccionada
    setIsDatePickerVisible(false); // Cerrar DatePicker
  };

  return (
    <IonPage >
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Registro de Aspirantes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent  className="custom-content" 
      style={{
        backgroundColor: 'var(--main-bg-color)', // Fondo verde
        minHeight: '50vh',        // Altura completa
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
     }}>
        <IonItem
        style={{
            display: 'flex', // Habilitar flexbox
            justifyContent: 'center', // Centrar horizontalmente
            alignItems: 'center', // Centrar verticalmente
            width: '100%', // Ajustar ancho
            maxWidth: '400px', // Ancho máximo
            height: '100px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#107bc1', // Opcional: sombra para diseño
          }}>
          <IonLabel position="floating">Nombre Completo</IonLabel>
          <IonInput
            value={formData.nombre}
            onIonChange={(e) => handleInputChange('nombre', e.detail.value!)}
            style={{
                fontSize: '16px', 
                width: '50%', 
              }}
            placeholder="Ingrese su nombre"
            className="ion-padding-top"
          />
        </IonItem>

        <IonItem
        style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '400px', 
            height: '100px', 
            margin: '16px auto', 
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1', 
          }}>
          <IonLabel position="floating" >Fecha de Nacimiento</IonLabel>
          <IonInput
            value={formData.fechaNacimiento}
            readonly
            placeholder="Seleccione su fecha de nacimiento"
            className="ion-padding-top"
            onClick={() => setIsDatePickerVisible(true)}
          />
        </IonItem>

        {/* Mostrar IonDatetime solo si isDatePickerVisible es true */}
      {/* Mostrar IonDatetime solo si isDatePickerVisible es true */}
            {isDatePickerVisible && (
            <div
                style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#fff', // Fondo blanco para que destaque
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 2px 10px rgba(173, 22, 211, 0.2)', // Sombra para resaltar el calendario
                zIndex: 1000, // Asegurarte de que esté por encima de otros elementos
                }}
            >
                <IonDatetime
                value={formData.fechaNacimiento}
                onIonChange={handleDateConfirm}
                presentation="date" // Propiedad para presentación moderna
                style={{
                    maxWidth: '100%', 
                    textAlign: 'center', 
                }}
                />
                <IonButton
                color="danger"
                style={{
                    marginTop: '16px',
                    display: 'block', 
                    marginLeft: 'auto', 
                    marginRight: 'auto', 
                    width: '200px'                               
                }}
                onClick={() => setIsDatePickerVisible(false)}
                >
                Cerrar
                </IonButton>
            </div>
)}


        <IonItem 
        style={{
            display: 'flex',
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '400px', 
            height: '100px',
            margin: '16px auto', 
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1',
          }}>
          <IonLabel position="floating"  >Teléfono</IonLabel>
          <IonInput
            value={formData.telefono}
            onIonChange={(e) => handleInputChange('telefono', e.detail.value!)}
            placeholder="Ingrese su teléfono"
            className="ion-padding-top"
            type="tel"
          />
        </IonItem>

        <IonItem
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '400px', 
            height: '100px', 
            margin: '16px auto', 
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1',
          }}>
          <IonLabel position="floating" >Domicilio</IonLabel>
          <IonInput
            value={formData.domicilio}
            onIonChange={(e) => handleInputChange('domicilio', e.detail.value!)}
            placeholder="Ingrese su domicilio"
            className="ion-padding-top"
          />
        </IonItem>

        <IonItem
        style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '100%', 
            maxWidth: '400px',
            height: '100px',
            margin: '16px auto',
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1',
          }}>
          <IonLabel position="floating" >CUI</IonLabel>
          <IonInput
            value={formData.CUI}
            onIonChange={(e) => handleInputChange('CUI', e.detail.value!)}
            placeholder="Ingrese su CUI"
            className="ion-padding-top"
            type="number"
          />
        </IonItem>

        <IonItem
        style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '400px', 
            height: '100px', 
            margin: '16px auto', 
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1',
          }}>
          <IonLabel position="floating"  >Correo Electrónico</IonLabel>
          <IonInput
            value={formData.correo}
            onIonChange={(e) => handleInputChange('correo', e.detail.value!)}
            placeholder="Ingrese su correo electrónico"
            className="ion-padding-top"
            type="email"
          />
        </IonItem>

        <IonItem 
        style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '400px', 
            height: '100px',
            margin: '16px auto', 
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1',
          }}>
          <IonLabel>Departamento</IonLabel>
          <IonSelect
            value={formData.idDepartamento}
            placeholder="Seleccione su departamento"
            onIonChange={(e) => handleDepartamentoChange(e.detail.value!)}
          >
            {departamentos.map((departamento: any) => (
              <IonSelectOption key={departamento.idDepartamento} value={departamento.idDepartamento}>
                {departamento.departamento}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: '400px', 
            height: '100px', 
            margin: '16px auto', 
            textAlign: 'center', 
            borderRadius: '8px', 
            backgroundColor: '#107bc1',
          }}>
          <IonLabel>Municipio</IonLabel>
          <IonSelect
            value={formData.idMunicipio}
            placeholder="Seleccione su municipio"
            onIonChange={(e) => handleInputChange('idMunicipio', e.detail.value!)}
            disabled={!municipios.length} // Deshabilitar si no hay municipios disponibles
          >
            {municipios.map((municipio: any) => (
              <IonSelectOption key={municipio.idMunicipio} value={municipio.idMunicipio}>
                {municipio.municipio}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>


        <IonButton expand="block" onClick={handleSubmit} color="primary" style={{ marginTop: '16px', width: '300px',  margin: '30px auto', }}>
          Registrarse
        </IonButton>


        {/* Modal de confirmación */}
        <IonModal isOpen={showConfirmModal} onDidDismiss={() => setShowConfirmModal(false)}>
          <IonContent className="ion-padding">
            <IonText color="primary">
              <h4>¿Está seguro de registrarse?</h4>
            </IonText>
            <IonButton expand="block" color="success" onClick={handleSubmit}>
              Confirmar
            </IonButton>
            <IonButton expand="block" color="danger" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </IonButton>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Registro;
