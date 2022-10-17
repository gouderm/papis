import React from 'react';
import Button from 'react-bootstrap/Button'
import DisabledButton from './DisabledButton'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';


import * as CONSTANTS from "../constants"

class Attachments extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeFileIndex: 0,
        };
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.setState({ activeFileIndex: 0 })
        }
    }

    render() {
        let selectedRef = this.props.selectedRef
        let pdfURL = CONSTANTS.SERVER + "/api/libraries/" + this.props.selectedLib + "/docs/" + this.props.selectedRef._hash + "/file/" + this.state.activeFileIndex

        let numFiles = (selectedRef["files"] || []).length


        let fileButtons = [];
        for (let i = 0; i < numFiles; i++) {
            fileButtons.push(
                <Button
                    size="sm"
                    variant={this.state.activeFileIndex === i ? "primary" : "secondary"}
                    onClick={() => this.setState({ activeFileIndex: i })}
                    style={{ marginBottom: "2px" }}
                >
                    File {i}
                </Button>
            )
        }

        return <Container fluid className="d-flex flex-column" style={{ height: "100%" }}>
            <Row xs="auto" style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                {fileButtons}
            </Row>
            <hr />
            <Row>
                <Col>
                    <Button variant="primary" href={pdfURL}>Download</Button>
                    <DisabledButton title="Annotate PDF" tooltip="Not yet implemented. Integration with react-pdf-annotations is planned." />
                </Col>
            </Row>
            <Row style={{ height: "100%" }}>
                <iframe title="attachment" src={pdfURL} style={{ width: "100%", height: "100%", paddingBottom: "10px" }} />
            </Row>
        </Container>

    }
}

export default Attachments;