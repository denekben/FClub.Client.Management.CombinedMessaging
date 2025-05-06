import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Layout } from '../../Components/Layout';
import { assignUserToRoleAPI, blockUserAPI, GetUsers, getUsersAPI, registerNewUserAPI, unblockUserAPI } from '../../Services/Management/AppUsersService';
import { UserDto } from '../../Models/Management/AppUsers/UserDto';
import { AuthContext } from '../../Context/AuthContext';
import { useForm } from 'react-hook-form';

type TriStateFilter = boolean | null;

interface RegisterNewUserForm {
  firstName: string,
  secondName: string,
  patronymic?: string | null,
  phone?: string | null,
  email: string,
  password: string
}

const UsersPage = () => {
  const adminRole = "33009074-8ef9-492d-a5a6-d9684f7e9f48";
    const {currentRole} = AuthContext();
    const {user: currentUser} = AuthContext();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetUsers>({
    pageNumber: 1,
    pageSize: 5,
    isBlocked: null,
    allowedToEntry: null,
  });
  
  const [filterStates, setFilterStates] = useState<{
    isBlocked: TriStateFilter;
    allowedToEntry: TriStateFilter;
  }>({
    isBlocked: null,
    allowedToEntry: null,
  });
  const [isCreate, setIsCreate] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUsersAPI(searchParams);
      setUsers(response.data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
      toast.error('Не удалось загрузить данные пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleFilterChange = (name: keyof typeof filterStates) => {
    const newState = {
      ...filterStates,
      [name]: getNextTriState(filterStates[name])
    };
    
    setFilterStates(newState);
    
    setSearchParams(prev => ({
      ...prev,
      [name]: newState[name],
      pageNumber: 1,
    }));
  };

  const getNextTriState = (current: TriStateFilter): TriStateFilter => {
    switch (current) {
      case null: return true;
      case true: return false;
      case false: return null;
      default: return null;
    }
  };

  const getFilterButtonClass = (state: TriStateFilter) => {
    switch (state) {
      case true: return 'bg-green-100 text-green-800';
      case false: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilterIcon = (state: TriStateFilter) => {
    switch (state) {
      case true: return '✓';
      case false: return '✕';
      default: return '↺';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value || null,
      pageNumber: 1,
    }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };


  const handleAssignUserToRole = async (id: string, role: string) => {
    try {
      await assignUserToRoleAPI({userId: id, roleId: role});
      toast.success('Пользователь успешно повышен');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при повышении пользователя');
    }
  }

  const handleUnblockUser = async (id: string) => {
    try {
      await unblockUserAPI(id);
      toast.success('Пользователь успешно разблокирован');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при разблокировке пользователя');
    }
  }

  const handleBlockUser = async (id: string) => {
    try {
      await blockUserAPI(id);
      toast.success('Пользователь успешно заблокирован');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка при блокировке пользователя');
    }
  }

    const { register: registerCreateForm, handleSubmit: handleCreateSubmit, reset: resetCreateForm, formState: { errors: createErrors } } = useForm<RegisterNewUserForm>();
  
      const handleCreateUser = async (data: RegisterNewUserForm) => {
          try {
              await registerNewUserAPI({
                firstName: data.firstName,
                secondName: data.secondName,
                patronymic: data.patronymic === "" ? null : data.patronymic,
                phone: data.phone === "" ? null : data.phone,
                email: data.email,
                password: data.password                      
              });
              toast.success('Пользователь успешно зарегистрирован');
              setIsCreate(false);
              resetCreateForm();
              fetchUsers();
          } catch (error) {
              toast.error('Ошибка при регистрации пользователя');
          }
      };

  return (
    <Layout>
        <div className="container mx-auto px-4 py-8">
            {isCreate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Создание нового пользователя</h2>
                            <form onSubmit={handleCreateSubmit(handleCreateUser)}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("firstName", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.firstName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите имя"
                                    />
                                    {createErrors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.firstName.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Фамилия
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("secondName", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.secondName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите фамилию"
                                    />
                                    {createErrors.secondName && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.secondName.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Отчество
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("patronymic")}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.patronymic ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите отчество"
                                    />
                                    {createErrors.patronymic && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.patronymic.message}</p>
                                    )}
                                </div>         
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Телефон
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("phone")}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите телефон"
                                    />
                                    {createErrors.phone && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.phone.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Электронная почта
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("email", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите электронную почту"
                                    />
                                    {createErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.email.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Пароль
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("password", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите пароль"
                                    />
                                    {createErrors.password && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.password.message}</p>
                                    )}
                                </div>                                                                
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreate(false)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Зарегистрировать
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Управление пользователями</h1>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              name="fullNameSearchPhrase"
              placeholder="Поиск по ФИО"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input
              type="text"
              name="phoneSearchPhrase"
              placeholder="Поиск по телефону"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="text"
              name="emailSearchPhrase"
              placeholder="Поиск по email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-end space-x-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Поиск
            </button>
          </div>

          <div className="flex items-center space-x-4 col-span-full">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleFilterChange('isBlocked')}
                className={`px-3 py-1 rounded-md text-sm flex items-center space-x-2 ${getFilterButtonClass(filterStates.isBlocked == null ? null : !filterStates.isBlocked)}`}
              >
                <span>Доступ к системе:</span>
                <span className="font-bold">{getFilterIcon((filterStates.isBlocked == null ? null : !filterStates.isBlocked))}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('allowedToEntry')}
                className={`px-3 py-1 rounded-md text-sm flex items-center space-x-2 ${getFilterButtonClass(filterStates.allowedToEntry)}`}
              >
                <span>Доступ к турникетам:</span>
                <span className="font-bold">{getFilterIcon(filterStates.allowedToEntry)}</span>
              </button>
            </div>
          </div>
        </form>

        <button
          onClick={() => setIsCreate(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Зарегистрировать нового пользователя
        </button>
      </div>

    <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && (
          <div className="p-4 text-center">Загрузка данных...</div>
        )}

        {error && (
          <div className="p-4 text-red-500 text-center">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ФИО</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Контакты</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Доступ к системе</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Доступ к турникетам</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.fullName.secondName} {user.fullName.firstName} {user.fullName.patronymic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{user.phone || 'Не указан'}</div>
                        <div>{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                          user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.isBlocked ? 'Запрещён' : 'Разрешён'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                          user.allowEntry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.allowEntry ? 'Разрешён' : 'Запрещён'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{user.role.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                            onClick={() => navigate(`/users/${user.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            >
                            Профиль
                            </button>
                        {(currentRole() === "Admin"  && currentUser?.nameid!=user.id) && <>
                            {user.role.name === "Manager" && 
                                <button
                                onClick={() => handleAssignUserToRole(user.id, adminRole)}
                                className="text-blue-600 hover:text-blue-900"
                                >
                                Повысить
                                </button>
                            }
                            {user.isBlocked && 
                                <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="text-blue-600 hover:text-blue-900"
                                >
                                Разблокировать
                                </button>
                            }
                            {!user.isBlocked && 
                                <button
                                onClick={() => handleBlockUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                >
                                Заблокировать
                                </button>
                            }                        
                             </>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:justify-end">
                <button
                  onClick={() => setSearchParams(prev => ({
                    ...prev,
                    pageNumber: Math.max(1, (prev.pageNumber ?? 1) - 1)
                  }))}
                  disabled={searchParams.pageNumber === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  onClick={() => setSearchParams(prev => ({
                    ...prev,
                    pageNumber: (prev.pageNumber ?? 1) + 1
                  }))}
                  disabled={users.length < (searchParams.pageSize ?? 10)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Вперед
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default UsersPage;
