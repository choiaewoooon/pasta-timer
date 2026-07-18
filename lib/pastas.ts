// 파스타 데이터 정본. 시간은 일반 건면 기준 표준값 — 봉지 표기가 다르면 앱의 "직접 입력"으로.
// 재료는 구조화해서 저장한다: 나중에 쿠팡 파트너스 링크를 재료 단위로 붙이기 위함 (PRD).

export type Ingredient = {
  name: string;
  amount: string;
};

export type Recipe = {
  title: string;
  intro: string; // 한 문장 — 면 삶는 동안 무엇을 하게 되는지
  ingredients: Ingredient[];
  steps: string[]; // "면 삶는 동안" 흐름에 맞춘 순서
  tip?: string;
};

/** 같은 면인데 굵기(mm)에 따라 삶는 시간이 갈리는 경우 — 스파게티가 대표적 */
export type Variant = {
  label: string;      // 봉지에 적힌 표기 (예: "1.7mm")
  alDenteMin: number;
  normalMin: number;
};

export type Pasta = {
  slug: string;
  nameKo: string;
  nameIt: string;
  shape: string; // 한 줄 설명 (모양/특징)
  alDenteMin: number;
  normalMin: number;
  /** 있으면 상세 화면에 굵기 선택 칩이 뜬다. 첫 항목이 기본값 */
  variants?: Variant[];
  recipe: Recipe;
};

/**
 * 삶는 물 기준값. 이탈리아 표준은 면 100g당 물 1L + 소금 10g인데,
 * 한국 입맛에는 짜게 느껴질 수 있어 소금은 절반(5g ≈ 1작은술)에서 시작하도록 안내한다.
 * 물이 적으면 면끼리 붙고 전분이 뭉쳐 떡지므로 물 양은 줄이지 않는 게 중요하다.
 */
export const WATER_GUIDE = {
  perServing: {
    pastaG: 100,
    waterL: 1,
    saltTsp: 1,
  },
  note: "물이 적으면 면이 서로 붙어요. 넉넉하게 잡는 게 실패가 없어요.",
} as const;

