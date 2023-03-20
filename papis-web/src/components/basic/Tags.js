import { Badge } from "react-bootstrap"
import { TAGS_SPLIT_RX } from "../../constants";

export function Tags({ refTagsStr, tags, setTags }) {
  let refTags = refTagsStr ? refTagsStr.split(TAGS_SPLIT_RX) : []
  if (!refTags) refTags = []

  const selectedTags = []
  for (let t of Object.keys(tags)) if (tags[t]) selectedTags.push(t)

  function toggleTag(t) {
    let _tags = { ...tags }
    _tags[t] = !_tags[t]
    setTags(_tags)
  }

  return <span>{refTags.map(tag => {
    let active = selectedTags.includes(tag) ? "primary" : "secondary"
    return <Badge bg={active} onClick={() => toggleTag(tag)}><a>{tag}</a></Badge>
  })}</span>
}

