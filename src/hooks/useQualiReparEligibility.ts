import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QualiReparEligibilityRule, EligibilityCheckResult } from '@/types/qualirepar';
import { toast } from 'sonner';

export const useQualiReparEligibility = () => {
  const [rules, setRules] = useState<QualiReparEligibilityRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEligibilityRules = async () => {
    try {
      const { data, error } = await supabase
        .from('qualirepar_eligibility_rules')
        .select('*')
        .eq('is_active', true)
        .order('product_category', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading eligibility rules:', error);
      toast.error('Erreur lors du chargement des règles d\'éligibilité');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = (
    productCategory: string,
    brand: string,
    model: string,
    repairCost: number
  ): EligibilityCheckResult => {
    // Recherche d'une règle spécifique pour la marque et le modèle
    let applicableRule = rules.find(rule => 
      rule.product_category.toLowerCase() === productCategory.toLowerCase() &&
      rule.brand?.toLowerCase() === brand.toLowerCase() &&
      rule.model?.toLowerCase() === model.toLowerCase()
    );

    // Si pas trouvé, recherche d'une règle pour la marque seulement
    if (!applicableRule) {
      applicableRule = rules.find(rule => 
        rule.product_category.toLowerCase() === productCategory.toLowerCase() &&
        rule.brand?.toLowerCase() === brand.toLowerCase() &&
        !rule.model
      );
    }

    // Si pas trouvé, recherche d'une règle générale pour la catégorie
    if (!applicableRule) {
      applicableRule = rules.find(rule => 
        rule.product_category.toLowerCase() === productCategory.toLowerCase() &&
        !rule.brand &&
        !rule.model
      );
    }

    if (!applicableRule) {
      return {
        isEligible: false,
        reason: `Aucune règle trouvée pour ${productCategory} ${brand} ${model}`
      };
    }

    // Vérifier le coût minimum de réparation
    if (applicableRule.min_repair_cost && repairCost < applicableRule.min_repair_cost) {
      return {
        isEligible: false,
        rule: applicableRule,
        reason: `Coût de réparation insuffisant (minimum: ${applicableRule.min_repair_cost}€)`
      };
    }

    // Vérifier la validité temporelle
    const now = new Date();
    const validFrom = new Date(applicableRule.valid_from);
    const validUntil = applicableRule.valid_until ? new Date(applicableRule.valid_until) : null;

    if (now < validFrom || (validUntil && now > validUntil)) {
      return {
        isEligible: false,
        rule: applicableRule,
        reason: 'Règle non valide pour cette période'
      };
    }

    return {
      isEligible: true,
      rule: applicableRule,
      maxBonusAmount: applicableRule.max_bonus_amount,
      ecoOrganism: applicableRule.eco_organism
    };
  };

  const getEligibleCategories = (): string[] => {
    return [...new Set(rules.map(rule => rule.product_category))];
  };

  const getRulesForCategory = (category: string): QualiReparEligibilityRule[] => {
    return rules.filter(rule => rule.product_category.toLowerCase() === category.toLowerCase());
  };

  useEffect(() => {
    loadEligibilityRules();
  }, []);

  return {
    rules,
    loading,
    checkEligibility,
    getEligibleCategories,
    getRulesForCategory,
    reload: loadEligibilityRules
  };
};