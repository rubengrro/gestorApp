/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useTransition } from 'react';
import { loginSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAction } from '@/actions/auth-actions';
import { redirect } from 'next/navigation';
import LoadingSpinner from './loadingSpinner';

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      setError(null);
      const response = await loginAction(values);
      if (response.error) {
        setError(response.error);
      } else {
        redirect('/dashboard/home');
      }
    });
  }

  return (
    <Card className='w-[380px] h-auto flex flex-col p-6 shadow-lg rounded-lg'>
      <CardHeader className='p-2'>
        <CardTitle className='text-2xl text-center font-bold text-gray-800'>
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduce tu email" type='email' {...field} className="border rounded-md p-2" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Contraseña</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduce tu contraseña" type='password' {...field} className="border rounded-md p-2" />
                  </FormControl>
                  {error && <FormMessage className="text-red-500">{error}</FormMessage>}
                </FormItem>
              )}
            />
            {isPending ? (
              <LoadingSpinner />
            ) : (
              <Button type="submit" className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md'>
                Iniciar sesión
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
