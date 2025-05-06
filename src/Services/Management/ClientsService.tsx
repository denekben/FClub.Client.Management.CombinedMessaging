import axios, { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { ClientDto } from "../../Models/Management/Clients/ClientDto"

export type CreateClient = {
    firstName: string,
    secondName: string,
    patronymic?: string | null,
    phone?: string | null,
    email: string,
    allowEntry: boolean,
    allowNotifications: boolean,
    socialGroupId?: string | null,
}
  
export type UpdateClient = {
    id: string,
    firstName: string,
    secondName: string,
    patronymic?: string | null,
    phone?: string | null,
    email: string,
    isStaff: boolean,
    allowEntry: boolean,
    allowNotifications: boolean,
    socialGroupId?: string | null
}
  
export type GetClients = {
    fullNameSearchPhrase?: string | null,
    phoneSearchPhrase?: string | null,
    emailSearchPhrase?: string | null,
    isStaff?: boolean | null,
    allowedToEntry?: boolean | null,
    allowedNotifications?: boolean | null,
    socialGroupId?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}
  
export const createClientAPI = async(createClient: CreateClient) : Promise<AxiosResponse<ClientDto>> => {
    try {
        const data = await axios.post<ClientDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/clients`,
            createClient
        )
        return data
    } catch(error){
        throw error        
    }
}

export const deleteClientAPI = async(clientId: string) : Promise<AxiosResponse> => {
    try {
        const data = await axios.delete(
            `${process.env.REACT_APP_MANAGEMENT_API}/clients/${clientId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const updateClientAPI = async(updateClient: UpdateClient) : Promise<AxiosResponse<ClientDto>> => {
    try{
        const data = await axios.put<ClientDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/clients`,
            updateClient
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getClientAPI = async(clientId : string) : Promise<AxiosResponse<ClientDto>> => {
    try {
        const data = await axios.get<ClientDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/clients/${clientId}`
        )
        return data
    } catch(error){
        throw error        
    }
}

export const getClientsAPI = async(params : GetClients) : Promise<AxiosResponse<ClientDto[]>> => {
    try {
        const data = await axios.get<ClientDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/clients`,
            {params}
        )
        return data
    } catch(error){
        throw error        
    }
}