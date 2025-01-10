"use client";

import { useToast } from "@/hooks/use-toast";
import React from "react";

interface SuccessMessageProps {
  message: string; // Mensaje principal a mostrar
  description?: string; // Descripción adicional opcional
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, description }) => {
  const { toast } = useToast();

  const showMessage = () => {
    toast({
      title: message,
      description: description || "",
    });
  };

  return (
    <button
      type="button"
      onClick={showMessage}
      className="bg-green-500 text-white font-semibold py-2 px-4 rounded"
    >
      Mostrar mensaje
    </button>
  );
};

export default SuccessMessage;
