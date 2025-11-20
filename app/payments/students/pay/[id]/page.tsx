import { PaymentPage } from "./components/payment-page"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ method?: string }>
}

export default async function StudentPaymentPage(props: Props) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams])
  
  return (
    <PaymentPage 
      paymentId={params.id} 
      paymentMethod={searchParams.method} 
    />
  )
}