# Contributing to n8n-skills

This repository is a content and packaging repo for AI-agent skills that help with n8n workflow building.

## Start Here

Run commands from the `n8n-skills/` directory.

This workspace currently has a wrapper folder outside the actual git repository, so the repository root for contributions is:

```bash
cd n8n-skills
```

## Repository Map

```text
n8n-skills/
├── skills/            # Skill source folders
├── evaluations/       # Scenario-based quality checks
├── docs/              # Developer and usage documentation
├── dist/              # Built zip artifacts
├── build.sh           # Packaging script
└── CONTRIBUTING.md    # Contributor workflow and conventions
```

## Stable IDs vs Display Names

Each skill now has:

- A stable slug used for folders, evaluations, and packaging
- A developer-facing display name used in docs and catalogs

Keep the slug stable unless you are doing an intentional breaking migration.

Example:

- Slug: `n8n-expression-syntax`
- Display name: `n8n Expressions & Data Mapping`

## Skill Catalog

Use [skills/README.md](skills/README.md) as the source of truth for:

- Current skill names
- Stable slugs
- Folder ownership
- Evaluation folder mapping

If you add or rename a skill, update that file in the same change.

## Skill Folder Contract

Each skill folder should contain:

```text
skills/<skill-slug>/
├── SKILL.md
├── README.md
└── optional reference files
```

Required rules:

- `SKILL.md` is the agent-facing instruction file
- `README.md` is the developer-facing overview
- Keep folder names slug-based and stable
- Prefer splitting large reference material into focused supporting files

## Evaluation Contract

Every skill should have a matching evaluation folder:

```text
evaluations/<evaluation-slug>/
```

Keep the evaluation folder aligned with the skill domain. The folder name does not need to match the full skill slug exactly, but the mapping must be documented in [skills/README.md](skills/README.md).

## Recommended Change Workflow

1. Update the relevant skill content in `skills/`
2. Update or add evaluations in `evaluations/`
3. Update developer docs if the structure or naming changed
4. Run a quick packaging check on `build.sh`
5. Rebuild artifacts only when you intend to refresh `dist/`

## Naming Conventions

Use this pattern for new skill slugs:

```text
n8n-<domain>-<focus>
```

Examples:

- `n8n-expression-syntax`
- `n8n-node-configuration`
- `n8n-code-javascript`

Display names should be short, descriptive, and human-readable.

## Packaging Notes

`build.sh` now packages every folder under `skills/` automatically.

That means:

- New skills are picked up without editing a hardcoded list
- Distribution drift is less likely
- Code skills and future skills follow the same packaging path

## Good First Improvements

- Reduce outdated references to legacy MCP tool names
- Keep `README.md`, `INSTALLATION.md`, and `dist/README.md` aligned
- Break oversized `SKILL.md` files into smaller reference docs where useful
- Add more explicit contributor examples to skill READMEs


