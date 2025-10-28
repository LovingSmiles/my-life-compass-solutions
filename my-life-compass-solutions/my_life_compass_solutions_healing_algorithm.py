"""
My Life Compass Soltions Healing Algorithm (Starter Implementation)
---------------------------------------------------------
Goal: Turn journaling + mood + community interactions into adaptive, ethical,
and empathy-centered guidance. This module is architected so you can plug in
real NLP/ML models later without changing the public API.

!!! ETHICS FIRST !!!
- Privacy by default: No third-party calls here. All analysis is local.
- No engagement-optimization tricks. We optimize for calm, insight, and growth.
- Safety gates: detect crisis language; escalate to human help or hotlines.
- Transparent scoring: every score is traceable to inputs.

Author: Life_CompassPro
Version: 0.1.0
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple
import math, re, statistics, datetime, json, uuid

# ----------------------------
# Data Schemas
# ----------------------------

@dataclass
class MoodLog:
    timestamp: datetime.datetime
    mood: int  # -5 (very low) to +5 (very high)
    energy: int = 0  # -5..+5 (optional)
    anxiety: int = 0  # -5..+5 (optional)

@dataclass
class JournalEntry:
    id: str
    user_id: str
    timestamp: datetime.datetime
    text: str
    visibility: str = "private"  # private | circle | community
    tags: List[str] = field(default_factory=list)

@dataclass
class Interaction:
    # Supportive responses, comments, acknowledgments (not "likes")
    timestamp: datetime.datetime
    from_user: str
    to_entry_id: str
    type: str  # 'support', 'resonates', 'question', 'resource'
    weight: float = 1.0

@dataclass
class UserProfile:
    id: str
    created_at: datetime.datetime
    circles: List[str] = field(default_factory=list)  # groups / cohorts
    settings: Dict = field(default_factory=lambda: {
        "share_defaults": "private",
        "crisis_auto_prompt": True,
        "show_growth_visuals": True
    })

# ----------------------------
# Rule-Based NLP (placeholder)
# Replace with real models later
# ----------------------------

CRISIS_KWS = [
    r"\bsuicide\b", r"\bkill myself\b", r"\bself[- ]?harm\b",
    r"\bcutting\b", r"\bno reason to live\b", r"\bending it all\b"
]

NEG_AFFECT = [
    "lonely", "worthless", "hopeless", "ashamed", "guilty",
    "anxious", "panic", "tired", "exhausted", "angry", "rage"
]

POS_AFFECT = [
    "grateful", "hopeful", "calm", "peaceful", "proud",
    "joy", "content", "relieved", "healed"
]

def _contains_any(text: str, patterns: List[str]) -> bool:
    t = text.lower()
    return any(re.search(p, t) for p in patterns)

def crisis_flag(entry: JournalEntry) -> bool:
    """Very conservative crisis flag. Replace with a classifier later."""
    return _contains_any(entry.text, CRISIS_KWS)

def sentiment_score(text: str) -> float:
    """
    Very coarse sentiment: POS (+1) minus NEG (â1), normalized to â1..+1.
    Replace with transformer model later.
    """
    t = text.lower()
    pos = sum(1 for w in POS_AFFECT if w in t)
    neg = sum(1 for w in NEG_AFFECT if w in t)
    if pos == neg == 0:
        return 0.0
    raw = (pos - neg)
    # Normalize via tanh
    return math.tanh(raw / 3.0)

def vulnerability_score(text: str) -> float:
    """
    Heuristic vulnerability score (0..1): longer texts w/ first-person + feeling words
    are treated as more vulnerable. Replace with model later.
    """
    t = text.lower()
    first_person = len(re.findall(r"\b(i|me|my|mine)\b", t))
    feeling_words = len(re.findall(r"\b(feel|feeling|felt|struggle|afraid|scared|ashamed|grief|grieving)\b", t))
    length_factor = min(len(t) / 500.0, 1.0)  # cap at 1
    raw = first_person * 0.1 + feeling_words * 0.2 + length_factor * 0.7
    return max(0.0, min(raw, 1.0))

# ----------------------------
# Growth Metrics
# ----------------------------

@dataclass
class GrowthMetrics:
    sentiment_trend: float          # slope of sentiment over time
    mood_stability: float           # lower variance => higher stability (0..1)
    resilience_index: float         # bounce-back after dips (0..1)
    insight_depth: float            # average vulnerability + reflection markers (0..1)
    last_updated: datetime.datetime

def compute_sentiment_trend(entries: List[JournalEntry]) -> float:
    """Compute simple linear trend of sentiment across entries (normalized â1..+1 slope)."""
    if len(entries) < 2:
        return 0.0
    vals = [sentiment_score(e.text) for e in entries]
    xs = list(range(len(vals)))
    avgx, avgy = statistics.mean(xs), statistics.mean(vals)
    num = sum((x-avgx)*(y-avgy) for x, y in zip(xs, vals))
    den = sum((x-avgx)**2 for x in xs) or 1.0
    slope = num / den
    # normalize slope into â1..+1 by tanh
    return math.tanh(slope)

def compute_mood_stability(moods: List[MoodLog]) -> float:
    """Higher is better. 1.0 = perfectly stable, 0.0 = highly volatile."""
    if len(moods) < 2:
        return 0.5
    vals = [m.mood for m in moods]
    var = statistics.pvariance(vals) if len(vals) > 1 else 0.0
    # Map variance to stability via 1 / (1 + var) in (0,1]
    return 1.0 / (1.0 + var)

def compute_resilience(moods: List[MoodLog]) -> float:
    """
    Simplified resilience: ability to recover from dips.
    We look for dips (<= -2) followed by rebounds (>= +1 within 7 days).
    """
    if not moods:
        return 0.5
    moods_sorted = sorted(moods, key=lambda m: m.timestamp)
    successes, dips = 0, 0
    for i, m in enumerate(moods_sorted):
        if m.mood <= -2:
            dips += 1
            # look ahead 7d for rebound
            cutoff = m.timestamp + datetime.timedelta(days=7)
            rebound = any(n.mood >= 1 and n.timestamp <= cutoff for n in moods_sorted[i+1:])
            if rebound:
                successes += 1
    if dips == 0:
        return 0.6  # neutral positive if no dips
    ratio = successes / dips
    return max(0.0, min(ratio, 1.0))

REFLECTION_MARKERS = ["learned", "realized", "pattern", "trigger", "boundary", "next time", "plan", "practice"]

def compute_insight_depth(entries: List[JournalEntry]) -> float:
    if not entries:
        return 0.0
    scores = []
    for e in entries:
        v = vulnerability_score(e.text)
        r = 1.0 if any(m in e.text.lower() for m in REFLECTION_MARKERS) else 0.0
        scores.append((v*0.7 + r*0.3))
    return sum(scores) / len(scores)

def aggregate_growth(entries: List[JournalEntry], moods: List[MoodLog]) -> GrowthMetrics:
    return GrowthMetrics(
        sentiment_trend = compute_sentiment_trend(entries),
        mood_stability  = compute_mood_stability(moods),
        resilience_index= compute_resilience(moods),
        insight_depth   = compute_insight_depth(entries),
        last_updated    = datetime.datetime.utcnow()
    )

# ----------------------------
# Empathy-Weighted Feed Scoring
# ----------------------------

@dataclass
class FeedItem:
    entry: JournalEntry
    relevance: float
    relationship: float
    vulnerability: float
    need_support: float
    safety_hold: bool = False

def score_feed_item(item: FeedItem) -> float:
    """
    Final score balances relevance + relationship + vulnerability + need.
    Penalize sensationalism (very negative sentiment with low vulnerability).
    """
    base = (
        0.35 * item.relevance +
        0.25 * item.relationship +
        0.25 * item.vulnerability +
        0.15 * item.need_support
    )
    # Sensationalism penalty (heuristic):
    s = sentiment_score(item.entry.text)
    vuln = item.vulnerability
    if s < -0.6 and vuln < 0.2:
        base -= 0.2
    # Safety hold
    if crisis_flag(item.entry):
        item.safety_hold = True
        base = -1.0  # keep out of normal feed; route to safety workflow
    return max(-1.0, min(base, 1.0))

# ----------------------------
# Recommendations (Prompts & Actions)
# ----------------------------

PROMPTS = {
    "grounding": [
        "Name five things you can see, four you can touch, three you can hear.",
        "Breathe box 4-4-4-4. What changes after three rounds?"
    ],
    "insight": [
        "What pattern do you notice in the last week?",
        "What boundary would help you tomorrow?"
    ],
    "gratitude": [
        "Write three small things you appreciated today.",
        "Who supported you this week? Tell them why it mattered."
    ]
}

def recommend_next_step(growth: GrowthMetrics, last_entry: Optional[JournalEntry]) -> Dict:
    """
    Simple policy:
    - If sentiment trend negative and mood unstable => grounding.
    - If neutral but low insight depth => insight prompt.
    - Else => gratitude to reinforce stability.
    """
    if growth.sentiment_trend < -0.2 and growth.mood_stability < 0.5:
        kind = "grounding"
    elif growth.insight_depth < 0.4:
        kind = "insight"
    else:
        kind = "gratitude"
    return {
        "type": kind,
        "prompt": PROMPTS[kind][0],
        "rationale": {
            "trend": growth.sentiment_trend,
            "stability": growth.mood_stability,
            "insight": growth.insight_depth
        }
    }

# ----------------------------
# Public API Surface
# ----------------------------

class LifeCompassProAlgorithm:
    def __init__(self, user: UserProfile):
        self.user = user
        self.entries: List[JournalEntry] = []
        self.moods: List[MoodLog] = []
        self.interactions: List[Interaction] = []

    # --- ingest ---
    def add_entry(self, text: str, visibility: Optional[str] = None, tags: Optional[List[str]] = None) -> JournalEntry:
        e = JournalEntry(
            id=str(uuid.uuid4()),
            user_id=self.user.id,
            timestamp=datetime.datetime.utcnow(),
            text=text,
            visibility=visibility or self.user.settings.get("share_defaults", "private"),
            tags=tags or []
        )
        self.entries.append(e)
        return e

    def add_mood(self, mood: int, energy: int=0, anxiety: int=0) -> MoodLog:
        m = MoodLog(timestamp=datetime.datetime.utcnow(), mood=mood, energy=energy, anxiety=anxiety)
        self.moods.append(m)
        return m

    def add_interaction(self, inter: Interaction):
        self.interactions.append(inter)

    # --- analytics ---
    def compute_growth(self) -> GrowthMetrics:
        return aggregate_growth(self.entries, self.moods)

    def next_recommendation(self) -> Dict:
        growth = self.compute_growth()
        last = self.entries[-1] if self.entries else None
        return recommend_next_step(growth, last)

    # --- feed scoring example ---
    def score_feed(self, candidates: List[JournalEntry], relationship_lookup: Dict[str, float]) -> List[Tuple[JournalEntry, float, bool]]:
        items = []
        for c in candidates:
            item = FeedItem(
                entry=c,
                relevance=0.7 if any(tag in c.tags for tag in ["anxiety","grief","healing"]) else 0.4,
                relationship=relationship_lookup.get(c.user_id, 0.0),
                vulnerability=vulnerability_score(c.text),
                need_support=max(0.0, -sentiment_score(c.text))  # more negative => more support
            )
            score = score_feed_item(item)
            items.append((c, score, item.safety_hold))
        # sort by score desc, but safety holds are excluded from normal display
        return sorted(items, key=lambda t: t[1], reverse=True)

# ----------------------------
# Quick demo (can be removed in prod)
# ----------------------------
if __name__ == "__main__":
    user = UserProfile(id="u123", created_at=datetime.datetime.utcnow())
    algo = LifeCompassProAlgorithm(user)
    algo.add_mood(0); algo.add_mood(-2); algo.add_mood(1)
    algo.add_entry("I feel anxious but I realized I can set a boundary next time.")
    algo.add_entry("Today I am grateful and calm after practice.", visibility="circle", tags=["gratitude"])
    growth = algo.compute_growth()
    print("Growth Metrics:", asdict(growth))
    print("Next Recommendation:", json.dumps(algo.next_recommendation(), indent=2))
