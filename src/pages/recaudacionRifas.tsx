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
      setTiposPagosOptions(response.data);
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
  
  const handleFileUpload = async (index: number) => {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: 100,
      });
  
      const nuevosPagos = [...tiposPagos];
      nuevosPagos[index].imagenTransferencia = photo.base64String || "";
      setTiposPagos(nuevosPagos);
  
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
        <IonHeader>
          <IonToolbar style={{ backgroundColor: "#0274E5" }}>
            <IonTitle style={{ color: "#000000" }}>Talonarios del Voluntario</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
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
        <IonHeader>
          <IonToolbar style={{ backgroundColor: "#0274E5" }}>
            <IonTitle style={{ color: "#000000" }}>Talonarios del Voluntario</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: "center", marginTop: "20px", color: "#0274E5" }}>
            <p>No se encontraron datos del voluntario.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#0274E5" }}>
          <IonTitle style={{ color: "#000000" }}>Talonarios del Voluntario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ backgroundColor: "#F0F8FF" }}>
        <IonCard style={{ margin: "20px", boxShadow: "0 4px 8px rgba(115, 247, 194, 0.1)" }}>
          <IonCardHeader style={{ backgroundColor: "#0274E5" }}>
            <IonCardTitle style={{ color: "#FFFFFF" }}>Recaudaciones de {voluntario?.persona?.nombre}</IonCardTitle>
          </IonCardHeader>
        </IonCard>

        {/* Selección de Rifa */}
        <IonAccordionGroup>
          <IonAccordion value="rifas">
            <IonItem slot="header" style={{ backgroundColor: "#FF5722", color: "#FFFFFF" }}>
              <IonLabel style={{ color: "#FFFFFF", fontSize: "24px", fontWeight: "bold", backgroundColor: "#FFC107" }}>Rifas</IonLabel>
            </IonItem>
            <IonList slot="content" style={{ backgroundColor: "#FFE0B2" }}>
              {rifas.map((rifa: { idRifa: string; nombreRifa: string; descripcion: string; precioBoleto: number }) => (
                <IonItem key={rifa.idRifa} style={{ margin: "10px", borderRadius: "10px", boxShadow: "0 4px 8px rgba(99, 175, 233, 0.18)" }} button onClick={() => handleRifaClick(rifa.idRifa)}>
                  <IonLabel>
                    <h2 style={{ color: "#FF5722" }}>{rifa.nombreRifa}</h2>
                    <p><strong>Descripción:</strong> {rifa.descripcion}</p>
                    <p><strong>Precio del boleto:</strong> Q{rifa.precioBoleto}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonAccordion>
        </IonAccordionGroup>

        {/* Modal para mostrar los talonarios */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Talonarios</IonTitle>
              <IonButton slot="end" onClick={() => setShowModal(false)}>Cerrar</IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {talonarios.length > 0 ? (
              <IonList>
                {talonarios.map((talonario: any) => (
                  <IonItem key={talonario.idTalonario}>
                    <IonLabel>
                      <h2>{`Código: ${talonario.codigoTalonario}`}</h2>
                      <p>{`Boletos disponibles: ${talonario.cantidadBoletos}`}</p>
                    </IonLabel>
                    <IonButton onClick={() => handleVenderBoleto(talonario.idTalonario, talonario)}>
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
        <IonModal isOpen={showVentaModal} onDidDismiss={() => setShowVentaModal(false)}>
        <IonHeader>
            <IonToolbar>
            <IonTitle>Vender Boleto</IonTitle>
            <IonButton slot="end" onClick={() => setShowVentaModal(false)}>Cerrar</IonButton>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonItem>
            <IonLabel position="stacked">Cantidad de Boletos</IonLabel>
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
            <IonLabel>Total a Pagar: </IonLabel>
            <IonInput readonly value={`Q${(totalVenta || 0).toFixed(2)}`} />
            </IonItem>


            {/* Sección de Pagos */}
            <IonLabel style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>Pagos</IonLabel>
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
                    </IonCol>
                    </IonRow>
                    <IonButton color="danger" onClick={() => handleRemovePago(index)}>Quitar Pago</IonButton>
                </IonGrid>
                </IonCardContent>
            </IonCard>
            ))}
            <IonButton expand="block" onClick={() => setTiposPagos([...tiposPagos, { idTipoPago: "", monto: 0, correlativo: "", imagenTransferencia: "" }])}>
            Agregar Pago
            </IonButton>

            <IonFooter>
            <IonButton expand="block" onClick={handleCreateRecaudacion} style={{ marginTop: "20px" }}>Confirmar Venta</IonButton>
            <IonButton expand="block" color="medium" onClick={() => setShowVentaModal(false)}>Cancelar</IonButton>
            </IonFooter>
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