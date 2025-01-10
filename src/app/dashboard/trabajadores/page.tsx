'use client';
import TrabajadorTable from '@/app/_components/_trabajadores/trabajadores-cat';
import React from 'react'

function page() {
  return (
    <div className='flex flex-col gap-3'>
      <TrabajadorTable />
    </div>
  )
}

export default page