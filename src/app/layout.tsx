import type { Metadata } from 'next';
import './globals.css';
import '@/app/styles/main.scss';
import Providers from './providers';
export const metadata: Metadata = {
  title: 'ShopHub',
  description: 'This is an E-commerce Platform for purchase clothes, jewelery and electronics',
};

export default async function RootLayout({
  children,
  // params,
}: {
  children: React.ReactNode;
  // params: Promise<{ team: string }>;
}) {
  // const { team } = await params;
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
