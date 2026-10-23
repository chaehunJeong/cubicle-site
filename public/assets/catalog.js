// 제품·컬러 카탈로그. id는 서버(src/types.ts)와 DB CHECK 제약과 일치해야 한다.
var PHOTOS = {
  legs: { src: 'assets/images/legs.jpg', alt: '실버·로즈골드·블랙 컬러 큐비클 받침 다리와 골드 브라켓' },
  bracket: { src: 'assets/images/bracket.jpg', alt: '큐비클 상단 패널을 잇는 골드 컬러 브라켓' },
  indicator: { src: 'assets/images/indicator-lock.jpg', alt: '로즈골드 컬러 표시형 잠금장치' },
  latch: { src: 'assets/images/latch.jpg', alt: '로즈골드 컬러 슬라이드 잠금장치' },
};

window.CATALOG = {
  colors: [
    { id: 'black', name: '블랙', desc: '모던하고 세련된 분위기', hex: '#2B2B2A' },
    { id: 'bronze', name: '브론즈', desc: '따뜻하고 고급스러운 분위기', hex: '#6B4F43' },
    { id: 'gold', name: '골드', desc: '밝고 화사한 공간 연출', hex: '#C2A46E' },
    { id: 'gray', name: '그레이', desc: '차분하고 깔끔한 분위기', hex: '#8A8A8A' },
  ],
  products: [
    {
      id: 'cubicle', tag: 'CUBICLE', name: '컬러 큐비클', unit: '칸',
      lead: '사무실·휴게소·상업시설 화장실에 어울리는 컬러 칸막이. 잠금장치와 비상벨까지 같은 컬러로 맞춰 통일감 있게 납품합니다.',
      photos: [PHOTOS.legs, PHOTOS.bracket, PHOTOS.indicator, PHOTOS.latch],
      specs: [
        ['소재', '[자재명 / 두께]'],
        ['견적 단위', '칸 단위 (고객 제공 규격 기준)'],
        ['부속품', '잠금장치 · 비상벨 동일 컬러 적용 가능'],
        ['최소 주문', '[최소 수량]'],
        ['설치', '미포함 · 요청 물품만 배송'],
      ],
    },
    {
      id: 'lock', tag: 'ACCESSORY', name: '화장실 잠금장치', unit: '개',
      lead: '큐비클과 같은 컬러로 마감한 표시형 잠금장치. 사용 중 표시로 이용자 편의를 높입니다.',
      photos: [PHOTOS.indicator, PHOTOS.latch],
      specs: [
        ['소재', '[소재 기재]'],
        ['견적 단위', '개 단위'],
        ['호환', '[호환 도어 두께 기재]'],
        ['최소 주문', '[최소 수량]'],
        ['설치', '미포함 · 요청 물품만 배송'],
      ],
    },
    {
      id: 'bell', tag: 'ACCESSORY', name: '비상벨', unit: '개',
      lead: '긴급 상황 대응용 비상벨. 큐비클 컬러에 맞춘 마감으로 공간과 어울리게 설치할 수 있습니다.',
      photos: [],
      specs: [
        ['방식', '[유선 / 무선 기재]'],
        ['견적 단위', '개 단위'],
        ['인증', '[인증 정보 기재]'],
        ['최소 주문', '[최소 수량]'],
        ['설치', '미포함 · 요청 물품만 배송'],
      ],
    },
    {
      id: 'set', tag: 'SET', name: '큐비클 + 부속품 세트', unit: '세트',
      lead: '본체와 잠금장치·비상벨을 한 컬러로 묶어 일괄 납품합니다. 따로 주문할 때보다 컬러 편차 걱정이 없습니다.',
      photos: [PHOTOS.legs, PHOTOS.bracket, PHOTOS.indicator, PHOTOS.latch],
      specs: [
        ['구성', '큐비클 1칸 + 잠금장치 + 비상벨'],
        ['견적 단위', '세트 단위'],
        ['컬러', '세트 전체 동일 컬러'],
        ['최소 주문', '[최소 수량]'],
        ['설치', '미포함 · 요청 물품만 배송'],
      ],
    },
  ],
  regions: ['서울', '경기', '인천', '충북', '충남·대전', '그 외 지역'],
};
