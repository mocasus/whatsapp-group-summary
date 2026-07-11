# 🤖 WhatsApp Group Summary Bot

![Logo](logo.jpg)

> Bot ringkasan grup WhatsApp untuk **Hermes Agent** — merekam **semua** chat anggota grup secara diam-diam dan mengirim ringkasan terstruktur **2x sehari** (07:00 & 23:00 WIB) dengan bahasa Indonesia santai.

<p align="center">
  <img src="https://img.shields.io/badge/Hermes-Agent-6C5CE7?style=flat-square" alt="Hermes Agent">
  <img src="https://img.shields.io/badge/Platform-WhatsApp-25D366?style=flat-square&logo=whatsapp" alt="WhatsApp">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License">
  <img src="https://img.shields.io/badge/Language-ID-santai-orange?style=flat-square" alt="Bahasa Indonesia">
</p>

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 📝 **Rekam Semua Chat** | Seluruh pesan dari **semua** anggota grup direkam ke JSONL — bukan cuma user whitelist |
| 🤫 **Silent Recording** | Bot tidak merespon chat biasa. Hanya aktif saat di-@mention atau ada perintah `/` |
| 📊 **Summary 2x Sehari** | Pagi (07:00 WIB) & malam (23:00 WIB) — format terstruktur, padat, informatif |
| 🔥 **Mode Roast** | Opsional — versi sarkas & lucu dari ringkasan buat suasana grup lebih hidup |
| 🇮🇩 **Casual Indonesian** | Gaya bahasa santai (gw/lo), bukan formal — cocok buat grup pertemanan |
| 🔗 **Auto-detect Links** | Semua URL yang di-share otomatis tercantum di section Link-link |
| 📋 **Action Tracking** | Follow-up items & pertanyaan terbuka dicatat biar ga ada yang kelewat |

---

## 📊 Contoh Output

### Mode Normal
```
*Summary General — 12 jam terakhir*
- *Inti Diskusi*
- Ngobrolin tools AI: GPT 5.6 Sol, Codex, Claude vs ChatGPT 5 buat slicing UI
- Sharing repo token saver: oh-my-pi dari Nado dan paleo dari mmoaa
- Diskusi akses remote: Tailscale vs NetBird
- Info event Lovable + temp mail smailpro buat klaim kredit
- *Keputusan*
- Tidak ada keputusan formal.
- *Follow-up / Action*
- Pen?: cek detail deploy error
- Yanda Nooryuda: cek member/top hari ini
- mmoaa: minta stars buat repo paleo
- *Pertanyaan Terbuka*
- API Gmaps berbayar atau gratis?
- Sol udah masuk Codex official belum?
- Mending Tailscale atau NetBird buat remote?
- *Link-link*
- Nado: oh-my-pi token saver — github.com/Fernado03/oh-my-pi-supreme-token-saver
- mmoaa: paleo token saver — github.com/mocasus/paleo
- 你算哪块小饼干？: bluk-cf auto CF — github.com/iAm-182/bluk-cf
```

### Mode Roast 🔥
```
*Summary Roast — 12 jam terakhir 🔥*
- *Yang Paling Nyablak*
- DickySusanto gas terus nanya Sol mulu, udah kayak sales GPT
- Pen? classic — deploy error done tapi ga dicek
- *Drama & Perdebatan*
- Tailscale vs NetBird debat ga kelar-kelar, pada mau jadi superhero remote akses
- *Receh Tapi Menghibur*
- Azhar share link invite grup ke-15 kali ini
- *Keputusan (yg akhirnya diambil setelah debat panjang)*
- Ga ada. Seperti biasa.
- *PR Yang Belum Kelar*
- Pen?: deploy error masih menggantung
- Yanda: member check masih waiting
- *Pertanyaan Nyangkut*
- Gmaps bayar apa gratis? udah 3 hari ini pertanyaan yg sama
- *Link Berserakan*
- Nado: token saver — github.com/Fernado03/oh-my-pi-supreme-token-saver
```

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────┐
│                 WhatsApp Group                    │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │
│  │User1│  │User2│  │User3│  │UserN│  ...         │
│  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │
└─────┼────────┼────────┼────────┼────────────────┘
      │        │        │        │
      ▼        ▼        ▼        ▼
