import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import axios from "axios";
import {
    Table,
    ListGroup,
    ListGroupItem,
    ListGroupItemText,
    ListGroupItemHeading,
} from 'reactstrap';
import { Button, Pagination, Badge } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import { Textarea } from '@geist-ui/core'

import "antd/dist/antd.css";
import { Tree } from 'antd';

import 'bootstrap/dist/css/bootstrap.css';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

// const SERVER = "http://localhost:8080" // only for development
const SERVER = ""

const TAGS_SPLIT_RX = /\s*[,\s]\s*/

function convertToHierarchy(arry /* array of array of strings */) {
    var item, path;

    // Discard duplicates and set up parent/child relationships
    var children = {};
    var hasParent = {};
    for (var i = 0; i < arry.length; i++) {
        var path = arry[i];
        var parent = null;
        for (var j = 0; j < path.length; j++) {
            var item = path[j];
            if (!children[item]) {
                children[item] = {};
            }
            if (parent) {
                children[parent][item] = true; /* dummy value */
                hasParent[item] = true;
            }
            parent = item;
        }
    }

    // Now build the hierarchy
    var result = [];
    for (item in children) {
        if (!hasParent[item]) {
            result.push(buildNodeRecursive(item, children));
        }
    }

    result.forEach((root, index) => {
        setKeyRecursive(root, index.toString())
    })

    return result;
}

function setKeyRecursive(tree, nodeKey) {
    tree["key"] = nodeKey
    tree.children.forEach((child, index) => {
        setKeyRecursive(child, nodeKey + "-" + index)
    });
}

function buildNodeRecursive(item, children) {
    var node = { title: item, children: [] };
    for (var child in children[item]) {
        node.children.push(buildNodeRecursive(child, children));
    }
    return node;
}

function findKey(folderTreeObj, key, path = "", depth = 1) {
    let keys = key.split("-")
    let parentKey = keys.slice(0, depth).join("-")

    for (var i = 0, len = folderTreeObj.length; i < len; i++) {

        if (folderTreeObj[i].key === parentKey) {
            path += "/" + folderTreeObj[i].title
            if (keys.length > depth) {
                return findKey(folderTreeObj[i].children, key, path, depth + 1)
            } else {
                return path
            }
        }
    }
}


const Title = (props) => {
    return <div className="align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom">
        <span className="fs-5 fw-semibold">{props.name}</span>
    </div>
}

class NotesEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "notes": "loading..."
        }
    }


    update() {
        if (this.props.selectedRef._hash === undefined) return

        axios({
            url: SERVER + "/api/libraries/" + this.props.selectedLib + "/docs/" + this.props.selectedRef._hash + "/notes",
            method: "GET",
        }).then((res) => {
            if (this.state.notes !== res.data) {
                this.setState({ "notes": res.data })
            }
        }).catch((error) => {
            console.log("could not load notes.", error)
        })
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.update()
        }
    }

    render() {
        return <div>
            <Textarea value={this.state.notes} width="100%" rows={20} />
        </div>
    }
}

