import React, {Component} from 'react';
import {connect} from "react-redux";
import {AppState} from "@/reducers";
import {RouteChildrenProps} from "react-router";
import {AuthState, GameState, Props} from "@/types/DTRedux";
import {Drawing} from "@/types/drawing";
import Canvas from "@/components/canvas/Canvas";

interface CanvasTestProps extends RouteChildrenProps<{}>, Props {
    auth: AuthState
    game: GameState
}


const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth,
        game: state.game
    }
};

class CanvasTest extends Component<CanvasTestProps, { currentDrawing: Drawing }> {

    constructor(props: CanvasTestProps) {
        super(props);
        this.handleDraw = this.handleDraw.bind(this)
        this.handleDrawStart = this.handleDrawStart.bind(this)
        this.state = {
            currentDrawing: {strokes: [{x: [], y: []}]}
        }
    }

    handleDraw(x: number, y: number) {
        const drawing = this.state.currentDrawing
        drawing.strokes[drawing.strokes.length - 1].x.push(x)
        drawing.strokes[drawing.strokes.length - 1].y.push(y)
        this.setState({currentDrawing: drawing})
    }

    handleDrawStart() {
        this.state.currentDrawing.strokes.push({x: [], y: []})
    }

    handleDrawEnd() {
        console.log("end")
    }

    render() {
        return (
            <div className="CanvasTest">
                <Canvas drawable={true} currentDrawing={this.state.currentDrawing}
                        onDraw={this.handleDraw}
                        onDrawStart={this.handleDrawStart}
                        onDrawEnd={this.handleDrawEnd}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps)(CanvasTest);
