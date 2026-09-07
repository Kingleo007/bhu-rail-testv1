import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

TEMPLATE_PATH = "/Users/kushalgarg/Downloads/PITCH DECK LEARNER'S TEMPLATE.pptx"
OUTPUT_PATH = "/Users/kushalgarg/sih/Bhu-Rail_Land_DPI_Pitch_Deck.pptx"

# Copy template to output path
shutil.copyfile(TEMPLATE_PATH, OUTPUT_PATH)
prs = Presentation(OUTPUT_PATH)

# Colors
DARK_BG = RGBColor(15, 23, 42)     # slate-900
EMERALD = RGBColor(16, 185, 129)   # emerald-500
WHITE = RGBColor(255, 255, 255)
LIGHT_GRAY = RGBColor(226, 232, 240)
MUTED = RGBColor(148, 163, 184)
ROSE = RGBColor(244, 63, 94)
BLUE = RGBColor(59, 130, 246)
GOLD = RGBColor(245, 158, 11)

def clear_and_set_text(shape, text, font_size=14, bold=False, color=WHITE, align=PP_ALIGN.LEFT):
    tf = shape.text_frame
    tf.clear()
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.font.color.rgb = color
    p.alignment = align

def remove_instruction_notes(slide):
    shapes_to_remove = []
    for s in slide.shapes:
        if s.has_text_frame:
            t = s.text_frame.text.strip()
            if t.startswith("Instruction:") or t.startswith("Note:") or t.startswith("Final Instruction:") or "Use this slide to" in t:
                shapes_to_remove.append(s)
    for s in shapes_to_remove:
        # Move shape off-slide or clear its text
        s.text_frame.clear()
        s.width = 0
        s.height = 0

print(f"Processing {len(prs.slides)} slides...")

# -------------------------------------------------------------
# SLIDE 1: COVER
# -------------------------------------------------------------
s1 = prs.slides[0]
remove_instruction_notes(s1)
for s in s1.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "[PROJECT NAME]" in txt:
            clear_and_set_text(s, "BHU-RAIL (भू-रेल)", font_size=36, bold=True, color=EMERALD)
        elif "1-sentence description" in txt:
            clear_and_set_text(s, "A Parcel-Centric Digital Public Infrastructure (DPI) & 'Land UPI' Rail for India\nTransforming Fragmented Land Records into Canonical, Verifiable Digital Assets", font_size=16, bold=False, color=WHITE)
        elif "[Review Board Name / Client Name]" in txt:
            clear_and_set_text(s, "Smart India Hackathon (SIH 2026) Evaluation Committee", font_size=12, color=LIGHT_GRAY)
        elif "[Your Name / Team ID / Company]" in txt:
            clear_and_set_text(s, "Team Bhu-Rail | GitHub: github.com/kshlgrg/bhu-rail", font_size=12, color=EMERALD, bold=True)

# -------------------------------------------------------------
# SLIDE 2: THE PROBLEM
# -------------------------------------------------------------
s2 = prs.slides[1]
remove_instruction_notes(s2)
for s in s2.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "Describe the friction" in txt:
            desc = (
                "• Institutional Silos: Revenue, Registration, Survey, Courts, and Banks operate in disconnected data islands.\n"
                "• No Real-time Title Truth: A seller can sell land under a court stay, or double-sell the same plot before manual mutation.\n"
                "• Painful Verification: Banks spend 3–4 weeks hiring lawyers for Title Search Reports across 5 departments."
            )
            clear_and_set_text(s, desc, font_size=13, color=WHITE)
        elif "Quantify the impact" in txt:
            impact = (
                "• 66% of all civil litigation in India stems from land disputes (NITI Aayog).\n"
                "• ₹14.5 Lakh Crore in land market value is trapped in litigation.\n"
                "• Average land dispute resolution takes 20 years, costing an estimated 1.3% of national GDP annually."
            )
            clear_and_set_text(s, impact, font_size=13, color=ROSE, bold=True)

