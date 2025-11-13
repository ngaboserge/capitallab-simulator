![ref1]
### **CAPITALLAB – HIGH-LEVEL TECHNICAL ARCHITECTURE SPECIFICATION** 
# Format: Plain Text (Institutional Draft) 
`  `Prepared  for:  *CMA  Innovation  Office,  Rwanda  Stock  Exchange  (RSE),  Central  Securities Depository of Rwanda (CSD), Shora Institute Governance & Technical Team, Partner Brokers & Investment Banking Institutions* 
1. ## Purpose & Institutional Mandate 
# CapitalLab  is  a  Capital  Markets  Process  Emulation  Platform  designed  by  Shora  Institute,  a community benefit institution, to train and prepare real human actors—from SMEs, universities, municipal  finance  units,  brokers,  and  investment  banking  trainees—to  operate  under  the procedural logic used by CMA, RSE, and the Central Securities Depository of Rwanda (CSD). 
# It is not a trading game, nor a paper trading app. It is structured to replicate the official journey of  a  financial  instrument—from  capital  raise intention, through advisory, regulatory review, listing authorization, investor brokerage onboarding, trade execution, and final settlement into a virtual CSD ledger. 
2. ## Market Institution Alignment 
# The platform mirrors the actual institutional flow of capital markets in Rwanda: Real Market Institution  CapitalLab Equivalent 
# CMA – Regulator / Approval Authority  Regulator  Observer  Role  (Human  actor  issues  structured ![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.002.png)
# approval or rejection messages) 
# RSE  –  Exchange  Listing  &  Matching  Virtual Listing Board & Order Validation Layer System 

Technology, Innovation & Investment Education Contact Us; <ntalea@gmail.com>, +250-78496 8343 
![ref1]
# CSD – Registry & Settlement Ledger Investment Banks / Lead Arrangers Licensed Brokers / Dealing Members Investors 
# Virtual  CSD  Ledger  (ISIN  registry,  sub-account  holdings, settlement confirmation via contract notes) 
# IB  Advisor  Role (controls structuring, filing, allocation and book-building) 
# Broker Role (gatekeeper for investor account activation and trade execution) 
# Investor  Role  (must  be  activated  by  a  broker  before execution) 

Technology, Innovation & Investment Education Contact Us; <ntalea@gmail.com>, +250-78496 8343 
![ref1]
# This alignment ensures that each user learns the correct position of power and responsibility in the capital markets, rather than directly accessing a simulated exchange. 
3. ## Role Architecture & Governance Hierarchy 
# Roles  are  strictly  enforced  by  the system. Issuers cannot bypass advisory; investors cannot bypass brokers; no actor interacts directly with the exchange layer without going through the correct intermediary, consistent with CMA and CSD procedures. 
# **Hierarchy (Top to Bottom)**  Primary Control Function ![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.003.png)![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.004.png)
# **CMA / Regulator (Simulated)**  Review and compliance enforcement 
# **RSE Listing Desk (Simulated)**  Decision to approve listing and trigger Virtual ISIN **CSD (Simulated Ledger System)**  Ownership ledger – final authority of settlement **Investment Bank / Lead Advisor (Human**  Controls structuring, filing, pricing, allocation 
# **Actor)** 

Technology, Innovation & Investment Education Contact Us; <ntalea@gmail.com>, +250-78496 8343 
![ref1]
# **Broker / Dealer (Human Actor) Investor (Human Actor)** 
# **Issuer (Human Actor)** 
# Activates investor accounts, executes trades Expresses interest and executes trades via broker 
# Provides intention and responds to due diligence requests only 

