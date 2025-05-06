import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { SocialGroupDto } from "../../Models/Management/SocialGroups/SocialGroupDto"

export type UpdateSocialGroup = {
    id: string,
    name: string
}

export type GetSocialGroups = {
    nameSearchPhrase?: string  | null,
    sortByCreatedDate?: string | null,
    pageNumber?: number,
    pageSize?: number
}

export type CreateSocialGroup = {
    name: string
}

export const createSocialGroupAPI = async(createSocialGroup: CreateSocialGroup) : Promise<AxiosResponse<SocialGroupDto>> => {
    try {
        const data = await axios.post<SocialGroupDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/social-groups`,
            createSocialGroup
        )
        return data
    } catch(error){
        throw error        
    }
}

export const deleteSocialGroupAPI = async(socialGroupId: string) : Promise<AxiosResponse> => {
    try {
        const data = await axios.delete(
            `${process.env.REACT_APP_MANAGEMENT_API}/social-groups/${socialGroupId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const updateSocialGroupAPI = async(updateSocialGroup: UpdateSocialGroup) : Promise<AxiosResponse<SocialGroupDto>> => {
    try{
        const data = await axios.put<SocialGroupDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/social-groups`,
            updateSocialGroup
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getSocialGroupsAPI = async(params : GetSocialGroups) : Promise<AxiosResponse<SocialGroupDto[]>> => {
    try {
        const data = await axios.get<SocialGroupDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/social-groups`,
            {params}
        )
        return data
    } catch(error){
        throw error        
    }
}

export {}