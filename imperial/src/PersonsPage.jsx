import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, db} from "./fire.js";
import {
    Button, ButtonGroup,
    Form, FormGroup, Input, Label,
    ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Nav, NavItem, NavLink, TabContent,
    TabPane
} from "reactstrap";
import {MdAddCircle, MdDelete, MdEdit} from "react-icons/lib/md/index";
import classnames from 'classnames';

export default class extends Component {
    constructor() {
        super();

        this.state = {
            activeTab: 'Kõik',
            groupsList: [],
            groupOptions: [],
            groupTabs: [],
            personsList: [],
            modalNew: false,
            deleteModal: false,
            editModal: false,
            personKey: '',
            personName: '',
            personCode: '',
            personPhone: '',
            personMail: '',
            personGroup: '',
            personRole: '',
            roleOptions: []
        };

        this.toggle = this.toggle.bind(this);
        this.toggleNew = this.toggleNew.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.setGroupTabs = this.setGroupTabs.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
    }

    componentDidMount() {
        if (auth.currentUser === null) {
            return;
        }
        db.ref("/users/").once("value").then((snapshot) => {
            let persons = [];
            snapshot.forEach((person) => {
                let name = person.val().name;
                persons.push(
                    <ListGroupItem className="justify-content-between" key={name} action>
                        {name} {' (' + person.val().group + ')'}
                        <ButtonGroup>
                            <Button color="warning" onClick={() => this.toggleEdit(person.key)}><MdEdit /></Button>
                            <Button color="danger" onClick={() => this.toggleDelete(person.key)}><MdDelete /></Button>
                        </ButtonGroup>
                    </ListGroupItem>
                );
            });
            this.setState({personsList: persons});
        });
        db.ref("/roles/").on("value", (snapshot) => {
            let roles = [];
            snapshot.forEach((role) => {
                roles.push(
                    <option value={role.key} key={role.key}>{role.val().name}</option>
                );
            });
            this.setState({roleOptions: roles});
        });
        this.setGroupTabs();
    }

    setGroupTabs(activeTab, persons) {
        let activeTabVal = activeTab ? activeTab : this.state.activeTab;
        let personsListVal = persons ? persons : this.state.personsList;
        db.ref("/groups/").orderByChild("name").on("value", (snapshot) => {
            let groups = [];
            let tabs = [];
            let options = [];
            snapshot.forEach((group) => {
                let name = group.val().name;
                options.push(
                    <option key={name}>{name}</option>
                );
                groups.push(
                    <NavItem key={name}>
                        <NavLink
                            className={classnames({ active: activeTabVal === name })}
                            onClick={() => { this.toggle(name); }}
                        >
                            {name}
                        </NavLink>
                    </NavItem>
                );
                tabs.push(
                    <TabPane tabId={name} key={name}>
                        <ListGroup>
                            {personsListVal}
                            <ListGroupItem tag="button" color="success" onClick={this.toggle}><MdAddCircle />Lisa inimene</ListGroupItem>
                        </ListGroup>
                    </TabPane>
                );
            });
            this.setState({
                groupOptions: options,
                groupsList: groups,
                groupTabs: tabs
            });
        });
    }

    toggle(tab, update) {
        if (this.state.activeTab !== tab || update) {
            let persons = [];
            let personsRef;
            if (tab === 'Kõik') {
                personsRef = db.ref("/users/").orderByChild("group");
            } else if (tab === "Treenerid") {
                personsRef = db.ref("/users/").orderByChild("role").equalTo("2");
            } else {
                personsRef = db.ref("/users/").orderByChild("group").equalTo(tab);
            }
            personsRef.once("value").then((snapshot) => {
                snapshot.forEach((person) => {
                    let name = person.val().name;
                    persons.push(
                        <ListGroupItem className="justify-content-between" key={name} action>
                            {name} {tab === 'Kõik' && ' (' + (person.val().group != null ? person.val().group : "Külaline") + ')'}
                            <ButtonGroup>
                                <Button color="warning" onClick={() => this.toggleEdit(person.key)}><MdEdit /></Button>
                                <Button color="danger" onClick={() => this.toggleDelete(person.key)}><MdDelete /></Button>
                            </ButtonGroup>
                        </ListGroupItem>
                    );
                });
                this.setState({
                    personsList: persons,
                    activeTab: tab
                });
            });
            this.setGroupTabs(tab, persons);
        }
    }

    toggleNew() {
        this.setState({
            modalNew: !this.state.modalNew,
            personName: '',
            personCode: '',
            personPhone: '',
            personMail: '',
            personGroup: ''
        });
    }

    toggleDelete(key) {
        if(!this.state.deleteModal) {
            db.ref("/users/" + key).once("value").then((snapshot) => {
                this.setState({
                    personName: snapshot.val().name,
                    personKey: key,
                });
            });
        }
        this.setState({
            deleteModal: !this.state.deleteModal
        });
    }

