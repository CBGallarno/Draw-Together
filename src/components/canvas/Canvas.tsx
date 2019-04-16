import React, {Component, RefObject} from 'react';
import {Drawing} from "@/types/drawing";
import "./Canvas.scss"

interface CanvasProps {
    currentDrawing: Drawing
    onDraw: (x: number, y: number) => void;
    onDrawStart: () => void;
    onDrawEnd: () => void;
}

class Canvas extends Component<CanvasProps, any> {

    currentDrawing: Drawing = {strokes: []};
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
        if (this.props.currentDrawing === undefined || this.props.currentDrawing === null) {
            this.currentDrawing = {
                strokes: [
                    {
                        x: [1, 50],
                        y: [1, 50]
                    }
                ]
            }
        } else {
            this.currentDrawing = this.props.currentDrawing
        }
    }

    getCanvasContext() {
        if (this.canvasRef.current !== null) {
            return this.canvasRef.current.getContext("2d")
        } else {
            return null
        }
    }

    handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
        if (this.drawing && this.canvasRef.current !== null) {
            // console.log(e.clientX + ' - ' + e.clientY)
            this.props.onDraw(e.clientX - this.canvasRef.current.offsetLeft, e.clientY - this.canvasRef.current.offsetTop)
        }
        e.preventDefault()
        e.stopPropagation()
    }

    handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
        if (this.drawing && this.canvasRef.current !== null) {
            // console.log(e.clientX + ' - ' + e.clientY)
            this.props.onDraw(e.touches[0].clientX - this.canvasRef.current.offsetLeft, e.touches[0].clientY - this.canvasRef.current.offsetTop)
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
        if (context !== null && this.props.currentDrawing !== null) {
            context.clearRect(0, 0, 100, 100);
            context.lineJoin = "round"
            context.translate(0.5, 0.5)
            for (const stroke of this.currentDrawing.strokes) {
                context.beginPath();
                if (stroke.x.length > 0 && stroke.y.length > 0) {
                    context.moveTo(stroke.x[0], stroke.y[0]);
                    for (let i = 1; i < stroke.x.length && i < stroke.y.length; i++) {
                        context.lineTo(stroke.x[i], stroke.y[i]);
                    }
                    context.strokeStyle = '#000000';
                    context.lineWidth = 2;
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
                        onMouseDown={() => {
                            if (!this.drawing) {
                                this.drawing = true
                                this.props.onDrawStart()
                            }
                        }}
                        onTouchStart={(e) => {
                            if (!this.drawing) {
                                this.drawing = true
                                this.props.onDrawStart()
                                e.stopPropagation()
                                e.preventDefault()
                            }
                        }}
                        onMouseUp={() => {
                            if (this.drawing) {
                                this.drawing = false
                                this.props.onDrawEnd()
                            }
                        }}
                        onTouchEnd={() => {
                            if (this.drawing) {
                                this.drawing = false
                                this.props.onDrawEnd()
                            }
                        }}
                        onMouseMove={this.handleMouseMove}
                        onTouchMove={this.handleTouchMove}
                        onMouseOut={() => {
                            this.drawing = false
                            this.props.onDrawEnd()
                        }}/>
            </div>
        );
    }
}

export default Canvas;
