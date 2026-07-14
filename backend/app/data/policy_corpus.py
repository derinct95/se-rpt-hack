"""Synthetic payer-policy / coding-guideline corpus for the RAG policy-lookup
chat tool. Entirely fictional text written for this demo -- no real payer
policy content -- but shaped like real RCM guidance so retrieval + citation
feels grounded. Keyed loosely to the same DENIAL_REASONS used by the claims
generator in app/data/seed.py so lookups actually connect to real claim data.
"""

POLICY_DOCS = [
    {"id": "pol-001", "payer": "Medicare", "category": "Missing Prior Authorization",
     "title": "Medicare Prior Authorization Requirements",
     "text": "Medicare requires prior authorization for select outpatient procedures including certain imaging, "
             "cosmetic-adjacent, and implant-based services. Claims submitted without a valid authorization number "
             "on file at time of service will deny for missing prior authorization. Providers should verify "
             "authorization status through the payer portal before scheduling the procedure, not at time of billing."},
    {"id": "pol-002", "payer": "Aetna", "category": "Missing Prior Authorization",
     "title": "Aetna Pre-Certification Policy",
     "text": "Aetna's pre-certification list covers advanced imaging (MRI, CT, PET), select specialty drugs, and "
             "inpatient admissions. A pre-certification obtained after the date of service does not retroactively "
             "satisfy this requirement and the claim will be denied. Appeals require documentation that the service "
             "was urgent/emergent to waive the pre-certification requirement."},
    {"id": "pol-003", "payer": "Medicare", "category": "Coding Error",
     "title": "Medicare NCCI Coding Edits",
     "text": "National Correct Coding Initiative (NCCI) edits prevent billing of code pairs considered mutually "
             "exclusive or components of a more comprehensive procedure on the same date of service. Denials coded "
             "as a coding error most often trace back to an NCCI edit pair or a missing modifier (e.g. -59, -25) "
             "needed to indicate a distinct procedural service."},
    {"id": "pol-004", "payer": "Cigna", "category": "Coding Error",
     "title": "Cigna Claim Edit Guidelines",
     "text": "Cigna's claim-edit engine flags mismatches between the billed diagnosis code and the procedure code's "
             "expected clinical context, as well as outdated ICD-10 codes past their annual update window. A coding "
             "audit that cross-checks diagnosis-to-procedure linkage before submission meaningfully reduces this "
             "denial category."},
    {"id": "pol-005", "payer": "UnitedHealthcare", "category": "Duplicate Claim",
     "title": "UnitedHealthcare Duplicate Claim Logic",
     "text": "A claim is flagged as a duplicate when the same member, date of service, procedure code, and billed "
             "amount appear on a previously adjudicated claim, even if the original claim is still pending. "
             "Resubmitting a claim to check status (rather than using the payer's claim-status inquiry tool) is the "
             "leading cause of true duplicate denials."},
    {"id": "pol-006", "payer": "Medicaid", "category": "Duplicate Claim",
     "title": "Medicaid Duplicate Billing Review",
     "text": "State Medicaid programs generally allow a 3-5 business day adjudication window before a resubmission "
             "is treated as a duplicate rather than a status check. Providers should use the 277CA claim "
             "acknowledgment transaction to confirm receipt instead of resubmitting."},
    {"id": "pol-007", "payer": "Blue Cross Blue Shield", "category": "Eligibility Issue",
     "title": "BCBS Eligibility Verification Policy",
     "text": "Eligibility must be verified within 24 hours of the date of service, not at the time of scheduling, "
             "since coverage can lapse or change mid-month. Claims denied for eligibility issues are commonly traced "
             "to a coverage termination, a change in the member's plan tier, or a secondary payer coordination-of-"
             "benefits mismatch."},
    {"id": "pol-008", "payer": "Aetna", "category": "Eligibility Issue",
     "title": "Aetna Coordination of Benefits",
     "text": "When a member has more than one active payer, Aetna requires the coordination-of-benefits (COB) "
             "questionnaire to be current. An outdated COB record is one of the most common eligibility-related "
             "denial drivers and can typically be resolved with a phone update rather than a formal appeal."},
    {"id": "pol-009", "payer": "Medicare", "category": "Timely Filing Expired",
     "title": "Medicare Timely Filing Limit",
     "text": "Medicare Part B claims must be filed within 12 months of the date of service. Claims filed after this "
             "window are denied for timely filing and are not appealable except in narrow circumstances such as "
             "administrative error by CMS, which requires documented proof."},
    {"id": "pol-010", "payer": "Cigna", "category": "Timely Filing Expired",
     "title": "Cigna Timely Filing Standard",
     "text": "Cigna's standard timely filing limit is 90 days from date of service for in-network providers. Claims "
             "queued in a billing system backlog past this window cannot be appealed on timeliness grounds alone; "
             "practices with recurring timely-filing denials should audit their claim-submission cadence."},
    {"id": "pol-011", "payer": "UnitedHealthcare", "category": "Insufficient Documentation",
     "title": "UnitedHealthcare Documentation Standards",
     "text": "Claims for procedures with a documentation requirement (e.g. durable medical equipment, therapy "
             "services) must include chart notes supporting medical necessity at the time of submission, not upon "
             "request. A same-visit documentation checklist at the point of care is the most effective mitigation."},
    {"id": "pol-012", "payer": "Medicaid", "category": "Insufficient Documentation",
     "title": "Medicaid Documentation Audit Findings",
     "text": "State Medicaid audits most frequently cite missing signed treatment plans and absent time-stamped "
             "progress notes as the root cause of insufficient-documentation denials, particularly for behavioral "
             "health and physical therapy claim lines."},
    {"id": "pol-013", "payer": "Blue Cross Blue Shield", "category": "Non-Covered Service",
     "title": "BCBS Non-Covered Services List",
     "text": "Cosmetic procedures, experimental treatments, and services explicitly excluded under the member's plan "
             "document will deny as non-covered regardless of medical necessity documentation. Verifying the "
             "member's specific plan exclusions (not just the general benefit summary) before the visit prevents "
             "this denial category."},
    {"id": "pol-014", "payer": "Aetna", "category": "Non-Covered Service",
     "title": "Aetna Plan Exclusions",
     "text": "Aetna plan exclusions vary significantly by employer group rider; a service covered under one Aetna "
             "plan may be excluded under another. Front-desk benefit verification against the specific plan ID, not "
             "just the payer name, is the standard mitigation."},
    {"id": "pol-015", "payer": "Medicare", "category": "Medical Necessity Not Established",
     "title": "Medicare Local Coverage Determination (LCD)",
     "text": "Medicare Administrative Contractors publish Local Coverage Determinations defining the diagnosis codes "
             "and clinical criteria that establish medical necessity for a given procedure. A denial in this "
             "category almost always traces to a diagnosis code not listed on the relevant LCD for that CPT code."},
    {"id": "pol-016", "payer": "Cigna", "category": "Medical Necessity Not Established",
     "title": "Cigna Medical Necessity Criteria",
     "text": "Cigna applies InterQual or MCG clinical criteria for medical necessity review on higher-cost procedures. "
             "Submitting supporting clinical documentation alongside the initial claim, rather than waiting for a "
             "denial and appeal, reduces both denial rate and days-in-AR for affected claim types."},
    {"id": "pol-017", "payer": None, "category": "general",
     "title": "Denial Root-Cause Review Best Practice",
     "text": "A recurring denial reason for the same provider across multiple consecutive quarters indicates a "
             "process gap rather than a one-off error. Best practice is a 30-minute root-cause review with billing "
             "staff focused on the top 2 denial reasons, rather than working denials claim-by-claim."},
    {"id": "pol-018", "payer": None, "category": "general",
     "title": "Days in AR Benchmark",
     "text": "Industry benchmark for days in accounts receivable is 30-40 days for a well-performing practice. "
             "Days in AR above 55 typically indicates either a follow-up cadence gap or a payer-side adjudication "
             "delay that should be escalated through the payer's provider relations contact."},
    {"id": "pol-019", "payer": None, "category": "general",
     "title": "Clean Claim Rate Target",
     "text": "A clean claim rate (claims accepted on first submission with no errors) above 95% is considered "
             "best-in-class. Rates below 85% usually point to front-end data-capture issues -- eligibility, "
             "demographics, or coding -- rather than payer-side adjudication problems."},
    {"id": "pol-020", "payer": None, "category": "general",
     "title": "Prior Authorization Workflow Audit",
     "text": "When prior-authorization approval rates lag peer benchmarks, the most common root cause is a missed "
             "step in the intake workflow -- authorization requested after scheduling rather than before -- rather "
             "than payer-side denial of clinically appropriate requests."},
]
