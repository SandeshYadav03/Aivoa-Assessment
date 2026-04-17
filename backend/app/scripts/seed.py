"""Idempotent seed data: 8 HCPs, 6 products, 10 sample interactions, 3 follow-ups.

Usage:
    python -m app.scripts.seed             # insert if empty, skip if already seeded
    python -m app.scripts.seed --force     # wipe and reseed
    python -m app.scripts.seed --idempotent
"""
from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select

from app.core.database import dispose_engine, session_factory
from app.models import HCP, FollowUp, Interaction, Product

HCPS = [
    dict(name="Dr. Aditi Sharma", specialty="Cardiology", hospital="Apollo Hospitals", city="Bangalore", email="aditi.sharma@example.com", phone="+91-9000000001"),
    dict(name="Dr. Ravi Patel", specialty="Endocrinology", hospital="Fortis", city="Bangalore", email="ravi.patel@example.com", phone="+91-9000000002"),
    dict(name="Dr. Meera Iyer", specialty="Pulmonology", hospital="Manipal Hospital", city="Bangalore", email="meera.iyer@example.com", phone="+91-9000000003"),
    dict(name="Dr. Arjun Rao", specialty="Oncology", hospital="HCG", city="Mumbai", email="arjun.rao@example.com", phone="+91-9000000004"),
    dict(name="Dr. Kavita Nair", specialty="Endocrinology", hospital="Kokilaben", city="Mumbai", email="kavita.nair@example.com", phone="+91-9000000005"),
    dict(name="Dr. Sandeep Kumar", specialty="Cardiology", hospital="AIIMS", city="Delhi", email="sandeep.kumar@example.com", phone="+91-9000000006"),
    dict(name="Dr. Priya Verma", specialty="Neurology", hospital="Max Healthcare", city="Delhi", email="priya.verma@example.com", phone="+91-9000000007"),
    dict(name="Dr. Rahul Menon", specialty="Gastroenterology", hospital="Kauvery", city="Chennai", email="rahul.menon@example.com", phone="+91-9000000008"),
]

PRODUCTS = [
    dict(name="Atorvastatin 10mg", therapeutic_area="Cardiology", sku="ATV-10", description="Statin for hypercholesterolaemia."),
    dict(name="Metformin 500mg", therapeutic_area="Endocrinology", sku="MET-500", description="First-line oral hypoglycaemic."),
    dict(name="Empagliflozin 25mg", therapeutic_area="Endocrinology", sku="EMP-25", description="SGLT2 inhibitor."),
    dict(name="Salmeterol Inhaler", therapeutic_area="Pulmonology", sku="SAL-INH", description="LABA bronchodilator."),
    dict(name="Pembrolizumab 100mg", therapeutic_area="Oncology", sku="PEM-100", description="Anti-PD-1 monoclonal antibody."),
    dict(name="Rosuvastatin 20mg", therapeutic_area="Cardiology", sku="ROS-20", description="High-intensity statin."),
]

INTERACTIONS = [
    # (hcp_name, channel, outcome, sentiment, summary, products_discussed, next_step, days_ago)
    ("Dr. Aditi Sharma", "visit", "positive", "positive",
     "Introduced Rosuvastatin 20mg as step-up from Atorvastatin. Dr. asked for KOL studies.",
     ["Rosuvastatin 20mg", "Atorvastatin 10mg"], "Send Indian registry data by Friday.", 5),
    ("Dr. Aditi Sharma", "call", "follow_up", "neutral",
     "Shared 8-month LDL outcomes. Dr. wants to discuss dosing in elderly patients next visit.",
     ["Rosuvastatin 20mg"], "Schedule in-person next week.", 2),
    ("Dr. Ravi Patel", "visit", "positive", "positive",
     "Strong interest in Empagliflozin 25mg for T2DM + CVD patients.",
     ["Empagliflozin 25mg", "Metformin 500mg"], "Drop clinical summary at reception.", 7),
    ("Dr. Ravi Patel", "email", "neutral", "neutral",
     "Sent published RWE. Awaiting reply.", ["Empagliflozin 25mg"], "Follow up in 5 days.", 3),
    ("Dr. Meera Iyer", "visit", "negative", "negative",
     "Concerns about Salmeterol Inhaler pricing vs competitor. Needs patient assistance program info.",
     ["Salmeterol Inhaler"], "Send PAP brochure.", 10),
    ("Dr. Arjun Rao", "visit", "positive", "positive",
     "Enthusiastic about Pembrolizumab for NSCLC. Asked for investigator-initiated trial support.",
     ["Pembrolizumab 100mg"], "Loop in medical affairs.", 4),
    ("Dr. Kavita Nair", "call", "follow_up", "positive",
     "Considering Empagliflozin 25mg addition for 12 existing patients.",
     ["Empagliflozin 25mg"], "Ship samples.", 6),
    ("Dr. Sandeep Kumar", "visit", "positive", "positive",
     "Switched 4 patients to Rosuvastatin 20mg last month; zero adverse events.",
     ["Rosuvastatin 20mg"], "Ask for testimonial at next symposium.", 8),
    ("Dr. Priya Verma", "email", "neutral", "neutral",
     "Off-topic — discussed epilepsy formulary. Neurology out of scope today.",
     [], "Pass to neuro team.", 1),
    ("Dr. Rahul Menon", "visit", "positive", "positive",
     "First meeting. Open to detailing on CV-risk statins.",
     ["Atorvastatin 10mg"], "Schedule detailing next month.", 12),
]


async def _seed_if_empty(session, force: bool) -> None:
    if force:
        await session.execute(delete(FollowUp))
        await session.execute(delete(Interaction))
        await session.execute(delete(Product))
        await session.execute(delete(HCP))

    if (await session.execute(select(HCP).limit(1))).scalar_one_or_none():
        print("seed: HCPs already present — skipping")
        return

    now = datetime.now(timezone.utc)

    hcps = {row["name"]: HCP(**row) for row in HCPS}
    session.add_all(hcps.values())

    products = [Product(**p) for p in PRODUCTS]
    session.add_all(products)

    await session.flush()  # populate ids

    for name, channel, outcome, sentiment, summary, products_list, next_step, days_ago in INTERACTIONS:
        session.add(
            Interaction(
                hcp_id=hcps[name].id,
                channel=channel,
                outcome=outcome,
                sentiment=sentiment,
                summary=summary,
                raw_notes=summary,
                products_discussed=products_list,
                next_step=next_step,
                occurred_at=now - timedelta(days=days_ago),
            )
        )

    await session.flush()

    session.add_all([
        FollowUp(hcp_id=hcps["Dr. Aditi Sharma"].id, due_at=now + timedelta(days=3), note="In-person visit with registry data"),
        FollowUp(hcp_id=hcps["Dr. Ravi Patel"].id, due_at=now + timedelta(days=5), note="RWE follow-up"),
        FollowUp(hcp_id=hcps["Dr. Meera Iyer"].id, due_at=now + timedelta(days=7), note="PAP brochure delivery"),
    ])

    await session.commit()
    print(f"seed: inserted {len(HCPS)} HCPs, {len(PRODUCTS)} products, {len(INTERACTIONS)} interactions")


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="Wipe and reseed")
    parser.add_argument("--idempotent", action="store_true", help="No-op if data exists (default)")
    args = parser.parse_args()

    async with session_factory()() as session:
        await _seed_if_empty(session, force=args.force)

    await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
