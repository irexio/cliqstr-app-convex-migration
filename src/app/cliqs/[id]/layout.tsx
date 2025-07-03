/**
 * 🔐 APA-SAFE LAYOUT: /cliqs/[id]/layout.tsx
 * 
 * Fix: Forces params to match Next.js 15.3+ async signature
 */

export default async function CliqLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await params; // required for type sanity — can be destructured if needed
  return <>{children}</>;
}
