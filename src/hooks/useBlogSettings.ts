
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BlogSettings, BlogSettingsService } from '@/services/blogSettingsService';

export const useBlogSettings = () => {
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Charger les paramètres au montage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await BlogSettingsService.loadSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Sauvegarder les paramètres
  const saveSettings = useCallback(async (newSettings: BlogSettings) => {
    setSaving(true);
    try {
      await BlogSettingsService.saveSettings(newSettings);
      setSettings(newSettings);
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès"
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [toast]);

  // Mettre à jour un paramètre
  const updateSetting = useCallback(<K extends keyof BlogSettings>(
    key: K, 
    value: BlogSettings[K]
  ) => {
    if (settings) {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
    }
  }, [settings]);

  // Réinitialiser les paramètres
  const resetSettings = useCallback(async () => {
    try {
      const defaultSettings = await BlogSettingsService.resetSettings();
      setSettings(defaultSettings);
      toast({
        title: "Paramètres réinitialisés",
        description: "Les paramètres ont été remis aux valeurs par défaut"
      });
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les paramètres",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    updateSetting,
    resetSettings
  };
};
