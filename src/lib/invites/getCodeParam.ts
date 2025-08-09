export function getCodeFromSearchParams(url: string): string | null {
  const sp = new URL(url).searchParams;
  // Prefer canonical 'code', but accept 'inviteCode' for legacy callers
  const code = sp.get('code') || sp.get('inviteCode');
  if (sp.get('inviteCode') && !sp.get('code')) {
    // eslint-disable-next-line no-console
    console.warn('[INVITE] legacy query param inviteCode used');
  }
  return code ? code.trim() : null;
}

export async function getCodeFromJson(req: Request): Promise<{ code: string | null; legacyKeyUsed: boolean }> {
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const code = (body?.code ?? body?.inviteCode ?? '').toString().trim();
  const legacyKeyUsed = !!(!body?.code && body?.inviteCode);
  if (legacyKeyUsed) {
    // eslint-disable-next-line no-console
    console.warn('[INVITE] legacy JSON key inviteCode used');
  }
  return { code: code || null, legacyKeyUsed };
}
