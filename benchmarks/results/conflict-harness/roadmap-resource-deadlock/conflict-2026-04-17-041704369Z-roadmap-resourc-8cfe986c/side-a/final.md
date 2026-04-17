# Resource Allocation Recommendation: Roadmap Deadlock

## Decision Frame

Two SVP-level initiatives require exclusive access to the same engineering team during the same planning window. Both sponsors assert top-tier business priority. CEO escalation is unavailable this quarter. The decision cannot be deferred indefinitely: without a resolution, both initiatives will slip, the engineering team will operate under conflicting directives, and neither sponsor will have the clarity needed to manage their downstream dependencies.

The viable resolution space has exactly three shapes:

1. **Sequencing** — one initiative proceeds first; the second is scheduled to begin when the first reaches a defined milestone or release gate. This preserves team focus and produces at least one outcome on time.
2. **Scoped split** — each initiative receives a defined, non-overlapping subset of the team's capacity, with explicit scope reductions agreed in writing by both sponsors. This is only viable if the work is genuinely parallelizable without coordination overhead exceeding the capacity saved.
3. **Mutual deferral with joint re-prioritization** — both sponsors agree to a structured tiebreaker process (criteria-based scoring, third-party facilitation, or a defined SVP-peer review) and both initiatives slip by a bounded, agreed amount while that process runs.

Option 1 is the default recommendation unless evidence of true parallelizability is produced. Splitting attention across competing priorities without scope reduction is not a fourth option — it is the failure mode the other three options exist to prevent.

**Framing constraint for the sequencing decision:** Since neither sponsor can unilaterally yield, the sequencing choice must be grounded in at least one of the following criteria, applied jointly:
- Externally imposed deadline (customer commitment, regulatory date, contractual milestone)
- Dependency asymmetry (one initiative is a prerequisite or enabler for the other)
- Reversibility asymmetry (one initiative's delay creates compounding costs; the other's does not)
- Team fit (the engineering team has a skills or context advantage on one initiative that would not transfer to the other without ramp cost)

---

## Unknowns & Evidence Gaps

The following unknowns block a confident **sequencing** recommendation. They do not block a process recommendation — a governance intervention can and should be issued immediately from the facts already in hand (two deadlocked SVP sponsors, one team, no CEO path this quarter). The evidence gaps below determine which option resolves the deadlock; they are not a prerequisite to starting the resolution process.

1. **External deadline existence and asymmetry.** Do either or both initiatives have a hard external deadline (customer contract, regulatory requirement, board commitment)? If one does and the other does not, that initiative sequences first without further debate.

2. **Dependency map between initiatives.** Is either initiative a technical or product prerequisite for the other? A dependency relationship resolves the sequencing question structurally.

3. **Scope decomposability.** Can either initiative be meaningfully descoped to a phase that requires fewer resources, enabling a genuine split without coordination overhead? Neither sponsor can assert this credibly without a written scope reduction they are willing to commit to.

4. **Delay cost asymmetry.** What is the cost of a material slip for each initiative? If one sponsor can quantify impact and the other cannot, that is a differentiating input.

5. **Engineering team context and ramp cost.** Does the team have existing context, architecture ownership, or prior work on one initiative that would be lost or require rebuilding if the other initiative were scheduled first?

6. **Parallel facilitation path.** Is there a peer-level governance body (e.g., a product and engineering leadership forum, a portfolio steering committee) that can run a structured tiebreaker without CEO involvement? If yes, Option 3 becomes viable.

---

## Pass/Fail Readiness

**Process recommendation: READY to issue immediately.**

The visible facts — deadlocked SVP sponsors, exclusive resource conflict, no CEO path this quarter — are sufficient to issue a governance intervention now. The next artifact (below) does not require closing the evidence gaps first; it is the mechanism by which those gaps get closed in a structured, time-boxed way.

**Sequencing recommendation: NOT READY without minimum viable evidence.**

A direct sequencing call (Initiative A before Initiative B) cannot be issued durably without at least unknowns 1 and 4. Without them, any sequencing choice is arbitrary and will not survive challenge by the sponsor whose initiative is deprioritized — forcing informal re-escalation that defeats this process. The process recommendation buys the time to collect that evidence in parallel.

**What this recommendation can already commit to:**
- Splitting the team without agreed scope reductions is ruled out as a viable path.
- CEO escalation being unavailable does not mean governance escalation is unavailable — a peer SVP review or portfolio steering committee review is a legitimate resolution path and should be confirmed available or unavailable before defaulting to sequencing.
- Whichever initiative sequences second must receive a written commitment on start date and scope before the first initiative begins. Ambiguous "after" commitments are not acceptable to a sponsor being asked to yield.

---

## Recommended Next Artifact

**Artifact:** SVP Sponsor Input Template — a structured one-page evidence brief that each sponsoring team completes independently, covering: external deadline existence and source, dependency relationships to the other initiative, scope reduction options they are prepared to commit to, and quantified delay cost. Both briefs are submitted to a neutral facilitator (Chief of Staff, VP Engineering, or portfolio steering committee) within five business days.

**Why this artifact next:** The deadlock is not caused by a shortage of priority opinions — it is caused by a shortage of structured, comparable evidence. Issuing this template is a process intervention that can begin immediately without waiting for the evidence it will collect. A shared input template forces both sponsors to answer the same questions on the same terms, which either surfaces an asymmetry that resolves sequencing or confirms that a structured peer-review process is required. Either outcome is progress. Issuing a sequencing recommendation without this evidence would assign priority by whoever argued most forcefully, which is not a defensible process.
