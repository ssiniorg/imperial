import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, db} from "./fire.js";
import {
    Button,
    ButtonGroup,
    Form,
    FormGroup,
    Input,
    Label,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";
import {MdAddCircle, MdDelete, MdEdit} from "react-icons/lib/md/index";
import moment from "moment";

export default class extends Component {

    constructor() {
        super();

        this.state = {
            userID: '',
            userRole: null,
            entry: {}
        };
    }

    componentDidMount() {
        db.ref("/trainingEntries/").once("value").then((snapshot) => {
            let entry = snapshot.val();
            this.setState({
                entry: entry
            })
        });
    }

    render() {
        console.log(this.state.entry);
        return (
            <div>
                <h3>Statistika</h3>

                <div>
                    {JSON.stringify(this.state.entry)}
                </div>
            </div>
        );
    }
}