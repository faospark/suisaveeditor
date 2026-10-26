#!/usr/bin/env python3
"""
sym - high-speed lookup for the Suikoden Save Editor (backed by symbols.db).

  sym <query>                 search everything (code symbols, schema fields, save paths, GameData)
  sym <number>                GameData entries with that id in every category (character 42, item 42, ...)
  sym <CATEGORY>.<id|name>    GameData in one category       e.g. sym RUNES.Fire   sym CHARACTERS.18
  sym <CATEGORY>              list a GameData category       e.g. sym SHIELD
  sym --refs <name>           every line that uses an identifier / field key (where-used)
  sym --file <path-part>      outline of a file (symbols with line ranges)
  sym --imports <name>        who imports <name> (or what a file imports, if <name> is a file)
  sym --stats                 database summary
  sym --rebuild               force re-index

Scopes:  --code  --fields  --save  --data      Output:  --json   --limit N   --all
The DB rebuilds automatically (~0.3s) whenever a source file is newer than it.
"""
import json
import os
import sqlite3
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
DB = HERE / "symbols.db"
INDEXER = HERE / "indexer.py"
WATCH = [ROOT / "src", ROOT / "debug" / "save.json", ROOT / "sw.js", INDEXER]


def newest_source_mtime():
    newest = 0.0
    for w in WATCH:
        if w.is_file():
            newest = max(newest, w.stat().st_mtime)
        elif w.is_dir():
            for p in w.rglob("*.js"):
                newest = max(newest, p.stat().st_mtime)
    return newest


def ensure_db(force=False):
    if force or not DB.exists() or DB.stat().st_mtime < newest_source_mtime():
        res = subprocess.run([sys.executable, str(INDEXER)], capture_output=True, text=True)
        if res.returncode != 0:
            sys.stderr.write(res.stdout + res.stderr)
            sys.exit(1)
        sys.stderr.write("[sym] index rebuilt: " + res.stdout.strip().split("-> ")[-1] + "\n")
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con


def ranked(con, sql_exact, sql_prefix, sql_contains, q, limit):
    rows, seen = [], set()
    for sql, arg in ((sql_exact, q), (sql_prefix, q + "%"), (sql_contains, "%" + q + "%")):
        for r in con.execute(sql, (arg,) * sql.count("?")):
            key = tuple(r)
            if key not in seen:
                seen.add(key)
                rows.append(dict(r))
            if len(rows) >= limit:
                return rows
    return rows


def search_code(con, q, limit):
    base = "SELECT name, kind, file, line, end_line, exported, parent, signature FROM symbols WHERE "
    order = " ORDER BY (kind IN ('local_function','reexport')), file, line"
    return ranked(con, base + "name = ? COLLATE NOCASE" + order,
                  base + "name LIKE ?" + order, base + "name LIKE ?" + order, q, limit)


def search_fields(con, q, limit):
    base = "SELECT key, label, grp, renderer, path, readonly, data FROM fields WHERE "
    return ranked(con, base + "key = ? COLLATE NOCASE OR label = ? COLLATE NOCASE",
                  base + "key LIKE ? OR label LIKE ?", base + "key LIKE ? OR label LIKE ?", q, limit)


def search_save(con, q, limit):
    base = "SELECT path, type, length, sample FROM save_paths WHERE "
    return ranked(con, base + "leaf = ? COLLATE NOCASE OR path = ? COLLATE NOCASE",
                  base + "leaf LIKE ?", base + "path LIKE ?", q, limit)


def search_data(con, q, limit):
    base = "SELECT category, id, name, data FROM gamedata WHERE "
    return ranked(con, base + "name = ? COLLATE NOCASE", base + "name LIKE ?", base + "name LIKE ?", q, limit)


def refs(con, name, limit):
    return [dict(r) for r in con.execute(
        "SELECT file, line, text FROM refs WHERE name = ? COLLATE NOCASE ORDER BY file, line LIMIT ?", (name, limit))]


def ref_count(con, name):
    return con.execute("SELECT COUNT(*), COUNT(DISTINCT file) FROM refs WHERE name = ? COLLATE NOCASE", (name,)).fetchone()


def categories(con):
    return [r[0] for r in con.execute("SELECT DISTINCT category FROM gamedata")]


# ---------------------------------------------------------------- printing
def p_code(rows):
    print(f"== Code symbols ({len(rows)})")
    for r in rows:
        exp = "export " if r["exported"] else ""
        par = f"{r['parent']}." if r["parent"] else ""
        rng = f"{r['line']}-{r['end_line']}" if r["end_line"] and r["end_line"] != r["line"] else f"{r['line']}"
        print(f"  {exp}{r['kind']:<14} {par}{r['name']:<32} {r['file']}:{rng}")
        if r["signature"]:
            print(f"      {r['signature']}")


def p_fields(rows):
    print(f"== Schema fields - FIELD_CONFIG ({len(rows)})")
    for r in rows:
        extra = []
        if r["renderer"]:
            extra.append(f"renderer={r['renderer']}")
        if r["path"]:
            extra.append(f"path={r['path']}")
        if r["readonly"]:
            extra.append("readonly")
        print(f"  {r['key']:<28} \"{r['label']}\"  [{r['grp']}] {' '.join(extra)}")


def p_save(rows):
    print(f"== Save paths - debug/save.json ({len(rows)})")
    for r in rows:
        ln = f"[{r['length']}]" if r["length"] is not None else ""
        print(f"  {r['path']:<48} {r['type']}{ln}  {r['sample'] or ''}"[:220])


def p_data(rows):
    print(f"== GameData ({len(rows)})")
    for r in rows:
        print(f"  {r['category']:<17} {r['id']:>5}  {r['name'] or '':<28} {r['data']}"[:220])


