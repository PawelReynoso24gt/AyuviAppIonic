import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonLabel,
    IonButton,
    IonToast,
    IonModal,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem
} from "@ionic/react";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";
import { parse, format } from "date-fns";


const Situaciones: React.FC = () => {
    const [situaciones, setSituaciones] = useState<any[]>([]);
    const [tipoSituaciones, setTipoSituaciones] = useState<any[]>([]);
    const [selectedSituacion, setSelectedSituacion] = useState<any>(null);
    const [newSituacion, setNewSituacion] = useState({
        idTipoSituacion: "",
        descripcion: "",
    });
    
    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    const userInfo = getInfoFromToken();
    const idUsuario = userInfo?.idUsuario;

    const rawDate = "28/12/2024 16:22:23"; // Tu entrada
    const parsedDate = parse(rawDate, "dd/MM/yyyy HH:mm:ss", new Date());
    const formattedDate = format(parsedDate, "dd/MM/yyyy hh:mm a"); // Salida formateada

    const [selectedEstado, setSelectedEstado] = useState<string>("");

    const filteredSituaciones = selectedEstado && selectedEstado !== ""
    ? situaciones.filter((situacion) => situacion.estado.trim().toLowerCase() === selectedEstado.trim().toLowerCase())
    : situaciones;





    const fetchSituaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/situaciones/usuario/${idUsuario}`);
            setSituaciones(response.data);
        } catch (error) {
            console.error("Error fetching situaciones:", error);
            setToastMessage("Error al cargar las situaciones.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTipoSituaciones = async () => {
        try {
            const response = await axios.get("/tipo_situaciones/activos");
            setTipoSituaciones(response.data);
            //console.log("Datos de situaciones:", response.data);
        } catch (error) {
            console.error("Error fetching tipos:", error);
            setToastMessage("Error al cargar los tipos de situaciones.");
        }
    };

    // * bitacora
    const logBitacora = async (descripcion: string, idCategoriaBitacora: number) => {
        const bitacoraData = {
            descripcion,
            idCategoriaBitacora,
            idUsuario,
            fechaHora: new Date().toISOString()
        };

        try {
            await axios.post("/bitacora/create", bitacoraData);
        } catch (error) {
            console.error("Error logging bitacora:", error);
        }
    };

    const handleCreateSituacion = async () => {
        if (!newSituacion.descripcion || !newSituacion.idTipoSituacion) {
            setToastMessage("Todos los campos son obligatorios.");
            return;
        }
        try {
            const response = await axios.post("/situaciones/create", {
                ...newSituacion,
                idUsuario,
            });
            setToastMessage(response.data.message);
            // Log the action in the bitacora
            await logBitacora(`Nueva situación creada: ${newSituacion.descripcion}`, 5);
            fetchSituaciones();
            setShowModal(false);
        } catch (error) {
            console.error("Error creating situacion:", error);
            setToastMessage("Error al crear la situación.");
        }
    };

    const handleEditSituacion = async (id: number, descripcion: string, idTipoSituacion: string) => {
        try {
            const response = await axios.put(`/situaciones/update/reporte/${id}`, {
                descripcion,
                idTipoSituacion,
            });
            setToastMessage(response.data.message);
            // Log the action in the bitacora
            await logBitacora(`Situación actualizada: ${descripcion}`, 5);
            fetchSituaciones();
            setSelectedSituacion(null);
        } catch (error) {
            console.error("Error editing situacion:", error);
            setToastMessage("Error al editar la situación.");
        }
    };

    useEffect(() => {
        if (idUsuario) {
            fetchSituaciones();
            fetchTipoSituaciones();
        } else {
            setToastMessage("No se pudo identificar al usuario.");
        }
    }, [idUsuario]);

    const situacionesReportadas = situaciones.filter(
        (situacion) => situacion.estado === "Reportada"
    );
    const situacionesProcesadas = situaciones.filter(
        (situacion) =>
            situacion.estado !== "Reportada" &&
            situacion.estado !== "Resuelta" &&
            situacion.estado !== "Sin Solución"
    );
    const situacionesResueltas = situaciones.filter(
        (situacion) => situacion.estado === "Resuelta"
    );
    const situacionesSinSolucion = situaciones.filter(
        (situacion) => situacion.estado === "Sin Solución"
    );

    return (
        <IonPage>
            {/* <IonHeader>
                <IonToolbar style={{ backgroundColor: "#4B0082" }}>
                    <IonTitle style={{ color: "#FFFFFF" }}>Mis Situaciones</IonTitle>
                </IonToolbar>

            </IonHeader> */}
            <IonContent className="page-with-background">
            <div
                style={{
                    padding: "20px",
                    textAlign: "center",
                    background: " #800080",
                    borderRadius: "10px",
                    margin: "10px",
                    color: "white",
                }}
            >
                <h2>Gestión de Situaciones</h2>
                <p>Visualiza y gestiona tus situaciones reportadas.</p>
            </div>
            
                <IonButton //Este boton se debe cambiar a la linea 183 
                    expand="block"
                    onClick={() => setShowModal(true)}
                    className="custom-purple-button"
                    style={{
                        margin: "20px auto",
                        backgroundColor: "#800080",
                        color: "white",
                        borderRadius: "10px",
                        fontWeight: "bold",
                        width: "50%",
                    }}
                >
                    Crear Nueva Situación
                </IonButton>

                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px",  textAlign: "center" }}>
                <IonSelect
                    placeholder="Filtrar por estado" //Se cambio el texto de esta linea
                    value={selectedEstado}
                    onIonChange={(e) => setSelectedEstado(e.detail.value || "")} 
                    style={{
                        width: "auto",
                        maxWidth: "400px",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        color: "#4B0082",
                        fontWeight: "bold",
                        textAlign: "center",
                    }}
                       className="custom-ion-select"
                >
                    <IonSelectOption className="custom-ion-select" value="">Filtrar por estado</IonSelectOption>
                    <IonSelectOption className="custom-ion-select"  value="Reportada">Reportada</IonSelectOption>
                    <IonSelectOption className="custom-ion-select" value="Procesada">Procesada</IonSelectOption>
                    <IonSelectOption className="custom-ion-select"  value="Resuelta">Resuelta</IonSelectOption>
                    <IonSelectOption className="custom-ion-select"  value="Sin Solución">Sin Solución</IonSelectOption>
                </IonSelect>
            </div>

                {loading ? (
                    <IonSpinner />
                ) : (
                    <>
                        {/* Situaciones Reportadas */}
                        <IonList>
                            <IonLabel style={{ padding: "10px", fontWeight: "bold", fontSize: "30px" }}>
                                Situaciones:
                            </IonLabel>
                            {filteredSituaciones.length > 0 ? (
                                filteredSituaciones.map((situacion) => (
                                    <IonCard
                                        key={situacion.idSituacion}
                                        style={{
                                            backgroundColor: "#F0F8FF",
                                            margin: "10px",
                                            borderRadius: "10px",
                                        }}
                                    >
                                        <IonCardHeader>
                                            <IonCardTitle
                                                style={{
                                                    color: "#4B0082",
                                                    fontWeight: "bold",
                                                    fontSize: "20px",
                                                }}
                                            >
                                                {situacion.tipo_situacione.tipoSituacion}
                                            </IonCardTitle>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <p style={{ fontSize: "20px", color: "gray" }}>
                                                Estado: {situacion.estado} | Fecha:{" "}
                                                {situacion.fechaOcurrencia
                                                    ? format(
                                                        parse(
                                                            situacion.fechaOcurrencia,
                                                            "dd/MM/yyyy HH:mm:ss",
                                                            new Date()
                                                        ),
                                                        "dd/MM/yyyy hh:mm a"
                                                    )
                                                    : "Fecha no disponible"}
                                            </p>
                                            <p style={{ fontSize: "20px", color: "gray" }}>{situacion.descripcion}</p>

                                            {situacion.estado === "Reportada" ? (
                                                <IonButton
                                                    onClick={() => setSelectedSituacion(situacion)}
                                                    className="custom-purple-button"
                                                    style={{
                                                        marginTop: "10px",
                                                        backgroundColor: "#800080",
                                                    }}
                                                >
                                                    Editar
                                                </IonButton>
                                            ) : (
                                                <>
                                                    <p>
                                                        <strong style={{ fontSize: "20px", color: "gray" }}>
                                                            Respuesta:
                                                        </strong>{" "}
                                                        <span style={{ fontSize: "20px", color: "gray" }}>
                                                            {situacion.respuesta || "N/A"}
                                                        </span>
                                                    </p>
                                                    <p>
                                                        <strong style={{ fontSize: "20px", color: "gray" }}>
                                                            Observaciones:
                                                        </strong>{" "}
                                                        <span style={{ fontSize: "20px", color: "gray" }}>
                                                            {situacion.observaciones || "N/A"}
                                                        </span>
                                                    </p>
                                                </>
                                            )}
                                        </IonCardContent>
                                    </IonCard>
                                ))
                            ) : (
                                <IonLabel style={{ padding: "10px", fontWeight: "bold", fontSize: "20px", color: "white" }}>
                                    No hay situaciones.
                                </IonLabel>
                            )}
                        </IonList>
                        <IonItem style={{ marginBottom: "60px"}}/>

                    </>
                )}

                {/* Modal para Crear */}
                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                        <div //Se cambia todo el div
                            style={{
                            padding: "40px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",          
                            borderRadius: "12px",
                            backgroundColor: "#1E1E1E",
                            maxWidth: "300px",
                            margin: "0 auto"
                            }}
                        >
                        <h2>Crear Situación</h2>
                        <IonSelect 
                            placeholder="Seleccionar tipo de situación"
                            value={newSituacion.idTipoSituacion}
                            onIonChange={(e) =>
                                setNewSituacion((prev) => ({
                                    ...prev,
                                    idTipoSituacion: e.detail.value,
                                }))
                            }
                            interfaceOptions={{
                                cssClass: 'custom-alert', // Clase CSS selectItem
                            }}
                          style={{
                                display: "block", // ✅ obliga a comportarse como bloque
                                margin: "0 auto", // ✅ centra horizontalmente
                                textAlign: "center", // ✅ centra el texto del placeholder y valor
                                backgroundColor: "white",
                                borderRadius: "10px",
                                padding: "5px 10px",
                                color: "#4B0082",
                                fontWeight: "bold",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                maxWidth: "100%", // ✅ evita que se pase del contenedor
                                width: "fit-content", // ✅ pero adapta al contenido
                                whiteSpace: "normal",     // ✅ permite que el texto se rompa en varias líneas
                                overflow: "visible",      // ✅ evita recortes
                                textOverflow: "unset",    // ✅ desactiva puntos suspensivos
                              }}
                       className="custom-ion-select"
                        >
                            {tipoSituaciones.map((tipo) => (
                                <IonSelectOption key={tipo.idTipoSituacion} value={tipo.idTipoSituacion}>
                                    {tipo.tipoSituacion}
                                </IonSelectOption>
                            ))}
                        </IonSelect>

                        <IonInput
                            placeholder="Descripción"
                            value={newSituacion.descripcion}
                            onIonChange={(e) =>
                                setNewSituacion((prev) => ({
                                    ...prev,
                                    descripcion: e.detail.value!,
                                }))
                            }
                            style={{ //se cambia todo el style
                                width: "175%",
                                maxWidth: "330px",
                                backgroundColor: "white",
                                borderRadius: "10px",
                                color: "#4B0082",
                                fontWeight: "bold",
                                textAlign: "center",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                              }}
                        />
                        <IonButton expand="block" onClick={handleCreateSituacion} style={{ marginTop: "20px", color: "white" }} className="custom-purple-button">
                            Guardar
                        </IonButton>
                        <IonButton expand="block" color="danger" onClick={() => setShowModal(false)} style={{ marginTop: "10px" }} className="custom-red-button">
                            Cancelar
                        </IonButton>
                    </div>
                </IonModal>

                {/* Modal para Editar */}
                {selectedSituacion && (
                <IonModal
                    isOpen={!!selectedSituacion}
                    onDidDismiss={() => setSelectedSituacion(null)}
                >
                      <div //Se cambia todo el div
                            style={{
                            padding: "40px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "16px",          
                            borderRadius: "12px",
                            backgroundColor: "#1E1E1E",
                            maxWidth: "300px",
                            margin: "0 auto"
                            }}
                        >
                        <h2>Editar Situación</h2>
                        <IonSelect
                            placeholder="Seleccionar tipo"
                            value={selectedSituacion.idTipoSituacion}
                            onIonChange={(e) =>
                                setSelectedSituacion((prev: typeof selectedSituacion) => ({
                                    ...prev,
                                    idTipoSituacion: e.detail.value,
                                }))
                            }
                            interfaceOptions={{
                                cssClass: 'custom-alert', // Clase CSS selectItem
                            }}
                            style={{ //se cambia todo dentro del style
                                width: "fit-content", 
                                padding: "5px 10px",
                                backgroundColor: "white",
                                borderRadius: "10px",
                                color: "#4B0082",
                                fontWeight: "bold",
                                textAlign: "center",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                margin: "0 auto",
                              }}
                        >
                            {tipoSituaciones.map((tipo) => (
                                <IonSelectOption key={tipo.idTipoSituacion} value={tipo.idTipoSituacion}>
                                    {tipo.tipoSituacion}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                        <IonInput
                            value={selectedSituacion.descripcion}
                            onIonChange={(e) =>
                                setSelectedSituacion((prev: typeof selectedSituacion) => ({
                                    ...prev,
                                    descripcion: e.detail.value,
                                }))
                            }
                            style={{ //se cambia todo el style
                                width: "175%",
                                maxWidth: "330px",
                                backgroundColor: "white",
                                borderRadius: "10px",
                                color: "#4B0082",
                                fontWeight: "bold",
                                textAlign: "center",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                              }}
                        />
                        <IonButton
                            expand="block"
                            onClick={() =>
                                handleEditSituacion(
                                    selectedSituacion.idSituacion,
                                    selectedSituacion.descripcion,
                                    selectedSituacion.idTipoSituacion
                                )
                            }
                            className="custom-purple-button"
                        >
                            Guardar
                        </IonButton>
                        <IonButton
                            expand="block"
                            color="danger"
                            onClick={() => setSelectedSituacion(null)}
                            className="custom-red-button"
                        >
                            Cancelar
                        </IonButton>
                    </div>
                </IonModal>
            )}

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

export default Situaciones;