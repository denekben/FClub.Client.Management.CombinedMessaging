import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientsAPI, GetClients, deleteClientAPI, createClientAPI, updateClientAPI } from '../../Services/Management/ClientsService';
import { toast } from 'react-toastify';
import { ClientDto } from '../../Models/Management/Clients/ClientDto';
import { Layout } from '../../Components/Layout';
import { createMembershipAPI, deleteMembershipAPI, updateMembershipAPI } from '../../Services/Management/MembershipService';
import { useForm } from 'react-hook-form';
import { SocialGroupDto } from '../../Models/Management/SocialGroups/SocialGroupDto';
import { getSocialGroupsAPI } from '../../Services/Management/SocialGroupsService';
import { MembershipDto } from '../../Models/Management/Memberships/MembershipDto';
import { GetTariffs, getTariffsAPI } from '../../Services/Management/TariffsService';
import { TariffDto } from '../../Models/Management/Tariffs/TariffDto';
import { TariffWithGroupsDto } from '../../Models/Management/Tariffs/TariffWithGroupsDto';
import { BranchDto } from '../../Models/Management/Branches/BranchDto';
import { GetBranches, getBranchesAPI } from '../../Services/Management/BranchesService';
import { watch } from 'fs';

type TriStateFilter = boolean | null;

interface CreateMembershipForm {
  tariffId: string,
  monthQuantity: number | null,
  clientId: string,
  branchId: string
}

interface UpdateMembershipForm {
  membershipId: string,
  tariffId: string,
  monthQuantity: number | null,
  clientId: string,
  branchId: string,
}

interface CreateClientForm {
  firstName: string,
  secondName: string,
  patronymic?: string | null,
  phone?: string | null,
  email: string,
  allowEntry: boolean,
  allowNotifications: boolean,
  socialGroupId?: string | null,
}

