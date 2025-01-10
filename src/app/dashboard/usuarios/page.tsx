'use client';

import React, { useState, useEffect } from 'react';
import UserTable from '@/app/_components/_usuarios/usersTable';
import { User } from '@/types';

function Usuarios() {
  const [users, setUsers] = useState<User[]>([]);

  // Carga inicial de usuarios
  const loadUsers = async () => {
    const response = await fetch('/api/users');
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <UserTable users={users} setUsers={setUsers} />
    </div>
  );
}

export default Usuarios;
