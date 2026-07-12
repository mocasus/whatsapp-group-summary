# User's Reference Format

This is the canonical format for WhatsApp group summaries. Match the style, tone, and structure closely.

```
*Summary General — 12 jam terakhir ‼️*

*Inti Diskusi*
- **Kiro model Opus & Sonnet ilang** — User yang login via SSO/AWS kehilangan model Opus. Login via Azure, Kiro startup, dan Kiro power masih aman. Spekulasi: Anthropic ban API access dari region tertentu. Workaround: coba VPN US. Gozali share issue terkait.
- **Marketku banjir restock & produk baru** — Kiro Garansi 7 hari (85k), AI Router Opus 4.8/Sonnet 5/GPT-5.6, Telegram akun siap pakai (5k), ChatGPT K12 EDU sale 35% (16k), plus restock rutin GLM 5.2, Deepseek v4 Pro.
- **Deny update** — Rilis kimi-k2.7-code-highspeed (1.5x), semua user otomatis dapat. 9Router fixed.
- **OpenAI hapus pembayaran pihak ketiga** — PayPal, UPI, BLIK, GOPAY udah ga bisa buat beli OpenAI. Marketku buka layanan purna jual.

*Pertanyaan*
- Pras: mas yoga kapan restock apinya?
- Fahmi dwi: cari api router sonnet 4.6 yang murce
- Fajar Cloud: pasaran berapa sekarang? → Dwipa: kiro nguyen 120k
- Mukhlis: QRIS marketku ada potongan? → Marketku.id: ga ada

*Link*
- Gozali: Kiro issue #9331 — https://github.com/kirodotdev/Kiro/issues/9331
- .: Anthropic supported countries — https://www.anthropic.com/supported-countries

Top senders: Marketku.id (30), . (21), Deny (6), Dwipa (5), Fajar Cloud (4)
```

## Key formatting rules:

1. **Title**: `*Summary General — 12 jam terakhir ‼️*` (italic, with ‼️ emoji)
2. **Section headers**: `*italic*` single asterisk — `*Inti Diskusi*`, `*Keputusan*`, `*Pertanyaan*`, `*Link*`
3. **Topic titles**: `**bold**` double asterisk — `- **Title** — description with names`
4. **Blank lines BETWEEN sections OK** — no blank lines within a section
5. **Empty sections = DELETE entirely** — never write "Tidak ada keputusan formal."
6. **Top senders at the end** — `Top senders: Nama (count), ...`
7. **Names**: WhatsApp display name from `sender` field
8. **Casual Indonesian**: "rame bahas", "muter di", "belum jelas"
9. **Links**: sender name, description, full URL
10. **Config**: `cron.wrap_response: false` strips Hermes cron delivery headers

## Schedule

Server timezone = Asia/Shanghai (UTC+8), so WIB = UTC+7:
- Morning 07:00 WIB → `0 8 * * *`
- Evening 23:00 WIB → `0 0 * * *`
