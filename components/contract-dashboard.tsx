"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarClock, Download, Edit, Eye, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractStatusBadge } from "@/components/contract-status-badge"
import { ContractTypeChip } from "@/components/contract-type-chip"
import { DeleteContractDialog } from "@/components/delete-contract-dialog"
import { formatCurrency, getDaysRemaining } from "@/lib/utils"
import { useContracts } from "@/contexts/contract-context"
import { useToast } from "@/hooks/use-toast"
import { ImportDataDialog } from "@/components/import-data-dialog"
import { contractsToCSV, exportToCSV } from "@/lib/export-utils"

export function ContractDashboard() {
  const { contracts } = useContracts()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()

  // Filtra contratos com base no termo de pesquisa, tipo e status
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.supplier.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || contract.type === filterType
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Calcula estatísticas resumidas
  const totalContracts = filteredContracts.length
  const activeContracts = filteredContracts.filter((c) => c.status === "active").length
  const expiringContracts = filteredContracts.filter((c) => c.status === "expiring").length

  // Cálculos financeiros corretos
  const totalValue = filteredContracts.reduce((sum, contract) => {
    // Incluir valor dos aditivos no valor total
    const amendmentsValue = contract.amendments?.reduce((aSum, a) => aSum + a.valueChange, 0) || 0
    return sum + contract.initialValue + amendmentsValue
  }, 0)

  const remainingValue = filteredContracts.reduce((sum, contract) => sum + (contract.remainingValue || 0), 0)
  const percentRemaining = totalValue > 0 ? (remainingValue / totalValue) * 100 : 0

  const exportContractsToJSON = () => {
    try {
      // Criar um objeto Blob com os dados dos contratos
      const contractsData = JSON.stringify(contracts, null, 2)
      const blob = new Blob([contractsData], { type: "application/json" })

      // Criar URL para o Blob
      const url = URL.createObjectURL(blob)

      // Criar um elemento de link para download
      const link = document.createElement("a")
      link.href = url

      // Nome do arquivo com data atual
      const date = new Date()
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      link.download = `contratos-backup-${formattedDate}.json`

      // Adicionar o link ao documento, clicar nele e removê-lo
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Liberar a URL criada
      URL.revokeObjectURL(url)

      // Notificar o usuário
      toast({
        title: "Backup realizado com sucesso",
        description: `Os dados foram exportados para ${link.download}`,
      })
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      toast({
        title: "Erro ao exportar dados",
        description: "Ocorreu um erro ao tentar exportar os dados. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const exportContractsToCSV = () => {
    try {
      // Gerar CSV com os dados dos contratos
      const csvData = contractsToCSV(contracts)

      // Nome do arquivo com data atual
      const date = new Date()
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      const filename = `contratos-${formattedDate}.csv`

      // Exportar para CSV
      exportToCSV(csvData, filename)

      // Notificar o usuário
      toast({
        title: "Exportação concluída",
        description: `Os dados foram exportados para ${filename}`,
      })
    } catch (error) {
      console.error("Erro ao exportar para CSV:", error)
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados para CSV.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              Ativos: {activeContracts}, A vencer: {expiringContracts}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">Todos os contratos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(remainingValue)}</div>
            <p className="text-xs text-muted-foreground">{percentRemaining.toFixed(1)}% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A Vencer em Breve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringContracts}</div>
            <p className="text-xs text-muted-foreground">Nos próximos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Pesquisar contratos..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipo de Contrato</SelectLabel>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="electronic-auction">Pregão Eletrônico</SelectItem>
                <SelectItem value="in-person-auction">Pregão Presencial</SelectItem>
                <SelectItem value="competition">Concorrência</SelectItem>
                <SelectItem value="contest">Concurso</SelectItem>
                <SelectItem value="bidding">Leilão</SelectItem>
                <SelectItem value="competitive-dialogue">Diálogo Competitivo</SelectItem>
                <SelectItem value="price-registration">Registro de Preços</SelectItem>
                <SelectItem value="electronic-waiver">Dispensa Eletrônica</SelectItem>
                <SelectItem value="non-enforceability">Inexigibilidade</SelectItem>
                <SelectItem value="agreement">Convênio</SelectItem>
                <SelectItem value="cooperation-agreement">Acordo de Cooperação</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="expiring">A Vencer</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportContractsToJSON}>Exportar para JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={exportContractsToCSV}>Exportar para CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ImportDataDialog />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Contratos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="expiring">A Vencer</TabsTrigger>
          <TabsTrigger value="completed">Concluídos</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => <ContractCard key={contract.id} contract={contract} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Nenhum contrato encontrado com os filtros selecionados.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContracts.filter((contract) => contract.status === "active").length > 0 ? (
              filteredContracts
                .filter((contract) => contract.status === "active")
                .map((contract) => <ContractCard key={contract.id} contract={contract} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Nenhum contrato ativo encontrado.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="expiring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContracts.filter((contract) => contract.status === "expiring").length > 0 ? (
              filteredContracts
                .filter((contract) => contract.status === "expiring")
                .map((contract) => <ContractCard key={contract.id} contract={contract} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Nenhum contrato a vencer encontrado.</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContracts.filter((contract) => contract.status === "completed").length > 0 ? (
              filteredContracts
                .filter((contract) => contract.status === "completed")
                .map((contract) => <ContractCard key={contract.id} contract={contract} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Nenhum contrato concluído encontrado.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ContractCard({ contract }) {
  const daysRemaining = getDaysRemaining(contract.endDate)

  // Cálculo correto do percentual usado
  const initialValue = contract.initialValue || 0
  const remainingValue = contract.remainingValue || 0
  const usedValue = initialValue - remainingValue
  const percentUsed = initialValue > 0 ? (usedValue / initialValue) * 100 : 0

  const isAgreement = contract.type.includes("agreement")

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{contract.title}</CardTitle>
            <CardDescription className="mt-1">
              {isAgreement ? "Convênio" : "Contrato"} #{contract.number} • {contract.supplier}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/contracts/${contract.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/contracts/${contract.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar {isAgreement ? "Convênio" : "Contrato"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteContractDialog
                contractId={contract.id}
                contractNumber={contract.number}
                contractTitle={contract.title}
                variant="menuItem"
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <ContractTypeChip type={contract.type} />
          <ContractStatusBadge status={contract.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor Inicial:</span>
            <span className="font-medium">{formatCurrency(initialValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Restante:</span>
            <span className="font-medium">{formatCurrency(remainingValue)}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Orçamento Utilizado:</span>
              <span className="font-medium">{percentUsed.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(percentUsed, 100)}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="mr-1 h-4 w-4" />
              {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Expirado"}
            </div>
            <Link href={`/contracts/${contract.id}`}>
              <Button variant="outline" size="sm">
                Detalhes
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

