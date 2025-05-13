import axios, { AxiosResponse } from "axios"
import { UserLogDto } from "../../Models/Logging/UserLogDto"

export type GetCurrentUserLogs = {
    serviceNameSearchPhrase?: string | null,
    textSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export type GetLogs = {
    userId?: string | null,
    serviceNameSearchPhrase?: string | null,
    textSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export const getCurrentUserLogsAPI = async(params : GetCurrentUserLogs) : Promise<AxiosResponse<UserLogDto[]>> => {
    try {
        const data = await axios.get<UserLogDto[]>(
            `${process.env.REACT_APP_LOGGING_API}/users/current/logs`,
            {params}
        )
        return data
    } catch (error){
        throw error
    }
}

export const getUserLogsAPI = async(params : GetLogs) : Promise<AxiosResponse<UserLogDto[]>> => {
    try {
        const data = await axios.get<UserLogDto[]>(
            `${process.env.REACT_APP_LOGGING_API}/users/logs`,
            {params}
        )
        return data
    } catch (error){
        throw error
    }
}