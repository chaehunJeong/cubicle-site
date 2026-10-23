// 데모 모드(GitHub Pages 미리보기 또는 ?demo)에서만 쓰는 예시 문의.
// 접수 시각은 "지금으로부터 N시간 전"으로 만들어 항상 최근 데이터처럼 보이게 한다.
window.ADMIN_DEMO_DATA = function () {
  var rows = [
    [2, 'product', '○○건설', '김○○ 과장', '010-0000-0001', 'cubicle', 'gold', '40칸', '경기', '남자화장실 2개층, 칸당 폭 900 기준', 'NEW', null],
    [5, 'product', '△△휴게소', '이○○ 팀장', '010-0000-0002', 'set', 'black,gray', '24세트', '충북', '상·하행 휴게소 각 12칸. 12월 중 납품 희망', 'NEW', null],
    [9, 'main', '한빛오피스', null, '010-0000-0007', 'lock', null, '30개', null, null, 'NEW', null],
    [20, 'product', '□□인테리어', '박○○', '010-0000-0003', 'cubicle', 'bronze', '12칸', '서울', '카페 리모델링, 우드 판넬 가능 여부 문의', 'CONTACTED', '규격 도면 메일로 받기로 함'],
    [27, 'product', '◇◇빌딩관리', '최○○ 주임', '010-0000-0004', 'lock', 'black', '60개', '인천', '기존 잠금장치 교체용', 'QUOTED', '견적서 메일 발송 (10/22)'],
    [31, 'main', '그린스포츠센터', '오○○ 실장', '010-0000-0008', 'bell', null, '16개', '경기', null, 'CONTACTED', '유선/무선 중 선택 안내함'],
    [45, 'product', '☆☆몰', '정○○', '010-0000-0005', 'bell', 'gray', '30개', '서울', '장애인 화장실 포함', 'CONTRACTED', '11월 둘째 주 납품'],
    [52, 'product', '대한물산', '유○○ 대리', '010-0000-0009', 'set', 'gold', '8세트', '충남·대전', '본사 사옥 1층', 'QUOTED', '세트 할인 견적 발송'],
    [70, 'main', '◎◎산업', '한○○ 대리', '010-0000-0006', 'cubicle', 'black,gold', '8칸', '충남·대전', null, 'HOLD', '예산 확정 후 재연락'],
    [96, 'product', '서해초등학교 행정실', '강○○ 주무관', '010-0000-0010', 'cubicle', 'gray', '20칸', '그 외 지역', '조달 등록 여부 문의', 'CONTACTED', '조달 미등록 안내, 수의계약 가능 여부 확인 중'],
    [130, 'product', '미래병원', '서○○ 과장', '010-0000-0011', 'lock', 'bronze,gold', '45개', '서울', null, 'CONTRACTED', '11월 첫째 주 출고'],
    [170, 'main', '스타코워킹', null, '010-0000-0012', 'set', null, '6세트', '서울', null, 'HOLD', '입주 일정 미정'],
  ];
  var now = Date.now();
  return rows.map(function (r, i) {
    var created = new Date(now - r[0] * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    return {
      id: rows.length - i, created_at: created, source: r[1], company: r[2], person: r[3], phone: r[4],
      product: r[5], colors: r[6], qty: r[7], region: r[8], message: r[9], consent_at: created,
      status: r[10], note: r[11], updated_at: null,
    };
  });
};
