import { getMessaging, getToken } from "firebase/messaging";
import { initializeApp, getApps } from "firebase/app";
import { supabase } from "../config/supabase";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export async function setupPushNotifications(userId: string) {
  console.log("Setting up push for user:", userId);
  const permission = await Notification.requestPermission();
  console.log("Permission result:", permission);
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });
  console.log("VAPID key:", import.meta.env.VITE_FIREBASE_VAPID_KEY);
  console.log("FCM token generated:", token);

  const { error } = await supabase.from("profiles").update({ fcm_token: token }).eq("id", userId);
  if (error) console.error("Failed to save token:", error);
}