import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/lib/supabase";

export function useNotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw error;
      }

      if (data) {
        setSettings(data.settings);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          email: {
            courseUpdates: true,
            newCourses: false,
            marketing: false,
            weeklyDigest: true,
          },
          push: {
            assignmentReminders: true,
            achievements: true,
            deadlines: true,
          },
          inApp: {
            messages: true,
            announcements: true,
          },
        };

        await createSettings(defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const createSettings = async (newSettings) => {
    const { error } = await supabase
      .from("notification_settings")
      .insert({
        user_id: user.id,
        settings: newSettings,
      });

    if (error) {
      throw error;
    }
  };

  const updateSettings = async (newSettings) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          settings: newSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw error;
      }

      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings,
  };
}