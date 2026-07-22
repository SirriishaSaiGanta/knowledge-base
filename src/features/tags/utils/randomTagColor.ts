const PALETTE = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#ec4899', '#f97316', '#8b5cf6'];

export function randomTagColor(): string {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}
