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
  IonIcon,
} from '@ionic/react';
import { arrowBackOutline, eyeOff, eye } from 'ionicons/icons';
import axios from '../services/axios';
import { useHistory } from 'react-router-dom';
import '../theme/variables.css';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import logo from '../img/LogoAyuvi3.png'; // Importa la imagen

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
    usuario: '',
    contrasenia: '',
    talla: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmContrasenia, setConfirmContrasenia] = useState('');
  // Estado derivado para validaciones en tiempo real
  const [pwdChecks, setPwdChecks] = useState({
    minLength: false,
    hasNumber: false,
    startsUpper: false,
    hasSpecial: false,
  });

  // Valida la contraseña con las reglas solicitadas y actualiza pwdChecks
  const validatePasswordRules = (pwd: string) => {
    const checks = {
      minLength: pwd.length >= 8,
      hasNumber: /\d/.test(pwd),
      startsUpper: /^[A-Z]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    };
    setPwdChecks(checks);
    return checks;
  };

  // Comprueba que contrasenia y confirmContrasenia coincidan
  const passwordsMatch = () => {
    return formData.contrasenia === confirmContrasenia && confirmContrasenia.length > 0;
  };

  // Actualizar checks en tiempo real cuando cambie la contraseña o la confirmación
  useEffect(() => {
    validatePasswordRules(formData.contrasenia || '');
    // no hacemos set de passwordsMatch porque es una función derivada; el UI la lee directamente
  }, [formData.contrasenia, confirmContrasenia]);
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
        const departamentosResponse = await axios.get('/departamentos');
        const municipiosResponse = await axios.get('/municipios');
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

  interface BitacoraData {
    descripcion: string;
    idCategoriaBitacora: number;
    idUsuario: number;
    fechaHora: Date;
  }

  const logBitacora = async (descripcion: string, idCategoriaBitacora: number): Promise<boolean> => {
    const bitacoraData = {
      descripcion,
      idCategoriaBitacora: 7,
      idUsuario: null,
      fechaHora: new Date(),
    };

    try {
      const response = await axios.post("/bitacora/create", bitacoraData);
      return !!response.data.idBitacora; // Retorna true si idBitacora está presente
    } catch (error) {
      console.error("Error logging bitacora:", error);
      return false; // Retorna false si hay un error
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const toDateOnly = (v?: string | Date) => {
        const d = v ? new Date(v) : new Date();
        return d.toISOString().split("T")[0];
      };
  
      const fechaNac = formData.fechaNacimiento
        ? toDateOnly(formData.fechaNacimiento)
        : "";
  
      const hoy = toDateOnly();
  
      const idMunicipioNum = Number(formData.idMunicipio);
  
      const payload = {
        persona: {
          nombre: formData.nombre,
          fechaNacimiento: fechaNac,          
          telefono: formData.telefono,
          domicilio: formData.domicilio,
          CUI: formData.CUI,
          correo: formData.correo,
          foto: formData.foto || 'SIN FOTO',
          estado: 1,
          idMunicipio: idMunicipioNum,        
          talla: formData.talla || null,
        },
        aspirante: {
          fechaRegistro: hoy,                 
        },
        usuario: {
          usuario: formData.usuario,
          contrasenia: formData.contrasenia,
          idRol: 3,
          idSede: 1,
          estado: 1,
        },
        voluntario: {
          fechaRegistro: hoy,                
          estado: 1,
        },
      };
  
      // console.log("Payload que se enviará:", payload);
  
      await axios.post('/personas/crear-completo', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      setToastMessage('¡Registro exitoso! Redirigiendo...');
  
      // Bitácora (no bloquea el flujo si falla)
      try {
        await logBitacora(`Registro de aspirante: ${formData.nombre}`, 1);
      } catch (bitErr) {
        console.error('Error al registrar en la bitácora:', bitErr);
      }
  
      history.push('/login');
    } catch (error: any) {
      // Te muestra lo que responde el backend para depurar mejor
      console.error('Error durante el registro (response.data):', error?.response?.data);
      const errorMessage =
        error?.response?.data?.message ||
        'Error al registrar. Por favor, intenta de nuevo.';
      setToastMessage(errorMessage);
    }
  };


  const handleDateConfirm = (event: any) => {
    setFormData({ ...formData, fechaNacimiento: event.detail.value }); // Guardar fecha seleccionada
    setIsDatePickerVisible(false); // Cerrar DatePicker
  };

  return (
    <IonPage >
      <IonHeader >
        <IonToolbar color="primary">
          <IonButton
            slot="start"
            fill="clear"
            onClick={() => history.goBack()} // Acción para regresar
            style={{
              marginLeft: '10px',
              color: 'white',
            }}
          >
            <IonIcon icon={arrowBackOutline} slot="icon-only" />
          </IonButton>
          <IonTitle>Registro de Aspirantes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent 
        style={{
          backgroundColor: 'var(--main-bg-color)', // Fondo verde
          minHeight: '50vh',        // Altura completa
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
        }}>
          <div className="container" style={{ marginTop: '10px' }}>
          <img src={logo} alt="Logo Ayuvi" className="logoaspirante" />
          </div>

          {/* NUEVO CAMPO PARA USUARIO */}
        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#FF6347', // Un color distintivo, por ejemplo, tomate
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >Usuario</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              // Vincula el valor al estado
              value={formData.usuario}
              // Llama a handleInputChange con la clave 'usuario'
              onIonChange={(e) => handleInputChange('usuario', e.detail.value!)}
              placeholder="Ingrese su nombre de usuario"
              type="text"
            />
          </div>
        </IonItem>
        {/* FIN DEL CAMPO PARA USUARIO */}

        {/* NUEVO CAMPO PARA CONTRASEÑA CON TOGGLE */}
        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#9370DB', // Un color distintivo, por ejemplo, púrpura
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >Contraseña</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={formData.contrasenia}
              onIonChange={(e) => handleInputChange('contrasenia', e.detail.value!)}
              placeholder="Ingrese su contraseña"
              // Define el tipo de input según el estado showPassword
              type={showPassword ? 'text' : 'password'}
            >
              {/* Ícono de 'ojito' al final del input */}
              <IonIcon
                icon={showPassword ? eyeOff : eye}
                slot="end"
                style={{ cursor: 'pointer', color: 'white' }}
                onClick={() => setShowPassword(!showPassword)}
              />
            </IonInput>
          </div>
        </IonItem>
        {/* FIN DEL CAMPO PARA CONTRASEÑA */}

        {/* CONFIRMAR CONTRASEÑA CON TOGGLE */}
        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#9370DB', // Mismo color para coherencia
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >Confirmar Contraseña</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={confirmContrasenia} // Nota: Usar confirmContrasenia aquí
              onIonChange={(e) => setConfirmContrasenia(e.detail.value!)}
              placeholder="Confirme su contraseña"
              // Define el tipo de input según el estado showConfirmPassword
              type={showConfirmPassword ? 'text' : 'password'}
            >
               {/* Ícono de 'ojito' al final del input */}
              <IonIcon
                icon={showConfirmPassword ? eyeOff : eye}
                slot="end"
                style={{ cursor: 'pointer', color: 'white' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </IonInput>
          </div>
        </IonItem>
        {/*FIN DE CONFIRMACIÓN*/}

        {/* Checklist de validaciones de contraseña */}
        <div style={{ maxWidth: 320, margin: '4px auto 8px', color: '#fff' }}>
          <p style={{ margin: '6px 0', fontWeight: 600 }}>La contraseña debe:</p>
          <ul style={{ paddingLeft: 20, marginTop: 4 }}>
            <li style={{ color: pwdChecks.minLength ? '#8ee08e' : '#ffb3b3' }}>Mínimo 8 caracteres</li>
            <li style={{ color: pwdChecks.hasNumber ? '#8ee08e' : '#ffb3b3' }}>Incluir al menos un número</li>
            <li style={{ color: pwdChecks.startsUpper ? '#8ee08e' : '#ffb3b3' }}>Iniciar con mayúscula</li>
            <li style={{ color: pwdChecks.hasSpecial ? '#8ee08e' : '#ffb3b3' }}>Incluir un signo especial</li>
            <li style={{ color: passwordsMatch() ? '#8ee08e' : '#ffb3b3' }}>Las contraseñas deben coincidir</li>
          </ul>
        </div>
        
        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#55A605', // Opcional: sombra para diseño
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label">Nombre Completo</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={formData.nombre}
              onIonChange={(e) => handleInputChange('nombre', e.detail.value!)}
              style={{
                //marginBottom: '5px',
                fontSize: '16px',
                width: '100%',
              }}
              placeholder="Ingrese su nombre"
            />
          </div>
        </IonItem>

        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#D62498',
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label">Fecha de Nacimiento</IonLabel>
          </div>
          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
          <IonInput
            value={formData.fechaNacimiento}
            readonly
            placeholder="Seleccione su fecha de nacimiento"
            onClick={() => setIsDatePickerVisible(true)}
          />
          </div>
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
              backgroundColor: '#262626',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 10px rgba(173, 22, 211, 0.2)',
              zIndex: 1000,
            }}
          >
          <IonDatetime
            value={formData.fechaNacimiento || ''} // Siempre usar una cadena válida
            onIonChange={(e) => {
              const value = Array.isArray(e.detail.value) ? e.detail.value[0] : e.detail.value; // Convertir a string
              if (value) {
                setFormData({ ...formData, fechaNacimiento: value });
              }
            }}
            presentation="date"
            showDefaultButtons={false}
            style={{
              maxWidth: '100%',
              textAlign: 'center',
              backgroundColor: '#262626',
            }}
          />
            <IonButton
              color="success"
              style={{
                marginTop: '16px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: '200px',
              }}
              onClick={() => setIsDatePickerVisible(false)}
            >
              Aceptar
            </IonButton>
          </div>
        )}

        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#28C3F9',
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label"  >Teléfono</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={formData.telefono}
              onIonChange={(e) => handleInputChange('telefono', e.detail.value!)}
              placeholder="Ingrese su teléfono"
              type="tel"
            />
          </div>
        </IonItem>

        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#F77310',
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >Domicilio</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={formData.domicilio}
              onIonChange={(e) => handleInputChange('domicilio', e.detail.value!)}
              placeholder="Ingrese su domicilio"
            />
          </div>
        </IonItem>

        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#FFBC24',
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >CUI</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={formData.CUI}
              onIonChange={(e) => handleInputChange('CUI', e.detail.value!)}
              placeholder="Ingrese su CUI"
              type="number"
            />
          </div>
        </IonItem>

        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#8500BC',
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >Correo Electrónico</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              value={formData.correo}
              onIonChange={(e) => handleInputChange('correo', e.detail.value!)}
              placeholder="Ingrese su correo electrónico"
              type="email"
            />
          </div>
        </IonItem>

        {/* NUEVO CAMPO PARA TALLA */}
        <IonItem
          style={{
            display: 'flex', // Habilitar flexbox
            maxWidth: '300px', // Ancho máximo
            height: '120px', // Altura del combobox
            margin: '16px auto', // Margen para separación y centrar horizontalmente
            textAlign: 'center', // Alinear contenido
            borderRadius: '8px', // Opcional: bordes redondeados
            backgroundColor: '#3880ff', // Opcional: color azul
          }}>
          <div style={{ justifyContent: 'center', }}>
            <IonLabel className="custom-label" >Talla</IonLabel>
          </div>

          <div style={{width: '100%', marginTop: '40px', justifyContent: 'center',}}>
            <IonInput
              // Vincula el valor al estado
              value={formData.talla}
              // Llama a handleInputChange con la clave 'talla'
              onIonChange={(e) => handleInputChange('talla', e.detail.value!.toUpperCase())}
              placeholder="Ingrese su talla de playera"
              type="text"
            />
          </div>
        </IonItem>
        {/* FIN DEL NUEVO CAMPO PARA TALLA */}

        <IonItem 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: '300px',
            height: '100px',
            margin: '16px auto',
            textAlign: 'center',
            borderRadius: '8px',
            backgroundColor: '#0896A6',
          }}>
          <IonSelect
            value={formData.idDepartamento}
            placeholder="Seleccione su departamento"
            onIonChange={(e) => handleDepartamentoChange(e.detail.value!)}  
            interfaceOptions={{
              cssClass: 'custom-alert', // Clase CSS selectItem
            }}
          >
            {departamentos.map((departamento: any) => (
              <IonSelectOption  key={departamento.idDepartamento} value={departamento.idDepartamento}>
                {departamento.departamento}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem  style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '300px',
          height: '100px',
          margin: '16px auto',
          textAlign: 'center',
          borderRadius: '8px',
          backgroundColor: '#55A605',
        }}>
          <IonSelect
            value={formData.idMunicipio}
            placeholder="Seleccione su municipio"
            onIonChange={(e) => handleInputChange('idMunicipio', e.detail.value!)}
            disabled={!municipios.length} // Deshabilitar si no hay municipios disponibles
            interfaceOptions={{
              cssClass: 'custom-alert', // Clase CSS para selectItem
            }}
          >
            {municipios.map((municipio: any) => (
              <IonSelectOption key={municipio.idMunicipio} value={municipio.idMunicipio}>
                {municipio.municipio}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>


        <IonButton expand="block" onClick={handleSubmit} color="primary" style={{ marginTop: '16px', width: '200px', margin: '30px auto', }} disabled={!(pwdChecks.minLength && pwdChecks.hasNumber && pwdChecks.startsUpper && pwdChecks.hasSpecial && passwordsMatch())}>
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