def p_refs(name, rows, total):
    cnt, files = total
    print(f"== Refs to '{name}' ({cnt} lines in {files} files{', showing ' + str(len(rows)) if len(rows) < cnt else ''})")
    last = None
    for r in rows:
        if r["file"] != last:
            print(f"  {r['file']}")
            last = r["file"]
        print(f"    {r['line']:>5}: {r['text']}")


# ---------------------------------------------------------------- main
def main(argv):
    flags, args, limit = set(), [], 25
    it = iter(argv)
    for a in it:
        if a == "--limit":
            limit = int(next(it, limit))
        elif a.startswith("--"):
            flags.add(a)
        else:
            args.append(a)
    if "--all" in flags:
        limit = 100000
    as_json = "--json" in flags

    if "--help" in flags or "-h" in args or (not args and not flags & {"--stats", "--rebuild"}):
        print(__doc__)
        return 0

    con = ensure_db(force="--rebuild" in flags)
    out = {}

    if "--stats" in flags or ("--rebuild" in flags and not args):
        for t in ("files", "symbols", "imports", "refs", "gamedata", "fields", "save_paths"):
            out[t] = con.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        out["gamedata_categories"] = categories(con)
        print(json.dumps(out, indent=2))
        return 0

    q = " ".join(args).strip()

    if "--refs" in flags:
        rows = refs(con, q, limit)
        total = ref_count(con, q)
        if as_json:
            print(json.dumps({"refs": rows, "total": total[0]}, indent=2, ensure_ascii=False))
        else:
            p_refs(q, rows, total)
        return 0 if rows else 4

    if "--file" in flags:
        files = [r[0] for r in con.execute("SELECT path FROM files WHERE path LIKE ? ORDER BY path", ("%" + q.replace("\\", "/") + "%",))]
        res = {f: [dict(r) for r in con.execute(
            "SELECT name, kind, line, end_line, exported, parent, signature FROM symbols WHERE file=? ORDER BY line", (f,))] for f in files}
        if as_json:
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            for f, syms in res.items():
                print(f"== {f} ({len(syms)} symbols)")
                for s in syms:
                    if s["kind"] == "local_function" and "--all" not in flags:
                        continue
                    exp = "export " if s["exported"] else ""
                    rng = f"{s['line']}-{s['end_line']}" if s["end_line"] != s["line"] else str(s["line"])
                    print(f"  {rng:>11}  {exp}{s['kind']:<9} {s['signature']}"[:200])
        return 0 if files else 4

    if "--imports" in flags:
        rows = [dict(r) for r in con.execute(
            "SELECT file, line, name, alias, source, resolved FROM imports WHERE name = ? COLLATE NOCASE OR alias = ? COLLATE NOCASE "
            "OR file LIKE ? OR resolved LIKE ? ORDER BY file, line", (q, q, "%" + q + "%", "%" + q + "%"))]
        if as_json:
            print(json.dumps(rows, indent=2))
        else:
            print(f"== Imports matching '{q}' ({len(rows)})")
            for r in rows:
                alias = f" as {r['alias']}" if r["alias"] and r["alias"] != r["name"] else ""
                print(f"  {r['file']}:{r['line']:<5} {r['name']}{alias}  <- {r['resolved'] or r['source']}")
        return 0 if rows else 4

    cats = {c.upper(): c for c in categories(con)}
    scopes = flags & {"--code", "--fields", "--save", "--data"}
    want = (lambda s: not scopes or s in scopes)

    # CATEGORY or CATEGORY.x
    head, _, tail = q.partition(".")
    if head.upper() in cats and want("--data"):
        cat = cats[head.upper()]
        if not tail:
            rows = [dict(r) for r in con.execute("SELECT category, id, name, data FROM gamedata WHERE category=? ORDER BY id_int LIMIT ?", (cat, limit))]
        elif tail.lstrip("-").isdigit():
            rows = [dict(r) for r in con.execute("SELECT category, id, name, data FROM gamedata WHERE category=? AND id_int=?", (cat, int(tail)))]
        else:
            rows = [dict(r) for r in con.execute("SELECT category, id, name, data FROM gamedata WHERE category=? AND name LIKE ? ORDER BY id_int LIMIT ?", (cat, "%" + tail + "%", limit))]
        out["gamedata"] = rows
    elif q.lstrip("-").isdigit() and want("--data"):
        out["gamedata"] = [dict(r) for r in con.execute("SELECT category, id, name, data FROM gamedata WHERE id_int=? ORDER BY category", (int(q),))]
    else:
        if want("--code"):
            out["code"] = search_code(con, q, limit)
        if want("--fields"):
            out["fields"] = search_fields(con, q, limit)
        if want("--save"):
            out["save"] = search_save(con, q, limit)
        if want("--data"):
            out["gamedata"] = search_data(con, q, limit)
        # exact identifier -> show where-used preview
        exact = q in {r["name"] for r in out.get("code", [])} | {r["key"] for r in out.get("fields", [])} | \
            {r["path"].rsplit(".", 1)[-1].replace("[]", "") for r in out.get("save", [])}
        if exact:
            out["refs_total"] = ref_count(con, q)[0]
            out["refs"] = refs(con, q, min(limit, 12))

    out = {k: v for k, v in out.items() if v}
    if as_json:
        print(json.dumps(out, indent=2, ensure_ascii=False))
        return 0 if out else 4
    if not out:
        print(f"No match for '{q}'.")
        return 4
    if "code" in out:
        p_code(out["code"])
    if "fields" in out:
        p_fields(out["fields"])
    if "save" in out:
        p_save(out["save"])
    if "gamedata" in out:
        p_data(out["gamedata"])
    if "refs" in out:
        p_refs(q, out["refs"], ref_count(con, q))
    return 0


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    sys.exit(main(sys.argv[1:]))
