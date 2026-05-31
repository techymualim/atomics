import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { notificationApi } from "./notification-api";
import { useAuthContext } from "../auth/auth-context";

const REMINDER_PREF_KEY = "atomics:dailyReminder";
const REMINDER_ID = "daily-checkin";

// Foreground notifications: show a banner + play sound.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Daily check-in",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

/**
 * Registers the device with Firebase Cloud Messaging (via Expo's push service)
 * and returns the Expo push token. On Android this resolves through FCM using
 * the google-services.json configured in app.json.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  await ensureAndroidChannel();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== "granted") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return tokenResponse.data;
}

/**
 * Business logic for notifications: owns the permission flow, syncs the push
 * token to Supabase, and manages the local daily check-in reminder.
 */
export function useNotificationService() {
  const { user } = useAuthContext();
  const [reminderOn, setReminderOn] = useState(false);
  const [hour, setHour] = useState(9);

  useEffect(() => {
    SecureStore.getItemAsync(REMINDER_PREF_KEY).then((v) => {
      if (v) {
        const parsed = JSON.parse(v) as { on: boolean; hour: number };
        setReminderOn(parsed.on);
        setHour(parsed.hour ?? 9);
      }
    });
  }, []);

  // Register the push token once the user is authenticated.
  useEffect(() => {
    if (!user) return;
    let active = true;
    registerForPushNotifications()
      .then((token) => {
        if (active && token) {
          notificationApi
            .savePushToken(user.id, token, Platform.OS)
            .catch(() => undefined);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user]);

  const scheduleDailyReminder = useCallback(async (atHour: number) => {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(
      () => undefined
    );
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: "ATOMICS",
        body: "Did the new move run today? Two seconds to log it.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: atHour,
        minute: 0,
      },
    });
  }, []);

  const persistPref = useCallback((on: boolean, atHour: number) => {
    SecureStore.setItemAsync(
      REMINDER_PREF_KEY,
      JSON.stringify({ on, hour: atHour })
    ).catch(() => undefined);
  }, []);

  const toggleReminder = useCallback(async () => {
    const granted = await registerForPushNotifications();
    if (!reminderOn) {
      if (!granted) return false;
      await scheduleDailyReminder(hour);
      setReminderOn(true);
      persistPref(true, hour);
      return true;
    }
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(
      () => undefined
    );
    setReminderOn(false);
    persistPref(false, hour);
    return false;
  }, [reminderOn, hour, scheduleDailyReminder, persistPref]);

  return { reminderOn, hour, toggleReminder };
}
