import { Hono } from 'hono';
import { requireAccess } from './access';
import { verifyTurnstile } from './turnstile';
import { parseInquiry, parsePatch } from './validation';
import {
  COLOR_LABELS,
  PRODUCT_LABELS,
  STATUS_LABELS,
  type AppEnv,
  type Env,
  type InquiryRow,
} from './types';

const app = new Hono<AppEnv>();

// ── 공개 API ────────────────────────────────────────────────

app.post('/api/inquiries', async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => null);
  if (!body) return c.json({ error: '잘못된 요청입니다.' }, 400);

  const token = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  const human = token && (await verifyTurnstile(token, c.env.TURNSTILE_SECRET, c.req.header('CF-Connecting-IP')));
  if (!human) return c.json({ error: '자동 입력 방지 확인에 실패했습니다. 다시 시도해 주세요.' }, 400);

  const parsed = parseInquiry(body);
  if (!parsed.ok) return c.json({ error: parsed.error }, 400);
  const v = parsed.value;

  const row = await c.env.DB.prepare(
    `INSERT INTO inquiries (source, company, person, phone, product, colors, qty, region, message, consent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     RETURNING id`,
  )
    .bind(v.source, v.company, v.person, v.phone, v.product, v.colors, v.qty, v.region, v.message)
    .first<{ id: number }>();

  return c.json({ id: row?.id }, 201);
});

// ── 관리자 API (Cloudflare Access) ──────────────────────────

const admin = new Hono<AppEnv>();
admin.use('*', requireAccess);

admin.get('/me', (c) => c.json({ email: c.get('adminEmail') }));

admin.get('/inquiries', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 1000').all<InquiryRow>();
  return c.json({ inquiries: results });
});

admin.patch('/inquiries/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (!Number.isInteger(id)) return c.json({ error: 'invalid id' }, 400);

  const body = await c.req.json<Record<string, unknown>>().catch(() => null);
  const parsed = body && parsePatch(body);
  if (!parsed || !parsed.ok) return c.json({ error: parsed?.error ?? 'invalid body' }, 400);

  const { status, note } = parsed.value;
  const row = await c.env.DB.prepare(
    `UPDATE inquiries
        SET status = COALESCE(?1, status),
            note = CASE WHEN ?2 THEN ?3 ELSE note END,
            updated_at = datetime('now')
      WHERE id = ?4
      RETURNING *`,
  )
    .bind(status ?? null, note !== undefined ? 1 : 0, note ?? null, id)
    .first<InquiryRow>();

  if (!row) return c.json({ error: 'not found' }, 404);
  return c.json({ inquiry: row });
});

admin.get('/inquiries.csv', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all<InquiryRow>();
  const header = ['접수일시(UTC)', '업체명', '담당자', '연락처', '제품', '컬러', '수량', '지역', '요청사항', '상태', '메모'];
  const lines = results.map((r) =>
    [
      r.created_at,
      r.company,
      r.person,
      r.phone,
      PRODUCT_LABELS[r.product],
      r.colors?.split(',').map((x) => COLOR_LABELS[x as keyof typeof COLOR_LABELS] ?? x).join('·'),
      r.qty,
      r.region,
      r.message,
      STATUS_LABELS[r.status],
      r.note,
    ].map(csvCell).join(','),
  );
  // BOM: 엑셀에서 한글이 깨지지 않도록
  const csv = '﻿' + [header.join(','), ...lines].join('\r\n');
  const date = new Date().toISOString().slice(0, 10);
  return c.body(csv, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="inquiries-${date}.csv"`,
  });
});

app.route('/api/admin', admin);

// 관리자 정적 페이지도 같은 인증을 거친 뒤 서빙
app.use('/admin', requireAccess);
app.use('/admin/*', requireAccess);
app.get('/admin', (c) => c.env.ASSETS.fetch(c.req.raw));
app.get('/admin/*', (c) => c.env.ASSETS.fetch(c.req.raw));

app.notFound((c) => c.json({ error: 'not found' }, 404));

function csvCell(v: string | null | undefined): string {
  const s = v ?? '';
  // 엑셀 수식 주입 방지
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export default {
  fetch: app.fetch,

  // 개인정보 보유기간(문의일로부터 1년) 경과분 파기
  async scheduled(_event: ScheduledController, env: Env) {
    await env.DB.prepare("DELETE FROM inquiries WHERE created_at < datetime('now', '-1 year')").run();
  },
} satisfies ExportedHandler<Env>;
