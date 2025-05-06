import React, { useEffect, useState } from 'react';
import { Layout } from '../../Components/Layout';
import { UserInfoPanel } from './Components/UserInfoPanel';
import { UserLogsSearchPanel } from './Components/UserLogsSearchPanel';
import { useParams } from 'react-router-dom';
import { getCurrentUserAPI, getUserAPI } from '../../Services/Management/AppUsersService';
import { UserDto } from '../../Models/Management/AppUsers/UserDto';

export const MainPage = () => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userId } = useParams<{ userId?: string }>();
    
    useEffect(() => {
        if (!userId) {
            getCurrentUserAPI()
            .then(res => {
                setUser(res.data);
                setError(null);
            })
            .catch(() => {
                setError('Ошибка загрузки данных пользователя');
                setUser(null); 
            })
            .finally(() => setLoading(false));
        }
        else{
            getUserAPI(userId)
            .then(res => {
                setUser(res.data);
                setError(null);
            })
            .catch(() => {
                setError('Ошибка загрузки данных пользователя');
                setUser(null); 
            })
            .finally(() => setLoading(false));
        }
    }, [userId]);

    return (
        <Layout>
            {error ? (
                <div className="p-6 text-red-500 text-center">
                    {error}
                </div>
            ) : (
                <main className="pt-5 p-6 overflow-auto h-full">
                    <div className="max-w-7xl mx-auto mt-10">
                        <UserInfoPanel user={user} loading={loading} />
                        <UserLogsSearchPanel userId={userId} />
                    </div>
                </main>
            )}
        </Layout>
    );
};