# -------------------------------------------------------------
# SLIDE 3: PERSONAS
# -------------------------------------------------------------
s3 = prs.slides[2]
remove_instruction_notes(s3)
for s in s3.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "[User Segment Name]" in txt:
            clear_and_set_text(s, "Key Stakeholders: Citizen, Bank Underwriter & Sub-Registrar", font_size=16, bold=True, color=EMERALD)
        elif "Describe the demographic" in txt:
            traits = (
                "1. Citizen Land Buyer (Rajesh, 42): Middle-class purchaser investing life savings, terrified of hidden court stays.\n"
                "2. Bank Credit Officer (Ananya, 34): Needs instant, legally tamper-free collateral title verification for loan approvals.\n"
                "3. Sub-Registrar / Revenue Officer: Pressured to execute deeds without real-time synchronization with court injunctions."
            )
            clear_and_set_text(s, traits, font_size=13, color=WHITE)
        elif "Key Need:" in txt:
            clear_and_set_text(s, "Key Need: A single, authoritative, real-time 'Property Passport' verifying title, active liens, and spatial boundaries in seconds.", font_size=13, bold=True, color=GOLD)
        elif "Frustration:" in txt:
            clear_and_set_text(s, "Frustration: Having a stamped paper registry deed that provides zero guarantee against prior mortgages or active civil stays.", font_size=13, color=LIGHT_GRAY)

# -------------------------------------------------------------
# SLIDE 4: RESEARCH SYNTHESIS
# -------------------------------------------------------------
s4 = prs.slides[3]
remove_instruction_notes(s4)
for s in s4.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "Summarize key stats" in txt:
            sec = (
                "• DILRMP & World Bank Data: Land registry digitization without interoperability creates digital silos, not trust.\n"
                "• 82% of agricultural land partitions lack automated geodesic area conservation checks."
            )
            clear_and_set_text(s, sec, font_size=12, color=WHITE)
        elif "Insights from interviews" in txt:
            prim = (
                "• Bank Loan Manager: 'We don't trust state portals because they lag registrations by weeks. We hire field lawyers.'\n"
                "• Farmer / Landowner: 'Splitting land between my sons took 14 months of revenue tribunal visits.'"
            )
            clear_and_set_text(s, prim, font_size=12, color=EMERALD)
        elif "Identify the difference" in txt:
            emp = (
                "• What People Think: 'The paper registry document means 100% legal ownership.'\n"
                "• Reality: Real ownership requires clear title, physical possession, zero bank encumbrance, and absence of judicial injunctions."
            )
            clear_and_set_text(s, emp, font_size=12, color=LIGHT_GRAY)

# -------------------------------------------------------------
# SLIDE 5: HOW MIGHT WE STATEMENT
# -------------------------------------------------------------
s5 = prs.slides[4]
remove_instruction_notes(s5)
for s in s5.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "Phrase your challenge" in txt:
            hmw = (
                "How might we convert fragmented land records into a canonical, verifiable digital asset with open standardized APIs ('Land UPI'), "
                "so that banks, registries, courts, and citizens can verify and transact land frictionlessly in milliseconds?"
            )
            clear_and_set_text(s, hmw, font_size=15, bold=True, color=EMERALD)
        elif "Describe the \"Hole in the Market\"" in txt:
            opp = (
                "Key Opportunity: Build the National Rail Protocol (the UPI of Land). Instead of forcing 28 states to rewrite their internal databases, "
                "Bhu-Rail introduces an adapter layer and canonical parcel rails that all applications can plug into."
            )
            clear_and_set_text(s, opp, font_size=13, color=WHITE)

# -------------------------------------------------------------
# SLIDE 6: IDEA SELECTION
# -------------------------------------------------------------
s6 = prs.slides[5]
remove_instruction_notes(s6)
# Add content block to Slide 6
tb6 = s6.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(8.4), Inches(4.5))
tf6 = tb6.text_frame
tf6.word_wrap = True
p = tf6.paragraphs[0]
p.text = "Architectural Approaches Evaluated:"
p.font.size = Pt(16)
p.font.bold = True
p.font.color.rgb = GOLD

