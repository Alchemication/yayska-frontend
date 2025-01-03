// src/types/concept.ts
export interface ConceptMetadata {
  concept_id: number;
  concept_name: string;
  concept_description: string;
  difficulty_level: number;
  why_important: {
    future_learning: string;
    practical_value: string;
    modern_relevance: string;
  };
  difficulty_stats: {
    reassurance: string;
    challenge_rate: number;
    common_barriers: string[];
  };
  parent_guide: {
    key_points: string[];
    quick_tips: string[];
  };
  real_world: {
    examples: string[];
    irish_context: string;
    practice_ideas: string[];
  };
  learning_path: {
    prerequisites: number[];
    success_indicators: string[];
  };
  time_guide: {
    quick_learner: {
      weeks_to_master: number;
      sessions_per_week: number;
      minutes_per_session: number;
    };
    typical_learner: {
      weeks_to_master: number;
      sessions_per_week: number;
      minutes_per_session: number;
    };
    additional_support: {
      weeks_to_master: number;
      sessions_per_week: number;
      minutes_per_session: number;
    };
  };
  assessment_approaches: {
    reasoning: string;
    suitable_types: string[];
  };
  irish_language_support: {
    educational_terms: Array<{
      irish: string;
      english: string;
      example: string;
      pronunciation: string;
    }>;
  };
}
