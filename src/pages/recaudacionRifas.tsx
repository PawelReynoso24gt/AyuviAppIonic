import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonSpinner,
  IonToast,
  IonCardContent,
  IonList,
  IonItem,
  IonAccordion,
  IonAccordionGroup,
  IonModal,
  IonButton,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter
} from "@ionic/react";
import axios from "../services/axios"; // Instancia de Axios
import { getInfoFromToken } from "../services/authService";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import '../theme/variables.css';
import imageCompression from 'browser-image-compression';

type Pago = {
  idTipoPago: string;
  monto: number;
  correlativo: string;
  imagenTransferencia: string;
};

const VoluntarioProductos: React.FC = () => {
  const [idVoluntario, setIdVoluntario] = useState<number | null>(null); // Para almacenar el idVoluntario
  const [voluntario, setVoluntario] = useState<any>({ detalle_rifas: [] }); // Datos del voluntario, inicializado con un array vacío
  const [loading, setLoading] = useState<boolean>(true); // Indicador de carga
  const [toastMessage, setToastMessage] = useState<string>(""); // Mensaje de error
  const [rifas, setRifas] = useState<any[]>([]); // Almacena las rifas
  const [talonarios, setTalonarios] = useState<any[]>([]); // Almacena los talonarios
  const [selectedRifa, setSelectedRifa] = useState<string>(""); // Rifa seleccionada
  const [showModal, setShowModal] = useState<boolean>(false); // Estado para mostrar/ocultar el modal
    const [selectedTalonarioId, setSelectedTalonarioId] = useState<string | null>(null);
    const [selectedTalonarioPrecio, setSelectedTalonarioPrecio] = useState<number | null>(null);
    const [showVentaModal, setShowVentaModal] = useState<boolean>(false);
    const [boletosVendidos, setBoletosVendidos] = useState<number>(1);
    const [tiposPagos, setTiposPagos] = useState<Pago[]>([]);
const [tiposPagosOptions, setTiposPagosOptions] = useState<{ idTipoPago: string; tipo: string }[]>([]);
const [totalVenta, setTotalVenta] = useState<number>(0);
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5; // Número de rifas por página
const [fileNames, setFileNames] = useState<{ [key: number]: string }>({}); // nombre de arhivos


const currentRifas = rifas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Función para obtener los datos del voluntario
  const fetchVoluntario = async (idVoluntario: number) => {
    try {
      const response = await axios.get(`/voluntarios/${idVoluntario}`);
      //console.log("Datos del voluntario obtenidos:", response.data);
      setVoluntario(response.data);
    } catch (error) {
      console.error("Error fetching voluntario:", error);
      setToastMessage("Error al obtener los datos del voluntario.");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las rifas
  const fetchRifas = async () => {
    try {
      const response = await axios.get("/rifas");
      //console.log("Rifas obtenidas:", response.data);
      setRifas(response.data);
    } catch (error) {
      console.error("Error fetching rifas:", error);
      setToastMessage("Error al obtener las rifas.");
    }
  };

  const fetchTiposPagos = async () => {
    try {
      const response = await axios.get("/tipospagos");
      // Filtrar los tipos de pago para incluir solo aquellos con idTipoPago del 1 al 4
      const filteredTiposPagos = response.data.filter((tipo: any) => {
        const id = parseInt(tipo.idTipoPago, 10);
        return id >= 1 && id <= 4;
      });
      setTiposPagosOptions(filteredTiposPagos);
    } catch (error) {
      console.error("Error fetching tipos pagos:", error);
    }
  };

  // Función para obtener los talonarios del voluntario para una rifa específica
  const fetchTalonarios = async (idRifa: string) => {
    if (!idVoluntario) return;

    try {
      const response = await axios.get(`/rifas/voluntarios/talonarios/${idVoluntario}/${idRifa}`);
      //console.log("Talonarios obtenidos para la rifa:", idRifa, response.data);
      setTalonarios(response.data);
    } catch (error) {
      console.error("Error fetching talonarios:", error);
      setToastMessage("Error al obtener los talonarios.");
    } finally {
      setShowModal(true); // Mostrar el modal después de obtener los talonarios
    }
  };

  // useEffect para obtener el id del voluntario y sus datos
  useEffect(() => {
    const info = getInfoFromToken();
    if (info?.idVoluntario) {
      const id = parseInt(info.idVoluntario, 10); // Convertir a número
      setIdVoluntario(id);
      //console.log("Usuario logueado con idVoluntario:", id);
      fetchVoluntario(id); // Llamar a la función para obtener los datos del voluntario
    } else {
      //console.log("No se encontró idVoluntario en el token.");
      setToastMessage("ID del voluntario no encontrado en el token.");
      setLoading(false);
      return;
    }
  
    fetchTiposPagos(); // Obtener los tipos de pagos
    fetchRifas(); // Obtener las rifas
  }, []);
  
  useEffect(() => {
    if (selectedTalonarioPrecio !== null && !isNaN(boletosVendidos)) {
      const nuevoTotalVenta = selectedTalonarioPrecio * boletosVendidos;
      setTotalVenta(nuevoTotalVenta);
      //console.log(`Nuevo total de venta: Q${nuevoTotalVenta.toFixed(2)}`);
    } else {
      setTotalVenta(0); // Establece un valor por defecto para evitar NaN
    }
  }, [boletosVendidos, selectedTalonarioPrecio]);

  const handleRifaClick = (idRifa: string) => {
    setSelectedRifa(idRifa);
    setTalonarios([]); // Restablecer talonarios
    fetchTalonarios(idRifa); // Cargar talonarios para la rifa seleccionada
  };

  const handleVenderBoleto = (idTalonario: string, talonario: any) => {
    const precioBoleto = parseFloat(talonario.rifa.precioBoleto);
    //console.log(`Precio del boleto seleccionado: Q${precioBoleto}`); 
    setSelectedTalonarioId(idTalonario);
    setSelectedTalonarioPrecio(precioBoleto);
    setShowVentaModal(true);
  };

  const handlePagoChange = (index: number, field: keyof Pago, value: any) => {
    const nuevosPagos = [...tiposPagos];
    (nuevosPagos[index] as any)[field] = value;
    setTiposPagos(nuevosPagos);
  
    const totalPagos = nuevosPagos.reduce((sum, pago) => sum + parseFloat(pago.monto.toString()), 0);
    //console.log(`Total de pagos: ${totalPagos}`);
  };
  
  const handleRemovePago = (index: number) => {
    const nuevosPagos = tiposPagos.filter((_, i) => i !== index);
    setTiposPagos(nuevosPagos);
  };
  
  const handleAddPago = () => {
    const nuevoPago = {
      idTipoPago: "", // Campo vacío para que el usuario lo seleccione
      monto: 0,
      correlativo: "",
      imagenTransferencia: ""
    };
  
    setTiposPagos((prevPagos) => [...prevPagos, nuevoPago]);
  };

  const compressImageTo50KB = async (file: File) => {
    try {
        // **Opciones de compresión**
        const options = {
            maxSizeMB: 0.05, // 50KB = 0.05MB
            maxWidthOrHeight: 800, // Mantener un tamaño decente
            useWebWorker: true, // Usar un proceso en segundo plano
            alwaysKeepResolution: true, // Evita distorsión
        };

        let compressedFile = await imageCompression(file, options);

        //console.log(`Comenzando compresión: ${file.size / 1024} KB`);

        // **Si la imagen sigue siendo mayor a 50KB, reducir calidad dinámicamente**
        let attempts = 0;
        while (compressedFile.size > 51200 && attempts < 3) { // 50KB = 51200 bytes
            options.maxSizeMB *= 0.9; // Reduce calidad en cada iteración
            compressedFile = await imageCompression(compressedFile, options);
        }

        //console.log(`Tamaño final: ${(compressedFile.size / 1024).toFixed(2)} KB`);
        return compressedFile;
    } catch (error) {
        console.error("Error al comprimir la imagen:", error);
        return file; // Devuelve el archivo original si hay error
    }
};
  
  const handleFileUpload = async (index: number) => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 100,
      });
  
      if (!photo.webPath) {
        throw new Error("No se pudo obtener la imagen.");
    }

    // **Obtener imagen como Blob**
    const response = await fetch(photo.webPath);
    const blob = await response.blob();

    // **Convertir el Blob en File**
    const file = new File([blob], `image_${index}.jpg`, { type: blob.type });

    //console.log(`Imagen capturada: ${file.name}`);
    //console.log(`Tamaño original: ${(file.size / 1024).toFixed(2)} KB`);

    // **Comprimir imagen a 50KB**
    const compressedFile = await compressImageTo50KB(file);

    //console.log(`Tamaño después de compresión: ${(compressedFile.size / 1024).toFixed(2)} KB`);

    // **Convertir a HEX**
    const arrayBuffer = await compressedFile.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    const hexString = Array.from(byteArray)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");

    //console.log(`Longitud del HEX: ${hexString.length} caracteres`);

    // **Actualizar estado**
    const nuevosPagos = [...tiposPagos];
    nuevosPagos[index].imagenTransferencia = hexString;
    setTiposPagos(nuevosPagos);

    // **Guardar el nombre del archivo**
    setFileNames((prev) => ({ ...prev, [index]: file.name }));
  
      setToastMessage("Foto cargada exitosamente.");
    } catch (error) {
      console.error("Error uploading file:", error);
      setToastMessage("Error al subir la imagen.");
    }
  };

  const handleCreateRecaudacion = async () => {
    if (!selectedTalonarioId || !selectedTalonarioPrecio || boletosVendidos <= 0) {
        alert("Faltan datos necesarios para la recaudación.");
        return;
    }
  
    const totalVenta = selectedTalonarioPrecio * boletosVendidos;
    const totalPagos = tiposPagos.reduce((sum, pago) => sum + parseFloat(pago.monto.toString()), 0);
    
    //console.log(`Total de pagos: ${totalPagos}`); 
    //console.log(`Total de venta: ${totalVenta}`); 
    
    if (totalPagos !== totalVenta) {
      alert(`La suma de los pagos (${totalPagos}) no coincide con el total de la venta (${totalVenta}).`);
      return;
    }

    // Validar pagos que requieren correlativo e imagen
    for (const pago of tiposPagos) {
        if ([1, 2, 4].includes(parseInt(pago.idTipoPago, 10))) { // Depósito, Transferencia, Cheque
        if (!pago.correlativo || !pago.imagenTransferencia) {
            const tipoPago = tiposPagosOptions.find(option => option.idTipoPago === pago.idTipoPago)?.tipo || "desconocido";
            alert(`El tipo de pago ${tipoPago} requiere correlativo e imagen.`);
            return;
        }
    }

    // Manejo de valores por defecto para tipos de pago
    pago.correlativo = pago.correlativo || "NA"; // Por defecto "NA"
    pago.imagenTransferencia = pago.imagenTransferencia || "efectivo"; // Por defecto "efectivo"
  }
  
    const recaudacionData = {
      idTalonario: selectedTalonarioId,
      boletosVendidos,
      pagos: tiposPagos
    };
    
    //console.log("JSON a enviar:", JSON.stringify(recaudacionData, null, 2)); 
  
    try {
      const response = await axios.post("/recaudaciones/rifa/completa", recaudacionData);
      if (response.status === 201) {
        alert("Venta creada con éxito");
        setShowVentaModal(false);
        setShowModal(false); // Cierra el modal de los talonarios
        setSelectedTalonarioId(null);
        setSelectedTalonarioPrecio(null);
        setBoletosVendidos(1);
        setTiposPagos([]);
        setTotalVenta(0);
        setTalonarios([]); // Restablecer talonarios si es necesario
      }
    } catch (error) {
      console.error("Error creando la recaudación:", (error as any).message || error);
      alert("Error al crear la recaudación: " + ((error as any).message || "Revisa los datos ingresados."));
    }
  };

  if (loading) {
    return (
      <IonPage>
        {/* <IonHeader>
          <IonToolbar style={{ backgroundColor: "#0274E5" }}>
            <IonTitle style={{ color: "#000000" }}>Talonarios del Voluntario</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        <IonContent className="page-with-background">
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonSpinner name="crescent" style={{ color: "#0274E5" }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!voluntario) {
    return (
      <IonPage>
        {/* <IonHeader>
          <IonToolbar style={{ backgroundColor: "#0274E5" }}>
            <IonTitle style={{ color: "#000000" }}>Talonarios del Voluntario</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        <IonContent className="page-with-background">
          <div style={{ textAlign: "center", marginTop: "100px", color: "#0274E5", fontSize: "20px" }}>
            <p>No se encontraron rifas disponibles.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar style={{ backgroundColor: "#0274E5" }}>
          <IonTitle style={{ color: "#000000" }}>Talonarios del Voluntario</IonTitle>
        </IonToolbar>
      </IonHeader> */}
      <IonContent className="page-with-background">
      <div
            style={{
                padding: "20px",
                textAlign: "center",
                background: "linear-gradient(45deg, rgb(12, 146, 170),rgb(12, 146, 170)",
                borderRadius: "10px",
                margin: "10px",
                color: "white",
            }}
        >
            <h2>Recaudaciones de Rifas</h2>
            <p>Puede ver las rifas disponibles de las que usted haya solicitado talonario</p>
        </div>

        {/* Selección de Rifa */}
        <IonList>
          {currentRifas.map((rifa) => (
            <IonItem
              key={rifa.idRifa}
              style={{ margin: "10px", borderRadius: "10px", backgroundColor: "#D6EAF8" }}
              button
              onClick={() => handleRifaClick(rifa.idRifa)}
            >
              <IonLabel>
                <h2 style={{ color: "#0274E5" }}>{rifa.nombreRifa}</h2>
                <p><strong>Descripción:</strong> {rifa.descripcion}</p>
                <p><strong>Precio del boleto:</strong> Q{rifa.precioBoleto}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        {/* Botones de navegación */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <IonButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Anterior
          </IonButton>
          <IonButton onClick={() => setCurrentPage((prev) => (prev * itemsPerPage < rifas.length ? prev + 1 : prev))} disabled={currentPage * itemsPerPage >= rifas.length}>
            Siguiente
          </IonButton>
        </div>

        {/* Modal para mostrar los talonarios */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} style = {{borderRadius: "10px"}}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Talonarios</IonTitle>
              <IonButton slot="end" onClick={() => setShowModal(false)}>Cerrar</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {/* Botón CERRAR fijo en la parte superior */}
            <div style={{ textAlign: "right", padding: "10px" }}>
              <IonButton className = "custom-greenBlue-button" onClick={() => setShowModal(false)}>
                CERRAR
              </IonButton>
            </div>
            {talonarios.length > 0 ? (
              <IonList>
                {talonarios.map((talonario: any) => (
                  <IonItem key={talonario.idTalonario}>
                    <IonLabel>
                      <h2>{`Código: ${talonario.codigoTalonario}`}</h2>
                      <p>{`Boletos disponibles: ${talonario.cantidadBoletos}`}</p>
                    </IonLabel>
                    <IonButton className = "custom-greenBlue-button" onClick={() => handleVenderBoleto(talonario.idTalonario, talonario)}>
                        Vender Boleto
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <p>No tiene talonarios de esta rifa, use otra por favor.</p>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Modal para vender boletos */}
        <IonModal isOpen={showVentaModal} onDidDismiss={() => setShowVentaModal(false)} style = {{borderRadius: "10px"}}>
        <IonHeader>
            <IonToolbar>
            <IonTitle>Vender Boleto</IonTitle>
            <IonButton slot="end" onClick={() => setShowVentaModal(false)}>Cerrar</IonButton>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonItem>
            <IonLabel position="stacked" style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", marginLeft: "20px"}}>Cantidad de Boletos</IonLabel>
            <IonInput
                type="number"
                value={boletosVendidos}
                onIonChange={(e) => {
                    const value = parseInt(e.detail.value || '0', 10);
                    setBoletosVendidos(isNaN(value) ? 0 : value); // Asegura que siempre sea un número válido
                }}
            />
            </IonItem>

            {/* Mostrar el total de la venta */}
            <IonItem>
            <IonLabel position="stacked" style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", marginLeft: "20px"}}>Total a Pagar: </IonLabel>
            <IonInput readonly value={`Q${(totalVenta || 0).toFixed(2)}`} />
            </IonItem>


            {/* Sección de Pagos */}
            <IonLabel style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", marginLeft: "50px"}}>Pagos</IonLabel>
            {tiposPagos.map((pago, index) => (
            <IonCard key={index}>
                <IonCardContent>
                <IonGrid>
                    <IonRow>
                    <IonCol size="6">Tipo de Pago:</IonCol>
                    <IonCol size="6">
                        <IonSelect
                        value={pago.idTipoPago}
                        onIonChange={(e) => handlePagoChange(index, 'idTipoPago', e.detail.value)}
                        interfaceOptions={{
                          cssClass: 'custom-alert', // Clase CSS para selectItem
                        }}
                        >
                        {tiposPagosOptions.map((tipo) => (
                            <IonSelectOption key={tipo.idTipoPago} value={tipo.idTipoPago}>
                            {tipo.tipo}
                            </IonSelectOption>
                        ))}
                        </IonSelect>
                    </IonCol>
                    </IonRow>
                    <IonRow>
                    <IonCol size="6">Monto:</IonCol>
                    <IonCol size="6">
                        <IonInput
                        type="number"
                        value={pago.monto}
                        onIonChange={(e) => handlePagoChange(index, 'monto', e.detail.value)}
                        />
                    </IonCol>
                    </IonRow>
                    <IonRow>
                    <IonCol size="6">Correlativo:</IonCol>
                    <IonCol size="6">
                        <IonInput
                        type="text"
                        value={pago.correlativo}
                        onIonChange={(e) => handlePagoChange(index, 'correlativo', e.detail.value)}
                        />
                    </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol size="6">Imagen:</IonCol>
                        <IonCol size="6">
                            <IonButton onClick={() => handleFileUpload(index)}>Subir Imagen</IonButton>
                            {/* Mostrar el nombre del archivo si existe */}
                            {fileNames[index] && (
                                <p style={{ fontSize: "12px", color: "green", marginTop: "5px" }}>
                                    {fileNames[index]}
                                </p>
                            )}
                        </IonCol>
                    </IonRow>
                    <IonButton color="danger" onClick={() => handleRemovePago(index)}>Quitar Pago</IonButton>
                </IonGrid>
                </IonCardContent>
            </IonCard>
            ))}
            <div style={{ textAlign: "center"}}>
            <IonButton className = "custom-greenBlue-button" onClick={() => setTiposPagos([...tiposPagos, { idTipoPago: "", monto: 0, correlativo: "", imagenTransferencia: "" }])}>
            Agregar Pago
            </IonButton>
            </div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <IonButton className = "custom-greenBlue-button" onClick={handleCreateRecaudacion} style={{ marginTop: "20px" }}>Confirmar Venta</IonButton>
            </div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <IonButton className = "custom-greenBlue-button" onClick={() => setShowVentaModal(false)}>Cancelar</IonButton>
            </div>
        </IonContent>
        </IonModal>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default VoluntarioProductos;