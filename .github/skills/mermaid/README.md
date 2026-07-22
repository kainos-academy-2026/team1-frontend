# Mermaid Skill Package

## Purpose

This skill package enables GitHub Copilot to analyze a codebase and its tests and produce accurate, readable Mermaid diagrams. It is aimed at beginner software developers who want to document their code visually without needing to write diagrams by hand.

## Generated Files

| File | Purpose |
|------|---------|
| `mermaid.md` | Main skill definition — audience, triggers, inputs, outputs, rules, and examples |
| `mermaid.prompt.md` | Prompt file for invoking the skill directly in Copilot Chat |
| `mermaid.instructions.md` | Instruction file that enforces diagram accuracy and scope rules |
| `mermaid.agent.md` | Agent definition for running the skill as a Copilot agent |
| `README.md` | This file — overview and update guide |

## How to Update

To update this skill package, rerun the skill builder questionnaire:

1. Open the questionnaire prompt in Copilot Chat
2. Choose **resume** when prompted
3. Provide the path to `mermaid.md` when asked for the existing skill file
4. Update any answers and the files will be regenerated