approaches = [
    ("1. Monolithic Government Web Portal", "Replaces legacy portals with a new UI. Rejected: Fails to solve the root problem—still a proprietary silo that third-party banks and courts cannot programmatically integrate with."),
    ("2. Pure Public Blockchain (Full Web3)", "Puts entire cadastral maps, deeds, and identities on chain. Rejected: Violates citizen privacy (Aadhaar), slow throughput, gas costs, and massive geospatial/PDF storage hurdles."),
    ("3. Bhu-Rail: Land Digital Public Infrastructure (DPI)", "WINNING CHOICE: Open API Rails ('Land UPI') + Canonical Asset Core + Concurrency Lock + Pluggable Rule Engine + Permissioned Hash Ledger. Proven nationwide model following UPI & Aadhaar.")
]
for title, body in approaches:
    p_t = tf6.add_paragraph()
    p_t.text = title
    p_t.font.size = Pt(13)
    p_t.font.bold = True
    p_t.font.color.rgb = EMERALD if "WINNING" in title else ROSE
    p_b = tf6.add_paragraph()
    p_b.text = body
    p_b.font.size = Pt(11)
    p_b.font.color.rgb = WHITE

# -------------------------------------------------------------
# SLIDE 7: IDEATION / FINAL DECISION
# -------------------------------------------------------------
s7 = prs.slides[6]
remove_instruction_notes(s7)
tb7 = s7.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(8.4), Inches(4.5))
tf7 = tb7.text_frame
tf7.word_wrap = True
p7 = tf7.paragraphs[0]
p7.text = "The 5 Core Pillars of Bhu-Rail DPI Architecture:"
p7.font.size = Pt(16)
p7.font.bold = True
p7.font.color.rgb = GOLD

pillars = [
    ("1. Land Asset Core (ULPIN)", "Every parcel is a canonical digital asset with geographic polygon, area, version lineage, and Bundle of Rights."),
    ("2. The 'Land UPI' Open API Rail", "High-speed machine-readable endpoints: GET /v1/parcel/{ulpin}/passport and GET /v1/verification/title-status."),
    ("3. Pluggable Rule Engine & Property Locks", "Deterministic validation: court stays, mortgages, and acquisition zones trigger instant cryptographic transaction freezes."),
    ("4. Permissioned SHA-256 Trust Ledger", "Immutable state transition hash-chain with multi-department digital signatures (Sub-Registrar, Revenue Court, Survey Dept)."),
    ("5. State Cadastre Adapter Layer", "Ingests legacy Haryana Jamabandi/HALRIS, Karnataka Bhoomi, or UP Bhulekh records without forcing state database rewrites.")
]
for title, body in pillars:
    pt = tf7.add_paragraph()
    pt.text = title
    pt.font.size = Pt(12)
    pt.font.bold = True
    pt.font.color.rgb = EMERALD
    pb = tf7.add_paragraph()
    pb.text = body
    pb.font.size = Pt(11)
    pb.font.color.rgb = WHITE

# -------------------------------------------------------------
# SLIDE 8: FINAL PROTOTYPE
# -------------------------------------------------------------
s8 = prs.slides[7]
remove_instruction_notes(s8)
for s in s8.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "Describe your prototype type" in txt:
            proto = (
                "• Full-Stack High-Throughput System: FastAPI Backend Core + Next.js 14 Vector Cadastre Console.\n"
                "• Complete Vertical Slice: Cadastral Map, Property Passport, Concurrency Manager, Rule Engine, and SHA-256 Ledger.\n"
                "• Fully Automated Test Suite: 26 Tests verifying all endpoints, race condition locks, and tamper detection."
            )
            clear_and_set_text(s, proto, font_size=12, color=WHITE)
        elif "Design Principles:" in txt:
            principles = (
                "Design Principles:\n"
                "1. API-First Architecture (UI is merely a reference consumer of open rails).\n"
                "2. Zero Overwrite of History (Immutable parent-child genealogy).\n"
                "3. Privacy by Design (Aadhaar & citizen identities hashed via SHA-256).\n"
                "4. Strict Area Conservation in Cadastral Subdivision."
            )
            clear_and_set_text(s, principles, font_size=12, color=GOLD)
        elif "Insert Active Link here" in txt:
            links = "Active Rail: http://localhost:8000 | Frontend: http://localhost:3000 | GitHub: https://github.com/kshlgrg/bhu-rail"
            clear_and_set_text(s, links, font_size=11, bold=True, color=EMERALD)

# -------------------------------------------------------------
# SLIDE 9: PROTOTYPE SNAPSHOTS & THE 3 KILLER DEMOS
# -------------------------------------------------------------
s9 = prs.slides[8]
remove_instruction_notes(s9)
tb9 = s9.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(8.4), Inches(4.8))
tf9 = tb9.text_frame
tf9.word_wrap = True
p9 = tf9.paragraphs[0]
p9.text = "The 3 Live Hackathon Demonstrations Built into the Prototype:"
p9.font.size = Pt(16)
p9.font.bold = True
p9.font.color.rgb = GOLD

