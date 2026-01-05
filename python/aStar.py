import sys
import json
import heapq

def astar(start, goal, grid):
    """
    A* pathfinding algorithm
    start: [row, col]
    goal: [row, col]
    grid: 2D array (0 = walkable, 1 = occupied/wall)
    """
    rows, cols = len(grid), len(grid[0])
    
    def heuristic(a, b):
        # Manhattan distance
        return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    def get_neighbors(pos):
        row, col = pos
        neighbors = []
        # 4 directions: up, down, left, right
        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            new_row, new_col = row + dr, col + dc
            if 0 <= new_row < rows and 0 <= new_col < cols:
                if grid[new_row][new_col] == 0:  # walkable
                    neighbors.append((new_row, new_col))
        return neighbors
    
    # Priority queue: (f_score, counter, position, path)
    open_set = [(0, 0, tuple(start), [tuple(start)])]
    closed_set = set()
    counter = 0
    
    while open_set:
        f_score, _, current, path = heapq.heappop(open_set)
        
        if current == tuple(goal):
            return path
        
        if current in closed_set:
            continue
        
        closed_set.add(current)
        
        for neighbor in get_neighbors(current):
            if neighbor in closed_set:
                continue
            
            new_path = path + [neighbor]
            g_score = len(new_path) - 1
            h_score = heuristic(neighbor, goal)
            f_score = g_score + h_score
            
            counter += 1
            heapq.heappush(open_set, (f_score, counter, neighbor, new_path))
    
    return []  # No path found

if __name__ == "__main__":
    # Parse arguments
    start = json.loads(sys.argv[1])
    goal = json.loads(sys.argv[2])
    parking_map = json.loads(sys.argv[3])
    
    # Convert parking map to grid (0 = walkable, 1 = blocked)
    # TODO: Convert your parking status format to 2D grid
    grid = [[0 for _ in range(20)] for _ in range(20)]  # Example 20x20 grid
    
    # Run A*
    path = astar(start, goal, grid)
    
    # Convert path to slot IDs if needed
    result = [pos for pos in path]  # Or convert to slot IDs
    
    # Print JSON result
    print(json.dumps(result))