export const PASTAS: Pasta[] = [
  {
    slug: "spaghetti",
    nameKo: "스파게티",
    nameIt: "Spaghetti",
    shape: "가장 기본이 되는 길고 둥근 면",
    alDenteMin: 8,
    normalMin: 10,
    // 봉지 앞면에 굵기가 mm로 적혀 있다. 같은 스파게티도 최대 5분 차이 난다.
    variants: [
      { label: "1.4mm", alDenteMin: 6, normalMin: 7 },
      { label: "1.7mm", alDenteMin: 8, normalMin: 10 },
      { label: "1.9mm", alDenteMin: 10, normalMin: 12 },
    ],
    recipe: {
      title: "알리오 올리오",
      intro: "면이 삶아지는 8분이면 소스까지 딱 맞게 끝나요.",
      ingredients: [
        { name: "마늘", amount: "6쪽" },
        { name: "올리브유", amount: "4큰술" },
        { name: "페페론치노", amount: "2개 (또는 건고추)" },
        { name: "소금", amount: "약간" },
        { name: "파슬리", amount: "취향껏" },
      ],
      steps: [
        "마늘을 얇게 편으로 썰어요.",
        "차가운 팬에 올리브유와 마늘을 넣고 약불에서 천천히 익혀요. 마늘이 타면 써지니 불은 끝까지 약하게.",
        "마늘이 연한 갈색이 되면 페페론치노를 부숴 넣고 불을 꺼요.",
        "타이머가 울리면 면수 반 컵을 팬에 붓고, 면을 건져 팬에서 30초간 버무려요.",
        "소금으로 간을 맞추고 파슬리를 뿌려 마무리해요.",
      ],
      tip: "면수의 전분이 기름과 만나야 소스가 뽀얗게 엉겨요. 면수는 버리지 마세요!",
    },
  },
  {
    slug: "capellini",
    nameKo: "카펠리니",
    nameIt: "Capellini",
    shape: "머리카락처럼 가는 면 — 금방 익어요",
    alDenteMin: 2,
    normalMin: 3,
    recipe: {
      title: "토마토 냉파스타",
      intro: "면이 워낙 빨리 익으니 소스를 먼저 만들어 두는 게 순서예요.",
      ingredients: [
        { name: "방울토마토", amount: "10개" },
        { name: "올리브유", amount: "3큰술" },
        { name: "레몬즙", amount: "1큰술" },
        { name: "소금", amount: "약간" },
        { name: "바질잎", amount: "4~5장" },
      ],
      steps: [
        "방울토마토를 반으로 잘라 볼에 담아요.",
        "올리브유, 레몬즙, 소금을 넣고 섞어 소스를 만들어요.",
        "이제 면을 넣고 타이머를 시작해요. 2분이면 충분해요.",
        "삶은 면을 얼음물에 헹궈 물기를 빼요.",
        "소스와 면을 버무리고 바질잎을 찢어 올려요.",
      ],
      tip: "여름철엔 토마토를 미리 냉장고에 넣어 두면 더 시원해요.",
    },
  },
  {
    slug: "linguine",
    nameKo: "링귀네",
    nameIt: "Linguine",
    shape: "납작하게 눌린 면 — 해산물과 찰떡",
    alDenteMin: 9,
    normalMin: 11,
    recipe: {
      title: "봉골레",
      intro: "바지락 해감만 미리 해 두면, 나머지는 면 삶는 시간 안에 다 돼요.",
      ingredients: [
        { name: "바지락", amount: "300g (해감된 것)" },
        { name: "마늘", amount: "4쪽" },
        { name: "올리브유", amount: "3큰술" },
        { name: "화이트와인 (또는 소주)", amount: "3큰술" },
        { name: "페페론치노", amount: "1개" },
      ],
      steps: [
        "마늘을 편으로 썰어 올리브유에 약불로 익혀요.",
        "향이 오르면 바지락과 와인을 넣고 뚜껑을 덮어요.",
        "바지락이 입을 벌리면 불을 약하게 줄여 국물이 졸아들지 않게 해요.",
        "타이머 1분 전, 면을 건져 팬에 넣고 국물과 함께 섞어요.",
        "면수로 농도를 맞추고 페페론치노를 부숴 마무리해요.",
      ],
      tip: "바지락 국물이 소스의 전부라서 소금 간은 마지막에 확인만 하면 돼요.",
    },
  },
  {
    slug: "fettuccine",
    nameKo: "페투치네",
    nameIt: "Fettuccine",
    shape: "넓적한 리본 면 — 크림을 잘 붙잡아요",
    alDenteMin: 10,
    normalMin: 12,
    recipe: {
      title: "크림 파스타",
      intro: "넓은 면이 크림을 붙잡아 주니, 소스는 생각보다 묽게 잡는 게 요령이에요.",
      ingredients: [
        { name: "생크림", amount: "200ml" },
        { name: "베이컨", amount: "3줄" },
        { name: "양파", amount: "1/4개" },
        { name: "파르메산 치즈", amount: "3큰술" },
        { name: "후추", amount: "약간" },
      ],
      steps: [
        "베이컨을 잘게 썰어 중불에 바삭하게 구워요.",
        "양파를 다져 넣고 투명해질 때까지 볶아요.",
        "생크림을 붓고 약불에서 살짝만 졸여요.",
        "타이머가 울리면 면을 건져 팬에 넣고 치즈를 뿌려 섞어요.",
        "너무 되직하면 면수로 풀고, 후추로 마무리해요.",
      ],
      tip: "크림은 팔팔 끓이면 분리돼요. 가장자리가 몽글거리는 정도면 충분해요.",
    },
  },
  {
    slug: "penne",
    nameKo: "펜네",
    nameIt: "Penne",
    shape: "비스듬히 자른 원통 면 — 소스가 속까지 들어가요",
    alDenteMin: 10,
    normalMin: 12,
    recipe: {
      title: "아라비아따",
      intro: "매콤한 토마토 소스 — 얼큰한 게 당기는 날의 답이에요.",
      ingredients: [
        { name: "토마토 소스 (시판)", amount: "1컵" },
        { name: "마늘", amount: "3쪽" },
        { name: "페페론치노", amount: "3개" },
        { name: "올리브유", amount: "2큰술" },
        { name: "설탕", amount: "한 꼬집" },
      ],
      steps: [
        "마늘을 다져 올리브유에 볶아 향을 내요.",
        "페페론치노를 부숴 넣고 10초만 더 볶아요.",
        "토마토 소스를 붓고 약불에서 보글보글 졸여요.",
        "신맛이 강하면 설탕 한 꼬집을 넣어 신맛을 잡아줘요.",
        "타이머가 울리면 면을 건져 소스에 넣고 1분간 버무려요.",
      ],
      tip: "펜네는 구멍 속 물이 잘 안 빠져요. 체에 받쳐 두어 번 털어주세요.",
    },
  },
  {
    slug: "fusilli",
    nameKo: "푸실리",
    nameIt: "Fusilli",
    shape: "나선형 면 — 홈마다 소스가 걸려요",
    alDenteMin: 10,
    normalMin: 12,
    recipe: {
      title: "바질 페스토 파스타",
      intro: "불 쓸 일이 거의 없어요. 면만 잘 삶으면 끝나는 레시피예요.",
      ingredients: [
        { name: "바질 페스토 (시판)", amount: "3큰술" },
        { name: "방울토마토", amount: "6개" },
        { name: "파르메산 치즈", amount: "2큰술" },
        { name: "올리브유", amount: "1큰술" },
        { name: "잣 (또는 호두)", amount: "1큰술" },
      ],
      steps: [
        "방울토마토를 반으로 잘라 두어요.",
        "큰 볼에 페스토와 올리브유를 섞어요.",
        "잣을 마른 팬에 살짝 볶아 고소함을 더해요.",
        "타이머가 울리면 면을 건져 볼에 넣고 버무려요. 불에 올리지 않아요.",
        "토마토, 잣, 치즈를 올려 마무리해요.",
      ],
      tip: "페스토는 열에 닿으면 향이 죽어요. 꼭 볼에서 버무려요!",
    },
  },
  {
    slug: "rigatoni",
    nameKo: "리가토니",
    nameIt: "Rigatoni",
    shape: "골이 파인 굵은 원통 면 — 진한 소스용",
    alDenteMin: 11,
    normalMin: 13,
    recipe: {
      title: "미트소스 파스타",
      intro: "면이 굵어 오래 삶는 만큼, 소스도 그 시간에 푹 졸일 수 있어요.",
      ingredients: [
        { name: "다진 소고기", amount: "150g" },
        { name: "토마토 소스 (시판)", amount: "1컵" },
        { name: "양파", amount: "1/2개" },
        { name: "마늘", amount: "3쪽" },
        { name: "올리브유", amount: "2큰술" },
      ],
      steps: [
        "양파와 마늘을 다져 올리브유에 볶아요.",
        "다진 고기를 넣고 소금·후추로 밑간하며 센 불에 볶아요.",
        "토마토 소스를 붓고 약불에서 뭉근히 졸여요.",
        "타이머가 울리면 면을 건져 소스에 넣어요.",
        "면수를 조금 넣고 1분간 섞으면 소스가 면 골에 착 붙어요.",
      ],
      tip: "고기는 팬에 눌러 붙듯 구워야 잡내 없이 고소해요. 자주 뒤집지 마세요.",
    },
  },
  {
    slug: "farfalle",
    nameKo: "파르팔레",
    nameIt: "Farfalle",
    shape: "나비넥타이 모양 면 — 보기에도 귀여워요",
    alDenteMin: 10,
    normalMin: 12,
    recipe: {
      title: "갈릭 새우 파스타",
      intro: "냉동 새우만 있으면 근사한 한 접시가 돼요.",
      ingredients: [
        { name: "냉동 새우", amount: "10마리 (해동)" },
        { name: "마늘", amount: "4쪽" },
        { name: "버터", amount: "1큰술" },
        { name: "올리브유", amount: "2큰술" },
        { name: "레몬즙", amount: "1큰술" },
      ],
      steps: [
        "새우는 키친타월로 물기를 꾹 눌러 닦아요.",
        "마늘을 편으로 썰어 올리브유와 버터에 약불로 익혀요.",
        "새우를 넣고 양면이 발갛게 될 때까지만 구워요.",
        "타이머가 울리면 면을 건져 팬에 넣고 섞어요.",
        "불을 끄고 레몬즙을 둘러 산뜻하게 마무리해요.",
      ],
      tip: "새우는 오래 익히면 질겨져요. 색이 변하면 바로 다음 단계로 넘어가요.",
    },
  },
  {
    slug: "orecchiette",
    nameKo: "오레키에테",
    nameIt: "Orecchiette",
    shape: "작은 귀 모양 면 — 오목한 곳에 소스가 고여요",
    alDenteMin: 11,
    normalMin: 13,
    recipe: {
      title: "브로콜리 마늘 파스타",
      intro: "브로콜리를 면과 같은 냄비에 삶는, 설거지를 줄이는 레시피예요.",
      ingredients: [
        { name: "브로콜리", amount: "1/2송이" },
        { name: "마늘", amount: "4쪽" },
        { name: "올리브유", amount: "3큰술" },
        { name: "페페론치노", amount: "1개" },
        { name: "파르메산 치즈", amount: "2큰술" },
      ],
      steps: [
        "브로콜리를 한입 크기로 잘라요.",
        "타이머 4분 남았을 때, 면 삶는 냄비에 브로콜리를 같이 넣어요.",
        "그동안 마늘을 편으로 썰어 올리브유에 약불로 익혀요.",
        "타이머가 울리면 면과 브로콜리를 함께 건져 팬에 넣어요.",
        "브로콜리를 주걱으로 살짝 으깨며 섞고, 치즈로 마무리해요.",
      ],
      tip: "브로콜리가 부드럽게 으깨지면서 그 자체로 소스가 돼요.",
    },
  },
  {
    slug: "macaroni",
    nameKo: "마카로니",
    nameIt: "Macaroni",
    shape: "짧은 구부러진 면 — 치즈와 단짝",
    alDenteMin: 8,
    normalMin: 10,
    recipe: {
      title: "원팬 맥앤치즈",
      intro: "아이도 어른도 못 이기는 맛 — 재료도 단출해요.",
      ingredients: [
        { name: "체다 치즈", amount: "슬라이스 3장 (또는 슈레드 1컵)" },
        { name: "우유", amount: "150ml" },
        { name: "버터", amount: "1큰술" },
        { name: "밀가루", amount: "1작은술" },
        { name: "후추", amount: "약간" },
      ],
      steps: [
        "약불 팬에 버터를 녹이고 밀가루를 넣어 30초 볶아요.",
        "우유를 조금씩 부으며 멍울 없이 풀어줘요.",
        "치즈를 넣고 녹을 때까지 저어요.",
        "타이머가 울리면 면을 건져 소스에 넣고 버무려요.",
        "후추를 뿌려 마무리해요. 빵가루가 있다면 토스터에 구워 올려도 좋아요.",
      ],
      tip: "소스가 되직해지면 우유를 한 큰술씩 더해 농도를 맞춰요.",
    },
  },
];

export function getPasta(slug: string): Pasta | undefined {
  return PASTAS.find((p) => p.slug === slug);
}
