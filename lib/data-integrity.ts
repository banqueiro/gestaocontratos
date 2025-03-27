import type { Contract } from "@/contexts/contract-context"

/**
 * Verifica e corrige inconsistências nos dados de um contrato
 */
export function validateContractData(contract: Contract): Contract {
  // Garantir que todos os arrays existam
  const items = contract.items || []
  const amendments = contract.amendments || []
  const payments = contract.payments || []
  const documents = contract.documents || []

  // Calcular o valor total dos itens
  const itemsTotalValue = items.reduce((sum, item) => sum + item.totalValue, 0)

  // Calcular o valor restante dos itens
  const itemsRemainingValue = items.reduce((sum, item) => sum + item.remainingValue, 0)

  // Calcular o valor dos aditivos
  const amendmentsValue = amendments.reduce((sum, a) => sum + a.valueChange, 0)

  // Calcular o valor total correto
  const correctInitialValue = contract.initialValue || 0

  // Calcular o valor restante correto
  // Se não houver itens, o valor restante é o valor inicial + aditivos - pagamentos
  const paymentsValue = payments.reduce((sum, p) => sum + p.value, 0)

  let correctRemainingValue = correctInitialValue + amendmentsValue - paymentsValue

  // Se houver itens, o valor restante deve ser a soma dos valores restantes dos itens
  if (items.length > 0) {
    correctRemainingValue = itemsRemainingValue
  }

  // Retornar o contrato corrigido
  return {
    ...contract,
    items,
    amendments,
    payments,
    documents,
    remainingValue: correctRemainingValue,
  }
}

/**
 * Verifica e corrige inconsistências nos dados de todos os contratos
 */
export function validateAllContractsData(contracts: Contract[]): Contract[] {
  return contracts.map(validateContractData)
}

