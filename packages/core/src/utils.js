export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export function modAngle(a) {
  a = (a + Math.PI) % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a - Math.PI;
}