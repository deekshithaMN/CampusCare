from datetime import datetime, timezone

SEVERITY_WEIGHTS = {
    'LOW': 1.0,
    'MEDIUM': 2.0,
    'HIGH': 3.5,
    'CRITICAL': 5.0,
}

def calculate_explainable_priority(severity: str, supporters_count: int, created_at: datetime = None) -> dict:
    """
    Computes an auditable, explainable priority score for a complaint.
    
    Formula:
    Score = (SeverityWeight * 25) + (SupportersCount * 10) + (HoursPending * 1.5)
    """
    severity_key = str(severity).upper()
    weight = SEVERITY_WEIGHTS.get(severity_key, 1.0)
    severity_component = round(weight * 25.0, 2)
    support_component = round(supporters_count * 10.0, 2)

    if created_at is None:
        hours_pending = 0.0
    else:
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        hours_pending = max(0.0, round((now - created_at).total_seconds() / 3600.0, 2))

    urgency_component = round(hours_pending * 1.5, 2)
    total_score = round(severity_component + support_component + urgency_component, 2)

    return {
        "priority_score": total_score,
        "breakdown": {
            "severity_level": severity_key,
            "severity_weight": weight,
            "severity_component": severity_component,
            "supporters_count": supporters_count,
            "support_component": support_component,
            "hours_pending": hours_pending,
            "urgency_component": urgency_component,
            "formula": "Score = (SeverityWeight * 25) + (Supporters * 10) + (HoursPending * 1.5)"
        }
    }
