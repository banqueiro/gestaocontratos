"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { useContracts } from "@/contexts/contract-context"
import type { ContractStatus, ContractType } from "@/contexts/contract-context"

export default function EditContract({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getContract, updateContract } = useContracts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contract, setContract] = useState(null)

  // Estados para os campos do formulário
  const [title, setTitle] = useState("")
  const [number, setNumber] = useState("")
  const [contractType, setContractType] = useState<ContractType | "">("")
  const [bidNumber, setBidNumber] = useState("")
  const [legalBasis, setLegalBasis] = useState("")
  const [description, setDescription] = useState("")
  const [supplier, setSupplier] = useState("")
  const [document, setDocument] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [value, setValue] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [status, setStatus] = useState<ContractStatus>("active")

  // Carregar dados do contrato
  useEffect(() => {
    const contractData = getContract(params.id)
    if (contractData) {
      setContract(contractData)

      // Preencher os campos com os dados do contrato
      setTitle(contractData.title)
      setNumber(contractData.number)
      setContractType(contractData.type)
      setBidNumber(contractData.bidNumber || "")
      setLegalBasis(contractData.legalBasis || "")
      setDescription(contractData.description || "")
      setSupplier(contractData.supplier)
      setDocument(contractData.supplierDocument || "")
      setContact(contractData.supplierContact || "")
      setEmail(contractData.supplierEmail || "")
      setPhone(contractData.supplierPhone || "")
      setValue(contractData.initialValue.toString())
      setStartDate(contractData.startDate ? new Date(contractData.startDate) : undefined)
      setEndDate(contractData.endDate ? new Date(contractData.endDate) : undefined)
      setStatus(contractData.status)
    } else {
      // Se o contrato não for encontrado, redirecionar para a página inicial
      router.push("/")
      toast({
        title: "Contrato não encontrado",
        description: "O contrato solicitado não foi encontrado.",
        variant: "destructive",
      })
    }
  }, [params.id, getContract, router, toast])

  // Validação básica
  const isFormValid = () => {
    if (!title || !number || !contractType || !supplier || !value || !startDate || !endDate) {
      return false
    }

    // CNPJ é obrigatório apenas para contratos, não para convênios
    if (!document && !contractType.includes("agreement")) {
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Atualizar o contrato
      const initialValue = Number.parseFloat(value)
      const updatedContract = {
        number,
        title,
        supplier,
        supplierDocument: document,
        supplierContact: contact,
        supplierEmail: email,
        supplierPhone: phone,
        type: contractType as ContractType,
        initialValue,
        startDate: startDate?.toISOString().split("T")[0] || "",
        endDate: endDate?.toISOString().split("T")[0] || "",
        status,
        description,
        legalBasis,
        bidNumber,
      }

      // Atualizar o contrato no contexto
      updateContract(params.id, updatedContract)

      toast({
        title: "Contrato atualizado",
        description: "O contrato foi atualizado com sucesso.",
      })

      // Redirecionar para a página de detalhes do contrato
      router.push(`/contracts/${params.id}`)
    } catch (error) {
      console.error("Erro ao atualizar contrato:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o contrato. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  // Determina se é um convênio ou contrato
  const isAgreement = contractType?.includes("agreement") || false

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link
          href={`/contracts/${params.id}`}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar aos Detalhes
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Editar {isAgreement ? "Convênio" : "Contrato"}</h1>
        <p className="text-muted-foreground">
          {isAgreement
            ? "Edite as informações do convênio ou acordo de cooperação"
            : "Edite as informações do contrato em conformidade com a Lei 14133/2021"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isAgreement ? "Informações do Convênio" : "Informações do Contrato"}</CardTitle>
              <CardDescription>
                {isAgreement
                  ? "Informações básicas sobre o convênio ou acordo"
                  : "Informações básicas sobre o contrato"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="title">
                  {isAgreement ? "Título do Convênio" : "Título do Contrato"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder={`Digite o título ${isAgreement ? "do convênio" : "do contrato"}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="number">
                  {isAgreement ? "Número do Convênio" : "Número do Contrato"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="number"
                  placeholder="ex: 2023/001"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="type">
                  Tipo <span className="text-destructive">*</span>
                </Label>
                <Select value={contractType} onValueChange={(value) => setContractType(value as ContractType)} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Modalidades de Licitação</SelectLabel>
                      <SelectItem value="electronic-auction">Pregão Eletrônico</SelectItem>
                      <SelectItem value="in-person-auction">Pregão Presencial</SelectItem>
                      <SelectItem value="competition">Concorrência</SelectItem>
                      <SelectItem value="contest">Concurso</SelectItem>
                      <SelectItem value="bidding">Leilão</SelectItem>
                      <SelectItem value="competitive-dialogue">Diálogo Competitivo</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Contratações Diretas</SelectLabel>
                      <SelectItem value="price-registration">Registro de Preços</SelectItem>
                      <SelectItem value="electronic-waiver">Dispensa Eletrônica</SelectItem>
                      <SelectItem value="in-person-waiver">Dispensa Presencial</SelectItem>
                      <SelectItem value="non-enforceability">Inexigibilidade</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Convênios e Acordos</SelectLabel>
                      <SelectItem value="agreement">Convênio</SelectItem>
                      <SelectItem value="cooperation-agreement">Acordo de Cooperação</SelectItem>
                      <SelectItem value="transfer-agreement">Termo de Transferência</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {!isAgreement && (
                <div className="grid gap-3">
                  <Label htmlFor="bid-number">Número da Licitação</Label>
                  <Input
                    id="bid-number"
                    placeholder="ex: PE-001/2023"
                    value={bidNumber}
                    onChange={(e) => setBidNumber(e.target.value)}
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="legal-basis">Base Legal</Label>
                <Input
                  id="legal-basis"
                  placeholder={isAgreement ? "ex: Art. 84, Lei 14133/2021" : "ex: Art. 6, Lei 14133/2021"}
                  value={legalBasis}
                  onChange={(e) => setLegalBasis(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder={`Descreva o objetivo e escopo ${isAgreement ? "do convênio" : "do contrato"}`}
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ContractStatus)} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="expiring">A Vencer</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isAgreement ? "Informações da Instituição Parceira" : "Informações do Fornecedor"}
                </CardTitle>
                <CardDescription>
                  {isAgreement
                    ? "Informações sobre a instituição parceira"
                    : "Informações sobre o fornecedor contratado"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Label htmlFor="supplier">
                    {isAgreement ? "Nome da Instituição" : "Nome do Fornecedor"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="supplier"
                    placeholder={`Digite o nome ${isAgreement ? "da instituição parceira" : "da empresa fornecedora"}`}
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="document">
                    {isAgreement ? "CNPJ" : "CNPJ"} {!isAgreement && <span className="text-destructive">*</span>}
                  </Label>
                  <Input
                    id="document"
                    placeholder="ex: 12.345.678/0001-90"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    required={!isAgreement}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="contact">Pessoa de Contato</Label>
                  <Input
                    id="contact"
                    placeholder="Nome da pessoa de contato"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email de contato"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="Número de telefone de contato"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes Financeiros</CardTitle>
                <CardDescription>Valor e duração {isAgreement ? "do convênio" : "do contrato"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Label htmlFor="value">
                    Valor (R$) <span className="text-destructive">*</span>
                    {isAgreement && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (0 para acordos sem repasse financeiro)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label>
                      Data de Início <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? formatDate(startDate.toISOString()) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-3">
                    <Label>
                      Data de Término <span className="text-destructive">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? formatDate(endDate.toISOString()) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href={`/contracts/${params.id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

