import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, provider} from "./fire";
import {Redirect} from "react-router-dom";

export default class extends Component {
    constructor() {
        super();

        this.login = this.login.bind(this);
    }

    login() {
        auth.signInWithPopup(provider)
            .catch((error) => {
                console.log(error);
            });
    }

    render() {
        if (auth.currentUser) {
            return <Redirect to="/home" />;
        }
        return (
            <div className="container col-md-3">

                <form className="form-signin">
                    <h2 className="form-signin-heading">Please sign in</h2>
                    <button className="btn btn-lg btn-primary btn-block" type="button" onClick={this.login}>Sign in
                    </button>
                </form>

            </div>
        );
    }
}