import * as React from "react";
import {Component} from "react/lib/ReactBaseClasses";
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import {auth} from "./fire";

export default class extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };

        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    logout() {
        auth.signOut();
    }

    render() {
        return (
            <div>
                <Navbar color="faded" light toggleable>
                    <NavbarToggler right onClick={this.toggle} />
                    <NavbarBrand href="/">Spordiklubi Imperial</NavbarBrand>
                    <Collapse isOpen={this.state.isOpen} navbar>
                        {auth.currentUser &&
                        <Nav className="ml-auto" navbar>
                            <NavItem>
                                <NavLink href="/trainings">Trennid</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/groups">Grupid</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink href="/persons">Inimesed</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink onClick={this.logout}>Logi välja</NavLink>
                            </NavItem>
                        </Nav>
                        }

                        {auth.currentUser === null &&
                        <Nav className="ml-auto" navbar>
                        </Nav>
                        }
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}