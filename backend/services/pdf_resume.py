"""Generate clean, ATS-friendly resume PDFs."""

from __future__ import annotations

import io
from typing import Any, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


PRIMARY = colors.HexColor("#4F46E5")
MUTED = colors.HexColor("#475569")
DARK = colors.HexColor("#0F172A")


def _safe(text: Any) -> str:
    if text is None:
        return ""
    s = str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return s.strip()


def _styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "name": ParagraphStyle(
            "ResumeName",
            parent=base["Heading1"],
            fontSize=18,
            leading=22,
            textColor=DARK,
            alignment=TA_CENTER,
            spaceAfter=4,
            fontName="Helvetica-Bold",
        ),
        "contact": ParagraphStyle(
            "ResumeContact",
            parent=base["Normal"],
            fontSize=9,
            leading=12,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "section": ParagraphStyle(
            "ResumeSection",
            parent=base["Heading2"],
            fontSize=11,
            leading=14,
            textColor=PRIMARY,
            spaceBefore=10,
            spaceAfter=4,
            fontName="Helvetica-Bold",
            alignment=TA_LEFT,
        ),
        "body": ParagraphStyle(
            "ResumeBody",
            parent=base["Normal"],
            fontSize=9.5,
            leading=13,
            textColor=DARK,
            alignment=TA_LEFT,
        ),
        "role": ParagraphStyle(
            "ResumeRole",
            parent=base["Normal"],
            fontSize=10,
            leading=13,
            textColor=DARK,
            fontName="Helvetica-Bold",
            spaceBefore=6,
            spaceAfter=2,
        ),
        "meta": ParagraphStyle(
            "ResumeMeta",
            parent=base["Normal"],
            fontSize=9,
            leading=12,
            textColor=MUTED,
            spaceAfter=2,
        ),
        "bullet": ParagraphStyle(
            "ResumeBullet",
            parent=base["Normal"],
            fontSize=9.5,
            leading=12.5,
            textColor=DARK,
            leftIndent=8,
        ),
    }


def _divider() -> HRFlowable:
    return HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=2, spaceAfter=6)


def _section(styles: dict, title: str, story: list) -> None:
    story.append(Paragraph(title.upper(), styles["section"]))
    story.append(_divider())


def _bullets(items: list[str], styles: dict) -> Optional[ListFlowable]:
    clean = [_safe(i) for i in items if str(i).strip()]
    if not clean:
        return None
    return ListFlowable(
        [ListItem(Paragraph(b, styles["bullet"]), leftIndent=12, bulletColor=PRIMARY) for b in clean],
        bulletType="bullet",
        start="•",
        leftIndent=10,
        bulletFontSize=8,
    )


