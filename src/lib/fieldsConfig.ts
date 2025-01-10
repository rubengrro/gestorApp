export const fieldsConfig: Record<
  string,
  { name: string; label: string; type: string; readonly: boolean }[]
> = {
  default: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "infotipo", label: "Infotipo", type: "text", readonly: true },
    { name: "nombreSubtipo", label: "Nombre Subtipo", type: "text", readonly: true },
    { name: "concepto", label: "Concepto", type: "text", readonly: true },
    { name: "cantidad", label: "Cantidad", type: "number", readonly: false },
    { name: "monto", label: "Monto", type: "number", readonly: false },
    { name: "importe", label: "Importe", type: "number", readonly: false },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "ccNomina", label: "CC Nómina", type: "text", readonly: false },
    { name: "estado", label: "Estado", type: "text", readonly: true },
    { name: "aprobador", label: "Aprobador", type: "text", readonly: true },
  ],
  // relacionados
  // 169: WD | QUIEN REGISTRA | VALIDO DE | VALIDO A | PORCENTAJE FOAH
  // 171: WD | QUIEN REGISTRA | VALIDO DE | VALIDO A |
  //
  P0009: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "monto", label: "Numero de cuenta", type: "number", readonly: false },
    // Quitar aprobador || Quitar CC Nomina || QUitar estado || Monto por Numero de cuenta
  ],
  P0014: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "monto", label: "Monto", type: "number", readonly: false },
  ],
  P0015: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "aprobador", label: "Aprobador", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "cantidad", label: "Cantidad", type: "number", readonly: false },
    { name: "monto", label: "Monto", type: "number", readonly: false },
    { name: "estado", label: "Estado", type: "text", readonly: true },
    // Quitar monto dejar cantidad || Omitidos son cantidad por hora || Premio por defecto 1 
  ],
  P0045: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "monto", label: "Monto", type: "number", readonly: false },
    // Quitar aprobador || cambiar importe por monto || Quitar moneda y estado || Como requisito llenar el P0078 && !match warning
  ],
  P0078: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "monto", label: "Monto", type: "number", readonly: false },
    // Quitar aprobador || cambiar importe por monto || Quitar moneda y estado || Como requisito llenar el P0078 && !match warning
  ],

  P0105: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "aprobador", label: "Aprobador", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "cantidad", label: "Correo electrónico", type: "text", readonly: false },
    { name: "estado", label: "Estado", type: "text", readonly: true },
    // cambiar cantidad por Correo electrónico
  ],
  P2001: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "aprobador", label: "Aprobador", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "cantidad", label: "Cantidad", type: "number", readonly: false },
    { name: "cantidad", label: "Cantidad", type: "number", readonly: false },
    { name: "monto", label: "Monto", type: "number", readonly: false },
    { name: "estado", label: "Estado", type: "text", readonly: true },
    // Registra Inplant debe aprobar Ri para todo || Quitar cantidad === vacaciones registrar día por día no un rango de días >2
    // Incapacidades cambiar cantidad por folio || Agregar días acumulables valor por defecto 0
    // Ausencia por hora === cantidad (horas)
    // Permiso sin goce/sueldo === solo se registra por fechas
    // Registros de Ri por fechas || Quitar estado y aprobador
  ],
  P2010: [
    { name: "trabajadorNumeroWD", label: "Número WD", type: "text", readonly: true },
    { name: "nombreTrabajador", label: "Nombre del Trabajador", type: "text", readonly: true },
    { name: "quienRegistra", label: "Registrado por", type: "text", readonly: true },
    { name: "aprobador", label: "Aprobador", type: "text", readonly: true },
    { name: "validoDe", label: "Válido De", type: "date", readonly: false },
    { name: "validoA", label: "Válido A", type: "date", readonly: false },
    { name: "cantidad", label: "Horas", type: "number", readonly: false },
    // Cantidad === horas
  ],
};
