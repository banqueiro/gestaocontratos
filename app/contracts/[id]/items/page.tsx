"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download, FileText, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useContracts } from "@/contexts/contract-context"
import type { ContractItem, UsageRecord } from "@/contexts/contract-context"

export default function ContractItems({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getContract, addContractItem, updateContractItem, registerItemUsage, addAmendment } = useContracts()

  const [contract, setContract] = useState(null)
  const [activeTab, setActiveTab] = useState("items")
  const [items, setItems] = useState<ContractItem[]>([])
  const [usages, setUsages] = useState<UsageRecord[]>([])
  const [contractAmendments, setContractAmendments] = useState([])

  // Estados para o modal de registro de uso
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContractItem | null>(null)
  const [usageQuantity, setUsageQuantity] = useState("")
  const [usageDescription, setUsageDescription] = useState("")
  const [usageDocument, setUsageDocument] = useState("")
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split("T")[0])

  // Estados para o modal de aditivo
  const [isAmendmentDialogOpen, setIsAmendmentDialogOpen] = useState(false)
  const [amendmentNumber, setAmendmentNumber] = useState("")
  const [amendmentDescription, setAmendmentDescription] = useState("")
  const [amendmentDate, setAmendmentDate] = useState(new Date().toISOString().split("T")[0])
  const [newItemCode, setNewItemCode] = useState("")
  const [newItemDescription, setNewItemDescription] = useState("")
  const [newItemUnit, setNewItemUnit] = useState("")
  const [newItemUnitPrice, setNewItemUnitPrice] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")

  // Estados para o modal de adição de item
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [addItemCode, setAddItemCode] = useState("")
  const [addItemDescription, setAddItemDescription] = useState("")
  const [addItemUnit, setAddItemUnit] = useState("")
  const [addItemUnitPrice, setAddItemUnitPrice] = useState("")
  const [addItemQuantity, setAddItemQuantity] = useState("")

  // Carregar dados do contrato
  useEffect(() => {
    const loadContract = () => {
      const contractData = getContract(params.id)
      if (contractData) {
        setContract(contractData)
        setItems(contractData.items || [])
        setContractAmendments(contractData.amendments || [])

        // Criar histórico de uso a partir dos pagamentos
        if (contractData.payments && contractData.payments.length > 0) {
          // Aqui poderíamos carregar o histórico de uso de uma API
          // Por enquanto, vamos usar dados de exemplo
          const usageHistory: UsageRecord[] = [
            {
              id: "u1",
              date: "2023-04-10",
              itemId: "1",
              itemCode: "IT001",
              description: "Manutenção preventiva mensal",
              quantity: 40,
              value: 4800,
              document: "OS-2023/042",
            },
            {
              id: "u2",
              date: "2023-05-05",
              itemId: "1",
              itemCode: "IT001",
              description: "Atualização de firmware",
              quantity: 25,
              value: 3000,
              document: "OS-2023/057",
            },
            {
              id: "u3",
              date: "2023-04-20",
              itemId: "2",
              itemCode: "IT002",
              description: "Instalação em novos computadores",
              quantity: 15,
              value: 2250,
              document: "OS-2023/049",
            },
            {
              id: "u4",
              date: "2023-05-15",
              itemId: "3",
              itemCode: "IT003",
              description: "Suporte para configuração de firewall",
              quantity: 20,
              value: 1800,
              document: "OS-2023/062",
            },
          ]
          setUsages(usageHistory)
        }
      } else {
        // Se o contrato não for encontrado, redirecionar para a página inicial
        router.push("/")
        toast({
          title: "Contrato não encontrado",
          description: "O contrato solicitado não foi encontrado.",
          variant: "destructive",
        })
      }
    }

    loadContract()
  }, [params.id, getContract, router, toast])

  // Recarregar o contrato quando houver alterações
  const reloadContract = () => {
    const contractData = getContract(params.id)
    if (contractData) {
      setContract(contractData)
      setItems(contractData.items || [])
      setContractAmendments(contractData.amendments || [])
    }
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Carregando...</h2>
            <p className="text-muted-foreground">Buscando informações do contrato</p>
          </div>
        </div>
      </div>
    )
  }

  // Cálculos de totais
  const totalInitialValue = items.reduce((sum, item) => sum + item.totalValue, 0)
  const totalRemainingValue = items.reduce((sum, item) => sum + item.remainingValue, 0)
  const totalUsedValue = totalInitialValue - totalRemainingValue
  const percentUsed = totalInitialValue > 0 ? (totalUsedValue / totalInitialValue) * 100 : 0

  // Função para abrir o modal de registro de uso
  const openUsageDialog = (item: ContractItem) => {
    setSelectedItem(item)
    setUsageQuantity("")
    setUsageDescription("")
    setUsageDocument("")
    setUsageDate(new Date().toISOString().split("T")[0])
    setIsUsageDialogOpen(true)
  }

  // Função para registrar o uso de um item
  const handleRegisterUsage = () => {
    if (!selectedItem || !usageQuantity || !usageDescription || !usageDocument || !usageDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const quantity = Number.parseFloat(usageQuantity)

    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade deve ser um número positivo.",
        variant: "destructive",
      })
      return
    }

    if (quantity > selectedItem.remainingQuantity) {
      toast({
        title: "Quantidade excede o saldo",
        description: "A quantidade informada excede o saldo disponível.",
        variant: "destructive",
      })
      return
    }

    const value = quantity * selectedItem.unitPrice

    // Criar registro de uso
    const newUsage: Omit<UsageRecord, "id"> = {
      date: usageDate,
      itemId: selectedItem.id,
      itemCode: selectedItem.code,
      description: usageDescription,
      quantity,
      value,
      document: usageDocument,
    }

    // Registrar o uso no contexto
    registerItemUsage(contract.id, selectedItem.id, newUsage)

    // Recarregar o contrato para obter os dados atualizados
    reloadContract()

    // Adicionar ao histórico de uso local
    const newUsageWithId = {
      ...newUsage,
      id: `u${Date.now()}`,
    }
    setUsages([newUsageWithId, ...usages])

    setIsUsageDialogOpen(false)

    toast({
      title: "Uso registrado",
      description: "O uso do item foi registrado com sucesso.",
    })
  }

  // Função para adicionar um novo item ao contrato
  const handleAddItem = () => {
    if (!addItemCode || !addItemDescription || !addItemUnit || !addItemUnitPrice || !addItemQuantity) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const unitPrice = Number.parseFloat(addItemUnitPrice)
    const quantity = Number.parseFloat(addItemQuantity)

    if (isNaN(unitPrice) || unitPrice <= 0 || isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Valores inválidos",
        description: "O preço unitário e a quantidade devem ser números positivos.",
        variant: "destructive",
      })
      return
    }

    const totalValue = unitPrice * quantity

    // Criar novo item
    const newItem: Omit<ContractItem, "id"> = {
      code: addItemCode,
      description: addItemDescription,
      unit: addItemUnit,
      unitPrice,
      initialQuantity: quantity,
      remainingQuantity: quantity,
      totalValue,
      remainingValue: totalValue,
    }

    // Adicionar o item ao contrato no contexto
    addContractItem(contract.id, newItem)

    // Recarregar o contrato para obter os dados atualizados
    reloadContract()

    setIsAddItemDialogOpen(false)

    // Limpar os campos do formulário
    setAddItemCode("")
    setAddItemDescription("")
    setAddItemUnit("")
    setAddItemUnitPrice("")
    setAddItemQuantity("")

    toast({
      title: "Item adicionado",
      description: "O item foi adicionado ao contrato com sucesso.",
    })
  }

  // Função para adicionar um aditivo ao contrato
  const handleAddAmendment = () => {
    if (
      !amendmentNumber ||
      !amendmentDescription ||
      !amendmentDate ||
      !newItemCode ||
      !newItemDescription ||
      !newItemUnit ||
      !newItemUnitPrice ||
      !newItemQuantity
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const unitPrice = Number.parseFloat(newItemUnitPrice)
    const quantity = Number.parseFloat(newItemQuantity)

    if (isNaN(unitPrice) || unitPrice <= 0 || isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Valores inválidos",
        description: "O preço unitário e a quantidade devem ser números positivos.",
        variant: "destructive",
      })
      return
    }

    const totalValue = unitPrice * quantity

    // Criar novo item para o aditivo
    const newItem: Omit<ContractItem, "id"> = {
      code: newItemCode,
      description: newItemDescription,
      unit: newItemUnit,
      unitPrice,
      initialQuantity: quantity,
      remainingQuantity: quantity,
      totalValue,
      remainingValue: totalValue,
    }

    // Criar o aditivo
    const amendment = {
      number: amendmentNumber,
      date: amendmentDate,
      description: amendmentDescription,
      valueChange: totalValue,
      items: [newItem],
    }

    // Adicionar o aditivo ao contrato no contexto
    addAmendment(contract.id, amendment)

    // Recarregar o contrato para obter os dados atualizados
    reloadContract()

    setIsAmendmentDialogOpen(false)

    // Limpar os campos do formulário
    setAmendmentNumber("")
    setAmendmentDescription("")
    setAmendmentDate(new Date().toISOString().split("T")[0])
    setNewItemCode("")
    setNewItemDescription("")
    setNewItemUnit("")
    setNewItemUnitPrice("")
    setNewItemQuantity("")

    toast({
      title: "Aditivo registrado",
      description: "O aditivo foi registrado com sucesso.",
    })
  }

  const isAgreement = contract.type.includes("agreement")

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href={`/contracts/${params.id}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar aos Detalhes {isAgreement ? "do Convênio" : "do Contrato"}
        </Link>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Itens</h1>
            <p className="text-muted-foreground">
              {isAgreement ? "Convênio" : "Contrato"} #{contract.number} • Controle quantitativo e financeiro
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Item</DialogTitle>
                  <DialogDescription>
                    Adicione um novo item {isAgreement ? "ao convênio" : "ao contrato"}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-item-code">Código</Label>
                      <Input
                        id="add-item-code"
                        value={addItemCode}
                        onChange={(e) => setAddItemCode(e.target.value)}
                        placeholder="ex: IT005"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-item-unit">Unidade</Label>
                      <Input
                        id="add-item-unit"
                        value={addItemUnit}
                        onChange={(e) => setAddItemUnit(e.target.value)}
                        placeholder="ex: Hora, Unidade, etc."
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="add-item-description">Descrição</Label>
                    <Input
                      id="add-item-description"
                      value={addItemDescription}
                      onChange={(e) => setAddItemDescription(e.target.value)}
                      placeholder="Descrição detalhada do item"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="add-item-unit-price">Preço Unitário (R$)</Label>
                      <Input
                        id="add-item-unit-price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={addItemUnitPrice}
                        onChange={(e) => setAddItemUnitPrice(e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="add-item-quantity">Quantidade</Label>
                      <Input
                        id="add-item-quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={addItemQuantity}
                        onChange={(e) => setAddItemQuantity(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddItem}>Adicionar Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isAmendmentDialogOpen} onOpenChange={setIsAmendmentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <FileText className="mr-2 h-4 w-4" />
                  Registrar Aditivo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Aditivo</DialogTitle>
                  <DialogDescription>
                    Adicione um aditivo {isAgreement ? "ao convênio" : "ao contrato"} com novos itens ou quantidades.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="amendment-number">Número do Aditivo</Label>
                      <Input
                        id="amendment-number"
                        value={amendmentNumber}
                        onChange={(e) => setAmendmentNumber(e.target.value)}
                        placeholder="ex: 2"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amendment-date">Data</Label>
                      <Input
                        id="amendment-date"
                        type="date"
                        value={amendmentDate}
                        onChange={(e) => setAmendmentDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amendment-description">Descrição do Aditivo</Label>
                    <Input
                      id="amendment-description"
                      value={amendmentDescription}
                      onChange={(e) => setAmendmentDescription(e.target.value)}
                      placeholder="Descreva o motivo e objetivo do aditivo"
                    />
                  </div>

                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Novo Item</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="new-item-code">Código</Label>
                        <Input
                          id="new-item-code"
                          value={newItemCode}
                          onChange={(e) => setNewItemCode(e.target.value)}
                          placeholder="ex: IT005"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-item-unit">Unidade</Label>
                        <Input
                          id="new-item-unit"
                          value={newItemUnit}
                          onChange={(e) => setNewItemUnit(e.target.value)}
                          placeholder="ex: Hora, Unidade, etc."
                        />
                      </div>
                    </div>
                    <div className="grid gap-2 mt-2">
                      <Label htmlFor="new-item-description">Descrição</Label>
                      <Input
                        id="new-item-description"
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                        placeholder="Descrição detalhada do item"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="grid gap-2">
                        <Label htmlFor="new-item-unit-price">Preço Unitário (R$)</Label>
                        <Input
                          id="new-item-unit-price"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={newItemUnitPrice}
                          onChange={(e) => setNewItemUnitPrice(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-item-quantity">Quantidade</Label>
                        <Input
                          id="new-item-quantity"
                          type="number"
                          min="1"
                          step="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAmendmentDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddAmendment}>Registrar Aditivo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInitialValue)}</div>
            <p className="text-xs text-muted-foreground">Todos os itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Utilizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUsedValue)}</div>
            <p className="text-xs text-muted-foreground">{percentUsed.toFixed(1)}% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemainingValue)}</div>
            <p className="text-xs text-muted-foreground">{(100 - percentUsed).toFixed(1)}% do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Itens no {isAgreement ? "convênio" : "contrato"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="usage">Histórico de Uso</TabsTrigger>
          <TabsTrigger value="amendments">Aditivos</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Itens {isAgreement ? "do Convênio" : "do Contrato"}</CardTitle>
              <CardDescription>Controle quantitativo e financeiro dos itens</CardDescription>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Unidade</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Qtd. Inicial</TableHead>
                      <TableHead className="text-right">Qtd. Disponível</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{item.initialQuantity}</TableCell>
                        <TableCell className="text-right">{item.remainingQuantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalValue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.remainingValue)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUsageDialog(item)}
                            disabled={item.remainingQuantity <= 0}
                          >
                            Registrar Uso
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum item registrado para este {isAgreement ? "convênio" : "contrato"}.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddItemDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Uso</CardTitle>
              <CardDescription>Registro de utilização dos itens</CardDescription>
            </CardHeader>
            <CardContent>
              {usages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Documento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usages.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{formatDate(usage.date)}</TableCell>
                        <TableCell className="font-medium">{usage.itemCode}</TableCell>
                        <TableCell>{usage.description}</TableCell>
                        <TableCell className="text-right">{usage.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(usage.value)}</TableCell>
                        <TableCell>{usage.document}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum registro de uso para este {isAgreement ? "convênio" : "contrato"}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amendments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aditivos</CardTitle>
              <CardDescription>
                Aditivos que modificaram o {isAgreement ? "convênio" : "contrato"} original
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contractAmendments.length > 0 ? (
                <div className="space-y-6">
                  {contractAmendments.map((amendment) => (
                    <div key={amendment.id || amendment.number} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Aditivo #{amendment.number}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(amendment.date)}</p>
                      </div>
                      <p className="text-muted-foreground mb-4">{amendment.description}</p>

                      {amendment.items && amendment.items.length > 0 && (
                        <>
                          <h4 className="font-medium mb-2">Itens Adicionados</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Unidade</TableHead>
                                <TableHead className="text-right">Preço Unit.</TableHead>
                                <TableHead className="text-right">Quantidade</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {amendment.items.map((item) => (
                                <TableRow key={item.id || item.code}>
                                  <TableCell className="font-medium">{item.code}</TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell>{item.unit}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                  <TableCell className="text-right">{item.initialQuantity}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(item.totalValue)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum aditivo foi registrado para este {isAgreement ? "convênio" : "contrato"}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para registrar uso de item */}
      <Dialog open={isUsageDialogOpen} onOpenChange={setIsUsageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Uso de Item</DialogTitle>
            <DialogDescription>Registre a utilização do item selecionado.</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Item Selecionado</Label>
                <div className="p-2 border rounded-md bg-muted">
                  <p className="font-medium">
                    {selectedItem.code} - {selectedItem.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Saldo disponível: {selectedItem.remainingQuantity} {selectedItem.unit} (
                    {formatCurrency(selectedItem.remainingValue)})
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usage-date">Data do Uso</Label>
                <Input id="usage-date" type="date" value={usageDate} onChange={(e) => setUsageDate(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usage-quantity">Quantidade Utilizada</Label>
                <Input
                  id="usage-quantity"
                  type="number"
                  min="0.01"
                  max={selectedItem.remainingQuantity}
                  step="0.01"
                  value={usageQuantity}
                  onChange={(e) => setUsageQuantity(e.target.value)}
                  placeholder={`Máximo: ${selectedItem.remainingQuantity}`}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usage-description">Descrição do Uso</Label>
                <Input
                  id="usage-description"
                  value={usageDescription}
                  onChange={(e) => setUsageDescription(e.target.value)}
                  placeholder="Descreva a finalidade do uso"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="usage-document">Documento de Referência</Label>
                <Input
                  id="usage-document"
                  value={usageDocument}
                  onChange={(e) => setUsageDocument(e.target.value)}
                  placeholder="ex: Ordem de Serviço, Nota Fiscal, etc."
                />
              </div>
              {usageQuantity && !isNaN(Number.parseFloat(usageQuantity)) && (
                <div className="p-2 border rounded-md bg-muted">
                  <p className="text-sm">
                    Valor total:{" "}
                    <span className="font-medium">
                      {formatCurrency(Number.parseFloat(usageQuantity) * selectedItem.unitPrice)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUsageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegisterUsage}>Registrar Uso</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

