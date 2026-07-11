# WhatsApp Bridge Limitations for Group Summaries

## The Problem

The WhatsApp Baileys bridge (`scripts/whatsapp-bridge/bridge.js`) has a hard filter at line 637:

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

## Solution

This skill patches the bridge to skip the allowlist check for group messages by adding `!isGroup &&` to the condition at line 637. DMs remain fully gated by the allowlist.

The Python adapter (`gateway/platforms/whatsapp_common.py`) also needs a matching patch to remove its group allowlist check.

## Code Locations

| Component | File | Key Lines |
|-----------|------|-----------|
| Bridge message handler | `scripts/whatsapp-bridge/bridge.js` | 520-640 (upsert handler, allowlist check at 637) |
| Python adapter | `plugins/platforms/whatsapp/adapter.py` | `_should_process_message` call |
| Message processing logic | `gateway/platforms/whatsapp_common.py` | 348-385 (group policy, mention gating) |
| Environment config | Hermes env file | `WHATSAPP_ALLOWED_USERS`, `WHATSAPP_DM_POLICY`, `WHATSAPP_REQUIRE_MENTION` |
