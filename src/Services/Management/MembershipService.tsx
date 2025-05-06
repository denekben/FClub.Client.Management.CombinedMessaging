import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { ClientDto } from "../../Models/Management/Clients/ClientDto"
import { MembershipDto } from "../../Models/Management/Memberships/MembershipDto"
import { UpdateClient } from "./ClientsService"

export interface CreateMembership {
    tariffId: string,
    monthQuantity: number,
    clientId: string,
    branchId: string
}

export interface UpdateMembership {
    membershipId: string,
    tariffId: string,
    monthQuantity: number,
    clientId: string,
    branchId: string,
}
  
export const createMembershipAPI = async(createMembership: CreateMembership) : Promise<AxiosResponse<MembershipDto>> => {
    try {
        const data = await axios.post<MembershipDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/memberships`,
            createMembership
        )
        return data
    } catch(error){
        throw error        
    }
}

export const deleteMembershipAPI = async(membershipId: string) : Promise<AxiosResponse> => {
    try {
        const data = await axios.delete(
            `${process.env.REACT_APP_MANAGEMENT_API}/memberships/${membershipId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const updateMembershipAPI = async(updateMembership: UpdateMembership) : Promise<AxiosResponse<MembershipDto>> => {
    try{
        const data = await axios.put<MembershipDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/memberships`,
            updateMembership
        )
        return data
    } catch(error){
        throw error        
    }
}