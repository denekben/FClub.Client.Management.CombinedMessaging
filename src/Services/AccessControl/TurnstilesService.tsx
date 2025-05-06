import axios, { AxiosResponse } from "axios"
import { TurnstileDto } from "../../Models/AccessControl/Turnstiles/TurnstileDto"
import { toast } from "react-toastify"

export type CreateTurnstile = {
    name?: string | null,
    isMain: boolean,
    branchId: string,
    serviceId?: string | null
  }
  
export type GoThrough = {
    clientId: string,
    turnstileId: string,
    entryType: EntryType
}

export type UpdateTurnstile = {
    turnstileId: string,
    name?: string | null,
    isMain: boolean,
    branchId: string,
    serviceId?: string | null
}

export type GetTurnstiles = {
    nameSearchPhrase?: string | null,
    isMain?: boolean | null,
    branchId?: string | null,
    serviceId?: string | null,
    sortByCreatedDate?: boolean | null,
    pageNumber?: number,
    pageSize?: number
}

export enum EntryType {
    Enter = "Enter",
    Exit = "Exit"
}

export const createTurnstileAPI = async(createTurnstile: CreateTurnstile): Promise<AxiosResponse<TurnstileDto>> => {
    try{
        const data = await axios.post<TurnstileDto>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/turnstiles`,
            createTurnstile
        )
        return data
    } catch(error){
        throw error
    }      
}

export const deleteTurnstileAPI = async(turnstileId: string): Promise<AxiosResponse> => {
    try{
        const data = await axios.delete(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/turnstiles/${turnstileId}`,
        )
        return data
    } catch(error){
        throw error
    }      
}

export const goTroughAPI = async(goThrough: GoThrough): Promise<AxiosResponse> => {
    try{
        const data = await axios.put(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/turnstiles/go-through`,
            goThrough
        )
        return data
    } catch(error){
        throw error
    }      
}

export const updateTurnstileAPI = async(updateTurnstile: UpdateTurnstile): Promise<AxiosResponse<TurnstileDto>> => {
    try{
        const data = await axios.put<TurnstileDto>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/turnstiles`,
            updateTurnstile
        )
        return data
    } catch(error){
        throw error
    }      
}

export const getTurnstilesAPI = async(params: GetTurnstiles): Promise<AxiosResponse<TurnstileDto[]>> => {
    try{
        const data = await axios.get<TurnstileDto[]>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/turnstiles`,
            {params}
        )
        return data
    } catch(error){
        throw error
    }
}

export const getTurnstileAPI = async(turnstileId: string): Promise<AxiosResponse<TurnstileDto>> => {
    try{
        const data = await axios.get<TurnstileDto>(
            `${process.env.REACT_APP_ACCESS_CONTROL_API}/turnstiles/${turnstileId}`,
        )
        return data
    } catch(error){
        throw error
    }
}