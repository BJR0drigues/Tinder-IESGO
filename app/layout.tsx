import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets:  ['latin'],
  variable: '--font-outfit',
  display:  'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  variable: '--font-space-grotesk',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'Tinder IESGO',
  description: 'O seu match está na sala ao lado.',
  manifest:    '/manifest.json',
};

export const viewport: Viewport = {
  themeColor:          '#080510',
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  viewportFit:         'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${spaceGrotesk.variable} bg-deep min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