┌─────────────────────────────────────┐
│        Baileys Bridge (Node.js)     │
│  bridge.js — !isGroup skip allowlist│  ◄── Patch A
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│      Python Adapter (Hermes)         │
│  whatsapp_common.py — no allowlist   │  ◄── Patch B
│  adapter.py — _record_group_msg()   │  ◄── Patch C
└────────┬───────────────────┬────────┘
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌──────────────────┐
│  JSONL Logs      │  │  Agent Response  │
│  group_logs/     │  │  (only @mention) │
│  <id>.jsonl      │  │                  │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│         Cron Jobs (2x daily)         │
│  07:00 WIB — Morning Summary        │
│  23:00 WIB — Evening Summary        │
└────────────────┬────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ WhatsApp Group │
         │  (clean output)│
         └──────────────┘
```

---

## 📦 Instalasi

### Prasyarat

- **[Hermes Agent](https://github.com/NousResearch/hermes-agent)** terinstall & WhatsApp gateway berjalan
- **Akses terminal/SSH** ke server Hermes
- **Hermes sudah di-invite** ke grup WhatsApp target
- `git`, `curl`, `python3` tersedia

---

### Step 1: Clone Skill

```bash
mkdir -p ~/.hermes/skills
git clone https://github.com/mocasus/whatsapp-group-summary.git \
  ~/.hermes/skills/whatsapp-group-summary-bot
