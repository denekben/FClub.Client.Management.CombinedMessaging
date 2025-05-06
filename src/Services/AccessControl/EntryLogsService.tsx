import axios, { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { EntryLogDto } from "../../Models/AccessControl/EntryLogs/EntryLogDto";

export interface GetEntryLogs {
    clientId?: string | null,
    turnstileId?: string | null,
    clientNameSearchPhrase?: string | null,
    branchNameSearchPhrase?: string | null,
    serviceNameSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export const  getEntryLogsAPI = async(params: GetEntryLogs) : Promise<AxiosResponse<EntryLogDto[]>> => {
    try {
        const data = await axios.get<EntryLogDto[]>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/entry-logs`,
            {params}
        )
        return data
    } catch (error){
        throw error
    }
}

export {}