import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';

import Split from 'react-split'

import PapisNavbar from './components/navbar'
import Filter from './components/Filter';
import References from './components/References';
import Preview from './components/Preview';

import { FetchLibraries, FetchTags, FetchRefs, FetchFolders, FetchSetting } from "./api/fetch"
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
      setLibs(res.data)
    }).catch((e) => {
      console.error("Failed to fetch libraries")
    })

    FetchSetting(SERVER, "default-library").then(res => {
      setActiveLib(res.data)
    }).catch(e => {
      console.error("Failed to fetch default-library")
    })
  }, [])

  // on change lib, fetch new tags and folders
  useEffect(() => {

    FetchTags(SERVER, activeLib).then(res => {
      let _tagList = res.data
      let _tags = {}
      for (const tagName of _tagList) _tags[tagName] = false

      setTags(_tags)
    }).catch((e) => {
      console.error("Failed to fetch tags")
    })

    FetchFolders(SERVER, activeLib).then(res => {
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

    console.log(folderURLs)

    FetchRefs(SERVER, activeLib, selectedTags, folderURLs, query).then((res) => {
      setRefs(res.data)
      setSortKey({})
    }).catch((e) => {
      console.error("Failed to fetch refs")
    })
  }, [activeLib, tags, folderTree, query])

  return (
    <div style={{ hieght: "100%", overflow:"hidden" }}>
      <PapisNavbar />
      <div style={{ height: "calc( 100vh - 42px)" }}>
        <Split
          className='split'
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
          <Preview activeLib={activeLib} activeRef={activeRef} />
        </Split>
      </div>
    </div>
  );
}

export default App;
