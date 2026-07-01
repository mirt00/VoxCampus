# VoxCampus — Algorithm Documentation

This document describes all five algorithms implemented in the `algo-service` (Python FastAPI). Each algorithm is isolated in its own service module under `app/services/` and exposed through a dedicated router under `app/routers/`.

---

## Service Overview

```
algo-service/
└── app/
    ├── main.py                     # FastAPI app, CORS, router registration
    ├── routers/
    │   ├── rank.py                 # Algorithm A — TDE-Rank
    │   ├── duplicate.py            # Algorithm B — Cosine Similarity / Jaccard
    │   ├── escalate.py             # Algorithm C — PBE Escalation
    │   ├── moderation.py           # Algorithm D — MLCM Content Moderation
    │   └── engagement.py           # Algorithm E — Engagement Scoring
    ├── services/
    │   ├── tde_rank.py
    │   ├── cosine_similarity.py
    │   ├── pbe_escalation.py
    │   ├── mlcm.py
    │   └── engagement.py
    ├── schemas/                    # Pydantic request/response models
    └── utils/
        ├── text_cleaner.py         # Lowercase, remove punctuation, strip stop words
        └── blocklist.py            # Vulgar word list + spam regex patterns
```

---

## Algorithm A — TDE-Rank (Trending Score)

**File:** `app/services/tde_rank.py`
**Endpoint:** `POST /rank`

### Purpose

Scores each post for the **Trending** feed tab. Posts with more votes that were submitted recently rank higher. Older posts decay in score over time even if they have many votes.

### Formula

```
score = votes / (age_hours + 2) ^ gravity
```

| Parameter | Description | Default |
|---|---|---|
| `votes` | Total vote count on the post | — |
| `age_hours` | Hours since post was submitted | — |
| `gravity` | Controls how fast score decays with age | `1.8` |

### How it works

- `(age_hours + 2)` — the `+2` prevents division by zero for brand-new posts and gives a small boost to very new posts
- Raising it to the power of `gravity` (1.8) makes age decay non-linear — a post doubles in age impact faster than it doubles in hours
- A post with 50 votes at 1 hour old scores significantly higher than the same post at 48 hours old

### Example

```
votes=50, age_hours=2, gravity=1.8
score = 50 / (2 + 2)^1.8 = 50 / 11.31 = 4.42

votes=50, age_hours=48, gravity=1.8
score = 50 / (48 + 2)^1.8 = 50 / 1452.5 = 0.034
```

### Request / Response

```json
POST /rank
{
  "votes": 50,
  "age_hours": 2.5,
  "gravity": 1.8
}

Response:
{
  "score": 4.21
}
```

---

## Algorithm B — Cosine Similarity with Jaccard Fallback (Duplicate Detection)

**File:** `app/services/cosine_similarity.py`
**Endpoint:** `POST /duplicate-check`

### Purpose

Detects near-identical submissions before saving a new post. If the incoming suggestion is too similar to an existing one, the user is redirected to upvote the existing post instead of creating a duplicate.

### How it works

#### Step 1 — Text Cleaning (via `utils/text_cleaner.py`)

Before comparison, all text is normalized:
- Convert to lowercase
- Remove all punctuation and non-alphanumeric characters
- Strip common English stop words (`the`, `a`, `is`, `in`, `on`, `at`, etc.)

#### Step 2 — TF-IDF Cosine Similarity

For each existing post, the new post's title is compared against the existing title, and the new post's body is compared against the existing body:

```
TF-IDF vectorize both texts → cosine_similarity(vector_A, vector_B)
```

**TF-IDF** (Term Frequency–Inverse Document Frequency) weights rare words more heavily than common ones, making the comparison semantically meaningful rather than just counting shared words.

#### Step 3 — Jaccard Fallback

If TF-IDF cosine returns `0.0` (e.g. texts are too short, no shared vocabulary after cleaning), the system falls back to **Jaccard similarity**:

```
jaccard = |words_A ∩ words_B| / |words_A ∪ words_B|
```

#### Step 4 — Combined Score & Duplicate Decision

A combined score is computed, weighted toward title (titles are more discriminative than body text):

```
combined = max(title_sim, title_sim * 0.6 + body_sim * 0.4)
```

A post is flagged as **duplicate** if:
- `title_similarity >= 0.85` (threshold), OR
- `title_similarity >= 0.5 AND body_similarity >= 0.5` (partial match on both)

### Threshold

| Score | Meaning |
|---|---|
| `>= 0.85` | Duplicate — block submission, redirect to existing post |
| `0.5–0.84` | Partial match — allowed through |
| `< 0.5` | Not a duplicate |

### Request / Response

