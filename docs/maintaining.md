# Maintaining this repository

Owner and maintainer runbook. End-user install and storage modes live in the
[README](../README.md).

These settings must stay true or CI, Dependabot, or releases break.

## Branch protection

Ruleset **`main`** (id `21139954`) applies to the default branch.

- Deletion and non-fast-forward are blocked.
- `strict_required_status_checks_policy` is on: a PR must be up to date with
  `main` before merge.
- Required checks, each pinned to GitHub Actions (`integration_id` `15368`):

| Check     | Job                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `quality` | Prettier, typecheck, lint, knip, test, build                                                             |
| `ledger`  | Storybook build, `testproof validate`, `testproof generate --check`                                      |
| `ci-ok`   | Rollup. Prints `quality=` and `ledger=` and fails unless both are `success`. Does not re-run those jobs. |

Do not drop any of the three. Do not unpin them from GitHub Actions: an unpinned
check name can be satisfied by any app.

Inspect a PR’s **Checks** tab. `ci-ok` is the gate summary. The command logs
are on `quality` and `ledger` in the same workflow run.

## Dependabot

### Auto-merge

Repo setting **Allow auto-merge** must stay on. If it is off, the
`dependabot-auto-merge` job fails with `Auto merge is not allowed for this repository`.

[`.github/workflows/dependabot-auto-merge.yml`](../.github/workflows/dependabot-auto-merge.yml)
enables squash auto-merge for every Dependabot PR (patch, minor, and major)
once required checks pass.

### Rebase when behind

`rebase-strategy: auto` in Dependabot only rebases on a git conflict, not when
a PR is merely behind. With strict required checks, behind PRs cannot merge.

[`.github/workflows/dependabot-auto-rebase.yml`](../.github/workflows/dependabot-auto-rebase.yml)
runs on every push to `main` and comments `@dependabot rebase` on open
Dependabot PRs whose merge state is `BEHIND`, `DIRTY`, or `UNKNOWN`.

`github-actions[bot]` comments are rejected (`Sorry, only users with push access
can use that command.`). The workflow therefore uses the Actions secret
`DEPENDABOT_REBASE_TOKEN` and fails the job if that value is empty.

That secret is a **fine-grained PAT** for a user who can push to this repo:

1. https://github.com/settings/personal-access-tokens?type=beta → Generate new token
2. Name such as `testproof-dependabot-rebase`
3. Resource owner: the repo owner
4. Repository access: only `testproof`
5. Repository permissions (there is no “Push access” checkbox):
   - **Contents:** Read and write
   - **Pull requests:** Read and write
6. Generate, then store it (never commit the value):

```bash
gh secret set DEPENDABOT_REBASE_TOKEN --repo kristijorgji/testproof
```

Recreate the token and re-run `gh secret set` if it expires or is revoked.
After a push to `main`, the rebase comment must be from that user, not
`github-actions[bot]`. Dependabot then force-pushes and CI re-runs.

## Releases

`@testproof/core` and `testproof` publish from [`.github/workflows/release.yml`](../.github/workflows/release.yml)
on `v*` tags via [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
(OIDC). There is no `NPM_TOKEN`. The same tag creates a GitHub Release and
pushes `ghcr.io/kristijorgji/testproof:<version>` plus `:latest`. The tag must
match `packages/core/package.json` version.

**Tag only from `main`.** The release workflow refuses to publish unless the
tagged commit is reachable from `origin/main`. Never create a `v*` tag on a
feature branch or unmerged PR commit.

```bash
git checkout main
git pull
pnpm set-version 0.2.0
git commit -am "chore(release): 0.2.0"
git tag v0.2.0
git push origin main --follow-tags
```

See [Releasing](../README.md#releasing) for the first-time npm trusted-publisher
setup.

### Tag ruleset (recommended)

GitHub cannot natively require “this commit is on `main`,” but a **tag** ruleset
can limit who may create or move `v*` tags. Create one in
**Settings → Rules → Rulesets → New ruleset → New tag ruleset**:

| Field       | Value                                                    |
| ----------- | -------------------------------------------------------- |
| Name        | `release-tags`                                           |
| Enforcement | Active                                                   |
| Target tags | include `refs/tags/v*`                                   |
| Rules       | Restrict creations, Restrict updates, Restrict deletions |

Leave bypass actors empty (or only repository admins) so casual pushes and
agents cannot retag. The workflow `main`-ancestor check remains the enforcement
that the tagged SHA is already on the default branch.

Via API (admins only):

```bash
gh api repos/kristijorgji/testproof/rulesets -f name='release-tags' -f target='tag' -f enforcement='active' \
  --input - <<'JSON'
{
  "conditions": { "ref_name": { "include": ["refs/tags/v*"], "exclude": [] } },
  "rules": [{ "type": "creation" }, { "type": "update", "parameters": { "update_allows_fetch_and_merge": false } }, { "type": "deletion" }]
}
JSON
```
