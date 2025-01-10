import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Importa el hook para la sesión
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EditButton } from "./IncidenceEditBtn";
import { DeleteButton } from "./IncidenceDeleteBtn";
import { IncidenciaCatalogo } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { IncidenciaCatForm } from "./registrarIncidencia";
import { Role } from "@prisma/client"; 

const columns = (
  removeIncidencia: (id: number) => void,
  setIncidencias: React.Dispatch<React.SetStateAction<IncidenciaCatalogo[]>>
): ColumnDef<IncidenciaCatalogo>[] => [
  { accessorKey: "infotype", header: "Infotipo" },
  { accessorKey: "concepto", header: "Concepto" },
  { accessorKey: "nombreSubtipo", header: "Nombre Subtipo" },
  {
    accessorKey: "requiereAprobacion",
    header: "Requiere Aprobación",
    cell: ({ getValue }) => (getValue() ? "Sí" : "No"),
  },
  {
    accessorKey: "rolesAcceso",
    header: "Usuarios con Acceso",
    cell: ({ getValue }) => {
      const roles = (getValue() as string[]).filter(
        (role) => role !== "Superadministrador" && role !== "Administrador"
      );

      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role, index) => (
            <Badge
              key={role}
              variant={index === 0 ? "secondary" : "outline"}
              className="cursor-default"
            >
              {role}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <EditButton
          incidenciaId={row.original.id}
          onUpdate={(updatedIncidencia) => {
            setIncidencias((prev: IncidenciaCatalogo[]) =>
              prev.map((incidencia) =>
                incidencia.id === updatedIncidencia.id ? updatedIncidencia : incidencia
              )
            );
          }}
        />
        <DeleteButton
          incidenciaId={row.original.id}
          infotype={row.original.infotype}
          concepto={row.original.concepto}
          nombreSubtipo={row.original.nombreSubtipo}
          rolesAcceso={row.original.rolesAcceso}
          onRemoveIncidencia={removeIncidencia}
        />
        {/* <CreateIncidenceForm
          infotype={row.original.infotype}
          concepto={row.original.concepto}
          nombreSubtipo={row.original.nombreSubtipo}
          rolesAcceso={row.original.rolesAcceso}
          incidenciaId={row.original.id}
          onSave={(fields) => {
            console.log(`Formulario guardado para incidencia ID: ${row.original.id}`, fields);
          }}
        /> */}
      </div>
    ),
  },
];

const CatalogoIncidencias = () => {
  const [incidencias, setIncidencias] = useState<IncidenciaCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession(); // Obttener los datos de sesión
  const userRole = session?.user?.role; // Extraer el rol del usuario

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const response = await fetch("/api/incidencias?catalogo=true");
        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const data = (await response.json()) as IncidenciaCatalogo[];

        // Filtra las incidencias por rol del usuario (casting explícito a Role)
        const filteredIncidencias = userRole
          ? data.filter((incidencia) => incidencia.rolesAcceso.includes(userRole as Role))
          : [];

        setIncidencias(filteredIncidencias);
      } catch (error) {
        console.error("Error al cargar incidencias del catálogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidencias();
  }, [userRole]);

  const addIncidencia = (newIncidencia: Omit<IncidenciaCatalogo, "id" | "configuracion" | "createdAt" | "updatedAt">) => {
    setIncidencias((prevIncidencias) => [
      ...prevIncidencias,
      {
        ...newIncidencia,
        id: Math.random(),
        createdAt: new Date(),
        updatedAt: new Date(),
        configuracion: {},
      },
    ]);
  };

  const removeIncidencia = (id: number) => {
    setIncidencias((prevIncidencias) => prevIncidencias.filter((incidencia) => incidencia.id !== id));
  };

  const table = useReactTable({
    data: incidencias,
    columns: columns(removeIncidencia, setIncidencias),
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <div className="text-center text-gray-500">Cargando...</div>;

  return (
    <div className="flex justify-center w-full mt-4">
      <div className="w-full max-w-[1200px] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        <div className="flex justify-between items-center mb-4 p-4 border-b border-gray-200 bg-gray-100">
          <h1 className="text-2xl font-bold text-gray-700">Catálogo de Incidencias</h1>
          <IncidenciaCatForm onAddIncidencia={addIncidencia} />
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-blue-500 text-left p-4 font-semibold text-white">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-slate-100 transition-colors duration-200`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-4 border-b border-gray-200 text-gray-800">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns(removeIncidencia, setIncidencias).length}
                    className="h-24 text-center text-gray-500"
                  >
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CatalogoIncidencias;
