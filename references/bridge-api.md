# WhatsApp Bridge API — Quick Reference

## Get group name by ID
```bash
curl -s http://localhost:3000/chat/120363XXXXXXXXXX@g.us | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('name','?'))"
```

## Get names for all recorded groups
```bash
for f in ~/.hermes/platforms/whatsapp/group_logs/*.jsonl; do
  id=$(basename "$f" .jsonl)
  name=$(curl -s "http://localhost:3000/chat/$id" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('name','?'))")
  echo "$id → $name ($(wc -l < "$f") msgs)"
done
```

## Check recording status
```bash
ls ~/.hermes/platforms/whatsapp/group_logs/
# Each file = one group being recorded
# Format: <chat_id>.jsonl
```

## JSONL format
Each line: `{"ts": 1783736100, "sender": "Nama", "body": "isi pesan"}`
- `ts` = UNIX timestamp (integer, seconds)
- `sender` = WhatsApp display name
- `body` = message text (stickers show "[Sticker]")