    toggleEdit(key) {
        if(!this.state.editModal) {
            db.ref("/users/" + key).once("value").then((snapshot) => {
                let person = snapshot.val();
                this.setState({
                    personName: person.name,
                    personCode: person.personCode,
                    personPhone: person.phone,
                    personMail: person.email,
                    personGroup: person.group,
                    personRole: person.role,
                    personKey: key,
                });
            });
        }
        this.setState({
            editModal: !this.state.editModal
        });
    }

    handleDelete() {
        db.ref("/users/" + this.state.personKey).remove().then(() => {
            this.toggle(this.state.activeTab, true);
        });
        this.setState({
            deleteModal: false
        });
    }

    handleEdit() {
        db.ref("/users/" + this.state.personKey).update({
            name: this.state.personName,
            personCode: this.state.personCode,
            phone: this.state.personPhone,
            email: this.state.personMail,
            group: this.state.personGroup,
            role: this.state.personRole
        }).then(() => {
            this.toggle(this.state.activeTab, true);
        });
        this.setState({
            editModal: false
        });
    }

    handleSubmit() {
        const newKey = db.ref().child("users").push().key;
        db.ref("/users/" + newKey).set({
            name: this.state.personName,
            personCode: this.state.personCode,
            phone: this.state.personPhone,
            email: this.state.personMail,
            group: this.state.personGroup,
            role: this.state.personRole
        }).then(() => {
            this.toggle(this.state.activeTab, true);
        });
        this.setState({
            modalNew: false
        });
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    render() {
        return (
            <div>
                <h3>Inimesed</h3>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'Kõik' })}
                            onClick={() => { this.toggle('Kõik'); }}
                        >
                            Kõik
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'Treenerid' })}
                            onClick={() => { this.toggle('Treenerid'); }}
                        >
                            Treenerid
                        </NavLink>
                    </NavItem>
                    {this.state.groupsList}
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="Kõik">
                        <ListGroup>
                            {this.state.personsList}
                            <ListGroupItem tag="button" color="success" onClick={this.toggleNew}><MdAddCircle />Lisa inimene</ListGroupItem>
                        </ListGroup>
                    </TabPane>
                    <TabPane tabId="Treenerid">
                        <ListGroup>
                            {this.state.personsList}
                            <ListGroupItem tag="button" color="success" onClick={this.toggleNew}><MdAddCircle />Lisa inimene</ListGroupItem>
                        </ListGroup>
                    </TabPane>
                    {this.state.groupTabs}
                </TabContent>
                <Modal isOpen={this.state.modalNew} toggle={this.toggleNew}>
                    <ModalHeader toggle={this.toggleNew}>Uus inimene</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="personName">Nimi</Label>
                                <Input type="text" name="personName" id="personName" value={this.state.personName}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personCode">Isikukood</Label>
                                <Input type="number" name="personCode" id="personCode" value={this.state.personCode}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personPhone">Telefoni nr</Label>
                                <Input type="tel" name="personPhone" id="personPhone" value={this.state.personPhone}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personMail">E-mail</Label>
                                <Input type="email" name="personMail" id="personMail" value={this.state.personMail}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personGroup">Grupp</Label>
                                <Input type="select" name="personGroup" id="personGroup" value={this.state.personGroup}
                                       onChange={this.onChange}>
                                    <option></option>
                                    {this.state.groupOptions}
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personRole">Roll</Label>
                                <Input type="select" name="personRole" id="personRole" value={this.state.personRole}
                                       onChange={this.onChange}>
                                    <option></option>
                                    {this.state.roleOptions}
                                </Input>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleSubmit}>Lisa</Button>{' '}
                        <Button color="secondary" onClick={this.toggleNew}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.deleteModal} toggle={this.toggleDelete}>
                    <ModalHeader toggle={this.toggleDelete}>Nimekirjast kustutamine</ModalHeader>
                    <ModalBody>
                        Kas oled kindel, et soovid nimekirjast eemaldada "{this.state.personName}"?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleDelete}>Eemalda</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDelete}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.editModal} toggle={this.toggleEdit}>
                    <ModalHeader toggle={this.toggleEdit}>Inimese andmete muutmine</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="personName">Nimi</Label>
                                <Input type="text" name="personName" id="personName" value={this.state.personName}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personCode">Isikukood</Label>
                                <Input type="number" name="personCode" id="personCode" value={this.state.personCode}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personPhone">Telefoni nr</Label>
                                <Input type="tel" name="personPhone" id="personPhone" value={this.state.personPhone}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personMail">E-mail</Label>
                                <Input type="email" name="personMail" id="personMail" value={this.state.personMail}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personGroup">Grupp</Label>
                                <Input type="select" name="personGroup" id="personGroup" value={this.state.personGroup}
                                       onChange={this.onChange}>
                                    <option></option>
                                    {this.state.groupOptions}
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="personRole">Roll</Label>
                                <Input type="select" name="personRole" id="personRole" value={this.state.personRole}
                                       onChange={this.onChange}>
                                    <option></option>
                                    {this.state.roleOptions}
                                </Input>
                            </FormGroup>
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleEdit}>Muuda</Button>{' '}
                        <Button color="secondary" onClick={this.toggleEdit}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}