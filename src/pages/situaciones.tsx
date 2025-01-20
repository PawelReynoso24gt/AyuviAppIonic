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
} from "@ionic/react";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";

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
        } catch (error) {
            console.error("Error fetching tipos:", error);
            setToastMessage("Error al cargar los tipos de situaciones.");
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
            fetchSituaciones();
            setShowModal(false);
        } catch (error) {
            console.error("Error creating situacion:", error);
            setToastMessage("Error al crear la situación.");
        }
    };

    const handleEditSituacion = async (id: number, descripcion: string) => {
        try {
            const response = await axios.put(`/situaciones/update/reporte/${id}`, {
                descripcion,
            });
            setToastMessage(response.data.message);
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
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Mis Situaciones</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonButton
                    expand="block"
                    onClick={() => setShowModal(true)}
                    style={{
                        margin: "20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        fontWeight: "bold",
                    }}
                >
                    Crear Nueva Situación
                </IonButton>

                {loading ? (
                    <IonSpinner />
                ) : (
                    <>
                        {/* Situaciones Reportadas */}
                        <IonList>
                            <IonLabel style={{ padding: "10px", fontWeight: "bold", fontSize: "1.2rem" }}>
                                Situaciones Reportadas
                            </IonLabel>
                            {situacionesReportadas.length > 0 ? (
                                situacionesReportadas.map((situacion) => (
                                    <IonCard key={situacion.idSituacion}>
                                        <IonCardHeader>
                                            <IonCardTitle>{situacion.tipo_situacione.tipoSituacion}</IonCardTitle>
                                            <p style={{ fontSize: "0.9rem", color: "gray" }}>
                                                Estado: {situacion.estado} | Fecha: {situacion.fechaOcurrencia}
                                            </p>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <p>{situacion.descripcion}</p>
                                            <IonButton
                                                onClick={() => setSelectedSituacion(situacion)}
                                                style={{ marginTop: "10px" }}
                                            >
                                                Editar
                                            </IonButton>
                                        </IonCardContent>
                                    </IonCard>
                                ))
                            ) : (
                                <IonLabel style={{ padding: "10px", color: "gray" }}>
                                    No hay situaciones reportadas.
                                </IonLabel>
                            )}
                        </IonList>

                        {/* Situaciones Procesadas */}
                        <IonList>
                            <IonLabel style={{ padding: "10px", fontWeight: "bold", fontSize: "1.2rem" }}>
                                Situaciones Procesadas
                            </IonLabel>
                            {situacionesProcesadas.length > 0 ? (
                                situacionesProcesadas.map((situacion) => (
                                    <IonCard key={situacion.idSituacion}>
                                        <IonCardHeader>
                                            <IonCardTitle>{situacion.tipo_situacione.tipoSituacion}</IonCardTitle>
                                            <p style={{ fontSize: "0.9rem", color: "gray" }}>
                                                Estado: {situacion.estado} | Fecha: {situacion.fechaOcurrencia}
                                            </p>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <p>{situacion.descripcion}</p>
                                            <p>
                                                <strong>Respuesta:</strong> {situacion.respuesta || "N/A"}
                                            </p>
                                            <p>
                                                <strong>Observaciones:</strong> {situacion.observaciones || "N/A"}
                                            </p>
                                        </IonCardContent>
                                    </IonCard>
                                ))
                            ) : (
                                <IonLabel style={{ padding: "10px", color: "gray" }}>
                                    No hay situaciones procesadas.
                                </IonLabel>
                            )}
                        </IonList>

                        {/* Situaciones Resueltas */}
                        <IonList>
                            <IonLabel style={{ padding: "10px", fontWeight: "bold", fontSize: "1.2rem" }}>
                                Situaciones Resueltas
                            </IonLabel>
                            {situacionesResueltas.length > 0 ? (
                                situacionesResueltas.map((situacion) => (
                                    <IonCard key={situacion.idSituacion}>
                                        <IonCardHeader>
                                            <IonCardTitle>{situacion.tipo_situacione.tipoSituacion}</IonCardTitle>
                                            <p style={{ fontSize: "0.9rem", color: "gray" }}>
                                                Estado: {situacion.estado} | Fecha: {situacion.fechaOcurrencia}
                                            </p>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <p>{situacion.descripcion}</p>
                                            <p>
                                                <strong>Respuesta:</strong> {situacion.respuesta}
                                            </p>
                                        </IonCardContent>
                                    </IonCard>
                                ))
                            ) : (
                                <IonLabel style={{ padding: "10px", color: "gray" }}>
                                    No hay situaciones resueltas.
                                </IonLabel>
                            )}
                        </IonList>

                        {/* Situaciones Sin Solución */}
                        <IonList>
                            <IonLabel style={{ padding: "10px", fontWeight: "bold", fontSize: "1.2rem" }}>
                                Situaciones Sin Solución
                            </IonLabel>
                            {situacionesSinSolucion.length > 0 ? (
                                situacionesSinSolucion.map((situacion) => (
                                    <IonCard key={situacion.idSituacion}>
                                        <IonCardHeader>
                                            <IonCardTitle>{situacion.tipo_situacione.tipoSituacion}</IonCardTitle>
                                            <p style={{ fontSize: "0.9rem", color: "gray" }}>
                                                Estado: {situacion.estado} | Fecha: {situacion.fechaOcurrencia}
                                            </p>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <p>{situacion.descripcion}</p>
                                            <p>
                                                <strong>Observaciones:</strong> {situacion.observaciones}
                                            </p>
                                        </IonCardContent>
                                    </IonCard>
                                ))
                            ) : (
                                <IonLabel style={{ padding: "10px", color: "gray" }}>
                                    No hay situaciones sin solución.
                                </IonLabel>
                            )}
                        </IonList>
                    </>
                )}

                {/* Modal para Crear */}
                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                    <div style={{ padding: "20px" }}>
                        <h2>Crear Situación</h2>
                        <IonSelect
                            placeholder="Seleccionar tipo"
                            value={newSituacion.idTipoSituacion}
                            onIonChange={(e) =>
                                setNewSituacion((prev) => ({
                                    ...prev,
                                    idTipoSituacion: e.detail.value,
                                }))
                            }
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
                        />
                        <IonButton expand="block" onClick={handleCreateSituacion}>
                            Guardar
                        </IonButton>
                        <IonButton expand="block" color="danger" onClick={() => setShowModal(false)}>
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
                        <div style={{ padding: "20px" }}>
                            <h2>Editar Situación</h2>
                            <IonInput
                                value={selectedSituacion?.descripcion}
                                onIonChange={(e) =>
                                    setSelectedSituacion((prev: typeof selectedSituacion) => ({
                                        ...prev,
                                        descripcion: e.detail.value,
                                    }))
                                }
                            />
                            <IonButton
                                expand="block"
                                onClick={() =>
                                    handleEditSituacion(
                                        selectedSituacion.idSituacion,
                                        selectedSituacion.descripcion
                                    )
                                }
                            >
                                Guardar
                            </IonButton>
                            <IonButton
                                expand="block"
                                color="danger"
                                onClick={() => setSelectedSituacion(null)}
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
