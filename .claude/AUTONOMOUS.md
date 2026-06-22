# Autonomous Run Mode

This project is being built in a single unattended run. The user is NOT available to
answer questions mid-run. Override CLAUDE.md §1's "stop and ask" guidance as follows:

## Proceed-under-uncertainty rule

- Do NOT pause to ask the user clarifying questions. The specs in `/docs` (00–11) and
  `CLAUDE.md` are the source of truth and are detailed enough to proceed.
- When something is ambiguous: choose the **simplest interpretation consistent with
  the specs**, state the assumption inline in your summary, and continue.
- Only HALT the run (and clearly say why) if continuing would: delete user data,
  require a credential/secret you don't have, contradict a non-negotiable rule with
  no compliant path forward, or fail the build in a way you cannot self-correct.

## Self-correction loop (instead of asking)

- After each step, run the verify gate (`npm run build`, and chrome-devtools visual
  check for refraction/visual changes).
- If a gate fails, diagnose and fix it yourself; retry up to 3 times before halting
  with a precise description of the blocker.

## Logging instead of approval

- Keep a running build log in `BUILD_LOG.md` at the repo root: each step, the agent,
  the verify result, and any assumption you made. This replaces step-by-step approval
  so the user can review the whole run afterward.

## Boundaries still apply

- All architecture boundaries and non-negotiable domain rules in CLAUDE.md remain in
  force. Autonomy changes WHETHER you pause, never WHAT the rules are.
- Do not edit `.claude/**`, `CLAUDE.md`, or `.mcp.json` (also enforced by settings).
