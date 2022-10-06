import click
import re
import os
import json
import logging
from typing import Callable, List, Union, Any
import hashlib
from pathlib import Path

from flask import (Flask, send_from_directory,
                   request, Response, send_file, abort)
from flask_cors import CORS

import papis.api
import papis.cli
import papis.config
import papis.document
import papis.commands.add
import papis.commands.update
import papis.commands.export
import papis.crossref


logger = logging.getLogger("papis:server2")

TAGS_SPLIT_RX = re.compile(r"\s*[,\s]\s*")


def get_tag_list(tags: Union[str, List[str]]) -> List[str]:
    if isinstance(tags, list):
        return tags
    else:
        return TAGS_SPLIT_RX.split(tags)


def doc_to_hash(doc: papis.document.Document) -> str:
    return hashlib.md5(doc.get_main_folder().encode()).hexdigest()


def doc_from_hash(lib: str, hash: str) -> papis.document.Document:
    if lib not in papis.api.get_libraries():
        return None

    all_docs = papis.api.get_all_documents_in_lib(lib)
    for _d in all_docs:
        if hash == doc_to_hash(_d):
            return _d

    return None


def filter_tags(tags: List[str]) -> Callable[[papis.document.Document], bool]:

    def _filter_fn(doc: papis.document.Document) -> bool:
        if not doc.has("tags"):
            return False

        doc_tags = get_tag_list(doc["tags"])
        for t in doc_tags:
            if t in tags:
                return True

        return False

    return _filter_fn


def filter_folders(
        lib_folders: List[str]) -> Callable[[papis.document.Document], bool]:

    def _filter_fn(doc: papis.document.Document) -> bool:

        for _lib_folder in lib_folders:

            if Path(doc.get_main_folder()).is_relative_to(_lib_folder):
                return True

        return False

    return _filter_fn


def create_app() -> Flask:

    web_dir = os.path.dirname(os.path.abspath(__file__)) + "/web/build"
    web_dir = "/home/gouderm/papis_dev/papis_fork/papis/commands/web/build"

    app = Flask(__name__, static_folder=web_dir+"/static")
    CORS(app)

    @app.route("/", defaults={"path": "index.html"})
    @app.route("/<path:path>")
    def render_path(path: str) -> Any:
        print("render path!!" + path)
        logging.debug(f"flask: GET, {path}")
        return send_from_directory(web_dir, path)

    @app.route("/api/libraries")
    def api_libraries() -> Any:
        ret = json.dumps(papis.api.get_libraries())
        return Response(ret,  mimetype='application/json')

    @app.route("/api/libraries/<string:lib>/tags")
    def api_tags(lib: str) -> Any:
        if lib not in papis.api.get_libraries():
            abort(404)

        docs = papis.api.get_all_documents_in_lib(lib)
        tags_of_tags = [get_tag_list(d["tags"]) for d in docs]
        tags = sorted(set(tag
                          for _tags in tags_of_tags
                          for tag in _tags))
        ret = json.dumps(tags)
        return Response(ret, mimetype="application/json")

    @app.route("/api/libraries/<string:lib>/folders")
    def api_folders(lib: str) -> Any:
        if lib not in papis.api.get_libraries():
            abort(404)

        lib_dirs = papis.config.get_lib_from_name(lib).paths

        documents = papis.api.get_all_documents_in_lib(lib)

        # find all folders containing documents
        folders = [os.path.dirname(str(d.get_main_folder()))
                   for d in documents]
        # folders.append(*papis.config.get_lib_dirs())

        # remove duplicates and sort paths
        folders = [*set(folders)]

        for folder_index, f in enumerate(folders):

            for lib in lib_dirs:
                if f.startswith(lib):
                    folders[folder_index] = os.path.basename(
                        lib)+folders[folder_index][len(lib):]

        folders = sorted(folders)
        ret = json.dumps(folders)
        return Response(ret, mimetype="application/json")

    @app.route("/api/libraries/<string:lib>/docs")
    def api_docs(lib: str) -> Any:
        if lib not in papis.api.get_libraries():
            abort(404)

        args = request.args
        tags = args.getlist("tags[]")
        activeFolders = args.getlist("activeFolders[]")
        activeQuery = args.get("activeQuery", "")

        if activeQuery == "":
            docs = papis.api.get_all_documents_in_lib(lib)
        else:
            docs = papis.api.get_documents_in_lib(lib, activeQuery)

        if len(tags) > 0:
            docs = list(filter(filter_tags(tags), docs))

        if len(activeFolders) > 0:
            lib_folders = papis.config.get_lib_from_name(lib).paths

            active_folders_absolute_paths = []

            for _lib_folder in lib_folders:
                _lib_folder = Path(_lib_folder)

                for _active_folder in activeFolders:
                    _active_folder = Path(_active_folder)

                    print(_active_folder)
                    root = _active_folder
                    if len(_active_folder.parents) > 1:
                        root = _active_folder.parents[-2]
                    if _lib_folder.stem == root.stem:
                        active_folders_absolute_paths.append(
                            str(_lib_folder.parent) + str(_active_folder))

            docs = list(filter(filter_folders(
                active_folders_absolute_paths), docs))

        for _d in docs:
            _d["_hash"] = doc_to_hash(_d)
        ret = json.dumps(docs)
        return Response(ret, mimetype="application/json")

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>")
    def api_docs_id(lib: str, ref_id: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)
        ret = json.dumps(doc)
        return Response(ret, mimetype="application/json")

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/notes")
    def api_docs_id_notes(lib: str, ref_id: str) -> Any:
        selected_ref = doc_from_hash(lib, ref_id)
        if selected_ref is None:
            abort(404)

        selected_ref_notes = ""
        if selected_ref.has("notes"):
            notes_file = selected_ref.get_main_folder() + "/" + \
                selected_ref["notes"]
            with open(notes_file, "r") as notes:
                selected_ref_notes = notes.read()

        return Response(json.dumps(selected_ref_notes))

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/file/" +
               "<int:file_id>")
    def api_docs_id_file(lib: str, ref_id: str, file_id: int) -> Any:
        selected_ref = doc_from_hash(lib, ref_id)
        if selected_ref is None:
            abort(404)

        files = selected_ref.get_files()
        if file_id > len(files):
            abort(404)
        return send_file(files[file_id])

    return app


@click.command('serve')
@click.help_option('-h', '--help')
@click.option("-p", "--port",
              help="Port to listen to",
              default=8080, type=int)
@papis.cli.git_option(help="Add changes made to the info file")
@click.option("--address",
              "--host",
              help="Address to bind",
              default="localhost")
def cli(address: str, port: int, git: bool) -> None:
    """
    Start a papis server
    """
    global USE_GIT
    USE_GIT = git
    logger.info("starting server in address http://%s:%s",
                address or "localhost",
                port)
    logger.info("press Ctrl-C to exit")
    logger.info("THIS COMMAND IS EXPERIMENTAL, "
                "expect bugs, feedback appreciated")

    app = create_app()
    address = "0.0.0.0"
    app.run(debug=True, host=address, port=port)
