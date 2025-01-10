import { useMemo } from "react";

export const useCurrentWeek = () => {
  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado

    // Inicio de la semana (lunes a las 00:00 horas)
    const start = new Date(now);
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(now.getDate() + offsetToMonday);
    start.setHours(0, 0, 0, 0); // Lunes a las 00:00 horas

    // Fin de la semana (domingo a las 23:59:59)
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999); // Domingo a las 23:59:59

    return { start, end };
  };

  const { start, end } = useMemo(getWeekRange, []);

  const filterByCurrentWeek = (data: { createdAt: string }[]) => {
    return data.filter((item) => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= start && createdAt <= end;
    });
  };

  return { start, end, filterByCurrentWeek };
};
