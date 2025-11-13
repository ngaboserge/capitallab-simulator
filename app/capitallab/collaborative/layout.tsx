import { SimpleAuthProvider } from '@/lib/auth/simple-auth-context';

export default function CollaborativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SimpleAuthProvider>
      {children}
    </SimpleAuthProvider>
  );
}