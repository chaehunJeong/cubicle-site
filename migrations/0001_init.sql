-- 견적 문의
CREATE TABLE inquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),   -- UTC
  source      TEXT    NOT NULL CHECK (source IN ('main', 'product')),
  company     TEXT    NOT NULL,
  person      TEXT,
  phone       TEXT    NOT NULL,
  product     TEXT    NOT NULL CHECK (product IN ('cubicle', 'lock', 'bell', 'set')),
  colors      TEXT,                                          -- 쉼표 구분 컬러 id
  qty         TEXT,
  region      TEXT,
  message     TEXT,
  consent_at  TEXT    NOT NULL,                              -- 개인정보 동의 시각
  status      TEXT    NOT NULL DEFAULT 'NEW'
              CHECK (status IN ('NEW', 'CONTACTED', 'QUOTED', 'CONTRACTED', 'HOLD')),
  note        TEXT,
  updated_at  TEXT
);

CREATE INDEX idx_inquiries_created ON inquiries (created_at DESC);
CREATE INDEX idx_inquiries_product_status ON inquiries (product, status);