```json
POST /duplicate-check
{
  "new_title": "Fix the broken water cooler in Block B",
  "new_body": "The water cooler on the second floor has been broken for two weeks.",
  "existing_posts": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "title": "Water cooler in Block B not working",
      "body": "The water cooler is broken on the 2nd floor since last week."
    }
  ]
}

Response:
{
  "is_duplicate": true,
  "score": 0.91,
  "matched_post_id": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

---

## Algorithm C — Priority-Based Escalation (PBE)

**File:** `app/services/pbe_escalation.py`
**Endpoint:** `POST /escalate-check`

### Purpose

Determines whether an unresolved post has been waiting too long and should be escalated to higher authority. The deadline is adjusted by the **category weight** — more critical categories escalate sooner.

### Formula

```
deadline_hours = threshold_hours × category_weight
should_escalate = hours_elapsed >= deadline_hours
```

| Parameter | Description | Default |
|---|---|---|
| `submitted_at` | ISO datetime when the post was created | — |
| `category_weight` | Multiplier from the category (e.g. `0.5` for urgent, `2.0` for low priority) | — |
| `threshold_hours` | Base hours before escalation | `48` |

### How category weight affects deadline

| Category Weight | Base Threshold | Effective Deadline |
|---|---|---|
| `0.5` (e.g. Infrastructure — urgent) | 48 hrs | **24 hours** |
| `1.0` (e.g. General) | 48 hrs | **48 hours** |
| `2.0` (e.g. Suggestions — low priority) | 48 hrs | **96 hours** |

### Escalation flow

This is called by the **hourly cron job** in `server/src/jobs/escalation.job.js`:

1. Fetch all `pending` posts where `isEscalated = false`
2. Call `POST /escalate-check` for each
3. If `should_escalate = true` → mark post `isEscalated = true`, write to `EscalationLog`, send email alert

### Request / Response

```json
POST /escalate-check
{
  "submitted_at": "2024-01-15T10:00:00Z",
  "category_weight": 0.5,
  "threshold_hours": 48
}

Response:
{
  "should_escalate": true,
  "deadline_hours": 24.0,
  "hours_elapsed": 26.5
}
```

---

## Algorithm D — MLCM Content Moderation (Multi-Layer Content Moderation)

**File:** `app/services/mlcm.py`
**Endpoint:** `POST /moderate`

### Purpose

Filters out toxic, vulgar, spammy, or off-topic content before a suggestion is saved. Uses three progressive layers — each faster and cheaper than the next. A submission is blocked if it fails any layer.

### 3-Layer Pipeline

```
Submission Text
      │
      ▼
┌─────────────────────────────────────┐
│  LAYER 1 — Keyword & Regex Filter   │  ← Fastest — runs always
│  • Blocklist: vulgar / hate words   │
│  • Spam patterns: repeated chars,   │
│    all-caps, URLs, phone numbers,   │
│    spam phrases (free, win prize…)  │
└──────────┬──────────────────────────┘
           │ PASS
           ▼
┌─────────────────────────────────────┐
│  LAYER 2 — ML Toxicity Score        │  ← Detoxify model (lazy-loaded)
│  • score > 0.75  → blocked          │
│  • score 0.50–0.75 → flagged        │
│    (let through, warn admin)        │
│  • score < 0.50  → clean            │
└──────────┬──────────────────────────┘
           │ PASS
           ▼
┌─────────────────────────────────────┐
│  LAYER 3 — Campus Relevance Check   │  ← Keyword list
│  Checks for campus-related terms:   │
│  library, wifi, canteen, hostel,    │
│  exam, fees, classroom, lab, etc.   │
│  Short text (<40 chars) with no     │
│  campus keyword → blocked           │
└──────────┬──────────────────────────┘
           │ PASS
           ▼
        ALLOWED
```

### Layer 1 — Blocklist details

**Vulgar words** (English + Nepali Roman script):
- English: `damn`, `idiot`, `stupid`, `fool`, `hate`, `kill`, `bastard`, etc.
- Nepali: `muji`, `randi`, `kutta`, `sala`, `gadhaa`, `chutiya`, etc.

**Spam patterns (regex):**
| Pattern | Reason |
|---|---|
| Character repeated 4+ times (e.g. `hellooooo`) | Spam |
| 6+ consonants in a row | Random keyboard mashing |
| All uppercase, 10+ chars | Aggressive tone |
| URLs (`http://`, `www.`) | External link spam |
| 10-digit number | Phone number harvesting |
| Phrases: `free`, `win prize`, `click here`, `buy now` | Promotional spam |

### Layer 2 — ML Toxicity

