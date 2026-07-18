import { chromium } from 'playwright';

const BASE = 'http://localhost:8899';
const OUT = process.env.OUT;
const VW = 318, VH = 800, DPR = 2;
const CW = 318, CH = 524;

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  deviceScaleFactor: DPR,
  isMobile: true, hasTouch: true, locale: 'ko-KR',
});

const clipShot = async (page, name, y = 0) => {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y, width: CW, height: CH } });
  console.log('  ✓', name);
};

const shotAt = async (page, name, text, bias = 0.5) => {
  await page.waitForTimeout(450);
  const y = await page.evaluate(([t, ch, vh, b]) => {
    const els = [...document.querySelectorAll('p,div,h2,h3,section,li,nav')].filter(e => e.textContent?.includes(t));
    const el = els[els.length - 1];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(vh - ch, r.top + r.height / 2 - ch * b));
  }, [text, CH, VH, bias]);
  if (y === null) throw new Error(`요소 못 찾음: ${text}`);
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y, width: CW, height: CH } });
  console.log('  ✓', name);
};

// 고정된 타이머 카드 바로 아래에 대상을 정렬 — 카드 경계에 글자가 반쯤 잘리지 않게
const alignBelowCard = async (page, text, gap = 10) => {
  await page.evaluate(([t, g]) => {
    const sticky = [...document.querySelectorAll('*')].find(e => getComputedStyle(e).position === 'sticky');
    const cardBottom = sticky ? sticky.getBoundingClientRect().bottom : 0;
    const els = [...document.querySelectorAll('h3,h2,li,p')].filter(e => e.textContent?.includes(t));
    const el = els[els.length - 1];
    if (!el) return;
    window.scrollBy({ top: el.getBoundingClientRect().top - (cardBottom + g), behavior: 'instant' });
  }, [text, gap]);
  await page.waitForTimeout(350);
};

// ── 홈 ────────────────────────────────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await clipShot(page, 'a-home');
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }));
  await clipShot(page, 'b-home-list');
  await page.close();
}

// ── 상세 대기 ─────────────────────────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/pasta/spaghetti/`, { waitUntil: 'networkidle' });
  await shotAt(page, 'c-select', '봉지 앞면의 굵기', 0.35);
  await shotAt(page, 'd-water', '먼저 물부터', 0.62);
  await page.getByRole('button', { name: '직접 입력' }).click();
  await shotAt(page, 'e-custom', '봉지 뒷면에 적힌', 0.60);
  await page.close();
}

// ── 타이머 진행 + 레시피 동시 노출 ─────────────────
{
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto(`${BASE}/pasta/spaghetti/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '삶기 시작' }).click();
  await page.clock.runFor('02:30');
  await clipShot(page, 'f-running');

  await alignBelowCard(page, '재료');
  await clipShot(page, 'i-recipe');

  await alignBelowCard(page, '마늘을 얇게');
  await clipShot(page, 'j-steps');

  await page.clock.runFor('04:45');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await clipShot(page, 'g-almost');

  await page.clock.runFor('01:00');
  await clipShot(page, 'h-done');
  await page.close();
}

// ── 뽀모의 팁 ─────────────────────────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/pasta/spaghetti/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
  await alignBelowCard(page, '뽀모의 팁', 14);
  await clipShot(page, 'k-tip');
  await page.close();
}

// ── 카펠리니(2분) ─────────────────────────────────
{
  const page = await ctx.newPage();
  await page.goto(`${BASE}/pasta/capellini/`, { waitUntil: 'networkidle' });
  await clipShot(page, 'l-capellini');
  await page.close();
}

await browser.close();
