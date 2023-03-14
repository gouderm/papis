import { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/esm/Button';
import TreeList from "./basic/TreeView"

function Filter({
  libs,
  activeLib,
  setActiveLib,
  tags,
  setTags,
  folderTree,
  setFolderTree,
  setQuery,
}) {
  const [currentQuery, setCurrentQuerry] = useState("")
  
  function onQueryKeyUp(event) {
    if(event.key === 'Enter'){
      setQuery(currentQuery)
    }
  }

  return <div style={{ overflow: "auto" }}>
    <h4>Libraries</h4>
    <Dropdown size="sm">
      <Dropdown.Toggle id="dropdown-basic">
        {activeLib}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {libs.map(lib => (
          <Dropdown.Item onClick={() => setActiveLib(lib)}>{lib}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>

    <h4>Tags</h4>
    <div>
      {Object.keys(tags).map(tag => {
        let isActive = tags[tag]
        let active = isActive ? "btn-primary" : "btn-secondary"

        return <Button className={active} size="sm" onClick={() => {
          let _tags = {...tags}
          _tags[tag] = !isActive
          setTags(_tags)
        }}>{tag}</Button>
      })}
    </div>


    <h4>Folders</h4>
    <TreeList
      folderTree={folderTree}
      setFolderTree={setFolderTree}
    />

    <h4>Query</h4>
    <div className="d-flex">
    <div className="flex-grow-1">
      <input
        type="input"
        id="inputQuery"
        value={currentQuery}
        onChange={(event) => {setCurrentQuerry(event.target.value)}}
        onKeyUp={onQueryKeyUp}
        className="w-100"
      /></div>
      <Button size="sm" className="p2" variant="primary" onClick={() => setQuery(currentQuery)}> Search </Button>
    </div>

  </div>
}

Filter.defaultProps = {
  libs: [],
  activeLib: "active lib not defined",
  setActiveLib: undefined,
  tags: {},
  setTags: undefined,
}

export default Filter
