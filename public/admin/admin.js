(function () {
  var PRODUCTS = [
    { id: 'all', name: '전체' },
    { id: 'cubicle', name: '컬러 큐비클' },
    { id: 'lock', name: '화장실 잠금장치' },
    { id: 'bell', name: '비상벨' },
    { id: 'set', name: '큐비클 + 부속품 세트' },
  ];
  var STATUSES = [
    { id: 'NEW', name: '신규' },
    { id: 'CONTACTED', name: '연락완료' },
    { id: 'QUOTED', name: '견적발송' },
    { id: 'CONTRACTED', name: '계약' },
    { id: 'HOLD', name: '보류' },
  ];
  var COLORS = { black: '블랙', bronze: '브론즈', gold: '골드', gray: '그레이' };

  // 데모 모드: API 없이 예시 데이터로 동작 (GitHub Pages 미리보기용).
  // API 실패 시 자동 전환하지 않는다 — 운영 중 장애를 가짜 데이터로 가리면 안 되므로.
  var DEMO = /\.github\.io$/.test(location.hostname) || new URLSearchParams(location.search).has('demo');

  var state = { inquiries: [], product: 'all', status: 'all' };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function productName(id) {
    return PRODUCTS.find(function (p) { return p.id === id; }).name;
  }

  // DB는 UTC 'YYYY-MM-DD HH:MM:SS'
  function formatKst(utc) {
    return new Date(utc.replace(' ', 'T') + 'Z').toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  function byProduct(id) {
    return state.inquiries.filter(function (q) { return id === 'all' || q.product === id; });
  }

  function renderCards() {
    var box = document.getElementById('product-cards');
    box.replaceChildren();
    PRODUCTS.forEach(function (p) {
      var mine = byProduct(p.id);
      var b = el('button', 'pcard');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(state.product === p.id));
      b.append(el('span', 'pcard-name', p.name));
      var nums = el('span', 'pcard-nums');
      nums.append(
        el('span', 'pcard-total', mine.length),
        el('span', 'pcard-unit', '건'),
        el('span', 'pcard-new', '신규 ' + mine.filter(function (q) { return q.status === 'NEW'; }).length),
      );
      b.append(nums);
      b.addEventListener('click', function () { state.product = p.id; render(); });
      box.append(b);
    });
  }

  function renderFilters() {
    var box = document.getElementById('status-filters');
    box.replaceChildren();
    [{ id: 'all', name: '전체' }].concat(STATUSES).forEach(function (s) {
      var b = el('button', null, s.name);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(state.status === s.id));
      b.addEventListener('click', function () { state.status = s.id; render(); });
      box.append(b);
    });
  }

  function renderRows() {
    var list = byProduct(state.product).filter(function (q) { return state.status === 'all' || q.status === state.status; });
    document.getElementById('list-title').textContent = productName(state.product) + ' · 문의 ' + list.length + '건';
    document.getElementById('empty').hidden = list.length > 0;

    var tbody = document.getElementById('rows');
    tbody.replaceChildren();
    list.forEach(function (q) {
      var tr = el('tr');

      var who = el('td');
      who.append(el('span', 'company', q.company));
      if (q.person) { who.append(el('br'), el('span', 'person', q.person)); }

      var phone = el('td', 'nowrap');
      var a = el('a', 'phone', q.phone);
      a.href = 'tel:' + q.phone.replace(/[^0-9+]/g, '');
      phone.append(a);

      var colors = (q.colors || '').split(',').filter(Boolean).map(function (c) { return COLORS[c] || c; }).join('·');

      var statusTd = el('td');
      var sel = el('select', 'status-select s-' + q.status);
      sel.setAttribute('aria-label', '상태');
      STATUSES.forEach(function (s) { sel.add(new Option(s.name, s.id, false, s.id === q.status)); });
      sel.addEventListener('change', function () {
        save(q, { status: sel.value }, sel).then(function () { render(); });
      });
      statusTd.append(sel);

      var noteTd = el('td');
      var note = el('input', 'note-input');
      note.value = q.note || '';
      note.placeholder = '—';
      note.setAttribute('aria-label', '메모');
      note.addEventListener('change', function () { save(q, { note: note.value }, note); });
      noteTd.append(note);

      tr.append(
        el('td', 'date nowrap', formatKst(q.created_at)),
        who,
        phone,
        el('td', null, productName(q.product)),
        el('td', null, colors || '—'),
        el('td', 'nowrap', q.qty || '—'),
        el('td', null, q.region || '—'),
        el('td', 'message', q.message || '—'),
        statusTd,
        noteTd,
      );
      tbody.append(tr);
    });
  }

  function render() {
    renderCards();
    renderFilters();
    renderRows();
  }

  async function save(q, patch, control) {
    if (DEMO) {
      if ('note' in patch) patch.note = patch.note.trim() || null;
      Object.assign(q, patch);
      return;
    }
    control.classList.add('saving');
    try {
      var res = await fetch('/api/admin/inquiries/' + q.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      Object.assign(q, (await res.json()).inquiry);
    } catch (e) {
      alert('저장에 실패했습니다. 새로고침 후 다시 시도해 주세요.');
    } finally {
      control.classList.remove('saving');
    }
  }

  // 데모 모드 CSV: 서버 CSV와 같은 열 구성으로 브라우저에서 생성
  function downloadDemoCsv(e) {
    e.preventDefault();
    var cell = function (v) {
      var s = v == null ? '' : String(v);
      return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    var statusName = function (id) { return STATUSES.find(function (s) { return s.id === id; }).name; };
    var lines = [['접수일시(UTC)', '업체명', '담당자', '연락처', '제품', '컬러', '수량', '지역', '요청사항', '상태', '메모'].join(',')];
    state.inquiries.forEach(function (q) {
      var colors = (q.colors || '').split(',').filter(Boolean).map(function (c) { return COLORS[c] || c; }).join('·');
      lines.push([q.created_at, q.company, q.person, q.phone, productName(q.product), colors, q.qty, q.region, q.message, statusName(q.status), q.note].map(cell).join(','));
    });
    var blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inquiries-demo.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function load() {
    if (DEMO) {
      document.getElementById('me').textContent = 'demo@example.com · 데모 모드';
      document.getElementById('demo-banner').hidden = false;
      document.getElementById('csv-link').addEventListener('click', downloadDemoCsv);
      state.inquiries = window.ADMIN_DEMO_DATA();
      render();
      return;
    }
    try {
      var [me, list] = await Promise.all([
        fetch('/api/admin/me').then(function (r) { return r.json(); }),
        fetch('/api/admin/inquiries').then(function (r) {
          if (!r.ok) throw new Error('목록을 불러오지 못했습니다 (' + r.status + ')');
          return r.json();
        }),
      ]);
      document.getElementById('me').textContent = me.email + ' · Cloudflare Access 인증됨';
      state.inquiries = list.inquiries;
      render();
    } catch (e) {
      var err = document.getElementById('load-error');
      err.textContent = e.message;
      err.hidden = false;
      document.getElementById('list-title').textContent = '오류';
    }
  }

  load();
})();
