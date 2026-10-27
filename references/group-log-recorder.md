# JSONL group-message recorder (opt-in patch)

Records **every** incoming group message to disk, so summaries, reports, or
history lookups do not depend on the agent's context window.

```
$HERMES_HOME/platforms/whatsapp/group_logs/<group-id>.jsonl
```

This is independent of the allowlist patch in
`references/record-all-group-messages.md`: that one decides *who* may be seen,
this one *writes down* what arrives.

## Why it needs a patch

`bridge.js` is an ES module. A recorder that calls `require('fs')` inside the
message handler throws `ReferenceError`, and when that call sits inside
`try { ... } catch {}` the failure is **completely silent**: zero log files and
zero error output. Two changes fix it:

1. import `fs` and `path` at the top of the file (ESM `import`, not `require`);
2. let the `catch` log the failure instead of swallowing it.

## Apply

```bash
cd /opt/hermes     # or $HERMES_HOME when the bridge is overridden there
git apply patches/group-log-recorder.patch
# or
patch -p1 < patches/group-log-recorder.patch
```

Then install the bridge dependencies, make sure the log directory exists, and
restart the gateway **from an external terminal** (a gateway supervised as PID 1
refuses an in-process restart).

## JSONL schema

One JSON object per line:

```json
{"ts":"2026-10-27T04:12:33.412Z","chat_id":"<group-id>@g.us","sender":"6280000000000@s.whatsapp.net","sender_name":"Name","body":"hello","has_media":false}
```

| Field | Meaning |
|---|---|
| `ts` | ISO-8601 UTC timestamp of arrival |
| `chat_id` | group JID; also the file name (`<chat_id>.jsonl`) |
| `sender` | sender JID |
| `sender_name` | display name when the bridge knows it |
| `body` | text body (empty string for media-only messages) |
| `has_media` | `true` when the message carries an attachment |

One file per group keeps appends cheap and lets you prune, archive, or ship a
single group without touching the rest.

## Verification

```bash
tail -n 3 "$HERMES_HOME/platforms/whatsapp/group_logs/<group-id>.jsonl"
```

A busy group must show new lines within seconds. If the file never appears, check
the gateway log for a recorder error — the patched `catch` reports failures
instead of hiding them.

## Consuming it from cron

The log is plain text, so a `--no-agent` cron job can read the last 24 h, print a
digest, and spend **zero model tokens**:

```bash
# 07:00 WIB == 00:00 UTC inside a UTC container
hermes cron create '0 0 * * *' --name recaps --no-agent --script recaps.py \
  --deliver "whatsapp:<group-id>@g.us"
```

Timezone trap: Hermes containers commonly run on **UTC**, so a schedule written
in local time fires at the wrong hour.

## Retention

- Link-only archives are worth keeping indefinitely (dedupe per URL).
- Raw chat lines can be pruned by age or size, per file.
- Prune **after** that day's digest job has run, never before — otherwise the
  digest reads a half-emptied log.
