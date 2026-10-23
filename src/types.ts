export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ENVIRONMENT: string;
  TURNSTILE_SECRET: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
}

export type AppEnv = {
  Bindings: Env;
  Variables: { adminEmail: string };
};

export const PRODUCTS = ['cubicle', 'lock', 'bell', 'set'] as const;
export const COLORS = ['black', 'bronze', 'gold', 'gray'] as const;
export const REGIONS = ['서울', '경기', '인천', '충북', '충남·대전', '그 외 지역'] as const;
export const STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'CONTRACTED', 'HOLD'] as const;

export type Product = (typeof PRODUCTS)[number];
export type Status = (typeof STATUSES)[number];

export const PRODUCT_LABELS: Record<Product, string> = {
  cubicle: '컬러 큐비클',
  lock: '화장실 잠금장치',
  bell: '비상벨',
  set: '큐비클 + 부속품 세트',
};

export const COLOR_LABELS: Record<(typeof COLORS)[number], string> = {
  black: '블랙',
  bronze: '브론즈',
  gold: '골드',
  gray: '그레이',
};

export const STATUS_LABELS: Record<Status, string> = {
  NEW: '신규',
  CONTACTED: '연락완료',
  QUOTED: '견적발송',
  CONTRACTED: '계약',
  HOLD: '보류',
};

export interface InquiryRow {
  id: number;
  created_at: string;
  source: 'main' | 'product';
  company: string;
  person: string | null;
  phone: string;
  product: Product;
  colors: string | null;
  qty: string | null;
  region: string | null;
  message: string | null;
  consent_at: string;
  status: Status;
  note: string | null;
  updated_at: string | null;
}
