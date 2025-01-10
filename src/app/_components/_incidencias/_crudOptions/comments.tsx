import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ApprovalCommentProps {
  userRole: string; // Rol del usuario activo
  approvalComment: string; // Comentario actual del usuario
  onChangeApprovalComment: (comment: string) => void; // Callback para manejar cambios en el comentario
  onApprove: () => void; // Callback para aprobar
}

export const CommentSection: React.FC<ApprovalCommentProps> = ({
  userRole,
  approvalComment,
  onChangeApprovalComment,
  onApprove,
}) => {
  // Definir el texto de la etiqueta dinámicamente según el rol
  const getLabelText = (): string => {
    switch (userRole) {
      case "Gerente":
        return "Comentario del Gerente";
      case "Ri":
        return "Comentario de usuario RI";
      case "GPS":
        return "Comentario del GPS";
      default:
        return "Comentario de Aprobación";
    }
  };

  // Placeholder dinámico para el textarea
  const getPlaceholderText = (): string => {
    switch (userRole) {
      case "Gerente":
        return "Escribe el comentario como Gerente...";
      case "Ri":
        return "Escribe el comentario como Responsable Interno (RI)...";
      case "GPS":
        return "Escribe el comentario como GPS...";
      default:
        return "Escribe un comentario de aprobación...";
    }
  };

  return (
    <div className="grid w-full gap-2">
      {/* Etiqueta dinámica para el textarea */}
      <Label htmlFor="approval-comment">{getLabelText()}</Label>

      {/* Textarea para ingresar el comentario */}
      <Textarea
        id="approval-comment"
        value={approvalComment}
        onChange={(e) => onChangeApprovalComment(e.target.value)}
        placeholder={getPlaceholderText()}
        className="resize-none"
      />

      {/* Botón para aprobar */}
      <Button className="bg-green-600 text-white mt-2" onClick={onApprove}>
        Aprobar
      </Button>
    </div>
  );
};
