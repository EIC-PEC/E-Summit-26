import type { Metadata } from 'next';
import { Rajdhani } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PEC E-Summit 2026 | Operations Hub',
  description: 'Operations Portal, Delegate Registry & CMS for PEC E-Summit 2026',
  icons: {
    icon: '/eic-logo.png',
    shortcut: '/eic-logo.png',
    apple: '/eic-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full ${rajdhani.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('esummit_admin_theme') || 'dark';
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-emerald-500 selection:text-black">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
