import { FitnessAssessmentFormData } from "../components/FitnessAssessment";
import { PsychologicalAssessmentData } from "../components/PsychologicalAssessment";

interface WorkoutPlanResponse {
  workoutPlan: {
    message: string;
    biology?: string;
    psychology?: string;
    suggestions: string[];
    psychologicalFactors: {
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
      milestones: {
        shortTerm: string[];
        midTerm: string[];
        longTerm: string[];
        explanation: string;
      };
    };
  };
}

export async function generateWorkoutPlan(
  fitnessAssessment: FitnessAssessmentFormData,
  psychologicalAssessment: PsychologicalAssessmentData
): Promise<WorkoutPlanResponse> {
  try {
    const response = await fetch('/api/generate-workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fitnessAssessment,
        psychologicalAssessment
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate workout plan');
    }

    return await response.json();
  } catch (error) {
    console.error('Workout plan generation error:', error);
    throw error;
  }
}

export function formatWorkoutPlan(workoutPlan: WorkoutPlanResponse): string {
  const { psychologicalFactors } = workoutPlan.workoutPlan;
  const { motivationAnalysis, successPrediction, timelinePrediction, milestones } = psychologicalFactors;

  return `
🏋️‍♂️ Your Personalized Workout Plan

${workoutPlan.workoutPlan.message}

🧬 Biological Impact
${workoutPlan.workoutPlan.biology || 'Not specified'}

🧠 Psychological Considerations
${workoutPlan.workoutPlan.psychology || 'Not specified'}

📊 Success Analysis
- Success Probability: ${successPrediction.successProbability}%
- Confidence Score: ${successPrediction.confidenceScore}%
- Key Factors: ${successPrediction.keyFactors.join(', ')}

⏱️ Timeline
- Estimated Duration: ${timelinePrediction.estimatedWeeks} weeks
- Key Timeline Factors: ${timelinePrediction.keyFactors.join(', ')}

🎯 Milestones
Short Term (1-3 months):
${milestones.shortTerm.map(goal => `- ${goal}`).join('\n')}

Mid Term (3-6 months):
${milestones.midTerm.map(goal => `- ${goal}`).join('\n')}

Long Term (6-12 months):
${milestones.longTerm.map(goal => `- ${goal}`).join('\n')}

💪 Motivation Analysis
- Readiness Score: ${motivationAnalysis.readinessScore}/100
- Key Motivators: ${motivationAnalysis.underlyingMotivations.join(', ')}

📝 Recommendations
${successPrediction.recommendations.map(rec => `- ${rec}`).join('\n')}

Next Steps:
${workoutPlan.workoutPlan.suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
`;
}
