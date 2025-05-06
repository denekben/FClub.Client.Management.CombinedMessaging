import { NotificationDto } from "../Notifications/NotificationDto"

export type NotificationSettingsDto = {
    allowAttendanceNotifications: boolean,
    attendanceNotificationPeriod: number,       
    attendanceNotificationReSendPeriod: number,
    attendanceEmailSubject: string,
    attendanceNotification?: NotificationDto | null,
    tariffEmailSubject: string,
    tariffNotification?: NotificationDto | null,
    branchEmailSubject: string,
    branchNotification?: NotificationDto | null
}
  