import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from './types';

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

/**
 * Cloudflare Access가 붙여주는 JWT(Cf-Access-Jwt-Assertion)를 검증한다.
 * Access 정책이 대시보드에서 빠지거나 잘못 설정돼도 관리자 데이터가 노출되지 않도록 Worker에서 한 번 더 확인.
 */
export const requireAccess: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    c.set('adminEmail', 'dev@localhost');
    return next();
  }

  const token = c.req.header('Cf-Access-Jwt-Assertion');
  if (!token) return c.text('Unauthorized', 401);

  try {
    const issuer = `https://${c.env.ACCESS_TEAM_DOMAIN}`;
    jwks ??= createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(token, jwks, { issuer, audience: c.env.ACCESS_AUD });
    c.set('adminEmail', typeof payload.email === 'string' ? payload.email : '');
  } catch {
    return c.text('Forbidden', 403);
  }
  await next();
};
