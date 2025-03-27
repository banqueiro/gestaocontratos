"use client"

import { useState } from "react"
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

export default function NewContract() {
  const router = useRouter()
  const { toast } = useToast()
  const { addContract } = useContracts()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      // Criar o novo contrato
      const initialValue = Number.parseFloat(value)
      const newContract = {
        number,
        title,
        supplier,
        supplierDocument: document,
        supplierContact: contact,
        supplierEmail: email,
        supplierPhone: phone,
        type: contractType as ContractType,
        initialValue,
        remainingValue: initialValue, // Inicialmente, o valor restante é igual ao valor inicial
        startDate: startDate?.toISOString().split("T")[0] || "",
        endDate: endDate?.toISOString().split("T")[0] || "",
        status: "active" as ContractStatus, // Novo contrato começa como ativo
        description,
        legalBasis,
        bidNumber,
        items: [],
        amendments: [],
        payments: [],
        documents: [],
      }

      // Adicionar o contrato ao contexto
      addContract(newContract)

      toast({
        title: "Contrato criado",
        description: "O contrato foi criado com sucesso.",
      })

      // Redirecionar para a página inicial
      router.push("/")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o contrato. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determina se é um convênio ou contrato
  const isAgreement = contractType?.includes("agreement") || false

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar ao Painel
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{isAgreement ? "Novo Convênio" : "Novo Contrato"}</h1>
        <p className="text-muted-foreground">
          {isAgreement
            ? "Crie um novo convênio ou acordo de cooperação"
            : "Crie um novo contrato em conformidade com a Lei 14133/2021"}
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
            <Link href="/">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : isAgreement ? (
              "Criar Convênio"
            ) : (
              "Criar Contrato"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

