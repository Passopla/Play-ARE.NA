// A room is the original arrangement: floor images always, plus some of the 4 walls.
// Images fill rooms in order (floors first, so even a partly filled last room has a floor);
// extra rooms spiral outward from the origin.
const FLOOR = [-Math.PI / 2, 0, 0];

export const FLOOR_SLOTS = [
  { position: [0, 0, 0], rotation: FLOOR }, // Floating centre
  { position: [-1, -0.01, 4], rotation: FLOOR },
  { position: [1, -0.01, -4], rotation: FLOOR },
  { position: [-4, -0.01, 1], rotation: FLOOR },
  { position: [4, -0.01, 1], rotation: FLOOR },
];

export const WALL_SLOTS = [
  { position: [2, 2, 0], rotation: [0, -Math.PI / 2, 0] }, // Right wall
  { position: [-2, 1, 0], rotation: [0, Math.PI / 2, 0] }, // Left wall
  { position: [0, -1, 2], rotation: [0, Math.PI, 0] }, // Back wall
  { position: [0, 0, -2], rotation: [0, 0, 0] }, // Front wall
];

// Room footprint is roughly ±5.5 units, so 12 leaves a jumpable gap between rooms.
export const ROOM_SPACING = 12;

// Grid cells in a square spiral: (0,0), (1,0), (1,1), (0,1), (-1,1), ...
export function spiralCells(count) {
  const cells = [[0, 0]];
  let x = 0, z = 0, dx = 1, dz = 0, len = 1;
  while (cells.length < count) {
    for (let turn = 0; turn < 2; turn++) {
      for (let s = 0; s < len && cells.length < count; s++) {
        x += dx;
        z += dz;
        cells.push([x, z]);
      }
      [dx, dz] = [-dz, dx];
    }
    len++;
  }
  return cells.slice(0, count);
}

// Which walls a room keeps: 4 bits from a hash of the room number, so rooms vary
// (0 to 4 walls) but the same channel always builds the same world
export function roomWalls(room) {
  const bits = Math.imul(room + 1, 0x9e3779b1) >>> 28;
  return WALL_SLOTS.filter((_, wall) => bits & (1 << wall));
}

// Rooms as { cell: [x, z], items: [{ index, position, rotation }] } covering images 0..count-1
export function roomLayout(count) {
  const cells = spiralCells(Math.ceil(count / FLOOR_SLOTS.length)); // enough even if no room has walls
  const rooms = [];
  for (let index = 0, room = 0; index < count; room++) {
    const [cx, cz] = cells[room];
    const items = [];
    for (const { position: [x, y, z], rotation } of [...FLOOR_SLOTS, ...roomWalls(room)]) {
      if (index >= count) break;
      items.push({ index: index++, position: [x + cx * ROOM_SPACING, y, z + cz * ROOM_SPACING], rotation });
    }
    rooms.push({ cell: cells[room], items });
  }
  return rooms;
}

// Rooms to keep loaded around a world point (x, z), in Chebyshev rings of cells.
// Rooms join within loadRings and only leave past unloadRings, so crossing a
// cell boundary back and forth doesn't reload the edge rooms.
export function roomsNear(cells, [x, z], prev = new Set(), loadRings = 1, unloadRings = 2) {
  const px = Math.round(x / ROOM_SPACING);
  const pz = Math.round(z / ROOM_SPACING);
  const next = new Set();
  cells.forEach(([cx, cz], room) => {
    const d = Math.max(Math.abs(cx - px), Math.abs(cz - pz));
    if (d <= loadRings || (d <= unloadRings && prev.has(room))) next.add(room);
  });
  return next;
}
