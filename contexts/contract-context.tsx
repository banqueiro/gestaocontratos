"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipos para os contratos e itens relacionados
export type ContractStatus = "active" | "expiring" | "completed" | "draft"
export type ContractType =
  // Modalidades da Lei 14133/2021
  | "electronic-auction"
  | "in-person-auction"
  | "competition"
  | "contest"
  | "bidding"
  | "competitive-dialogue"
  // Contratações diretas
  | "price-registration"
  | "electronic-waiver"
  | "in-person-waiver"
  | "non-enforceability"
  // Convênios e outros
  | "agreement"
  | "cooperation-agreement"
  | "transfer-agreement"

export interface Contract {
  id: string
  number: string
  title: string
  supplier: string
  supplierDocument?: string
  supplierContact?: string
  supplierEmail?: string
  supplierPhone?: string
  type: ContractType
  initialValue: number
  remainingValue: number
  startDate: string
  endDate: string
  status: ContractStatus
  description?: string
  legalBasis?: string
  bidNumber?: string
  amendments?: Amendment[]
  payments?: Payment[]
  documents?: Document[]
  items?: ContractItem[]
}

export interface ContractItem {
  id: string
  code: string
  description: string
  unit: string
  unitPrice: number
  initialQuantity: number
  remainingQuantity: number
  totalValue: number
  remainingValue: number
}

export interface Amendment {
  id?: string
  number: string
  date: string
  description: string
  valueChange: number
  items?: ContractItem[]
}

export interface Payment {
  id: string
  date: string
  value: number
  invoice: string
  description: string
}

export interface Document {
  id: string
  name: string
  date: string
  type: string
}

export interface UsageRecord {
  id: string
  date: string
  itemId: string
  itemCode: string
  description: string
  quantity: number
  value: number
  document: string
}

