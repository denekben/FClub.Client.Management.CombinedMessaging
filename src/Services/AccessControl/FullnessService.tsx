import { toast } from "react-toastify"
import { BranchDto } from "../../Models/AccessControl/Branches/BranchDto"
import axios, { AxiosResponse } from "axios"

export type GetBranchesFullness = {
    nameSearchPhrase?: string | null,
    sortByCurrentClientQuantity?: boolean | null,
    sortByMaxOccupancy?: boolean | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export const getBranchesFullnessAPI = async(params: GetBranchesFullness): Promise<AxiosResponse<BranchDto[]>> => {
    try{
        const data = await axios.get<BranchDto[]>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/fullness`,
            {params}
        )
        return data
    } catch(error){
        throw error
    }
}

export const getBranchFullnessAPI = async(branchId: string): Promise<AxiosResponse<BranchDto>> => {
    try{
        const data = await axios.get<BranchDto>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/fullness/${branchId}`,
        )
        return data
    } catch(error){
        throw error
    }
}