import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

import Split from 'react-split'

import PapisNavbar from './components/navbar'
import Filter from './components/Filter';
import References from './components/References';
import Preview from './components/Preview';

import { FetchLibraries, FetchTags, FetchRefs, FetchFolders, FetchSetting, EditRefProperty, EditInfoFile, FetchRefProperties, EditNotesFile } from "./api/fetch"
import { SERVER } from './constants';
import { FolderList2treeObj } from './components/basic/TreeView';


function App() {
  const [activeLib, setActiveLib] = useState()
  const [activeRef, setActiveRef] = useState({})
  const [query, setQuery] = useState("")

  const [libs, setLibs] = useState([]) // list of strings
  const [refs, setRefs] = useState([]) // list of objects
  const [tags, setTags] = useState([]) // list of { tagName: active }
  const [folderTree, setFolderTree] = useState({}) // list of {name:tagName, active:true}
  let [sortKey, setSortKey] = useState() // {name: ..., ascending:true/false}

  function sortRefs() {
    let sortedRefs = [...refs]
    sortedRefs.sort((a, b) => {
      let valA = a[sortKey.name]
      let valB = b[sortKey.name]

      if (!valA) return 1
      if (!valB) return -1


      let ret = ('' + valA).localeCompare(valB);
      return ret * (sortKey.ascending ? 1 : -1)
    })
    setRefs(sortedRefs)
  }

  useEffect(() => {
    sortRefs(sortKey)
  }, [sortKey])

  // load libraries
  useEffect(() => {
    FetchLibraries(SERVER).then(res => {
      if (res)
        setLibs(res.data)
    }).catch((e) => {
      console.error("Failed to fetch libraries")
    })

    FetchSetting(SERVER, "default-library").then(res => {
      if (res)
        setActiveLib(res.data)
    }).catch(e => {
      console.error("Failed to fetch default-library")
    })
  }, [])

  // on change lib, fetch new tags and folders
  useEffect(() => {

    FetchTags(SERVER, activeLib).then(res => {
      if (res) {
        let _tagList = res.data
        let _tags = {}
        for (const tagName of _tagList) _tags[tagName] = false

        setTags(_tags)
      }
    }).catch((e) => {
      console.error("Failed to fetch tags")
    })

    FetchFolders(SERVER, activeLib).then(res => {
      if (res)
        setFolderTree(FolderList2treeObj(res.data))
    }).catch((e) => {
      console.error("Failed to fetch folders")
    })


  }, [activeLib])

  // reload refs
  useEffect(() => {
    let selectedTags = []
    for (const tag of Object.keys(tags)) {
      if (tags[tag]) selectedTags.push(tag)
    }

    let folderURLs = []
    for (let key of Object.keys(folderTree)) {
      let node = folderTree[key]
      if (node.active) {
        folderURLs.push(node.url)
      }
    }

    FetchRefs(SERVER, activeLib, selectedTags, folderURLs, query).then(res => {
      if (res) {
        setRefs(res.data)
        setSortKey({})
      }
    }).catch((e) => {
      console.error("Failed to fetch refs")
    })
  }, [activeLib, tags, folderTree, query])


  function handleNewRef(res) {
    if (!res) return
    let updatedRef = res.data
    updatedRef._hash = activeRef._hash

    let _refs = [...refs]
    _refs.forEach((r, i) => {
      if (r._hash === updatedRef._hash)
        _refs[i] = updatedRef
      })

    setRefs(_refs)
    setActiveRef(updatedRef)
  }

  function onEditActiveRef(key, value) {
    EditRefProperty(SERVER, activeLib, activeRef._hash, key, value).then(handleNewRef).catch(e => console.error("Failed to update key-value"))
  }
  
  function onEditNotes(notesText) {
    if (notesText) EditNotesFile(SERVER, activeLib, activeRef._hash, notesText);
    FetchRefProperties(SERVER, activeLib, activeRef._hash).then(handleNewRef).catch(e => console.error("Failed to fetch activeRef"))
  }

  function onUpdateYaml(yaml) {
    EditInfoFile(SERVER, activeLib, activeRef._hash, yaml).then(e => {
      FetchRefProperties(SERVER, activeLib, activeRef._hash).then(handleNewRef)
    }).catch(e => console.error("Failed to update yaml"))
  }


  return (
    <div style={{ hieght: "100%", overflow: "hidden" }}>
      <PapisNavbar />
      <div style={{ height: "calc( 100vh - 42px)" }}>
        <Split
          className='split'
          sizes={[15, 60, 25]}
          minSize={0}
          style={{ height: "100%" }}
        >
          <Filter
            libs={libs}
            activeLib={activeLib}
            setActiveLib={setActiveLib}
            tags={tags}
            setTags={setTags}
            folderTree={folderTree}
            setFolderTree={setFolderTree}
            setQuery={setQuery}
          />
          <References
            refs={refs}
            setRefs={setRefs}
            activeRef={activeRef}
            setActiveRef={setActiveRef}
            tags={tags}
            setTags={setTags}
            sortKey={sortKey}
            setSortKey={setSortKey}
          />
          <Preview
            activeLib={activeLib}
            activeRef={activeRef}
            onEditActiveRef={onEditActiveRef}
            onUpdateYaml={onUpdateYaml}
            onEditNotes={onEditNotes}
            tags={tags}
            setTags={setTags}
          />
        </Split>
      </div>
    </div>
  );
}

export default App;
