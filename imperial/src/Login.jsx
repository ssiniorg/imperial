import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, provider} from "./fire";

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
        return (
            <div className="container col-md-3">

                <form className="form-signin">
                    <h2 className="form-signin-heading">Spordiklubi Imperial</h2>
                    <button className="btn btn-lg btn-primary btn-block" type="button" onClick={this.login}>Logi sisse
                    </button>
                </form>

            </div>
        );
    }
}