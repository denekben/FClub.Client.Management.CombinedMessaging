import axios, { AxiosResponse } from "axios"
import { NotificationDto } from "../../Models/Notifications/Notifications/NotificationDto"

export interface CreateNotification {
    title: string,
    text: string
}

export interface SendCreatedNotification {
    subject: string,
    notificationId: string
}

export interface SendNotification {
    subject: string,
    title: string,
    text: string,
    saveNotification: boolean
}

export interface UpdateNotification {
    id: string,
    title: string,
    text: string
}

export interface GetNotifications {
    titleSearchPhrase?: string | null,
    textSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export const createNotificationAPI = async(createNotification: CreateNotification): Promise<AxiosResponse<NotificationDto>> => {
    try{
        const data = await axios.post<NotificationDto>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notifications`,
            createNotification
        )
        return data
    } catch(error){
        throw error
    }
}

export const deleteNotificationAPI = async(notificationId: string): Promise<AxiosResponse> => {
    try{
        const data = await axios.delete(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notifications/${notificationId}`
        )
        return data        
    } catch(error){
        throw error
    }
}

export const updateNotificationAPI = async(updateNotification: UpdateNotification): Promise<AxiosResponse<NotificationDto>> => {
    try{
        const data = await axios.put<NotificationDto>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notifications`,
            updateNotification
        )
        return data
    } catch(error){
        throw error
    }
}

export const sendNotificationAPI = async(sendNotification: SendNotification): Promise<AxiosResponse<NotificationDto>> => {
    try{
        const data = await axios.post<NotificationDto>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notifications/send`,
            sendNotification
        )
        return data
    } catch(error){
        throw error
    }
}

export const sendCreatedNotificationAPI = async(sendCreatedNotification: SendCreatedNotification): Promise<AxiosResponse<NotificationDto>> => {
    try{
        const data = await axios.post<NotificationDto>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notifications/send-created`,
            sendCreatedNotification
        )
        return data
    } catch(error){
        throw error
    }
}

export const getNotificationsAPI = async(params: GetNotifications): Promise<AxiosResponse<NotificationDto[]>> => {
    try{
        const data = await axios.get<NotificationDto[]>(
            `${process.env.REACT_APP_NOTIFICATIONS_API}/notifications`,
            {params}
        )
        return data
    } catch(error){
        throw error
    }
}