import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { NotificationSettingsDto } from "../../Models/Notifications/NotificationSettingsDto/NotificationSettingsDto"

export type UpdateNotificationSettings = {
    allowAttendanceNotifications: boolean,
    attendanceNotificationPeriod: number,
    attendanceNotificationReSendPeriod: number,
    attendanceEmailSubject: string,
    attendanceNotificationId?: string | null,
    tariffEmailSubject: string,
    tariffNotificationId?: string | null,
    branchEmailSubject: string,
    branchNotificationId?: string | null
}

export const updateNotificationSettingsAPI = async(updateNotificationSettings: UpdateNotificationSettings) : Promise<AxiosResponse<NotificationSettingsDto>> => {
    try{
        const data = await axios.put<NotificationSettingsDto>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notification-settings`,
            updateNotificationSettings
        )
        return data
    } catch(error){
        throw error
    }    
}

export const getNotificationSettingsAPI = async() : Promise<AxiosResponse<NotificationSettingsDto>> => {
    try{
        const data = await axios.get<NotificationSettingsDto>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notification-settings`,
        )
        return data
    } catch(error){
        throw error
    }    
}