import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Equipment Rental Platform',
  description: 'Enterprise Equipment Management & Booking Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}