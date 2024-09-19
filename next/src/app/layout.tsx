import './globals.css';
import { AppProvider } from '../context/context'; // コンテキストファイルのパスに応じて変更
import { ReactNode } from 'react';

export const metadata = {
  title: 'Speaker final diarization',
  description: 'Created for Competitive Debaters',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}