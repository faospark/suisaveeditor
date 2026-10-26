#!/usr/bin/env python3
"""
Suikoden Save Editor - Symbol Indexer
Builds tools/symbol_indexer/symbols.db (SQLite) from:
  * src/**/*.js            -> JS symbols (functions, classes, consts, methods), imports, identifier refs
  * src/gamedata.js        -> GameData tables (CHARACTERS, ITEMS, RUNES, ...)  [evaluated via Node]
  * src/config/schema.js   -> FIELD_CONFIG / GROUP_PATHS / TABLE_COLUMNS        [evaluated via Node]
  * debug/save.json        -> every save-file field path with type / length / sample

Usage:  python tools/symbol_indexer/indexer.py      (~1s)
"""
import json
import os
import re
import sqlite3
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SRC = ROOT / "src"
DB = HERE / "symbols.db"
SAVE_SAMPLE = ROOT / "debug" / "save.json"

SKIP_SUFFIXES = (".min.js", ".backup")
JS_KEYWORDS = {
    "if", "for", "while", "switch", "catch", "function", "return", "else", "do",
    "try", "with", "new", "typeof", "await", "yield", "delete", "void", "super",
    "constructor_",
}

RE_IMPORT = re.compile(r"""^\s*import\s+(.+?)\s+from\s+['"]([^'"]+)['"]""")
RE_IMPORT_BARE = re.compile(r"""^\s*import\s+['"]([^'"]+)['"]""")
RE_REEXPORT = re.compile(r"""^\s*export\s+(\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]""")
RE_FUNC = re.compile(r"^(\s*)(export\s+)?(default\s+)?(async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)?")
RE_CLASS = re.compile(r"^(\s*)(export\s+)?(default\s+)?class\s+([A-Za-z_$][\w$]*)(\s+extends\s+([\w$.]+))?")
RE_VAR_FUNC = re.compile(
    r"^(\s*)(export\s+)?(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(async\s+)?"
    r"(function\b[^(]*\(([^)]*)\)?|\(([^)]*)\)?\s*=>|([A-Za-z_$][\w$]*)\s*=>)"
)
RE_VAR = re.compile(r"^(\s*)(export\s+)?(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=")
RE_METHOD = re.compile(r"^(\s+)(static\s+)?(async\s+)?(get\s+|set\s+)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{")
RE_PROP_FUNC = re.compile(r"^(\s+)([A-Za-z_$][\w$]*)\s*:\s*(async\s+)?(function\b\s*\(([^)]*)\)|\(([^)]*)\)\s*=>|[A-Za-z_$][\w$]*\s*=>)")
RE_IDENT = re.compile(r"[A-Za-z_$][\w$]*")

NODE_DUMP = r"""
const [gd, sc] = process.argv.slice(1);
const out = {};
try { const m = await import(gd); out.gamedata = m.default ?? m.GameData; } catch (e) { out.gamedata_error = String(e); }
try {
  const m = await import(sc);
  for (const k of ["FIELD_CONFIG", "GROUP_PATHS", "EDITOR_GROUPS", "TABLE_COLUMNS"]) out[k] = m[k];
} catch (e) { out.schema_error = String(e); }
process.stdout.write(JSON.stringify(out));
"""


def rel(p: Path) -> str:
    return p.relative_to(ROOT).as_posix()


def js_files():
    for p in sorted(SRC.rglob("*.js")):
        if p.name.endswith(SKIP_SUFFIXES):
            continue
        yield p
    for extra in ("sw.js",):
        p = ROOT / extra
        if p.exists():
            yield p


def create_schema(cur):
    cur.executescript(
        """
        DROP TABLE IF EXISTS meta; DROP TABLE IF EXISTS files; DROP TABLE IF EXISTS symbols;
        DROP TABLE IF EXISTS imports; DROP TABLE IF EXISTS refs; DROP TABLE IF EXISTS gamedata;
        DROP TABLE IF EXISTS fields; DROP TABLE IF EXISTS save_paths;
        CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE files (path TEXT PRIMARY KEY, lines INTEGER, bytes INTEGER, mtime REAL);
        CREATE TABLE symbols (
            id INTEGER PRIMARY KEY, name TEXT, kind TEXT, file TEXT, line INTEGER, end_line INTEGER,
            exported INTEGER, parent TEXT, signature TEXT);
        CREATE TABLE imports (file TEXT, line INTEGER, name TEXT, alias TEXT, source TEXT, resolved TEXT);
        CREATE TABLE refs (name TEXT, file TEXT, line INTEGER, text TEXT);
        CREATE TABLE gamedata (category TEXT, id TEXT, id_int INTEGER, name TEXT, data TEXT);
        CREATE TABLE fields (key TEXT, label TEXT, grp TEXT, renderer TEXT, path TEXT, readonly INTEGER, data TEXT);
        CREATE TABLE save_paths (path TEXT, leaf TEXT, type TEXT, length INTEGER, sample TEXT);
        """
    )


