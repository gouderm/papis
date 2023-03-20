import { Col } from "react-bootstrap"
import { useState } from "react"
import { BsDash, BsPlus } from "react-icons/bs"

export default function TitleWrapper({ title, children, colProps }) {
  const [expand, setExpand] = useState(true)

  function toggleExpand() {
    setExpand(!expand)
  }

  return <Col {...{ lg: expand ? true : 12 }} {...colProps}>
    <div className="d-flex" onClick={toggleExpand}>
      <div className="flex-grow-1">
        <h5>{title}</h5>
      </div>
      <div>
        <a onClick={toggleExpand} >
          {expand ? <BsDash /> : <BsPlus />}
        </a>
      </div>
    </div>
    {expand && children}
  </Col>
}

