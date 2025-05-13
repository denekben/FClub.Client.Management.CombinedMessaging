import axios, { AxiosResponse } from "axios"
import {toast} from "react-toastify"
import { TokensDto } from "../../Models/Management/AppUsers/TokensDto"
import { UserLogDto } from "../../Models/Logging/UserLogDto"
import { UserDto } from "../../Models/Management/AppUsers/UserDto"

export type SignIn = {
    email: string,
    password: string
}

export type RegisterNewUser = {
    firstName: string,
    secondName: string,
    patronymic?: string | null,
    phone?: string | null,
    email: string,
    password: string
}

export type AssignUserToRole = {
    userId : string,
    roleId : string
}

export type GetUsers = {
    fullNameSearchPhrase? : string | null,
    phoneSearchPhrase? : string | null,
    emailSearchPhrase? : string | null,
    isBlocked? : boolean | null,
    allowedToEntry? : boolean | null,
    roleId? : string | null,
    sortByCreatedDate? : boolean | null,
    pageNumber?: number | null,
    pageSize?: number | null
}

export type RefreshExpiredToken = {
    refreshToken : string
}

export const assignUserToRoleAPI = async(assignUserToRole : AssignUserToRole) : Promise<AxiosResponse> => {
    try {
        const data = await axios.put(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/assign-to-role`,
            assignUserToRole
        )
        return data
    } catch (error) {
        throw error
    }
}

export const blockUserAPI = async(userId : string) : Promise<AxiosResponse> => {
    try{
        const data = await axios.put(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/${userId}/block`
        )
        return data
    } catch (error) {
        throw error
    }
}

export const refreshExpiredTokenAPI = async(params : RefreshExpiredToken) : Promise<AxiosResponse<string | undefined>> => {
    try {
        const data = await axios.get(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/access-token`,
            {params}
        )
        return data;
    } catch (error) {
        throw error
    }
}

export const registerNewUserAPI = async(registerNewUser : RegisterNewUser)  : Promise<AxiosResponse<TokensDto>> => {
    try {
        const data = await axios.post<TokensDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/register`, 
            registerNewUser
        )
        return data
    } catch (error) {
        throw error
    }
}

export const signInAPI = async(signIn : SignIn) : Promise<AxiosResponse<TokensDto>> => {
    try {
        const data = await axios.put<TokensDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/sign-in`, 
            signIn
        )
        return data
    } catch(error) {
        throw error
    }
}

export const unblockUserAPI = async(userId: string) : Promise<AxiosResponse> => {
    try{
        const data = await axios.put(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/${userId}/unblock`,
        )
        return data
    } catch (error){
        throw error
    }
}

export const getUsersAPI = async(params: GetUsers) : Promise<AxiosResponse<UserDto[]>> => {
    try{
        const data = await axios.get<UserDto[]>(
            `${process.env.REACT_APP_MANAGEMENT_API}/users`,
            {params}
        )
        return data
    } catch (error){
        throw error
    }
}

export const getCurrentUserAPI = async() : Promise<AxiosResponse<UserDto>> => {
    try{
        const data = await axios.get<UserDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/current`,
        )
        return data
    } catch (error){
        throw error
    }
}

export const getUserAPI = async(userId: string) : Promise<AxiosResponse<UserDto>> => {
    try{
        const data = await axios.get<UserDto>(
            `${process.env.REACT_APP_MANAGEMENT_API}/users/${userId}`,
        )
        return data
    } catch (error){
        throw error
    }
}