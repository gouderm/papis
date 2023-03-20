import "./Preview.css"
import { FetchInfoFile, GetFileUrl, FetchNotesFile, CreateNotesFile, DeleteNotesFile, EditNotesFile, FetchRefBibtex, FetchRefBibtexRef, DownloadZip, GetZipUrl } from "../api/fetch"
import { SERVER } from "../constants"

import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { Tags } from "./basic/Tags";
import { BsPlusCircle, BsPlus, BsDash, BsThreeDots } from "react-icons/bs";
import { Col, Row, Container, Stack, Dropdown } from "react-bootstrap";
import TitleWrapper from "./basic/TitleWrapper";

function RefProp({ propKey, propValue, onEditActiveRef, tags, setTags, keyEditable }) {

  const [show, setShow] = useState(false);
  const [editKey, setEditKey] = useState();
  const [editVal, setEditVal] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  let keyElement = <strong onClick={handleShow}>{propKey}:</strong>
  let valueElement = <span onClick={handleShow}>{propValue}</span>

  switch (propKey) {
    case "url":
    case "doc_url":
      valueElement = <a href={propValue}> {propValue}</a>
      break

    case "doi":
      valueElement = <a href={"https://doi.org/" + propValue}>{propValue}</a>
      break

    // case "author":
    //   keyElement = ""
    //   valueElement = <span onClick={handleShow}><i>{propValue}</i><hr /></span>
    //   break

    case "tags":
      valueElement = <Tags refTagsStr={propValue} tags={tags} setTags={setTags} />
      break

    case "":
      keyElement = <strong onClick={handleShow}><i>add-key-value</i>   </strong>
      valueElement = <BsPlusCircle onClick={handleShow} />
      keyEditable = true
      break
  }

  function isValidKey(key) {
    return key && (key !== "_hash") && (key.length > 0)
  }

  function handleSubmit(submitEvent) {
    if (submitEvent)
      submitEvent.preventDefault();

    if (!isValidKey(editKey || propKey))
      return

    onEditActiveRef && onEditActiveRef(
      editKey || propKey,
      editVal
    );
    handleClose();
  }

  function onKeyUp(event) {
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }

  useEffect(() => {
    setEditVal(propValue)
  }, [propValue])


  return <div
    className="editable"
  >
    <a onClick={handleShow}>
      {keyElement}
    </a>
    {valueElement}

    <>
      <Modal show={show} onHide={handleClose} onSubmit={handleSubmit} >
        <Modal.Header closeButton>
          <Modal.Title>Edit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Key:</Form.Label>
              <Form.Control
                type="text"
                autoFocus
                defaultValue={propKey}
                readOnly={!keyEditable}
                value={editKey}
                placeholder="new key"
                onChange={e => setEditKey(e.target.value)}
                onKeyUp={onKeyUp}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Value:</Form.Label>
              <Form.Control
                type="text"
                autoFocus={!keyEditable}
                defaultValue={propValue}
                value={editVal}
                placeholder="new value"
                onChange={e => setEditVal(e.target.value)}
                onKeyUp={onKeyUp}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={!isValidKey(editKey || propKey)}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  </div>
}

function InfoNice({ activeRef, activeLib, onEditActiveRef, tags, setTags }) {
  let attachmentList = activeRef.files ? activeRef.files : []

  let showAll = true
  let entries
  if (showAll) {
    entries = [... new Set(["author", ...Object.keys(activeRef)])] // author in beginning
  } else {
    entries = ["author", "ref", "publisher", "year", "tags", "time-added", "url", "doi"]
  }

  return <div style={{ width: "100%" }}>

    {entries.map(key => {
      let value = activeRef[key];
      if (typeof (value) === "object") return ""
      return (showAll || value || (key == "")) && <RefProp
        propKey={key}
        propValue={value}
        onEditActiveRef={onEditActiveRef}
        tags={tags}
        setTags={setTags}
      />
    })}

    <div>
      <strong>files:</strong>
      <ul>
        {attachmentList.map(fileName => {
          let fileURL = GetFileUrl(SERVER, activeLib, activeRef._hash, fileName)
          return <li><a href={fileURL} style={{ margin: "5px" }}>{fileName}</a> </li>
        })
        }
      </ul>
    </div>

    <RefProp
      propKey={""}
      onEditActiveRef={onEditActiveRef}
      className="editable"
    />
  </div>
}

function InfoYaml({ activeLib, activeRef, onUpdateYaml }) {

  const [infoText, setInfoText] = useState("")

  function reloadInfoFile() {
    FetchInfoFile(SERVER, activeLib, activeRef._hash).then(res => {
      setInfoText(res.data)
    }).catch(console.error)
  }
  useEffect(() => {
    reloadInfoFile()
  }, [activeRef])

  return <div>
    <textarea value={infoText} onChange={e => setInfoText(e.target.value)} style={{ "width": "calc(100% - 2px)", height: "30vh" }} />
    <Button size="sm" onClick={reloadInfoFile}>Reload</Button>
    <Button size="sm" onClick={_ => onUpdateYaml(infoText)}>Update Info File</Button>
  </div>
}


