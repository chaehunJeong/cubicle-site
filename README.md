# cubicle-site

컬러 화장실 큐비클 B2B 견적 수집 사이트. 고객이 견적 문의를 남기면(온라인 결제 없음) 담당자가 관리자 화면에서 제품별로 관리합니다.

## 시안 출처

`design/`에 있는 시안 3개(상위 폴더에서 복사)가 원본입니다.

| 시안 | 구현 | 역할 |
|---|---|---|
| `Main.dc.html` | `public/index.html` | 랜딩: 히어로, 특징, 컬러 옵션, 제품 카드, 5단계 납품 절차, 납품 대상, 빠른 견적 폼 |
| `Product.dc.html` | `public/product.html` + `assets/product.js` | 제품 상세: 컬러 선택 미리보기, 스펙, 상세 견적 폼. 템플릿 하나로 `?id=cubicle\|lock\|bell\|set` 4개 제품을 모두 처리 |
| `Admin.dc.html` | `public/admin/` | 제품별 문의 건수·신규 배지, 상태 필터, 표, CSV 다운로드. 상태와 메모는 표에서 바로 수정 |

시안은 디자인 툴 안에서만 동작합니다(`x-dc`, `DCLogic`, `support.js`에 의존). 이 프로젝트는 시안을 순수 HTML/CSS/바닐라 JS로 다시 작성했고, 인라인 스타일은 `assets/styles.css`의 CSS 변수와 클래스로 옮겼습니다.

## 아키텍처

```
브라우저 ──▶ Cloudflare Worker (src/index.ts, Hono)
             ├─ 정적 파일 public/**              (Workers Static Assets)
             ├─ POST /api/inquiries              Turnstile 검증 → 입력 검증 → D1에 INSERT
             ├─ /admin, /api/admin/**            Cloudflare Access JWT 검증
             │    GET   /api/admin/inquiries
             │    PATCH /api/admin/inquiries/:id (상태, 메모)
             │    GET   /api/admin/inquiries.csv (BOM 포함, 엑셀 안전 처리)
             └─ cron (매일 03:00 KST)            1년 지난 문의 삭제 (개인정보 보유기간)
                        │
                        ▼
                   D1 (SQLite) inquiries 테이블
```

- **Cloudflare를 쓰는 이유**: 시안이 이미 Turnstile(스팸 방지)과 Access(관리자 로그인)를 전제로 합니다. Worker 하나로 정적 파일, API, DB, 예약 작업을 모두 처리하고 무료 플랜 안에서 운영할 수 있습니다.
- **프론트엔드 프레임워크 없음**: 거의 정적인 페이지 3~4개라 빌드 단계를 두지 않았습니다. 규모가 커지면 Astro 등으로 옮기면 됩니다.
- **관리자 인증**: 앞단은 Cloudflare Access가 막고, Worker가 JWT를 한 번 더 검증합니다(`src/access.ts`). Access 정책이 잘못 설정돼도 데이터가 노출되지 않습니다.

## 폴더 구조

```
src/            Worker (API, 인증, 입력 검증)
public/         정적 사이트 (메인, 제품 상세, 개인정보처리방침, 관리자)
migrations/     D1 스키마
seed/dev.sql    로컬 개발용 예시 데이터
design/         원본 시안 (참고용)
```

## 로컬 개발

```bash
npm install
cp .dev.vars.example .dev.vars      # 개발 모드: Access 인증 생략, Turnstile 테스트 키 사용
npm run db:migrate:local
npm run db:seed                     # 선택
npm run dev                         # http://localhost:8787  (/admin/ 도 바로 접속 가능)
```

## 첫 배포

1. `npx wrangler d1 create cubicle-db` → 출력된 ID를 `wrangler.jsonc`의 `database_id`에 입력
2. `npm run db:migrate:remote`
3. Turnstile 대시보드에서 위젯 생성 → 사이트 키는 `public/assets/config.js`에, 시크릿은 `npx wrangler secret put TURNSTILE_SECRET`으로 등록
4. `npm run deploy` 후 커스텀 도메인 연결
5. Zero Trust → Access에서 `/admin*`, `/api/admin*` 경로로 애플리케이션 생성, 직원 이메일만 허용. AUD 태그와 팀 도메인을 `wrangler.jsonc`의 `vars`에 넣고 다시 배포

## 개발 계획

**1단계: MVP (이번 스캐폴드에서 완료)**
- [x] 메인·제품 상세·관리자 페이지를 시안대로 구현
- [x] 견적 폼 → Turnstile → D1 저장
- [x] 관리자 목록, 제품·상태 필터, 상태·메모 수정, CSV
- [x] 보유기간 1년 경과 시 자동 삭제

**2단계: 오픈 전**
- [ ] 플레이스홀더 채우기(`[브랜드명]`, `[대표번호]`, `[자재명]` 등. `grep -rn "\[" public`으로 찾기)와 실제 사진 교체
- [ ] 개인정보처리방침 전문 작성 및 법무 검토 (`public/privacy.html`)
- [ ] **신규 문의 알림**: Worker가 담당자에게 이메일(Cloudflare Email Routing / Resend)이나 카카오톡·Slack 웹훅을 보냄. 견적 사이트는 응답 속도가 수주를 좌우하므로 가장 중요한 항목
- [ ] 문의 API에 요청 제한 적용 (Workers Rate Limiting 바인딩)
- [ ] SEO: OG 태그, `sitemap.xml`, `robots.txt`, 구글 서치 콘솔·네이버 웹마스터 등록
- [ ] 분석: Cloudflare Web Analytics, 폼 제출 전환 이벤트

**3단계: 운영**
- [ ] 관리자: 검색, 기간 필터, 페이지네이션 (1,000건 넘어가면)
- [ ] 문의 상세 화면과 변경 이력(누가 언제 무엇을 바꿨는지), `inquiry_events` 테이블
- [ ] 제품·컬러·스펙을 `catalog.js` 직접 수정 대신 관리자 화면에서 관리 (D1 또는 KV)
- [ ] 테스트: `validation.ts` 단위 테스트, `@cloudflare/vitest-pool-workers`로 API 테스트

## 참고

- 제품·컬러·상태·지역 ID는 세 곳이 일치해야 합니다: `src/types.ts`, `public/assets/catalog.js`, `migrations/0001_init.sql`의 CHECK 제약.
- DB에는 UTC로 저장하고, 관리자 화면에서 KST로 표시합니다.
