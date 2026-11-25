[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/kornztt/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/kornztt/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Sunny Side Kitchen · 阳光小厨

A complete, original cooking game in plain HTML5 canvas — no images, no
network, every pixel drawn in code.

**The loop:** take an order from the board → prep its ingredients at the
stations (chop the tomato, wash the lettuce, toast the bread, fry the egg)
→ plate them → serve before the customer walks out.

- **3 original dishes:** 田园沙拉 Garden Salad (tomato + lettuce),
  阳光三明治 Sunny Sandwich (bread + egg + tomato),
  香煎荷包蛋 Fried Egg (egg).
- **Pressure that grows:** orders arrive faster and customers get less
  patient as the 150-second shift goes on.
- **Win / lose:** reach 300 points to become the day's star chef; 3
  mistakes (wrong plate or a walked-out customer) or the clock running out
  below target closes the kitchen.
- **Controls:** mouse click to play; keys 1–4 prep ingredients, Space
  serves, T clears the plate.

## Play it

Serve `game/` with any static server and open `index.html`, e.g.
`python3 -m http.server` inside `game/`.

Screenshot scenes: `index.html?shot=title|play|win|loss` stages a real
played scene (seeded, deterministic) for screenshots.

## Self-test

`node tools/probe.mjs` — 20 assertions over the real game rules
(start, orders, prep, serve, timer, win, loss), zero console errors.

## Hand in

`mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` writes
`out/game/`, `out/screenshots/` and `out/dossier.json`.