def create_indexes(cur):
    cur.executescript(
        """
        CREATE INDEX idx_sym_name ON symbols(name COLLATE NOCASE);
        CREATE INDEX idx_sym_file ON symbols(file);
        CREATE INDEX idx_imp_name ON imports(name COLLATE NOCASE);
        CREATE INDEX idx_imp_file ON imports(file);
        CREATE INDEX idx_refs_name ON refs(name COLLATE NOCASE);
        CREATE INDEX idx_gd_name ON gamedata(name COLLATE NOCASE);
        CREATE INDEX idx_gd_id ON gamedata(id_int);
        CREATE INDEX idx_gd_cat ON gamedata(category COLLATE NOCASE);
        CREATE INDEX idx_fields_key ON fields(key COLLATE NOCASE);
        CREATE INDEX idx_fields_label ON fields(label COLLATE NOCASE);
        CREATE INDEX idx_save_path ON save_paths(path COLLATE NOCASE);
        CREATE INDEX idx_save_leaf ON save_paths(leaf COLLATE NOCASE);
        """
    )


def resolve_import(file: Path, source: str):
    if not source.startswith("."):
        return None
    target = (file.parent / source).resolve()
    for cand in (target, target.with_suffix(".js"), target / "index.js"):
        if cand.is_file():
            try:
                return rel(cand)
            except ValueError:
                return None
    return None


def strip_comment(line: str) -> str:
    i = line.find("//")
    return line if i < 0 else line[:i]


def find_block_end(lines, start_idx):
    """Return 1-based end line of the brace block opened at/after start_idx (best effort)."""
    depth, opened = 0, False
    for i in range(start_idx, min(len(lines), start_idx + 4000)):
        s = re.sub(r"(['\"`])(?:\\.|(?!\1).)*\1", "", strip_comment(lines[i]))
        for ch in s:
            if ch == "{":
                depth += 1
                opened = True
            elif ch == "}":
                depth -= 1
                if opened and depth <= 0:
                    return i + 1
        if not opened and i > start_idx + 2:
            return start_idx + 1
    return start_idx + 1


