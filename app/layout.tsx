import type {Metadata} from 'next';
import { Nunito } from 'next/font/google';
import './globals.css'; // Global styles

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Super SudoKids',
  description: 'A fun and easy Sudoku game for kids!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-nunito bg-slate-50 text-slate-900" suppressHydrationWarning>{children}</body>
    </html>
  );
}
