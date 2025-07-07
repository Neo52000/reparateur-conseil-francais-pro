-- Ajout de tables pour l'apprentissage automatique du chatbot

-- Table pour stocker les feedbacks des utilisateurs sur les réponses du chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_response_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.chatbot_messages(id) ON DELETE CASCADE,
    user_id UUID,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('positive', 'negative', 'helpful', 'not_helpful')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'apprentissage automatique des patterns
CREATE TABLE IF NOT EXISTS public.chatbot_learning_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_pattern TEXT NOT NULL,
    successful_response TEXT NOT NULL,
    category TEXT NOT NULL,
    confidence_score NUMERIC DEFAULT 0,
    usage_count INTEGER DEFAULT 1,
    success_rate NUMERIC DEFAULT 1.0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les suggestions d'amélioration générées par l'IA
CREATE TABLE IF NOT EXISTS public.chatbot_improvement_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL,
    original_message TEXT NOT NULL,
    suggested_response TEXT NOT NULL,
    ai_confidence NUMERIC DEFAULT 0,
    admin_reviewed BOOLEAN DEFAULT false,
    implemented BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Table pour l'historique des améliorations appliquées
CREATE TABLE IF NOT EXISTS public.chatbot_learning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_type TEXT NOT NULL,
    original_data JSONB,
    new_data JSONB,
    performance_impact NUMERIC,
    applied_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activation RLS
ALTER TABLE public.chatbot_response_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_learning_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour chatbot_response_feedback
CREATE POLICY "Users can create feedback" ON public.chatbot_response_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all feedback" ON public.chatbot_response_feedback
    FOR SELECT USING (get_current_user_role() = 'admin');

-- Politiques RLS pour chatbot_learning_patterns
CREATE POLICY "Admins can manage learning patterns" ON public.chatbot_learning_patterns
    FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour chatbot_improvement_suggestions
CREATE POLICY "Admins can manage improvement suggestions" ON public.chatbot_improvement_suggestions
    FOR ALL USING (get_current_user_role() = 'admin');

-- Politiques RLS pour chatbot_learning_history
CREATE POLICY "Admins can view learning history" ON public.chatbot_learning_history
    FOR SELECT USING (get_current_user_role() = 'admin');

-- Index pour optimiser les performances
CREATE INDEX idx_chatbot_feedback_conversation ON public.chatbot_response_feedback(conversation_id);
CREATE INDEX idx_chatbot_patterns_category ON public.chatbot_learning_patterns(category);
CREATE INDEX idx_chatbot_patterns_confidence ON public.chatbot_learning_patterns(confidence_score DESC);
CREATE INDEX idx_chatbot_suggestions_reviewed ON public.chatbot_improvement_suggestions(admin_reviewed, created_at DESC);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_chatbot_learning_patterns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_chatbot_learning_patterns_updated_at
    BEFORE UPDATE ON public.chatbot_learning_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_learning_patterns_updated_at();