import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { MainPage } from "../Pages/MainPage/MainPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { SignInPage } from "../Pages/SignInPage/SignInPage";
import UsersPage from "../Pages/UsersPage/UsersPage";
import BranchesPage from "../Pages/BranchesPage/BranchesPage";
import ClientsPage from "../Pages/ClientsPage/ClientsPage";
import ServicesPage from "../Pages/ServicesPage/ServicesPage";
import SocialGroupsPage from "../Pages/SocialGroups/SocialGroupsPage";
import TariffsPage  from "../Pages/TariffsPage/TariffsPage";
import NotificationsPage from "../Pages/NotificationsPage/NotificationsPage";
import StatisticsPage from "../Pages/StatisticsPage/StatisticsPage";
import BranchPage from "../Pages/BranchPage/BranchPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {path: "", element: <ProtectedRoute><MainPage/></ProtectedRoute>},
            {path: "sign-in", element:  <SignInPage/>},
            {path: "users", element: <ProtectedRoute><UsersPage/></ProtectedRoute>},
            {path: "users/:userId", element: <ProtectedRoute><MainPage/></ProtectedRoute>},      
            {path: "branches", element: <ProtectedRoute><BranchesPage/></ProtectedRoute>}, 
            {path: "branches/:branchId", element: <ProtectedRoute><BranchPage/></ProtectedRoute>},       
            {path: "clients", element: <ProtectedRoute><ClientsPage/></ProtectedRoute>},   
            {path: "services", element: <ProtectedRoute><ServicesPage/></ProtectedRoute>},   
            {path: "social-groups", element:<ProtectedRoute><SocialGroupsPage/></ProtectedRoute>}, 
            {path: "tariffs", element:<ProtectedRoute><TariffsPage/></ProtectedRoute>},
            {path: "notifications", element:<ProtectedRoute><NotificationsPage/></ProtectedRoute>},   
            {path: "users", element:<ProtectedRoute><UsersPage/></ProtectedRoute>},    
            {path: "stats", element:<ProtectedRoute><StatisticsPage/></ProtectedRoute>},          
        ]
    }
])
