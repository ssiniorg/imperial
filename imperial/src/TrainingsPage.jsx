import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import {auth, db} from "./fire.js";
import {
    Button, ButtonGroup,
    Form, FormGroup, Input, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter,
    ModalHeader
} from "reactstrap";
import {MdAddCircle, MdDelete, MdEdit} from "react-icons/lib/md/index";
import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css';
import moment from "moment";
import TimePicker from "rc-time-picker";
import 'rc-time-picker/assets/index.css';

export default class extends Component {
    constructor() {
        super();

        this.state = {
            modalNew: false,
            modalEdit: false,
            modalDelete: false,
            modalStartDate: false,
            modalEndDate: false,
            userID: '',
            trainingName: '',
            trainingDays: [],
            trainingStart: moment().utc(),
            trainingStartTime: moment().utc(),
            trainingEnd: moment().utc(),
            trainingEndTime: moment().utc(),
            trainingGroups: [],
            trainingKey: '',
            groupOptions: [],
            trainingsList: []
        };

        this.toggleNew = this.toggleNew.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleDelete = this.toggleDelete.bind(this);
        this.toggleStartDate = this.toggleStartDate.bind(this);
        this.toggleEndDate = this.toggleEndDate.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        if (auth.currentUser === null) {
            return;
        }
        db.ref("/groups/").orderByChild("name").on("value", (snapshot) => {
            let options = [];
            snapshot.forEach((group) => {
                let name = group.val().name;
                options.push(
                    <option key={group.key}>{name}</option>
                );
            });
            this.setState({
                groupOptions: options,
            });
        });
        db.ref("/trainings/").orderByChild("name").on("value", (snapshot) => {
            let trainings = [];
            snapshot.forEach((training) => {
                let groupNames = training.val().groups.join(",");
                trainings.push(
                    <ListGroupItem className="justify-content-between" key={training.key} action>
                        {training.val().name} {' (' + groupNames + ')'}
                        <ButtonGroup>
                            <Button color="warning" onClick={() => this.toggleEdit(training.key)}><MdEdit /></Button>
                            <Button color="danger" onClick={() => this.toggleDelete(training.key)}><MdDelete /></Button>
                        </ButtonGroup>
                    </ListGroupItem>);
            });
            this.setState({
                trainingsList: trainings
            })
        });
    }

    onChange(e) {
        this.setState({[e.target.name]: e.target.value})
    }

    onSelectChange(e) {
        let options = e.target.options;
        let value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        this.setState({[e.target.name]: value})
    }

    toggleNew() {
        this.setState({
            trainingName: '',
            trainingDays: [],
            trainingStart: moment().utc(),
            trainingEnd: moment().utc(),
            trainingGroups: [],
            modalNew: !this.state.modalNew
        });
    }

    toggleDelete(key) {
        if(!this.state.modalDelete) {
            db.ref("/trainings/" + key).once("value").then((snapshot) => {
                this.setState({
                    trainingName: snapshot.val().name,
                    trainingKey: key,
                });
            });
        }
        this.setState({
            modalDelete: !this.state.modalDelete
        });
    }

    toggleEdit(key) {
        if(!this.state.modalEdit) {
            db.ref("/trainings/" + key).once("value").then((snapshot) => {
                let training = snapshot.val()
                this.setState({
                    trainingName: training.name,
                    trainingDays: training.days,
                    trainingStart: moment.utc(training.startDate),
                    trainingStartTime: moment.utc(training.startTime),
                    trainingEnd: moment.utc(training.endDate),
                    trainingEndTime: moment.utc(training.endTime),
                    trainingGroups: training.groups,
                    trainingKey: key,
                });
            });
        }
        this.setState({
            modalEdit: !this.state.modalEdit
        });
    }

    toggleStartDate() {
        this.setState({
            modalStartDate: !this.state.modalStartDate
        });
    }

    toggleEndDate() {
        this.setState({
            modalEndDate: !this.state.modalEndDate
        });
    }

    handleSubmit() {
        const newKey = db.ref().child("trainings").push().key;
        db.ref("/trainings/" + newKey).set({
            name: this.state.trainingName,
            days: this.state.trainingDays,
            groups: this.state.trainingGroups,
            startDate: this.state.trainingStart.startOf("day").toISOString(),
            endDate: this.state.trainingEnd.startOf("day").toISOString(),
            startTime: this.state.trainingStartTime.toISOString(),
            endTime: this.state.trainingEndTime.toISOString(),
            createdBy: auth.currentUser.uid
        });
        this.setState({
            modalNew: false
        });
    }

    handleDelete() {
        db.ref("/trainings/" + this.state.trainingKey).remove();
        this.setState({
            modalDelete: false
        });
    }

    handleEdit() {
        db.ref("/trainings/" + this.state.trainingKey).update({
            name: this.state.trainingName,
            days: this.state.trainingDays,
            groups: this.state.trainingGroups,
            startDate: this.state.trainingStart.startOf("day").toISOString(),
            endDate: this.state.trainingEnd.startOf("day").toISOString(),
            startTime: this.state.trainingStartTime.toISOString(),
            endTime: this.state.trainingEndTime.toISOString(),
            editedBy: auth.currentUser.uid
        });
        this.setState({
            modalEdit: false
        });
    }

