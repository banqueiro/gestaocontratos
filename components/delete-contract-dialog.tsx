"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useContracts } from "@/contexts/contract-context"

interface DeleteContractDialogProps {
  contractId: string
  contractNumber: string
  contractTitle: string
  variant?: "button" | "menuItem"
  onDeleted?: () => void
}

export function DeleteContractDialog({
  contractId,
  contractNumber,
  contractTitle,
  variant = "button",
  onDeleted,
}: DeleteContractDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { deleteContract } = useContracts()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      deleteContract(contractId)

      toast({
        title: "Contrato excluído",
        description: "O contrato foi excluído com sucesso.",
      })

      setIsOpen(false)

      if (onDeleted) {
        onDeleted()
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Erro ao excluir contrato:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o contrato. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "button" ? (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Contrato
          </Button>
        ) : (
          <div className="flex items-center text-destructive cursor-pointer px-2 py-1.5 text-sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Contrato
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Contrato</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o contrato #{contractNumber} - {contractTitle}? Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Excluindo..." : "Excluir Contrato"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

