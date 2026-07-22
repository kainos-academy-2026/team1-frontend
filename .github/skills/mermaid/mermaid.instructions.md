---
applyTo: "**"
---

When generating Mermaid diagrams from a codebase or tests:

- Always produce valid Mermaid markdown inside fenced code blocks (` ```mermaid `)
- Only represent code, logic, and flows that are explicitly present in the provided files — never hallucinate
- Select the diagram type that best fits the content (flowchart, sequence, class, state, etc.)
- Keep diagrams scoped and readable; do not create overly large or visually overlapping diagrams
- Apply the same accuracy standards to test flows as to production code flows
- If the user provides specific file names, workflows, processes, or sectors, scope the diagram to that input only
