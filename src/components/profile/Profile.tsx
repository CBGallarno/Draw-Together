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

class profileComponent extends React.Component<ProfileProps, any> {
    displayNameInput: React.RefObject<HTMLInputElement>;

    constructor(props: ProfileProps) {
        super(props);
        this.displayNameInput = React.createRef();
        this.saveDisplayName = this.saveDisplayName.bind(this);
        this.signout = this.signout.bind(this);
    }

    signout() {
        firebase.auth().signOut().then(() => {
            console.log("TODO")
        })
    }

    saveDisplayName() {
        if (this.displayNameInput.current !== null) {
            const username = this.displayNameInput.current.value;
            firebase.firestore().collection('users').doc(this.props.auth.userId).update({username: username}).then(() => {
                    this.props.dispatch(updateUserName(username))
                }
            )
        }
    }

    render() {
        if (this.props.auth.signedIn) {
            let displayName = (<p>{this.props.auth.userName}</p>);
            if (this.props.auth.userName === null) {
                displayName = (<span>
        <input type="text" placeholder="Display Name" ref={this.displayNameInput}/>
        <button onClick={this.saveDisplayName}>Save</button>
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
                    <button onClick={this.signout}>Sign Out</button>
                </div>
            )
        } else {
            return (<Redirect to="/Login"/>);
        }
    }
}

export default connect(mapStateToProps)(profileComponent)
