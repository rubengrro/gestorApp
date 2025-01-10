import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react"; // Importa el hook useSession
import { useState } from "react";

interface MoveToBinIncidenciaProps {
  onClose: () => void;
  selectedIncidencia: {
    id: string;
    concepto: string;
    nombreSubtipo: string;
    infotype?: string;
  };
  onMoveToBin: (id: string) => void;
}

export default function MoveToBinIncidencia({
  onClose,
  selectedIncidencia,
  onMoveToBin,
}: MoveToBinIncidenciaProps) {
  const { data: session } = useSession(); // Obtén la sesión actual
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comentario, setComentario] = useState("");

  const handleMoveToBin = async () => {
    if (isSubmitting) return; // Evita múltiples envíos
    setIsSubmitting(true);

    try {
      const usuarioActual = session?.user?.name || "Usuario desconocido"; // Extrae el nombre del usuario o usa un valor predeterminado

      // Primer fetch: mover a la papelera
      const response = await fetch(`/api/registroIncidencia/${selectedIncidencia.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deletedAt: new Date().toISOString(),
          quienElimino: usuarioActual,
          comentario, // Incluye el comentario en la solicitud
        }),
      });

      if (!response.ok) {
        console.error("Error al mover la incidencia a la papelera");
        alert("Hubo un error al mover la incidencia a la papelera. Por favor, inténtalo de nuevo.");
        return;
      }

      // Segundo fetch: guardar solo el comentario
      await updateComment();

      onMoveToBin(selectedIncidencia.id);
      alert(
        `La incidencia (${selectedIncidencia.infotype || "Sin tipo de información"} - ${
          selectedIncidencia.concepto
        }) ha sido movida a la papelera.\nMotivo: ${comentario}`
      );
      onClose();
    } catch (error) {
      console.error("Error en la solicitud de mover a la papelera:", error);
      alert("Hubo un error al procesar la solicitud. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateComment = async () => {
    try {
      const response = await fetch(`/api/comentarios/${selectedIncidencia.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comentario,
        }),
      });

      if (!response.ok) {
        console.error("Error al actualizar el comentario");
        alert("Hubo un error al actualizar el comentario. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error en la solicitud de actualización del comentario:", error);
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de mover esta incidencia a la papelera?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción moverá la incidencia{" "}
            <strong>
              ({selectedIncidencia.infotype || "Sin tipo de información"} -{" "}
              {selectedIncidencia.concepto})
            </strong>
            , subtipo <strong>{selectedIncidencia.nombreSubtipo}</strong> a la papelera de reciclaje.
            <br />
            La papelera se vaciará en 30 días, y las incidencias eliminadas no se podrán recuperar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Input para el comentario */}
        <div className="my-4">
          <label htmlFor="comentario" className="block text-sm font-medium">
            Explica el motivo
          </label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="border w-full p-2 mt-1 rounded"
            rows={3}
            placeholder="Motivo de eliminación..."
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleMoveToBin} disabled={isSubmitting}>
              {isSubmitting ? "Procesando..." : "Confirmar"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
