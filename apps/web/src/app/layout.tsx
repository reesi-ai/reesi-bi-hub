import type { Metadata } from 'next';
import { IBM_Plex_Sans, Crimson_Pro } from 'next/font/google';
import './globals.css';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-crimson-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Reesi BI Hub',
  description: 'Analytics & customer-report platform for Reesi',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${crimsonPro.variable}`}>
      <body>{children}</body>
    </html>
  );
}