def index_js(cur, path: Path):
    text = path.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines()
    rp = rel(path)
    cur.execute("INSERT INTO files VALUES (?,?,?,?)", (rp, len(lines), path.stat().st_size, path.stat().st_mtime))

    symbols = []
    class_stack = []  # (name, end_line)
    in_block_comment = False

    for idx, raw in enumerate(lines):
        ln = idx + 1
        line = raw
        if in_block_comment:
            if "*/" in line:
                in_block_comment = False
            continue
        if line.lstrip().startswith("/*") and "*/" not in line:
            in_block_comment = True
            continue
        while class_stack and ln > class_stack[-1][1]:
            class_stack.pop()
        parent = class_stack[-1][0] if class_stack else None

        m = RE_IMPORT.match(line)
        if m:
            spec, source = m.group(1), m.group(2)
            resolved = resolve_import(path, source)
            names = []
            braces = re.search(r"\{([^}]*)\}", spec)
            if braces:
                for part in braces.group(1).split(","):
                    part = part.strip()
                    if not part:
                        continue
                    bits = re.split(r"\s+as\s+", part)
                    names.append((bits[0].strip(), bits[-1].strip()))
            default = re.match(r"^([A-Za-z_$][\w$]*)", spec)
            if default:
                names.append(("default", default.group(1)))
            star = re.search(r"\*\s+as\s+([A-Za-z_$][\w$]*)", spec)
            if star:
                names.append(("*", star.group(1)))
            for n, a in names:
                cur.execute("INSERT INTO imports VALUES (?,?,?,?,?,?)", (rp, ln, n, a, source, resolved))
            continue
        m = RE_IMPORT_BARE.match(line)
        if m:
            cur.execute("INSERT INTO imports VALUES (?,?,?,?,?,?)", (rp, ln, "*", None, m.group(1), resolve_import(path, m.group(1))))
            continue
        m = RE_REEXPORT.match(line)
        if m:
            source = m.group(2)
            resolved = resolve_import(path, source)
            spec = m.group(1)
            parts = ["*"] if spec == "*" else [p.strip() for p in spec.strip("{}").split(",") if p.strip()]
            for part in parts:
                bits = re.split(r"\s+as\s+", part)
                cur.execute("INSERT INTO imports VALUES (?,?,?,?,?,?)", (rp, ln, bits[0], bits[-1], source, resolved))
                symbols.append((bits[-1], "reexport", rp, ln, ln, 1, None, f"export {{ {part} }} from '{source}'"))
            continue

        m = RE_CLASS.match(line)
        if m:
            end = find_block_end(lines, idx)
            sig = f"class {m.group(4)}" + (f" extends {m.group(6)}" if m.group(6) else "")
            symbols.append((m.group(4), "class", rp, ln, end, int(bool(m.group(2))), parent, sig))
            class_stack.append((m.group(4), end))
            continue
        m = RE_FUNC.match(line)
        if m:
            end = find_block_end(lines, idx)
            sig = f"{'async ' if m.group(4) else ''}function {m.group(5)}({(m.group(6) or '').strip()})"
            symbols.append((m.group(5), "function", rp, ln, end, int(bool(m.group(2))), parent, sig))
            continue
        m = RE_VAR_FUNC.match(line)
        if m:
            end = find_block_end(lines, idx)
            params = m.group(7) if m.group(7) is not None else (m.group(8) if m.group(8) is not None else (m.group(9) or ""))
            sig = f"{m.group(3)} {m.group(4)} = {'async ' if m.group(5) else ''}({params.strip()}) =>"
            kind = "function" if not m.group(1) else "local_function"
            symbols.append((m.group(4), kind, rp, ln, end, int(bool(m.group(2))), parent, sig))
            continue
        m = RE_VAR.match(line)
        if m and (len(m.group(1)) == 0 or m.group(2)):
            end = find_block_end(lines, idx) if re.search(r"=\s*[\{\[(]?\s*$|=\s*\{|=\s*\[|Object\.", line) else ln
            sig = line.strip()[:160]
            symbols.append((m.group(4), "const" if m.group(3) == "const" else "var", rp, ln, end, int(bool(m.group(2))), parent, sig))
            continue
        m = RE_METHOD.match(line)
        if m and m.group(5) not in JS_KEYWORDS:
            end = find_block_end(lines, idx)
            sig = f"{m.group(5)}({m.group(6).strip()})"
            symbols.append((m.group(5), "method", rp, ln, end, 0, parent, sig))
            continue
        m = RE_PROP_FUNC.match(line)
        if m and m.group(2) not in JS_KEYWORDS:
            end = find_block_end(lines, idx)
            params = m.group(5) if m.group(5) is not None else (m.group(6) or "")
            symbols.append((m.group(2), "method", rp, ln, end, 0, parent, f"{m.group(2)}: ({params.strip()}) =>"))
            continue

    # `export { a, b as c };` lists and `export default Name;`
    for idx, line in enumerate(lines):
        m = re.match(r"^\s*export\s*\{([^}]*)\}\s*;?\s*$", line)
        if m:
            for part in m.group(1).split(","):
                part = part.strip()
                if part:
                    local = re.split(r"\s+as\s+", part)[0].strip()
                    cur.execute("UPDATE symbols SET exported=1 WHERE file=? AND name=?", (rp, local))
                    symbols = [s if not (s[0] == local and s[2] == rp) else s[:5] + (1,) + s[6:] for s in symbols]
        m = re.match(r"^\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$", line)
        if m:
            symbols = [s if not (s[0] == m.group(1) and s[2] == rp) else s[:5] + (1,) + s[6:] for s in symbols]

    cur.executemany(
        "INSERT INTO symbols (name, kind, file, line, end_line, exported, parent, signature) VALUES (?,?,?,?,?,?,?,?)",
        symbols,
    )
    return lines


def walk_save(node, path, out, depth=0):
    if depth > 12:
        return
    leaf = path.rsplit(".", 1)[-1].replace("[]", "") if path else ""
    if isinstance(node, dict):
        if path:
            out.append((path, leaf, "object", len(node), json.dumps(list(node.keys())[:12])))
        for k, v in node.items():
            walk_save(v, f"{path}.{k}" if path else k, out, depth + 1)
    elif isinstance(node, list):
        elem_types = {type(x).__name__ for x in node}
        if node and all(isinstance(x, dict) for x in node):
            out.append((path, leaf, "array<object>", len(node), json.dumps(list(node[0].keys())[:12])))
            merged = {}
            for x in node:
                for k, v in x.items():
                    merged.setdefault(k, v)
            walk_save(merged, f"{path}[]", out, depth + 1)
        elif node and all(isinstance(x, list) for x in node):
            out.append((path, leaf, "array<array>", len(node), json.dumps(node[0])[:160]))
            walk_save(node[0], f"{path}[]", out, depth + 1)
        else:
            t = "array<" + ("|".join(sorted(elem_types)) or "empty") + ">"
            out.append((path, leaf, t, len(node), json.dumps(node[:16], ensure_ascii=False)[:200]))
    else:
        out.append((path, leaf, type(node).__name__, None, json.dumps(node, ensure_ascii=False)[:200]))


