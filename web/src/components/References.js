import React from 'react';
import axios from 'axios';
import TitleBar from './TitleBar';
import Pagination from 'react-bootstrap/Pagination';
import ListGroup from 'react-bootstrap/ListGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Badge from 'react-bootstrap/Badge';
import { FileOutlined, FileTextOutlined, SortAscendingOutlined } from '@ant-design/icons';


import * as CONSTANTS from "../constants"


class References extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            references: [],
            activeRef: undefined,
            currentPage: 1,
            refsPerPage: 20,
            activeFilter: "",
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
        }).then((res) => {
            let _docs = res.data

            if (this.state.sortKey) {
                _docs = this.sort(_docs, this.state.sortKey, this.state.sortRev)
            }

            if (this.state.references !== _docs) {
                this.setState({ "references": _docs })
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
        return this.state.references.filter((ref) => (
            !this.state.activeFilter || JSON.stringify(ref).toLowerCase().includes(this.state.activeFilter.toLowerCase())
        )).slice(
            this.state.refsPerPage * (this.state.currentPage - 1),
            this.state.refsPerPage * this.state.currentPage,
        )
    }

    onSelectRef(ref) {
        this.setState({ activeRef: ref })
        this.props.onSelectRef(ref)
    }


    sort(refs, key, reverse = false) {
        let sortedRefs = refs.sort((a, b) => {
            if (!(key in a)) {
                return 0
            }
            if (!(key in b)) {
                return 0
            }
            let key_a = String(a[key])
            let key_b = String(b[key])

            let cmp = key_a.localeCompare(key_b, undefined, { numeric: true })
            cmp = reverse ? -cmp : cmp
            return cmp
        })

        return sortedRefs
    }


    onSort(key, reverse = false) {
        let sortedRefs = this.sort(this.state.references, key, reverse)
        this.setState({ references: sortedRefs, sortKey: key, sortRev: reverse })
    }

    onFilterChange(event) {
        let currentText = event.target.value
        this.setState({ activeFilter: currentText, currentPage: 1 })
    }


    render() {
        return <div className="d-flex flex-column" style={{ height: "100%" }}>
            <TitleBar name="References" />

            <div className='d-flex justify-content-between'>

                <Pagination>
                    <Pagination.First onClick={() => this.setPage(0, false)} />
                    <Pagination.Prev onClick={() => this.setPage(-1, true)} />
                    <Pagination.Item>{this.state.currentPage}</Pagination.Item>
                    <Pagination.Next onClick={() => this.setPage(1, true)} />
                    <Pagination.Last onClick={() => this.setPage(-1, false)} />
                </Pagination>

                <DropdownButton className="ms-auto" id="dropdown-sort" title={<SortAscendingOutlined />}>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(10)}>10</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(20)}>20</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(50)}>50</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(200)}>200</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.setRefsPerPage(10000)}>10000</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => this.onSort("title")}>title (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("title", true)}>title (desc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("time-added")}>time-added (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("time-added", true)}>time-added (desc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("author")}>author (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("author", true)}>author (desc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("year")}>year (asc)</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.onSort("year", true)}>year (desc)</Dropdown.Item>
                </DropdownButton>

            </div>

            <input
                type="input"
                id="inputQuery"
                placeholder="filter"
                onChange={(event) => this.onFilterChange(event)}
                style={{ width: "100%" }}
            />


            <div style={{ height: "100%", overflowY: "auto" }}>

                <ListGroup>
                    {
                        this.getCurrentRefsOnPage().map((ref, index) => {

                            let isActive = JSON.stringify(ref) === JSON.stringify(this.state.activeRef)
                            let className = isActive ? "active" : ""
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
                                                <Badge
                                                    key={index} bg={this.props.tags.some(t => t === tag) ? "primary" : "secondary"}
                                                    className={isActive ? "border" : ""}
                                                >
                                                    {tag}
                                                </Badge>
                                            ))
                                        }
                                    </div>
                                    <div>
                                        <small>{ref['author']}</small><br />
                                        <small>{ref['journal']} ({(ref['year'])})</small>

                                        <div>
                                            {
                                                (ref['files'] || []).map(() => {
                                                    return <FileOutlined />
                                                })
                                            }{
                                                (ref['notes'] && <FileTextOutlined />)
                                            }
                                        </div>
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