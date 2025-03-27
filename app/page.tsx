import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ContractDashboard } from "@/components/contract-dashboard"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Contratos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus contratos em conformidade com a Lei 14133/2021</p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </Link>
      </div>
      <ContractDashboard />
    </div>
  )
}

