type Node = [number, number];
const INF = Number.POSITIVE_INFINITY;

export class DStarLite {
    grid: number[][];
    rows: number;
    cols: number;

    start: Node;
    goals: Node[];
    superGoal: Node = [-1, -1];

    g: Map<string, number> = new Map();
    rhs: Map<string, number> = new Map();
    U: [number[], Node][] = [];

    constructor(grid: number[][], start: Node, goals: Node[]) {
        this.grid = grid;
        this.rows = grid.length;
        this.cols = grid[0].length;

        this.start = start;
        this.goals = goals;

        // Init g, rhs
        for (let r = -1; r < this.rows; r++) {
            for (let c = -1; c < this.cols; c++) {
                const key = `${r},${c}`;
                this.g.set(key, INF);
                this.rhs.set(key, INF);
            }
        }

        // Super-goal
        this.rhs.set(`${this.superGoal}`, 0);

        this.pushQueue(this.superGoal, this.calculateKey(this.superGoal));
    }

    /* ---------------------- Utilities ---------------------- */

    key(n: Node) {
        return `${n[0]},${n[1]}`;
    }

    heuristic(a: Node, b: Node) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    cost(a: Node, b: Node) {
        if (this.isSuper(a) || this.isSuper(b)) return 0;
        return 1;
    }

    isSuper(n: Node) {
        return n[0] === -1 && n[1] === -1;
    }

    getNeighbors(n: Node): Node[] {
        // Super goal → tất cả mục tiêu
        if (this.isSuper(n)) return this.goals;

        // Goal → nối đến super goal
        if (this.goals.some(g => g[0] === n[0] && g[1] === n[1])) {
            return [this.superGoal];
        }

        const [r, c] = n;
        const res: Node[] = [];
        const dirs = [
            [-1,0],[1,0],[0,-1],[0,1]
        ];

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (this.grid[nr][nc] === 0) {
                    res.push([nr, nc]);
                }
            }
        }
        return res;
    }

    calculateKey(n: Node): number[] {
        const g = this.g.get(this.key(n))!;
        const rhs = this.rhs.get(this.key(n))!;
        const minVal = Math.min(g, rhs);

        return [
            minVal + this.heuristic(this.start, n),
            minVal
        ];
    }

    pushQueue(n: Node, key: number[]) {
        this.U.push([key, n]);
        this.U.sort((a, b) => (a[0][0] - b[0][0]) || (a[0][1] - b[0][1]));
    }

    popQueue(): [number[], Node] | undefined {
        return this.U.shift();
    }

    updateVertex(u: Node) {
        const ukey = this.key(u);

        if (!this.isSuper(u)) {
            let minRhs = INF;
            for (const s of this.getNeighbors(u)) {
                const val = this.g.get(this.key(s))! + this.cost(u, s);
                if (val < minRhs) minRhs = val;
            }
            this.rhs.set(ukey, minRhs);
        }

        // remove u from queue
        this.U = this.U.filter(item => item[1][0] !== u[0] || item[1][1] !== u[1]);

        if (this.g.get(ukey) !== this.rhs.get(ukey)) {
            this.pushQueue(u, this.calculateKey(u));
        }
    }

    computeShortestPath() {
        while (this.U.length > 0 &&
            (this.U[0][0] < this.calculateKey(this.start) ||
             this.rhs.get(this.key(this.start)) !== this.g.get(this.key(this.start)))) 
        {
            const [, u] = this.popQueue()!;
            const ukey = this.key(u);

            const gOld = this.g.get(ukey)!;
            const rhsU = this.rhs.get(ukey)!;

            if (gOld > rhsU) {
                this.g.set(ukey, rhsU);
                for (const s of this.getNeighbors(u)) this.updateVertex(s);
            } else {
                this.g.set(ukey, INF);
                for (const s of this.getNeighbors(u).concat([u])) {
                    this.updateVertex(s);
                }
            }
        }
    }

    /* ---------------------- BUILD THE PATH ---------------------- */

    getPath(): Node[] {
        this.computeShortestPath();
        
        let path: Node[] = [this.start];
        let current = this.start;

        while (!this.isSuper(current) && 
               !this.goals.some(g => g[0] === current[0] && g[1] === current[1])) 
        {
            const neighbors = this.getNeighbors(current);
            if (neighbors.length === 0) break;

            let best = neighbors[0];
            let bestCost = this.g.get(this.key(best))! + this.cost(current, best);

            for (const n of neighbors) {
                const val = this.g.get(this.key(n))! + this.cost(current, n);
                if (val < bestCost) {
                    best = n;
                    bestCost = val;
                }
            }

            path.push(best);
            current = best;
        }

        return path;
    }
}


/* ---------------------- Example API ---------------------- */

export function findPath(grid: number[][], start: Node, goals: Node[]) {
    const dstar = new DStarLite(grid, start, goals);
    return dstar.getPath();
}