import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { ServiceDto } from "../../Models/Management/Services/ServiceDto"

export type UpdateService = {
    id: string,
    name: string
}
  
export type GetServices = {
    nameSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export type CreateService = {
    name: string
}

export const createServiceAPI = async(createService: CreateService) : Promise<AxiosResponse<ServiceDto>> => {
    try {
        const data = await axios.post<ServiceDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/services`,
            createService
        )
        return data
    } catch(error){
        throw error        
    }
}

export const deleteServiceAPI = async(serviceId: string) : Promise<AxiosResponse> => {
    try {
        const data = await axios.delete(
            `${process.env.REACT_APP_MANAGEMENT_API}/services/${serviceId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const updateServiceAPI = async(updateService: UpdateService) : Promise<AxiosResponse<ServiceDto>> => {
    try{
        const data = await axios.put<ServiceDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/services`,
            updateService
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getServicesAPI = async(params : GetServices) : Promise<AxiosResponse<ServiceDto[]>> => {
    try {
        const data = await axios.get<ServiceDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/services`,
            {params}
        )
        return data
    } catch(error){
        throw error        
    }
}