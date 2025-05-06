import React from 'react'
import { Navigate, useLocation } from 'react-router'
import { AuthContext } from '../Context/AuthContext'

type Props = {children: React.ReactNode}

export const ProtectedRoute = ({children}: Props) => {
    const location = useLocation()
    const {isLoggedIn} = AuthContext()
    return (isLoggedIn() ? (
        <>{children}</>) : (
            <Navigate to="/sign-in" state={{from:location}} replace/>
        )
    )
}