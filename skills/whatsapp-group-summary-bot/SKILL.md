---
name: whatsapp-group-summary-bot
description: Setup WhatsApp group summary bot — records all messages silently via patched bridge+adapter, reads from JSONL logs, sends structured twice-daily summaries (07:00 & 23:00 WIB) in clean WhatsApp-friendly format (no metadata, no blank lines, casual Indonesian).
triggers:
  - User wants auto-summary or "ringkasan" for WhatsApp group
  - User shares WhatsApp group invite link with summary request
  - User says "set summary" or "summary bot" in group/DM
---

# WhatsApp Group Summary Bot

Two parts: **(A) message recording** via patched bridge/adapter → JSONL, **(B) cron jobs** that read JSONL and deliver summaries.

⚠️ **Core patches required.** WhatsApp normally only forwards @mentioned or whitelisted-user messages. Three source files must be patched to record ALL messages silently. Patches WILL be overwritten on `hermes update` — re-apply after updates.

---

## Part A: Message Recording (One-Time Setup)

### A1. Bridge — `bridge.js`

Patch: `Hermes `scripts/whatsapp-bridge/bridge.js`` ~line 637

**Before:**
```js
if (WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
```
**After (add `!isGroup &&`):**
```js
if (!isGroup && WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
```

### A2. Adapter Logic — `whatsapp_common.py`

Patch: `~/.hermes/hermes-agent/gateway/platforms/whatsapp_common.py` ~lines 361-365

Remove the group allowlist check — replace with comment noting the patch.

### A3. Silent Recorder — `adapter.py`

Patch: `~/.hermes/hermes-agent/plugins/platforms/whatsapp/adapter.py`

Add method before `_build_message_event`:
```python
def _record_group_message_sync(self, data):
    try:
        import json, os
        chat_id = str(data.get("chatId") or "")
        if not chat_id.endswith("@g.us"): return
        body = str(data.get("body") or "").strip()
        if not body: return
        log_dir = os.path.expanduser("~/.hermes/platforms/whatsapp/group_logs")
        os.makedirs(log_dir, exist_ok=True)
        entry = {"ts": data.get("timestamp", 0), "sender": str(data.get("senderName") or data.get("senderId") or ""), "body": body}
        with open(os.path.join(log_dir, f"{chat_id}.jsonl"), "a") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception: pass
```

In `_build_message_event`, before `_should_process_message` check:
```python
if data.get("isGroup", False):
    self._record_group_message_sync(data)
```

### A4. Env

Add to the Hermes environment config file:

### A5. Restart

`hermes gateway restart` from **external terminal** (cannot restart from inside gateway).

**Verify:** send test message in any group → `ls ~/.hermes/platforms/whatsapp/group_logs/` should show `<chat_id>.jsonl` with your message.
See `references/verify-recording.md` for full checklist.

### A6. Reference Files

- `references/bridge-api.md` — bridge HTTP API: group name lookup, recording status
- `references/verify-recording.md` — step-by-step verification after patch + restart

---

## Part B: Cron Jobs

### B1. Get Group Info

- **Invite link**: `curl -sL "URL" | grep -oP '(?<=og:title" content=")[^"]+'`
- **Group ID**: tag Hermes in group with "apa id grup ini?" — answer `\`<id>@g.us\``, nothing else
- **User MUST add Hermes to group manually** — invite links don't work for bots

### B2. Create Jobs

| Job | Cron (UTC) | WIB |
|-----|-----------|-----|
| Morning | `0 0 * * *` | 07:00 |
| Evening | `0 16 * * *` | 23:00 |

Deliver to `whatsapp:<chat_id>@g.us` **immediately** — never use `origin` as placeholder.

### B3. Cron Prompt

**Normal mode (default):**
```
Kamu adalah bot ringkasan. HANYA OUTPUT RINGKASAN. Baca ~/.hermes/platforms/whatsapp/group_logs/<CHAT_ID>.jsonl, filter 12 jam (ts=UNIX timestamp integer). TANPA blank line:

*Summary General — 12 jam terakhir*
- *Inti Diskusi*
- [rangkum per topik, gabungin chat mirip]
- *Keputusan*
- [keputusan atau "Tidak ada keputusan formal."]
- *Follow-up / Action*
- [Nama]: [action]
- *Pertanyaan Terbuka*
- [pertanyaan]
- *Link-link*
- [Nama]: [desc] — [URL]

ATURAN: No metadata, no blank line, no job info. HANYA ringkasan. Nama dari field "sender". Bahasa Indonesia santai.
```

**Roast mode (🔥 毒舌):**
```
Kamu adalah bot ringkasan versi ROAST. HANYA OUTPUT RINGKASAN. Baca ~/.hermes/platforms/whatsapp/group_logs/<CHAT_ID>.jsonl, filter 12 jam. TANPA blank line. Gaya: sarkas, lucu, roasting anggota grup tapi tetap friendly, kayak temen yg galak tapi sayang.

*Summary Roast — 12 jam terakhir 🔥*
- *Yang Paling Nyablak*
- [siapa paling rame + roasts ringan]
- *Drama & Perdebatan*
- [topik panas dibahas + komentar sarkas]
- *Receh Tapi Menghibur*
- [chat random yg lucu/absurd]
- *Keputusan (yg akhirnya diambil setelah debat panjang)*
- [keputusan + komentar]
- *PR Yang Belum Kelar*
- [Nama]: [action item + roast ringan]
- *Pertanyaan Nyangkut*
- [pertanyaan + "ada yg bisa jawab ga nih?"]
- *Link Berserakan*
- [Nama]: [desc] — [URL]

ATURAN: No metadata, no blank line, no job info. Roast friendly — bukan bully. Bahasa Indonesia santai + sarkas.
```

