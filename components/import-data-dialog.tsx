"use client"

import type React from "react"

import { useState } from "react"
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react"

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
import { restoreContractsFromJSON } from "@/lib/export-utils"

export function ImportDataDialog() {
  const { toast } = useToast()
  const { contracts, addContract } = useContracts()
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge")
  const [previewData, setPreviewData] = useState<{
    totalContracts: number
    newContracts: number
    existingContracts: number
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    setPreviewData(null)

    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string
          const importedContracts = restoreContractsFromJSON(jsonData)

          // Identificar contratos novos e existentes
          const existingIds = new Set(contracts.map((c) => c.id))
          const newContracts = importedContracts.filter((c) => !existingIds.has(c.id))

          setPreviewData({
            totalContracts: importedContracts.length,
            newContracts: newContracts.length,
            existingContracts: importedContracts.length - newContracts.length,
          })
        } catch (error) {
          console.error("Erro ao analisar arquivo:", error)
          toast({
            title: "Arquivo inválido",
            description: "O arquivo selecionado não contém dados de contratos válidos.",
            variant: "destructive",
          })
          setSelectedFile(null)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImport = () => {
    if (!selectedFile) return

    setIsImporting(true)

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string
          const importedContracts = restoreContractsFromJSON(jsonData)

          if (importMode === "replace") {
            // Substituir todos os contratos existentes
            localStorage.setItem("contracts", jsonData)
            window.location.reload() // Recarregar a página para atualizar os dados
          } else {
            // Modo de mesclagem: adicionar apenas contratos novos
            const existingIds = new Set(contracts.map((c) => c.id))
            const newContracts = importedContracts.filter((c) => !existingIds.has(c.id))

            // Adicionar cada novo contrato
            newContracts.forEach((contract) => {
              addContract({
                ...contract,
                id: undefined, // Remover ID para gerar um novo
              })
            })

            toast({
              title: "Importação concluída",
              description: `${newContracts.length} novos contratos foram importados com sucesso.`,
            })

            setIsOpen(false)
          }
        } catch (error) {
          console.error("Erro ao importar dados:", error)
          toast({
            title: "Erro na importação",
            description: "Ocorreu um erro ao importar os dados. Verifique o formato do arquivo.",
            variant: "destructive",
          })
        } finally {
          setIsImporting(false)
        }
      }
      reader.readAsText(selectedFile)
    } catch (error) {
      console.error("Erro ao ler arquivo:", error)
      toast({
        title: "Erro ao ler arquivo",
        description: "Não foi possível ler o arquivo selecionado.",
        variant: "destructive",
      })
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Upload className="h-4 w-4" />
          Importar Backup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Dados de Backup</DialogTitle>
          <DialogDescription>Restaure seus contratos a partir de um arquivo de backup JSON.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <input type="file" id="backup-file" accept=".json" className="hidden" onChange={handleFileChange} />
            <Button
              variant="outline"
              onClick={() => document.getElementById("backup-file")?.click()}
              disabled={isImporting}
            >
              Selecionar Arquivo
            </Button>
            <span className="text-sm text-muted-foreground">
              {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
            </span>
          </div>

          {previewData && (
            <div className="rounded-md bg-muted p-4">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium">Resumo do arquivo</h4>
                  <ul className="mt-1 text-sm text-muted-foreground space-y-1">
                    <li>Total de contratos: {previewData.totalContracts}</li>
                    <li>Contratos novos: {previewData.newContracts}</li>
                    <li>Contratos existentes: {previewData.existingContracts}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Modo de importação</h4>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === "merge"}
                  onChange={() => setImportMode("merge")}
                  className="h-4 w-4"
                />
                <span>Mesclar (adicionar apenas novos contratos)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                  className="h-4 w-4"
                />
                <span>Substituir (apagar todos os contratos atuais)</span>
              </label>
            </div>
          </div>

          {importMode === "replace" && (
            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-amber-800">Atenção</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    O modo de substituição irá apagar todos os contratos existentes e substituí-los pelos do arquivo de
                    backup. Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            variant={importMode === "replace" ? "destructive" : "default"}
          >
            {isImporting ? "Importando..." : "Importar Dados"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

