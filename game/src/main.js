// Sunny Side Kitchen: wiring — canvas loop, input, and ?shot= staging.
import { VIEW } from './config.js';
import { createWorld, step } from './world.js';
import { draw } from './render.js';
import { handleClick, handleKey } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
  canvas.width = VIEW.width;
  canvas.height = VIEW.height;
  canvas.style.width = `${Math.floor(VIEW.width * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW.height * scale)}px`;
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7');
const world = createWorld(seed);
const shot = params.get('shot');

function announce() {
  const s = world.state;
  statusEl.textContent = `Sunny Side Kitchen: ${s.screen}, score ${s.score}, ${Math.ceil(s.timeLeft)} seconds left, ${s.orders.length} orders`;
}

if (shot) {
  // Screenshot mode: stage the scene once and draw it, no loop needed.
  stageShot(shot, world);
  draw(world.state, ctx);
  announce();
} else {
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    step(world, dt);
    draw(world.state, ctx);
    announce();
    requestAnimationFrame(loop);
  }
  draw(world.state, ctx);
  requestAnimationFrame(loop);
}

function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (VIEW.width / rect.width),
    y: (event.clientY - rect.top) * (VIEW.height / rect.height),
  };
}

canvas.addEventListener('click', (event) => {
  const p = toLogical(event);
  handleClick(world, p.x, p.y);
  draw(world.state, ctx);
  announce();
});
window.addEventListener('keydown', (event) => {
  if (event.key === ' ') event.preventDefault();
  handleKey(world, event.key);
  draw(world.state, ctx);
  announce();
});
