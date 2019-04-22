import * as React from 'react';
import './Profile.scss'
import * as firebase from 'firebase';
import 'firebase/firestore'
import 'firebase/auth';
import {Redirect} from 'react-router';
import {connect} from "react-redux";
import {updateUserName} from "@/actions"
import * as Redux from "@/types/DTRedux";
import {AppState} from "@/reducers";

interface ProfileProps extends Redux.Props {
    auth: Redux.AuthState
}

const mapStateToProps = (state: AppState) => {
    return {
        auth: state.auth
    }
}

class profileComponent extends React.Component<ProfileProps, { editing: boolean }> {
    displayNameInput: React.RefObject<HTMLInputElement>;

    constructor(props: ProfileProps) {
        super(props);
        this.displayNameInput = React.createRef();
        this.saveDisplayName = this.saveDisplayName.bind(this);
        this.signout = this.signout.bind(this);

        this.state = {
            editing: false
        }
    }

    signout() {
        firebase.auth().signOut().then(() => {
            console.log("TODO")
        })
    }

    saveDisplayName() {
        if (this.displayNameInput.current) {
            const username = this.displayNameInput.current.value;
            firebase.firestore().collection('users').doc(this.props.auth.userId).update({username: username}).then(() => {
                    this.props.dispatch(updateUserName(username))
                    this.setState({editing: false})
                }
            )
        }
    }

    render() {
        if (this.props.auth.signedIn) {
            let displayName = (
                <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}><p onClick={() => {
                    this.setState({editing: true})
                }}>{this.props.auth.userName}</p>
                    <button className={"styledEditButton"} onClick={() => {
                        this.setState({editing: true})
                    }}>Edit
                    </button>
                </div>);
            if (!this.props.auth.userName || this.state.editing) {
                displayName = (<span>
                    <input className={"styledInput"}type="text" placeholder="Display Name" ref={this.displayNameInput}
                           defaultValue={this.props.auth.userName ? this.props.auth.userName : ""}/>
        <button className={"styledEditButton"} onClick={this.saveDisplayName}>Save</button>
      </span>)

            }
            return (
                <div className="profile">
                    <div className="profileInfo">
                        <h4>Email:</h4> <p>{this.props.auth.userEmail}</p>
                    </div>
                    <div className="profileInfo">
                        <h4>Display Name:</h4> {displayName}
                    </div>
                    <button className={"styledButton"} onClick={this.signout}>Sign Out</button>
                </div>
            )
        } else {
            return (<Redirect to="/Login"/>);
        }
    }
}

export default connect(mapStateToProps)(profileComponent)
