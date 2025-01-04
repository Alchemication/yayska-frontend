// src/types/curriculum.ts
export interface Subject {
  id: number;
  subject_name: string;
  area_name: string;
}

export interface Topic {
  id: number;
  strand_name: string;
}

export interface Concept {
  id: number;
  concept_name: string;
  description: string;
  difficulty_level: number;
  topic_id: number;
}

// You might want to add more specific types based on your API responses
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

export interface SubjectsResponse {
  subjects: Subject[];
}

export interface TopicsResponse {
  strands: Topic[];
}

export interface ConceptsResponse {
  concepts: Concept[];
}

export interface KeyConcept {
  id: number;
  name: string;
  description: string;
}

export interface LearningGoal {
  id: number;
  topic: string;
  what_child_will_learn: string;
  complexity_level: number;
  complexity_description: string;
  key_concepts: KeyConcept[];
}

export interface SubjectLearningPath {
  id: number;
  subject_name: string;
  learning_goals: Record<number, LearningGoal>;
}

export interface LearningPathsResponse {
  subjects: SubjectLearningPath[];
}
