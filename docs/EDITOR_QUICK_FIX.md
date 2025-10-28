# ⚡ Editor Quick Fix - TL;DR

## 🔴 Problem
Editor wasn't working - couldn't save, confusing UX, crashes.

## 🟢 Solution
Run this SQL in Supabase Dashboard → SQL Editor:

```sql
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_lessons_content_blocks
ON lessons USING GIN (content_blocks);

UPDATE lessons SET content_blocks = '[]'::jsonb WHERE content_blocks IS NULL;
```

## ✅ Done!

Now:
1. Go to `/app/editor/{your-course-id}`
2. Click a lesson in timeline
3. Drag blocks from sidebar
4. Edit and save

## 📚 Full Docs
- [EDITOR_SETUP_GUIDE.md](EDITOR_SETUP_GUIDE.md) - Complete guide
- [EDITOR_FIX_SUMMARY.md](EDITOR_FIX_SUMMARY.md) - Detailed fix explanation

---
**That's it! The editor now works.** 🎉