class Selector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "libraries": [],
            activeLib: "", // selected Library
            activeTags: [], // selected Tags
            activeFolders: [], // selected Folderes
            activeQuery: "",
            "tags": [], // all tags
            "folders": [], // all folders
        }
    }

    componentDidMount() {
        // fetch new library-list
        axios({
            url: SERVER + "/api/libraries",
            method: "GET",
        }).then((res) => {
            this.setState({ "libraries": res.data })
            this.onSelectLib(res.data[0])
        }).catch((error) => {
            console.log("could not load libraries.", error)
        })
    }

    onSelectLib(lib, index) {
        this.props.onNewReferenceQuery(lib)
        this.setState({ "activeLib": lib, activeTags: [], activeFolders: [], activeQuery: "" })

        // fetch new tag-list
        axios({
            url: SERVER + "/api/libraries/" + lib + "/tags",
            method: "GET",
        }).then((res) => {
            this.setState({ "tags": res.data.sort() })
        }).catch((error) => {
            console.log("could not load taglist.", error)
        })

        // fetch new folder-list
        axios({
            url: SERVER + "/api/libraries/" + lib + "/folders",
            method: "GET",
        }).then((res) => {
            let folders_abs_path = res.data
            let folders_abs_path_split = []

            folders_abs_path.forEach(element => {
                folders_abs_path_split.push(element.split("/"))
            });
            let folders = {}

            folders = convertToHierarchy(folders_abs_path_split)

            this.setState({ "folders": folders })
        }).catch((error) => {
            console.log("could not load folderlist.", error)
        })
    }

    onSelectTags(tag, index) {
        let _activeTags = this.state.activeTags
        let idx = _activeTags.indexOf(tag)
        if (idx === -1) {
            _activeTags.push(tag)
        } else {
            _activeTags.splice(idx, 1)
        }
        this.setState({ activeTags: _activeTags })
        this.props.onNewReferenceQuery(this.state.activeLib, _activeTags, this.state.activeFolders, this.state.activeQuery)
    }

    onSelectFolders(folderKey) {
        let activeFolders = []
        folderKey.forEach((selectedFolder => {
            activeFolders.push(findKey(this.state.folders, selectedFolder))
        }))

        this.setState({ activeFolders: activeFolders })
        this.props.onNewReferenceQuery(this.state.activeLib, this.state.activeTags, activeFolders, this.state.activeQuery)
    }

    onQueryChange(event) {
        let currentText = event.target.value
        this.setState({ activeQuery: currentText })
    }

    onQuerySubmit(currentLib) {
        currentLib = currentLib ? currentLib : this.state.activeQuery
        this.props.onNewReferenceQuery(this.state.activeLib, this.state.activeTags, this.state.activeFolders, currentLib)
    }

    onQueryEnter(key) {
        if (key.key === "Enter") {
            this.onQuerySubmit()
        }
    }

    render() {
        return <div className="d-flex flex-column" style={{ height: "100%" }}>

            <Title name="Selector" />
            <div style={{ height: "100%", overflowY: "auto" }}>
                <strong>Libraries</strong>

                <DropdownButton title={this.state.activeLib}>
                    {
                        this.state.libraries.map((lib, index) => {
                            let active = this.state.activeLib === lib ? "active" : "";
                            return <Dropdown.Item key={index} className={active} action onClick={() => this.onSelectLib(lib, index)}>{lib}</Dropdown.Item>
                        })
                    }
                </DropdownButton>

                <strong>Query</strong>
                <br />
                <div>
                    <input
                        type="input"
                        id="inputQuery"
                        value={this.state.activeQuery}
                        onChange={(event) => this.onQueryChange(event)}
                        onKeyUp={(key) => this.onQueryEnter(key)}
                    />
                    <Button variant="primary" onClick={() => this.onQuerySubmit()}> Search </Button>
                </div>

                <strong>Folders</strong>

                <div>
                    <Tree
                        onSelect={(folderKey) => this.onSelectFolders(folderKey)}
                        treeData={this.state.folders}
                    />
                </div>

                <strong>Tags</strong>

                <div>
                    {
                        this.state.tags.map((tag, index) => {
                            return <Button
                                key={index}
                                variant={this.state.activeTags.indexOf(tag) >= 0 ? "primary" : "secondary"}
                                onClick={() => this.onSelectTags(tag, index)}>
                                {tag}
                            </Button>
                        })
                    }
                </div>

            </div>
        </div>
    }
}


