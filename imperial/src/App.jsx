import React, {Component} from 'react';
import {auth} from './fire.js';
import {BrowserRouter, Redirect, Route} from "react-router-dom";
import Login from "./Login";
import HomePage from "./HomePage";
import NavBar from "./NavBar";
import PersonsPage from "./PersonsPage";
import GroupsPage from "./GroupsPage";

function PrivateRoute({component: Component, authed, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => authed === true
                ? <Component {...props} />
                : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>}
        />
    )
}

function PublicRoute({component: Component, authed, ...rest}) {
    return (
        <Route
            {...rest}
            render={(props) => authed === false
                ? <Component {...props} />
                : <Redirect to='/home'/>}
        />
    )
}

class App extends Component {
    state = {
        authed: false,
        loading: true,
    };

    componentDidMount() {
        this.removeListener = auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({
                    authed: true,
                    loading: false,
                })
            } else {
                this.setState({
                    authed: false,
                    loading: false
                })
            }
        })
    }

    componentWillUnmount() {
        this.removeListener()
    }

    render() {
        return this.state.loading === true ? <h1>Loading</h1> : (
            <BrowserRouter>
                <div>
                    <NavBar/>
                    <PublicRoute authed={this.state.authed} path="/" exact render={() => <Redirect to='/login'/>}/>
                    <PublicRoute authed={this.state.authed} path="/login" component={Login}/>
                    <PrivateRoute authed={this.state.authed} path="/home" component={HomePage}/>
                    <PrivateRoute authed={this.state.authed} path="/persons" component={PersonsPage}/>
                    <PrivateRoute authed={this.state.authed} path="/groups" component={GroupsPage}/>
                </div>

            </BrowserRouter>
        );
    }
}

export default App;
