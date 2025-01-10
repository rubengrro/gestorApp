import { redirect } from 'next/navigation'

function Page() {
  return (
    redirect('/login')
  )
}

export default Page