Technology, Innovation & Investment Education Contact Us; <ntalea@gmail.com>, +250-78496 8343 
![ref1]
# Principle: CapitalLab does not allow direct issuer-to-market or investor-to-exchange interaction. All market entry is mediated through correct institutional roles. 
4. ## Capital Raise Intent & IB Assignment Layer 
- Issuers only express intent to raise capital via a Capital Raise Intent (CRI) submission. 
- After CRI, the system assigns or matches an IB Advisor to the issuer. 
- Once matched, control is transferred to the IB Advisor, who becomes the responsible party for all subsequent regulatory-facing actions. 
- The  issuer  remains  in  a  “Respond  to  Due  Diligence  Requests”  mode  rather  than a structuring or filing role. 
# This  reflects  the  real-world  mandate  where  no  company  lists  themselves;  all  listings  are packaged by licensed advisors. 
5. ## Due Diligence & Prospectus Structuring Flow 
- IB Advisor opens Due Diligence Requests (KYC, financials, projections, risk statements). 
- Issuers upload responses and documents. 
- Once documentation is complete, the IB uses Prospectus Builder Module to create a structured  filing  aligned  with  CMA  prospectus  section  logic  (risk  disclosure, coupon/maturity terms, covenant declarations, trustee confirmations). 
6. ## Regulatory Review Emulation (CMA Simulation Layer) 
- Regulator Observer Role receives filings. 
- The observer issues structured rejection or acceptance notices, referencing CMA-style rule codes (e.g., *“Missing Section 4.2 – Risk Disclosure”*). 
- Submission cannot proceed without respecting the rejection/resubmission cycle. 
7. ## Virtual ISIN Assignment & Listing Registration 
# Once approved: 
- Listing Desk Role issues a Virtual ISIN (example: *RWA-SME-2025-001*). 
- The  system creates a registry entry marking the creation of the instrument under a Virtual CSD ledger environment. 
- The instrument is marked as “Listed” and becomes visible on the Virtual Market Board for potential trading. 
8. ## Virtual CSD Ledger & Settlement Simulation 
- The CSD layer is the final authority in CapitalLab, just like in real markets. 
- Investor accounts live inside broker-controlled sub-accounts. No investor holds a direct CSD ledger entry without broker mediation. 
- Settlement orchestration mirrors RSE → CSD → BNR logic, but only as an educational sequence: 
- Trade is matched on the Virtual Board. 
- Ledger  updates  unit  balances  between  seller  sub-account  and  buyer sub-account. 
- A mock contract note is issued, containing ISIN, units, matched price, timestamp, and signature hash. 
# Teaching  principle:  *A  trade  is  not  “complete”  because  an  order  matched.  It  is “complete” only when the CSD ledger updates.* 
9. ## Broker Activation & Investor Trading Access 
- Investors do not have instant market access. 
- Just like in the real RSE ecosystem, they must request activation by a licensed broker. 
- Broker approves/rejects investor linkage in the Investor Activation Panel. 
- Only after approval can the investor place: 
- Self-executed limit orders, or 
- Agency execution orders (broker executes the trade on their behalf). 
10. ## Order Validation Rules 
# All orders are human-entered and enforced by a Rule Engine: 
# Rule  Simulation Enforcement ![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.005.png)![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.006.png)
# Tick Size Compliance  Price must move in fixed RWF steps (e.g., increments of 5) Price Band Limits  Orders cannot exceed ±% of last session price 
# Circuit Breaker Simulation  Instrument halts temporarily if price breaches threshold 
# Limit Orders Only  Market orders are disabled for educational discipline Each rejection returns a compliance-style code, teaching regulator and broker language. 
11. ## Book-Building & Allocation (Optional Module Under IB Control) 
- IB may open a Book-Building Phase where investors express non-binding indications of interest (IOI). 
- IB manually allocates units before listing goes live. 
- This simulates real allocation behavior in bond issuance and IPOs. 
12. ## Educational Artifacts & Audit Trail 
# For every key market interaction, CapitalLab produces official-style artifacts: 
# Action  Artifact Generated ![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.007.png)![](Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.008.png)
# ISIN Assignment  Virtual ISIN Certificate PDF 
# Listing  Listing Notice PDF 
# Trade Settlement  Contract Note with reference hash End-of-Session  Investor Ledger Statement 
# All files are watermarked: 
# **"EDUCATION SIMULATION – NO REAL MONEY / NO REGULATORY EFFECT"** 
13. ## Governance & Compliance Principles 
- Human decision-making only — no automated traders, no price simulation bots. 
- System enforces discipline, not speculation. 
- All actions logged with user role, timestamp, reference code—mirroring how real market surveillance systems log trade flows. 
14. ## Extension Path – Future Instruments & Modules 
# The architecture allows future educational expansion into: 
- Municipal Bonds & Public Infrastructure Notes 
- Green Financing & Climate Bonds (aligned with AfDB and CMA Green Capital Agenda) 
- Asset-Backed Securities (ABS) and Cooperative Loan Pooling Modules 
- Pension Fund Simulation Track linked to RSSB long-term allocation logic 
# **CapitalLab Virtual CSD (vCSD) – Architecture & Flow** 
1) ## Components (at a glance) 
- vCSD Registry — master record of simulated instruments and their virtual ISINs. 
- Sub-Accounts Ledger — investor holdings per instrument, nested under a Broker link (no direct “retail → vCSD” access). 
- Settlement Orchestrator — receives matched trades from the Market Board and applies DVP-style (delivery-versus-payment) logic in simulation. 
- Corporate Actions Engine — schedules coupon/dividend/redemption events and posts ledger changes. 
- Reports  &  Statements  —  investor  statements,  contract  notes,  regulator/instructor extracts (PDF/CSV), watermarked EDUCATION ONLY. 
- Audit & Evidence — immutable log of actions (who did what/when), plus signed hashes for PDFs. 

  Human roles only: Issuer → IB Advisor → Listing Desk → Broker → Investor. The system enforces rules and produces official-looking artifacts, but never automates market decisions. 

  [SHORA MARKETS ENGINE](https://drive.google.com/file/d/1MOxYylFYnABXYqvwjAiF8-BKCXlj_SOp) [SHORA Markets -CapitalLab ](https://drive.google.com/file/d/1oXK6M4xVHqSNdWxfKZiYMhjaZTvH2REVjtHbjbaxZeE)
2) ### End-to-End Lifecycle (mirrors real CSD) Phase A — Instrument creation & virtual ISIN 
1. Issuer expresses intent (no structuring). 
1. IB Advisor assigned; completes due diligence and drafts the prospectus/terms. 
1. Regulator Observer reviews; on approval, Listing Desk creates the instrument in vCSD. 
1. vCSD Registry issues Virtual ISIN (e.g., RWA-SME-2025-001) and opens an issuer register (authorized units). 
- Artefact: ISIN Certificate (PDF) + registry entry. 
### Phase B — Investor access via Broker 
5. Investor requests Broker linkage; Broker approves (KYC simulation). 
5. vCSD opens an Investor Sub-Account under that Broker. Constraint: No trades without an active Broker link. 
### Phase C — Trade → Simulated settlement (DVP) 
7. Investors place manual LIMIT orders; the Market Board matches price-time priority. 
7. Settlement Orchestrator consumes each match: 
- Validates tick size, price bands, circuit breakers (halt if breached). 
- Debits seller units / credits buyer units in Sub-Accounts Ledger. 
- Posts a cash leg marker (educational—no real money). 
9. Generates a Contract Note (PDF) for both sides and appends an Audit hash. 

   In education terms: a trade isn’t “real” until the vCSD ledger updates—this mirrors the real-world “ownership lives at the CSD” principle. 
