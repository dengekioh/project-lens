from pydantic import BaseModel
from typing import List, Optional

# Request
class ScrapeRequest(BaseModel):
    url: str

# Response Models (Nested)

class MetaInfo(BaseModel):
    is_political: bool  # V6.1 新增
    political_spectrum_score: int
    political_leaning_label: str
    clickbait_score: int
    clickbait_verdict: str

class NarrativeMode(BaseModel):
    is_heavy_quoting: bool
    primary_quoted_voice: str
    author_voice_presence: str
    cognitive_tactic: str  # V6.1 新增：認知作戰手法

class EntityAnalysis(BaseModel):
    name: str
    alignment_score: int  # V6.1 改名：立場一致性分數
    author_stance: str
    analysis: str

class InsiderCritique(BaseModel):
    summary: str
    commentary: str

class AIAnalysisResult(BaseModel):
    meta: MetaInfo
    narrative_mode: NarrativeMode
    entity_analysis: List[EntityAnalysis]
    insider_critique: InsiderCritique

# API Final Response
class ScrapeResponse(BaseModel):
    title: str
    content: str
    url: str
    analysis: AIAnalysisResult