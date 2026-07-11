# WhatsApp Bridge Limitations for Group Summaries

## The Problem

The WhatsApp Baileys bridge (`~/.hermes/hermes-agent/scripts/whatsapp-bridge/bridge.js`) has a hard filter at line 637:

```js
if (WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
  continue; // silently drop the message
}
```

This runs for ALL incoming messages (`messages.upsert` handler, line 520). In bot mode (`WHATSAPP_MODE=bot`), this means group messages from non-whitelisted users are dropped at the bridge level — before they ever reach the Python gateway or the session database.

## Impact on Summary Bots

- **Only conversations from `WHATSAPP_ALLOWED_USERS` appear in summary output**
- Group members not in the allowlist are invisible to the bot
- The `WHATSAPP_GROUP_POLICY=open` setting and `WHATSAPP_REQUIRE_MENTION=false` default are irrelevant because the bridge drops messages first

## Diagnosis

Check gateway log for group messages:
```bash
grep "inbound message.*@g.us" ~/.hermes/logs/gateway.log | wc -l
```

Check session DB for group sessions:
```bash
python3 -c "
import sqlite3
db = sqlite3.connect('$HOME/.hermes/state.db')
count = db.execute(\"SELECT COUNT(*) FROM sessions WHERE source='whatsapp' AND chat_id LIKE '%@g.us'\").fetchone()[0]
print(f'Group sessions in DB: {count}')
"
```

If active groups show near-zero sessions, the bridge filter is blocking.

## Possible Fixes

### Option 1: Add all members to ALLOWED_USERS
```bash
# In ~/.hermes/.env
WHATSAPP_ALLOWED_USERS=6283191853153,6281389841713,<member3>,<member4>,...
```
Impractical for large groups.

### Option 2: Change DM_POLICY to avoid the bridge check
The bridge check is gated on `WHATSAPP_DM_POLICY !== 'pairing'`. Changing DM_POLICY affects DM behavior, so this needs careful consideration.

### Option 3: Modify bridge.js (advanced)
Remove or relax the `matchesAllowedUser` check for group messages specifically. Requires modifying the bridge source and restarting the gateway.

## Code Locations

| Component | File | Key Lines |
|-----------|------|-----------|
| Bridge message handler | `scripts/whatsapp-bridge/bridge.js` | 520-640 (upsert handler, allowlist check at 637) |
| Python adapter | `plugins/platforms/whatsapp/adapter.py` | 1344 (`_should_process_message`) |
| Message processing logic | `gateway/platforms/whatsapp_common.py` | 348-385 (group policy, mention gating) |
| Config | `~/.hermes/.env` | `WHATSAPP_ALLOWED_USERS`, `WHATSAPP_DM_POLICY` |
