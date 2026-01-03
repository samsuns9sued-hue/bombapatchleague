// app/layout.tsx
import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Bomba Patch League',
  description: 'Sistema de Gerenciamento de Liga'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="text-white">
        <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-green-400">
                ⚽ Bomba Patch League
              </Link>
              <div className="flex gap-6">
                <Link href="/" className="hover:text-green-400 transition">Ranking</Link>
                <Link href="/torneios" className="hover:text-green-400 transition">Torneios</Link>
                <Link href="/confronto" className="hover:text-green-400 transition">Confronto</Link>
                <Link href="/admin" className="hover:text-yellow-400 transition">⚙️ Admin</Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}