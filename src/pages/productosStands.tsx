import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonCardContent,
  IonModal,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonButtons,
  IonRow,
  IonCol,
  IonGrid
} from "@ionic/react";
import axios from "../services/axios"; // Instancia de Axios
import { getInfoFromToken } from "../services/authService";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"; // Importa el plugin de Camera
import '../theme/variables.css';
interface Producto {
  idProducto: number;
  nombreProducto: string;
  precio: number;
  foto: string;
}

interface DetalleStand {
  idProducto: number;
}

interface Stand {
  idStand: number;
  nombreStand: string;
  direccion: string;
  detallesStands: DetalleStand[];
}

interface DetallesVenta {
  idProducto: number;
  nombreProducto: string;
  precio: number;
  cantidad: number;
  subTotal: number;
  idVoluntario: number | null;
  donacion: number;
  estado: number;
  idStand: number; // Added idStand property
}

interface Pago {
  idTipoPago: string;
  monto: number;
  correlativo: string;
  imagenTransferencia: string;
  idProducto: string;
}

const VoluntarioProductos: React.FC = () => {
  const [idVoluntario, setIdVoluntario] = useState<number | null>(null); // Para almacenar el idVoluntario
  const [voluntario, setVoluntario] = useState<any>(null); // Datos del voluntario
  const [loading, setLoading] = useState<boolean>(true); // Indicador de carga
  const [toastMessage, setToastMessage] = useState<string>(""); // Mensaje de error
  const [detallesVenta, setDetallesVenta] = useState<DetallesVenta[]>([]);
  const [tiposPagos, setTiposPagos] = useState<Pago[]>([]);
  const [tiposPagosOptions, setTiposPagosOptions] = useState<{ idTipoPago: string; tipo: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [stands, setStands] = useState<any[]>([]); // Almacena los stands y productos
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [newVenta, setNewVenta] = useState({
    totalVenta: 0,
    idTipoPublico: "2", 
    estado: 1,
    donacion: 0,
  });
  const [subtotal, setSubtotal] = useState(0);
  const [totalAPagar, setTotalAPagar] = useState(0);

  useEffect(() => {
    // Extraer y guardar idVoluntario desde el token
    const info = getInfoFromToken();
    if (info?.idVoluntario) {
      const id = parseInt(info.idVoluntario, 10); // Convertir a número
      setIdVoluntario(id);
      //console.log("Usuario logueado con idVoluntario:", id);
      setVoluntario(info);
    } else {
      //console.log("No se encontró idVoluntario en el token.");
      setToastMessage("ID del voluntario no encontrado en el token.");
      setLoading(false);
      return;
    }

    // Buscar datos del voluntario
    const fetchStands = async () => {
        try {
          const info = getInfoFromToken();
          if (info?.idVoluntario) {
            const response = await axios.get(`/stands/voluntarios/inscritos/${info.idVoluntario}`);
            // Log para depuración
            //console.log("Respuesta de la API (stands):", response.data);
            
            // Guarda los stands en el estado
            setStands(response.data.map((asignacion: { stand: any }) => asignacion.stand));
            // Extrae el voluntario del primer stand
            if (response.data.length > 0) {
                const voluntarioData = response.data[0].inscripcionEvento.voluntario;
                setVoluntario(voluntarioData);
            }
          } else {
            setToastMessage("No se encontró el id del voluntario en el token.");
          }
        } catch (error) {
          console.error("Error fetching stands:", error);
          setToastMessage("Error al cargar los stands.");
        } finally {
          setLoading(false);
        }
      };

      fetchStands();
  }, []);

  useEffect(() => {
    fetchTiposPagos();
  }, []);

  const fetchTiposPagos = async () => {
    try {
      const response = await axios.get("/tipospagos");
      setTiposPagosOptions(response.data);
    } catch (error) {
      console.error("Error fetching tipos pagos:", error);
    }
  };

  const handleNewVentaChange = (field: keyof typeof newVenta, value: any) => {
    setNewVenta((prevVenta) => ({
      ...prevVenta,
      [field]: value,
    }));
  };

  const handleDetalleChange = (index: number, field: keyof DetallesVenta, value: any) => {
    const nuevosDetalles = [...detallesVenta];
    (nuevosDetalles[index] as any)[field] = value;
    if (field === 'cantidad') {
      nuevosDetalles[index].subTotal = value * nuevosDetalles[index].precio;
    }
    setDetallesVenta(nuevosDetalles);
    recalculateTotals(nuevosDetalles, newVenta.donacion);
  };

  const handlePagoChange = (index: number, field: keyof Pago, value: any) => {
    const nuevosPagos = [...tiposPagos];
    (nuevosPagos[index] as any)[field] = value;
    setTiposPagos(nuevosPagos);
  };

  const handleOpenModal = () => {
    setNewVenta({
      totalVenta: 0,
      idTipoPublico: "2",
      estado: 1,
      donacion: 0,
    });
    setDetallesVenta(
      stands.flatMap((stand) =>
        selectedStand?.detallesStands.map((detalle: any): DetallesVenta => ({
          idProducto: detalle.producto.idProducto,
          nombreProducto: detalle.producto.nombreProducto,
          precio: detalle.producto.precio,
          cantidad: 0,
          subTotal: 0,
          idVoluntario: idVoluntario,
          donacion: 0,
          estado: 1,
          idStand: selectedStand.idStand // Incluye idStand
        }))|| []
      )
    );
    setTiposPagos([]);
    setShowModal(true);
  };

  const recalculateTotals = (detalles: DetallesVenta[], donacion: number) => {
    const nuevoSubtotal = detalles.reduce((sum, detalle) => sum + detalle.subTotal, 0);
    const nuevoTotalAPagar = nuevoSubtotal + parseFloat(donacion.toString() || "0");
    setSubtotal(nuevoSubtotal);
    setTotalAPagar(nuevoTotalAPagar);
    setNewVenta((prevVenta) => ({
      ...prevVenta,
      totalVenta: nuevoTotalAPagar
    }));
  };

  // función para usar la cámara o la galería
    const handleFileUpload = async (index: number) => {
        try {
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.Base64,
                source: CameraSource.Photos, // Cambia esto a CameraSource.Camera si prefieres usar la cámara en lugar de la galería
                quality: 100,
            });

            const nuevosPagos = [...tiposPagos];
            // Guardar la cadena Base64 directamente sin el prefijo
            nuevosPagos[index].imagenTransferencia = photo.base64String || "";
            setTiposPagos(nuevosPagos);

            // Mostrar mensaje de éxito
            setToastMessage("Foto cargada exitosamente.");
        } catch (error) {
            console.error("Error uploading file:", error);
            setToastMessage("Error al subir la imagen.");
        }
    };

  const handleCreateVenta = async () => {
    try {
      // Validar que cada pago tenga un producto asociado con cantidad > 0
      const pagosValidados = tiposPagos.reduce((acc: Pago[], pago) => {
        if (!pago.idTipoPago) {
            throw new Error("Selecciona un tipo de pago para cada entrada.");
          }

          if (pago.monto <= 0) {
            throw new Error("El monto de cada pago debe ser mayor a 0.");
          }

          if (!pago.idProducto) {
            throw new Error("Selecciona un producto válido para cada pago.");
          }
  
        const productoAsociado = detallesVenta.find(
          (detalle) => detalle.idProducto === parseInt(pago.idProducto, 10)
        );
  
        if (!productoAsociado || productoAsociado.cantidad <= 0) {
          throw new Error(`El producto asociado al pago no es válido o no tiene cantidad suficiente.`);
        }

        if (detallesVenta.filter((detalle) => detalle.cantidad > 0).length === 0) {
            alert("Debes ingresar al menos un producto con cantidad mayor a 0.");
            throw new Error("Validación de pago fallida");
        }  

        if ([1, 2, 4].includes(parseInt(pago.idTipoPago, 10))) { // Depósito, Transferencia, Cheque
          if (!pago.correlativo || !pago.imagenTransferencia) {
              const tipoPago = tiposPagosOptions.find(option => option.idTipoPago === pago.idTipoPago)?.tipo || "desconocido";
              alert(`El tipo de pago ${tipoPago} requiere correlativo e imagen.`);
              throw new Error("Validación de pago fallida");
          }
        }
  
        // Manejo de valores por defecto para tipos de pago
      acc.push({
        ...pago,
        correlativo: pago.correlativo || "NA", // Valor por defecto
        imagenTransferencia: pago.imagenTransferencia || "efectivo", // Valor por defecto
      });

      return acc;
    }, []);

      const detallesConDonacion = detallesVenta.map((detalle) => ({
        ...detalle,
        donacion: newVenta.donacion, // Incluye la donación en cada detalle
         idStand: selectedStand?.idStand // Incluye idStand
      }));
  
      const ventaData = {
        venta: { ...newVenta, totalVenta: totalAPagar },
        detalles: detallesConDonacion.filter((detalle) => detalle.cantidad > 0),
        pagos: pagosValidados,
        idVoluntario: idVoluntario // Incluye idVoluntario
      };    
  
      //console.log("JSON a enviar:", JSON.stringify(ventaData, null, 2));
  
      const response = await axios.post("/ventas/create/stands/completa", ventaData);
      if (response.status === 201) {
        alert("Venta creada con éxito");
        // Restablecer los estados
      setNewVenta({
        totalVenta: 0,
        idTipoPublico: "2",
        estado: 1,
        donacion: 0,
      });
      setDetallesVenta([]);
      setTiposPagos([]);
      setSubtotal(0);
      setTotalAPagar(0);
      setSelectedStand(null); // Restablecer la selección del stand

        setShowModal(false);
      }
    } catch (error) {
      console.error("Error creando venta:", (error as any).message || error);
      alert("Error al crear la venta: " + ((error as any).message || "Revisa los datos ingresados."));
    }
  };  

  const handleRemovePago = (index: number) => {
    const nuevosPagos = tiposPagos.filter((_, i) => i !== index);
    setTiposPagos(nuevosPagos);
  };

  const handleAddPago = () => {
    // Filtrar productos con cantidad > 0
    const productosValidos = detallesVenta.filter((detalle) => detalle.cantidad > 0);
  
    if (productosValidos.length === 0) {
      alert("No hay productos válidos para asociar al pago. Ingresa una cantidad en los productos.");
      return;
    }
  
    // Crear un nuevo pago
    const nuevoPago = {
      idTipoPago: "", // Campo vacío para que el usuario lo seleccione
      monto: 0,
      correlativo: "",
      imagenTransferencia: "",
      idProducto: productosValidos[0]?.idProducto.toString() || "", // Asociar al primer producto válido por defecto
    };
  
    setTiposPagos((prevPagos) => [...prevPagos, nuevoPago]);
  };
  

  const handleCancel = () => {
    setShowModal(false);
    setNewVenta({
      totalVenta: 0,
      idTipoPublico: "2",
      estado: 1,
      donacion: 0,
    });
    setDetallesVenta([]);
    setTiposPagos([]);
    setSubtotal(0);
    setTotalAPagar(0);
    setSelectedStand(null); // Restablecer la selección del stand
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar style={{ backgroundColor: "#0274E5" }}>
            <IonTitle style={{ color: "#000000" }}>Productos del Stand</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="page-with-background">
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <IonSpinner name="crescent" style={{ color: "#0274E5" }} />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!stands || stands.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar style={{ backgroundColor: "#0274E5" }}>
            <IonTitle style={{ color: "#000000" }}>Productos del Stand</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="page-with-background">
        <div style={{ textAlign: "center", marginTop: "100px", color: "#0274E5", fontSize: "20px" }}>
            <p>No se encontraron productos asignados a los stands.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ backgroundColor: "#0274E5" }}>
          <IonTitle style={{ color: "#000000" }}>Productos del Stand</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="page-with-background">
        <div
            style={{
                padding: "20px",
                textAlign: "center",
                background: "linear-gradient(45deg, #0B75D9, #0B75D9",
                borderRadius: "10px",
                margin: "10px",
                color: "white",
            }}
        >
            <h2>Stand de Venta</h2>
            <p>Puede ver los productos en existencia de los stands a los que está asigando</p>
        </div>

        {/* Botón Crear Venta */}
        <div style={{ textAlign: "center", margin: "20px" }}>
          <IonButton
            style={{
              width: "200px", 
              height: "60px", 
              fontSize: "18px", 
              padding: "10px", 
            }}
            onClick={() => {
              handleOpenModal();
              }}
          >
            Crear Venta
          </IonButton>
        </div>

        <IonModal isOpen={showModal} onDidDismiss={handleCancel} style = {{borderRadius: "10px"}}>
        <IonHeader>
            <IonToolbar>
            <IonTitle style={{ fontWeight: "bold", fontSize: "20px" }}>Crear Venta</IonTitle>
            <IonButtons slot="end">
                <IonButton onClick={handleCancel} color="danger">Cerrar</IonButton>
            </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent style={{ padding: "15px" }}>
            {/* Selección del Stand */}I
            <IonLabel style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", marginLeft: "50px"}}>Seleccionar Stand</IonLabel>
            <IonSelect
                value={selectedStand?.idStand || ""}
                placeholder="Seleccione el stand"
                onIonChange={(e) => {
                    const standId = e.detail.value;
                    const stand = stands.find((s) => s.idStand === standId);
                    setSelectedStand(stand || null);
                    if (stand) {
                    setDetallesVenta(
                        stand.detallesStands.map((detalle: any): DetallesVenta => ({
                        idProducto: detalle.producto.idProducto,
                        nombreProducto: detalle.producto.nombreProducto,
                        precio: detalle.producto.precio,
                        cantidad: 0,
                        subTotal: 0,
                        idVoluntario: idVoluntario,
                        donacion: 0,
                        estado: 1,
                        idStand: stand.idStand // Incluye idStand
                        }))
                    );
                    }else {
                      setDetallesVenta([]); // Restablecer los detalles de la venta si no hay stand seleccionado
                    }
                }}
                interfaceOptions={{
                  cssClass: 'custom-alert', // Clase CSS selectItem
                }}
                style={{ width: "90%", marginLeft: "50px" }}
            >
                {stands.map((stand) => (
                    <IonSelectOption key={stand.idStand} value={stand.idStand}>
                    {stand.nombreStand}
                    </IonSelectOption>
                ))}
            </IonSelect>
            {/* Sección de Totales */}
            <IonCard>
            <IonCardHeader>
            <IonCardTitle style={{ textAlign: "center", color: "white"}}>Detalles de Venta</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
                <IonGrid>
                <IonRow>
                    <IonCol size="6" style = {{color: "white"}}><strong>Total Venta:</strong></IonCol>
                    <IonCol size="6">Q{totalAPagar.toFixed(2)}</IonCol>
                </IonRow>
                <IonRow>
                    <IonCol size="6" style = {{color: "white"}}><strong>Donación:</strong></IonCol>
                    <IonCol size="6">
                    <IonInput
                        type="number"
                        value={newVenta.donacion}
                        onIonChange={(e) => {
                        handleNewVentaChange('donacion', e.detail.value);
                        recalculateTotals(detallesVenta, parseFloat(e.detail.value || "0"));
                        }}
                    />
                    </IonCol>
                </IonRow>
                </IonGrid>
            </IonCardContent>
            </IonCard>

            {/* Sección de Productos */}
            <IonLabel style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", marginLeft: "50px"}}>Productos</IonLabel>
            {detallesVenta.map((detalle, index) => (
            <IonCard key={index}>
                <IonCardContent>
                <IonGrid>
                    <IonRow>
                    <IonCol size="6" style = {{color: "white"}}><strong>{detalle.nombreProducto}</strong></IonCol>
                    <IonCol size="3">Q{detalle.precio}</IonCol>
                    <IonCol size="3">SubTotal: Q{detalle.subTotal.toFixed(2)}</IonCol>
                    </IonRow>
                    <IonRow>
                    <IonCol size="6">Cantidad:</IonCol>
                    <IonCol size="6">
                        <IonInput
                        type="number"
                        value={detalle.cantidad}
                        onIonChange={(e) => handleDetalleChange(index, 'cantidad', e.detail.value)}
                        />
                    </IonCol>
                    </IonRow>
                </IonGrid>
                </IonCardContent>
            </IonCard>
            ))}

            {/* Sección de Pagos */}
            <IonLabel style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px", marginLeft: "50px"}}>Pagos</IonLabel>
            {tiposPagos.map((pago, index) => (
            <IonCard key={index}>
                <IonCardContent>
                <IonGrid>
                    <IonRow>
                    <IonSelect
                        value={pago.idProducto}
                        onIonChange={(e) => handlePagoChange(index, 'idProducto', e.detail.value)}
                        interfaceOptions={{
                          cssClass: 'custom-alert', // Clase CSS selectItem
                        }}
                        >
                        <IonSelectOption value="">Seleccionar Producto</IonSelectOption>
                        {detallesVenta
                            .filter((detalle) => detalle.cantidad > 0) // Mostrar solo productos con cantidad mayor que 0
                            .map((detalle) => (
                            <IonSelectOption key={detalle.idProducto} value={detalle.idProducto}>
                                {detalle.nombreProducto} (Cantidad: {detalle.cantidad})
                            </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonRow>
                    <IonRow>
                    <IonCol size="6">Tipo de Pago:</IonCol>
                    <IonCol size="6">
                        <IonSelect
                        value={pago.idTipoPago}
                        onIonChange={(e) => handlePagoChange(index, 'idTipoPago', e.detail.value)}
                        interfaceOptions={{
                          cssClass: 'custom-alert', // Clase CSS selectItem
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
                    </IonCol>
                    </IonRow>
                    <IonButton color="danger" onClick={() => handleRemovePago(index)}>Quitar Pago</IonButton>
                </IonGrid>
                </IonCardContent>
            </IonCard>
            ))}
            <div style={{ textAlign: "center"}}>
            <IonButton className="custom-Blue-button" onClick={() => setTiposPagos([...tiposPagos, { idTipoPago: "", monto: 0, correlativo: "", imagenTransferencia: "", idProducto: "" }])}>
            Agregar Pago
            </IonButton>
            </div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <IonButton className="custom-Blue-button" onClick={handleCreateVenta} style={{ marginTop: "20px" }}>Crear Venta</IonButton>
            </div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <IonButton className="custom-Blue-button" onClick={handleCancel}>Cancelar</IonButton>
            </div>
        </IonContent>
        </IonModal>

        <IonAccordionGroup>
            {stands.map((stand) => {
                if (!stand.detallesStands || stand.detallesStands.length === 0) {
                return null; // Ignora stands sin productos
                }
                return (
                <IonAccordion value={`stand-${stand.idStand}`} key={stand.idStand}>
                    {/* Encabezado del stand */}
                    <IonItem
                    slot="header"
                    style={{
                        backgroundColor: "#0274E5",
                        color: "#000000",
                        marginBottom: "10px",
                        borderRadius: "10px",
                    }}
                    >
                    <IonLabel style={{ color: "#FFFFFF", fontSize: "20px", fontWeight: "bold", }}>
                        {stand.nombreStand}
                    </IonLabel>
                    </IonItem>

                    {/* Lista de productos del stand */}
                    <IonList slot="content">
                    {stand.detallesStands.map((detalle: any) => (
                        <IonItem
                        key={detalle.idDetalleStands}
                        style={{
                            margin: "10px",
                            borderRadius: "10px",
                            backgroundColor: "#D6EAF8" 
                        }}
                        >
                        <IonLabel>
                            <h2 style={{ color: "#0274E5" }}>{detalle.producto.nombreProducto}</h2>
                            <p>
                            <strong>Cantidad disponible:</strong> {detalle.cantidad}
                            </p>
                            <p>
                            <strong>Precio:</strong> Q{detalle.producto.precio}
                            </p>
                            <p>
                            <strong>Descripción:</strong> {detalle.producto.descripcion}
                            </p>
                            {detalle.producto.foto && (
                            <div style={{ textAlign: "center", marginTop: "10px" }}>
                                <img
                                src={`https://3hkpqqqv-5000.use.devtunnels.ms/${detalle.producto.foto}`}
                                alt={detalle.producto.nombreProducto}
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }}
                                />
                            </div>
                            )}
                        </IonLabel>
                        </IonItem>
                    ))}
                    </IonList>
                </IonAccordion>
                );
            })}
        </IonAccordionGroup>
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