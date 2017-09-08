import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, db} from "./fire.js";
import BigCalendar from "react-big-calendar";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from "moment";
import 'moment/locale/et';
import {Button, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {MdCheck} from "react-icons/lib/md/index";

moment.locale("et");
BigCalendar.setLocalizer(
    BigCalendar.momentLocalizer(moment)
);

function Event({event}) {
    return (
        <span>
            {event.color === 'white' ?
                <strong>{event.title}</strong> :
                <strong style={{color: event.color}}>{event.title}</strong>
            }
            {event.groups && (':  ' + event.groups.join(", "))}
            </span>
    );
}

export default class extends Component {
    constructor() {
        super();

        this.state = {
            userID: '',
            userRole: null,
            events: [],
            modal: false,
            members: [],
            membersList: [],
            selected: [],
            trainingKey: '',
            trainingDate: moment(),
            saved: false,
            savedKey: ''
        };

        this.toggle = this.toggle.bind(this);
        this.selected = this.selected.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.populateMembersList = this.populateMembersList.bind(this);
        this.generateRows = this.generateRows.bind(this);
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
        db.ref("/trainings/").orderByChild("name").on("value", (snapshot) => {
            snapshot.forEach((snap) => {
                this.setState({
                    events: this.getTrainingEvents(snap)
                })
            });
        });
    }

    getTrainingEvents(snapshot) {
        let training = snapshot.val();
        let events = [];
        let startTime = moment.utc(training.startTime);
        let startDate = moment(training.startDate);
        let endTime = moment.utc(training.endTime);
        let endDate = moment(training.endDate);
        let validDays = training.days;
        let diffDays = endDate.diff(startDate, "days");
        for (let i = 0; i < diffDays && i < 365; i++) {
            if (validDays.indexOf(startDate.isoWeekday().toString()) !== -1) {
                events.push({
                    'title': training.name,
                    'start': startDate.hour(startTime.hour()).minute(startTime.minute()).toDate(),
                    'end': startDate.hour(endTime.hour()).minute(endTime.minute()).toDate(),
                    'groups': training.groups,
                    'key': snapshot.key,
                    'color': 'white'
                });
            }
            startDate.add(1, 'days');
        }
        return events;
    }

    setUserRole(user) {
        if (user === null || user.role === undefined) {
            db.ref('/users/' + this.state.userID).set({
                email: auth.currentUser.email,
                name: auth.currentUser.displayName,
                role: 4,
                group: "Külaline"
            });
        } else {
            db.ref("/roles/" + user.role).once('value').then((snapshot) => {
                this.setState({userRole: snapshot.val().name})
            });
        }
    }

    selected(name) {
        let newSelected = this.state.selected;
        if (newSelected.indexOf(name) === -1) {
            newSelected.push(name);
        } else {
            newSelected = newSelected.filter(item => item !== name);
        }
        this.setState({
            selected: newSelected
        });
        this.populateMembersList(newSelected);
    }

    showEvent(event) {
        let members = [];
        event.groups.forEach((group) => {
            db.ref("/users/").orderByChild("group").equalTo(group).once("value").then((snapshot) => {
                snapshot.forEach((person) => {
                    members.push(person.val());
                    this.setState({
                        members: members,
                        trainingKey: event.key,
                        trainingDate: event.start
                    });
                    this.populateMembersList();
                });
            });
        });
        let saved = false;
        let savedKey = '';
        db.ref("trainingEntries").orderByChild("date").equalTo(event.start.toISOString()).once("value").then((snapshot) => {
            snapshot.forEach((snapshot) => {
                if (snapshot.val().trainingKey === event.key) {
                    saved = true;
                    savedKey = snapshot.key;
                }
            });
            this.setState({
                modal: !this.state.modal,
                saved: saved,
                savedKey: savedKey
            });
        });
    }

    populateMembersList(selected) {
        if (selected) {
           this.generateRows(selected)
        } else {
            let selectedVal = [];
            db.ref("trainingEntries").orderByChild("date").equalTo(this.state.trainingDate.toISOString()).once("value").then((snapshot) => {
                snapshot.forEach((snapshot) => {
                    if (snapshot.val().trainingKey === this.state.trainingKey) {
                        selectedVal = snapshot.val().members;
                    }
                });
                this.setState({
                    selected: selectedVal
                });
                this.generateRows(selectedVal);
            });
        }
    }

    generateRows(selectedVal) {
        let membersList = [];
        this.state.members.forEach((member) => {
            let name = member.name;
            membersList.push(
                <ListGroupItem className="justify-content-between" key={name} action
                               onClick={() => this.selected(name)}>
                    {name} {' (' + member.group + ')'}
                    {selectedVal.indexOf(name) === -1 ?
                        <div style={{color: "red"}}>
                            <MdCheck/>
                        </div> :
                        <div style={{color: "green"}}>
                            <MdCheck/>
                        </div>}
                </ListGroupItem>
            );
            this.setState({
                membersList: membersList
            });
        });
    }

    toggle() {
        this.setState({
            modal: !this.state.modal,
        });
    }

    handleSubmit() {
        const newKey = db.ref().child("trainingEntries").push().key;
        db.ref("/trainingEntries/" + newKey).set({
            trainingKey: this.state.trainingKey,
            date: this.state.trainingDate.toISOString(),
            members: this.state.selected
        }).then(() => {
            this.toggle();
        });
    }

    handleUpdate() {
        db.ref("/trainingEntries/" + this.state.savedKey).update({
            trainingKey: this.state.trainingKey,
            date: this.state.trainingDate.toISOString(),
            members: this.state.selected
        }).then(() => {
            this.toggle();
        });
    }

    render() {
        return (
            <div>
                <BigCalendar
                    selectable
                    defaultView="week"
                    min={moment().hour(8).minute(0).toDate()}
                    maax={moment().hour(22).minute(0).toDate()}
                    events={this.state.events}
                    onSelectEvent={event => this.showEvent(event)}
                    components={{
                        event: Event
                    }}
                />
                <Modal isOpen={this.state.modal} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>Osalejate märkimine</ModalHeader>
                    <ModalBody>
                        {this.state.membersList}
                    </ModalBody>
                    <ModalFooter>
                        {this.state.saved === false ?
                            <Button color="primary" onClick={this.handleSubmit}>Salvesta</Button> :
                            <Button color="primary" onClick={this.handleUpdate}>Uuenda</Button>
                        }
                        <Button color="secondary" onClick={this.toggle}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}