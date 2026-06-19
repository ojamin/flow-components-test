# Agent playbook

## Purpose

This playbook helps package component agents find the right docs and close out focused changes safely.

## Start here

1. Read repository `AGENTS.md` and the assigned task.
2. Read [README](../README.md) for current package purpose and commands.
3. For component work, use [Authoring guide](authoring-guide.md), [Component contract](component-contract.md), [Renderer guide](renderer-guide.md), and [Config panel guide](config-panel-guide.md).
4. For generated-output or manifest work, use [Manifest schema](manifest-schema.md) and run `npm run generate` plus `npm run generate:check`.
5. For verification, use [Testing guide](testing-guide.md).

## Closeout expectations

- Keep component IDs, source IDs, generated manifests, and source-file snapshots consistent.
- Do not edit generated files by hand; regenerate them.
- Keep package code independent from Flow Builder app internals.
- Preserve the proprietary license boundary and do not add open-source licensing language.
- Report exact verification commands and results.
