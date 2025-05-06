import axios, { AxiosResponse } from "axios"
import { TariffWithGroupsDto } from "../../Models/Management/Tariffs/TariffWithGroupsDto"

export type CreateTariff = {
    sendNotification: boolean,
    name: string,
    priceForNMonths: Record<number, number>,
    discountForSocialGroup?: Record<string, number> | null,
    allowMultiBranches: boolean,
    serviceNames: string[]
}
  
export type UpdateTariff = {
    id: string,
    name: string,
    priceForNMonths: Record<number, number>,
    discountForSocialGroup?: Record<string, number> | null,
    allowMultiBranches: boolean,
    serviceNames: string[],
}

export type GetTariffs = {
    nameSearchPhrase?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
  }
  

export const createTariffAPI = async(createTariff: CreateTariff) : Promise<AxiosResponse<TariffWithGroupsDto>> => {
    try {
        const data = await axios.post<TariffWithGroupsDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/tariffs`,
            createTariff
        )
        return data
    } catch(error){
        throw error        
    }
}

export const deleteTariffAPI = async(tariffId: string) : Promise<AxiosResponse> => {
    try {
        const data = await axios.delete(
            `${process.env.REACT_APP_MANAGEMENT_API}/tariffs/${tariffId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const updateTariffAPI = async(updateTariff: UpdateTariff) : Promise<AxiosResponse<TariffWithGroupsDto>> => {
    try{
        const data = await axios.put<TariffWithGroupsDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/tariffs`,
            updateTariff
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getTariffsAPI = async(params : GetTariffs) : Promise<AxiosResponse<TariffWithGroupsDto[]>> => {
    try {
        const data = await axios.get<TariffWithGroupsDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/tariffs`,
            {params}
        )
        return data
    } catch(error){
        throw error        
    }
}