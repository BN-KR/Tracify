---
name: hog-release-notes
description: Write PostHog release notes from recent merged changes. Use when the user asks to draft, generate, or update release notes.
---

# Hog release notes writer

Write release notes for PostHog.

## Gather changes

- Check `contents/docs/ai-observability/changelog.mdx` for published entries.
- Review merged changes since the latest entry with `git log --oneline --since="2 weeks ago"`.
- Read relevant commit messages and PR descriptions for context.
- Cross-reference the relevant GitHub milestone when one exists.

## Write each entry

1. Start with a one-line summary in plain language.
2. Explain what it does in two or three sentences.
3. Give concrete usage steps or a code snippet.
4. State why it was built in one sentence.

## Style rules

- Be direct and concise; avoid marketing fluff.
- Be technical but approachable.
- Address the reader as "you."
- Start with a verb: Add, Fix, Improve, or Remove.
- Link to relevant documentation.
- Lead with breaking changes.
- Keep each entry under 200 words.
- Skip dependency upgrades and minor refactors.

## Output

Return Markdown ready to append to the changelog.
