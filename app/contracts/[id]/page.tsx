"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, Edit, FileText, Printer, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractStatusBadge } from "@/components/contract-status-badge"
import { ContractTypeChip } from "@/components/contract-type-chip"
import { DeleteContractDialog } from "@/components/delete-contract-dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useContracts } from "@/contexts/contract-context"
import type { ContractType } from "@/contexts/contract-context"

export default function ContractDetails({ params }) {
  const router = useRouter()
  const { getContract } = useContracts()
  const [contract, setContract] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const contractData = getContract(params.id)
    if (contractData) {
      setContract(contractData)
    } else {
      // Se o contrato não for encontrado, redirecionar para a página inicial
      router.push("/")
    }
  }, [params.id, getContract, router])

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

  const isAgreement = contract.type.includes("agreement")

  // Função para obter o nome do tipo de contrato em português
  const getContractTypeName = (type: ContractType) => {
    switch (type) {
      // Modalidades da Lei 14133/2021
      case "electronic-auction":
        return "Pregão Eletrônico"
      case "in-person-auction":
        return "Pregão Presencial"
      case "competition":
        return "Concorrência"
      case "contest":
        return "Concurso"
      case "bidding":
        return "Leilão"
      case "competitive-dialogue":
        return "Diálogo Competitivo"

      // Contratações diretas
      case "price-registration":
        return "Registro de Preços"
      case "electronic-waiver":
        return "Dispensa Eletrônica"
      case "in-person-waiver":
        return "Dispensa Presencial"
      case "non-enforceability":
        return "Inexigibilidade"

      // Convênios e outros
      case "agreement":
        return "Convênio"
      case "cooperation-agreement":
        return "Acordo de Cooperação"
      case "transfer-agreement":
        return "Termo de Transferência"
      default:
        return type
    }
  }

  // Cálculos financeiros
  const initialValue = contract.initialValue || 0
  const remainingValue = contract.remainingValue || 0
  const usedValue = initialValue - remainingValue
  const percentUsed = initialValue > 0 ? (usedValue / initialValue) * 100 : 0

  // Valor atual (incluindo aditivos)
  const amendmentsValue = contract.amendments?.reduce((sum, a) => sum + a.valueChange, 0) || 0
  const currentValue = initialValue + amendmentsValue

  // Valor gasto (a partir dos pagamentos)
  const paymentsValue = contract.payments?.reduce((sum, p) => sum + p.value, 0) || 0

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar ao Painel
        </Link>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
            <p className="text-muted-foreground">
              {isAgreement ? "Convênio" : "Contrato"} #{contract.number} • {contract.supplier}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Link href={`/contracts/${params.id}/items`}>
              <Button size="sm" variant="secondary">
                <Package className="mr-2 h-4 w-4" />
                Gerenciar Itens
              </Button>
            </Link>
            <Link href={`/contracts/${params.id}/edit`}>
              <Button size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Editar {isAgreement ? "Convênio" : "Contrato"}
              </Button>
            </Link>
            <DeleteContractDialog
              contractId={contract.id}
              contractNumber={contract.number}
              contractTitle={contract.title}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <ContractTypeChip type={contract.type} />
          <ContractStatusBadge status={contract.status} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="amendments">Aditivos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalhes {isAgreement ? "do Convênio" : "do Contrato"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Tipo:</div>
                  <div className="font-medium">{getContractTypeName(contract.type)}</div>

                  {!isAgreement && (
                    <>
                      <div className="text-muted-foreground">Número da Licitação:</div>
                      <div className="font-medium">{contract.bidNumber || "N/A"}</div>
                    </>
                  )}

                  <div className="text-muted-foreground">Base Legal:</div>
                  <div className="font-medium">{contract.legalBasis || "N/A"}</div>

                  <div className="text-muted-foreground">Data de Início:</div>
                  <div className="font-medium">{formatDate(contract.startDate)}</div>

                  <div className="text-muted-foreground">Data de Término:</div>
                  <div className="font-medium">{formatDate(contract.endDate)}</div>

                  <div className="text-muted-foreground">Status:</div>
                  <div className="font-medium">
                    {contract.status === "active"
                      ? "Ativo"
                      : contract.status === "expiring"
                        ? "A Vencer"
                        : contract.status === "completed"
                          ? "Concluído"
                          : "Rascunho"}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">Descrição</h4>
                  <p className="text-sm text-muted-foreground">{contract.description || "Sem descrição disponível."}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {isAgreement ? "Informações da Instituição Parceira" : "Informações do Fornecedor"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{isAgreement ? "Instituição:" : "Empresa:"}</div>
                  <div className="font-medium">{contract.supplier}</div>

                  <div className="text-muted-foreground">CNPJ:</div>
                  <div className="font-medium">{contract.supplierDocument || "N/A"}</div>

                  <div className="text-muted-foreground">Contato:</div>
                  <div className="font-medium">{contract.supplierContact || "N/A"}</div>

                  <div className="text-muted-foreground">Email:</div>
                  <div className="font-medium">{contract.supplierEmail || "N/A"}</div>

                  <div className="text-muted-foreground">Telefone:</div>
                  <div className="font-medium">{contract.supplierPhone || "N/A"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Valor Inicial:</div>
                  <div className="font-medium">{formatCurrency(initialValue)}</div>

                  <div className="text-muted-foreground">Valor Atual:</div>
                  <div className="font-medium">{formatCurrency(currentValue)}</div>

                  <div className="text-muted-foreground">Gasto:</div>
                  <div className="font-medium">{formatCurrency(paymentsValue)}</div>

                  <div className="text-muted-foreground">Restante:</div>
                  <div className="font-medium">{formatCurrency(remainingValue)}</div>
                </div>

                {initialValue > 0 && (
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Orçamento Utilizado:</span>
                      <span className="font-medium">{percentUsed.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link href={`/contracts/${params.id}/items`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Package className="mr-2 h-4 w-4" />
                      Gerenciar Itens {isAgreement ? "do Convênio" : "do Contrato"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {contract.payments && contract.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pagamentos Recentes</CardTitle>
                <CardDescription>Últimos {Math.min(3, contract.payments.length)} pagamentos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contract.payments.slice(0, 3).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(payment.date)}
                          <span className="mx-1">•</span>
                          <FileText className="mr-1 h-3 w-3" />
                          Nota Fiscal: {payment.invoice}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Financeiras</CardTitle>
              <CardDescription>Histórico financeiro completo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Valor {isAgreement ? "do Convênio" : "do Contrato"}</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Valor Inicial</div>
                      <div className="text-2xl font-bold mt-1">{formatCurrency(initialValue)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Valor Atual</div>
                      <div className="text-2xl font-bold mt-1">{formatCurrency(currentValue)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Valor Restante</div>
                      <div className="text-2xl font-bold mt-1">{formatCurrency(remainingValue)}</div>
                    </div>
                  </div>
                </div>

                {contract.payments && contract.payments.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Histórico de Pagamentos</h3>
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b">
                        <div>Data</div>
                        <div>Descrição</div>
                        <div>Nota Fiscal</div>
                        <div className="text-right">Valor</div>
                      </div>
                      {contract.payments.map((payment) => (
                        <div key={payment.id} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
                          <div>{formatDate(payment.date)}</div>
                          <div>{payment.description}</div>
                          <div>{payment.invoice}</div>
                          <div className="text-right font-medium">{formatCurrency(payment.value)}</div>
                        </div>
                      ))}
                      <div className="grid grid-cols-4 gap-4 p-4 font-medium bg-muted">
                        <div className="col-span-3 text-right">Total Gasto:</div>
                        <div className="text-right">
                          {formatCurrency(contract.payments.reduce((sum, p) => sum + p.value, 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Nenhum pagamento registrado para este {isAgreement ? "convênio" : "contrato"}.</p>
                  </div>
                )}

                {initialValue > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Uso do Orçamento</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Orçamento Utilizado:</span>
                        <span className="font-medium">{percentUsed.toFixed(1)}%</span>
                      </div>
                      <div className="h-4 w-full rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${percentUsed}%` }} />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link href={`/contracts/${params.id}/items`}>
                    <Button className="w-full">
                      <Package className="mr-2 h-4 w-4" />
                      Gerenciar Itens e Quantidades
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Todos os documentos relacionados</CardDescription>
            </CardHeader>
            <CardContent>
              {contract.documents && contract.documents.length > 0 ? (
                <div className="space-y-4">
                  {contract.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(doc.date)}
                            <span className="mx-1">•</span>
                            <span className="capitalize">
                              {doc.type === "contract"
                                ? isAgreement
                                  ? "Convênio"
                                  : "Contrato"
                                : doc.type === "attachment"
                                  ? "Anexo"
                                  : doc.type === "amendment"
                                    ? "Aditivo"
                                    : doc.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum documento registrado para este {isAgreement ? "convênio" : "contrato"}.</p>
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
                Histórico de alterações no {isAgreement ? "convênio" : "contrato"} original
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contract.amendments && contract.amendments.length > 0 ? (
                <div className="space-y-6">
                  {contract.amendments.map((amendment) => (
                    <div key={amendment.id || amendment.number} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Aditivo #{amendment.number}</h3>
                        <Badge variant="outline">{formatDate(amendment.date)}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{amendment.description}</p>
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-2">Alteração de Valor:</span>
                        <Badge variant={amendment.valueChange >= 0 ? "default" : "destructive"}>
                          {amendment.valueChange >= 0 ? "+" : ""}
                          {formatCurrency(amendment.valueChange)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum aditivo foi feito para este {isAgreement ? "convênio" : "contrato"}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

