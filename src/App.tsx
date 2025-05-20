import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch, useLocation } from 'react-router-dom';
import { IonApp, IonMenu, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonRouterOutlet, setupIonicReact, IonModal, IonButton, IonIcon, IonFooter, IonPage, IonButtons, IonMenuButton } from '@ionic/react';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Profile from './pages/PerfilUsuario';
import ChangePassword from './pages/ChangePassword';
import RequestTalonario from "./pages/RequestTalonario";
import PrivateRoute from '../src/components/PrivateRoute';
import registroEventos from '../src/pages/registroEventos';
import registroComisiones from '../src/pages/registroComisiones';
import registroMateriales from '../src/pages/registroMateriales';
import registroActividades from '../src/pages/registroActividades';
import registroAspirante from '../src/pages/registroAspirante';
import solicitudPendiente from '../src/pages/solicitudPendiente';
import productosVoluntarios from '../src/pages/productosVoluntarios';
import Sede from '../src/pages/Sede';
import asignacionStands from './pages/asignacionStands';
import invitado from '../src/pages/invitado';
import productosStands from '../src/pages/productosStands';
import recaudacionRifas from '../src/pages/recaudacionRifas';
import standVirtual from '../src/pages/standVirtual';
import Notifications from './pages/NotificationsCom';
import NotificationBell from './components/NotificationBell';
import situaciones from './pages/situaciones';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './theme/variables.css';
import './App.css';

//  Importar funcion para extraer idUsuario del token
import { getInfoFromToken } from './services/authService';
import axios from './services/axios';
import usePasswordChangeCheck from './hooks/usePasswordChangeCheck';
import { home, homeOutline, person } from 'ionicons/icons';

setupIonicReact();

const App: React.FC = () => {

  return (
    <IonApp>
      <Router>
        <Menu />
        <MainContent />
      </Router>
    </IonApp>
  );
};

const MainContent: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isInvitadoPage = location.pathname === '/invitado';
  const isRegistroAspirantePage = location.pathname === '/registroAspirante';
  const { showModal, message, daysRemaining, handleCloseModal } = usePasswordChangeCheck();

  const routesWithBackground = ['/registroEventos'];
  const isBackgroundRoute = routesWithBackground.includes(location.pathname);

  // Mapeo de rutas a títulos de la barra de navegación (se agregan las rutas que se necesiten)
  const routeTitles: { [key: string]: string } = {
    '/home': 'Inicio',
    '/about': 'Acerca de',
    '/sede': 'Sede',
    '/profile': 'Perfil',
    '/change-password': 'Cambiar Contraseña',
    '/request-talonario': 'Solicitar Talonario',
    '/registroEventos': 'Registro a Eventos',
    '/registroComisiones': 'Registro de Comisiones',
    '/registroMateriales': 'Registro de Materiales',
    '/registroActividades': 'Registro de Actividades',
    '/registroAspirante': 'Registro de Aspirante',
    '/asignacionStands': 'Asignación de Stands',
    '/solicitudPendiente': 'Solicitud Pendiente',
    '/productosVoluntarios': 'Venta por Voluntario',
    '/invitado': 'Invitado',
    '/productosStands': 'Venta por Stands',
    '/recaudacionRifas': 'Recaudación de Rifas',
    '/standVirtual': 'Stand Virtual',
    '/notifications': 'Notificaciones',
    '/situaciones': 'Situaciones',
  };



  return (
    <>
      <IonPage>
        <IonContent>
          <IonRouterOutlet id="main-content">
            <Switch>
              <Switch>
                <Route exact path="/login" component={Login} />
                <PrivateRoute exact path="/home" component={Home} />
                <PrivateRoute exact path="/about" component={About} />
                <PrivateRoute exact path="/sede" component={Sede} />
                <PrivateRoute exact path="/profile" component={Profile} />
                <PrivateRoute exact path="/change-password" component={ChangePassword} />
                <PrivateRoute exact path="/request-talonario" component={RequestTalonario} />
                <PrivateRoute exact path="/registroEventos" component={registroEventos} />
                <PrivateRoute exact path="/registroComisiones" component={registroComisiones} />
                <PrivateRoute exact path="/registroMateriales" component={registroMateriales} />
                <PrivateRoute exact path="/registroActiviades" component={registroActividades} />
                <PrivateRoute exact path="/asignacionStands" component={asignacionStands} />
                <Route exact path="/registroAspirante" component={registroAspirante} />
                <Route exact path="/solicitudPendiente" component={solicitudPendiente} />
                <PrivateRoute exact path="/productosVoluntarios" component={productosVoluntarios} />
                <Route exact path="/invitado" component={invitado} />
                <PrivateRoute exact path="/productosVoluntarios" component={productosVoluntarios} />
                <PrivateRoute exact path="/productosStands" component={productosStands} />
                <PrivateRoute exact path="/recaudacionRifas" component={recaudacionRifas} />
                <PrivateRoute exact path="/standVirtual" component={standVirtual} />
                <PrivateRoute exact path="/notifications" component={Notifications} />
                <PrivateRoute exact path="/situaciones" component={situaciones} />
                <PrivateRoute exact path="/about" component={situaciones} />
                <Route exact path="/">
                  <Redirect to="/login" />
                </Route>
                <Route path="*">
                  <Redirect to="/login" />
                </Route>
              </Switch>
            </Switch>
          </IonRouterOutlet>
        </IonContent>
        {!isLoginPage && !isInvitadoPage && !isRegistroAspirantePage && (
          <IonHeader>
            <IonToolbar style={{ backgroundColor: "#0274E5" }}>
              {/* -- botón para abrir/cerrar el menú -- */}
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>

              {/* -- botón de home -- */}
              <IonButtons slot="start">
                <IonButton fill="clear" routerLink="/home">
                  <IonIcon icon={homeOutline} />
                </IonButton>
              </IonButtons>

              {/* campana de notificaciones */}
              <IonButtons slot="end">
                <NotificationBell />
              </IonButtons>

              {/* botón de perfil */}
              <IonButtons slot="end">
                <IonButton fill="clear" routerLink="/profile">
                  <IonIcon icon={person} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
        )}
      </IonPage>

      {/* Modal de Advertencia */}
      {!isLoginPage && !isInvitadoPage && !isRegistroAspirantePage && (
        <IonModal isOpen={showModal}
          onDidDismiss={handleCloseModal}
          className="custom-modal">
          <IonHeader>
            <IonToolbar>
              <IonTitle>¡Advertencia!</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <p>{message}</p>
            {daysRemaining !== null}
          </IonContent>
          <IonButton onClick={handleCloseModal}>Entendido</IonButton>
          <IonButton routerLink="/change-password">Cambiar contraseña</IonButton>
        </IonModal>
      )}
    </>
  );
};

