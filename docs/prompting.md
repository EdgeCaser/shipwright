# Prompting for Shipwright

Shipwright is not "better prompting." It is a quality system *around* prompting. That framing is in the README for a reason: most of the leverage in PM work with AI comes from structure, evidence discipline, and gating, not from clever wording.

But there is a fair point sitting underneath that framing. The seam between your natural-language request and a Shipwright skill is itself a prompt. The skill can only run on what you give it. So the prompt you type still matters, just not as the whole game.

This guide covers two things:

1. What makes any prompt to an AI assistant strong.
2. What makes a *Shipwright* prompt strong, which is a different question.

## The golden rule

Anthropic's prompting docs put it best: **show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, the model will be too.** Most prompt failures are not subtle. They're prompts that a smart human couldn't act on either.

## What makes a strong prompt (general)

A prompt is a contract. Six elements make the contract executable:

| Element | What it answers | Common failure |
|---|---|---|
| **Intent** | What outcome do I want? | "Tell me about pricing," with no outcome named |
| **Context** | What does the assistant need to know that it can't see? | Dropping the request with no product, customer, or stage context |
| **Constraints** | What must be true of the answer? | Length, audience, format left implicit |
| **Output shape** | What does "done" look like as an artifact? | "Give me thoughts" instead of "give me a one-page memo with a recommendation" |
| **Success criteria** | How will I know it's good? | No way to tell a strong answer from a fluent one |
| **Permission to be uncertain** | What should the model do when it doesn't know? | Forcing a confident answer when the honest one is "I'm guessing" |

That last row is the 2026 update. The single most reliable way to reduce hallucinations is to give the model explicit permission to say "I don't know" or "this is a hypothesis, not evidence." It's also the row that maps most directly onto Shipwright's evidence discipline.

### Weak vs strong (general)

**Weak:**
> Help me think about whether to expand into the enterprise segment.

**Strong:**
> I'm a PM at a mid-market SaaS company. We're considering an enterprise expansion next quarter. I have win-rate and pipeline data for SMB and mid-market but not enterprise. Write a one-page decision memo for my CEO that recommends a path, names the biggest evidence gap, and lists three questions I should answer before committing. Audience is a non-technical exec. Default to direct prose, not bullet-soup. If anything in the recommendation is a guess rather than a finding, label it as a hypothesis.

The strong version names the artifact, the audience, the evidence state, the success criteria, *and* gives the model permission to flag its own uncertainty. The assistant can now produce something gradeable.

### A note on long-context prompts

When you're feeding the assistant a lot of evidence (interview transcripts, support tickets, competitor pages, a backlog dump), order matters. Put the long material at the *top* of the prompt and your actual question at the *bottom*. Anthropic's testing shows this can improve response quality by up to 30% on multi-document tasks. If you're asking the model to draw conclusions from the corpus, also ask it to quote the relevant passages first, then reason from those quotes. This is most of what "evidence discipline" actually looks like in practice.

## What makes a strong *Shipwright* prompt

Shipwright adds three things to general prompting:

1. **It routes to skills and workflows.** Your prompt doesn't have to teach the assistant what a PRD looks like, because `skills/` already does. What your prompt has to do is point at the right skill or let the orchestrator pick.
2. **It enforces evidence discipline.** Skills require sourced claims and explicit unknowns. Your prompt earns its keep by seeding what evidence you actually have, and being honest about what you don't.
3. **It gates on pass/fail criteria.** The output is checked against `evals/pass-fail.md` before scoring. Your prompt should respect those gates. If you're not ready to commit to a decision, ask for the discovery step, not the PRD.

Three rules that follow from this:

### Rule 1: Name the artifact or decision, not the topic

Topic prompts produce essays. Artifact prompts produce work products.

**Weak:** *"Let's talk about our onboarding."*
**Strong:** *"Run /discover on our onboarding drop-off. Customer evidence: 14 support tickets and 6 user interviews from last month, all in the linked doc. The decision I need to make is whether to invest in a guided tour or rebuild the empty state. Treat the empty-state hypothesis as untested."*

Naming the workflow (`/discover`), the evidence, the decision, and the hypothesis status gives Shipwright everything it needs to route to the right skill and meet the evidence bar.

### Rule 2: Surface what you have *and* what you don't

