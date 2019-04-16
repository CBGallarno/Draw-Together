import * as React from 'react';
import "./Home.scss";
class Home extends React.Component {
    render() {
        return (
            <div className="Home">
                <h1 className={"title"}>Welcome to Drawn Together!</h1>
                <p className={"subtext"}> Click play to join a game, or login to create a game!</p>
            </div>
        );
    }
}

export default Home;