class References extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "references": [],
            activeRef: undefined,
            currentPage: 1,
            refsPerPage: 20,
        }
    }

    update() {
        axios({
            url: SERVER + "/api/libraries/" + this.props.selectedLib + "/docs",
            method: "GET",
            params: {
                tags: this.props.tags,
                activeFolders: this.props.activeFolders,
                activeQuery: this.props.activeQuery
            }
        })
            .then((res) => {
                if (this.state.references !== res.data) {
                    this.setState({ "references": res.data })
                }
            }).catch((error) => {
                console.log("could not load references.", error)
            })
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.update()
        }
    }

    getNumPages() {
        return Math.ceil(this.state.references.length / this.state.refsPerPage)
    }

    setPage(numPages, relative = false) {
        let nextPage = relative ? this.state.currentPage + numPages : numPages
        if (relative === false && numPages < 0) {
            nextPage += this.getNumPages() + 1
        }
        nextPage = Math.max(nextPage, 1)
        nextPage = Math.min(nextPage, this.getNumPages())
        this.setState({ currentPage: nextPage })
    }

    setRefsPerPage(refsPerPage) {
        if (refsPerPage === this.state.refsPerPage) {
            return
        }
        this.setPage(0, false)
        this.setState({ refsPerPage: refsPerPage })
    }

    getCurrentRefsOnPage() {
        return this.state.references.slice(
            this.state.refsPerPage * (this.state.currentPage - 1),
            this.state.refsPerPage * this.state.currentPage,
        )
    }

    onSelectRef(ref) {
        this.setState({ activeRef: ref })
        this.props.onSelectRef(ref)
    }

    sort(key, reverse = false) {
        let sortedRefs = this.state.references

        sortedRefs = sortedRefs.sort((a, b) => {
            if (!(key in a)) {
                return 0
            }
            if (!(key in b)) {
                return 0
            }
            let key_a = a[key].toString()
            let key_b = b[key].toString()

            let cmp = key_a.localeCompare(key_b)
            cmp = reverse ? -cmp : cmp
            return cmp
        })

        this.setState({ references: sortedRefs })
    }

    render() {
        return <div className="d-flex flex-column" style={{ height: "100%" }}>
            <Title name="References" />
            <Pagination>

                <Pagination.First onClick={() => this.setPage(0, false)} />
                <Pagination.Prev onClick={() => this.setPage(-1, true)} />
                <Pagination.Item>{this.state.currentPage}</Pagination.Item>
                <Pagination.Next onClick={() => this.setPage(1, true)} />
                <Pagination.Last onClick={() => this.setPage(-1, false)} />

                <DropdownButton id="dropdown-basic-button" title={"Refs Per Page (" + this.state.refsPerPage + ")"}>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(10)}>10</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(20)}>20</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(50)}>50</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(200)}>200</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(10000)}>10000</Dropdown.Item>
                </DropdownButton>

                <DropdownButton id="dropdown-basic-button" title={"Sort"}>
                    <Dropdown.Item onClick={() => this.sort("title")}>title (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("title", true)}>title (desc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("time-added")}>time-added (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("time-added", true)}>time-added (desc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("author")}>author (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("author", true)}>author (desc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("year")}>year (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.sort("year", true)}>year (desc)</Dropdown.Item>
                </DropdownButton>

            </Pagination>

            <div style={{ height: "100%", overflowY: "auto" }}>

                <ListGroup>
                    {
                        this.getCurrentRefsOnPage().map((ref, index) => (
                            <ListGroupItem
                                action
                                key={index}
                                className={JSON.stringify(ref) === JSON.stringify(this.state.activeRef) ? "active" : ""}
                                onClick={() => this.onSelectRef(ref)}
                                tag="button"
                            >
                                <ListGroupItemHeading>
                                    {ref.title}
                                    {
                                        (ref.tags || "").split(TAGS_SPLIT_RX).map((tag) => (
                                            <Badge>{tag}</Badge>
                                        ))
                                    }
                                </ListGroupItemHeading>
                                <ListGroupItemText>
                                    <small>{ref['author']}</small><br />
                                    <small>{ref['journal']} ({(ref['year'])})</small>
                                </ListGroupItemText>
                            </ListGroupItem>
                        ))
                    }
                </ListGroup>

            </div>
        </div>
    }
}

const DisabledButton = (props) => {
    let title = props.title
    let tooltip = props.tooltip
    return <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{tooltip}</Tooltip>}>
        <span className="d-inline-block">
            <Button disabled style={{ pointerEvents: 'none' }}>
                {title}
            </Button>
        </span>
    </OverlayTrigger>
}

const Attachments = (props) => {
    let selectedLib = props.selectedLib
    let selectedRef = props.selectedRef

    let numFiles = (selectedRef["files"] || []).length

    const files = [];

    for (let i = 0; i < numFiles; i++) {
        let pdfURL = SERVER + "/api/libraries/" + selectedLib + "/docs/" + selectedRef._hash + "/file/" + i
        files.push(
            <Tab key={i} eventKey={i.toString()} title={"File " + i.toString()}>
                <div>
                    <br></br>
                    <Button variant="primary" href={pdfURL}>Download</Button>
                    <DisabledButton title="Annotate PDF" tooltip="Not yet implemented. Integration with react-pdf-annotations is planned." />

                    <iframe id={i} title={i} src={pdfURL} style={{ width: "100%", height: "800px" }} />
                </div>
            </Tab>
        )
    }

    return <Tabs
        defaultActiveKey={["0"]}
        style={{ height: "100%" }}
        variant={"pills"}
    >
        {files}
    </Tabs>
}


class Preview extends React.Component {

    render() {
        return <div className="d-flex flex-column" style={{ height: "100%" }}>
            <Title name={"Preview: " + this.props.selectedRef.title} />
            <div style={{ height: "100%", overflowY: "auto" }}>
                <Tabs
                    defaultActiveKey="attachments"
                    id="uncontrolled-tab"
                >

                    <Tab eventKey="attachments" title="Attachments" style={{ height: "100%" }}>

                        <Attachments selectedLib={this.props.selectedLib} selectedRef={{ ...this.props.selectedRef }} />

                    </Tab>


                    <Tab eventKey="notes" title="Notes">
                        <NotesEditor selectedLib={this.props.selectedLib} selectedRef={{ ...this.props.selectedRef }} />
                    </Tab>


                    <Tab eventKey="metadata" title="Metadata">

                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(this.props.selectedRef).map((key, i) => {
                                    return <tr key={i}>
                                        <td>{key}</td>
                                        <td>{JSON.stringify(this.props.selectedRef[key])}</td>
                                    </tr>
                                })}
                            </tbody>
                        </Table>

                    </Tab>
                </Tabs>
            </div>
        </div>
    }
}


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