interface UpdateClientForm {
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

const ClientsPage = () => {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetClients>({
    pageNumber: 1,
    pageSize: 5,
    isStaff: null,
    allowedToEntry: null,
    allowedNotifications: null,
  });
  const [searchTariffParams, setSearchTariffParams] = useState<GetTariffs>({
    nameSearchPhrase: "",
    sortByCreatedDate: true,
    pageNumber: 1,
    pageSize: 5   
  });
  const [searchBranchParams, setSearchBranchParams] = useState<GetBranches>({
    nameSearchPhrase: "",
    addressSearchPhrase: "",
    sortByMaxOccupancy: true,
    sortByCreatedDate: true,
    pageNumber: 1,
    pageSize: 5,
  })
  const [tariffs, setTariffs] = useState<TariffWithGroupsDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  
  const [filterStates, setFilterStates] = useState<{
    isStaff: TriStateFilter;
    allowedToEntry: TriStateFilter;
    allowedNotifications: TriStateFilter;
  }>({
    isStaff: null,
    allowedToEntry: null,
    allowedNotifications: null,
  });

  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [currentUpdateClient, setCurrentUpdateClient] = useState<ClientDto | null>(null);

  const [isCreateMembership, setIsCreateMembership] = useState<boolean>(false);
  const [isUpdateMembership, setIsUpdateMembership] = useState<boolean>(false);
  const [currentUpdateMembershipClient, setCurrentUpdateMembershipClient] = useState<ClientDto | null>(null);
  const [currentCreateMembershipClientId, setCurrentCreateMembershipClientId] = useState<string>();

  const [socialGroups, setSocialGroups] = useState<SocialGroupDto[]>([]);
  const [loadingSocialGroups, setLoadingSocialGroups] = useState(false);


  useEffect(() => {
    const fetchSocialGroups = async () => {
        setLoadingSocialGroups(true);
        try {
            const response = await getSocialGroupsAPI({});
            setSocialGroups(response.data);
        } catch (error) {
            toast.error('Не удалось загрузить социальные группы');
        } finally {
            setLoadingSocialGroups(false);
        }
    };

    if (isCreate) {
        fetchSocialGroups();
    }
    if(isUpdate){
      console.log(socialGroups)
      fetchSocialGroups();      
    }
}, [isCreate, isUpdate]);

  const navigate = useNavigate();

  const fetchTariffs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTariffsAPI(searchTariffParams);
      setTariffs(response.data);
    } catch (err) {
      setError('Ошибка загрузки тарифов');
      toast.error('Не удалось загрузить данные тарифов');
    } finally {
      setLoading(false);
    }   
  }

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBranchesAPI(searchBranchParams);
      setBranches(response.data);
    } catch (err) {
      setError('Ошибка загрузки филиалов');
      toast.error('Не удалось загрузить данные филиалов');
    } finally {
      setLoading(false);
    }   
  }

  useEffect(() => {
    fetchTariffs();
    fetchBranches();
  }, [isCreateMembership, isUpdateMembership]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getClientsAPI(searchParams);
      setClients(response.data);
    } catch (err) {
      setError('Ошибка загрузки клиентов');
      toast.error('Не удалось загрузить данные клиентов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
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

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить клиента?')) {
      try {
        await deleteClientAPI(clientId);
        toast.success('Клиент успешно удалён');
        fetchClients();
      } catch (error) {
        toast.error('Ошибка при удалении клиента');
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

  const handleDeleteMembership = async (clientId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить абонемент?')) {
      var membershipId = clients.find(c=>c.id == clientId)?.membership?.id
      if(typeof(membershipId) !== "string") {
        toast.error('Ошибка при удалении клиента');
      }
      else {
        try {
          await deleteMembershipAPI(membershipId);
          toast.success('Клиент успешно удалён');
          fetchClients();
        } catch (error) {
          toast.error('Ошибка при удалении клиента');
        }
      }
    }
  }

  // clients

    const { register: registerCreateForm, handleSubmit: handleCreateSubmit, reset: resetCreateForm, formState: { errors: createErrors } } = useForm<CreateClientForm>({
      defaultValues: {
          allowEntry: true,
          allowNotifications: true,
          socialGroupId: null
      }
  });

    const handleCreateClient = async (data: CreateClientForm) => {
        try {
            await createClientAPI({
              firstName: data.firstName,
              secondName: data.secondName,
              patronymic: data.patronymic,
              phone: data.phone === "" ? null : data.phone,
              email: data.email,
              allowEntry: data.allowEntry,
              allowNotifications: data.allowNotifications,
              socialGroupId: data.socialGroupId === "" ? null : data.socialGroupId ,
            });
            toast.success('Клиент успешно создан');
            setIsCreate(false);
            resetCreateForm();
            fetchClients();
        } catch (error) {
            toast.error('Ошибка при создании клиента');
        }
    };

    const { 
      register: registerUpdateForm, 
      handleSubmit: handleUpdateSubmit, 
      reset: resetUpdateForm, 
      formState: { errors: updateErrors } 
    } = useForm<UpdateClientForm>({
      defaultValues: currentUpdateClient ? {
        id: currentUpdateClient.id,
        firstName: typeof currentUpdateClient.fullName === 'string' 
          ? currentUpdateClient.fullName 
          : undefined,
        secondName: 'secondName' in currentUpdateClient && typeof currentUpdateClient.secondName === 'string'
          ? currentUpdateClient.secondName 
          : undefined,
        patronymic: 'patronymic' in currentUpdateClient && (currentUpdateClient.patronymic === null || typeof currentUpdateClient.patronymic === 'string')
          ? currentUpdateClient.patronymic === "" 
            ? null 
            : currentUpdateClient.patronymic
          : undefined,
        phone: 'phone' in currentUpdateClient && (currentUpdateClient.phone === null || typeof currentUpdateClient.phone === 'string')
          ? currentUpdateClient.phone === "" 
            ? null 
            : currentUpdateClient.phone
          : undefined,
        email: 'email' in currentUpdateClient && typeof currentUpdateClient.email === 'string'
          ? currentUpdateClient.email 
          : undefined,
        isStaff: 'isStaff' in currentUpdateClient && typeof currentUpdateClient.isStaff === 'boolean'
          ? currentUpdateClient.isStaff 
          : undefined,
        allowEntry: 'allowEntry' in currentUpdateClient && typeof currentUpdateClient.allowEntry === 'boolean'
          ? currentUpdateClient.allowEntry 
          : undefined,
        allowNotifications: 'allowNotifications' in currentUpdateClient && typeof currentUpdateClient.allowNotifications === 'boolean'
          ? currentUpdateClient.allowNotifications 
          : undefined,
        socialGroupId: 'socialGroupId' in currentUpdateClient && (currentUpdateClient.socialGroupId === null || typeof currentUpdateClient.socialGroupId === 'string')
          ? currentUpdateClient.socialGroupId
          : undefined
      } : undefined
    });



    const handleUpdateClient = async (data: UpdateClientForm) => {
      if (currentUpdateClient) { 
        try {
          await updateClientAPI({
            id: currentUpdateClient?.id,
            firstName: data.firstName,
            secondName: data.secondName,
            patronymic: data.patronymic === "" ? null : data.patronymic,
            phone: data.phone === "" ? null : data.phone,
            email: data.email,
            isStaff: currentUpdateClient?.isStaff,
            allowEntry: data.allowEntry,
            allowNotifications: data.allowNotifications,
            socialGroupId: data.socialGroupId === "" ? null : data.socialGroupId ,
          });
          toast.success('Клиент успешно создан');
          setIsUpdate(false);
          resetCreateForm();
          fetchClients();
      } catch (error) {
          toast.error('Ошибка при создании клиента');
      }
      }
      else {
        toast.error('Ошибка при создании клиента');        
      }
    };


    // memberships
    const { 
      register: registerCreateMembershipForm, 
      handleSubmit: handleCreateMembershipSubmit, 
      reset: resetCreateMembershipForm, 
      setValue: setCreateMembershipValue, 
      watch: watchCreateMembership,
      formState: { errors: createMembershipErrors } 
    } = useForm<CreateMembershipForm>();

    const handleCreateMembershipClient = async (data: CreateMembershipForm) => {
      if(typeof(currentCreateMembershipClientId)==="string" && data.monthQuantity!=null){
        try {
          await createMembershipAPI({
            tariffId: data.tariffId,
            monthQuantity: data.monthQuantity,
            clientId: currentCreateMembershipClientId,
            branchId: data.branchId
          });
          toast.success('Абонемент успешно создан');
          setIsCreateMembership(false);
          resetCreateMembershipForm();
          fetchClients();
        } catch (error) {
            toast.error('Ошибка при создании абонемента');
        }
      } else {
        toast.error('Ошибка при создании абонемента');        
      }

    };

const { 
  register: registerUpdateMembershipForm, 
  handleSubmit: handleUpdateMembershipSubmit, 
  reset: resetUpdateMembershipForm, 
  setValue: setUpdateMembershipValue, 
  watch: watchUpdateMembership,
  formState: { errors: updateMembershipErrors } 
} = useForm<UpdateMembershipForm>({
  defaultValues: {
    membershipId: currentUpdateMembershipClient?.id,
    tariffId: currentUpdateMembershipClient?.membership?.tariff.id,
    monthQuantity: currentUpdateMembershipClient?.membership?.monthQuantity,
    clientId: currentUpdateMembershipClient?.id,
    branchId: currentUpdateMembershipClient?.membership?.branchId
  }
});

    const handleUpdateMembership = async (data: UpdateMembershipForm) => {
      if(currentUpdateMembershipClient && data.monthQuantity!=null){
        try {
          await updateMembershipAPI({
            membershipId: data.membershipId,
            tariffId: data.tariffId,
            monthQuantity: data.monthQuantity,
            clientId: data.clientId,
            branchId: data.branchId
          });
          toast.success('Абонемент успешно создан');
          setIsUpdateMembership(false);
          resetUpdateMembershipForm();
          fetchClients();
        } catch (error) {
            toast.error('Ошибка при обновлении абонемента');
        }
      } else {
        toast.error('Ошибка при обновлении абонемента');        
      }

    };

    const handleTariffChangeCreateMembership = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCreateMembershipValue("tariffId", e.target.value);
      setCreateMembershipValue("monthQuantity", null);
    };

    const handleTariffChangeUpdateMembership = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setUpdateMembershipValue("tariffId", e.target.value);
      setUpdateMembershipValue("monthQuantity", null);
    };

    useEffect(() => {
      if (currentUpdateClient) {
          resetUpdateForm({
            id: currentUpdateClient.id,
            firstName: currentUpdateClient.fullName.firstName,
            secondName: currentUpdateClient.fullName.secondName,
            patronymic: currentUpdateClient.fullName.patronymic,
            phone: currentUpdateClient.phone,
            email: currentUpdateClient.email,
            isStaff: currentUpdateClient?.isStaff,
            allowEntry: currentUpdateClient.allowEntry,
            allowNotifications: currentUpdateClient.allowNotifications,
            socialGroupId: currentUpdateClient.socialGroup?.id
          });
      }
  }, [currentUpdateClient, resetUpdateForm]);

  useEffect(() => {
    if (currentUpdateMembershipClient) {
        resetUpdateMembershipForm({
          membershipId: currentUpdateMembershipClient?.membership?.id,
          tariffId: currentUpdateMembershipClient?.membership?.tariff.id,
          monthQuantity: currentUpdateMembershipClient?.membership?.monthQuantity,
          clientId: currentUpdateMembershipClient?.id,
          branchId: currentUpdateMembershipClient?.membership?.branchId
        });
    }
}, [currentUpdateMembershipClient, resetUpdateMembershipForm]);
    
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      {isUpdateMembership && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Создание нового клиента</h2>
                            <form onSubmit={handleUpdateMembershipSubmit(handleUpdateMembership)}>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Филиал
                                </label>
                                <select
                                  {...registerUpdateMembershipForm("branchId", { required: "Обязательное поле" })}
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    updateMembershipErrors.branchId ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Не выбрано</option>
                                  {branches.map(group => (
                                    <option key={group.id} value={group.id}>
                                      {group.name}
                                    </option>
                                  ))}
                                </select>
                                {updateMembershipErrors.branchId && (
                                  <p className="mt-1 text-sm text-red-500">{updateMembershipErrors.branchId.message}</p>
                                )}
                              </div>  

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Тариф
                                </label>
                                <select
                                  {...registerUpdateMembershipForm("tariffId", { 
                                    required: "Обязательное поле",
                                    onChange: handleTariffChangeUpdateMembership
                                  })}
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    updateMembershipErrors.tariffId ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Не выбрано</option>
                                  {tariffs.map(tariff => (
                                    <option key={tariff.id} value={tariff.id}>
                                      {tariff.name}
                                    </option>
                                  ))}
                                </select>
                                {updateMembershipErrors.tariffId && (
                                  <p className="mt-1 text-sm text-red-500">{updateMembershipErrors.tariffId.message}</p>
                                )}
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Количество месяцев
                                </label>
                                <select
                                  {...registerUpdateMembershipForm("monthQuantity", { 
                                    required: "Обязательное поле",
                                    valueAsNumber: true
                                  })}
                                  disabled={!watchUpdateMembership("tariffId")}
                                  className={`... ${!watchUpdateMembership("tariffId") ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                >
                                  <option value="">{watchUpdateMembership("tariffId") ? "Выберите количество месяцев" : "Сначала выберите тариф"}</option>
                                  {watchUpdateMembership("tariffId") && 
                                    Object.entries(tariffs.find(t => t.id === watchUpdateMembership("tariffId"))?.priceForNMonths || {})
                                      .map(([month]) => (
                                        <option key={month} value={month}>
                                          {month} месяцев - {
                                            tariffs.find(t => t.id === watchUpdateMembership("tariffId"))?.priceForNMonths[Number(month)]?.toLocaleString('ru-RU')
                                          } ₽
                                        </option>
                                      ))
                                  }
                                </select>
                                {updateMembershipErrors.monthQuantity && (
                                  <p className="mt-1 text-sm text-red-500">{updateMembershipErrors.monthQuantity.message}</p>
                                )}
                              </div>

                              <div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setIsUpdateMembership(false)}
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
      {isCreateMembership && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Создание нового клиента</h2>
                            <form onSubmit={handleCreateMembershipSubmit(handleCreateMembershipClient)}>
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Филиал
                                </label>
                                <select
                                  {...registerCreateMembershipForm("branchId", { required: "Обязательное поле" })}
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    createMembershipErrors.branchId ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Не выбрано</option>
                                  {branches.map(group => (
                                    <option key={group.id} value={group.id}>
                                      {group.name}
                                    </option>
                                  ))}
                                </select>
                                {createMembershipErrors.branchId && (
                                  <p className="mt-1 text-sm text-red-500">{createMembershipErrors.branchId.message}</p>
                                )}
                              </div>  

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Тариф
                                </label>
                                <select
                                  {...registerCreateMembershipForm("tariffId", { 
                                    required: "Обязательное поле",
                                    onChange: handleTariffChangeCreateMembership
                                  })}
                                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    createMembershipErrors.tariffId ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Не выбрано</option>
                                  {tariffs.map(tariff => (
                                    <option key={tariff.id} value={tariff.id}>
                                      {tariff.name}
                                    </option>
                                  ))}
                                </select>
                                {createMembershipErrors.tariffId && (
                                  <p className="mt-1 text-sm text-red-500">{createMembershipErrors.tariffId.message}</p>
                                )}
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Количество месяцев
                                </label>
                                <select
                                  {...registerCreateMembershipForm("monthQuantity", { 
                                    required: "Обязательное поле",
                                    valueAsNumber: true
                                  })}
                                  disabled={!watchCreateMembership("tariffId")}
                                  className={`... ${!watchCreateMembership("tariffId") ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                >
                                  <option value="">{watchCreateMembership("tariffId") ? "Выберите количество месяцев" : "Сначала выберите тариф"}</option>
                                  {watchCreateMembership("tariffId") && 
                                    Object.entries(tariffs.find(t => t.id === watchCreateMembership("tariffId"))?.priceForNMonths || {})
                                      .map(([month]) => (
                                        <option key={month} value={month}>
                                          {month} месяцев - {
                                            tariffs.find(t => t.id === watchCreateMembership("tariffId"))?.priceForNMonths[Number(month)]?.toLocaleString('ru-RU')
                                          } ₽
                                        </option>
                                      ))
                                  }
                                </select>
                                {createMembershipErrors.monthQuantity && (
                                  <p className="mt-1 text-sm text-red-500">{createMembershipErrors.monthQuantity.message}</p>
                                )}
                              </div>

                              <div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  onClick={() => setIsCreateMembership(false)}
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
          {isUpdate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Обновление клиента</h2>
                            <form onSubmit={handleUpdateSubmit(handleUpdateClient)}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Имя
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateForm("firstName", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          updateErrors.firstName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите имя"
                                    />
                                    {updateErrors.firstName && (
                                        <p className="mt-1 text-sm text-red-500">{updateErrors.firstName?.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Фамилия
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateForm("secondName", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          updateErrors.secondName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите фамилию"
                                    />
                                    {updateErrors.secondName && (
                                        <p className="mt-1 text-sm text-red-500">{updateErrors.secondName.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Отчество
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateForm("patronymic")}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          updateErrors.patronymic ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите отчество"
                                    />
                                    {updateErrors.patronymic && (
                                        <p className="mt-1 text-sm text-red-500">{updateErrors.patronymic.message}</p>
                                    )}
                                </div>         
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Телефон
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateForm("phone")}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          updateErrors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите телефон"
                                    />
                                    {updateErrors.phone && (
                                        <p className="mt-1 text-sm text-red-500">{updateErrors.phone.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Электронная почта
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateForm("email", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                          updateErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите электронную почту"
                                    />
                                    {updateErrors.email && (
                                        <p className="mt-1 text-sm text-red-500">{updateErrors.email.message}</p>
                                    )}
                                </div>
                              <div className="mb-4 grid grid-cols-2 gap-4">
                                  <div className="flex items-center">
                                      <input
                                          type="checkbox"
                                          id="allowEntry"
                                          {...registerUpdateForm("allowEntry")}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="allowEntry" className="ml-2 block text-sm text-gray-900">
                                          Разрешить вход
                                      </label>
                                  </div>

                                  <div className="flex items-center">
                                      <input
                                          type="checkbox"
                                          id="allowNotifications"
                                          {...registerUpdateForm("allowNotifications")}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="allowNotifications" className="ml-2 block text-sm text-gray-900">
                                          Разрешить уведомления
                                      </label>
                                  </div>
                              </div>

                              <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Социальная группа
                                  </label>
                                  <select
                                      {...registerUpdateForm("socialGroupId")}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                      <option value="">Не выбрано</option>
                                      {socialGroups.map(group => (
                                          <option key={group.id} value={group.id}>
                                              {group.name}
                                          </option>
                                      ))}
                                  </select>
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
                            <h2 className="text-xl font-bold mb-4">Создание нового клиента</h2>
                            <form onSubmit={handleCreateSubmit(handleCreateClient)}>
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
                              <div className="mb-4 grid grid-cols-2 gap-4">
                                  <div className="flex items-center">
                                      <input
                                          type="checkbox"
                                          id="allowEntry"
                                          {...registerCreateForm("allowEntry")}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="allowEntry" className="ml-2 block text-sm text-gray-900">
                                          Разрешить вход
                                      </label>
                                  </div>

                                  <div className="flex items-center">
                                      <input
                                          type="checkbox"
                                          id="allowNotifications"
                                          {...registerCreateForm("allowNotifications")}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                      />
                                      <label htmlFor="allowNotifications" className="ml-2 block text-sm text-gray-900">
                                          Разрешить уведомления
                                      </label>
                                  </div>
                              </div>

                              <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Социальная группа
                                  </label>
                                  <select
                                      {...registerCreateForm("socialGroupId")}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                      <option value="">Не выбрано</option>
                                      {socialGroups.map(group => (
                                          <option key={group.id} value={group.id}>
                                              {group.name}
                                          </option>
                                      ))}
                                  </select>
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
        <h1 className="text-2xl font-bold mb-6">Управление клиентами</h1>
        
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
                onClick={() => handleFilterChange('isStaff')}
                className={`px-3 py-1 rounded-md text-sm flex items-center space-x-2 ${getFilterButtonClass(filterStates.isStaff)}`}
              >
                <span>Персонал:</span>
                <span className="font-bold">{getFilterIcon(filterStates.isStaff)}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('allowedToEntry')}
                className={`px-3 py-1 rounded-md text-sm flex items-center space-x-2 ${getFilterButtonClass(filterStates.allowedToEntry)}`}
              >
                <span>Доступ:</span>
                <span className="font-bold">{getFilterIcon(filterStates.allowedToEntry)}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFilterChange('allowedNotifications')}
                className={`px-3 py-1 rounded-md text-sm flex items-center space-x-2 ${getFilterButtonClass(filterStates.allowedNotifications)}`}
              >
                <span>Уведомления:</span>
                <span className="font-bold">{getFilterIcon(filterStates.allowedNotifications)}</span>
              </button>
            </div>
          </div>
        </form>

        <button
          onClick={() => setIsCreate(true)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Создать нового клиента
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Доступ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Абонемент</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {client.fullName.secondName} {client.fullName.firstName} {client.fullName.patronymic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{client.phone || 'Не указан'}</div>
                        <div>{client.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                          client.allowEntry ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {client.allowEntry ? 'Разрешён' : 'Запрещён'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(client.createdDate)}
                      </td>
                      <td>
                        {client.membership ? (
                          <span>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {setCurrentUpdateMembershipClient(client); setIsUpdateMembership(true)}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDeleteMembership(client.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </td>
                          </span>
                        ) : (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                          onClick={() => {setCurrentCreateMembershipClientId(client.id); setIsCreateMembership(true)}}
                          className="text-green-600 hover:text-green-900"
                        >
                          Создать
                        </button>
                        </td>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {setIsUpdate(true); setCurrentUpdateClient(client)}}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
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
                  disabled={clients.length < (searchParams.pageSize ?? 10)}
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

export default ClientsPage;