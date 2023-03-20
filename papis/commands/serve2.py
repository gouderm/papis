import click
import re
import os
import json
import logging
from typing import Callable, List, Union, Any
import hashlib
from pathlib import Path
import sys
import tempfile
import shutil

from flask import (Flask, send_from_directory,
                   request, Response, send_file, abort, jsonify)
from flask_cors import CORS

import papis.api
import papis.cli
import papis.config
import papis.document
import papis.notes
import papis.commands.add
import papis.commands.update
import papis.commands.export
import papis.crossref
import papis.yaml
import papis.bibtex


logger = logging.getLogger("papis:server2")

TAGS_SPLIT_RX = re.compile(r"\s*[,\s]\s*")


def get_tag_list(tags: Union[str, List[str]]) -> List[str]:
    if isinstance(tags, list):
        return tags

    if tags is None:
        return []

    if tags == "":
        return []

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


def create_app(git: bool = False) -> Flask:

    web_dir = str(Path(sys.prefix) / Path("share/web"))
    app = Flask(__name__, static_folder=web_dir + "/static")
    CORS(app)

    @app.route("/", defaults={"path": "index.html"})
    @app.route("/<path:path>")
    def render_path(path: str) -> Any:
        logging.debug(f"flask: GET, {path}")
        return send_from_directory(web_dir, path)

    @app.route("/api/libraries")
    def api_libraries() -> Any:
        ret = json.dumps(papis.api.get_libraries())
        return Response(ret, mimetype='application/json')

    @app.route("/api/libraries/<string:lib>/tags")
    def api_tags(lib: str) -> Any:
        if lib not in papis.api.get_libraries():
            abort(404)

        docs = papis.api.get_all_documents_in_lib(lib)
        tags_of_tags = [get_tag_list(d.get("tags", "")) for d in docs]
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
                        lib) + folders[folder_index][len(lib):]

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

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>", methods=["GET", "POST"])
    def api_docs_id(lib: str, ref_id: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)

        if request.method == "POST":

            result = {}
            form = json.loads(request.data)
            new_key = form.get("newkey-name")
            new_val = form.get("newkey-val", "")

            if new_key is not None:
                result[new_key] = new_val

            papis.commands.update.run(document=doc,
                                      data=result,
                                      library_name=lib,
                                      git=git)

            doc.update(data=result)
            doc["_hash"] = doc_to_hash(doc)

        ret = json.dumps(doc)
        return Response(ret, mimetype="application/json")

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/files/<path:file>", methods=["GET"])
    def api_docs_id_file(lib: str, ref_id: str, file: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)

        return send_from_directory(doc.get_main_folder(), file)

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/files/info.yaml", methods=["GET", "POST"])
    def api_docs_id_info(lib: str, ref_id: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)

        info_path = doc.get_info_file()

        if request.method == "POST":
            new_info = request.get_data().decode("utf-8")
            logger.info("checking syntax of the yaml")
            with tempfile.NamedTemporaryFile(mode="w+", delete=False) as fdr:
                fdr.write(new_info)
            try:
                papis.yaml.yaml_to_data(fdr.name, raise_exception=True)
            except ValueError as e:
                os.unlink(fdr.name)
                abort(400, "Error in yaml")

            else:
                os.unlink(fdr.name)
                logger.info("info text seems ok")
                with open(info_path, "w+") as _fdr:
                    _fdr.write(new_info)
                doc.load()
                papis.api.save_doc(doc, lib)

        return send_file(info_path)

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/notes", methods=["GET", "PUT", "DELETE", "POST"])
    def api_docs_id_notes(lib: str, ref_id: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)

        if request.method == "PUT":
            papis.notes.notes_path_ensured(doc, lib)

        if not doc.has("notes"):
            abort(404)

        if request.method in ["GET", "PUT"]:
            return send_from_directory(doc.get_main_folder(), doc["notes"])

        if request.method == "DELETE":
            if doc["notes"] is not None:
                notes_file = Path(doc.get_main_folder()) / doc["notes"]
                if os.path.isfile(notes_file):
                    os.remove(notes_file)

            doc.pop("notes", None)
            papis.api.save_doc(doc, lib)

            return "200 OK"

        if request.method == "POST":
            with open(Path(doc.get_main_folder()) / doc["notes"], "w+") as f:
                f.write(request.get_data().decode("utf-8"))
            return "200 OK"

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/bibtex")
    def api_docs_id_bibtex(lib: str, ref_id: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)
        return jsonify(papis.bibtex.to_bibtex(doc))

    @app.route("/api/libraries/<string:lib>/docs/<string:ref_id>/zip")
    def api_docs_id_zip(lib: str, ref_id: str) -> Any:
        doc = doc_from_hash(lib, ref_id)
        if doc is None:
            abort(404)

        with tempfile.NamedTemporaryFile(suffix=".zip") as f:
            zip_file = Path(f.name)
            zip_file_without_suffix = zip_file.parent / zip_file.stem
            shutil.make_archive(zip_file_without_suffix, "zip", doc.get_main_folder())

            return send_file(zip_file, as_attachment=True, download_name=doc.get_main_folder_name() + ".zip")

    @app.route("/api/config/kv/<string:key>")
    def api_get_config_key_value(key: str):
        return jsonify(papis.config.get(key))

    @app.route("/api/config/section/<string:section>")
    def api_get_config_section(section: str):
        config = dict(papis.config.get_configuration().items())
        return jsonify(dict(config.get(section)))

    return app


@click.command('serve2')
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
    logger.info("starting server in address http://%s:%s",
                address or "localhost",
                port)
    logger.info("press Ctrl-C to exit")
    logger.info("THIS COMMAND IS EXPERIMENTAL, "
                "expect bugs, feedback appreciated")

    app = create_app(git=git)
    address = "0.0.0.0"
    app.run(debug=True, host=address, port=port)
