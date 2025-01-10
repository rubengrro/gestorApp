'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';

const SignOutButton = () => {
  const router = useRouter();

  const handleClick = async () => {
    await signOut({ callbackUrl: '/' }); // Redirige a la página principal después de cerrar sesión
    router.push('/'); // Redirige al home (en caso de fallo de callbackUrl)
  };

  return <Button onClick={handleClick} variant='destructive'>Cerrar sesión</Button>;
};

export default SignOutButton;
