/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingSpinner from "../loadingSpinner";
import { Badge } from "@/components/ui/badge";
import { IncidenciaForm } from "./data-table";
import { EditIncidencia } from "./_crudOptions/editIncidencia";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  readonly: boolean;
  value: string | number;
}

interface PresentacionActionsDialogProps {
  selectedIncidencia: {
    id: string;
    concepto: string;
    nombreSubtipo: string;
    infotype: string;
    estado: string;
    quienRegistra: string;
    planta?: string; // Opcional para obtener Ri y Gerente por planta
  };
  onClose: () => void;
  onUpdate?: (updatedIncidencia: IncidenciaForm) => void;
}

const validStates = ["Pendiente_Gerente", "Pendiente_RI", "Aprobado", "Rechazado", "No_Aplica"] as const;
type Estado = typeof validStates[number];

export function PresentacionActionsDialog({
  selectedIncidencia,
  onClose,
  onUpdate,
}: PresentacionActionsDialogProps) {
  const [infotype, setInfotype] = useState<string>("Sin tipo de información");
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedUsers, setRelatedUsers] = useState<string[]>([]); // Cambiado a lista de nombres

  useEffect(() => {
    const fetchFieldsAndUsers = async () => {
      try {
        // Fetch incidencia details
        const response = await fetch(`/api/registroIncidencia/${selectedIncidencia.id}`);
        if (!response.ok) throw new Error("Error al obtener los campos");
        const data = await response.json();

        setInfotype(data.infotype || "Sin tipo de información");
        setFields(
          data.fields.map((field: any) => ({
            ...field,
            value: field.name === "aprobador" ? data.aprobador || "" : field.value,
          }))
        );

        // Obtener relaciones para quienRegistra
        if (selectedIncidencia.quienRegistra) {
          const userResponse = await fetch(
            `/api/users?nombre=${encodeURIComponent(selectedIncidencia.quienRegistra)}`
          );
          if (!userResponse.ok) throw new Error("Error al obtener el ID de quienRegistra");
          const userData = await userResponse.json();
          const quienRegistraId = userData.id;

          const relationsResponse = await fetch(`/api/users/${quienRegistraId}`);
          if (!relationsResponse.ok) throw new Error("Error al obtener relaciones de quienRegistra");
          const relationsData = await relationsResponse.json();

          // Determinar los usuarios relacionados según el estado
          let roleKey = "";
          if (selectedIncidencia.estado === "Pendiente_Gerente") {
            roleKey = "relatedGerentes";
          } else if (selectedIncidencia.estado === "Pendiente_RI") {
            roleKey = "relatedRis";
          }

          if (roleKey && relationsData[roleKey]?.length > 0) {
            setRelatedUsers(relationsData[roleKey].map((relation: any) => relation.name || "No registrado"));
          } else {
            setRelatedUsers(["No registrado"]);
          }
        } else {
          setRelatedUsers(["No registrado"]);
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldsAndUsers();
  }, [selectedIncidencia]);

  const getEstadoClass = (estado: string | null | undefined): string => {
    const normalizedEstado = estado?.toLowerCase() || "desconocido";

    switch (normalizedEstado) {
      case "aprobado":
      case "no_aplica":
        return "bg-green-100 text-green-800 border border-green-400";
      case "rechazado":
        return "bg-orange-100 text-orange-800 border border-orange-400";
      case "pendiente_ri":
        return "bg-gray-100 text-gray-800 border border-gray-400";
      case "pendiente_gerente":
        return "bg-blue-100 text-blue-800 border border-blue-400";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const estadoValido = validStates.includes(selectedIncidencia.estado as Estado)
    ? selectedIncidencia.estado
    : "Pendiente_Gerente";

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-full max-w-[70%] md:max-w-[70%] lg:max-w-[50%] xl:max-w-[40%] p-6 max-h-[90vh] overflow-hidden">
        <ScrollArea className="max-h-[80vh] overflow-hidden pr-4 mt-2">
          <DialogHeader>
            <DialogTitle>Detalles Incidencia</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <div>
                  <strong>Infotipo:</strong> {infotype}
                </div>
                <div>
                  <strong>Concepto:</strong> {selectedIncidencia.concepto}
                </div>
                <div>
                  <strong>Subtipo:</strong> {selectedIncidencia.nombreSubtipo}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge
                    className={`px-3 py-1 rounded ${getEstadoClass(estadoValido)} pointer-events-none select-none`}
                  >
                    {estadoValido.replace(/_/g, " ")}
                  </Badge>
                  {relatedUsers.slice(0, 2).map((user, index) => (
                    <Badge
                      key={index}
                      className="bg-gray-100 text-gray-800 border border-gray-400"
                    >
                      {estadoValido === "Pendiente_Gerente"
                        ? `Gerente: ${user}`
                        : estadoValido === "Pendiente_RI"
                        ? `RI: ${user}`
                        : `Registrado por: ${user}`}
                    </Badge>
                  ))}
                  {relatedUsers.length > 2 && (
                    <Badge className="bg-gray-100 text-gray-800 border border-gray-400">
                      ...
                    </Badge>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 z-40">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <EditIncidencia
                onClose={onClose}
                selectedIncidencia={{
                  ...selectedIncidencia,
                  fields,
                  estado: estadoValido,
                  quienRegistra: selectedIncidencia.quienRegistra || "No registrado",
                }}
                onUpdate={(updatedData) => {
                  if (onUpdate) onUpdate(updatedData as unknown as IncidenciaForm);
                  onClose();
                }}
              />
            )}
          </div>
          <DialogFooter />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
