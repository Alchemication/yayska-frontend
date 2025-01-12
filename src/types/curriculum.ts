// src/types/curriculum.ts
export interface ConceptMetadata {
  concept_id: number;
  concept_name: string;
  concept_description: string;
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
    quick_learner: LearnerTimeGuide;
    typical_learner: LearnerTimeGuide;
    additional_support: LearnerTimeGuide;
  };
  assessment_approaches: {
    reasoning: string;
    suitable_types: string[];
  };
  irish_language_support: {
    educational_terms: IrishTerm[];
  };
}

interface LearnerTimeGuide {
  weeks_to_master: number;
  sessions_per_week: number;
  minutes_per_session: number;
}

interface IrishTerm {
  irish: string;
  english: string;
  example: string;
  pronunciation: string;
}

export interface Complexity {
  level: number;
  description: string;
}

export interface ConceptInPath {
  id: number;
  name: string;
  description: string;
  complexity: Complexity;
  learning_objectives: string[];
  display_order: number;
}

export interface SubjectLearningPath {
  id: number;
  name: string;
  concepts: ConceptInPath[];
}

export interface LearningPathsResponse {
  subjects: SubjectLearningPath[];
}
