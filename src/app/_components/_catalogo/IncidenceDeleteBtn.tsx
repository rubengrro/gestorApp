import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type DeleteButtonProps = {
  incidenciaId: number;
  infotype: string;
  concepto: string;
  nombreSubtipo: string;
  rolesAcceso: string[];
  onRemoveIncidencia: (id: number) => void;
};

export function DeleteButton({
  incidenciaId,
  infotype,
  concepto,
  nombreSubtipo,
  rolesAcceso,
  onRemoveIncidencia,
}: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/incidencias/${incidenciaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRemoveIncidencia(incidenciaId); // Actualizar de la UI
      } else {
        console.error("Error al eliminar el elemento");
      }
    } catch (error) {
      console.error("Error en la solicitud de eliminación:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrar rolesAcceso excluyendo "Superadministrador" y "Administrador"
  const filteredRoles = rolesAcceso.filter(
    (role) => role !== "Superadministrador" && role !== "Administrador"
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="rounded-full p-2 text-red-600" disabled={isDeleting}>
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente la incidencia{" "}
            <strong>({infotype} - {concepto})</strong>, subtipo <strong>{nombreSubtipo}</strong>. Los siguientes usuarios
            actualmente tienen acceso: <strong>{filteredRoles.join(", ")}</strong>. Después de eliminar, estos usuarios
            ya no tendrán acceso a esta incidencia.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} asChild>
            <Button variant="destructive">{isDeleting ? "Eliminando..." : "Eliminar"}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
