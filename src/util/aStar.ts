type Point = { r: number; c: number };

const DIRS = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 },
];

const heuristic = (a: Point, b: Point) =>
    Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

export const findPathAStar = (
    grid: number[][],
    start: Point,
    end: Point
): Point[] => {
    const open = new Set<string>();
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const key = (p: Point) => `${p.r}-${p.c}`;

    open.add(key(start));
    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, end));

    while (open.size) {
        const currentKey = [...open].reduce((a, b) =>
            (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
        );

        const [r, c] = currentKey.split("-").map(Number);
        const current = { r, c };

        if (r === end.r && c === end.c) {
            const path: Point[] = [];
            let k: string | undefined = currentKey;

            while (k) {
                const [rr, cc] = k.split("-").map(Number);
                path.unshift({ r: rr, c: cc });
                k = cameFrom.get(k);
            }
            return path;
        }

        open.delete(currentKey);

        for (const d of DIRS) {
            const next = { r: r + d.r, c: c + d.c };
            if (grid[next.r]?.[next.c] !== 0) continue; // chỉ đi đường

            const nk = key(next);
            const tentative = (gScore.get(currentKey) ?? Infinity) + 1;

            if (tentative < (gScore.get(nk) ?? Infinity)) {
                cameFrom.set(nk, currentKey);
                gScore.set(nk, tentative);
                fScore.set(nk, tentative + heuristic(next, end));
                open.add(nk);
            }
        }
    }

    return [];
};
