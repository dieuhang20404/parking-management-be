type Node = [number, number];

class PriorityQueue<T> {
    private items: { element: T; priority: number }[] = [];

    enqueue(element: T, priority: number) {
        this.items.push({ element, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }

    dequeue(): T | undefined {
        return this.items.shift()?.element;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }
}

export class AStarPathfinder {
    private grid: number[][];
    private rows: number;
    private cols: number;

    constructor(grid: number[][]) {
        this.grid = grid;
        this.rows = grid.length;
        this.cols = grid[0]?.length ?? 0;
    }

    private key(node: Node): string {
        return `${node[0]},${node[1]}`;
    }

    private heuristic(a: Node, b: Node): number {
        // Manhattan distance
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    private isNearOccupiedParking(r: number, c: number): boolean {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.rows &&
                nc >= 0 && nc < this.cols &&
                this.grid[nr][nc] === -1) {
                return true;
            }
        }
        return false;
    }

    private isNextToGoal(r: number, c: number, goal: Node): boolean {
        const [goalRow, goalCol] = goal;
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of directions) {
            if (r + dr === goalRow && c + dc === goalCol) {
                return true;
            }
        }
        return false;
    }

    private isFree(node: Node, isGoal: boolean = false, goal?: Node): boolean {
        const [r, c] = node;
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return false;

        const val = this.grid[r][c];

        // Tường cứng
        const hardObstacles = [2, 3, 8];
        if (hardObstacles.includes(val)) return false;

        // Parking bị chiếm
        if (val === -1) return false;

        // Parking slot (1) chỉ được đi vào khi là goal
        if (val === 1 && !isGoal) return false;

        const parkingBorders = [4, 5, 6, 7, 9];
        if (parkingBorders.includes(val)) {
            return false;
        }

        return val === 0;

        return true;
    }

    private getNeighbors(node: Node, goal: Node): Node[] {
        const [r, c] = node;
        const directions: Node[] = [
            [r - 1, c],  // up
            [r + 1, c],  // down
            [r, c - 1],  // left
            [r, c + 1],  // right
        ];

        return directions.filter(n => {
            const isGoalNode = n[0] === goal[0] && n[1] === goal[1];
            return this.isFree(n, isGoalNode, goal);
        });
    }

    private reconstructPath(cameFrom: Map<string, Node>, current: Node): Node[] {
        const path: Node[] = [current];
        let currentKey = this.key(current);

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey)!;
            path.unshift(current);
            currentKey = this.key(current);
        }

        return path;
    }

    findPath(start: Node, goal: Node): Node[] {
        console.log("A* Start (row,col):", start, "-> value:", this.grid[start[0]]?.[start[1]]);
        console.log("A* Goal (row,col):", goal, "-> value:", this.grid[goal[0]]?.[goal[1]]);

        if (!this.isFree(start, false, goal)) {
            console.error("Start is not walkable!");
            return [];
        }
        if (!this.isFree(goal, true, goal)) {
            console.error("Goal is not walkable!");
            return [];
        }

        const openSet = new PriorityQueue<Node>();
        const cameFrom = new Map<string, Node>();
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();
        const closedSet = new Set<string>();

        const startKey = this.key(start);
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, goal));
        openSet.enqueue(start, fScore.get(startKey)!);

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue()!;
            const currentKey = this.key(current);

            // Đến đích
            if (current[0] === goal[0] && current[1] === goal[1]) {
                const path = this.reconstructPath(cameFrom, current);
                console.log(`A* found path with ${path.length} steps`);
                return path;
            }

            if (closedSet.has(currentKey)) continue;
            closedSet.add(currentKey);

            for (const neighbor of this.getNeighbors(current, goal)) {
                const neighborKey = this.key(neighbor);

                if (closedSet.has(neighborKey)) continue;

                const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + 1;

                if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    const fScoreValue = tentativeGScore + this.heuristic(neighbor, goal);
                    fScore.set(neighborKey, fScoreValue);
                    openSet.enqueue(neighbor, fScoreValue);
                }
            }
        }

        console.warn("A* could not find path!");
        return [];
    }
}