Shipwright distinguishes evidence from inference. If you don't tell it what's evidence and what's gut feel, it has to guess, and the gates fail loudly when it guesses wrong.

**Weak:** *"Customers want better reporting."*
**Strong:** *"Three enterprise prospects in the last two weeks asked for scheduled exports during sales calls (sourced: call notes in the linked folder). I'm extrapolating that this is a broader segment need but I don't have quantitative data. Treat the segment claim as a hypothesis, not a finding."*

This is the same discipline the skills enforce internally. Doing it in your prompt means the artifact comes back honest the first time.

### Rule 3: Pick a path, or let the orchestrator pick

Shipwright has three common paths (New Feature, Quarterly Planning, Launch; see the README). Either name the workflow or describe the job clearly enough that the orchestrator can pick. What kills throughput is half-naming a workflow and then negotiating it down mid-run.

**Weak:** *"Do a strategy thing but also a sprint thing, and maybe a PRD."*
**Strong:** *"This is a launch path. Run /strategy first, then /plan-launch, then /sprint. Don't start the next workflow until I confirm the previous artifact."*

Or, if you genuinely don't know:

> *"I have customer signals piling up and a quarterly plan due in three weeks. Help me pick the right path."*

That's a legitimate routing prompt. The orchestrator can answer it.

## Anti-patterns

- **Vibe prompts.** "Make this great." Greatness is not a contract. Apply the colleague test.
- **Conflicting instructions.** "Make it short but cover everything, technical but accessible, decisive but balanced." Both Anthropic and OpenAI now flag contradiction as one of the top failure modes. Modern reasoning models burn cycles trying to satisfy directives that can't both be true. Audit your prompt for competing instructions before sending.
- **Telling the model what *not* to do, when you could tell it what to do.** "Don't use markdown" is weaker than "use prose paragraphs." "Don't be verbose" is weaker than "keep the answer to under 200 words." Positive specs beat prohibitions.
- **Asking for the artifact without the decision.** "Write me a PRD" with no decision named produces a beautifully-formatted nothing.
- **Hiding the evidence state.** Pretending you have data you don't, or pretending you don't have data you do. Both bend the artifact in ways that fail review.
- **Asking for analysis when you want action.** "Can you suggest some changes to the PRD?" gets you suggestions. "Make these edits to the PRD" gets you the edited PRD. Be explicit about whether you want the artifact or commentary on the artifact.
- **Negotiating the gates.** "Skip the pass/fail check, just give me the memo." The gates exist because the memo is going to a human who will treat it as decision-ready. Bypassing them ships work that isn't.

## Where prompts live inside Shipwright

The prompt you type is the outer layer. Inside Shipwright, agents prompt other agents. The orchestrator (`agents/orchestrator.md`) dispatches specialist agents with structured prompts that name the role, the inputs, and the required output fields. The red-team agent (`agents/red-team.md`) is itself a prompt template with attack vectors and severity rubrics built in.

This is the honest version of "does prompting matter?" Yes, and a *system* of prompts, with role constraints and pass/fail gates between them, beats a single clever prompt every time. The industry has been moving in this direction openly. Anthropic, OpenAI, and Google's developer guidance for 2026 all describe the shift from prompt engineering to **orchestration**: sub-agents as microservices, supervisors that route, structured tool use, evaluable outputs. Shipwright is one implementation of that shift, focused on PM and business work. Your prompt to Shipwright is one node in that system. Make it a good one and the rest compounds.

## See also

- [Output standard](output-standard.md): what every Shipwright artifact has to look like
- [Workflows guide](using-workflows.md): full list of commands and the paths they chain into
- [Composition model](composition-model.md): how skills, workflows, and agents fit together
- [Pass/fail gates](../evals/pass-fail.md): the binary checks every artifact has to clear

### External references

The guidance above is consistent with current vendor documentation as of April 2026:

- [Anthropic, Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Anthropic, Use XML tags to structure your prompts](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/use-xml-tags)
- [OpenAI, GPT-5 prompting guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide)
- [OpenAI, Prompt guidance](https://developers.openai.com/api/docs/guides/prompt-guidance)
- [Google Developers, 5 tips from the Agent Bake-Off](https://developers.googleblog.com/build-better-ai-agents-5-developer-tips-from-the-agent-bake-off/)
