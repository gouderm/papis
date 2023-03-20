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



export function GetInfoUrl(server, library, hash) {
    return server + "/api/libraries/" + library + "/docs/" + hash + "/files/info.yaml"
}

export async function FetchInfoFile(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: GetInfoUrl(server, library, hash)
    })
    return res
}

export async function EditInfoFile(server, library, hash, body) {
    if (!library) return;
    let res = await axios({
        url: GetInfoUrl(server, library, hash),
        method: "POST",
        data: body,
    })
    return res
}


export function GetNotesUrl(server, library, hash) {
    return server + "/api/libraries/" + library + "/docs/" + hash + "/notes"
}

export async function FetchNotesFile(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: GetNotesUrl(server, library, hash),
    })
    return res
}

export async function DeleteNotesFile(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: GetNotesUrl(server, library, hash),
        method: "DELETE",
    })
    return res
}

export async function CreateNotesFile(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: GetNotesUrl(server, library, hash),
        method: "PUT",
    })
    return res
}

export async function EditNotesFile(server, library, hash, body) {
    if (!library) return;
    let res = await axios({
        url: GetNotesUrl(server, library, hash),
        method: "POST",
        data: body,
    })
    return res
}



export function GetFileUrl(server, library, hash, filePath) {
    return server + "/api/libraries/" + library + "/docs/" + hash + "/files/" + filePath
}


export async function FetchRefProperties(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: server + "/api/libraries/" + library + "/docs/" + hash,
    })
    return res
}


export async function EditRefProperty(server, library, hash, key, value) {
    if (!library) return;
    let res = await axios({
        url: server + "/api/libraries/" + library + "/docs/" + hash,
        method: "POST",
        data: {
            "newkey-name": key,
            "newkey-val": value,
        }
    })
    return res
}


export async function FetchRefBibtex(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: server + "/api/libraries/" + library + "/docs/" + hash + "/bibtex",
    })
    return res
}


export function GetZipUrl(server, library, hash) {
    return server + "/api/libraries/" + library + "/docs/" + hash + "/zip"
}


export async function DownloadZip(server, library, hash) {
    if (!library) return;
    let res = await axios({
        url: GetZipUrl(server, library, hash)
    })
    return res
}
