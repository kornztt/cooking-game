// Sunny Side Kitchen: fixed logical canvas size and layout zones.
// Every zone is a rectangle the renderer draws and the input layer hit-tests.
export const VIEW = { width: 1280, height: 720 };

export const LAYOUT = {
  // Order board across the top.
  board: { x: 24, y: 16, width: 1232, height: 118 },
  orderSlot: { width: 220, height: 96, gap: 16 },
  // HUD strip under the board.
  hud: { x: 24, y: 146, width: 1232, height: 44 },
  // The plating counter in the middle.
  counter: { x: 24, y: 204, width: 1232, height: 250 },
  plate: { x: 560, y: 315, radius: 95 },
  serveButton: { x: 1000, y: 300, width: 190, height: 64 },
  trashButton: { x: 1000, y: 380, width: 190, height: 44 },
  // Ingredient stations along the bottom.
  stations: { x: 24, y: 480, width: 1232, height: 200 },
  station: { width: 280, height: 170, gap: 36 },
  startButton: { x: 490, y: 520, width: 300, height: 72 },
  againButton: { x: 490, y: 520, width: 300, height: 72 },
};

export const TIMING = {
  shiftSeconds: 150,
  targetScore: 450,
  maxMistakes: 3,
  spawnFirstSeconds: 4,
  spawnStartSeconds: 13,
  spawnEndSeconds: 6,
  patienceStartSeconds: 34,
  patienceEndSeconds: 22,
  maxOrders: 4,
};
