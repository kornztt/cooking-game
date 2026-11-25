// Sunny Side Kitchen: the whole game state and its rules, no DOM here.
// Screens: title -> play -> win | loss. The loop is: take an order, prep its
// ingredients at the stations, plate them, serve before the customer walks out.
import { TIMING } from './config.js';
import { DISHES, INGREDIENTS, INGREDIENT_ORDER, pickDishId } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSS = 'loss';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_OVER = 4;

/** Small seeded RNG (mulberry32) so screenshot scenes are reproducible. */
export function makeRand(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function freshState(seed) {
  const stations = {};
  for (const id of INGREDIENT_ORDER) stations[id] = { status: 'idle', progress: 0 };
  return {
    screen: SCREEN_TITLE,
    seed,
    elapsed: 0,
    timeLeft: TIMING.shiftSeconds,
    score: 0,
    mistakes: 0,
    orders: [],
    nextOrderId: 1,
    activeOrderId: null,
    plate: [],
    stations,
    spawnIn: TIMING.spawnFirstSeconds,
    message: '',
    messageAt: 0,
    servedCount: 0,
  };
}

export function createWorld(seed) {
  const rand = makeRand(seed || 1);
  const state = freshState(seed || 1);
  return { state, rand };
}

export function startGame(world) {
  const s = world.state;
  Object.assign(s, freshState(s.seed));
  s.screen = SCREEN_PLAY;
  spawnOrder(world);
}

function patienceFor(elapsed) {
  const t = Math.min(1, elapsed / TIMING.shiftSeconds);
  return TIMING.patienceStartSeconds + (TIMING.patienceEndSeconds - TIMING.patienceStartSeconds) * t;
}

function spawnInterval(elapsed) {
  const t = Math.min(1, elapsed / TIMING.shiftSeconds);
  return TIMING.spawnStartSeconds + (TIMING.spawnEndSeconds - TIMING.spawnStartSeconds) * t;
}

export function spawnOrder(world) {
  const s = world.state;
  if (s.orders.length >= TIMING.maxOrders) return null;
  const dishId = pickDishId(s.elapsed, world.rand);
  const patience = patienceFor(s.elapsed);
  const order = { id: s.nextOrderId, dishId, patience, maxPatience: patience };
  s.nextOrderId += 1;
  s.orders.push(order);
  if (s.activeOrderId === null) s.activeOrderId = order.id;
  return order;
}

export function activeOrder(state) {
  return state.orders.find((o) => o.id === state.activeOrderId) || null;
}

export function dishOf(order) {
  return DISHES[order.dishId];
}

/** Click an order ticket: it becomes the dish being assembled; the plate resets. */
export function selectOrder(world, orderId) {
  const s = world.state;
  if (s.screen !== SCREEN_PLAY) return false;
  if (!s.orders.some((o) => o.id === orderId)) return false;
  if (s.activeOrderId === orderId) return true;
  s.activeOrderId = orderId;
  s.plate = [];
  return true;
}

/** Click a station: idle starts prepping, ready moves the ingredient to the plate. */
export function clickStation(world, ingredientId) {
  const s = world.state;
  if (s.screen !== SCREEN_PLAY) return 'idle';
  const st = s.stations[ingredientId];
  if (!st) return 'idle';
  if (st.status === 'idle') {
    st.status = 'prepping';
    st.progress = 0;
    return 'prepping';
  }
  if (st.status === 'ready') {
    st.status = 'idle';
    st.progress = 0;
    s.plate.push(ingredientId);
    return 'plated';
  }
  return st.status;
}

/** Throw the plate away and start the dish again. */
export function clearPlate(world) {
  const s = world.state;
  if (s.screen !== SCREEN_PLAY) return;
  s.plate = [];
}

/** Serve the plate to the active order. Returns 'served' | 'wrong' | 'empty' | 'none'. */
export function servePlate(world) {
  const s = world.state;
  if (s.screen !== SCREEN_PLAY) return 'none';
  const order = activeOrder(s);
  if (!order) return 'none';
  if (s.plate.length === 0) return 'empty';
  const dish = dishOf(order);
  const want = [...dish.recipe].sort().join(',');
  const got = [...s.plate].sort().join(',');
  s.plate = [];
  if (want !== got) {
    registerMistake(world, '配错了！按订单上的食材装盘');
    return 'wrong';
  }
  const bonus = Math.round(order.patience * 2);
  s.score += dish.points + bonus;
  s.servedCount += 1;
  s.orders = s.orders.filter((o) => o.id !== order.id);
  s.activeOrderId = s.orders.length ? s.orders[0].id : null;
  setMessage(s, `上菜成功 +${dish.points + bonus} 分！`);
  if (s.score >= TIMING.targetScore) {
    s.screen = SCREEN_WIN;
    return 'served-win';
  }
  return 'served';
}

function setMessage(s, text) {
  s.message = text;
  s.messageAt = s.elapsed;
}

function registerMistake(world, text) {
  const s = world.state;
  s.mistakes += 1;
  setMessage(s, text);
  if (s.mistakes >= TIMING.maxMistakes) s.screen = SCREEN_LOSS;
}

/** Advance the shift by dt seconds. Returns an event bitmask. */
export function step(world, dt) {
  const s = world.state;
  if (s.screen !== SCREEN_PLAY) return 0;
  let events = 0;
  s.elapsed += dt;
  s.timeLeft -= dt;
  for (const id of INGREDIENT_ORDER) {
    const st = s.stations[id];
    if (st.status === 'prepping') {
      st.progress += dt / INGREDIENTS[id].prepSeconds;
      if (st.progress >= 1) { st.status = 'ready'; st.progress = 1; }
    }
  }
  for (const order of s.orders) order.patience -= dt;
  const expired = s.orders.filter((o) => o.patience <= 0);
  if (expired.length) {
    s.orders = s.orders.filter((o) => o.patience > 0);
    if (s.activeOrderId !== null && !s.orders.some((o) => o.id === s.activeOrderId)) {
      s.activeOrderId = s.orders.length ? s.orders[0].id : null;
      s.plate = [];
    }
    for (const order of expired) {
      registerMistake(world, `客人等太久走了：${dishOf(order).name}`);
      events |= EVENT_EXPIRED;
      if (s.screen !== SCREEN_PLAY) break;
    }
  }
  if (s.screen === SCREEN_PLAY) {
    s.spawnIn -= dt;
    if (s.spawnIn <= 0) {
      spawnOrder(world);
      s.spawnIn = spawnInterval(s.elapsed);
    }
  }
  if (s.screen === SCREEN_PLAY && s.timeLeft <= 0) {
    s.timeLeft = 0;
    s.screen = s.score >= TIMING.targetScore ? SCREEN_WIN : SCREEN_LOSS;
    events |= EVENT_OVER;
  }
  return events;
}

/** Seconds left before the shift ends, whole seconds for the HUD. */
export function timeLeftSeconds(state) {
  return Math.max(0, Math.ceil(state.timeLeft));
}

/** 0..1 urgency of the active order's patience, for the timer bar. */
export function activePatienceRatio(state) {
  const order = activeOrder(state);
  if (!order) return 1;
  return Math.max(0, order.patience / order.maxPatience);
}
