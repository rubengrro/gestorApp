"use client";

import { useToast } from "@/hooks/use-toast";

// Hook para mostrar mensajes de éxito
const useSuccessMessage = () => {
  const { toast } = useToast();

  const showSuccessMessage = (message: string, description?: string) => {
    toast({
      title: message,
      description: description || "",
      duration: 5000,
    });
  };

  return showSuccessMessage;
};

export default useSuccessMessage;
