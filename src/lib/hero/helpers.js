// Helper functions for hero section effects

export function randomEdgePoint(width, height, margin = 0) {
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0:
      return { x: -margin, y: Math.random() * height };
    case 1:
      return { x: width + margin, y: Math.random() * height };
    case 2:
      return { x: Math.random() * width, y: -margin };
    default:
      return { x: Math.random() * width, y: height + margin };
  }
}

export function extendToBoundary(start, dir, width, height, margin = 0) {
  const candidates = [];
  if (Math.abs(dir.x) > 0.0001) {
    candidates.push({ t: (width + margin - start.x) / dir.x, x: width + margin, axis: 'x' });
    candidates.push({ t: (-margin - start.x) / dir.x, x: -margin, axis: 'x' });
  }
  if (Math.abs(dir.y) > 0.0001) {
    candidates.push({ t: (height + margin - start.y) / dir.y, y: height + margin, axis: 'y' });
    candidates.push({ t: (-margin - start.y) / dir.y, y: -margin, axis: 'y' });
  }
  const valid = candidates.filter((c) => c.t > 0);
  if (!valid.length) return { x: start.x, y: start.y };
  const best = valid.reduce((min, c) => (c.t < min.t ? c : min), valid[0]);
  if (best.axis === 'x') {
    const y = start.y + dir.y * best.t;
    return { x: best.x, y };
  }
  const x = start.x + dir.x * best.t;
  return { x, y: best.y };
}

export function segmentCircleHit(a, b, circle) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = circle.x - a.x;
  const apy = circle.y - a.y;
  const abLenSq = abx * abx + aby * aby || 1;
  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = a.x + abx * t;
  const closestY = a.y + aby * t;
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}
