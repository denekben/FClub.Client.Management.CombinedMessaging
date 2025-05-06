import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocialGroupsAPI, GetSocialGroups, deleteSocialGroupAPI, createSocialGroupAPI, updateSocialGroupAPI } from '../../Services/Management/SocialGroupsService';
import { toast } from 'react-toastify';
import { SocialGroupDto } from '../../Models/Management/SocialGroups/SocialGroupDto';
import { Layout } from '../../Components/Layout';
import { AuthContext } from '../../Context/AuthContext';
import { useForm } from 'react-hook-form';

interface UpdateSocialGroup {
  name: string
}

const SocialGroupsPage = () => {
    const {currentRole} = AuthContext();
  const [groups, setGroups] = useState<SocialGroupDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetSocialGroups>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
      const [isCreate, setIsCreate] = useState<boolean>(false);
      const [isUpdate, setIsUpdate] = useState<boolean>(false);
      const [currentUpdateGroup, setCurrentUpdateGroup] = useState<SocialGroupDto>();

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSocialGroupsAPI(searchParams);
      setGroups(response.data);
    } catch (err) {
      setError('Ошибка загрузки групп');
      toast.error('Не удалось загрузить данные социальных групп');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGroups();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value || null,
      pageNumber: 1
    }));
  };

  const handleDelete = async (groupId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить социальную группу?')) {
      try {
        await deleteSocialGroupAPI(groupId);
        toast.success('Социальная группа успешно удалена');
        fetchGroups();
      } catch (error) {
        toast.error('Ошибка при удалении группы');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const { register: registerCreateForm, handleSubmit: handleCreateSubmit, reset: resetCreateForm, formState: { errors: createErrors } } = useForm<{name: string}>();

    const handleCreateGroup = async (data : {name: string}) => {
        try {
            await createSocialGroupAPI({
              name: data.name
            });
            toast.success('Группа успешно создана');
            setIsCreate(false);
            resetCreateForm();
            fetchGroups();
        } catch (error) {
            toast.error('Ошибка при создании группы');
        }
    };

    const { register: registerUpdateForm, handleSubmit: handleUpdateSubmit, reset: resetUpdateForm, formState: { errors: updateErrors } } = useForm<UpdateSocialGroup>({
      defaultValues: {
          name: currentUpdateGroup?.name || ""
      }});

      useEffect(() => {
        if (currentUpdateGroup) {
            resetUpdateForm({
                name: currentUpdateGroup.name,
            });
        }
    }, [currentUpdateGroup, resetUpdateForm]);

    const handleUpdateGroup = async (data : UpdateSocialGroup) => {
      if(typeof(currentUpdateGroup?.id) === "string"){
        try {
          await updateSocialGroupAPI({
            id: currentUpdateGroup.id,
            name: data.name
          });
          toast.success('Группа успешно обновлена');
          setIsUpdate(false);
          resetUpdateForm();
          fetchGroups();
        } catch (error) {
            toast.error('Ошибка при обновлении группы');
        }
      } else {
        toast.error('Ошибка при обновлении группы');        
      }
    }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isUpdate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Обновление новой группы</h2>
                <form onSubmit={handleUpdateSubmit(handleUpdateGroup)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название группы
                        </label>
                        <input
                            type="text"
                            {...registerUpdateForm("name", { required: "Обязательное поле" })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              updateErrors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Введите название"
                        />
                        {updateErrors.name && (
                            <p className="mt-1 text-sm text-red-500">{updateErrors.name.message}</p>
                        )}
                    </div>                                                              
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsUpdate(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Обновить
                        </button>
                    </div>
                </form>
            </div>
        </div>          
        )}
        {isCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">Создание новой группы</h2>
                <form onSubmit={handleCreateSubmit(handleCreateGroup)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название группы
                        </label>
                        <input
                            type="text"
                            {...registerCreateForm("name", { required: "Обязательное поле" })}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                createErrors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Введите название"
                        />
                        {createErrors.name && (
                            <p className="mt-1 text-sm text-red-500">{createErrors.name.message}</p>
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
                            Создать
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Управление социальными группами</h1>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Название группы</label>
            <input
              type="text"
              name="nameSearchPhrase"
              placeholder="Поиск по названию..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Поиск
            </button>
          </div>
        </form>

        {currentRole() === "Admin" && <>
        <button
          onClick={() => setIsCreate(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Создать новую группу
        </button>
        </>}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                    {currentRole() === "Admin" && <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groups.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {group.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(group.createdDate)}
                      </td>
                      {currentRole() === "Admin" && <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {setIsUpdate(true); setCurrentUpdateGroup({id:group.id, name:group.name} as SocialGroupDto)}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </td>
                      </>}
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
                  disabled={groups.length < (searchParams.pageSize ?? 10)}
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

export default SocialGroupsPage;
