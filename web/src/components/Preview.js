import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Nav from 'react-bootstrap/Nav';

import TitleBar from './TitleBar';
import Attachments from './Attachments';
import NotesEditor from './NotesEditor';
import Metadata from './Metadata';

class Preview extends React.Component {

    render() {
        return <Container fluid className="d-flex flex-column" style={{ height: "100%", width: "100%" }}>
            <Row>
                <TitleBar name={"Preview: " + this.props.selectedRef.title} />
            </Row>
            <Row style={{ height: "100%" }}>

                <Tab.Container defaultActiveKey="attachments" style={{ height: "100%" }}>

                    <Container fluid className="d-flex flex-column" style={{ height: "100%" }}>

                        <Row>
                            <Nav fill variant="tabs">
                                <Nav.Item>
                                    <Nav.Link eventKey="attachments">Attachments</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="notes">Notes</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="metadata">Metadata</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Row>
                        <Row style={{ height: "100%" }}>

                            <Tab.Content style={{ height: "100%" }}>
                                <Tab.Pane eventKey="attachments" title="Attachments" style={{ height: "100%" }}>
                                    <Attachments selectedLib={this.props.selectedLib} selectedRef={{ ...this.props.selectedRef }} />
                                </Tab.Pane>


                                <Tab.Pane eventKey="notes" title="Notes" style={{ height: "100%" }}>
                                    <NotesEditor selectedLib={this.props.selectedLib} selectedRef={{ ...this.props.selectedRef }} />
                                </Tab.Pane>


                                <Tab.Pane eventKey="metadata" title="Metadata" style={{ height: "100%" }}>
                                    <Metadata selectedRef={{ ...this.props.selectedRef }} />
                                </Tab.Pane>

                            </Tab.Content>
                        </Row>

                    </Container>

                </Tab.Container>



            </Row>
        </Container>
    }
}

export default Preview;