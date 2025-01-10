// import { redirect } from "next/navigation"

// function Page() {
//   return (
//     redirect('/dashboard/home')
//   )
// }

// export default Page

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Page(){
  const session = await auth()

  if(!session){
    return (
      redirect('/login')
    )
  }

  return (
    redirect('/dashboard/tablero')
  )
}