const Menu: React.FC = () => {
  const location = useLocation();
  const noSidebarRoutes = ['/login', '/invitado', '/registroAspirante', '/solicitudPendiente'];
  const isNoSidebarPage = noSidebarRoutes.includes(location.pathname);

  const handleLogout = () => {
    // Borra el localStorage
    //localStorage.clear();
    try {
      // Obtener el userId desde el token
      const tokenInfo = getInfoFromToken();
      if (!tokenInfo || !tokenInfo.idUsuario) {
        throw new Error('No se pudo obtener la información del usuario.');
      }
      // Enviar la solicitud al backend
      axios.put(`/usuarios/logout/${tokenInfo.idUsuario}`);
      localStorage.clear();
    } catch (err: any) {
      console.error(err.message);
    }
    // Redirige al usuario a la página de login
    window.location.href = '/login'; // Redirige a la página de login
  };


  if (isNoSidebarPage) {
    return null;
  }
  return (
    <IonMenu contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menú</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {/*<IonItem routerLink="/home">Inicio</IonItem>*/}
          <IonItem routerLink="/request-talonario">Solicitar Talonario</IonItem>
          <IonItem routerLink="/registroEventos">Registro a Eventos</IonItem>
          <IonItem routerLink="/asignacionStands">Registro a Stands</IonItem>
          <IonItem routerLink="/productosVoluntarios">Venta por Voluntario</IonItem>
          <IonItem routerLink="/productosStands">Venta por Stands</IonItem>
          <IonItem routerLink="/recaudacionRifas">Recaudación de Rifas</IonItem>
          <IonItem routerLink="/standVirtual">Stand Virtual</IonItem>
          {/*<IonItem routerLink="/about">Acerca de</IonItem>*/}
          {/*<IonItem routerLink="/profile">Perfil</IonItem>*/}
          <IonItem routerLink="/sede">Sede</IonItem>
          <IonItem routerLink="/situaciones">Situaciones</IonItem>
          <IonItem routerLink="/about">Terminos y Condiciones</IonItem>
          <IonItem button onClick={handleLogout}>Cerrar sesión</IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default App;