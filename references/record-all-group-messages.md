# Recording ALL Group Members' Messages on WhatsApp

By default, Hermes WhatsApp has a **double filter** that blocks group messages from non-whitelisted users:

1. **Bridge (Node.js)**: `bridge.js` line 637 — `matchesAllowedUser(senderId, ALLOWED_USERS, ...)`
2. **Adapter (Python)**: `whatsapp_common.py` lines 361-365 — `_matches_whatsapp_allowlist(sender_id, self._allow_from)`

This means only users listed in `WHATSAPP_ALLOWED_USERS` have their group messages recorded. All other members are silently dropped.

## The Fix (3 changes + restart)

### 1. Patch bridge.js — skip allowlist for groups

**File**: `~/.hermes/hermes-agent/scripts/whatsapp-bridge/bridge.js`

**Change line 637** from:
```js
if (WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
```
to:
```js
if (!isGroup && WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
```

The `!isGroup &&` prefix skips the allowlist check entirely for group messages. DMs remain gated.

### 2. Patch whatsapp_common.py — remove allowlist check for groups

**File**: `~/.hermes/hermes-agent/gateway/platforms/whatsapp_common.py`

**Remove lines 361-365** (the allowlist check block):
```python
            # Only respond to whitelisted senders in groups (respect WHATSAPP_ALLOWED_USERS)
            if self._allow_from:
                sender_id = str(data.get("senderId") or data.get("from") or "")
                if sender_id and not self._matches_whatsapp_allowlist(sender_id, self._allow_from):
                    return False
```

Replace with a comment:
```python
            # NOTE: patched — allowlist check skipped for groups so all members' messages are recorded.
            # Only DMs are gated by WHATSAPP_ALLOWED_USERS.
```

### 3. Set WHATSAPP_REQUIRE_MENTION=true

In `~/.hermes/.env`, add or update:
```
WHATSAPP_REQUIRE_MENTION=true
```

This ensures Hermes **records** all group messages but only **responds** when @mentioned. Without this, Hermes would respond to every single group message, creating chaos.

### 4. Restart gateway

**CRITICAL**: Cannot restart from inside the gateway. User must run from separate terminal:
```bash
hermes gateway restart
```

The bridge auto-restarts on kill (the adapter spawns it), but Python module changes require a full gateway restart.

## Verification

After restart, check:
```bash
# Count group inbound messages (should increase rapidly if groups are active)
grep -c "inbound message.*@g.us" ~/.hermes/logs/gateway.log

# Check session DB for group sessions
python3 -c "
import sqlite3
db = sqlite3.connect('$HOME/.hermes/state.db')
count = db.execute(\"SELECT COUNT(*) FROM sessions WHERE source='whatsapp' AND chat_id LIKE '%@g.us'\").fetchone()[0]
print(f'Group sessions: {count}')
"
```

## ⚠️ Warning: Patches are overwritten on `hermes update`

These changes modify Hermes source code. Running `hermes update` will overwrite the patched files. Re-apply patches after each update.
