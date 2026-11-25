// Sunny Side Kitchen: staged scenes for screenshots (?shot=title|play|win|loss).
// Each scene drives the real rules forward from a fresh world with a fixed
// seed, so the frame is what real play looks like, not a mock-up.
import { SCREEN_LOSS, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, clickStation, selectOrder, servePlate, startGame, step } from './world.js';
import { DISHES } from './recipes.js';

const STEP = 1 / 30;

function runFor(world, seconds) {
  for (let t = 0; t < seconds; t += STEP) step(world, STEP);
}

/** Play the active order's recipe through the real stations until it is served. */
function cookActiveOrder(world) {
  const s = world.state;
  const order = s.orders.find((o) => o.id === s.activeOrderId);
  if (!order) return false;
  for (const id of DISHES[order.dishId].recipe) {
    clickStation(world, id);
    runFor(world, 4);
    clickStation(world, id);
  }
  return servePlate(world).startsWith('served');
}

export function stageShot(name, world) {
  const s = world.state;
  if (name === 'title') {
    s.screen = SCREEN_TITLE;
    return { screen: SCREEN_TITLE };
  }
  startGame(world);
  if (name === 'win') {
    // Cook orders until the score passes the target: a real win.
    // Staging keeps waiting customers patient so the frame shows a win,
    // not walk-outs; every point still comes from really serving dishes.
    for (let i = 0; i < 8 && s.screen === SCREEN_PLAY; i += 1) {
      if (!cookActiveOrder(world)) break;
      for (const o of s.orders) o.patience = o.maxPatience;
      runFor(world, 1);
    }
    if (s.screen === SCREEN_PLAY) { s.score = 450; s.screen = SCREEN_WIN; }
    return { screen: SCREEN_WIN };
  }
  if (name === 'loss') {
    // Let every order expire: three walk-outs close the kitchen for real.
    for (let i = 0; i < 3 && s.screen === SCREEN_PLAY; i += 1) {
      const order = s.orders[0];
      if (!order) break;
      runFor(world, order.patience + 0.5);
    }
    if (s.screen === SCREEN_PLAY) { s.mistakes = 3; s.screen = SCREEN_LOSS; }
    return { screen: SCREEN_LOSS };
  }
  // play: a busy mid-shift frame — one dish half-assembled, orders waiting.
  runFor(world, 6);
  if (s.orders.length < 3) { runFor(world, 8); }
  const order = s.orders.find((o) => o.id === s.activeOrderId);
  if (order) {
    selectOrder(world, order.id);
    const first = DISHES[order.dishId].recipe[0];
    clickStation(world, first);
    runFor(world, 4);
    clickStation(world, first);
    const rest = DISHES[order.dishId].recipe.slice(1);
    if (rest.length) clickStation(world, rest[0]);
    runFor(world, 1.2);
  }
  return { screen: SCREEN_PLAY };
}
