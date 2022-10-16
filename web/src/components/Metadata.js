import React from 'react';
import { Table } from 'antd';
import Container from 'react-bootstrap/Container'

var columns = [
    {
        title: 'Key',
        dataIndex: 'papisKey',
        key: '_key',
    },
    {
        title: 'Value',
        dataIndex: 'papisVal',
        key: '_val',
    },
];


class Metadata extends React.Component {
    constructor(props) {
        super(props);
        // props.ref

        this.state = {
        };
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.selectedRef) !== JSON.stringify(this.props.selectedRef)) {

            let dataSource = []

            Object.keys(this.props.selectedRef).forEach((papisKey, i) => {
                dataSource.push({
                    key: i,
                    papisKey: papisKey,
                    papisVal: JSON.stringify(this.props.selectedRef[papisKey])
                })
            })

            this.setState({ dataSource: dataSource })
        }
    }


    render() {
        return <Container fluid className="d-flex flex-column" style={{ height: "100%", maxHeight: "100%", overflow: "auto" }}>
            <Table dataSource={this.state.dataSource} columns={columns} size={"small"} bordered={true} pagination={false} />
        </Container>
    }
}

export default Metadata;