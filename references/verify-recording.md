# Recording Verification Checklist

After applying all 3 patches and restarting:

## 1. Check env
```bash
grep WHATSAPP_REQUIRE_MENTION ~/.hermes/.env
# Should output: WHATSAPP_REQUIRE_MENTION=true
```

## 2. Verify bridge allows all group messages
Check bridge is running with patched code:
```bash
ps aux | grep "bridge.js" | grep -v grep
# Should show node process with --mode bot
```

## 3. Verify JSONL recording
Send a test message in any group, then:
```bash
ls -la ~/.hermes/platforms/whatsapp/group_logs/
cat ~/.hermes/platforms/whatsapp/group_logs/<chat_id>.jsonl | tail -1
```
Should show your message with correct sender name.

## 4. Verify silent recording (no agent response)
Check gateway logs — regular messages should show "returned None" (not "inbound message"):
```bash
grep "_build_message_event returned None" ~/.hermes/logs/gateway.log | tail -5
```
These are silently recorded — no agent session created, no LLM cost.

## 5. Verify mention still triggers agent
Tag @Hermes in group — should create a session and respond normally.
```bash
grep "inbound message.*@g.us" ~/.hermes/logs/gateway.log | tail -3
```
