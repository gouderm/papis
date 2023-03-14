import React from "react";
import { BsFolder, BsFolderPlus, BsFolderMinus } from "react-icons/bs";


function createObj(key, title, url) {
  return {
    key: key,
    title: title,
    collapsed: true,
    root: false,
    url: url,
    active: false,
    children: [],
  }
}

export function FolderList2treeObj(folderList) {
  // Returns flat object containing all entries of folderList

  let ret = {}

  for (let el of folderList) {
    //el = "phd/imaging/algorithms/multiPIE",
    let el_split = el.split("/")
    // el_split = ["phd", "imaging", "algorithms", "multiPIE"]

    //create subfolders
    for (let i = 0; i < el_split.length; i++) {
      let key = el_split.slice(0, i + 1).join("/")
      ret[key] = createObj(key, el_split[i])
    }
  }

  for (const key of Object.keys(ret)) {
    ret[key].url = "/" + key
    //key = "phd/imaging/algorithms/multiPIE",
    let parentKey = key.split("/").slice(0, -1).join("/")
    //key = "phd/imaging/algorithms",
    if (!parentKey) {
      ret[key].root = true
      continue
    }
    ret[parentKey].children.push(key)
  }

  return ret
}

function TreeNode({ nodeKey, folderTree, setFolderTree }) {
  const nodeData = folderTree[nodeKey] || {}
  const children = nodeData.children || []
  const collapsed = nodeData.collapsed || false

  const title = nodeData.active ? <strong>{nodeData.title}</strong> : nodeData.title 

  const onCollapseToggle = () => {
    nodeData.collapsed = !collapsed;
    if (!nodeKey) return;
    let newFolderTree = { ...folderTree }
    newFolderTree[nodeKey] = nodeData
    setFolderTree(newFolderTree)
  }
  
  const onToggleActive = () => {
    nodeData.active = !nodeData.active
    if (!nodeKey) return;
    let newFolderTree = { ...folderTree }
    newFolderTree[nodeKey] = nodeData
    setFolderTree(newFolderTree)
  }

  return <ul>
    {(children.length === 0) ? <BsFolder /> :
      (collapsed ? <BsFolderPlus onClick={onCollapseToggle} /> : <BsFolderMinus onClick={onCollapseToggle} />)}

    <span
      onClick={onToggleActive}
    >    <a>{title}</a></span>

    {!collapsed && children.map(nodeKey => (
      <TreeNode
        nodeKey={nodeKey}
        folderTree={folderTree}
        setFolderTree={setFolderTree}
      />
    ))}
  </ul>
}

function TreeList({ folderTree, setFolderTree }) {

  return <ul>
    {Object.keys(folderTree).map(keyName => {
      return folderTree[keyName].root &&
        <TreeNode
          nodeKey={keyName}
          folderTree={folderTree}
          setFolderTree={setFolderTree}
        />
    })}
  </ul>
}

export default TreeList;