/**
 * Utilitários para exportação de dados
 */

import type { Contract, ContractItem } from "@/contexts/contract-context"

/**
 * Converte contratos para formato CSV
 */
export function contractsToCSV(contracts: Contract[]): string {
  // Cabeçalho do CSV
  let csv = "ID,Número,Título,Fornecedor,Tipo,Valor Inicial,Valor Restante,Data Início,Data Término,Status\n"

  // Adicionar dados de cada contrato
  contracts.forEach((contract) => {
    const row = [
      contract.id,
      `"${contract.number}"`,
      `"${contract.title.replace(/"/g, '""')}"`,
      `"${contract.supplier.replace(/"/g, '""')}"`,
      `"${contract.type}"`,
      contract.initialValue,
      contract.remainingValue,
      contract.startDate,
      contract.endDate,
      contract.status,
    ]

    csv += row.join(",") + "\n"
  })

  return csv
}

/**
 * Converte itens de contrato para formato CSV
 */
export function contractItemsToCSV(contractId: string, items: ContractItem[]): string {
  // Cabeçalho do CSV
  let csv =
    "ID Contrato,ID Item,Código,Descrição,Unidade,Preço Unitário,Quantidade Inicial,Quantidade Restante,Valor Total,Valor Restante\n"

  // Adicionar dados de cada item
  items.forEach((item) => {
    const row = [
      contractId,
      item.id,
      `"${item.code}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.unit}"`,
      item.unitPrice,
      item.initialQuantity,
      item.remainingQuantity,
      item.totalValue,
      item.remainingValue,
    ]

    csv += row.join(",") + "\n"
  })

  return csv
}

/**
 * Exporta dados para arquivo CSV
 */
export function exportToCSV(data: string, filename: string): void {
  // Criar um objeto Blob com os dados CSV
  const blob = new Blob(["\ufeff" + data], { type: "text/csv;charset=utf-8;" })

  // Criar URL para o Blob
  const url = URL.createObjectURL(blob)

  // Criar um elemento de link para download
  const link = document.createElement("a")
  link.href = url
  link.download = filename

  // Adicionar o link ao documento, clicar nele e removê-lo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar a URL criada
  URL.revokeObjectURL(url)
}

/**
 * Restaura dados de contratos a partir de um arquivo JSON
 */
export function restoreContractsFromJSON(jsonData: string): Contract[] {
  try {
    const contracts = JSON.parse(jsonData) as Contract[]
    return contracts
  } catch (error) {
    console.error("Erro ao analisar dados JSON:", error)
    throw new Error("O arquivo não contém dados de contratos válidos.")
  }
}

