import React, {Component, RefObject} from 'react';
import {Drawing} from "@/types/drawing";
import "./Canvas.scss"

interface CanvasProps {
    currentDrawing: Drawing
    onDraw: (x: number, y: number) => void;
    onDrawStart: () => void;
    onDrawEnd: () => void;
    drawable: boolean
}

class Canvas extends Component<CanvasProps, any> {

    canvasRef: RefObject<HTMLCanvasElement>;
    drawing: boolean = false;

    constructor(props: CanvasProps) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = {
            canvasWidth: 300,
            canvasHeight: 700
        };
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this)
        this.handleStart = this.handleStart.bind(this)
    }

    getCanvasContext() {
        if (this.canvasRef.current !== null) {
            return this.canvasRef.current.getContext("2d")
        } else {
            return null
        }
    }

    handleStart() {
        if (this.props.drawable && !this.drawing) {
            this.drawing = true;
            this.props.onDrawStart()
        }
    }

    handleEnd() {
        if (this.props.drawable && this.drawing) {
            this.drawing = false;
            this.props.onDrawEnd()
        }
    }

    handleMove(x: number, y: number) {
        if (this.props.drawable && this.canvasRef.current) {
            this.props.onDraw(x - this.canvasRef.current.offsetLeft, y - this.canvasRef.current.offsetTop)
        }
    }

    handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (this.drawing && this.canvasRef.current !== null) {
            this.handleMove(e.clientX, e.clientY)
        }
    }

    handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
        if (this.drawing && this.canvasRef.current !== null && this.props.drawable) {
            this.handleMove(e.touches[0].clientX, e.touches[0].clientY)
        }
    }

    componentDidUpdate(prevProps: Readonly<CanvasProps>, prevState: Readonly<any>, snapshot?: any): void {
        this.draw()
        const context = this.getCanvasContext()
        if (context !== null && this.canvasRef.current !== null) {
            if (this.state.canvasWidth !== this.canvasRef.current.clientWidth || this.state.canvasHeight !== this.canvasRef.current.clientHeight) {
                this.setState({
                    canvasWidth: this.canvasRef.current.clientWidth,
                    canvasHeight: this.canvasRef.current.clientHeight
                })
            }
        }
    }

    draw() {
        const context = this.getCanvasContext();
        if (context && this.props.currentDrawing) {
            context.clearRect(0, 0, 100, 100);
            context.lineJoin = "round"
            context.translate(0.5, 0.5)
            for (const stroke of this.props.currentDrawing.strokes) {
                context.beginPath();
                if (stroke.x.length > 0 && stroke.y.length > 0) {

                    context.moveTo(stroke.x[0], stroke.y[0]);
                    for (let i = 1; i < stroke.x.length && i < stroke.y.length; i++) {
                        context.lineTo(stroke.x[i], stroke.y[i]);
                    }
                    context.strokeStyle = '#000000';
                    context.lineWidth = 5;
                    context.stroke();
                    context.closePath()
                }
            }
            context.resetTransform()
        }
    }

    render() {
        return (
            <div className="canvas">
                <canvas width={this.state.canvasWidth} height={this.state.canvasHeight} ref={this.canvasRef} id="canvas"
                        onMouseDown={this.handleStart}
                        onTouchStart={this.handleStart}

                        onMouseUp={this.handleEnd}
                        onTouchEnd={this.handleEnd}

                        onMouseMove={this.handleMouseMove}
                        onTouchMove={this.handleTouchMove}

                        onMouseOut={this.handleEnd}/>
            </div>
        );
    }
}

export default Canvas;
