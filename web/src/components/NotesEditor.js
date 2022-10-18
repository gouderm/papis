import React from 'react';
import axios from "axios";
import { Textarea } from '@geist-ui/core'

import * as CONSTANTS from "../constants"
import { compareObjects } from '../helperFunctions';

class NotesEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notes: "loading..."
        }
    }


    update() {
        if (!this.props.selectedRef._hash) return

        axios({
            url: CONSTANTS.SERVER + "/api/libraries/" + this.props.selectedLib + "/docs/" + this.props.selectedRef._hash + "/notes",
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
        if (!compareObjects(prevProps, this.props)) {
            this.update()
        }
    }

    render() {
        return <div>
            <Textarea value={this.state.notes} width="100%" rows={20} />
        </div>
    }
}

export default NotesEditor;