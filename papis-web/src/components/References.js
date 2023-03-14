import { useEffect, useState } from 'react';
import { Badge } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { TAGS_SPLIT_RX } from '../constants';
import { BsArrowDown, BsArrowUp } from "react-icons/bs";


function Title({ text, refTags, tags, setTags }) {
  if (!refTags) refTags = []

  const selectedTags = []
  for (let t of Object.keys(tags)) if (tags[t]) selectedTags.push(t)

  function toggleTag(t) {
    let _tags = { ...tags }
    _tags[t] = !_tags[t]
    setTags(_tags)
  }

  return <span>{text}{refTags.map(tag => {
    let active = selectedTags.includes(tag) ? "primary" : "secondary"
    return <Badge bg={active} onClick={() => toggleTag(tag)}><a>{tag}</a></Badge>
  })}</span>

}

function Ref({
  r,
  index,
  activeRef,
  setActiveRef,
  keys,
  tags,
  setTags,
}) {
  let active = activeRef === r ? "table-active" : ""

  return <tr
    onClick={() => setActiveRef(r)}
    className={active}
  >
    <td><a>{index}</a></td>
    {keys.map((key, i) => {
      let val = "";
      switch (key) {
        case "title":
          let refTags = r["tags"] ? r["tags"].split(TAGS_SPLIT_RX) : []
          val = <Title text={r[key]} refTags={refTags} tags={tags} setTags={setTags} />
          break;

        default:
          val = r[key];
          break;
      }

      return <td>{val}</td>
    })}
  </tr>
}

Ref.defaultProps = {
  keys: [],
  tags: [],
}

function HeaderItem({ keyName, sortKey, setSortKey }) {
  let arrow = ""
  let isSortKey = sortKey && sortKey.name === keyName
  let isAscending = sortKey && sortKey.ascending

  if (isSortKey)
    arrow = isAscending ? <BsArrowDown /> : <BsArrowUp />

  return <div>
    <span onClick={() => {
      setSortKey(
        isSortKey ? { name: keyName, ascending: !isAscending } : { name: keyName, ascending: false }
      )
    }}>{keyName}</span>
    {arrow}
  </div>
}

function References({
  refs,
  setRefs,
  activeRef,
  setActiveRef,
  tags,
  setTags,
  sortKey,
  setSortKey,
}) {
  let [keys, setKeys] = useState([
    "title",
    "author",
    "publisher",
    "year",
  ])


  return <div>
    <div className='table-responsive' style={{ height: "100%", overflowY: "scroll" }}>
      <Table>
        <thead style={{position: "sticky", top: "0", background:"white", borderBottom: "1px solid black"}}>
          <tr>
            <th>#</th>
            {keys.map((key, i) => <th><HeaderItem keyName={key} sortKey={sortKey} setSortKey={setSortKey} /></th>)}
          </tr>
        </thead>
        <tbody>
          {refs.map((object, i) =>
            <Ref
              r={object}
              index={i + 1}
              keys={keys}
              activeRef={activeRef}
              setActiveRef={setActiveRef}
              tags={tags}
              setTags={setTags}
            />)}
        </tbody>
      </Table>
    </div>
  </div>
}

References.defaultProps = {
  refs: [],
}

export default References
