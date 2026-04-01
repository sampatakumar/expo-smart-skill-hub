import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    return false;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

export const scheduleTaskNotification = async (task) => {
  if (!task.time || !task.date) return null;

  // Simple time string parser (e.g. "2:00 PM")
  const [timeStr, modifier] = task.time.split(' ');
  let [hours, minutes] = timeStr.split(':');
  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

  const triggerDate = new Date(task.date);
  triggerDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

  // If the trigger time is in the past, don't schedule
  if (triggerDate.getTime() <= Date.now()) return null;

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `📅 Study Reminder: ${task.title}`,
      body: `Time to start your ${task.category} session!`,
      data: { taskId: task.id },
    },
    trigger: triggerDate,
  });

  return identifier;
};

export const cancelNotification = async (notificationId) => {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};
