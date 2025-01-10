import Dashboard from '@/app/_components/_home/homeview';
import { auth } from '@/auth'
import React from 'react'

export default async function Home() {
  const session = await auth();
  if(!session) {
    return <div>Not Auth</div>
  }
  return (
    <Dashboard />
  )
}
