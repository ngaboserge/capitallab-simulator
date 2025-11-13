import { SimpleAuthProvider } from '@/lib/auth/simple-auth-context';

export default function TestDocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SimpleAuthProvider>{children}</SimpleAuthProvider>;
}
