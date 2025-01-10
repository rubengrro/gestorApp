/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CommentTabs } from "./commentTabs";
import { handleApproval } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Planta } from "@prisma/client";

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  readonly: boolean;
  value: string | number | null;
}

interface EditIncidenciaProps {
  onClose: () => void;
  selectedIncidencia: {
    id: string;
    nombreSubtipo: string;
    concepto: string;
    infotype: string;
    fields: FieldConfig[];
    estado: string;
    quienRegistra: string;
    riAprobador?: string;
    gerenteAprobador?: string;
    inplantAprobador?: string;
    deletedAt?: string | null;
    comentarios?: Array<{ text: string; user: string; date: string }>;
    evidencias?: JSON;
    comentarioRechazo?: string;
    comentarioRechazoUsuario?: string;
    comentarioGerente?: string;
    comentarioRi?: string;
    comentarioGPS?: string;
    // Nuevos campos
    validoDe?: string; // Fecha de inicio
    validoA?: string; // Fecha de fin
    monto?: number | null; // Monto asociado
    cantidad?: number | null; // Cantidad
    horas?: number | null;
    folio?: number | null;
    email?: string | null;
    planta?: string; // Planta a la que pertenece
  };
  onUpdate: (updatedData: Record<string, string | number | null>) => void;
}


type FormData = Record<string, string | number | null>;

