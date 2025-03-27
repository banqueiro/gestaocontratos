import { FileText, ShoppingCart, FileCheck, FileWarning, Award, Gavel, MessageSquare, Handshake } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { ContractType } from "@/contexts/contract-context"

interface ContractTypeChipProps {
  type: ContractType
}

export function ContractTypeChip({ type }: ContractTypeChipProps) {
  switch (type) {
    // Modalidades da Lei 14133/2021
    case "electronic-auction":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <ShoppingCart className="h-3 w-3" />
          <span>Pregão Eletrônico</span>
        </Badge>
      )
    case "in-person-auction":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <ShoppingCart className="h-3 w-3" />
          <span>Pregão Presencial</span>
        </Badge>
      )
    case "competition":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          <span>Concorrência</span>
        </Badge>
      )
    case "contest":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          <span>Concurso</span>
        </Badge>
      )
    case "bidding":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Gavel className="h-3 w-3" />
          <span>Leilão</span>
        </Badge>
      )
    case "competitive-dialogue":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>Diálogo Competitivo</span>
        </Badge>
      )

    // Contratações diretas
    case "price-registration":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>Registro de Preços</span>
        </Badge>
      )
    case "electronic-waiver":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileWarning className="h-3 w-3" />
          <span>Dispensa Eletrônica</span>
        </Badge>
      )
    case "in-person-waiver":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileWarning className="h-3 w-3" />
          <span>Dispensa Presencial</span>
        </Badge>
      )
    case "non-enforceability":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <FileCheck className="h-3 w-3" />
          <span>Inexigibilidade</span>
        </Badge>
      )

    // Convênios e outros
    case "agreement":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Handshake className="h-3 w-3" />
          <span>Convênio</span>
        </Badge>
      )
    case "cooperation-agreement":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Handshake className="h-3 w-3" />
          <span>Acordo de Cooperação</span>
        </Badge>
      )
    case "transfer-agreement":
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Handshake className="h-3 w-3" />
          <span>Termo de Transferência</span>
        </Badge>
      )
    default:
      return null
  }
}

