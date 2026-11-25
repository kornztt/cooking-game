// Sunny Side Kitchen: mouse and keyboard input, mapped onto the game zones.
import { LAYOUT } from './config.js';
import { INGREDIENT_ORDER } from './recipes.js';
import { clearPlate, clickStation, selectOrder, servePlate, startGame } from './world.js';
import { orderSlotAt, stationAt } from './render.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
}

/** Handle a click at logical canvas coordinates. Returns what happened. */
export function handleClick(world, x, y) {
  const s = world.state;
  if (s.screen === 'title') {
    if (inside(x, y, LAYOUT.startButton)) { startGame(world); return 'start'; }
    return 'title';
  }
  if (s.screen === 'win' || s.screen === 'loss') {
    if (inside(x, y, LAYOUT.againButton)) { startGame(world); return 'restart'; }
    return 'end';
  }
  const orderId = orderSlotAt(s, x, y);
  if (orderId !== null) return selectOrder(world, orderId) ? 'select-order' : 'select-fail';
  if (inside(x, y, LAYOUT.serveButton)) return servePlate(world);
  if (inside(x, y, LAYOUT.trashButton)) { clearPlate(world); return 'trash'; }
  const station = stationAt(x, y);
  if (station) return clickStation(world, station);
  return 'none';
}

/** Keyboard: 1-4 prep an ingredient, Space serves, T trashes the plate. */
export function handleKey(world, key) {
  const s = world.state;
  if (s.screen === 'title' && (key === 'Enter' || key === ' ')) { startGame(world); return 'start'; }
  if ((s.screen === 'win' || s.screen === 'loss') && key === 'Enter') { startGame(world); return 'restart'; }
  if (s.screen !== 'play') return 'none';
  if (key >= '1' && key <= '4') return clickStation(world, INGREDIENT_ORDER[Number(key) - 1]);
  if (key === ' ') return servePlate(world);
  if (key === 't' || key === 'T') { clearPlate(world); return 'trash'; }
  return 'none';
}
