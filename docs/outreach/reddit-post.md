# Reddit Post

**Target subreddit:** `r/LocalLLaMA`  
**Fallback:** `r/PromptEngineering`

---

**Title:** I built a frozen-artifact replay setup for LLM judges and found directional family bias. Am I missing an obvious confound?

---

**Body:**

I've been working on an LLM-as-judge pipeline for a PM agent toolkit, and I hit a result that felt weird enough that I stopped trusting my own intuition.

I gave Claude and GPT the same 13 debates to judge.

Same arguments. Same rubric. Same prompt.

Claude leaned heavily toward one side.
GPT leaned heavily toward the other.

That made me worry I was measuring judge family preference more than artifact quality.

So I changed the setup to try to isolate the judge effect more cleanly.

## The methodological move that helped most

I added **frozen-artifact replay**.

Instead of regenerating the debating sides every time, I:

1. run one debate to completion
2. freeze the saved `verdict.prompt.txt` and `verdict.input.json`
3. replay new judges against the exact same artifact bundle

That way, if the verdict changes, it's not because the debaters changed. It's judge variance.

That turned out to be much more useful than just rerunning full debates.

## What I found

A few things survived the controls:

- Claude and GPT showed opposite directional lean on the same scenario set
- Gemini was genuinely distinct rather than redundant
- Gemini often reasoned sensibly about evidence discipline / consistency, but sometimes still named `decision_usefulness` as the decisive dimension
- one contradiction case (`handoff-contradiction`) looks like a real repeatable bias canary

But the broader "Gemini always collapses to decision usefulness" story did **not** survive repeatability. The effect got narrower once I ran repeated frozen replays.

## The most interesting part to me

The weirdest outcome wasn't just different winners.

It was that the judges seemed to have different ideas of what kind of strength mattered most:

- evidence discipline
- decision usefulness
- responsiveness to critique

That makes me think a lot of LLM-as-judge setups are hiding a model-family value system inside what looks like a neutral evaluation layer.

## Why I'm posting

Two reasons:

1. I think the frozen-artifact replay pattern might be useful for other eval setups.
2. I want people to poke holes in this before I get too attached to the conclusions.

## Where I think the work is still weak

- Small scenario set
- Not every comparison is artifact-matched
- Gemini has heavy repair dependence in the richer schema path
- I still don't know the best baseline for deciding when a decisive-dimension concentration is "bias" versus just a property of the rubric

## The concrete question

If you were trying to validate or falsify this result, what would you do next?

In particular:

- Is frozen-artifact replay the right control here?
- What confound am I most likely still missing?
- How would you test whether a judge's "decisive dimension" is a real reasoning signal versus a post-hoc label habit?

If useful, I can share:

- the verdict schema
- the replay scripts
- the artifact-matched three-family comparison
- the repeatability results

I'm less interested in "which model won" than in whether this is a sane way to evaluate judges at all.
