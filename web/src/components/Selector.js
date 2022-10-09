import React from 'react';
import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/Button'

import { Tree } from 'antd';

import TitleBar from './TitleBar';

import * as CONSTANTS from "../constants"

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
            url: CONSTANTS.SERVER + "/api/libraries",
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
            url: CONSTANTS.SERVER + "/api/libraries/" + lib + "/tags",
            method: "GET",
        }).then((res) => {
            this.setState({ "tags": res.data.sort() })
        }).catch((error) => {
            console.log("could not load taglist.", error)
        })

        // fetch new folder-list
        axios({
            url: CONSTANTS.SERVER + "/api/libraries/" + lib + "/folders",
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

            <TitleBar name="Selector" />
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

export default Selector;