// Dados iniciais de exemplo
const initialContracts = [
  {
    id: "1",
    number: "2023/001",
    title: "Manutenção de Infraestrutura de TI",
    supplier: "TechCorp Soluções",
    supplierDocument: "12.345.678/0001-90",
    supplierContact: "João Silva",
    supplierEmail: "joao.silva@techcorp.com",
    supplierPhone: "+55 11 98765-4321",
    type: "electronic-auction" as ContractType,
    initialValue: 120000,
    remainingValue: 85000,
    startDate: "2023-03-15",
    endDate: "2024-03-14",
    status: "active" as ContractStatus,
    description:
      "Serviços de manutenção e suporte para a infraestrutura de TI da empresa, incluindo servidores, equipamentos de rede e estações de trabalho.",
    legalBasis: "Art. 6, Lei 14133/2021",
    bidNumber: "PE-001/2023",
    amendments: [
      {
        id: "a1",
        number: "1",
        date: "2023-06-15",
        description: "Extensão do escopo de serviço para incluir infraestrutura em nuvem",
        valueChange: 20000,
      },
    ],
    payments: [
      {
        id: "p1",
        date: "2023-04-15",
        value: 10000,
        invoice: "NF-001",
        description: "Serviço mensal - Março 2023",
      },
      {
        id: "p2",
        date: "2023-05-15",
        value: 10000,
        invoice: "NF-002",
        description: "Serviço mensal - Abril 2023",
      },
      {
        id: "p3",
        date: "2023-06-15",
        value: 15000,
        invoice: "NF-003",
        description: "Serviço mensal - Maio 2023 + Serviços adicionais",
      },
    ],
    documents: [
      {
        id: "d1",
        name: "Contrato Original",
        date: "2023-03-15",
        type: "contract",
      },
      {
        id: "d2",
        name: "Especificações Técnicas",
        date: "2023-03-15",
        type: "attachment",
      },
      {
        id: "d3",
        name: "Aditivo 1",
        date: "2023-06-15",
        type: "amendment",
      },
    ],
    items: [
      {
        id: "1",
        code: "IT001",
        description: "Serviço de manutenção de servidores",
        unit: "Hora",
        unitPrice: 120,
        initialQuantity: 500,
        remainingQuantity: 320,
        totalValue: 60000,
        remainingValue: 38400,
      },
      {
        id: "2",
        code: "IT002",
        description: "Licença de software antivírus",
        unit: "Unidade",
        unitPrice: 150,
        initialQuantity: 100,
        remainingQuantity: 65,
        totalValue: 15000,
        remainingValue: 9750,
      },
      {
        id: "3",
        code: "IT003",
        description: "Suporte técnico remoto",
        unit: "Hora",
        unitPrice: 90,
        initialQuantity: 300,
        remainingQuantity: 210,
        totalValue: 27000,
        remainingValue: 18900,
      },
      {
        id: "4",
        code: "IT004",
        description: "Manutenção de equipamentos de rede",
        unit: "Serviço",
        unitPrice: 450,
        initialQuantity: 40,
        remainingQuantity: 28,
        totalValue: 18000,
        remainingValue: 12600,
      },
    ],
  },
  {
    id: "2",
    number: "2023/002",
    title: "Material de Escritório",
    supplier: "Office Plus Ltda",
    type: "price-registration" as ContractType,
    initialValue: 45000,
    remainingValue: 12000,
    startDate: "2023-04-01",
    endDate: "2024-03-31",
    status: "active" as ContractStatus,
    items: [],
    amendments: [],
    payments: [],
    documents: [],
  },
  {
    id: "3",
    number: "2023/003",
    title: "Serviços de Consultoria Jurídica",
    supplier: "Especialistas Jurídicos Associados",
    type: "non-enforceability" as ContractType,
    initialValue: 75000,
    remainingValue: 35000,
    startDate: "2023-01-10",
    endDate: "2023-12-31",
    status: "expiring" as ContractStatus,
    items: [],
    amendments: [],
    payments: [],
    documents: [],
  },
  {
    id: "4",
    number: "2022/015",
    title: "Serviços de Limpeza",
    supplier: "CleanPro Serviços",
    type: "electronic-waiver" as ContractType,
    initialValue: 30000,
    remainingValue: 0,
    startDate: "2022-06-01",
    endDate: "2023-05-31",
    status: "completed" as ContractStatus,
    items: [],
    amendments: [],
    payments: [],
    documents: [],
  },
  {
    id: "5",
    number: "2023/004",
    title: "Licenças de Software",
    supplier: "SoftTech Inc",
    type: "electronic-auction" as ContractType,
    initialValue: 200000,
    remainingValue: 200000,
    startDate: "2023-06-15",
    endDate: "2025-06-14",
    status: "active" as ContractStatus,
    items: [],
    amendments: [],
    payments: [],
    documents: [],
  },
  {
    id: "6",
    number: "2023/005",
    title: "Convênio para Capacitação de Servidores",
    supplier: "Universidade Federal do Paraná",
    type: "agreement" as ContractType,
    initialValue: 150000,
    remainingValue: 150000,
    startDate: "2023-07-01",
    endDate: "2024-06-30",
    status: "active" as ContractStatus,
    description: "Convênio para capacitação e treinamento de servidores da Assembleia Legislativa do Paraná.",
    legalBasis: "Art. 84, Lei 14133/2021",
    items: [],
    amendments: [],
    payments: [],
    documents: [],
  },
  {
    id: "7",
    number: "2023/006",
    title: "Acordo de Cooperação Técnica",
    supplier: "Tribunal de Contas do Estado do Paraná",
    type: "cooperation-agreement" as ContractType,
    initialValue: 0, // Sem repasse financeiro
    remainingValue: 0,
    startDate: "2023-05-15",
    endDate: "2025-05-14",
    status: "active" as ContractStatus,
    description: "Acordo de cooperação técnica para intercâmbio de informações e tecnologias entre as instituições.",
    legalBasis: "Art. 84, Lei 14133/2021",
    items: [],
    amendments: [],
    payments: [],
    documents: [],
  },
]

