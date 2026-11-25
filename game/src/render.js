// Sunny Side Kitchen: everything on screen is drawn in code, no images.
// The canvas is 1280x720; this file also owns the hit zones input.js uses.
import { LAYOUT, VIEW } from './config.js';
import { DISHES, INGREDIENTS, INGREDIENT_ORDER } from './recipes.js';
import { activeOrder, activePatienceRatio, timeLeftSeconds } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

/** Draw one ingredient as a flat-code icon: tomato, lettuce, bread or egg. */
export function drawIngredientIcon(ctx, id, cx, cy, r) {
  const ing = INGREDIENTS[id];
  ctx.save();
  if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2f7d3d';
    ctx.beginPath(); ctx.ellipse(cx, cy - r * 0.95, r * 0.35, r * 0.18, 0, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, 0.4, Math.PI * 1.3); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.62, Math.PI * 1.4, Math.PI * 0.3); ctx.stroke();
  } else if (id === 'bread') {
    ctx.fillStyle = ing.color;
    rr(ctx, cx - r, cy - r * 0.7, r * 2, r * 1.4, r * 0.5); ctx.fill();
    ctx.fillStyle = ing.dark;
    ctx.beginPath(); ctx.arc(cx - r * 0.4, cy, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + r * 0.35, cy + r * 0.15, r * 0.1, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#fff8ea';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a800';
    ctx.beginPath(); ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawDishMini(ctx, dish, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  if (dish.id === 'salad') {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8442e'; ctx.beginPath(); ctx.arc(-10, -4, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#58b368'; ctx.beginPath(); ctx.arc(10, 6, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(8, -10, 8, 0, Math.PI * 2); ctx.fill();
  } else if (dish.id === 'sandwich') {
    ctx.fillStyle = '#e8b25a'; rr(ctx, -30, -14, 60, 28, 8); ctx.fill();
    ctx.fillStyle = '#58b368'; rr(ctx, -26, -6, 52, 8, 4); ctx.fill();
    ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(0, 2, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8442e'; rr(ctx, -24, 8, 48, 7, 3); ctx.fill();
  } else {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawKitchen(ctx) {
  // Tiled wall, warm floor, long steel counter.
  ctx.fillStyle = '#f7e8c9'; ctx.fillRect(0, 0, VIEW.width, 470);
  ctx.fillStyle = '#f2dcb4';
  for (let x = 0; x < VIEW.width; x += 80) ctx.fillRect(x, 0, 2, 470);
  for (let y = 0; y < 470; y += 80) ctx.fillRect(0, y, VIEW.width, 2);
  ctx.fillStyle = '#c98f4e'; ctx.fillRect(0, 470, VIEW.width, 250);
  ctx.fillStyle = '#e8c48a'; ctx.fillRect(0, 470, VIEW.width, 10);
  // Window with sun, hanging pans, shelf.
  ctx.fillStyle = '#bfe3f2'; rr(ctx, 1080, 200, 150, 110, 10); ctx.fill();
  ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(1150, 240, 26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7a5a33'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.arc(120, 250, 26, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(180, 250, 26, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#8a6a42'; ctx.fillRect(60, 300, 200, 10);
  ctx.fillStyle = '#e8442e'; ctx.beginPath(); ctx.arc(90, 288, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#58b368'; ctx.beginPath(); ctx.arc(130, 288, 10, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(170, 288, 10, 0, Math.PI * 2); ctx.fill();
}

function orderSlotRect(index) {
  const s = LAYOUT.orderSlot;
  return {
    x: LAYOUT.board.x + 140 + index * (s.width + s.gap),
    y: LAYOUT.board.y + 11, width: s.width, height: s.height,
  };
}

export function orderSlotAt(state, x, y) {
  for (let i = 0; i < state.orders.length; i += 1) {
    const r = orderSlotRect(i);
    if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return state.orders[i].id;
  }
  return null;
}

function drawOrderBoard(ctx, state) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#5b4636'; rr(ctx, b.x, b.y, b.width, b.height, 14); ctx.fill();
  ctx.fillStyle = '#7a5f45'; rr(ctx, b.x + 6, b.y + 6, b.width - 12, b.height - 12, 10); ctx.fill();
  text(ctx, '订单板', b.x + 62, b.y + 26, 22, '#ffe9b0', 'center', 'bold');
  text(ctx, '点击订单', b.x + 62, b.y + 52, 13, '#d9c39a');
  text(ctx, '开始做菜', b.x + 62, b.y + 74, 13, '#d9c39a');
  text(ctx, '别让客人等', b.x + 62, b.y + 96, 13, '#d9c39a');
  if (state.orders.length === 0) {
    text(ctx, '暂无订单，等客人进门…', b.x + 500, b.y + b.height / 2, 20, '#ffe9b0');
  }
  state.orders.forEach((order, i) => {
    const dish = DISHES[order.dishId];
    const r = orderSlotRect(i);
    const active = order.id === state.activeOrderId;
    const urgent = order.patience < 10;
    ctx.fillStyle = active ? '#fff6dd' : '#fdf3d8';
    rr(ctx, r.x, r.y, r.width, r.height, 10); ctx.fill();
    if (active) { ctx.strokeStyle = '#e8442e'; ctx.lineWidth = 4; rr(ctx, r.x, r.y, r.width, r.height, 10); ctx.stroke(); }
    drawDishMini(ctx, dish, r.x + 34, r.y + 34, 0.8);
    text(ctx, dish.name, r.x + 70, r.y + 22, 19, '#3a2a1a', 'left');
    text(ctx, dish.recipe.map((id) => INGREDIENTS[id].name).join(' + '), r.x + 70, r.y + 48, 14, '#7a5a33', 'left');
    const pw = r.width - 20;
    ctx.fillStyle = '#e8dcc4'; rr(ctx, r.x + 10, r.y + 66, pw, 10, 5); ctx.fill();
    ctx.fillStyle = urgent ? '#e8442e' : '#58b368';
    rr(ctx, r.x + 10, r.y + 66, pw * Math.max(0, order.patience / order.maxPatience), 10, 5); ctx.fill();
    text(ctx, `${Math.ceil(order.patience)}s  +${dish.points}分`, r.x + r.width / 2, r.y + 88, 13, urgent ? '#e8442e' : '#5b4636');
  });
}

function drawHud(ctx, state) {
  const h = LAYOUT.hud;
  text(ctx, `⏱ ${timeLeftSeconds(state)}s`, h.x + 10, h.y + 22, 26, '#3a2a1a', 'left');
  const tw = 420;
  ctx.fillStyle = '#e8dcc4'; rr(ctx, h.x + 150, h.y + 12, tw, 20, 10); ctx.fill();
  ctx.fillStyle = state.timeLeft < 30 ? '#e8442e' : '#e8a13c';
  rr(ctx, h.x + 150, h.y + 12, tw * Math.max(0, state.timeLeft / 150), 20, 10); ctx.fill();
  text(ctx, `分数 ${state.score} / 300`, h.x + 620, h.y + 22, 26, '#3a2a1a', 'left');
  text(ctx, `失误 ${state.mistakes} / 3`, h.x + 900, h.y + 22, 22, state.mistakes > 0 ? '#e8442e' : '#3a2a1a', 'left');
  const order = activeOrder(state);
  if (order) {
    const ratio = activePatienceRatio(state);
    text(ctx, '客人耐心', h.x + 1060, h.y + 22, 16, '#7a5a33', 'left');
    ctx.fillStyle = '#e8dcc4'; rr(ctx, h.x + 1140, h.y + 12, 80, 20, 10); ctx.fill();
    ctx.fillStyle = ratio < 0.3 ? '#e8442e' : '#58b368';
    rr(ctx, h.x + 1140, h.y + 12, 80 * ratio, 20, 10); ctx.fill();
  }
}

function drawCounter(ctx, state) {
  const c = LAYOUT.counter;
  ctx.fillStyle = '#d9d9d9'; rr(ctx, c.x, c.y, c.width, c.height, 16); ctx.fill();
  ctx.fillStyle = '#efefef'; rr(ctx, c.x + 8, c.y + 8, c.width - 16, c.height - 16, 12); ctx.fill();
  text(ctx, '装盘台', c.x + 70, c.y + 30, 20, '#7a5a33', 'left');
  const order = activeOrder(state);
  if (order) {
    const dish = DISHES[order.dishId];
    text(ctx, `正在做：${dish.name}`, c.x + 70, c.y + 58, 18, '#3a2a1a', 'left');
    text(ctx, `需要：${dish.recipe.map((id) => INGREDIENTS[id].name).join(' + ')}`, c.x + 70, c.y + 84, 16, '#7a5a33', 'left');
  } else {
    text(ctx, '点一张订单开始做菜', c.x + 70, c.y + 58, 18, '#3a2a1a', 'left');
  }
  // The plate, with whatever is on it so far.
  const p = LAYOUT.plate;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#cbb98f'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.radius - 6, 0, Math.PI * 2); ctx.stroke();
  state.plate.forEach((id, i) => {
    const a = -Math.PI / 2 + (i - (state.plate.length - 1) / 2) * 0.9;
    drawIngredientIcon(ctx, id, p.x + Math.cos(a) * 34, p.y + Math.sin(a) * 30, 26);
  });
  if (state.plate.length === 0) text(ctx, '空盘子', p.x, p.y, 18, '#b09a7a');
  // Serve and trash buttons.
  const sb = LAYOUT.serveButton;
  const canServe = order && state.plate.length > 0;
  ctx.fillStyle = canServe ? '#e8442e' : '#c9bda6';
  rr(ctx, sb.x, sb.y, sb.width, sb.height, 12); ctx.fill();
  text(ctx, '🍽 上菜', sb.x + sb.width / 2, sb.y + sb.height / 2, 26, '#fff');
  const tb = LAYOUT.trashButton;
  ctx.fillStyle = '#8a7a63'; rr(ctx, tb.x, tb.y, tb.width, tb.height, 10); ctx.fill();
  text(ctx, '倒掉重做', tb.x + tb.width / 2, tb.y + tb.height / 2, 16, '#fff');
  if (state.message && state.elapsed - state.messageAt < 3) {
    text(ctx, state.message, c.x + c.width / 2, c.y + c.height - 24, 20, '#e8442e');
  }
}

function stationRect(index) {
  const s = LAYOUT.station;
  return {
    x: LAYOUT.stations.x + index * (s.width + s.gap),
    y: LAYOUT.stations.y, width: s.width, height: s.height,
  };
}

export function stationAt(x, y) {
  for (let i = 0; i < INGREDIENT_ORDER.length; i += 1) {
    const r = stationRect(i);
    if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return INGREDIENT_ORDER[i];
  }
  return null;
}

function drawStations(ctx, state) {
  text(ctx, '食材台 — 点一下开始切 / 煎，好了再点一下装盘', LAYOUT.stations.x + 6, LAYOUT.stations.y - 14, 18, '#3a2a1a', 'left');
  INGREDIENT_ORDER.forEach((id, i) => {
    const ing = INGREDIENTS[id];
    const st = state.stations[id];
    const r = stationRect(i);
    ctx.fillStyle = '#fff8ea'; rr(ctx, r.x, r.y, r.width, r.height, 14); ctx.fill();
    ctx.strokeStyle = st.status === 'ready' ? '#e8442e' : '#d9c39a'; ctx.lineWidth = st.status === 'ready' ? 5 : 2;
    rr(ctx, r.x, r.y, r.width, r.height, 14); ctx.stroke();
    drawIngredientIcon(ctx, id, r.x + 60, r.y + 60, 40);
    text(ctx, `${ing.name} · ${ing.verb}`, r.x + 120, r.y + 40, 24, '#3a2a1a', 'left');
    text(ctx, ing.en, r.x + 120, r.y + 72, 16, '#7a5a33', 'left');
    if (st.status === 'idle') {
      text(ctx, `点一下开始${ing.verb}（${ing.prepSeconds}秒）`, r.x + r.width / 2, r.y + 128, 16, '#7a5a33');
    } else if (st.status === 'prepping') {
      const pw = r.width - 40;
      ctx.fillStyle = '#e8dcc4'; rr(ctx, r.x + 20, r.y + 118, pw, 16, 8); ctx.fill();
      ctx.fillStyle = '#e8a13c'; rr(ctx, r.x + 20, r.y + 118, pw * st.progress, 16, 8); ctx.fill();
      text(ctx, `${ing.verb}菜中…`, r.x + r.width / 2, r.y + 152, 16, '#7a5a33');
    } else {
      text(ctx, '✓ 好了！点一下装盘', r.x + r.width / 2, r.y + 128, 18, '#e8442e');
    }
  });
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(40, 24, 10, 0.55)'; ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff6dd'; rr(ctx, 240, 110, 800, 420, 24); ctx.fill();
  text(ctx, '☀️ Sunny Side Kitchen', 640, 180, 52, '#e8442e');
  text(ctx, '阳 光 小 厨', 640, 245, 40, '#3a2a1a');
  text(ctx, '接单 → 切菜煎蛋 → 装盘上菜，别让客人等太久！', 640, 305, 22, '#7a5a33');
  text(ctx, '目标：150 秒内拿到 300 分 · 失误 3 次就打烊', 640, 345, 20, '#3a2a1a');
  text(ctx, '三道招牌菜：田园沙拉 / 阳光三明治 / 香煎荷包蛋', 640, 380, 20, '#7a5a33');
  const b = LAYOUT.startButton;
  ctx.fillStyle = '#e8442e'; rr(ctx, b.x, b.y, b.width, b.height, 14); ctx.fill();
  text(ctx, '开始营业 ▶', b.x + b.width / 2, b.y + b.height / 2, 28, '#fff');
  text(ctx, '鼠标点一点就能玩 · 键盘 1-4 选食材，空格上菜', 640, 630, 16, '#fff');
}

function drawEnd(ctx, state, win) {
  ctx.fillStyle = win ? 'rgba(30, 90, 40, 0.55)' : 'rgba(60, 20, 10, 0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff6dd'; rr(ctx, 240, 110, 800, 420, 24); ctx.fill();
  text(ctx, win ? '🎉 今日明星厨师！' : '打烊了…', 640, 190, 48, win ? '#2f7d3d' : '#e8442e');
  text(ctx, win ? `你拿到了 ${state.score} 分，客人们吃得心满意足！` : `只拿到 ${state.score} 分，离 300 分还差一点。`, 640, 260, 24, '#3a2a1a');
  text(ctx, `成功上菜 ${state.servedCount} 道 · 失误 ${state.mistakes} 次`, 640, 310, 22, '#7a5a33');
  text(ctx, win ? '明天继续营业，争取更高的分！' : '别灰心，先做简单的荷包蛋练练手！', 640, 350, 20, '#7a5a33');
  const b = LAYOUT.againButton;
  ctx.fillStyle = '#e8442e'; rr(ctx, b.x, b.y, b.width, b.height, 14); ctx.fill();
  text(ctx, '再来一局 ↻', b.x + b.width / 2, b.y + b.height / 2, 28, '#fff');
}

/** Draw the whole game for the current state. */
export function draw(state, ctx) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawKitchen(ctx);
  if (state.screen === SCREEN_TITLE) {
    drawOrderBoard(ctx, state);
    drawHud(ctx, { ...state, timeLeft: 150, score: 0, mistakes: 0 });
    drawCounter(ctx, state);
    drawStations(ctx, state);
    drawTitle(ctx, state);
    return;
  }
  drawOrderBoard(ctx, state);
  drawHud(ctx, state);
  drawCounter(ctx, state);
  drawStations(ctx, state);
  if (state.screen === SCREEN_WIN) drawEnd(ctx, state, true);
  if (state.screen === SCREEN_LOSS) drawEnd(ctx, state, false);
}
