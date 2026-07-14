"""Pragmatic, best-effort format detection + identity-field extraction for
FHIR, HL7v2, and CSV uploads. This is a synthetic demo dashboard, not a
certified health-IT interoperability system -- see the parsing notes below
for exactly what subset of each format is handled.

FHIR: a Bundle of entries, or a bare Practitioner/PractitionerRole/Organization
resource/array. Extracts name, NPI (identifier), specialty + facility via a
best-effort PractitionerRole/Organization join. No validation, terminology
binding, or other resource types.

HL7v2: only MSH (to confirm the format) and PRD (Provider Data: PRD-2 name,
PRD-7 NPI-ish identifier, PRD-9 specialty, PRD-8 facility), falling back to
STF (Staff: STF-3 name) if PRD is absent. HL7v2 has no standard "provider
directory" message type, so this segment mapping is an invented convention
for this demo, not a real interoperability spec.

Both formats (and CSV) backfill anything missing via the same synthetic
generator used everywhere else, so imported providers always get complete,
consistent data.
"""

import json

import pandas as pd

DetectedFormat = str  # "fhir" | "hl7" | "csv"


def detect_format(raw: bytes) -> DetectedFormat:
    stripped = raw.lstrip().lstrip(b"\xef\xbb\xbf")
    if stripped.startswith(b"MSH|"):
        return "hl7"
    if stripped[:1] in (b"{", b"["):
        try:
            data = json.loads(stripped)
        except Exception:
            return "csv"
        if isinstance(data, dict) and ("resourceType" in data or "entry" in data):
            return "fhir"
        if isinstance(data, list) and data and isinstance(data[0], dict) and "resourceType" in data[0]:
            return "fhir"
    return "csv"


def _extract_fhir_rows(raw: bytes) -> tuple[list[dict], list[str]]:
    warnings: list[str] = []
    try:
        data = json.loads(raw)
    except Exception as exc:
        return [], [f"Could not parse FHIR JSON: {exc}"]

    resources: list[dict] = []
    if isinstance(data, dict) and data.get("resourceType") == "Bundle":
        resources = [e.get("resource", {}) for e in data.get("entry", [])]
    elif isinstance(data, dict):
        resources = [data]
    elif isinstance(data, list):
        resources = data

    practitioners = [r for r in resources if r.get("resourceType") == "Practitioner"]
    roles = [r for r in resources if r.get("resourceType") == "PractitionerRole"]
    orgs = [r for r in resources if r.get("resourceType") == "Organization"]

    if not practitioners:
        return [], ["No Practitioner resources found in the FHIR payload; nothing to import."]

    rows = []
    for prac in practitioners:
        name = None
        names = prac.get("name", [])
        if names:
            n = names[0]
            name = n.get("text") or " ".join(filter(None, [" ".join(n.get("given", [])), n.get("family")])).strip()

        npi = None
        for ident in prac.get("identifier", []):
            system = (ident.get("system") or "").lower()
            type_text = (ident.get("type", {}) or {}).get("text", "").lower()
            if "npi" in system or "npi" in type_text:
                npi = ident.get("value")

        specialty = facility = None
        prac_id = prac.get("id")
        for role in roles:
            ref = (role.get("practitioner", {}) or {}).get("reference", "")
            if prac_id and prac_id in ref:
                codes = role.get("specialty", [])
                if codes:
                    specialty = codes[0].get("text") or (codes[0].get("coding") or [{}])[0].get("display")
                org_ref = (role.get("organization", {}) or {}).get("reference", "")
                for org in orgs:
                    if org.get("id") and org.get("id") in org_ref:
                        facility = org.get("name")

        if not name:
            warnings.append("A Practitioner resource had no usable name; skipped.")
            continue
        if not specialty:
            warnings.append(f"No specialty found for {name}; a representative synthetic specialty will be assigned.")
        if not facility:
            warnings.append(f"No facility found for {name}; a representative synthetic facility will be assigned.")

        rows.append({"name": name, "specialty": specialty, "facility": facility, "npi": npi, "performanceScore": None})

    return rows, warnings


def _extract_hl7_rows(raw: bytes) -> tuple[list[dict], list[str]]:
    text = raw.decode("utf-8", errors="replace")
    segments = [s for s in text.replace("\r\n", "\r").replace("\n", "\r").split("\r") if s.strip()]

    found_msh = False
    name = specialty = npi = facility = None
    for seg in segments:
        fields = seg.split("|")
        seg_id = fields[0] if fields else ""
        if seg_id == "MSH":
            found_msh = True
            facility = facility or (fields[3] if len(fields) > 3 else None)
        elif seg_id == "PRD":
            name = name or (fields[2] if len(fields) > 2 else None)
            facility = facility or (fields[8] if len(fields) > 8 else None)
            npi = npi or (fields[7] if len(fields) > 7 else None)
            specialty = specialty or (fields[9] if len(fields) > 9 else None)
        elif seg_id == "STF" and not name:
            name = fields[3] if len(fields) > 3 else None

    if not found_msh:
        return [], ["File did not start with a valid MSH segment; not recognized as HL7v2."]
    if not name:
        return [], [
            "No PRD/STF provider-name segment found. Note: this importer parses only MSH + PRD "
            "(fallback STF) as a pragmatic, non-standard convention -- HL7v2 has no single canonical "
            "\"provider directory\" message type."
        ]

    if "^" in name:
        parts = name.split("^")
        name = " ".join(p for p in [parts[1] if len(parts) > 1 else None, parts[0] if parts else None] if p)

    warnings = []
    if not specialty:
        warnings.append(f"No specialty segment found for {name}; a representative synthetic specialty will be assigned.")
    if not facility:
        warnings.append(f"No facility segment found for {name}; a representative synthetic facility will be assigned.")

    return [{"name": name, "specialty": specialty, "facility": facility, "npi": npi, "performanceScore": None}], warnings


def _extract_csv_rows(raw: bytes) -> tuple[list[dict], list[str]]:
    import io as _io

    try:
        df = pd.read_csv(_io.BytesIO(raw))
    except Exception as exc:
        return [], [f"Could not parse CSV: {exc}"]

    required = ["name", "specialty", "facility"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        return [], [f"Missing required columns: {', '.join(missing)}"]

    rows, warnings = [], []
    for _, row in df.iterrows():
        has_score = "performanceScore" in df.columns and pd.notna(row.get("performanceScore"))
        score = float(row["performanceScore"]) if has_score else None
        rows.append({
            "name": str(row["name"]), "specialty": str(row["specialty"]), "facility": str(row["facility"]),
            "npi": str(row["npi"]) if "npi" in df.columns and pd.notna(row.get("npi")) else None,
            "performanceScore": score,
        })
        if score is None:
            warnings.append(f"No performanceScore for {row['name']}; a representative synthetic score will be assigned.")
    return rows, warnings


def parse_upload(raw: bytes) -> tuple[DetectedFormat, list[dict], list[str]]:
    fmt = detect_format(raw)
    if fmt == "fhir":
        rows, warnings = _extract_fhir_rows(raw)
    elif fmt == "hl7":
        rows, warnings = _extract_hl7_rows(raw)
    else:
        rows, warnings = _extract_csv_rows(raw)
    return fmt, rows, warnings