// Interface do contexto
interface ContractContextType {
  contracts: Contract[]
  addContract: (contract: Omit<Contract, "id">) => void
  getContract: (id: string) => Contract | undefined
  updateContract: (id: string, contract: Partial<Contract>) => void
  deleteContract: (id: string) => void
  addContractItem: (contractId: string, item: Omit<ContractItem, "id">) => void
  updateContractItem: (contractId: string, itemId: string, updates: Partial<ContractItem>) => void
  registerItemUsage: (contractId: string, itemId: string, usage: Omit<UsageRecord, "id">) => void
  addAmendment: (contractId: string, amendment: Omit<Amendment, "id">) => void
  addPayment: (contractId: string, payment: Omit<Payment, "id">) => void
}

// Criação do contexto
const ContractContext = createContext<ContractContextType | undefined>(undefined)

// Hook para usar o contexto
export function useContracts() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error("useContracts deve ser usado dentro de um ContractProvider")
  }
  return context
}

// Provider do contexto
export function ContractProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([])

  // Carregar contratos do localStorage na inicialização
  useEffect(() => {
    try {
      const storedContracts = localStorage.getItem("contracts")
      if (storedContracts) {
        setContracts(JSON.parse(storedContracts))
      } else {
        // Se não houver contratos no localStorage, usar os dados iniciais
        setContracts(initialContracts)
        localStorage.setItem("contracts", JSON.stringify(initialContracts))
      }
    } catch (error) {
      console.error("Erro ao carregar contratos do localStorage:", error)
      // Em caso de erro, usar os dados iniciais
      setContracts(initialContracts)
    }
  }, [])

  // Salvar contratos no localStorage quando houver alterações
  useEffect(() => {
    if (contracts.length > 0) {
      try {
        localStorage.setItem("contracts", JSON.stringify(contracts))
      } catch (error) {
        console.error("Erro ao salvar contratos no localStorage:", error)
      }
    }
  }, [contracts])

  // Adicionar um novo contrato
  const addContract = (contract: Omit<Contract, "id">) => {
    const newContract = {
      ...contract,
      id: `${Date.now()}`, // Gerar um ID único baseado no timestamp
      items: contract.items || [],
      amendments: contract.amendments || [],
      payments: contract.payments || [],
      documents: contract.documents || [],
      // Garantir que o valor restante seja igual ao valor inicial
      remainingValue: contract.initialValue,
    }
    setContracts((prevContracts) => [...prevContracts, newContract as Contract])
  }

  // Obter um contrato específico pelo ID
  const getContract = (id: string) => {
    return contracts.find((contract) => contract.id === id)
  }

  // Atualizar um contrato existente
  const updateContract = (id: string, updatedData: Partial<Contract>) => {
    setContracts((prevContracts) =>
      prevContracts.map((contract) => {
        if (contract.id === id) {
          // Preservar arrays existentes se não forem fornecidos na atualização
          const items = updatedData.items !== undefined ? updatedData.items : contract.items
          const amendments = updatedData.amendments !== undefined ? updatedData.amendments : contract.amendments
          const payments = updatedData.payments !== undefined ? updatedData.payments : contract.payments
          const documents = updatedData.documents !== undefined ? updatedData.documents : contract.documents

          // Calcular o valor restante se o valor inicial for atualizado
          let remainingValue = updatedData.remainingValue
          if (updatedData.initialValue !== undefined && remainingValue === undefined) {
            // Calcular a diferença entre o valor inicial antigo e o novo
            const valueDifference = updatedData.initialValue - contract.initialValue
            // Ajustar o valor restante proporcionalmente
            remainingValue = contract.remainingValue + valueDifference
          }

          return {
            ...contract,
            ...updatedData,
            items,
            amendments,
            payments,
            documents,
            remainingValue: remainingValue !== undefined ? remainingValue : contract.remainingValue,
          }
        }
        return contract
      }),
    )
  }

  // Excluir um contrato
  const deleteContract = (id: string) => {
    setContracts((prevContracts) => prevContracts.filter((contract) => contract.id !== id))
  }

  // Adicionar um item a um contrato
  const addContractItem = (contractId: string, item: Omit<ContractItem, "id">) => {
    const newItem = {
      ...item,
      id: `${Date.now()}`, // Gerar um ID único baseado no timestamp
    }

    setContracts((prevContracts) =>
      prevContracts.map((contract) => {
        if (contract.id === contractId) {
          const items = contract.items || []
          // Atualizar o valor restante do contrato
          const newRemainingValue = contract.remainingValue + newItem.totalValue

          return {
            ...contract,
            items: [...items, newItem as ContractItem],
            remainingValue: newRemainingValue,
          }
        }
        return contract
      }),
    )
  }

  // Atualizar um item de um contrato
  const updateContractItem = (contractId: string, itemId: string, updates: Partial<ContractItem>) => {
    let contractRemainingValueDiff = 0

    setContracts((prevContracts) =>
      prevContracts.map((contract) => {
        if (contract.id === contractId && contract.items) {
          const updatedItems = contract.items.map((item) => {
            if (item.id === itemId) {
              // Calcular a diferença no valor restante do item
              if (updates.remainingValue !== undefined) {
                contractRemainingValueDiff = updates.remainingValue - item.remainingValue
              }
              return { ...item, ...updates }
            }
            return item
          })

          // Atualizar o valor restante do contrato
          return {
            ...contract,
            items: updatedItems,
            remainingValue: contract.remainingValue + contractRemainingValueDiff,
          }
        }
        return contract
      }),
    )
  }

  // Registrar o uso de um item
  const registerItemUsage = (contractId: string, itemId: string, usage: Omit<UsageRecord, "id">) => {
    const contract = getContract(contractId)
    if (!contract || !contract.items) return

    const item = contract.items.find((i) => i.id === itemId)
    if (!item) return

    const quantity = Number(usage.quantity)
    const value = quantity * item.unitPrice

    // Atualizar o saldo do item
    updateContractItem(contractId, itemId, {
      remainingQuantity: item.remainingQuantity - quantity,
      remainingValue: item.remainingValue - value,
    })

    // Atualizar o saldo do contrato diretamente
    const updatedContract = getContract(contractId)
    if (updatedContract) {
      updateContract(contractId, {
        remainingValue: updatedContract.remainingValue - value,
      })
    }

    // Adicionar um pagamento automaticamente
    addPayment(contractId, {
      date: usage.date,
      value: value,
      invoice: usage.document,
      description: usage.description,
    })
  }

  // Adicionar um aditivo ao contrato
  const addAmendment = (contractId: string, amendment: Omit<Amendment, "id">) => {
    const contract = getContract(contractId)
    if (!contract) return

    const newAmendment = {
      ...amendment,
      id: `a${Date.now()}`,
    }

    // Calcular o novo valor inicial e restante
    const newInitialValue = contract.initialValue + amendment.valueChange
    const newRemainingValue = contract.remainingValue + amendment.valueChange

    // Adicionar o aditivo ao contrato
    updateContract(contractId, {
      amendments: [...(contract.amendments || []), newAmendment as Amendment],
      initialValue: newInitialValue,
      remainingValue: newRemainingValue,
    })

    // Se o aditivo incluir novos itens, adicioná-los ao contrato
    if (amendment.items && amendment.items.length > 0) {
      amendment.items.forEach((item) => {
        addContractItem(contract.id, item)
      })
    }

    // Adicionar um documento para o aditivo
    const newDocument = {
      id: `d${Date.now()}`,
      name: `Aditivo #${amendment.number}`,
      date: amendment.date,
      type: "amendment",
    }

    const updatedContract = getContract(contractId)
    if (updatedContract) {
      updateContract(contractId, {
        documents: [...(updatedContract.documents || []), newDocument],
      })
    }
  }

  // Adicionar um pagamento ao contrato
  const addPayment = (contractId: string, payment: Omit<Payment, "id">) => {
    const contract = getContract(contractId)
    if (!contract) return

    const newPayment = {
      ...payment,
      id: `p${Date.now()}`,
    }

    // Adicionar o pagamento ao contrato
    updateContract(contractId, {
      payments: [...(contract.payments || []), newPayment as Payment],
    })
  }

  return (
    <ContractContext.Provider
      value={{
        contracts,
        addContract,
        getContract,
        updateContract,
        deleteContract,
        addContractItem,
        updateContractItem,
        registerItemUsage,
        addAmendment,
        addPayment,
      }}
    >
      {children}
    </ContractContext.Provider>
  )
}

