import axios from "axios"


export async function FetchLibraries(server) {
    let res = await axios({
        url: server + "/api/libraries",
        method: "GET",
    });
    return res;
}

export async function FetchTags(server, library) {
    if (!library) return;
    let res = await axios({
        url: server + "/api/libraries/" + library + "/tags",
        method: "GET",
    });
    return res;
}

export async function FetchRefs(server, library, tags, activeFolder, query) {
    if (!library) return;
    let res = await axios({
        url: server + "/api/libraries/" + library + "/docs",
        method: "GET",
        params: {
            tags: tags,
            activeFolders: (activeFolder.length > 0) && activeFolder,
            activeQuery: query && query,
        }
    })
    return res;
}

export async function FetchFolders(server, library) {
    if (!library) return;
    let res = await axios({
        url: server + "/api/libraries/" + library + "/folders",
        method: "GET",
    })
    return res
}


export async function FetchSetting(server, setting) {
    let res = await axios({
        url: server + "/api/config/kv/" + setting
    })
    return res
}


export function GetFileUrl(server, library, hash, fileIndex) {
    return server + "/api/libraries/" + library + "/docs/" + hash + "/file/" + fileIndex
}