### Phase D — Post-trade & corporate actions 
10. Investor Statements (holdings by ISIN), Broker client views, Instructor cohort exports. 
10. Corporate Actions Engine (when configured): 
- Bonds: coupon run / principal redemption (reduces holding, posts cash marker). 
- Equities: dividend record date / entitlement posting. 
- All events produce notices and ledger entries. 
3) ## Data objects (analyst view) 
- Instrument: { isin, name, type, face\_value, authorized\_units, coupon, freq, day\_count, maturity } 
- Sub-Account: { investor\_id, broker\_id, balances[{ isin, units }] } 
- Trade (matched): { trade\_id, isin, price, qty, buyer\_id, seller\_id, ts } 
- Ledger  Entry:  {  entry\_id,  sub\_account,  isin,  delta\_units,  reason (TRADE/ALLOT/REDEEM/DIVIDEND), ref\_id, ts } 
- Corporate Action: { action\_id, isin, type (COUPON/DIVIDEND/REDEMPTION), schedule, rate/amount, run\_ts } 
- Artifacts:  contract\_note.pdf,  holding\_statement.pdf,  each  with  sha256  and  EDU watermark. 
4) Control points & rules (mapped to user messages) Listing / creation 
- ISIN\_ASSIGNED: “Virtual ISIN created: RWA-SME-2025-001; instrument listed to board.” 
- SUBMISSION\_NOT\_ALLOWED\_FOR\_ISSUER: “Only IB Advisors file on behalf of issuers.” 

Access / brokerage 

- TRADING\_NOT\_PERMITTED\_NO\_BROKER\_ASSIGNED:  “Activate  your  account  via  a licensed Broker to trade.” 

Order & market integrity 

- ORDER\_TYPE\_NOT\_ALLOWED: “Only LIMIT orders permitted in this simulation.” 
- TICK\_SIZE\_VIOLATION: “Price must move in steps of {tick\_size}.” 
- PRICE\_BAND\_BREACH: “Order {p} outside ±{band}% of reference {ref}.” 
- CIRCUIT\_BREAKER\_TRIGGERED: “Instrument halted for {N} minutes after {x}% swing.” [ SHORA MARKETS ENGINE ](https://drive.google.com/file/d/1MOxYylFYnABXYqvwjAiF8-BKCXlj_SOp)

Settlement / ledger 

- LEDGER\_UPDATED: “Trade settled. {qty} units of {ISIN} credited to your sub-account.” 
- CONTRACT\_NOTE\_ISSUED: “Your PDF contract note is ready.” 
- STATEMENT\_AVAILABLE: “End-of-session holdings statement generated.” 

Corporate actions 

- COUPON\_POSTED: “Coupon accrued at {rate}; cash marker posted.” 
- DIVIDEND\_ENTITLEMENT: “Dividend entitlement recorded as of {record\_date}.” 
5) ## Interfaces (what users see) 
IB Advisor 

- Create instrument → request listing → (auto) virtual ISIN → publish to board. 

Listing Desk 

- Approve → “Create instrument in vCSD” action → see ISIN + registry. 

Broker 

- Approve Investor link → manage client orders (agency or self-directed support) → view client statements. 

Investor 

- Request Broker link → place orders → receive Contract Notes and Holdings Statements 

Instructor / Regulator-Observer 

1. Cohort dashboard → audit trail viewer → export CSV/PDF for class or review. 
6) ## Non-functional safeguards 
   1. Human-only actions: no market-making bots or auto-allocations. 
   1. Deterministic test modes: replay a session for classroom use. 
   1. Evidence discipline: all PDFs hashed; all actions logged with role, time, IP. 
   1. Privacy: training data only; no live issuer financials. 
   1. Watermarks everywhere: EDUCATION SIMULATION — NO REAL MONEY. 


Technology, Innovation & Investment Education Contact Us; <ntalea@gmail.com>, +250-78496 8343 

[ref1]: Aspose.Words.f7490b03-42fa-40c8-85fc-7814c62835fd.001.png
