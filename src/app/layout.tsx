import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import ClerkUserSync from '@/components/ClerkUserSync'
import InitializeUSer from '@/components/InitializeUser'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <ClerkUserSync/>
        <InitializeUSer/>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}