def structured_resume_to_pdf(data: dict[str, Any]) -> bytes:
    """Build a professional one-page-friendly ATS resume PDF from structured JSON."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
        title=_safe(data.get("contact", {}).get("name") or "Resume"),
        author="CareerGPS AI",
    )
    styles = _styles()
    story: list = []

    contact = data.get("contact") or {}
    name = _safe(contact.get("name") or data.get("full_name") or "Your Name")
    story.append(Paragraph(name, styles["name"]))

    contact_bits = [
        _safe(contact.get("email")),
        _safe(contact.get("phone")),
        _safe(contact.get("location")),
        _safe(contact.get("linkedin")),
        _safe(contact.get("github")),
        _safe(contact.get("portfolio")),
    ]
    contact_line = "  |  ".join([c for c in contact_bits if c])
    if contact_line:
        story.append(Paragraph(contact_line, styles["contact"]))

    summary = _safe(data.get("rewritten_summary") or data.get("summary") or data.get("professional_summary"))
    if summary:
        _section(styles, "Professional Summary", story)
        story.append(Paragraph(summary, styles["body"]))

    experience = data.get("rewritten_experience") or data.get("experience") or []
    if experience:
        _section(styles, "Experience", story)
        for exp in experience:
            title = _safe(exp.get("title"))
            company = _safe(exp.get("company"))
            dates = _safe(exp.get("dates") or exp.get("duration") or "")
            header = " — ".join([p for p in [title, company] if p])
            if header:
                story.append(Paragraph(header, styles["role"]))
            if dates:
                story.append(Paragraph(dates, styles["meta"]))
            bl = _bullets(exp.get("bullets") or [], styles)
            if bl:
                story.append(bl)

    education = data.get("education") or data.get("rewritten_education") or []
    if education:
        _section(styles, "Education", story)
        for edu in education:
            degree = _safe(edu.get("degree") or edu.get("title"))
            school = _safe(edu.get("school") or edu.get("institution"))
            year = _safe(edu.get("year") or edu.get("dates") or "")
            header = " — ".join([p for p in [degree, school] if p])
            if header:
                story.append(Paragraph(header, styles["role"]))
            if year:
                story.append(Paragraph(year, styles["meta"]))
            details = _safe(edu.get("details"))
            if details:
                story.append(Paragraph(details, styles["body"]))

    projects = data.get("rewritten_projects") or data.get("projects") or []
    if projects:
        _section(styles, "Projects", story)
        for proj in projects:
            pname = _safe(proj.get("name") or proj.get("title"))
            if pname:
                story.append(Paragraph(pname, styles["role"]))
            tech = proj.get("tech_stack") or []
            if tech:
                story.append(Paragraph("Tech: " + ", ".join(_safe(t) for t in tech), styles["meta"]))
            bl = _bullets(proj.get("bullets") or [], styles)
            if bl:
                story.append(bl)

    skills = data.get("skills_section") or data.get("skills") or {}
    if isinstance(skills, dict):
        tech = skills.get("technical") or []
        tools = skills.get("tools") or []
        soft = skills.get("soft") or []
        lines = []
        if tech:
            lines.append(f"<b>Technical:</b> {', '.join(_safe(s) for s in tech)}")
        if tools:
            lines.append(f"<b>Tools:</b> {', '.join(_safe(s) for s in tools)}")
        if soft:
            lines.append(f"<b>Soft Skills:</b> {', '.join(_safe(s) for s in soft)}")
        if lines:
            _section(styles, "Skills", story)
            for line in lines:
                story.append(Paragraph(line, styles["body"]))
                story.append(Spacer(1, 3))
    elif isinstance(skills, list) and skills:
        _section(styles, "Skills", story)
        story.append(Paragraph(", ".join(_safe(s) for s in skills), styles["body"]))

    certifications = data.get("certifications") or []
    if certifications:
        _section(styles, "Certifications", story)
        for cert in certifications:
            if isinstance(cert, str):
                story.append(Paragraph(f"• {_safe(cert)}", styles["body"]))
            else:
                label = _safe(cert.get("name") or cert.get("title"))
                provider = _safe(cert.get("provider") or "")
                line = f"• {label}" + (f" — {provider}" if provider else "")
                story.append(Paragraph(line, styles["body"]))

    if not story:
        story.append(Paragraph("Empty resume", styles["body"]))

    doc.build(story)
    return buffer.getvalue()


def plain_text_resume_to_pdf(
    text: str,
    *,
    name: str = "Resume",
    target_role: str = "",
) -> bytes:
    """Fallback: render plain rewritten text as a simple PDF."""
    data: dict[str, Any] = {
        "contact": {"name": name},
        "rewritten_summary": "",
        "full_text": text,
    }
    # Prefer structured path with summary = first paragraph, rest as experience bullets
    parts = [p.strip() for p in text.split("\n\n") if p.strip()]
    if parts:
        data["rewritten_summary"] = parts[0][:600]
        if len(parts) > 1:
            data["rewritten_experience"] = [
                {
                    "title": target_role or "Professional Experience",
                    "company": "",
                    "bullets": [line.lstrip("•-– ").strip() for line in parts[1].split("\n") if line.strip()][:8],
                }
            ]
    return structured_resume_to_pdf(data)
