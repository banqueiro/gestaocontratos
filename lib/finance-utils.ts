/**
 * Utilitários para cálculos financeiros
 */

import type { Contract, Payment, ContractItem } from "@/contexts/contract-context"

/**
 * Calcula o valor total de um contrato, incluindo aditivos
 */
export function calculateTotalValue(contract: Contract): number {
  const initialValue = contract.initialValue || 0
  const amendmentsValue = contract.amendments?.reduce((sum, a) => sum + a.valueChange, 0) || 0
  return initialValue + amendmentsValue
}

/**
 * Calcula o valor utilizado de um contrato
 */
export function calculateUsedValue(contract: Contract): number {
  const initialValue = contract.initialValue || 0
  const remainingValue = contract.remainingValue || 0
  return initialValue - remainingValue
}

/**
 * Calcula o percentual utilizado de um contrato
 */
export function calculatePercentUsed(contract: Contract): number {
  const initialValue = contract.initialValue || 0
  const usedValue = calculateUsedValue(contract)
  return initialValue > 0 ? (usedValue / initialValue) * 100 : 0
}

/**
 * Calcula o valor total dos itens de um contrato
 */
export function calculateItemsTotalValue(items: ContractItem[] = []): number {
  return items.reduce((sum, item) => sum + item.totalValue, 0)
}

/**
 * Calcula o valor restante dos itens de um contrato
 */
export function calculateItemsRemainingValue(items: ContractItem[] = []): number {
  return items.reduce((sum, item) => sum + item.remainingValue, 0)
}

/**
 * Calcula o valor total dos pagamentos de um contrato
 */
export function calculatePaymentsValue(payments: Payment[] = []): number {
  return payments.reduce((sum, payment) => sum + payment.value, 0)
}

