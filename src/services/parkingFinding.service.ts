import board from "../util/board";
import { AStarPathfinder } from "../util/AStarPathfinder";
import { Node, Slot } from "../util/type";

const SENSOR_COUNT = 5;

// ===== Helper Functions =====
function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ===== Main Functions =====

/**
 * Tìm đường đi từ start đến target
 */
export function findPathService(start: Node, target: { x: number; y: number }): Node[] {
    const startNode: Node = [start[1], start[0]];
    const goalNode: Node = [target.y, target.x];

    const pathfinder = new AStarPathfinder(board);
    const path = pathfinder.findPath(startNode, goalNode);
// gán status id thành 1
    return path.map(([r, c]) => [c, r] as Node);
}

/**
 * Random chọn SENSOR_COUNT vị trí slot để làm target
 */
export function getRandomSensorPosition(): { x: number; y: number }[] {
    const rows = board.length;
    const cols = board[0].length;

    // Tìm tất cả các slot hợp lệ (2 ô liền nhau có giá trị 1)
    const allSlots: Slot[] = [];
    const directions = [
        { dx: 0, dy: 1 }, // ngang →
        { dx: 1, dy: 0 }, // dọc ↓
    ];

    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            if (board[x][y] !== 1) continue;

            for (const { dx, dy } of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx < rows && ny < cols && board[nx][ny] === 1) {
                    allSlots.push({
                        rep: { x: y, y: x },
                        group: [
                            { x: y, y: x },
                            { x: ny, y: nx },
                        ],
                    });
                }
            }
        }
    }

    if (allSlots.length < SENSOR_COUNT) {
        throw new Error(`Không đủ slot đỗ xe hợp lệ. Cần ${SENSOR_COUNT}, chỉ tìm thấy ${allSlots.length}`);
    }

    // Random chọn SENSOR_COUNT slot
    const randomIds = Array.from({ length: allSlots.length }, (_, i) => i);
    shuffle(randomIds);
    const selectedIds = randomIds.slice(0, SENSOR_COUNT);


    return selectedIds.map(id => allSlots[id].rep);
}

export function getMatrix(): number[][] {
    return board;
}

export default findPathService;

