const TitleBar = (props) => {
    return <div className="align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom">
        <span className="fs-5 fw-semibold">{props.symbol} {props.name}</span>
    </div>
}

export default TitleBar