import { redirect } from 'next/navigation'

interface AccountPageProps {
  searchParams?: Promise<{ callbackUrl?: string }>
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams
  const target = params?.callbackUrl || '/profile'
  redirect(target)
}
