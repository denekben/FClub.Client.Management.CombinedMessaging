import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { StatisticNoteDto } from "../../Models/AccessControl/StatisticNotes/StatisticNoteDto"

export type GetStatisticNotes = {
    branchId?: string | null,
    startDate: Date,
    endDate: Date
}

export const getStatisticNotesAPI = async(params: GetStatisticNotes) : Promise<AxiosResponse<StatisticNoteDto[]>> => {
    try{
        const data = await axios.get<StatisticNoteDto[]>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/statistic-notes`,
            {params}
        )
        return data
    } catch(error){
        throw error
    }    
}

export {}