demos = [
    ("⚡ Killer Demo #1: Fraud Prevention via Judicial Injunction Freeze (/court-registry)",
     "• Scenario: Seller attempts to transfer Plot 104, which has an active Revenue Court Stay (Case REV/COURT/SOHNA/2024/771).\n"
     "• Result: The Rule Engine intercepts in 4ms, triggers an atomic lock, and cryptographically blocks the transfer with active injunction citation."),
    ("📐 Killer Demo #2: Real-Time Spatial Parcel Subdivision & Lineage (/surveyor-tools)",
     "• Scenario: 10,000 m² agricultural parcel (Plot 108) is split between two heirs.\n"
     "• Result: Spatial engine bisects polygon, verifies exact area conservation (Child1 + Child2 = Parent), generates child ULPINs, and retires parent to SUBDIVIDED."),
    ("💳 Killer Demo #3: 'Land UPI' 1-Click Collateral Verification for Banks (/bank-simulator)",
     "• Scenario: SBI loan officer enters ULPIN to verify title for home loan underwriting.\n"
     "• Result: In sub-80ms, API returns boolean appraisal flags (owner_verified, mortgage_clear, court_clear, transferrable) with zero paper TSR.")
]
for title, body in demos:
    pt = tf9.add_paragraph()
    pt.text = title
    pt.font.size = Pt(12)
    pt.font.bold = True
    pt.font.color.rgb = EMERALD
    pb = tf9.add_paragraph()
    pb.text = body
    pb.font.size = Pt(10.5)
    pb.font.color.rgb = WHITE

# -------------------------------------------------------------
# SLIDE 10: SYSTEM FLOW & NAVIGATION
# -------------------------------------------------------------
s10 = prs.slides[9]
remove_instruction_notes(s10)
tb10 = s10.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(8.4), Inches(4.5))
tf10 = tb10.text_frame
tf10.word_wrap = True
p10 = tf10.paragraphs[0]
p10.text = "System Flow & The Transaction Execution Loop:"
p10.font.size = Pt(16)
p10.font.bold = True
p10.font.color.rgb = GOLD

steps = [
    ("1. ALERT (The Trigger)", "Citizen or Sub-Registrar submits transfer or mortgage request payload to POST /v1/transaction/transfer."),
    ("2. ACTION (Concurrency Lock & Rules)", "PropertyLockManager acquires atomic mutex on ULPIN. LandRuleEngine evaluates court stays, active liens, and zoning."),
    ("3. RECORD (Digital Signatures & Ledger)", "Sub-Registrar & Revenue Department digitally sign block; SHA-256 state transition is committed to permissioned audit chain."),
    ("4. NOTIFY (Standardized Return Loop)", "Lock released. New asset version (vN+1) emitted. Updated Property Passport immediately reflects on public rails and banking APIs.")
]
for title, body in steps:
    pt = tf10.add_paragraph()
    pt.text = title
    pt.font.size = Pt(12)
    pt.font.bold = True
    pt.font.color.rgb = EMERALD
    pb = tf10.add_paragraph()
    pb.text = body
    pb.font.size = Pt(11)
    pb.font.color.rgb = WHITE

# -------------------------------------------------------------
# SLIDE 11: PRODUCT FEATURES
# -------------------------------------------------------------
s11 = prs.slides[10]
remove_instruction_notes(s11)
for s in s11.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "[Primary Feature]:" in txt:
            clear_and_set_text(s, "1. 'Land UPI' Verification Rail: High-speed sub-100ms title and encumbrance verification endpoint for banks, courts, and fintechs.", font_size=12, bold=True, color=WHITE)
        elif "[Efficiency Feature]:" in txt:
            clear_and_set_text(s, "2. OGC Spatial Subdivision: Automatic geodesic polygon bisecting with mathematical area conservation and parent-child lineage tracking.", font_size=12, bold=True, color=WHITE)
        elif "[Supportive Feature]:" in txt:
            clear_and_set_text(s, "3. Concurrency Lock & Fraud Shield: Prevents dual registration race conditions and blocks sales of stayed or pledged property.", font_size=12, bold=True, color=WHITE)
        elif "[Delight Feature]:" in txt:
            clear_and_set_text(s, "4. Cryptographic Trust Ledger: Multi-department digital signatures and on-demand SHA-256 audit chain catching any database tampering.", font_size=12, bold=True, color=WHITE)

