
export interface Recommendation {
  id: string;
  type: 'budget' | 'targeting' | 'creative' | 'timing' | 'bidding';
  title: string;
  description: string;
  impact: {
    metric: string;
    expectedChange: number;
    confidence: number;
  };
  actionSteps: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImplementationTime: number; // en minutes
  resources: string[];
}

export interface ActionableTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
  assignee?: string;
}
