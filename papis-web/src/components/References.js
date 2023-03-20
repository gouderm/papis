import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import { Tags } from './basic/Tags';


function Title({ text, refTagsStr, tags, setTags }) {
  return <div>
    {text}
    <Tags refTagsStr={refTagsStr} tags={tags} setTags={setTags} />
  </div>
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
          val = <Title text={r[key]} refTagsStr={r["tags"]} tags={tags} setTags={setTags} />
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
        <thead style={{ position: "sticky", top: "0", background: "white", borderBottom: "1px solid black" }}>
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
