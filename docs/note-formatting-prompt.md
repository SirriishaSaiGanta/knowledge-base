# Note-Formatting Prompt (for generating knowledge base content)

Reusable prompt for turning raw topic notes into clean Markdown for this knowledge base. Two variants below — pick based on how the source notes are structured.

## Variant A — Notes already use `#` headings

Use when the source notes already have Markdown headings and you just need formatting cleaned up.

````
You are generating content for a Markdo
wn-based knowledge base.

I will provide topic notes in Markdown. Your job is to preserve the structure and render it correctly for the knowledge base.

Follow these rules strictly:

1. Preserve Markdown Structure
- Keep all headings (#, ##, ###, ####).
- Do not flatten sections.
- Maintain the hierarchy exactly.

2. Preserve Code Blocks
- Keep fenced code blocks (```language).
- Preserve indentation exactly.
- Never convert code into inline text.
- Keep the language identifier (csharp, ts, js, html, css, json, bash, sql, etc.).

3. Preserve Flow Diagrams
Keep ASCII flow diagrams (arrows, "↓", "--->") inside fenced code blocks. Never rewrite them as paragraphs.

4. Preserve Tables
Render Markdown tables as proper Markdown tables. Do not convert tables into bullet points.

5. Preserve Lists
- Keep ordered and unordered lists, nested bullets, and checklists.

6. Preserve Blockquotes
Keep > syntax intact.

7. Preserve Inline Formatting
Keep bold, italic, inline code, links, images, emojis, callouts.

8. Preserve Examples
Keep examples in their own subsection. Do not merge examples into explanations.

9. Preserve Interview Notes
Keep interview tips, FAQs, common mistakes, and best practices as separate sections. Never merge them into the explanation.

10. Preserve Callouts
Keep ✅ Best Practice, ❌ Common Mistake, ⚠ Important, 💡 Tip as bullet points.

11. Preserve Spacing
Leave blank lines between headings, paragraphs, code blocks, tables, and diagrams.

12. Don't Invent Content
Only reorganize the supplied notes. Do not add explanations unless explicitly requested.

13. Markdown First
Output must be valid Markdown that renders correctly in GitHub, Obsidian, Docusaurus, VitePress, or any Markdown renderer.

14. Never Break Code
Never modify indentation, braces, quotes, or code formatting.

15. Output
Return ONLY the final Markdown. Do not wrap the entire document inside another code block. Do not add commentary before or after the content.
````

## Variant B — Notes have no headings (raw/unstructured)

Works, but reliability drops on long notes (1000+ lines): sections can get merged, unfenced code/diagrams can get flattened into prose, and tables can get misread. Two ways to handle this:

### B1 — Ask the model to infer structure

```
I will provide raw notes. The notes may not contain Markdown headings.

Your task is to intelligently identify the document structure.

Recognize:
- Section titles (Definition, Syntax, Example, Interview Questions, etc.)
- Code snippets
- Flow diagrams
- Tables
- Bullet points
- Numbered lists
- Best practices
- Common mistakes
- Warnings
- Tips

Convert the notes into clean Markdown.

Rules:
- Detect headings and convert them to appropriate Markdown headings (#, ##, ###).
- Detect code and wrap it in fenced code blocks with the correct language whenever possible.
- Detect ASCII flow diagrams and keep them inside code blocks.
- Preserve bullet lists and numbered lists.
- Convert tabular data into Markdown tables.
- Keep examples in separate sections.
- Preserve spacing and readability.
- Do not rewrite or summarize the content unless requested.
- Do not invent new information.
- Return only the final Markdown.
```

### B2 — Semantic markers (recommended for long-term use)

When writing the source notes yourself, use lightweight markers instead of `#`. This is deterministic — no inference needed:

```
TITLE: Dependency Injection

SECTION: Definition

Dependency Injection is...

SECTION: Why do we need it?

...

CODE:
public class EmployeeService
{
    ...
}

FLOW:
Application
    ↓
Controller
    ↓
Service
```

Markers to use: `TITLE:`, `SECTION:`, `CODE:`, `FLOW:`, `TABLE:`.

## Which to use

| Source notes                            | Recommended variant   |
| --------------------------------------- | --------------------- |
| Already has `#` headings                | A                     |
| Raw text, short (< a few hundred lines) | B1                    |
| Raw text, long / maintained long-term   | B2 (semantic markers) |

Fenced code blocks and pipe-tables (`\| a \| b \|`) parse reliably regardless of variant — the risk with unstructured notes is section-boundary detection and _unfenced_ code/diagrams, not syntax that's already unambiguous.

---

# Import Dialog Formats (this app)

The variants above produce clean Markdown for _reading_. The Import dialog (header → Import) turns pasted Markdown into actual topics/sections.

**As of the dynamic-sections redesign, there is no fixed heading vocabulary anymore.** Every top-level (`#`) heading becomes its own section, titled exactly as written, rendered in the order it appears — headings like "Description" or "Best Practices" are no longer special, they're just section titles like any other. The only heading with special behavior is `# Children`.

## A) New topic + content ("Full topic" mode)

Set **"What are you adding?"** → **Full topic**. Title goes in the separate Title field; this goes in the markdown box — headings can be anything, this is just an example shape:

````markdown
# What is Dependency Injection?

Plain prose, tables, lists, task lists, blockquotes — anything GitHub-flavored Markdown supports.

# Constructor Injection

​`csharp
public class UserService
{
    public UserService(IEmailService emailService) { }
}
​`

Nested `##`/`###` headings, more fenced code blocks, tables, Mermaid diagrams (```` ```mermaid ````
fences render as diagrams) — everything under this `#` stays inside this one section, exactly as
written, whatever structure it uses internally.

# Service Lifetimes

| Lifetime  | Instance          | Use Case  |
| --------- | ------------------ | --------- |
| Transient | Every resolution   | Helpers   |
| Scoped    | Per HTTP request   | DbContext |
| Singleton | Entire application | Cache     |

# Children

## Sub-topic name one

## Sub-topic name two
````

Rules:

- **Any** `#` heading becomes its own section — its exact text becomes the section's title, no matching required. Add as many as you want, in any order; they render in the order you wrote them.
- Nested `##`/`###`/etc. headings inside a section are preserved as-is (rendered as sub-headings within that section's content) — they do **not** split into separate sections or list items the way the old fixed types used to.
- A heading with no body text under it is skipped (nothing to show).
- `# Children` is still the one reserved heading — unchanged from before. Each `##`/`###` under it becomes a real sidebar sub-topic node (nesting `###` under `##` makes a grandchild), and its body becomes that node's short description.

## B) Topics only (no content — "names-only" mode)

Unchanged — set **"What are you adding?"** → **Just topic names**. No `# Children` wrapper needed — the whole box _is_ the outline, and every heading becomes a node regardless of what it says:

```markdown
# Topic One

## Subtopic A

## Subtopic B

### Sub-subtopic

# Topic Two
```

## C) Editing / overwriting an existing topic

Same format as **(A)** — there's no separate "edit" format. Paste the topic's full updated content using the Format-A shape, use the same Title (so it matches the existing node), and set **"If a topic already exists there"** → **Replace it (overwrite all sections)**. That replaces every section on the existing node with what you just pasted; its children are unaffected.

For editing just _one_ section without touching the rest, skip Import entirely — open the topic → **Edit content** → edit that one section's form directly, or click **+ Add section** to add a new one by hand.
