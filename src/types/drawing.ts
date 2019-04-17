export interface Drawing {
    strokes: Stroke[]
}

interface Stroke {
    x: number[]
    y: number[]
}