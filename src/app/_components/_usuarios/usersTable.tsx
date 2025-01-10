import React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import RegisterForm from "./registerForm";
import { User } from '@/types';
import { UserEditBtn } from './UserEditBtn';
import { UserDeleteBtn } from './UserDeleteBtn';
import { Badge } from "@/components/ui/badge";

interface UserTableProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserTable = ({ users, setUsers }: UserTableProps) => {
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleRemoveUser = (userId: string) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const userColumns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Correo Electrónico' },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ getValue }) => {
        const role = getValue() as string;
        return (
          <Badge variant="secondary" className="text-xs px-2 py-1 rounded-full">
            {role === 'Superadministrador' ? 'Super Administrador' : role}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'plant',
      header: 'Planta',
      cell: ({ getValue }) => {
        const plant = getValue() as string;
        return (
          <Badge variant="outline" className="text-xs px-2 py-1 rounded-full">
            {plant === 'All' ? 'Todas las plantas' : plant.replace(/_/g, ' ')}
          </Badge>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <UserEditBtn
            userId={row.original.id}
            onUpdate={handleUpdateUser}
          />
          <UserDeleteBtn
            userId={row.original.id}
            name={row.original.name ?? "Usuario"}
            email={row.original.email}
            role={row.original.role}
            onRemoveUser={handleRemoveUser}
          />
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns: userColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleUserAdded = async (newUser: User) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  return (
    <div className="flex justify-center w-full mt-4">
      <div className="w-full max-w-[1200px] bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-100">
          <h2 className="text-2xl font-bold text-gray-700">Usuarios Registrados</h2>
          <RegisterForm onUserAdded={handleUserAdded} />
        </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-blue-500 text-left p-4 font-semibold text-white">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-slate-100 transition-colors duration-200`}
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
                  <TableCell colSpan={userColumns.length} className="h-24 text-center text-gray-500">
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

export default UserTable;