function Info({ activeLib, activeRef, onEditActiveRef, onUpdateYaml, tags, setTags }) {
  const [showRawInfo, setShowRawInfo] = useState(false)
  function toggleShowRawInfo() {
    setShowRawInfo(!showRawInfo)
  }

  const Info = showRawInfo ? <InfoYaml
    activeLib={activeLib}
    activeRef={activeRef}
    onUpdateYaml={onUpdateYaml}
  /> : <InfoNice
    activeRef={activeRef}
    activeLib={activeLib}
    onEditActiveRef={onEditActiveRef}
    tags={tags}
    setTags={setTags}
  />

  return <TitleWrapper title="Info">
    <div className="d-flex">
      <div className="flex-grow-1">
        {Info}
      </div>
      <div>
        <input type="checkbox" onClick={toggleShowRawInfo} checked={showRawInfo} />
        <span onClick={toggleShowRawInfo}>YAML</span>
      </div>
    </div>
  </TitleWrapper>
}




function NotesViewer({ activeLib, activeRef, onEditNotes }) {
  const hasNotes = (activeRef.notes !== undefined)
  const [notesText, setNotesText] = useState("")

  function reloadNotesFile() {
    hasNotes && FetchNotesFile(SERVER, activeLib, activeRef._hash).then(res => {
      setNotesText(res.data)
    }).catch(console.error)
  }

  useEffect(() => {
    if (hasNotes) reloadNotesFile()
  }, [activeRef])

  function CreateNotesButton() {

    const onClick = () => {
      CreateNotesFile(SERVER, activeLib, activeRef._hash).then(res => {
        setNotesText(res.data)
        onEditNotes();
      }).catch(console.error)
    }

    return <div>
      <div>No Notes attached to this reference</div>
      <Button size="sm" onClick={onClick}>Create Notes</Button>
    </div>
  }

  const colProps = {}
  return <TitleWrapper title="Notes" colProps={colProps}>
    {hasNotes ? <div>
      < textarea value={notesText} onChange={e => setNotesText(e.target.value)} style={{ "width": "calc(100% - 2px)", height: "30vh" }} />
      <Button onClick={() => {
        DeleteNotesFile(SERVER, activeLib, activeRef._hash).then(
          _ => onEditNotes()
        );
      }}>Delete Notes</Button>

      <Button onClick={() => {
        onEditNotes(notesText);
      }}>
        Update Notes
      </Button>
    </div> : <CreateNotesButton />
    }
    <div style={{ minWidth: "50%" }}></div>
  </TitleWrapper>
}


function PdfViewer({ activeLib, activeRef }) {
  const attachmentList = activeRef.files ? activeRef.files : []

  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileUrl, setCurrentFileUrl] = useState("");

  const file_url = file_name => GetFileUrl(SERVER, activeLib, activeRef._hash, file_name)

  useEffect(() => {
    if (attachmentList.length === 0) {
      setCurrentFileName("")
      setCurrentFileUrl("")
    } else {
      setCurrentFileName(attachmentList[0])
      setCurrentFileUrl(file_url(attachmentList[0]))
    }
  }, [activeRef])

  const colProps = { lg: 12, style: { height: "100%" } }
  return <TitleWrapper title="PdfViewer" colProps={colProps}>
    <strong>({currentFileName}):</strong>
    <iframe title="preview" src={currentFileUrl} className="flex-grow-1" style={{ minHeight: "50vh", height: "100%", width: "100%" }}></iframe>
  </TitleWrapper>
}



function MoreButton({ activeLib, activeRef }) {
  
  const [show, setShow] = useState(false)
  

  const onCopyBibtexClipboard = () => {
    FetchRefBibtex(SERVER, activeLib, activeRef._hash).then(res => {
      navigator.clipboard.writeText(res.data)
    }).catch(e => console.error("Failed to copy bibtex"))
    setShow(false)
  }

  const onCopyBibtexRefClipboard = () => {
    navigator.clipboard.writeText(activeRef.ref)
    setShow(false)
  }

  function downloadButton({ children }) {
    return <a href={GetZipUrl(SERVER, activeLib, activeRef._hash)} className="dropdown-item" onClick={() => {setShow(false)}}>{children}</a>
  }

  return <Dropdown show={show}>
    <Dropdown.Toggle variant="light" onClick={() => setShow(!show)}></Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item onClick={onCopyBibtexClipboard}>Copy Bibtex to Clipboard</Dropdown.Item>
      <Dropdown.Item onClick={onCopyBibtexRefClipboard}>Copy Reference-Id to Clipboard</Dropdown.Item>
      <Dropdown.Item as={downloadButton}>Download ZIP</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
}

// <EditYaml activeLib={activeLib} activeRef={activeRef} onUpdateYaml={onUpdateYaml} />
function Preview({ activeLib, activeRef, onEditActiveRef, onUpdateYaml, onEditNotes, tags, setTags }) {


  const ret = ( activeRef === undefined ) ? <div /> : <div className='d-flex flex-column' style={{ width: "100%", height: "100%", overflowY: "scroll" }}>
    <div className="d-flex">
      <div className="flex-grow-1">
        <h4><span>{activeRef.title}</span></h4>
      </div>
      <MoreButton activeLib={activeLib} activeRef={activeRef} />
    </div>

    <hr />

    <Container fluid>
      <Row>

        <Info
          activeLib={activeLib}
          activeRef={activeRef}
          onEditActiveRef={onEditActiveRef}
          onUpdateYaml={onUpdateYaml}
          tags={tags}
          setTags={setTags}
        />

        <NotesViewer activeLib={activeLib} activeRef={activeRef} onEditNotes={onEditNotes} />

        {true && <PdfViewer activeLib={activeLib} activeRef={activeRef} />}
      </Row>
    </Container>
  </div> 
  
  return ret
  
}

export default Preview;