export const EditIncidencia: React.FC<EditIncidenciaProps> = ({
  onClose,
  selectedIncidencia,
  onUpdate,
}) => {
  const { data: session } = useSession();
  const { id, fields, estado, quienRegistra, riAprobador, gerenteAprobador, inplantAprobador, deletedAt, comentarios, evidencias } = selectedIncidencia;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comentarioRechazo, setComentarioRechazo] = useState(selectedIncidencia.comentarioRechazo || "");
  const [approvalComment, setApprovalComment] = useState(selectedIncidencia.comentarioGerente || ""); // Estado para el comentario de aprobación



  const [comentariosState, setComentariosState] = useState<Array<{ text: string; user: string; date: string }>>(
    Array.isArray(selectedIncidencia.comentarios) ? selectedIncidencia.comentarios : []
  );
  
  

  const handleAddComment = (newComment: string) => {
    const user = session?.user?.name || "Usuario desconocido";
    const newCommentObj = {
      text: newComment,
      user, 
      date: new Date().toISOString(),
    };
    setComentariosState([...comentariosState, newCommentObj]);
  };
  
  const [draftApprovalComment, setDraftApprovalComment] = useState(""); // Comentario de aprobación en borrador
  const [sentApprovalComments, setSentApprovalComments] = useState({
    gerente: { text: selectedIncidencia.comentarioGerente || "", user: selectedIncidencia.gerenteAprobador || "" },
    ri: { text: selectedIncidencia.comentarioRi || "", user: selectedIncidencia.riAprobador || "" },
    gps: { text: selectedIncidencia.comentarioGPS || "", user: selectedIncidencia.inplantAprobador || "" },
  }); // Comentarios aprobados enviados por rol con autor
  
  const handleApprovalSubmit = async () => {
    const comment = draftApprovalComment.trim();
    if (!comment) {
      alert("Por favor, escribe un comentario antes de aprobar.");
      return;
    }
  
    // Manejador para enviar el comentario de aprobación
    try {
      await handleApproval({
        action: "aprobar",
        id,
        userRole,
        userName,
        estado,
        comentarioGerente: userRole === "Gerente" ? comment : undefined,
        comentarioRi: userRole === "Ri" ? comment : undefined,
        comentarioGPS: userRole === "GPS" ? comment : undefined,
        setIsSubmitting,
        onUpdate,
        onClose,
      });
  
      // Actualizar el comentario enviado según el rol del usuario
      setSentApprovalComments((prev) => ({
        ...prev,
        [userRole.toLowerCase()]: { text: comment, user: userName },
      }));
  
      setDraftApprovalComment(""); // Limpiar el comentario en borrador
    } catch (error) {
      console.error("Error al enviar el comentario de aprobación:", error);
      alert("Error al enviar el comentario de aprobación.");
    }
  };
  

  const [sentRejectionComment, setSentRejectionComment] = useState(
    selectedIncidencia.comentarioRechazo || ""
  );
  

  const handleSaveRejection = () => {
    if (!comentarioRechazo.trim()) {
      alert("El comentario de rechazo no puede estar vacío.");
      return;
    }
  
    setSentRejectionComment(comentarioRechazo); // Actualiza solo después de guardar
    alert(`Comentario de rechazo guardado: ${comentarioRechazo}`);
  };
  
  


  const userRole = session?.user?.role || "";
  const userName = session?.user?.name || "";

  const approverRoles = ["Ri", "GPS", "Gerente"]; // Solo estos roles pueden aprobar
  const normalizedEstado = estado.trim().toLowerCase();

  const getComentarioRechazoUsuario = (): string | null => {
    if (!selectedIncidencia.comentarioRechazo) return null;
  
    // Intenta extraer el usuario del formato "(Rechazado por: Usuario)"
    const match = selectedIncidencia.comentarioRechazo.match(/\(Rechazado por: (.+)\)/);
    return match ? match[1] : selectedIncidencia.comentarioRechazoUsuario || "Usuario desconocido";
  };

  const getComentarioRechazoTexto = (): string | null => {
    if (!comentarioRechazo) return null;
  
    // Remueve el "(Rechazado por: Usuario)" del texto
    const match = comentarioRechazo.match(/^(.*)\(Rechazado por: .+\)$/);
    return match ? match[1].trim() : comentarioRechazo;
  };
  
  const getApprovalCommentTexto = (): string | null => {
    if (!approvalComment) return null;
  
    // Remueve el formato "(Aprobado por: Usuario)"
    const match = approvalComment.match(/^(.*)\(Aprobado por: .+\)$/);
    return match ? match[1].trim() : approvalComment;
  };
  
  const getApprovalCommentUsuario = (): string | null => {
    if (!approvalComment) return null;
  
    // Extrae el usuario del formato "(Aprobado por: Usuario)"
    const match = approvalComment.match(/\(Aprobado por: (.+)\)/);
    return match ? match[1] : "Usuario desconocido";
  };
  

  // Verificar si el usuario tiene permisos para editar
  const isEditable =
    ["Ri"].includes(userRole) &&
    userName === quienRegistra;

  // Verificar si el usuario puede aprobar o rechazar
  const canApprove =
    approverRoles.includes(userRole) &&
    (
      (userRole === "Gerente" && normalizedEstado === "pendiente_gerente") ||
      (userRole === "Ri" && normalizedEstado === "pendiente_ri") ||
      (userRole === "Inplant" && normalizedEstado === "pendiente_inplant")
    );

  const updatedFields: FieldConfig[] = fields.map((field) => {
    if (field.name === "riAprobador") {
      return { ...field, value: selectedIncidencia.riAprobador || "" };
    }
    if (field.name === "gerenteAprobador") {
      return { ...field, value: selectedIncidencia.gerenteAprobador || "" };
    }
    if (field.name === "inplantAprobador") {
      return { ...field, value: selectedIncidencia.inplantAprobador || "" };
    }
    return field;
  });

  const defaultValues: FormData = updatedFields.reduce(
    (defaults, field) => ({
      ...defaults,
      [field.name]: field.type === "date" && field.value
        ? new Date(field.value).toISOString().split("T")[0]
        : field.value,
    }),
    {}
  );

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues,
  });

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/registroIncidencia/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Error al actualizar la incidencia");

      const updatedData: FormData = await response.json();
      onUpdate(updatedData);
      alert("Incidencia actualizada con éxito");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la incidencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  

  

  const groupFields = (fieldNames: string[]): FieldConfig[] =>
    updatedFields.filter((field) => fieldNames.includes(field.name));

  const getRechazoUsuario = (): string | null => {
    if (!selectedIncidencia.comentarioRechazo) return null;

    const match = selectedIncidencia.comentarioRechazo.match(/\(Rechazado por: (.+)\)/);
    return match ? match[1] : null;
};

