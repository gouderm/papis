import { GetFileUrl } from "../api/fetch"
import { SERVER } from "../constants"

function Preview({ activeLib, activeRef }) {
  let attachmentList = activeRef.files ? activeRef.files : []

  let previewPDF = GetFileUrl(SERVER, activeLib, activeRef._hash, 0)
  if (attachmentList.length === 0)
    previewPDF = ""

  return <div className='d-flex flex-column' style={{ width: "100%" }}>


    <h4><span>{activeRef.title}</span></h4>

    <p>
      <span className='authors'>{activeRef.author}</span>
    </p>

    <p>
      <strong>ref:</strong>
      <span>
        {activeRef.ref}</span>
    </p>

    <p>
      <strong>publisher:</strong>
      <span>
        {activeRef.publisher}</span>
    </p>

    <p>
      <strong>year:</strong>
      <span>
        {activeRef.year}</span>
    </p>

    <p>
      <strong>tags:</strong>
      <span>
        {activeRef.tags}</span>
    </p>

    <p>
      <strong>time-added:</strong>
      <span>
        {activeRef["time-added"]}</span>
    </p>

    <p>
      <strong>url:</strong>
      <a href={activeRef.url} className='ref'>
        {activeRef.url}</a>
    </p>

    <p>
      <strong>doi:</strong>
      <span>
        {activeRef.doi}</span>
    </p>

    <p>
      <strong>files:</strong>

      <ul>
        {attachmentList.map((fileName, index) => {
          let fileURL = GetFileUrl(SERVER, activeLib, activeRef._hash, index)
          return <li><a href={fileURL} style={{ margin: "5px" }}>{fileName}</a> </li>
        })
        }
      </ul>
    </p>

    <p>
      <strong>preview ({attachmentList[0]}):</strong>
    </p>

    <div className='flex-grow-1'>
      <iframe title="preview" src={previewPDF} style={{ height: "100%", width: "100%" }}></iframe>
    </div>
  </div>
}

export default Preview;
