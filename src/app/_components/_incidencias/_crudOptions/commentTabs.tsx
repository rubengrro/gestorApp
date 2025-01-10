/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RejectionComment } from "./rejectComment";
import { CommentSection } from "./comments";

interface CommentTabsProps {
  initialComments: Array<{ text: string; user: string; date: string }>;
  initialRejectionComment: string;
  userRole: string; // Nuevo prop para determinar el rol
  approvalComment: string; // Nuevo prop para manejar el comentario de aprobación
  onChangeApprovalComment: (comment: string) => void; // Nuevo callback para manejar cambios en el comentario de aprobación
  onAddComment: (comment: string) => void;
  onSaveRejection: () => void;
  onChangeRejectionComment: (comment: string) => void;
  onApprove: () => void; // Simplificado si no necesitas pasar comentario adicional
  onReject: () => void;
}

export const CommentTabs: React.FC<CommentTabsProps> = ({
  initialComments,
  initialRejectionComment,
  userRole, // Nuevo
  approvalComment, // Nuevo
  onChangeApprovalComment, // Nuevo
  onAddComment,
  onSaveRejection,
  onChangeRejectionComment,
  onApprove, 
  onReject,
}) => {
  const [comments, setComments] = useState(initialComments);
  const [rejectionComment, setRejectionComment] = useState(initialRejectionComment);

  const handleAddCommentInternal = (comment: string) => {
    const newComment = { text: comment, user: "Usuario Actual", date: new Date().toISOString() };
    setComments([...comments, newComment]);
    onAddComment(comment); // Notifica al componente padre
  };

  const handleApprovalCommentChange = (comment: string) => {
    onChangeApprovalComment(comment); // Notifica al componente padre sobre cambios en el comentario de aprobación
  };

  const handleRejectionCommentChange = (comment: string) => {
    setRejectionComment(comment);
    onChangeRejectionComment(comment); // Notifica al componente padre
  };

  return (
    <Tabs defaultValue="approval" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="approval">Aprobación</TabsTrigger>
        <TabsTrigger value="rejection">Comentario de Rechazo</TabsTrigger>
      </TabsList>

      {/* Pestaña de Aprobación */}
      <TabsContent value="approval">
        <CommentSection
          userRole={userRole} // Pasamos el rol del usuario activo
          approvalComment={approvalComment} // Pasamos el comentario actual
          onChangeApprovalComment={handleApprovalCommentChange} // Manejador para cambios en el comentario
          onApprove={onApprove} // Lógica de aprobación
        />
      </TabsContent>

      {/* Pestaña de Rechazo */}
      <TabsContent value="rejection">
        <RejectionComment
          rejectionComment={rejectionComment}
          onChangeRejectionComment={handleRejectionCommentChange}
          onReject={onReject} // Pasamos el manejador de rechazo
        />
      </TabsContent>
    </Tabs>
  );
};
