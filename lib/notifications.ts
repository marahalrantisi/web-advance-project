import type { Notification } from "@/components/notifications-dropdown"

export function addNotification(
  userId: string,
  type: "task" | "project" | "message",
  message: string,
  relatedId: string,
) {

  const newNotification: Notification = {
    id: Date.now().toString(),
    userId,
    type,
    message,
    relatedId,
    read: false,
    timestamp: new Date().toISOString(),
  }

 
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

 
  notifications.push(newNotification)

  localStorage.setItem("notifications", JSON.stringify(notifications))

  return newNotification
}

export function markNotificationAsRead(notificationId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  const updatedNotifications = notifications.map((notif: Notification) =>
    notif.id === notificationId ? { ...notif, read: true } : notif,
  )

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}


export function markAllNotificationsAsRead(userId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  const updatedNotifications = notifications.map((notif: Notification) =>
    notif.userId === userId ? { ...notif, read: true } : notif,
  )

  localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
}


export function getUnreadNotificationsCount(userId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  return notifications.filter((notif: Notification) => notif.userId === userId && !notif.read).length
}

export function getUserNotifications(userId: string) {
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

  return notifications
    .filter((notif: Notification) => notif.userId === userId)
    .sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
