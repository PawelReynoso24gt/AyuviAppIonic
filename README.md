# AYUDANDO A VIVIR

## Descripción del proyecto

Este proyecto tiene como objetivo desarrollar una aplicación web y móvil (compatible con Android e iOS) para la Fundación AYUVI en su sede de Quetzaltenango, Guatemala. La aplicación está diseñada para facilitar la gestión del voluntariado, permitiendo a los usuarios registrarse, crear un perfil y participar en tareas y actividades organizadas por el equipo administrativo. Estas actividades están enfocadas en recaudar fondos destinados al tratamiento de niños con cáncer.

Este es un proyecto de carrera desarrollada por estudiantes de la carrera de **Ingeniería en Sistemas, Informática y Ciencias de la Computación** de la Universidad Mesoamericana, sede Quetzaltenango.

A continuación, se describen los pasos necesarios para la implementación del proyecto (hecho con IONIC):

## Instalación de dependencias para el proyecto

1. Clona este repositorio:
```bash
git clone https://github.com/PawelReynoso24gt/AyuviAppIonic.git
```
2. Instala las dependencias necesarias para el proyecto:
```bash
nmp install
```
3. Instalación de paquetes para usar ionic (de forma global para que se use para futuros proyectos):
```bash
npm install -g @ionic/cli
```

### Uso de la aplicación

1. Para iniciarlo en vista web:
```bash
ionic serve
```

2. Para usarlo en Android y iOS, se debe seguir el siguiente orden:

- Primero usar el siguiente comando para construir la aplicación y guardar los cambios que se han hecho:
```bash
ionic build
```

- Luego usar este comando para sincronizar los cambios para lanzarlos al dispositivo:
```bash
npx cap sync
```

- Finalmente, usar el siguiente comando para lanzar la aplicación en el dispositivo **(Si lo usará en Android debe tener instalado Android Studio y si lo usará en iOS debe tener instalado XCode que solo está disponible para Mac)**

**Android:**
```bash
npx cap open android
```

**iOS:**
```bash
npx cap open ios
```

### Otras dependencias que se usaron para este proyecto:

```bash
npm install dotenv
```

```bash
npm install @ionic/storage
```

```bash
npm install axios
```

```bash
npm install jwt-decode
```

```bash
npm install axios react-slick slick-carousel
```

```bash
npm install --save-dev @types/react-slick
```

```bash
npm install date-fns
```

```bash
npm install react-multi-carousel
```

```bash
npm install --save-dev @types/react-modal
```

```bash
npm install @capacitor/camera
```

```bash
npm install moment
```

# DESARROLLADORES

- **Angely Esmeralda Thomas Cortéz** - 202108047
- **Pablo Daniel Vásquez Monzón** - 202108025
- **Alejandra González Monterrosa** - 20108048 
- **Pawel Alessandro Reynoso Marquez** - 202108006
