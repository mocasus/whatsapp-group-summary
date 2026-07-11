# Recording Verification Checklist

After applying all 3 patches and restarting the gateway:

## 1. Check environment

Verify `WHATSAPP_REQUIRE_MENTION` is set to `true` in the Hermes environment configuration.

## 2. Verify bridge allows all group messages

Check bridge is running with patched code:
```bash
ps aux | grep "bridge.js" | grep -v grep
# Should show node process with --mode bot
```

## 3. Verify JSONL recording

Send a test message in any group where Hermes is a member, then check the group_logs directory for a new JSONL file with your message.

## 4. Verify silent recording (no agent response)

Check gateway logs — regular messages should show `"_build_message_event returned None"` (not `"inbound message"`). These are silently recorded — no agent session created, no LLM cost.

## 5. Verify mention still triggers agent

Tag @Hermes in a group — it should create a session and respond normally. Gateway logs should show `"inbound message"` with the group chat ID.
