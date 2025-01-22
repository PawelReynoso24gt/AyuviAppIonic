import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonToast,
    IonSpinner,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonIcon,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import axios from "../services/axios";
import { getInfoFromToken } from "../services/authService";
import { format } from "date-fns";


interface Stand {
    idStand: number;
    nombreStand: string;
    direccion: string;
    idEvento: number;
    estado: number;
    evento: {
        nombreEvento: string;
    };
}

interface Horario {
    idDetalleHorario: number;
    cantidadPersonas: number;
    horario: {
        horarioInicio: string;
        horarioFinal: string;
    };
}

interface Inscripcion {
    idInscripcionEvento: number;
    idEvento: number;
}

interface AsignacionUsuario {
    idAsignacionStands: number,
    idStand: number;
    idDetalleHorario: number;
    detalleHorario: {
        horario: {
            horarioInicio: string;
            horarioFinal: string;
        };
    };
}

const AsignarStands: React.FC = () => {
    const [stands, setStands] = useState<Stand[]>([]);
    const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]); // Debe ser un array vacío por defecto
    // Asegura que es un arreglo vacío inicialmente
    const [horarios, setHorarios] = useState<any[]>([]);
    const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
    const [selectedHorario, setSelectedHorario] = useState<number | null>(null);
    const [toastMessage, setToastMessage] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [asignacionUsuario, setAsignacionUsuario] = useState<AsignacionUsuario | null>(null);
    const userInfo = getInfoFromToken();
    const idVoluntario = userInfo?.idVoluntario;
    const idUsuario = userInfo?.idUsuario;
    const history = useHistory();
    const [showEditModal, setShowEditModal] = useState<boolean>(false);


    // Cargar Stands Activos
    const fetchStands = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Stand[]>("/stand", {
                params: { estado: 1 }, // Filtrar stands activos
            });
            setStands(response.data);
        } catch (error: any) {
            console.error("Error fetching stands:", error.response || error);
            setToastMessage("Error al cargar los stands.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAsignacionUsuario = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/asignacion/voluntario/${idVoluntario}`);
            const asignacion = response.data;

            setAsignacionUsuario({
                idAsignacionStands: asignacion.idAsignacionStands,
                idStand: asignacion.idStand,
                idDetalleHorario: asignacion.idDetalleHorario,
                detalleHorario: {
                    horario: {
                        horarioInicio: asignacion.detalleHorario.horario.horarioInicio,
                        horarioFinal: asignacion.detalleHorario.horario.horarioFinal,
                    },
                },
            }); // Ajusta el estado según la estructura
        } catch (error: any) {
            console.error("Error fetching asignaciones:", error.response || error);
            //setToastMessage("Error al cargar las asignaciones.");
        } finally {
            setLoading(false);
        }
    };



    // Cargar Inscripciones del Voluntario
    const fetchInscripciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Inscripcion[]>(
                `/inscripciones/${idVoluntario}`
            );
            console.log("Inscripciones obtenidas:", response.data); // Depura la respuesta
            setInscripciones(response.data); // Asegúrate de que sea un array
        } catch (error: any) {
            console.error("Error fetching inscripciones:", error.response || error);
            setToastMessage("Error al cargar las inscripciones.");
        } finally {
            setLoading(false);
        }
    };


    // Manejar la asignación
    const handleAsignacion = async () => {
        if (!selectedStand) {
            setToastMessage("Debes seleccionar un stand.");
            return;
        }

        if (selectedHorario === null) { // Validar explícitamente que sea null
            setToastMessage("Debes seleccionar un horario.");
            return;
        }

        // Verifica que `inscripciones` sea un array antes de usar .find
        const inscripcion = Array.isArray(inscripciones)
            ? inscripciones.find((i) => i.idEvento === selectedStand.idEvento)
            : null;

        if (!inscripcion) {
            setToastMessage(
                "No estás inscrito al evento asociado a este stand. No puedes asignarte."
            );
            return;
        }

        try {

            const response = await axios.post("/asignacion_stands/create", {
                idInscripcionEvento: inscripcion.idInscripcionEvento,
                idStand: selectedStand.idStand,
                idDetalleHorario: selectedHorario, // Enviar el valor directamente
            });

            setAsignacionUsuario({
                idAsignacionStands: response.data.idAsignacionStands,
                idStand: selectedStand.idStand,
                idDetalleHorario: selectedHorario,
                detalleHorario: {
                    horario: {
                        horarioInicio: horarios.find(h => h.idDetalleHorario === selectedHorario)?.detalle_horario.horario.horarioInicio,
                        horarioFinal: horarios.find(h => h.idDetalleHorario === selectedHorario)?.detalle_horario.horario.horarioFinal,
                    },
                },
            });

            setToastMessage(response.data.message || "Asignación realizada con éxito.");
            setShowModal(false);
            setSelectedHorario(null); // Reiniciar la selección al cerrar
        } catch (error: any) {
            console.error("Error creating asignacion:", error.response || error);
            setToastMessage("Error al realizar la asignación.");
        }
    };

    const handleUpdateHorario = async () => {
        if (!asignacionUsuario || !selectedHorario) return;

        try {
            const response = await axios.put(`/asignacion_stands/update/${asignacionUsuario.idAsignacionStands}`, {
                idDetalleHorario: selectedHorario,
            });
            setToastMessage(response.data.message || "Horario actualizado con éxito.");
            console.log(asignacionUsuario);
            setAsignacionUsuario((prev) => ({
                ...prev!,
                idDetalleHorario: selectedHorario,
                horarioInicio: horarios.find(h => h.idDetalleHorario === selectedHorario)?.detalle_horario.horario.horarioInicio,
                horarioFinal: horarios.find(h => h.idDetalleHorario === selectedHorario)?.detalle_horario.horario.horarioFinal,
            }));
            setShowEditModal(false);
        } catch (error: any) {
            console.error("Error updating horario:", error.response || error);
            setToastMessage(error.response?.data?.message || "Error al actualizar el horario.");
        }
    };

    const handleDesasignacion = async () => {
        if (!asignacionUsuario) return;

        const confirm = window.confirm(
            `¿Estás seguro de que deseas desasignarte del stand "${selectedStand?.nombreStand}"?`
        );

        if (!confirm) return;

        try {
            const response = await axios.delete(`/asignacion_stands/delete/${asignacionUsuario.idAsignacionStands}`);
            setToastMessage(response.data.message || "Desasignación realizada con éxito.");
            setAsignacionUsuario(null); // Limpia la asignación del usuario
            setShowEditModal(false);
        } catch (error: any) {
            console.error("Error deleting asignacion:", error.response || error);
            setToastMessage("Error al desasignarse del stand.");
        }
    };



    // Cargar Horarios Disponibles para el Stand
    const fetchHorarios = async (standId: number) => {
        setLoading(true);
        try {
            const response = await axios.get<Horario[]>(
                `/standHorario/${standId}`
            );
            console.log("Horarios recibidos del backend:", response.data);
            setHorarios(response.data);
        } catch (error: any) {
            console.error("Error fetching horarios:", error.response || error);
            setToastMessage("Error al cargar los horarios.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchStands();
        fetchInscripciones();
        fetchAsignacionUsuario();
    }, [idVoluntario]);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar style={{ backgroundColor: "#4B0082" }}>
                    <IonButton
                        slot="start"
                        fill="clear"
                        onClick={() => history.goBack()}
                        style={{ marginLeft: "10px", color: "white" }}
                    >
                        <IonIcon icon={arrowBackOutline} slot="icon-only" />
                    </IonButton>
                    <IonTitle style={{ color: "#FFFFFF" }}>Asignación a Stands</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent style={{ backgroundColor: "#F0F8FF" }}>
                <div
                    style={{
                        padding: "20px",
                        textAlign: "center",
                        background: "linear-gradient(45deg, #A6BC09, #A6BC09)",
                        borderRadius: "10px",
                        margin: "10px",
                        color: "white",
                    }}
                >
                    <h2>Stands Activos</h2>
                    <p>Selecciona un stand para asignarte.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <IonSpinner name="crescent" style={{ color: "#4B0082" }} />
                    </div>
                ) : (
                    <IonList>
                        {stands.map((stand) => (
                            <IonItem
                                key={stand.idStand}
                                style={{
                                    backgroundColor: "#D6EAF8",
                                    margin: "10px",
                                    borderRadius: "10px",
                                }}
                            >
                                <IonLabel style={{ padding: "10px" }}>
                                    <h3 style={{ color: "#4B0082", fontWeight: "bold" }}>
                                        {stand.nombreStand}
                                    </h3>
                                    <p style={{ color: "#000080" }}>
                                        Evento: {stand.evento?.nombreEvento || "Sin evento"}
                                    </p>
                                    <p style={{ color: "#000080" }}>Dirección: {stand.direccion}</p>
                                </IonLabel>
                                {asignacionUsuario && asignacionUsuario.idStand === stand.idStand && (
                                    <p style={{ color: "green" }}>
                                        Ya estás asignado a este stand
                                    </p>
                                )}
                                <IonButton
                                    slot="end"
                                    color="tertiary"
                                    onClick={() => {
                                        setSelectedStand(stand);
                                        fetchHorarios(stand.idStand);
 
                                        if (asignacionUsuario?.idStand === stand.idStand) {
                                            setShowEditModal(true); // Abre el modal de edición
                                        } else {
                                            setSelectedHorario(null);
                                            setShowModal(true); // Abre el modal de asignación
                                        }
                                    }}
                                >
                                    {asignacionUsuario?.idStand === stand.idStand ? "Ver asignación" : "Asignarme"}
                                </IonButton>


                            </IonItem>
                        ))}
                    </IonList>
                )}

                <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
                    <div style={{ padding: "20px", borderRadius: "15px" }}>
                        <h3 style={{ marginBottom: "15px" }}>Seleccionar Horario</h3>
                        <IonRadioGroup
                            value={selectedHorario}
                            onIonChange={(e) => {
                                console.log("Horario seleccionado:", e.detail.value); // Debug para confirmar el valor
                                setSelectedHorario(e.detail.value); // Actualiza el estado
                            }}
                        >
                            <IonList>
                                {Array.isArray(horarios) &&
                                    horarios.map((horario, index) => {
                                        const detalleHorario = horario?.detalle_horario;
                                        const horarioData = detalleHorario?.horario;

                                        if (!detalleHorario || !horarioData) {
                                            return (
                                                <IonItem key={index}>
                                                    <IonLabel>Información incompleta</IonLabel>
                                                </IonItem>
                                            );
                                        }

                                        const horarioInicio = format(
                                            new Date(`1970-01-01T${horarioData.horarioInicio}`),
                                            "hh:mm a"
                                        );
                                        const horarioFinal = format(
                                            new Date(`1970-01-01T${horarioData.horarioFinal}`),
                                            "hh:mm a"
                                        );
                                        const cantidadPersonas = detalleHorario.cantidadPersonas;

                                        return (
                                            <IonItem key={horario.idDetalleHorario}>
                                                <IonLabel>
                                                    {`De ${horarioInicio} a ${horarioFinal} (Cupo: ${cantidadPersonas})`}
                                                </IonLabel>
                                                <IonRadio
                                                    slot="start"
                                                    value={horario.idDetalleHorario}
                                                />
                                            </IonItem>
                                        );
                                    })}
                            </IonList>
                        </IonRadioGroup>

                        <IonButton
                            expand="block"
                            fill="outline"
                            onClick={() => setSelectedHorario(null)}
                            style={{ marginTop: "10px" }}
                        >
                            Deseleccionar Horario
                        </IonButton>
                        <IonButton
                            expand="block"
                            onClick={handleAsignacion}
                            disabled={selectedHorario === null} // Botón habilitado solo si hay horario seleccionado
                            style={{
                                marginTop: "20px",
                                backgroundColor: selectedHorario !== null ? "#4caf50" : "#9e9e9e",
                                color: "white",
                            }}
                        >
                            Confirmar Asignación
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="outline"
                            onClick={() => setShowModal(false)}
                            style={{ marginTop: "10px" }}
                        >
                            Cancelar
                        </IonButton>
                    </div>
                </IonModal>

                <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
                    <div style={{ padding: "20px", borderRadius: "15px" }}>
                        <h3>Editar Asignación</h3>
                        {selectedStand && asignacionUsuario && (
                            <>
                                <p><strong>Stand:</strong> {selectedStand.nombreStand}</p>
                                <p><strong>Horario Actual:</strong> {format(
                                    new Date(`1970-01-01T${asignacionUsuario.detalleHorario.horario.horarioInicio}`),
                                    "hh:mm a"
                                )} - {format(
                                    new Date(`1970-01-01T${asignacionUsuario.detalleHorario.horario.horarioFinal}`),
                                    "hh:mm a"
                                )}</p>
                            </>
                        )}

                        <h4>Seleccionar Nuevo Horario</h4>
                        <IonRadioGroup
                            value={selectedHorario}
                            onIonChange={(e) => setSelectedHorario(e.detail.value)}
                        >
                            <IonList>
                                {horarios.map((horario, index) => {
                                    const detalleHorario = horario?.detalle_horario;
                                    const horarioData = detalleHorario?.horario;

                                    // Validación de datos
                                    if (!horarioData || !horarioData.horarioInicio || !horarioData.horarioFinal) {
                                        return (
                                            <IonItem key={index}>
                                                <IonLabel>Información incompleta</IonLabel>
                                            </IonItem>
                                        );
                                    }

                                    const horarioInicio = format(new Date(`1970-01-01T${horarioData.horarioInicio}`), "hh:mm a");
                                    const horarioFinal = format(new Date(`1970-01-01T${horarioData.horarioFinal}`), "hh:mm a");
                                    const cantidadPersonas = detalleHorario.cantidadPersonas;

                                    return (
                                        <IonItem key={horario.idDetalleHorario}>
                                            <IonLabel>
                                                {`De ${horarioInicio} a ${horarioFinal} (Cupo: ${cantidadPersonas})`}
                                            </IonLabel>
                                            {cantidadPersonas > 0 ? (
                                                <IonRadio slot="start" value={horario.idDetalleHorario} />
                                            ) : (
                                                <p style={{ color: "red", fontWeight: "bold", marginLeft: "10px" }}>
                                                    Cupo lleno
                                                </p>
                                            )}
                                        </IonItem>
                                    );
                                })}
                            </IonList>

                        </IonRadioGroup>

                        <IonButton
                            expand="block"
                            onClick={handleUpdateHorario}
                            disabled={selectedHorario === null || selectedHorario === asignacionUsuario?.idDetalleHorario}
                            style={{ marginTop: "10px" }}
                        >
                            Actualizar Horario
                        </IonButton>

                        <IonButton
                            expand="block"
                            color="danger"
                            onClick={handleDesasignacion}
                            style={{ marginTop: "10px" }}
                        >
                            Desasignarme
                        </IonButton>

                        <IonButton expand="block" fill="outline" onClick={() => setShowEditModal(false)} style={{ marginTop: "10px" }}>
                            Cancelar
                        </IonButton>
                    </div>
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

export default AsignarStands;
