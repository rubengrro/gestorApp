// context/IncidenciasContext.tsx
import React, { createContext, useContext, useState } from "react";

interface IncidenciaData {
  trabajadorNumeroWD: string;
  monto: number | null;
}

interface IncidenciasContextValue {
  incidenciaData: IncidenciaData | null;
  setIncidenciaData: (data: IncidenciaData) => void;
}

const IncidenciasContext = createContext<IncidenciasContextValue | undefined>(undefined);

export const IncidenciasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidenciaData, setIncidenciaData] = useState<IncidenciaData | null>(null);

  return (
    <IncidenciasContext.Provider value={{ incidenciaData, setIncidenciaData }}>
      {children}
    </IncidenciasContext.Provider>
  );
};

export const useIncidencias = () => {
  const context = useContext(IncidenciasContext);
  if (!context) {
    throw new Error("useIncidencias must be used within a IncidenciasProvider");
  }
  return context;
};
