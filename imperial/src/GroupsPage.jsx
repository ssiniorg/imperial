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

export default class extends Component {
    constructor() {
        super();

        this.state = {
            userID: '',
            modal: false,
            deleteModal: false,
            editModal: false,
            groupName: '',
            groupKey: '',
            groupsList: []
        };

        this.toggle = this.toggle.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
    }

    componentDidMount() {
        if (auth.currentUser === null) {
            return;
        }
        this.setState({userID: auth.currentUser.uid});
        db.ref("/groups/").orderByChild("name").on("value", (snapshot) => {
            let groups = [];
            snapshot.forEach((group) => {
                let name = group.val().name;
                groups.push(
                    <ListGroupItem className="justify-content-between" key={name} action>
                        {name}
                        <ButtonGroup>
                            <Button color="warning" onClick={() => this.toggleEdit(group.key)}><MdEdit /></Button>
                            <Button color="danger" onClick={() => this.toggleDelete(group.key)}><MdDelete /></Button>
                        </ButtonGroup>
                    </ListGroupItem>);
            });
            this.setState({
                groupsList: groups
            })
        });
    }

    toggle() {
        this.setState({
            groupName: '',
            modal: !this.state.modal
        });
    }

    toggleDelete(key) {
        if(!this.state.deleteModal) {
            db.ref("/groups/" + key).once("value").then((snapshot) => {
                this.setState({
                    groupName: snapshot.val().name,
                    groupKey: key,
                });
            });
        }
        this.setState({
            deleteModal: !this.state.deleteModal
        });
    }

    toggleEdit(key) {
        if(!this.state.editModal) {
            db.ref("/groups/" + key).once("value").then((snapshot) => {
                this.setState({
                    groupName: snapshot.val().name,
                    groupKey: key,
                });
            });
        }
        this.setState({
            editModal: !this.state.editModal
        });
    }

    handleSubmit() {
        const newKey = db.ref().child("groups").push().key;
        db.ref("/groups/" + newKey).set({
            name: this.state.groupName
        });
        this.setState({
            modal: false
        });
    }

    handleDelete() {
        db.ref("/groups/" + this.state.groupKey).remove();
        this.setState({
            deleteModal: false
        });
    }

    handleEdit() {
        db.ref("/groups/" + this.state.groupKey).update({
            name: this.state.groupName
        });
        this.setState({
            editModal: false
        });
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    render() {
        return (
            <div>
                <h3>Grupid</h3>
                <ListGroup>
                    {this.state.groupsList}
                    <ListGroupItem tag="button" color="success" onClick={this.toggle}><MdAddCircle />Lisa grupp</ListGroupItem>
                </ListGroup>
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Uus grupp</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="groupName">Nimetus</Label>
                                <Input type="text" name="groupName" id="groupName" value={this.state.groupName}
                                    onChange={this.onChange}/>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleSubmit}>Lisa</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.deleteModal} toggle={this.toggleDelete}>
                    <ModalHeader toggle={this.toggleDelete}>Grupi kustutamine</ModalHeader>
                    <ModalBody>
                        Kas oled kindel, et soovid kustuta grupi "{this.state.groupName}"?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleDelete}>Kustuta</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDelete}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.editModal} toggle={this.toggleEdit}>
                    <ModalHeader toggle={this.toggleEdit}>Grupi muutmine</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="groupName">Nimetus</Label>
                                <Input type="text" name="groupName" id="groupName" value={this.state.groupName}
                                       onChange={this.onChange}/>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleEdit}>Muuda</Button>{' '}
                        <Button color="secondary" onClick={this.toggle}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}