import { useState } from 'react';
import { Container, Stack } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/esm/Button';
import TitleWrapper from './basic/TitleWrapper';
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
    if (event.key === 'Enter') {
      setQuery(currentQuery)
    }
  }

  return <Container>
    <TitleWrapper title="Libraries">
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
    </TitleWrapper>

    <TitleWrapper title="Tags">
      {Object.keys(tags).map(tag => {
        let isActive = tags[tag]
        let active = isActive ? "btn-primary" : "btn-secondary"

        return <Button className={active} size="sm" onClick={() => {
          let _tags = { ...tags }
          _tags[tag] = !isActive
          setTags(_tags)
        }}>{tag}</Button>
      })}
    </TitleWrapper>


    <TitleWrapper title="Folders">
      <TreeList
        folderTree={folderTree}
        setFolderTree={setFolderTree}
      />
    </TitleWrapper>

    <TitleWrapper title="Query">
    <Stack direction="horizontal" gap={2}>
          <input
            type="input"
            id="inputQuery"
            value={currentQuery}
            onChange={(event) => { setCurrentQuerry(event.target.value) }}
            onKeyUp={onQueryKeyUp}
            className="w-100"
          />
        <Button size="sm" className="p2" variant="primary" onClick={() => setQuery(currentQuery)}> Search </Button>
    </Stack>
    </TitleWrapper>

</Container>
}

Filter.defaultProps = {
  libs: [],
  activeLib: "active lib not defined",
  setActiveLib: undefined,
  tags: {},
  setTags: undefined,
}

export default Filter
