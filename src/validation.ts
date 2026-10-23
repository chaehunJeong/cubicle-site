import { COLORS, PRODUCTS, REGIONS, STATUSES, type Product, type Status } from './types';

export interface InquiryInput {
  source: 'main' | 'product';
  company: string;
  person: string | null;
  phone: string;
  product: Product;
  colors: string | null;
  qty: string | null;
  region: string | null;
  message: string | null;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const PHONE_RE = /^[0-9+\-() ]{8,20}$/;

function str(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

function includes<T extends string>(list: readonly T[], v: unknown): v is T {
  return typeof v === 'string' && (list as readonly string[]).includes(v);
}

export function parseInquiry(body: Record<string, unknown>): Result<InquiryInput> {
  const company = str(body.company, 100);
  if (!company) return { ok: false, error: '업체명을 입력해 주세요.' };

  const phone = str(body.phone, 20);
  if (!phone || !PHONE_RE.test(phone)) return { ok: false, error: '연락처 형식을 확인해 주세요.' };

  if (!includes(PRODUCTS, body.product)) return { ok: false, error: '제품을 선택해 주세요.' };

  if (body.consent !== true) return { ok: false, error: '개인정보 수집·이용에 동의해 주세요.' };

  const rawColors = Array.isArray(body.colors) ? body.colors : [];
  const colors = rawColors.filter((c) => includes(COLORS, c));
  const region = includes(REGIONS, body.region) ? body.region : null;

  return {
    ok: true,
    value: {
      source: body.source === 'product' ? 'product' : 'main',
      company,
      person: str(body.person, 50),
      phone,
      product: body.product,
      colors: colors.length ? [...new Set(colors)].join(',') : null,
      qty: str(body.qty, 30),
      region,
      message: str(body.message, 2000),
    },
  };
}

export function parsePatch(body: Record<string, unknown>): Result<{ status?: Status; note?: string | null }> {
  const out: { status?: Status; note?: string | null } = {};
  if ('status' in body) {
    if (!includes(STATUSES, body.status)) return { ok: false, error: 'invalid status' };
    out.status = body.status;
  }
  if ('note' in body) out.note = str(body.note, 1000);
  if (!Object.keys(out).length) return { ok: false, error: 'nothing to update' };
  return { ok: true, value: out };
}
