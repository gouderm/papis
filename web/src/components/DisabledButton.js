import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Button } from 'react-bootstrap';

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

export default DisabledButton