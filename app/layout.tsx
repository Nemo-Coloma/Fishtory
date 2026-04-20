import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
    themeColor: '#0284c7',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export const metadata: Metadata = {
    title: 'Fishtory',
    description: 'Fisheries Data Management System',
    manifest: '/manifest.json',
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
