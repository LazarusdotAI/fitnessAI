export interface FitnessAnalysis {
  motivationAnalysis: {
    underlyingMotivations: string[];
    readinessScore: number;
    analysisFactors: {
      motivation: number;
      commitment: number;
      fitnessLevel: number;
      lifestyle: number;
      narrativeFactor: number;
    };
  };
  milestones: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
    explanation: string;
  };
  successPrediction: {
    successProbability: number;
    confidenceScore: number;
    keyFactors: string[];
    recommendations: string[];
  };
  timelinePrediction: {
    estimatedWeeks: number;
    confidenceScore: number;
    keyFactors: string[];
    recommendations: string[];
  };
}

export interface FitnessAssessmentResult {
  assessment: {
    basicInfo: {
      age: number;
      gender: string;
      heightFeet: number;
      heightInches: number;
      weight: string;
    };
    fitnessProfile: {
      fitnessGoal: string;
      experienceLevel: string;
      currentActivityLevel: string;
      workoutPreferences: string[];
    };
    lifestyle: {
      occupationType: string;
      workSchedule: string;
      timeCommitment: number;
      sleepQuality: number;
      stressLevel: number;
    };
  };
  analysis: FitnessAnalysis;
}
