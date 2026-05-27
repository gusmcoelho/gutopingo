import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/public/payments/webhook')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/api/public/payments/webhook"!</div>
}
