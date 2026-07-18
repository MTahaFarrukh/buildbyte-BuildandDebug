"""Derive weekly roadmap strictly from monthly topics (source of truth)."""

from __future__ import annotations

from typing import Any


def derive_weekly_from_monthly(result: dict[str, Any], hours_per_week: int = 10) -> dict[str, Any]:
    """
    Build weekly_timeline from monthly_timeline.topics.
    Each topic becomes exactly one week focus. No independent weekly generation.
    """
    monthly = result.get("monthly_timeline") or []
    weekly: list[dict[str, Any]] = []
    week_num = 1
    seen: set[str] = set()

    for month in monthly:
        month_no = int(month.get("month") or 1)
        theme = month.get("theme") or f"Month {month_no}"
        topics = month.get("topics") or month.get("skills_to_master") or month.get("milestones") or []
        hours_topic = int(month.get("hours_per_topic") or max(2, hours_per_week // max(1, len(topics) or 4)))

        for topic in topics:
            title = str(topic).strip()
            if not title:
                continue
            key = title.lower()
            if key in seen:
                continue
            seen.add(key)
            weekly.append(
                {
                    "week": week_num,
                    "month": month_no,
                    "focus": title,
                    "theme": theme,
                    "tasks": [
                        f"Study: {title}",
                        f"Practice exercises for {title}",
                        f"Take notes / mini checkpoint on {title}",
                    ],
                    "hours": hours_topic,
                }
            )
            week_num += 1

        # Ensure month topics list is normalized
        month["topics"] = [str(t).strip() for t in topics if str(t).strip()]

    result["weekly_timeline"] = weekly
    result["topics_count"] = len(weekly)
    result["derivation"] = "weekly_from_monthly"
    return result
