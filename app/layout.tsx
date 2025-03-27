import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ContractProvider } from "@/contexts/contract-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gestão de Contratos - Lei 14133/2021",
  description: "Sistema de gestão de contratos em conformidade com a Lei 14133/2021",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ContractProvider>
            {children}
            <Toaster />
          </ContractProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'