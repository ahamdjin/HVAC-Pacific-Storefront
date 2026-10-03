#!/usr/bin/env python3
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL = "http://schemas.openxmlformats.org/package/2006/relationships"

def text_nodes(node):
    return "".join((x.text or "") for x in node.iter() if x.tag == f"{{{MAIN}}}t")

def col_index(ref):
    m = re.match(r"([A-Z]+)", ref or "")
    if not m:
        return 0
    n = 0
    for ch in m.group(1):
        n = n * 26 + (ord(ch) - 64)
    return n - 1

def read_shared(zf):
    name = "xl/sharedStrings.xml"
    if name not in zf.namelist():
        return []
    root = ET.fromstring(zf.read(name))
    return [text_nodes(si) for si in root.findall(f"{{{MAIN}}}si")]

def workbook_sheet_paths(zf):
    wb = ET.fromstring(zf.read("xl/workbook.xml"))
    rels = ET.fromstring(zf.read("xl/_rels/workbook.xml.rels"))
    targets = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels.findall(f"{{{PKG_REL}}}Relationship")
    }
    result = {}
    sheets = wb.find(f"{{{MAIN}}}sheets")
    if sheets is None:
        return result
    for sheet in sheets:
        title = sheet.attrib.get("name", "")
        rid = sheet.attrib.get(f"{{{REL}}}id")
        target = targets.get(rid, "")
        if not target:
            continue
        if target.startswith("/"):
            path = target.lstrip("/")
        else:
            path = "xl/" + target.replace("../", "")
        result[title] = path
    return result

def cell_value(cell, shared):
    cell_type = cell.attrib.get("t")
    if cell_type == "inlineStr":
        inline = cell.find(f"{{{MAIN}}}is")
        return text_nodes(inline) if inline is not None else ""
    value = cell.find(f"{{{MAIN}}}v")
    raw = value.text if value is not None and value.text is not None else ""
    if cell_type == "s":
        try:
            return shared[int(raw)]
        except (ValueError, IndexError):
            return raw
    if cell_type == "b":
        return "TRUE" if raw == "1" else "FALSE"
    return raw

def read_sheet(zf, path, shared):
    root = ET.fromstring(zf.read(path))
    data = root.find(f"{{{MAIN}}}sheetData")
    rows = []
    if data is None:
        return rows
    for row in data.findall(f"{{{MAIN}}}row"):
        values = {}
        for cell in row.findall(f"{{{MAIN}}}c"):
            values[col_index(cell.attrib.get("r", ""))] = cell_value(cell, shared)
        if values:
            rows.append(values)
    if not rows:
        return []
    width = max(rows[0].keys()) + 1
    headers = [str(rows[0].get(i, "")).strip() for i in range(width)]
    output = []
    for row in rows[1:]:
        item = {}
        has_value = False
        for i, header in enumerate(headers):
            if not header:
                continue
            value = str(row.get(i, "")).strip()
            item[header] = value
            has_value = has_value or bool(value)
        if has_value:
            output.append(item)
    return output

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: read-xlsx.py <workbook.xlsx>")
    path = Path(sys.argv[1])
    if not path.exists():
        raise SystemExit(f"Workbook not found: {path}")
    with zipfile.ZipFile(path) as zf:
        shared = read_shared(zf)
        paths = workbook_sheet_paths(zf)
        required = ["Units", "Accessories"]
        missing = [name for name in required if name not in paths]
        if missing:
            raise SystemExit("Missing required worksheet(s): " + ", ".join(missing))
        result = {name: read_sheet(zf, paths[name], shared) for name in required}
    sys.stdout.write(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
