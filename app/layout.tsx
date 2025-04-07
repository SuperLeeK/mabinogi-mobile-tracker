import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper"

export const metadata = {
  title: "일일 미션 트래커",
  description: "매일 해야 할 일을 추적하는 앱",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProviderWrapper>{children}</AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}

