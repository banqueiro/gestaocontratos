"use client"

import { useEffect } from "react"
import { useContracts } from "@/contexts/contract-context"

/**
 * Hook para monitorar alterações nos contratos e atualizar o estado local
 */
export function useContractUpdates(contractId: string, callback: () => void) {
  const { contracts } = useContracts()

  useEffect(() => {
    // Quando os contratos mudarem, execute o callback
    callback()
  }, [contracts, callback])

  return null
}

