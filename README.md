# Wyatt Brocato

**Product and technical program manager building practical systems for
Customer Success, professional workflows, and evidence-led decisions.**

I turn ambiguous operating problems into bounded products: define the decision,
make the evidence inspectable, ship the smallest useful workflow, and keep human
judgment at the final gate.

[Portfolio](https://wyattbrocato.site/) ·
[LinkedIn](https://www.linkedin.com/in/wyattbrocato/) ·
[The AI Business Playbook](https://ai-business-playbook-subscribe.netlify.app/)

## Start with the proof

### csm-kit: source-cited Customer Success briefs

![csm-kit: evidence-cited Customer Success briefs from exports you already
have][csm-banner]

An offline, dependency-free Node.js CLI that turns CRM, ticket, and usage
exports into renewal, handoff, and QBR briefs. Every factual line cites its
source row; unsupported facts fail closed into an evidence-gap checklist.

**Status:** shipped · **Proof:** [generated renewal brief][csm-output] ·
**Source:** [GitHub][csm-kit] · **Setup:** Node.js 18+, no service credentials

### More public products

#### [5-Task Swap][task-swap]

A four-decision diagnostic that turns one recurring task into an explained fit
assessment and a bounded 15-minute experiment. Answers remain in the browser.
**Status:** live product · no login required

#### [Subscribe Page][subscribe]

A focused acquisition surface for a weekly practical-AI newsletter, with the
offer and consent expectations visible before signup. **Status:** live product ·
source not public

#### [Personal site][website]

A cohesive product narrative connecting the operating method, worked example,
diagnostic, and newsletter. **Status:** live product · source not public

#### [Scam First Aid][scam-first-aid]

A browser-only post-scam triage wizard, ordered action plans, and family
conversation scripts. User input never leaves the device. **Status:** shipped ·
[live site][scam-live] · public source

#### [AI Leverage Field Guide][field-guide]

Interactive, role-based workflow guides with local progress tracking and
explicit human review boundaries. **Status:** shipped ·
[live guide][field-guide-live] · public source

## Current build portfolio

Public availability varies across the current portfolio. I do not link private
repositories or present work as open source without a verifiable public source.

- **CSE Command Center**: a Customer Success efficiency-and-scale operating
  workspace. No public source or verified live link is listed here.
- **Wizard101 Battle Advisor**: a battle-planning assistant built around clear,
  reviewable recommendations. No public source or verified live link is listed.
- **CCFT**: a current build without a public source or write-up listed here.
- **Developer bootstrap**: repeatable developer-environment setup work; the
  implementation does not currently have a public source link here.

These projects belong in the portfolio narrative, but not in GitHub's pinned
repositories until a durable public source or demo exists. See the
[pinning rationale](PINNING.md) for the current recommendation.

## Public engineering work

### csm-kit architecture

![Account YAML and CRM, ticket, and usage CSV exports pass through schema
validation and rendering to produce a source-cited brief; unsupported facts
fail closed][csm-architecture]

```console
git clone https://github.com/thewyattbrocato/csm-kit
cd csm-kit
npm install -g .
csmkit brief \
  --account examples/acme/account.yaml \
  --crm examples/acme/crm.csv \
  --tickets examples/acme/tickets.csv \
  --usage examples/acme/usage.csv \
  --as-of 2026-08-22 \
  --out brief.md
```

The public repository includes behavior tests, reproducible examples, an MIT
license, and a committed browser-demo implementation.

### Other public repositories

- **[Scam First Aid][scam-first-aid]**: vanilla JavaScript, content-as-data,
  official-domain validation, plain-language checks, and headless-browser tests.
- **[AI Leverage Field Guide][field-guide]**: an accessible static learning
  product with link checking and local-only interactive state.
- **[Leverage Library][leverage-library]**: a generated, sourced idea library
  with fail-closed source rules and committed static output.

## GitHub and GitLab

I am moving public work back to GitHub after a period of working from GitLab.
That transition is in progress: the public GitHub account is active again, but
it is **not yet a complete mirror of every project**. The public links in this
README are the projects and product surfaces that can be verified today.

For transition history, my public GitLab profile is
[gitlab.com/wcbrocato](https://gitlab.com/wcbrocato). New GitHub mirrors will be
linked here only after their public source and documentation are ready.

## Working principles

- **Evidence before confidence:** make inputs, assumptions, and gaps inspectable.
- **Bound the assist:** use automation for structure and repetition; keep
  context, risk, and approval human.
- **Ship proof:** pair product claims with a live surface, runnable example, or
  public source.
- **Protect trust:** do not publish private source, confidential data, or
  invented impact metrics.

[csm-architecture]: https://raw.githubusercontent.com/thewyattbrocato/csm-kit/main/docs/assets/how-it-works.svg
[csm-banner]: https://raw.githubusercontent.com/thewyattbrocato/csm-kit/main/docs/assets/banner.svg
[csm-kit]: https://github.com/thewyattbrocato/csm-kit
[csm-output]: https://github.com/thewyattbrocato/csm-kit/blob/main/examples/example-renewal-brief.md
[field-guide]: https://github.com/thewyattbrocato/ai-leverage-field-guide
[field-guide-live]: https://thewyattbrocato.github.io/ai-leverage-field-guide/
[leverage-library]: https://github.com/thewyattbrocato/leverage-library
[scam-first-aid]: https://github.com/thewyattbrocato/scamfirstaid
[scam-live]: https://thewyattbrocato.github.io/scamfirstaid/
[subscribe]: https://ai-business-playbook-subscribe.netlify.app/
[task-swap]: https://ai-business-playbook-task-swap.netlify.app/
[website]: https://wyattbrocato.site/
