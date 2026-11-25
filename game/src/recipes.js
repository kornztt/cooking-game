// Sunny Side Kitchen: the ingredients and the dishes they build.
// Every dish is an original recipe of this kitchen; nothing is borrowed.
export const INGREDIENTS = {
  tomato: { id: 'tomato', name: '番茄', en: 'Tomato', color: '#e8442e', dark: '#b32a18', prepSeconds: 2.0, verb: '切' },
  lettuce: { id: 'lettuce', name: '生菜', en: 'Lettuce', color: '#58b368', dark: '#2f7d3d', prepSeconds: 1.5, verb: '洗' },
  bread: { id: 'bread', name: '面包', en: 'Bread', color: '#e8b25a', dark: '#b57e2e', prepSeconds: 1.0, verb: '烤' },
  egg: { id: 'egg', name: '鸡蛋', en: 'Egg', color: '#ffd94d', dark: '#d9a400', prepSeconds: 3.0, verb: '煎' },
};

export const INGREDIENT_ORDER = ['tomato', 'lettuce', 'bread', 'egg'];

/** Each dish lists the ingredients it needs, in serving order. */
export const DISHES = {
  salad: {
    id: 'salad', name: '田园沙拉', en: 'Garden Salad',
    recipe: ['tomato', 'lettuce'], points: 100, color: '#58b368',
  },
  sandwich: {
    id: 'sandwich', name: '阳光三明治', en: 'Sunny Sandwich',
    recipe: ['bread', 'egg', 'tomato'], points: 140, color: '#e8b25a',
  },
  friedEgg: {
    id: 'friedEgg', name: '香煎荷包蛋', en: 'Fried Egg',
    recipe: ['egg'], points: 70, color: '#ffd94d',
  },
};

export const DISH_ORDER = ['salad', 'sandwich', 'friedEgg'];

/** The dish of an order, by how far into the shift we are: early orders are simple. */
export function pickDishId(elapsedSeconds, rand) {
  if (elapsedSeconds < 35) return rand() < 0.6 ? 'friedEgg' : 'salad';
  if (elapsedSeconds < 80) return DISH_ORDER[Math.floor(rand() * DISH_ORDER.length)];
  return rand() < 0.45 ? 'sandwich' : DISH_ORDER[Math.floor(rand() * DISH_ORDER.length)];
}