### B4. Toggle Mode (On/Off)

To switch a group's summary to roast mode:
```
cronjob(action='update', job_id='<job_id>', prompt='<roast prompt above>')
```

To switch back to normal:
```
cronjob(action='update', job_id='<job_id>', prompt='<normal prompt above>')
```

User can say: "ubah MOCA PARTY ke mode roast" or "balikin hd ke normal" — agent updates the 2 cron jobs for that group.

### B5. User Style

- **Casual Indonesian** — "gw", "lo", "dong", "ya", "nih", "rame bahas", "muter di", "belum jelas"
- **Zero metadata** — no "Cronjob Response", job_id, "Catatan teknis", "To stop..."
- **No blank lines** between sections — WhatsApp renders double newlines as ugly gaps. This is the #1 format bug the user catches. Every line in the summary MUST be a consecutive dash-prefix line with ZERO blank separators anywhere.
- **Direct & short** — user hates verbosity ("ribet"). Never add explanatory notes, setup context, or disclaimers to the summary.
- **Group similar chats** — merge related messages into 3-5 topic bullets under Inti Diskusi, not one bullet per message.
- **Honest about gaps** — write "belum ada jawaban jelas" or "tidak ada solusi valid" when appropriate; never fabricate closure.

### B6. Group Behavior (Anti-Ribet Rule)

When tagged in a WhatsApp group with **"apa id grup ini?"** or similar bare ID request:
- Reply with **just the ID**: `` `120363XXXXXXX@g.us` `` — no quotes, no bold, just inline code
- Do NOT add: explanations, "mau dipake buat apa?", skill loading, setup offers, follow-up questions
- Do NOT load this skill unless explicitly asked to "set summary"
- Speed > conversation — user finds verbose group responses deeply frustrating ("kenapa responmu ribet?")

### B7. Reference Format

See [references/user-format-reference.md](references/user-format-reference.md) for the user's canonical summary example. Match the tone, grouping style, and section structure from that reference closely.

---

## Pitfalls

| Issue | Fix |
|-------|-----|
| Patches overwritten on `hermes update` | Re-apply A1-A3 after update |
| Gateway restart from inside blocked | Use external SSH terminal |
| Bridge auto-restarts, Python doesn't | Full `hermes gateway restart` needed for Python changes |
| JSONL timestamps are UNIX epoch ints | Don't try ISO parsing; compare integer timestamps |
| Blank lines in output | "TANPA blank line" in prompt is critical |
| Cron delivery header `Cronjob Response: ...` | Only appears in origin/DM delivery; group delivery (`whatsapp:...`) is clean |
| "Ribet" group responses | When tagged for "apa id grup", reply with just `` `120363XXXX@g.us` `` — no explanation, no skill loading |
| Non-whitelisted member chat not recording | Verify 3 patches (A1-A3) applied + gateway restarted from external terminal. Bridge auto-restarts but Python adapter needs full `hermes gateway restart` |
| Group name mismatch | Verify with `curl localhost:3000/chat/<id>@g.us` (see bridge-api.md) |
| Summary too verbose / one bullet per message | Merge related chats into 3-5 topic bullets; group by theme, not sender |
| Recording broken after gateway restart | Check `grep \"_build_message_event returned None\" gateway.log` — if present, Python patch not applied. Also verify `ls ~/.hermes/platforms/whatsapp/group_logs/` after sending test message |
| Group name mislabeled | Use `curl localhost:3000/chat/<id>@g.us` to get real WhatsApp name; user often uses shortened names |

---

## Example Output

```
*Summary General — 12 jam terakhir*
- *Inti Diskusi*
- Ngobrolin tools AI: GPT 5.6 Sol, Codex, Claude vs ChatGPT 5
- Sharing repo token saver: oh-my-pi dan paleo
- Diskusi akses remote: Tailscale vs NetBird
- *Keputusan*
- Tidak ada keputusan formal.
- *Follow-up / Action*
- Pen?: cek detail deploy error
- Yanda Nooryuda: cek member/top hari ini
- *Pertanyaan Terbuka*
- API Gmaps berbayar atau gratis?
- Sol udah masuk Codex official?
- *Link-link*
- Nado: token saver — github.com/Fernado03/oh-my-pi-supreme-token-saver
- mmoaa: paleo — github.com/mocasus/paleo
```

---

## Resources

- **GitHub repo:** https://github.com/mocasus/whatsapp-group-summary — standalone repo with full README + installation guide
- **Skill location:** `~/.hermes/skills/whatsapp-group-summary-bot/SKILL.md`
