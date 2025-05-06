import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBranchesAPI, GetBranches, createBranchAPI } from '../../Services/Management/BranchesService';
import { toast } from 'react-toastify';
import { BranchDto } from '../../Models/Management/Branches/BranchDto';
import { Layout } from '../../Components/Layout';
import { AuthContext } from '../../Context/AuthContext';
import { useForm } from 'react-hook-form';
import { ServiceDto } from '../../Models/Management/Services/ServiceDto';
import { getServicesAPI } from '../../Services/Management/ServicesService';

interface CreateBranchForm {
  sendNotification: boolean,
  name?: string | null,
  maxOccupancy: number,
  country?: string | null,
  city?: string | null,
  street?: string | null,
  houseNumber?: string | null,
  serviceNames: string
  selectedServices: {serviceId: string, serviceName: string}[];
}

const BranchesPage = () => {
    const {currentRole} = AuthContext();
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetBranches>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const [services, setServices] = useState<ServiceDto[]>([]);

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getBranchesAPI(searchParams);
      setBranches(response.data);
      
    } catch (err) {
      setError('Ошибка загрузки филиалов');
      toast.error('Не удалось загрузить данные филиалов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
  }, [isCreate]);

    const fetchServices = async () => {
        try {
            const response = await getServicesAPI({});
            setServices(response.data);
        } catch (error) {
            toast.error('Ошибка загрузки услуг');
        }
    };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBranches();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value || null,
      pageNumber: 1 
    }));
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

    const { 
        register: registerCreateBranchForm, 
        handleSubmit: handleCreateBranchSubmit, 
        reset: resetCreateBranchForm, 
        setValue: setCreateBranchValue, 
        watch: watchCreateBranch,
        formState: { errors: createBranchErrors } 
      } = useForm<CreateBranchForm>();
  
      const handleCreateBranchClient = async (data: CreateBranchForm) => {
        const servicesFromInput = typeof data.serviceNames === 'string' 
        ? data.serviceNames.split(',').map(s => s.trim()).filter(Boolean)
        : [];

        try {
          await createBranchAPI({
            sendNotification: data.sendNotification,
            name: data.name,
            maxOccupancy: data.maxOccupancy,
            country: data.country === "" ? null : data.country,
            city: data.city === "" ? null : data.city,
            street: data.street === "" ? null : data.street,
            houseNumber: data.houseNumber === "" ? null : data.houseNumber,
            serviceNames: [
              ...servicesFromInput,
              ...data.selectedServices.map(s => s.serviceName)
          ]
          });
          toast.success('Филиал успешно создан');
          setIsCreate(false);
          resetCreateBranchForm();
          fetchBranches();
        } catch (error) {
            toast.error('Ошибка при создании филиала');
        }
      };

      const handleServiceSelect = (selectedService: {serviceId: string, serviceName: string}) => {
        const currentSelected = watchCreateBranch("selectedServices") || [];
        const exists = currentSelected.some(s => s.serviceId === selectedService.serviceId);
        
        if (exists) {
          setCreateBranchValue("selectedServices", currentSelected.filter(s => s.serviceId !== selectedService.serviceId));
        } else {
          setCreateBranchValue("selectedServices", [...currentSelected, selectedService]);
        }
    };

  return (
    <Layout>
        <div className="container mx-auto px-4 py-8">
        {isCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-screen">
              <h2 className="text-xl font-bold mb-4">Создание нового филиала</h2>
              <form onSubmit={handleCreateBranchSubmit(handleCreateBranchClient)}>
                {/* Основная информация */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название филиала
                    </label>
                    <input
                      type="text"
                      {...registerCreateBranchForm("name", { required: "Обязательное поле" })}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        createBranchErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Введите название"
                    />
                    {createBranchErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{createBranchErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Макс. вместимость
                    </label>
                    <input
                      type="number"
                      {...registerCreateBranchForm("maxOccupancy", { 
                        required: "Обязательное поле",
                        min: { value: 1, message: "Минимум 1" }
                      })}
                      className={`w-full px-4 py-2 border rounded-lg ${
                        createBranchErrors.maxOccupancy ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Введите число"
                    />
                    {createBranchErrors.maxOccupancy && (
                      <p className="mt-1 text-sm text-red-500">{createBranchErrors.maxOccupancy.message}</p>
                    )}
                  </div>
                </div>

                {/* Адрес */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Страна
                    </label>
                    <input
                      type="text"
                      {...registerCreateBranchForm("country")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Введите страну"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Город
                    </label>
                    <input
                      type="text"
                      {...registerCreateBranchForm("city")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Введите город"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Улица
                    </label>
                    <input
                      type="text"
                      {...registerCreateBranchForm("street")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Введите улицу"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Номер дома
                    </label>
                    <input
                      type="text"
                      {...registerCreateBranchForm("houseNumber")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Введите номер"
                    />
                  </div>
                </div>

                {/* Услуги */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Услуги (через запятую)
                  </label>
                  <input
                    type="text"
                    {...registerCreateBranchForm("serviceNames")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Услуга 1, Услуга 2"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Выберите существующие услуги
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {services.map(service => (
                      <div key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`service-${service.id}`}
                          checked={watchCreateBranch("selectedServices")?.some(s => s.serviceId === service.id)}
                          onChange={() => handleServiceSelect({
                            serviceId: service.id, 
                            serviceName: service.name
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`service-${service.id}`} className="ml-2 block text-sm text-gray-700">
                          {service.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Уведомление */}
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="sendNotification"
                    {...registerCreateBranchForm("sendNotification")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
                    Отправить уведомление о создании
                  </label>
                </div>

                {/* Кнопки */}
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
        <h1 className="text-2xl font-bold mb-6">Управление филиалами</h1>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название филиала</label>
            <input
              type="text"
              name="nameSearchPhrase"
              placeholder="Поиск по названию"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input
              type="text"
              name="addressSearchPhrase"
              placeholder="Поиск по адресу"
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
          Создать новый филиал
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Адрес</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Вместимость</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {branches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {branch.name || 'Без названия'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {branch.address.city}, {branch.address.street} {branch.address.houseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {branch.maxOccupancy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(branch.createdDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => navigate(`/branches/${branch.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Управление
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
                    pageNumber: Math.max(1, (prev.pageNumber ?? 1)- 1)
                  }))}
                  disabled={searchParams.pageNumber === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  onClick={() => setSearchParams(prev => ({
                    ...prev,
                    pageNumber:  (prev.pageNumber ?? 1) + 1
                  }))}
                  disabled={branches.length < (searchParams.pageSize ?? 10)}
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

export default BranchesPage;
