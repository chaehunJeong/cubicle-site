(function () {
  var C = window.CATALOG;
  var params = new URLSearchParams(location.search);
  var product = C.products.find(function (p) { return p.id === params.get('id'); }) || C.products[0];
  var color = C.colors.find(function (c) { return c.id === params.get('color'); }) || C.colors[2];

  document.title = product.name + ' · [브랜드명]';
  document.querySelectorAll('[data-bind]').forEach(function (el) {
    el.textContent = product[el.dataset.bind];
  });

  // 스펙
  var specs = document.getElementById('specs');
  product.specs.forEach(function (s) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="k"></span><span></span>';
    li.children[0].textContent = s[0];
    li.children[1].textContent = s[1];
    specs.appendChild(li);
  });

  // 컬러 선택 → 미리보기
  var picker = document.getElementById('color-picker');
  var buttons = C.colors.map(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'color-btn';
    b.style.background = c.hex;
    b.setAttribute('aria-label', c.name);
    b.addEventListener('click', function () { setColor(c); });
    picker.appendChild(b);
    return b;
  });

  function setColor(c) {
    color = c;
    buttons.forEach(function (b, i) { b.setAttribute('aria-pressed', String(C.colors[i] === c)); });
    document.querySelectorAll('#stage .door').forEach(function (d) { d.style.background = c.hex; });
    document.getElementById('stage').setAttribute('aria-label', c.name + ' 컬러 ' + product.name + ' 미리보기');
    document.getElementById('color-label').textContent = c.name + ' — ' + c.desc;
    // 문의 폼의 희망 컬러에도 반영
    document.querySelectorAll('#color-chips input').forEach(function (i) { i.checked = i.value === c.id; });
  }

  // 문의 폼 옵션
  var select = document.getElementById('product-select');
  C.products.forEach(function (p) { select.add(new Option(p.name, p.id, false, p === product)); });

  var form = document.getElementById('quote-form');
  function syncUnit() {
    var p = C.products.find(function (x) { return x.id === select.value; });
    document.getElementById('unit').textContent = p.unit;
    form.dataset.unit = p.unit;
  }
  select.addEventListener('change', syncUnit);
  syncUnit();

  var chips = document.getElementById('color-chips');
  C.colors.forEach(function (c) {
    var label = document.createElement('label');
    label.className = 'chip';
    label.innerHTML = '<input type="checkbox" name="colors"><span class="dot"></span><span></span>';
    label.querySelector('input').value = c.id;
    label.querySelector('.dot').style.background = c.hex;
    label.lastChild.textContent = c.name;
    chips.appendChild(label);
  });

  var region = document.getElementById('region-select');
  C.regions.forEach(function (r) { region.add(new Option(r, r)); });

  setColor(color);

  // 접수 완료 화면
  var wrap = document.getElementById('quote-form-wrap');
  var done = document.getElementById('done');
  form.addEventListener('inquiry:sent', function () {
    wrap.hidden = true;
    done.hidden = false;
  });
  document.getElementById('again').addEventListener('click', function () {
    done.hidden = true;
    wrap.hidden = false;
    select.value = product.id;
    syncUnit();
    setColor(color);
  });
})();
