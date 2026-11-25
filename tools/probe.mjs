// Sunny Side Kitchen probe: runs the real game logic in Node, no browser.
// Usage: node tools/probe.mjs  (exit 0 only when every assertion passes)
import { createWorld, startGame, step, spawnOrder, selectOrder, clickStation, servePlate, clearPlate, timeLeftSeconds } from '../game/src/world.js';
import { handleClick, handleKey } from '../game/src/input.js';
import { DISHES } from '../game/src/recipes.js';

let passed = 0;
let failed = 0;
const errors = [];
const origError = console.error;
console.error = (...a) => { errors.push(a.join(' ')); origError(...a); };

function check(name, cond) {
  if (cond) { passed += 1; console.log(`ok   ${name}`); }
  else { failed += 1; console.log(`FAIL ${name}`); }
}

const STEP = 1 / 30;
function runFor(w, s) { for (let t = 0; t < s; t += STEP) step(w, STEP); }
function cookOrder(w) {
  const s = w.state;
  const order = s.orders.find((o) => o.id === s.activeOrderId);
  for (const id of DISHES[order.dishId].recipe) {
    clickStation(w, id); runFor(w, 4); clickStation(w, id);
  }
  return servePlate(w);
}

// 1. Fresh world opens on the title screen.
{
  const w = createWorld(7);
  check('1 fresh world is on title screen', w.state.screen === 'title');
  check('2 fresh world has no orders yet', w.state.orders.length === 0);
}
// 3. Starting the game spawns the first order and makes it active.
{
  const w = createWorld(7);
  startGame(w);
  check('3 startGame enters play with one order', w.state.screen === 'play' && w.state.orders.length === 1);
  check('4 first order is active', w.state.activeOrderId === w.state.orders[0].id);
}
// 5. A second order can spawn and be selected; selecting clears the plate.
{
  const w = createWorld(7);
  startGame(w);
  spawnOrder(w);
  w.state.plate.push('egg');
  const ok = selectOrder(w, w.state.orders[1].id);
  check('5 selectOrder switches active and clears plate', ok && w.state.activeOrderId === w.state.orders[1].id && w.state.plate.length === 0);
}
// 6-8. Prep loop: station idle -> prepping -> ready -> plated.
{
  const w = createWorld(7);
  startGame(w);
  check('6 clicking an idle station starts prepping', clickStation(w, 'tomato') === 'prepping');
  runFor(w, 1);
  check('7 tomato is still prepping after 1s', w.state.stations.tomato.status === 'prepping');
  runFor(w, 2);
  check('8 tomato is ready after its 2s prep', w.state.stations.tomato.status === 'ready');
  check('9 clicking a ready station plates it', clickStation(w, 'tomato') === 'plated' && w.state.plate.includes('tomato'));
}
// 10. Serving the exact recipe scores points and removes the order.
{
  const w = createWorld(7);
  startGame(w);
  const before = w.state.orders.length;
  const orderId = w.state.activeOrderId;
  const res = cookOrder(w);
  check('10 serving the full recipe serves the order', res.startsWith('served') && w.state.score > 0 && !w.state.orders.some((o) => o.id === orderId));
}
// 11. Serving the wrong plate is a mistake.
{
  const w = createWorld(7);
  startGame(w);
  w.state.plate.push('bread');
  const res = servePlate(w);
  check('11 wrong plate counts one mistake', res === 'wrong' && w.state.mistakes === 1);
}
// 12. Three mistakes close the kitchen.
{
  const w = createWorld(7);
  startGame(w);
  for (let i = 0; i < 3; i += 1) { w.state.plate.push('bread'); servePlate(w); }
  check('12 three mistakes ends in loss', w.state.screen === 'loss' && w.state.mistakes === 3);
}
// 13. An order that runs out of patience walks out and counts a mistake.
{
  const w = createWorld(7);
  startGame(w);
  const orderId = w.state.orders[0].id;
  const patience = w.state.orders[0].patience;
  runFor(w, patience + 0.5);
  check('13 expired order is gone and is a mistake', !w.state.orders.some((o) => o.id === orderId) && w.state.mistakes === 1);
}
// 14. The clock runs down; time out below target is a loss.
{
  const w = createWorld(7);
  startGame(w);
  w.state.orders = []; w.state.activeOrderId = null; w.state.spawnIn = 999;
  runFor(w, 151);
  check('14 shift timer expiry below target is a loss', w.state.screen === 'loss' && timeLeftSeconds(w.state) === 0);
}
// 15. Reaching the target score wins.
{
  const w = createWorld(7);
  startGame(w);
  w.state.score = 440;
  const res = cookOrder(w);
  check('15 reaching 450 points wins', res === 'served-win' && w.state.screen === 'win');
}
// 16. Difficulty ramps: later orders are less patient than early ones.
{
  const w = createWorld(7);
  startGame(w);
  const early = w.state.orders[0].maxPatience;
  w.state.elapsed = 120;
  const late = spawnOrder(w);
  check('16 late-shift orders have less patience', late && late.maxPatience < early);
}
// 17. Clearing the plate empties it.
{
  const w = createWorld(7);
  startGame(w);
  w.state.plate.push('egg', 'bread');
  clearPlate(w);
  check('17 clearPlate empties the plate', w.state.plate.length === 0);
}
// 18-19. Mouse + keyboard input drive the same rules.
{
  const w = createWorld(7);
  const res = handleClick(w, 640, 556); // start button
  check('18 clicking Start begins the game', res === 'start' && w.state.screen === 'play');
  const key = handleKey(w, '1');
  check('19 keyboard 1 starts prepping tomato', key === 'prepping' && w.state.stations.tomato.status === 'prepping');
}
// 20. No console errors during the whole probe.
check('20 zero console errors', errors.length === 0);

console.log(`\nprobe: ${passed} passed, ${failed} failed`);
process.exit(failed || errors.length ? 1 : 0);
