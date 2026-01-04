export type Cell = { x: number; y: number };
export type Slot = { group: Cell[]; rep: Cell };

/**
 * Gom các ô có value === 1 thành các nhóm (connected components) bằng BFS/DFS.
 */
export function groupSlots(matrix: number[][]): Cell[][] {
    const rows = matrix.length;
    const cols = matrix[0]?.length ?? 0;
    const visited = new Set<string>();
    const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ] as const;

    const groups: Cell[][] = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (matrix[r]?.[c] !== 1) continue;
            const key = `${r}-${c}`;
            if (visited.has(key)) continue;

            const queue: Cell[] = [{ x: r, y: c }];
            visited.add(key);
            const group: Cell[] = [{ x: r, y: c }];

            while (queue.length) {
                const { x, y } = queue.shift()!;

                for (const [dx, dy] of dirs) {
                    const nx = x + dx;
                    const ny = y + dy;
                    const nkey = `${nx}-${ny}`;

                    if (matrix[nx]?.[ny] === 1 && !visited.has(nkey)) {
                        visited.add(nkey);
                        queue.push({ x: nx, y: ny });
                        group.push({ x: nx, y: ny });
                    }
                }
            }

            groups.push(group);
        }
    }

    return groups;
}

/**
 * Chọn representative cell cho một group.
 * strategy: 'first' | 'random' | 'center'
 */
function pickRepresentative(group: Cell[], strategy: 'first' | 'random' | 'center' = 'random'): Cell {
    if (group.length === 0) throw new Error('Empty group');
    if (strategy === 'first') return group[0];
    if (strategy === 'random') return group[Math.floor(Math.random() * group.length)];

    // center: pick cell with minimal average distance to others (simple heuristic)
    let best = group[0];
    let bestScore = Infinity;
    for (const a of group) {
        let score = 0;
        for (const b of group) {
            score += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
        }
        if (score < bestScore) {
            bestScore = score;
            best = a;
        }
    }
    return best;
}

/**
 * Trả về các Slot (group + rep).
 * - matrix: map input
 * - count: số slot cần chọn (nếu > available thì trả về tất cả)
 * - options.strategy: cách chọn representative
 */
export default function getRandomSensorSlots(
    matrix: number[][],
    count: number,
    options?: { strategy?: 'first' | 'random' | 'center' }
): Slot[] {
    const groups = groupSlots(matrix);
    if (groups.length === 0) return [];

    // Tạo slots (group + rep)
    const slots: Slot[] = groups.map((group) => ({
        group,
        rep: pickRepresentative(group, options?.strategy ?? 'random'),
    }));

    // Nếu count >= số slot, trả về tất cả (shuffle trước để ngẫu nhiên)
    const shuffled = slots.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)));
}
