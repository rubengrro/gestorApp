import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface RejectionCommentProps {
  rejectionComment: string;
  onChangeRejectionComment: (comment: string) => void; // Callback para manejar cambios en el comentario
  onReject: () => void; // Callback para rechazar
}

export const RejectionComment: React.FC<RejectionCommentProps> = ({
  rejectionComment,
  onChangeRejectionComment,
  onReject,
}) => {
  return (
    <div className="grid w-full gap-2">
      {/* Etiqueta para el textarea */}
      <Label htmlFor="rejection-comment">Motivo de Rechazo</Label>
      
      {/* Textarea para ingresar el comentario */}
      <Textarea
        id="rejection-comment"
        value={rejectionComment}
        onChange={(e) => onChangeRejectionComment(e.target.value)}
        placeholder="Escribe el motivo del rechazo..."
        className="resize-none"
      />
      
      {/* Botón para rechazar */}
      <Button className="bg-red-600 text-white mt-2" onClick={onReject}>
        Rechazar
      </Button>
    </div>
  );
};
