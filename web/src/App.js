import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "antd/dist/antd.css";
import 'bootstrap/dist/css/bootstrap.css';

import Selector from './components/Selector';
import References from './components/References';
import Preview from './components/Preview';


export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            selectedLib: "papers",
            tags: [],
            selectedRef: {},
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    onNewReferenceQuery = (lib, tags, folders, query) => {
        this.setState({
            selectedLib: lib,
            tags: ((tags !== undefined) ? tags : []),
            activeFolders: ((folders !== undefined) ? folders : []),
            activeQuery: ((query !== undefined) ? query : "")
        })
    }

    onSelectRef = (ref) => {
        this.setState({
            selectedRef: ref,
        })
    }

    render() {
        return (
            <Container
                className="bg-light border"
                fluid
                style={{ height: "100vh", padding: 0, margin: 0 }}
            >
                <Row style={{ height: "100vh", padding: 0, margin: 0, overflow: "hidden" }}>
                    <Col className="bg-light border col-3" style={{ height: "100%" }}>
                        <Selector onNewReferenceQuery={this.onNewReferenceQuery} />
                    </Col>
                    <Col className="bg-light border" style={{ height: "100%" }}>
                        <References selectedLib={this.state.selectedLib} tags={[].concat(this.state.tags)} activeFolders={[].concat(this.state.activeFolders)} activeQuery={this.state.activeQuery} onSelectRef={this.onSelectRef} />
                    </Col>
                    <Col className="bg-light border" style={{ height: "100%" }}>
                        <Preview selectedLib={this.state.selectedLib} selectedRef={{ ...this.state.selectedRef }} />
                    </Col>
                </Row>
            </Container>
        )
    }
}
