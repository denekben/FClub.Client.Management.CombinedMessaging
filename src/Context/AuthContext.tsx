import { createContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { refreshExpiredTokenAPI, RegisterNewUser, registerNewUserAPI, SignIn, signInAPI } from "../Services/Management/AppUsersService"
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { toast } from "react-toastify"
import { TokensDto } from "../Models/Management/AppUsers/TokensDto"
import { jwtDecode } from "jwt-decode"
import { AccessTokenPayload } from "./AccessTokenPayload"
import React from "react"

type UserContextType = {
    token?: string | null,
    user?: UserInfo | null,
    signIn: (signIn: SignIn) => Promise<void>,
    isLoggedIn: () => boolean,
    currentRole: () => string | undefined
    logout: () => void
}

type UserInfo = {
    nameid: string
    unique_name: string
    email: string
    role: string
}

type Props = {children: React.ReactNode}

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
    _retry?: boolean;
  }

const UserContext = createContext<UserContextType>({} as UserContextType)

export const UserProvider = ({children}: Props) => {
    const [token, setToken] = useState<string | null>(null)
    const [user, setUser] = useState<UserInfo | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        initializeAxiosInterceptors()
        const token = localStorage.getItem("access-token")
        const user = localStorage.getItem("user")
        if(token && user){
            setUser(JSON.parse(user));
            setToken(token);
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
        }
        setIsReady(true)
    }, [])

    const initializeAxiosInterceptors = () => {
        axios.interceptors.response.use(
            response => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as AxiosRequestConfigWithRetry
                
                const isRefreshRequest = originalRequest.url?.includes('/users/access-token')
                
                if (error.response?.status === 403 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
                    originalRequest._retry = true
                    
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            const interval = setInterval(() => {
                                if (!isRefreshing) {
                                    clearInterval(interval)
                                    axios(originalRequest).then(resolve).catch(reject)
                                }
                            }, 100)
                        })
                    }
                    
                    setIsRefreshing(true)
                    try {
                        const refreshToken = localStorage.getItem("refresh-token")
                        if (!refreshToken) {
                            logout()
                            return Promise.reject(error)
                        }

                        const response = await refreshExpiredTokenAPI({ refreshToken })
                        const newAccessToken = response.data
                        
                        if (newAccessToken) {
                            localStorage.setItem("access-token", newAccessToken)
                            setToken(newAccessToken)
                            axios.defaults.headers.common["Authorization"] = "Bearer " + newAccessToken
                            if (!originalRequest.headers) {
                                originalRequest.headers = {}
                            }
                            originalRequest.headers["Authorization"] = "Bearer " + newAccessToken
                            return axios(originalRequest)
                        }
                    } catch (refreshError) {
                        logout()
                        toast.error("Сессия истекла. Пожалуйста, войдите снова.")
                        navigate("/sign-in")
                        return Promise.reject(refreshError)
                    } finally {
                        setIsRefreshing(false)
                    }
                }
                
                return Promise.reject(error)
            }
        )
    }

    const signIn = async (
        signIn: SignIn
    ) : Promise<void> => {
        try {
            const res = await signInAPI(signIn);
            if (res) {
                const tokens : TokensDto = res.data
                localStorage.setItem("access-token", tokens.accessToken);
                localStorage.setItem("refresh-token", tokens.refreshToken);
    
                const decodedToken = jwtDecode(tokens.accessToken) as AccessTokenPayload;
                
                const userObj = {
                    nameid: decodedToken.nameid,
                    unique_name: decodedToken.unique_name, 
                    email: decodedToken.email,
                    role: decodedToken.role
                };

                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(tokens.accessToken);
                setUser(userObj);
                axios.defaults.headers.common["Authorization"] = "Bearer " + tokens.accessToken;
                navigate("/");
            }
        } catch (error) {
            throw error
        }
    }

    const isLoggedIn = () : boolean => {
        return !!user || !!token
    }

    const currentRole = () : string | undefined => {
        return user?.role
    }   

    const logout = () : void => {
        localStorage.removeItem("access-token")
        localStorage.removeItem("refresh-token")
        localStorage.removeItem("user")
        setUser(null)
        setToken("")
        navigate("/sign-in")
    }

    return (
        <UserContext.Provider value ={{token, user, signIn, isLoggedIn, currentRole, logout}}>
            {isReady ? children:null}
        </UserContext.Provider>
    )
}

export const AuthContext = () => React.useContext(UserContext)