import axios, { AxiosResponse } from "axios"
import { BranchDto } from "../../Models/Management/Branches/BranchDto"
import { toast } from "react-toastify"

export type CreateBranch = {
    sendNotification: boolean,
    name?: string | null,
    maxOccupancy: number,
    country?: string | null,
    city?: string | null,
    street?: string | null,
    houseNumber?: string | null,
    serviceNames: string[]
}

export type UpdateBranch = {
    branchId: string,
    name?: string | null,
    maxOccupancy: number,
    country?: string | null,
    city?: string | null,
    street?: string | null,
    houseNumber?: string | null,
    serviceNames: string[]
}

export type GetBranches = {
    nameSearchPhrase?: string | null,
    addressSearchPhrase?: string | null,
    sortByMaxOccupancy?: boolean | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number,
}

export const createBranchAPI = async(createBranch: CreateBranch) : Promise<AxiosResponse<BranchDto>> => {
    try {
        const data = await axios.post<BranchDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/branches`,
            createBranch
        )
        return data
    } catch(error){
        throw error        
    }
}

export const deleteBranchAPI = async(branchId: string) : Promise<AxiosResponse> => {
    try {
        const data = await axios.delete(
            `${process.env.REACT_APP_MANAGEMENT_API}/branches/${branchId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const updateBranchAPI = async(updateBranch: UpdateBranch) : Promise<AxiosResponse<BranchDto>> => {
    try{
        const data = await axios.put<BranchDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/branches`,
            updateBranch
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getBranchAPI = async(branchId : string) : Promise<AxiosResponse<BranchDto>> => {
    try {
        const data = await axios.get<BranchDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/branches/${branchId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getBranchesAPI = async(params : GetBranches) : Promise<AxiosResponse<BranchDto[]>> => {
    try {
        const data = await axios.get<BranchDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/branches`,
            {params}
        )
        return data
    } catch(error){
        throw error        
    }
}