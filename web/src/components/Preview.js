import React from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Table from 'react-bootstrap/Table';

import TitleBar from './TitleBar';
import Attachments from './Attachments';
import NotesEditor from './NotesEditor';

class Preview extends React.Component {

    render() {
        return <div className="d-flex flex-column" style={{ height: "100%" }}>
            <TitleBar name={"Preview: " + this.props.selectedRef.title} />
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

export default Preview;