import React from 'react';
import axios from 'axios';
import TitleBar from './TitleBar';
import {
    Pagination,
    ListGroup,
    Dropdown,
    DropdownButton,
    Badge,
} from 'react-bootstrap';


import * as CONSTANTS from "../constants"


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
            url: CONSTANTS.SERVER + "/api/libraries/" + this.props.selectedLib + "/docs",
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
            <TitleBar name="References" />
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
                        this.getCurrentRefsOnPage().map((ref, index) => {

                            let className = JSON.stringify(ref) === JSON.stringify(this.state.activeRef) ? "active" : ""
                            className += " d-flex justify-content-between align-items-start"

                            return <ListGroup.Item
                                action
                                key={index}
                                className={className}
                                onClick={() => this.onSelectRef(ref)}
                                tag="button"
                            >
                                <div>
                                    <div className="fw-bold">
                                        {ref.title + " "}
                                        {
                                            (ref.tags || "").split(CONSTANTS.TAGS_SPLIT_RX).map((tag, index) => (
                                                <Badge key={index}>{tag}</Badge>
                                            ))
                                        }
                                    </div>
                                    <div>
                                        <small>{ref['author']}</small><br />
                                        <small>{ref['journal']} ({(ref['year'])})</small>
                                    </div>
                                </div>
                            </ListGroup.Item>
                        })
                    }
                </ListGroup>

            </div>
        </div>
    }
}

export default References;