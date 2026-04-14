# LinkedIn Post

I thought the weird part of building an LLM evaluation harness would be the engineering.

It wasn't.

The weird part was realizing the "judge" wasn't neutral.

I gave Claude and GPT the same 13 debates to judge. Same arguments. Same rubric. Same prompt.

Claude picked side B in 9 of 13.
GPT picked side A in 8 of 13.

That really surprised me. I expected noise. What I found looked more like judge personality.

So I did what my biology training taught me to do when something feels off: I started running controls.

- Frozen-artifact replay, so judge variance wasn't mixed up with generation variance
- Artifact-matched comparison, so Claude, GPT, and Gemini saw the exact same inputs
- Repeatability runs, so I could separate house style from one-shot noise
- Rationale inspection, so I could see whether the explanation matched the verdict

The conclusion I feel confident in now:

- single-model judges are not neutral
- disagreement between judge families is real signal, not just nuisance
- triple-panel evaluation is probably an escalation, not a default
- ties should be useful workflow events: "what evidence would help us decide?"

The part I still can't get over is how *alive* the whole thing feels. You don't just get three answers. You get three different ideas of what counts as a good answer.

I'm sharing the write-up because I suspect a lot of us are quietly building on top of "LLM-as-judge" without really knowing what our judge is biased toward.

If you're doing anything similar, I'd genuinely love to compare notes, especially if you think my methodology is weak or my conclusions are over-claimed.

Full write-up and repo below.

[Medium link]

#LLM #AIEvals #OpenSource #ProductManagement #AIEngineering
