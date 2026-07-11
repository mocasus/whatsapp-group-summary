# WhatsApp Group ID & Delivery Reference

## Group ID Format

WhatsApp group IDs always follow this pattern:

```
<digits>@g.us
```

Examples:
- `120363273766916972@g.us` (MOCA PARTY)
- `120363309894459310@g.us` (hd)
- `120363307689756041@g.us` (BagiProject)
- `120363411000649302@g.us` (unnes 1)

## Getting the Group ID

1. **User provides it directly** — fastest. Ask "apa ID grupnya?" in the group. Respond with JUST the ID, no explanations.
2. **From session_search** — look for the group name in session titles when Hermes receives messages.
3. **User tags Hermes in group** — when tagged "apa id grub ini", respond with: `ID grup ini: \`<id>@g.us\`` — keep it ONE line, no follow-up questions.

## Delivery Format

```
deliver: "whatsapp:<group_id>@g.us"
```

Example: `deliver: "whatsapp:120363273766916972@g.us"`

## Cron Schedule (WIB timezone)

| Time (WIB) | UTC | Cron expression |
|---|---|---|
| 07:00 pagi | 00:00 | `0 0 * * *` |
| 23:00 malam | 16:00 | `0 16 * * *` |

WIB = UTC+7.

## Batch Creation Pattern

Always create both morning and evening jobs in parallel (single tool call with two `cronjob(action='create')` invocations) to save round-trips. Only ask for the group name once, then create both.
