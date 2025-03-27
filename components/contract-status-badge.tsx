import { Badge } from "@/components/ui/badge"

type ContractStatus = "active" | "expiring" | "completed" | "draft"

interface ContractStatusBadgeProps {
  status: ContractStatus
}

export function ContractStatusBadge({ status }: ContractStatusBadgeProps) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
    case "expiring":
      return <Badge className="bg-amber-500 hover:bg-amber-600">A Vencer</Badge>
    case "completed":
      return <Badge variant="outline">Concluído</Badge>
    case "draft":
      return <Badge variant="secondary">Rascunho</Badge>
    default:
      return null
  }
}

