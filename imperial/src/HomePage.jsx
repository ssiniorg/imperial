import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, db} from "./fire.js";
import {Jumbotron} from "reactstrap";

export default class extends Component {
    constructor() {
        super();

        this.state = {
            userID: '',
            userRole: null
        }
    }

    componentDidMount() {
        if (auth.currentUser === null) {
            return;
        }
        const userID = auth.currentUser.uid;
        this.setState({userID: userID});
        db.ref("/users/" + userID).once('value').then((snapshot) => {
           this.setUserRole(snapshot.val());
        });
    }

    setUserRole(user) {
        if (user === null || user.role === undefined) {
            console.log("blah");
            db.ref('/users/' + this.state.userID).set({
                email: auth.currentUser.email,
                name: auth.currentUser.displayName,
                role: 4,
                group: "Külaline"
            });
            console.log("blah2");
        } else {
            db.ref("/roles/" + user.role).once('value').then((snapshot) => {
                this.setState({userRole: snapshot.val().name})
            });
        }
    }

    render() {
        return (
            <Jumbotron>
                <h1 className="display-3">Tere, {auth.currentUser.displayName}!</h1>
                <p className="lead">Oled jõudnud klubi alles valmivasse haldussüsteemi.</p>
                <hr className="my-2" />
                <p>Kui leht on valmis, annab treener sulle kindlasti märku. Seniks ootame sind aktiivselt trenni!</p>
            </Jumbotron>
        );
    }
}