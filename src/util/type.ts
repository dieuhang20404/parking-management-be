export type Node = [number, number];

export type Path = Node[];

export type Cell = { x: number; y: number };

export type Slot = {
    rep: Cell;
    group: Cell[];
};