import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Fishtory',
    description: 'Fisheries Data Management System',
    manifest: '/manifest.json',
    themeColor: '#0284c7',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Fishtory',
    },
    formatDetection: {
        telephone: false,
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    )
}
