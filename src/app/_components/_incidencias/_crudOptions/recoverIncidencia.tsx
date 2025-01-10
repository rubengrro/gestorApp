import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RecoverIncidenciaProps {
  onClose: () => void;
  selectedIncidencia: { id: string; concepto: string; nombreSubtipo: string; infotype: string | undefined };
  onRecover: (id: string) => void; // Función para actualizar la tabla
}

export default function RecoverIncidencia({
  onClose,
  selectedIncidencia,
  onRecover,
}: RecoverIncidenciaProps) {
  const handleRecover = async () => {
    try {
      const response = await fetch(`/api/registroIncidencia/${selectedIncidencia.id}`, {
        method: "PATCH", // Usamos PATCH para actualizar solo el campo deletedAt
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deletedAt: null, quienElimino: null }), // Recuperamos la incidencia
      });

      if (response.ok) {
        onRecover(selectedIncidencia.id); // Actualizar la tabla
        onClose(); // Cerrar el diálogo
      } else {
        console.error("Error al recuperar la incidencia");
      }
    } catch (error) {
      console.error("Error en la solicitud de recuperación:", error);
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de que deseas recuperar esta incidencia?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="outline" onClick={handleRecover}>
              Confirmar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
