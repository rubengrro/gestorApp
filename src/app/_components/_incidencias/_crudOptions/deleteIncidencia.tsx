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
  
  interface DeleteIncidenciaProps {
    onClose: () => void;
    selectedIncidencia: {
      id: string;
      nombreSubtipo: string;
      concepto: string;
      infotype?: string;
    };
    onDelete: (id: string) => void; // Función para actualizar la tabla
  }
  
  export default function DeleteIncidencia({
    onClose,
    selectedIncidencia,
    onDelete,
  }: DeleteIncidenciaProps) {
    const handleDelete = async () => {
      try {
        const response = await fetch(`/api/registroIncidencia/${selectedIncidencia.id}`, {
          method: "DELETE",
        });
  
        if (response.ok) {
          onDelete(selectedIncidencia.id); // Actualizar la tabla
          onClose(); // Cerrar el diálogo
        } else {
          console.error("Error al eliminar la incidencia");
        }
      } catch (error) {
        console.error("Error en la solicitud de eliminación:", error);
      }
    };
  
    return (
      <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la incidencia{" "}
              <strong>
                ({selectedIncidencia.infotype || "Sin tipo de información"} -{" "}
                {selectedIncidencia.concepto})
              </strong>
              , subtipo <strong>{selectedIncidencia.nombreSubtipo}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDelete}>
                Confirmar
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  