Uses the [Detoxify](https://github.com/unitaryai/detoxify) `original` model (lazy-loaded on first call to avoid slow startup). The model returns a `toxicity` score between 0 and 1.

> If Detoxify is not installed or fails to load, Layer 2 is skipped silently — the system **fails open** so real complaints are never blocked by a crash.

### Layer 3 — Campus Relevance

Checks if the combined text contains any of ~45 campus-related keywords. Only triggers for **short submissions** (under 40 characters) — longer posts are assumed to be genuine even without a keyword match.

Campus keywords include: `library`, `canteen`, `hostel`, `wifi`, `classroom`, `toilet`, `parking`, `faculty`, `exam`, `fees`, `transport`, `lab`, `computer`, `security`, `gate`, and more.

### Response fields

```json
POST /moderate
{
  "title": "Free money click here",
  "body": "Win a prize now!!!"
}

Response:
{
  "passed": false,
  "flagged": false,
  "layer_blocked": 1,
  "reason": "spam_phrase",
  "toxicity_score": 0.0,
  "matched_word": "free",
  "processing_time_ms": 1.42
}
```

| Field | Description |
|---|---|
| `passed` | `true` if the post is allowed through |
| `flagged` | `true` if borderline (passed but admin should review) |
| `layer_blocked` | Which layer blocked it (`1`, `2`, `3`, or `null`) |
| `reason` | Why it was blocked (`blocked_keyword`, `spam_pattern`, `toxic_content`, `irrelevant`) |
| `toxicity_score` | Raw ML score (0–1) |
| `matched_word` | The specific word/pattern that triggered the block |
| `processing_time_ms` | Time taken to run all layers |

---

## Algorithm E — Engagement Scoring

**File:** `app/services/engagement.py`
**Endpoint:** `POST /engagement`

### Purpose

Ranks students by their participation level on the platform. Used in the **Reports** section to show the most active contributors. Balances post creation (weighted more heavily) against voting activity, normalized by how long the user has been active.

### Formula

```
raw_score = (POST_WEIGHT × post_count) + (VOTE_WEIGHT × vote_count)
time_factor = log(days_since_first_activity + e)
engagement_score = raw_score / time_factor
```

| Constant | Value | Reason |
|---|---|---|
| `POST_WEIGHT` | `3.0` | Creating a post requires more effort than voting |
| `VOTE_WEIGHT` | `1.0` | Voting is lightweight participation |

### Time normalization

The logarithm prevents long-tenured users from dominating just because they've been around longer. A newer user who posts frequently can outscore an older user who has been inactive.

- `days_since_first_activity < 1` is clamped to `1` to avoid log(0)
- Using `log(days + e)` (where `e ≈ 2.718`) ensures the factor never drops below 1

### Example

```
User A: 10 posts, 30 votes, 30 days active
raw = (3 × 10) + (1 × 30) = 60
time_factor = log(30 + 2.718) = 3.49
score = 60 / 3.49 = 17.19

User B: 2 posts, 5 votes, 3 days active
raw = (3 × 2) + (1 × 5) = 11
time_factor = log(3 + 2.718) = 1.74
score = 11 / 1.74 = 6.32
```

### Request / Response

```json
POST /engagement
{
  "users": [
    {
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Amit Sharma",
      "faculty": "BCA",
      "postCount": 10,
      "voteCount": 30,
      "daysSinceFirstActivity": 30
    }
  ]
}

Response:
{
  "users": [
    {
      "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Amit Sharma",
      "faculty": "BCA",
      "postCount": 10,
      "voteCount": 30,
      "engagementScore": 17.19
    }
  ],
  "summary": {
    "totalUsers": 1,
    "averageEngagement": 17.19,
    "totalPostsCreated": 10,
    "totalVotesCast": 30
  }
}
```

---

## Text Preprocessing (Shared Utility)

**File:** `app/utils/text_cleaner.py`

Used by Algorithm B (duplicate check) before vectorization.

```python
def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)   # remove punctuation
    words = [w for w in text.split() if w not in STOP_WORDS]
    return " ".join(words)
```

**Stop words removed:** `the`, `a`, `an`, `is`, `it`, `in`, `on`, `at`, `to`, `for`, `of`, `and`, `or`, `but`, `with`, `this`, `that`

---

## Algorithm Summary Table

| # | Name | Endpoint | Method | Purpose |
|---|---|---|---|---|
| A | TDE-Rank | `/rank` | POST | Score posts for trending feed |
| B | Cosine Similarity + Jaccard | `/duplicate-check` | POST | Block duplicate submissions |
| C | Priority-Based Escalation (PBE) | `/escalate-check` | POST | Auto-escalate overdue posts |
| D | Multi-Layer Content Moderation (MLCM) | `/moderate` | POST | Filter toxic/spam/irrelevant content |
| E | Engagement Scoring | `/engagement` | POST | Rank users by participation |

---

## Health Check

```
GET /health
→ { "status": "ok" }
```

Used by the backend and deployment platform to verify the service is running.
