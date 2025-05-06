import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { UserLogDto } from "../../Models/Shared/UserLogDto"
import { GetCurrentUserLogs, GetLogs } from "../Shared/UserLogs"

export const getCurrentUserLogsAPI = async(params : GetCurrentUserLogs) : Promise<AxiosResponse<UserLogDto[]>> => {
    try {
        const data = await axios.get<UserLogDto[]>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/users/current/logs`,
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
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/users/logs`,
            {params}
        )
        return data
    } catch (error){
        throw error
    }
}