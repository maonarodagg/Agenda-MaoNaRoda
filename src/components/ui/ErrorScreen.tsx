import { Button } from './Button'
import { CenteredCard } from './CenteredCard'

interface ErrorScreenProps {
  message: string
  onRetry: () => void
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <CenteredCard title="Algo deu errado">
      <p role="alert">{message}</p>
      <Button onClick={onRetry}>Tentar de novo</Button>
    </CenteredCard>
  )
}
