import axios from "axios"
import { toast } from "react-toastify"
import { StatisticNoteDto } from "../../Models/Management/StatisticNotes/StatisticNoteDto"

export type GetStatisticNotes = {
    branchId?: string | null,
    startDate: Date,
    endDate: Date
}

export const getStatisticNotesAPI = async(params: GetStatisticNotes) => {
    try {
        const data = await axios.get<StatisticNoteDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/statistic-notes`,
            {params}
        )
        return data
    } catch(error) {
        toast.error("Что то пошло не так!")
        throw error
    }
}

export {}