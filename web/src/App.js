import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import "antd/dist/antd.css";
import 'bootstrap/dist/css/bootstrap.css';


import * as CONSTANTS from "./constants"

import Selector from './components/Selector';
import References from './components/References';
import Preview from './components/Preview';
import axios from 'axios';
import { MenuOutlined } from '@ant-design/icons';
import { compareObjects } from './helperFunctions';


export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedLib: "",
            tags: [],
            selectedRef: {},
            config: {},
            showSelector: false,
            showPreview: false,
        };
    }

    componentDidMount() {
        if (!this.mounted) {
            this.mounted = true
            axios({
                url: CONSTANTS.SERVER + "/api/config",
                method: "GET",
            }).then((res) => {
                let _config = res.data
                this.setState({ config: _config })
            }).catch((error) => {
                console.log("could not load general config.", error)
            })
        }
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
            showPreview: compareObjects(ref, {}) ? false : true,
        })
    }

    render() {
        const SelectorButton = <MenuOutlined onClick={() => {
            this.setState({ showSelector: !this.state.showSelector })
        }} />

        return (
            <Container
                className="bg-light border"
                fluid
                style={{ height: "100vh", padding: 0, margin: 0, overflow: "hidden" }}
            >
                <Row style={{ height: "100vh", padding: 0, margin: 0, overflow: "auto", scrollSnapType: "y mandatory" }}>

                    <Col hidden={!this.state.showSelector} className="border" style={{ height: "100%", minHeight: "100%", minWidth: "300px", scrollSnapAlign: "start" }}>
                        <Selector  title={
                        <div>
                            {SelectorButton} Selector
                        </div>
                    } config={this.state.config} onNewReferenceQuery={this.onNewReferenceQuery} />
                    </Col>

                    <Col className="border" style={{ height: "100%", minHeight: "100%", scrollSnapAlign: "start" }}>
                        <References title={
                            <div>
                                {this.state.showSelector ? <></> : SelectorButton} References
                            </div>
                        } selectedLib={this.state.selectedLib} tags={[].concat(this.state.tags)} activeFolders={[].concat(this.state.activeFolders)} activeQuery={this.state.activeQuery} onSelectRef={this.onSelectRef} />
                    </Col>

                    <Col hidden={!this.state.showPreview} className="border" style={{ height: "100%", minHeight: "100%", minWidth: "375px", scrollSnapAlign: "start" }}>
                        <Preview selectedLib={this.state.selectedLib} selectedRef={{ ...this.state.selectedRef }} />
                    </Col>
                </Row>
            </Container>
        )
    }
}

