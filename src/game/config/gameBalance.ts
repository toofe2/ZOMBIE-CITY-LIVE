export const HERO_LEVELS = {
  1:{maxHP:1000,armor:0,engagement:2.1,detection:18,damageMultiplier:1},
  2:{maxHP:1800,armor:.05,engagement:8,detection:20,damageMultiplier:1.15},
  3:{maxHP:3200,armor:.10,engagement:9,detection:22,damageMultiplier:1.35},
  4:{maxHP:5000,armor:.15,engagement:7,detection:22,damageMultiplier:1.55},
  5:{maxHP:7500,armor:.20,engagement:10,detection:24,damageMultiplier:1.8},
  6:{maxHP:10500,armor:.25,engagement:11,detection:25,damageMultiplier:2.05},
  7:{maxHP:14500,armor:.30,engagement:12,detection:26,damageMultiplier:2.35},
  8:{maxHP:20000,armor:.35,engagement:11,detection:26,damageMultiplier:2.7},
  9:{maxHP:28000,armor:.40,engagement:12,detection:27,damageMultiplier:3.1},
  10:{maxHP:40000,armor:.45,engagement:13,detection:28,damageMultiplier:3.7}
} as const;

export const ZOMBIE_BALANCE = {
  walker:{hp:100,damage:6,attackCooldown:1.2,meleeRange:1.7}
} as const;

export const GIFT_HEALING = { sameOrLower:.10, upgrade1to2:.20, upgrade3Plus:.30 } as const;