def node_dump():
    gd = (SRC / "gamedata.js").as_uri()
    sc = (SRC / "config" / "schema.js").as_uri()
    try:
        res = subprocess.run(
            ["node", "--input-type=module", "-e", NODE_DUMP, gd, sc],
            capture_output=True, text=True, encoding="utf-8", timeout=30, cwd=ROOT,
        )
    except FileNotFoundError:
        print("  ! node not found - GameData / FIELD_CONFIG not indexed")
        return {}
    if res.returncode != 0:
        print("  ! node failed:", res.stderr.strip()[:400])
        return {}
    data = json.loads(res.stdout or "{}")
    for k in ("gamedata_error", "schema_error"):
        if k in data:
            print(f"  ! {k}: {data[k][:300]}")
    return data


def main():
    t0 = time.perf_counter()
    if DB.exists():
        DB.unlink()
    con = sqlite3.connect(DB)
    cur = con.cursor()
    create_schema(cur)

    # --- JS code ---
    file_lines = {}
    for p in js_files():
        file_lines[rel(p)] = index_js(cur, p)

    # --- GameData + schema (Node) ---
    data = node_dump()
    gd = data.get("gamedata") or {}
    gd_rows = []
    for cat, table in gd.items():
        if isinstance(table, dict):
            for k, v in table.items():
                name = v.get("name") if isinstance(v, dict) else (v if isinstance(v, str) else None)
                id_int = int(k) if str(k).lstrip("-").isdigit() else None
                gd_rows.append((cat, str(k), id_int, name, json.dumps(v, ensure_ascii=False)))
        elif isinstance(table, list):
            for i, v in enumerate(table):
                id_int = v if isinstance(v, int) else i
                name = None
                if isinstance(v, int) and isinstance(gd.get("CHARACTERS"), dict):
                    c = gd["CHARACTERS"].get(str(v))
                    name = c.get("name") if isinstance(c, dict) else None
                gd_rows.append((cat, str(id_int), id_int, name, json.dumps(v, ensure_ascii=False)))
    cur.executemany("INSERT INTO gamedata VALUES (?,?,?,?,?)", gd_rows)

    fc = data.get("FIELD_CONFIG") or {}
    group_paths = data.get("GROUP_PATHS") or {}
    f_rows = []
    for key, cfg in fc.items():
        cfg = cfg or {}
        path = cfg.get("path") or (group_paths.get(cfg.get("group")) if isinstance(group_paths.get(cfg.get("group")), str) else None)
        f_rows.append((key, cfg.get("label"), cfg.get("group"), cfg.get("renderer"), path,
                       int(bool(cfg.get("readonly"))), json.dumps(cfg, ensure_ascii=False)))
    cur.executemany("INSERT INTO fields VALUES (?,?,?,?,?,?,?)", f_rows)

    # --- Save sample ---
    s_rows = []
    if SAVE_SAMPLE.exists():
        save = json.loads(SAVE_SAMPLE.read_text(encoding="utf-8-sig"))
        walk_save(save, "", s_rows)
    cur.executemany("INSERT INTO save_paths VALUES (?,?,?,?,?)", s_rows)

    # --- Identifier refs (only names worth tracking) ---
    tracked = {r[0] for r in cur.execute("SELECT DISTINCT name FROM symbols")}
    tracked |= {r[0] for r in cur.execute("SELECT key FROM fields")}
    tracked |= {r[0] for r in cur.execute("SELECT DISTINCT leaf FROM save_paths WHERE leaf <> ''")}
    tracked |= {r[0] for r in cur.execute("SELECT DISTINCT category FROM gamedata")}
    tracked = {t for t in tracked if len(t) > 2 and t not in JS_KEYWORDS}
    ref_rows = []
    for fp, lines in file_lines.items():
        for i, line in enumerate(lines, 1):
            seen = set()
            for tok in RE_IDENT.findall(line):
                if tok in tracked and tok not in seen:
                    seen.add(tok)
                    ref_rows.append((tok, fp, i, line.strip()[:200]))
    cur.executemany("INSERT INTO refs VALUES (?,?,?,?)", ref_rows)

    create_indexes(cur)
    cur.execute("INSERT INTO meta VALUES ('built_at', ?)", (str(time.time()),))
    con.commit()

    counts = {t: cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
              for t in ("files", "symbols", "imports", "refs", "gamedata", "fields", "save_paths")}
    con.close()
    print(f"symbols.db built in {time.perf_counter() - t0:.2f}s -> " + ", ".join(f"{k}={v}" for k, v in counts.items()))


if __name__ == "__main__":
    sys.exit(main())