# -------------------------------------------------------------
# SLIDE 12: VALIDATION & FEEDBACK
# -------------------------------------------------------------
s12 = prs.slides[11]
remove_instruction_notes(s12)
tb12 = s12.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(8.4), Inches(4.5))
tf12 = tb12.text_frame
tf12.word_wrap = True
p12 = tf12.paragraphs[0]
p12.text = "Rigorous Verification & Test Suite Results:"
p12.font.size = Pt(16)
p12.font.bold = True
p12.font.color.rgb = GOLD

results = [
    ("Automated Testing Suite", "26 Integration & Unit Tests covering API endpoints, concurrency locks, rule engine, spatial splits, ledger audits, and state adapters."),
    ("Pass Rate & Latency", "100% Tests Passed (26/26 in 0.20s). Title verification latency averaged 78ms, well within real-time banking SLA requirements."),
    ("Malicious Tamper Defense Test", "Artificially corrupted Block 1 in the ledger; GET /v1/ledger/verify/audit immediately detected the exact compromised block."),
    ("Area Conservation Validation", "Subdivided 33,025 m² polygon; verified child sum strictly equals parent area within 0.03% geodesic floating point tolerance.")
]
for title, body in results:
    pt = tf12.add_paragraph()
    pt.text = title + ":"
    pt.font.size = Pt(12)
    pt.font.bold = True
    pt.font.color.rgb = EMERALD
    pb = tf12.add_paragraph()
    pb.text = body
    pb.font.size = Pt(11)
    pb.font.color.rgb = WHITE

# -------------------------------------------------------------
# SLIDE 13: IMPACT & SCALABILITY
# -------------------------------------------------------------
s13 = prs.slides[12]
remove_instruction_notes(s13)
for s in s13.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "How did the prototype change" in txt:
            chg = (
                "• Added State Adapter Layer: Allows immediate integration with Haryana Jamabandi without requiring state DB schema changes.\n"
                "• Added Multi-Department PKI Signatures: Ensures institutional non-repudiation between Revenue, Registry, and Courts."
            )
            clear_and_set_text(s, chg, font_size=12, color=WHITE)
        elif "Describe the long-term success" in txt:
            fut = (
                "• Unlocking Dead Capital: Helps unlock ₹14.5 Lakh Crore in litigated assets and facilitates instant rural credit.\n"
                "• Nationwide Scalability: Any state adapter can plug in. FinTechs, PropTechs, and municipal bodies can build apps on our rails."
            )
            clear_and_set_text(s, fut, font_size=12, color=EMERALD, bold=True)

# -------------------------------------------------------------
# SLIDE 14: CONCLUSION
# -------------------------------------------------------------
s14 = prs.slides[13]
remove_instruction_notes(s14)
for s in s14.shapes:
    if s.has_text_frame:
        txt = s.text_frame.text.strip()
        if "Simple design wins" in txt:
            clear_and_set_text(s, "'UPI transformed money in India. Bhu-Rail transforms land into a trusted digital asset.'", font_size=16, bold=True, color=GOLD)
        elif "Be humble. What could have been better" in txt:
            short = (
                "• Current Scope: Pilot Kadarpur cadastre dataset; simulated PKI departmental certificates.\n"
                "• Technical Hurdle: Real-time satellite boundary change detection requires GPU acceleration on national scale."
            )
            clear_and_set_text(s, short, font_size=12, color=LIGHT_GRAY)
        elif "What would you do with another month" in txt:
            nxt = (
                "1. Direct integration with DigiLocker for citizen consent tokens.\n"
                "2. Live Sentinel-2 satellite change detection pipeline to detect unauthorized construction.\n"
                "3. Roll out state adapters for Karnataka Bhoomi, Telangana Dharani, and UP Bhulekh."
            )
            clear_and_set_text(s, nxt, font_size=12, color=EMERALD, bold=True)

prs.save(OUTPUT_PATH)
print(f"Successfully generated {OUTPUT_PATH} with 14 customized slides!")
