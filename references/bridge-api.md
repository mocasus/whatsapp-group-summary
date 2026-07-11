# WhatsApp Bridge API — Quick Reference

When Hermes WhatsApp gateway is running, the Baileys bridge exposes an HTTP API for querying chat/group info.

## Get group name by ID

Query the bridge chat endpoint with the group ID:
```
GET /chat/<chat_id>
```

The bridge returns JSON with `name`, `isGroup`, `participants`, and other group metadata.

## Get names for all recorded groups

Iterate over JSONL log files and query each group's chat endpoint to retrieve the group name.

## JSONL format

Each line in the log file is a JSON object:
```json
{"ts": 1783736100, "sender": "Display Name", "body": "message text"}
```

- `ts` = UNIX timestamp (integer, seconds)
- `sender` = WhatsApp display name
- `body` = message text (stickers show `"[Sticker]"`)
