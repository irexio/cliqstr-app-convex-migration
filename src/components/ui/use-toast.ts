// Minimal stub for use-toast to fix build errors. Replace with full implementation if needed.
export function toast({ title, description }: { title: string; description?: string }) {
  // No-op stub: In production, replace with a real toast mechanism.
  if (typeof window !== 'undefined') {
    window.alert(title + (description ? `\n${description}` : ''));
  }
}

export default toast;
