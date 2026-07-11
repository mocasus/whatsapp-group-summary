# WhatsApp Group ID & Delivery Reference

## Group ID Format

WhatsApp group IDs always follow this pattern: `<digits>@g.us`

## Getting the Group ID

1. **User provides it directly** — fastest. Ask "apa ID grupnya?" in the group. Respond with JUST the ID, no explanations.
2. **User tags Hermes in group** — when tagged "apa id grub ini", respond with: `` `120363XXXXXXX@g.us` `` — keep it ONE line, no follow-up questions, no "mau dipake buat apa?"
3. **From bridge API** — `curl localhost:3000/chat/<id>@g.us` returns JSON with `name`, `isGroup`, `participants`

## Delivery Format

```
deliver: "whatsapp:<group_id>@g.us"
```

## Cron Schedule (WIB timezone)

| Time (WIB) | UTC | Cron expression |
|---|---|---|
| 07:00 pagi | 00:00 | `0 0 * * *` |
| 23:00 malam | 16:00 | `0 16 * * *` |

WIB = UTC+7.

## Managed Groups (updated 2026-07-11)

| # | Group Name | ID | Status |
|---|-----------|-----|--------|
| 1 | MOCA PARTY - LIGHT SYSTEM ‼️ | 120363273766916972@g.us | ✅ Active |
| 2 | grub hd \| MOCA | 120363309894459310@g.us | ✅ Active |
| 3 | BagiProject | 120363307689756041@g.us | ✅ Active |
| 4 | #1 GRUB MABA UNNES 2026/2027 (1) | 120363411000649302@g.us | ✅ Active |
| 5 | #1 GRUP MABA UNNES 2026/2027 (2) | 120363428091361523@g.us | ✅ Active |
| 6 | Diskusi Marketku.id | 120363426826372520@g.us | ✅ Active |

## Skipped Groups

| Group Name | ID | Reason |
|-----------|-----|--------|
| Epanion | 120363315911096773@g.us | User said "engga usah" — 608 members |

## Batch Creation Pattern

Always create both morning and evening jobs in parallel to save round-trips. Only ask for the group name once, then create both. If user says "engga usah" or "ga dulu" — **stop immediately**, don't push.