    render() {
        return (
            <div>
                <h3>Trennid</h3>
                <ListGroup>
                    {this.state.trainingsList}
                    <ListGroupItem tag="button" color="success" onClick={this.toggleNew}><MdAddCircle />Lisa trenn</ListGroupItem>
                </ListGroup>
                <Modal isOpen={this.state.modalNew} toggle={this.toggleNew}>
                    <ModalHeader toggle={this.toggle}>Uus trenn</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="trainingName">Nimetus</Label>
                                <Input type="text" name="trainingName" id="trainingName" value={this.state.trainingName}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingDays">Toimumispäevad</Label>
                                <Input type="select" name="trainingDays" id="trainingDays" value={this.state.trainingDays}
                                       onChange={this.onSelectChange} multiple>
                                    <option value="1">Esmaspäev</option>
                                    <option value="2">Teisipäev</option>
                                    <option value="3">Kolmapäev</option>
                                    <option value="4">Neljapäev</option>
                                    <option value="5">Reede</option>
                                    <option value="6">Laupäev</option>
                                    <option value="7">Pühapäev</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingGroups">Grupid</Label>
                                <Input type="select" name="trainingGroups" id="trainingGroups" value={this.state.trainingGroups}
                                       onChange={this.onSelectChange} multiple>
                                    {this.state.groupOptions}
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingStart">Alguskuupäev</Label>
                                <Input type="text" name="trainingStart" id="trainingStart" value={moment.utc(this.state.trainingStart).format('DD.MM.YYYY')}
                                       onClick={this.toggleStartDate}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingEnd">Lõppkuupäev</Label>
                                <Input type="text" name="trainingEnd" id="trainingEnd" value={moment.utc(this.state.trainingEnd).format('DD.MM.YYYY')}
                                       onClick={this.toggleEndDate}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingStartTime">Algusaeg</Label>
                                <div className="form-control">
                                <TimePicker
                                    name="trainingStartTime"
                                    showSecond={false}
                                    value={this.state.trainingStartTime}
                                    onChange={(value) => this.setState({trainingStartTime: value})}
                                />
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingEndTime">Lõppaeg</Label>
                                <div className="form-control">
                                    <TimePicker
                                        name="trainingEndTime"
                                        showSecond={false}
                                        value={this.state.trainingEndTime}
                                        onChange={(value) =>
                                            this.setState({trainingEndTime: value})}
                                    />
                                </div>
                            </FormGroup>
                        </Form>
                        <Modal isOpen={this.state.modalStartDate} toggle={this.toggleStartDate}>
                            <ModalHeader>Alguskuupäev</ModalHeader>
                            <ModalBody>
                                <InfiniteCalendar onSelect={
                                    (date) => { this.setState({
                                        trainingStart: date,
                                        modalStartDate: false
                                    })}}
                                />
                            </ModalBody>
                        </Modal>
                        <Modal isOpen={this.state.modalEndDate} toggle={this.toggleEndDate}>
                            <ModalHeader>Lõppkuupäev</ModalHeader>
                            <ModalBody>
                                <InfiniteCalendar onSelect={
                                    (date) => { this.setState({
                                        trainingEnd: date,
                                        modalEndDate: false
                                    })}}
                                />
                            </ModalBody>
                        </Modal>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleSubmit}>Lisa</Button>{' '}
                        <Button color="secondary" onClick={this.toggleNew}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.modalDelete} toggle={this.toggleDelete}>
                    <ModalHeader toggle={this.toggleDelete}>Trenni kustutamine</ModalHeader>
                    <ModalBody>
                        Kas oled kindel, et soovid kustuta trenni "{this.state.trainingName}"?
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleDelete}>Kustuta</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDelete}>Tagasi</Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.modalEdit} toggle={this.toggleEdit}>
                    <ModalHeader toggle={this.toggleEdit}>Trenni muutmine</ModalHeader>
                    <ModalBody>
                        <Form>
                            <FormGroup>
                                <Label for="trainingName">Nimetus</Label>
                                <Input type="text" name="trainingName" id="trainingName" value={this.state.trainingName}
                                       onChange={this.onChange}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingDays">Toimumispäevad</Label>
                                <Input type="select" name="trainingDays" id="trainingDays" value={this.state.trainingDays}
                                       onChange={this.onSelectChange} multiple>
                                    <option value="1">Esmaspäev</option>
                                    <option value="2">Teisipäev</option>
                                    <option value="3">Kolmapäev</option>
                                    <option value="4">Neljapäev</option>
                                    <option value="5">Reede</option>
                                    <option value="6">Laupäev</option>
                                    <option value="7">Pühapäev</option>
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingGroups">Grupid</Label>
                                <Input type="select" name="trainingGroups" id="trainingGroups" value={this.state.trainingGroups}
                                       onChange={this.onSelectChange} multiple>
                                    {this.state.groupOptions}
                                </Input>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingStart">Alguskuupäev</Label>
                                <Input type="text" name="trainingStart" id="trainingStart" value={moment.utc(this.state.trainingStart).format('DD.MM.YYYY')}
                                       onClick={this.toggleStartDate}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingEnd">Lõppkuupäev</Label>
                                <Input type="text" name="trainingEnd" id="trainingEnd" value={moment.utc(this.state.trainingEnd).format('DD.MM.YYYY')}
                                       onClick={this.toggleEndDate}/>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingStartTime">Algusaeg</Label>
                                <div className="form-control">
                                    <TimePicker
                                        name="trainingStartTime"
                                        showSecond={false}
                                        value={this.state.trainingStartTime}
                                        onChange={(value) => this.setState({trainingStartTime: value})}
                                    />
                                </div>
                            </FormGroup>
                            <FormGroup>
                                <Label for="trainingEndTime">Lõppaeg</Label>
                                <div className="form-control">
                                    <TimePicker
                                        name="trainingEndTime"
                                        showSecond={false}
                                        value={this.state.trainingEndTime}
                                        onChange={(value) =>
                                            this.setState({trainingEndTime: value})}
                                    />
                                </div>
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