import Button from 'react-bootstrap/Button'
import DisabledButton from './DisabledButton'

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import * as CONSTANTS from "../constants"

const Attachments = (props) => {
    let selectedLib = props.selectedLib
    let selectedRef = props.selectedRef

    let numFiles = (selectedRef["files"] || []).length

    const files = [];

    for (let i = 0; i < numFiles; i++) {
        let pdfURL = CONSTANTS.SERVER + "/api/libraries/" + selectedLib + "/docs/" + selectedRef._hash + "/file/" + i
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

export default Attachments;