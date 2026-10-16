import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Notes - Minimal Note Taking',
    description: 'A modular, high-performance note-taking application.',
    openGraph: {
        title: 'Notes - Minimal Note Taking',
        description: 'A modular, high-performance note-taking application.',
        url: 'https://your-app-url.com',
        siteName: 'Notes App',
        images: [
            {
                url: 'https://your-app-url.com/og-image.png',
                width: 800,
                height: 600,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50 text-gray-900">
                    {children}
                </div>
            </body>
        </html>
    );
}