useEffect(() => {
  setApprovalComment("");
}, [userRole]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
  {/* Primera sección: Quien Registra */}
  <div>
    <Label htmlFor="quienRegistra" className="block text-sm font-light text-gray-600">
      Quien Registra
    </Label>
    <Input
      id="quienRegistra"
      type="text"
      value={quienRegistra || "No registrado"}
      readOnly
      className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
    />
  </div>

  {/* Segunda sección: Trabajador */}
  <div className="space-y-4">
    <div>
      <Label htmlFor="nombreTrabajador" className="block text-sm font-light text-gray-600">
        Nombre del Trabajador
      </Label>
      <Input
        id="nombreTrabajador"
        type="text"
        value={selectedIncidencia.fields.find((field) => field.name === "nombreTrabajador")?.value || "No especificado"}
        readOnly
        className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
      />
    </div>
    {/* Fila combinada: Número WD y Planta */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="trabajadorNumeroWD" className="block text-sm font-light text-gray-600">
          Número WD
        </Label>
        <Input
          id="trabajadorNumeroWD"
          type="text"
          value={selectedIncidencia.fields.find((field) => field.name === "trabajadorNumeroWD")?.value || "No especificado"}
          readOnly
          className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
        />
      </div>
      <div>
        <Label htmlFor="planta" className="block text-sm font-light text-gray-600">
          Planta
        </Label>
        <Input
          id="planta"
          type="text"
          value={selectedIncidencia.planta || "No especificada"}
          readOnly
          className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
        />
      </div>
    </div>
  </div>

  {/* Segunda sección: Aprobadores */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {!deletedAt && (normalizedEstado === "pendiente_gerente" || gerenteAprobador) && (
      <div className={`col-span-1 ${!riAprobador ? "md:col-span-2" : ""}`}>
        <Label htmlFor="gerenteAprobador" className="block text-sm font-light text-gray-600">
          Gerente Aprobador
        </Label>
        <Input
          id="gerenteAprobador"
          type="text"
          value={gerenteAprobador || "En espera de aprobación"}
          readOnly
          className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
        />
      </div>
    )}

    {!deletedAt && (estado === "Pendiente_RI" || riAprobador) && (
      <div className={`col-span-1 ${!gerenteAprobador ? "md:col-span-2" : ""}`}>
        <Label htmlFor="riAprobador" className="block text-sm font-light text-gray-600">
          RI Aprobador
        </Label>
        <Input
          id="riAprobador"
          type="text"
          value={riAprobador || "En espera de aprobación"}
          readOnly
          className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
        />
      </div>
    )}
  </div>

  {/* Tercera sección: Inputs propios de cada registro */}
  <div className="space-y-4">
    {groupFields(
      updatedFields
        .map((field) => field.name)
        .filter((name) => !["trabajadorNumeroWD", "nombreTrabajador", "estado", "quienRegistra", "aprobador"].includes(name))
    ).map((field) => {
      if (!field.value) return null; // Ocultar campos vacíos
      return (
        <div key={field.name}>
          <Label htmlFor={field.name} className="block text-sm font-light text-gray-600">
            {field.label}
          </Label>
          <Input
            id={field.name}
            type={field.type}
            {...register(field.name)}
            readOnly={!isEditable || field.readonly}
            value={field.value ?? ""}
            className={`border-gray-300 rounded-md p-2 w-full ${!isEditable ? "bg-white cursor-not-allowed" : ""}`}
          />
          {errors[field.name] && (
            <span className="text-red-500 text-sm">{errors[field.name]?.message as string}</span>
          )}
        </div>
      );
    })}
  </div>

  {Object.entries(sentApprovalComments).map(([role, { text, user }]) => (
  text && (
    <div className="space-y-4 mt-6" key={role}>
      <Separator />
      <div className="border p-4 rounded bg-gray-100">
        {/* Mostrar el comentario */}
        <p className="text-md text-gray-800 mb-2">
          <strong>{text}</strong>
        </p>
        {/* Mostrar el autor y su rol */}
        <span className="text-xs text-gray-500">
          De: {user || "Usuario desconocido"} ({role})
        </span>
      </div>
    </div>
  )
))}




{/* Sección para mostrar el comentario de rechazo */}
{sentRejectionComment && sentRejectionComment.trim().length > 0 && (
  <div className="space-y-4 mt-6">
    <Separator />
    <h3 className="text-lg font-semibold">Motivo de Rechazo</h3>
    <div className="border p-4 rounded bg-gray-100">
      {/* Mostrar solo el texto del comentario */}
      <p className="text-md text-gray-800">{getComentarioRechazoTexto()}</p>
      {/* Mostrar el usuario rechazador en un span */}
      <span className="text-xs text-gray-500">
        Rechazado por: {getComentarioRechazoUsuario() || "Usuario desconocido"}
      </span>
    </div>
  </div>
)}

  {/* Condicional para mostrar campos solo si tienen valores */}
{selectedIncidencia.email && (
  <div>
    <Label htmlFor="email" className="block text-sm font-light text-gray-600">
      Email
    </Label>
    <Input
      id="email"
      type="text"
      value={selectedIncidencia.email}
      readOnly
      className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
    />
  </div>
)}

{selectedIncidencia.monto !== null && selectedIncidencia.monto !== undefined && (
  <div>
    <Label htmlFor="monto" className="block text-sm font-light text-gray-600">
      Monto
    </Label>
    <Input
      id="monto"
      type="number"
      value={selectedIncidencia.monto}
      readOnly
      className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
    />
  </div>
)}

{/* {selectedIncidencia.cantidad !== null && selectedIncidencia.cantidad !== undefined && (
  <div>
    <Label htmlFor="cantidad" className="block text-sm font-light text-gray-600">
      Cantidad
    </Label>
    <Input
      id="cantidad"
      type="number"
      value={selectedIncidencia.cantidad}
      readOnly
      className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
    />
  </div>
)} */}

{selectedIncidencia.horas !== null && selectedIncidencia.horas !== undefined && (
  <div>
    <Label htmlFor="horas" className="block text-sm font-light text-gray-600">
      Horas
    </Label>
    <Input
      id="horas"
      type="number"
      value={selectedIncidencia.horas}
      readOnly
      className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
    />
  </div>
)}

{selectedIncidencia.folio && (
  <div>
    <Label htmlFor="folio" className="block text-sm font-light text-gray-600">
      Folio
    </Label>
    <Input
      id="folio"
      type="text"
      value={selectedIncidencia.folio}
      readOnly
      className="border-gray-300 rounded-md p-2 w-full bg-white cursor-not-allowed"
    />
  </div>
)}





  {/* Cuarta sección: Comentarios */}
{canApprove && (
  <div className="w-full border-b pb-4">
    <CommentTabs
  initialComments={comentariosState}
  initialRejectionComment={comentarioRechazo}
  userRole={userRole}
  approvalComment={approvalComment}
  onChangeApprovalComment={setApprovalComment}
  onAddComment={handleAddComment}
  onSaveRejection={handleSaveRejection}
  onChangeRejectionComment={setComentarioRechazo}
  onApprove={() =>
    handleApproval({
      action: "aprobar",
      id,
      userRole,
      userName,
      estado,
      comentarioGerente: approvalComment,
      comentarioRi: approvalComment,
      comentarioGPS: approvalComment,
      setIsSubmitting,
      onUpdate,
      onClose,
    })
  }
  onReject={() =>
    handleApproval({
      action: "rechazar",
      id,
      userRole,
      userName,
      estado,
      comentarioRechazo,
      setIsSubmitting,
      onUpdate,
      onClose,
    })
  }
/>

  </div>
)}


</form>

  );
};

export default EditIncidencia;
