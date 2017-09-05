import React, {Component} from 'react';
import {auth} from './fire.js';
import {BrowserRouter, Redirect, Route} from "react-router-dom";
import Login from "./Login";
import HomePage from "./HomePage";
import NavBar from "./NavBar";

class App extends Component {
    constructor() {
        super();

        this.state = {
            user: null
        }
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            this.setState({user: user})
        });
    }

    render() {
        return (
            <BrowserRouter>
                <div>
                    <NavBar />
                    <Route path="/" exact render={() => <Redirect to='/login' />} />
                    <Route path="/login" component={Login} />
                    <PrivateRoute authenticated={this.state.user} path="/home" component={HomePage} />
                </div>

            </BrowserRouter>
        );
    }
}

function PrivateRoute ({component: Component, authenticated, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => authenticated !== null
                ? <Component {...props} />
                : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
        />
    )
}

export default App;
