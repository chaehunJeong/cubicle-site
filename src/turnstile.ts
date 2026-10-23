const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string, secret: string, ip?: string | null): Promise<boolean> {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  const res = await fetch(VERIFY_URL, { method: 'POST', body });
  if (!res.ok) return false;
  const data = await res.json<{ success: boolean }>();
  return data.success === true;
}
