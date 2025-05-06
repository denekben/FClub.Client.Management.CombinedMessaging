import React, { useEffect, useState } from 'react';
import { getUserAPI } from '../../../Services/Management/AppUsersService';
import { UserDto } from '../../../Models/Management/AppUsers/UserDto';
import { AuthContext } from '../../../Context/AuthContext';
import { useParams } from 'react-router-dom';

type UserInfoPanelProps = {
    user: UserDto | null;
    loading: boolean;
};

export const UserInfoPanel = ({ user, loading }: UserInfoPanelProps) => {
    const {user: currentUser} = AuthContext();

  if (loading) return <div>Загрузка пользователя...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        {(user?.id == currentUser?.nameid || user==null) ?
        <>
            <h2 className="text-xl font-semibold mb-4">Мой профиль</h2>
        </> : 
        <>
            <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
        </>}
        <p><b>Имя:</b> {user?.fullName.firstName} {user?.fullName.secondName}</p>
        <p><b>Телефон:</b> {user?.phone ?? 'Не указан'}</p>
        <p><b>Email:</b> {user?.email}</p>
        <p><b>Доступ к турникетам</b> {user?.isBlocked ? 'Запрещён' : 'Разрешён'}</p>
        <p><b>Доступ к информационной системе:</b> {user?.allowEntry ? 'Разрешён' : 'Запрещён'}</p>
        <p><b>Роль:</b> {user?.role.name ?? 'Не назначена'}</p>
        <p><b>Дата создания:</b> {user?.createdDate ? new Date(user.createdDate).toLocaleString() : '-'}</p>
        <p><b>Дата обновления:</b> {user?.updatedDate ? new Date(user.updatedDate).toLocaleString() : '-'}</p>
    </div>
  );
};
