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

  async function load() {
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