```

---

### Step 2: Patch Source Files

> ⚠️ **PENTING:** Patch akan **hilang setiap `hermes update`**. Simpan repo ini dan re-apply setelah update. Gunakan skill `whatsapp-group-summary-bot` untuk auto-detect dan re-apply.

#### Patch A — Bridge (`bridge.js`)

**File:** `~/.hermes/hermes-agent/scripts/whatsapp-bridge/bridge.js`  
**Line:** ~637

```diff
- if (WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
+ if (!isGroup && WHATSAPP_DM_POLICY !== 'pairing' && !matchesAllowedUser(senderId, ALLOWED_USERS, SESSION_DIR)) {
```

**Efek:** Bridge meneruskan pesan dari **semua** anggota grup, bukan cuma user whitelist.

---

#### Patch B — Adapter Logic (`whatsapp_common.py`)

**File:** `~/.hermes/hermes-agent/gateway/platforms/whatsapp_common.py`  
**Line:** ~361-365

```diff
-            # Only respond to whitelisted senders in groups
-            if self._allow_from:
-                sender_id = str(data.get("senderId") or ...)
-                if sender_id and not self._matches_whatsapp_allowlist(...):
-                    return False
+            # NOTE: patched — allowlist check skipped for groups.
+            # Only DMs are gated by WHATSAPP_ALLOWED_USERS.
```

**Efek:** Python adapter tidak memfilter pesan grup berdasarkan whitelist.

---

#### Patch C — Silent Recorder (`adapter.py`)

**File:** `~/.hermes/hermes-agent/plugins/platforms/whatsapp/adapter.py`

**Tambahkan method** sebelum `_build_message_event` (~line 1341):

```python
def _record_group_message_sync(self, data):
    """Record all group messages to JSONL for cron summary (non-blocking)."""
    try:
        import json, os
        chat_id = str(data.get("chatId") or "")
        if not chat_id.endswith("@g.us"):
            return
        body = str(data.get("body") or "").strip()
        if not body:
            return
        log_dir = os.path.expanduser("~/.hermes/platforms/whatsapp/group_logs")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, f"{chat_id}.jsonl")
        entry = {
            "ts": data.get("timestamp", 0),
            "sender": str(data.get("senderName") or data.get("senderId") or ""),
            "body": body,
        }
        with open(log_file, "a") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except Exception:
        pass  # never block message processing on logging failure
```

**Tambahkan di `_build_message_event`**, sebelum `if not self._should_process_message(data):`

```python
# PATCHED: Record all group messages for cron summary
if data.get("isGroup", False):
    self._record_group_message_sync(data)
```

**Efek:** Setiap pesan grup ditulis ke file JSONL tanpa mengganggu processing normal.

---

### Step 3: Environment Variable

Tambahkan ke environment config Hermes:

```bash
# Require @mention for bot response in groups (messages still recorded)
WHATSAPP_REQUIRE_MENTION=true
```

---

### Step 4: Restart Gateway

```bash
hermes gateway restart
```

> 💡 Jika restart dari dalam gateway diblokir, jalankan dari **terminal SSH terpisah**.

---

### Step 5: Verifikasi

Kirim **satu pesan test** di grup WhatsApp mana pun, lalu:

```bash
# Cek file log per grup
ls -la ~/.hermes/platforms/whatsapp/group_logs/

# Lihat isi log (ganti <chat_id> dgn ID grup)
cat ~/.hermes/platforms/whatsapp/group_logs/<chat_id>@g.us.jsonl | tail -5
```

Harusnya muncul pesan test tadi dengan format JSON:
```json
{"ts": 1783736100, "sender": "Nama Kamu", "body": "test"}
```

---

### Step 6: Setup Cron Jobs

#### 6a. Dapatkan Group ID

Tag Hermes di grup target: **"apa id grup ini?"**  
Hermes akan membalas dengan format `` `123456789@g.us` ``

#### 6b. Buat Cron Jobs via Hermes

```
Morning: schedule = 0 0 * * *  (07:00 WIB)
Evening: schedule = 0 16 * * * (23:00 WIB)
Deliver: whatsapp:<chat_id>@g.us
```

**Prompt Normal:**
```
Kamu adalah bot ringkasan. HANYA OUTPUT RINGKASAN. Baca ~/.hermes/platforms/whatsapp/group_logs/<CHAT_ID>.jsonl, filter 12 jam (ts=UNIX timestamp). TANPA blank line:

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

---

## 🔥 Mode Roast

Untuk mengaktifkan versi sarkas/lucu, update prompt cron job dengan:

```
Kamu adalah bot ringkasan versi ROAST. Gaya: sarkas, lucu, roasting anggota grup tapi tetap friendly — kayak temen yg galak tapi sayang.

*Summary Roast — 12 jam terakhir 🔥*
- *Yang Paling Nyablak*
- [siapa paling rame + roast ringan]
- *Drama & Perdebatan*
- [topik panas + komentar sarkas]
- *Receh Tapi Menghibur*
- [chat random lucu/absurd]
- *Keputusan (yg akhirnya diambil setelah debat panjang)*
- [keputusan]
- *PR Yang Belum Kelar*
- [Nama]: [action + roast]
- *Pertanyaan Nyangkut*
- [pertanyaan + "ada yg bisa jawab ga nih?"]
- *Link Berserakan*
- [Nama]: [desc] — [URL]

ATURAN: Roast friendly, bukan bully. No metadata, no blank line.
```

Toggle via Hermes: **"ubah <nama_grup> ke mode roast"** / **"balikin <nama_grup> ke normal"**

---

## 📁 Struktur Repo

```
whatsapp-group-summary/
├── README.md                              ← Kamu di sini
├── logo.jpg                               ← Logo bot
├── SKILL.md                               ← Skill utama (Hermes format)
└── references/
    ├── bridge-api.md                      ← WhatsApp bridge API reference
    ├── record-all-group-messages.md       ← Recording architecture detail
    ├── user-format-reference.md           ← Format referensi dari user
    ├── verify-recording.md                ← Langkah verifikasi recording
    ├── whatsapp-bridge-limitations.md     ← Batasan bridge WhatsApp
    └── whatsapp-group-ids.md              ← Daftar ID grup yang di-manage
```

---

## 🛠️ Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| `group_logs/` kosong | Patch A/B/C belum applied | Re-apply patch, restart gateway |
| Recording jalan tapi bot tetep respon | `WHATSAPP_REQUIRE_MENTION` belum di-set | Pastikan ada di `.env`, restart gateway |
| Cron output ada `Cronjob Response:...` | Normal — hanya muncul di DM delivery | Delivery ke grup WhatsApp langsung clean |
| Patch hilang setelah `hermes update` | Update menimpa source | Re-apply patch A/B/C setiap update |
| `gateway restart` diblokir | Berjalan dari dalam session Hermes | Restart dari terminal SSH terpisah |
| Blank lines di output summary | Prompt kurang "TANPA blank line" | Update prompt — tambahkan constraint |
| Bridge ga kirim pesan grup | `WHATSAPP_GROUP_POLICY` bukan `open` | Set `WHATSAPP_GROUP_POLICY=open` di `.env` |

---

## ⚡ Quick Re-Apply After Update

Setelah `hermes update`, jalankan:

```bash
# Re-apply semua patch dari repo
cd ~/.hermes/skills/whatsapp-group-summary-bot
# Patch A: bridge.js
sed -i 's/if (WHATSAPP_DM_POLICY/if (!isGroup \&\& WHATSAPP_DM_POLICY/' \
  ~/.hermes/hermes-agent/scripts/whatsapp-bridge/bridge.js
# Restart gateway
hermes gateway restart
```

> Patch B & C perlu di-apply manual karena lebih kompleks. Cek `SKILL.md` untuk detail.

---

## 📝 License

MIT © [mocasus](https://github.com/mocasus)

---

<p align="center">
  <sub>Dibuat dengan ☕ dan sedikit roasting 🔥</sub>
</p>
