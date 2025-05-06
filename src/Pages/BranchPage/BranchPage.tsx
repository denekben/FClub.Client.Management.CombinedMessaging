import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../Components/Layout";
import { useEffect, useState } from "react";
import { BranchDto } from "../../Models/Management/Branches/BranchDto";
import { BranchDto as FullnessDto } from "../../Models/AccessControl/Branches/BranchDto";
import { deleteBranchAPI, getBranchAPI, updateBranchAPI } from "../../Services/Management/BranchesService";
import { Doughnut } from "react-chartjs-2";
import { getBranchFullnessAPI } from "../../Services/AccessControl/FullnessService";
import { TurnstileDto } from "../../Models/AccessControl/Turnstiles/TurnstileDto";
import { createTurnstileAPI, deleteTurnstileAPI, GetTurnstiles, getTurnstilesAPI, updateTurnstileAPI } from "../../Services/AccessControl/TurnstilesService";
import { AuthContext } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { GetEntryLogs, getEntryLogsAPI } from "../../Services/AccessControl/EntryLogsService";
import { EntryLogDto } from "../../Models/AccessControl/EntryLogs/EntryLogDto";
import { useForm } from "react-hook-form";
import { ServiceDto } from "../../Models/Management/Services/ServiceDto";
import { GetServices, getServicesAPI } from "../../Services/Management/ServicesService";

interface UpdateBranchForm {
    branchId: string,
    name?: string | null,
    maxOccupancy: number,
    country?: string | null,
    city?: string | null,
    street?: string | null,
    houseNumber?: string | null,
    serviceNames: string,
    selectedServices: {serviceId: string, serviceName: string}[];
}

interface UpdateTurnstileForm {
    turnstileId: string,
    name?: string | null,
    isMain: boolean,
    branchId: string,
    serviceId?: string | null
}

interface CreateTurnstileForm {
    name?: string | null,
    isMain: boolean,
    branchId: string,
    serviceId?: string | null
  }

const BranchPage = () => {
    const {currentRole} = AuthContext();
    const navigate = useNavigate();
    const { branchId } = useParams<{ branchId?: string }>();
    const [branch, setBranch] = useState<BranchDto | null>(null);
    const [fullness, setFullness] = useState<FullnessDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingBranch, setLoadingBranch] = useState(true);
    const [loadingFullness, setLoadingFullness] = useState(true);
    const [turnstiles, setTurnstiles] = useState<TurnstileDto[]>([]);
    const [isCreateTurnstile, setIsCreateTurnstile] = useState<boolean>(false);
    const [isUpdateTurnstile, setIsUpdateTurnstile] = useState<boolean>(false);
    const [isUpdateBranch, setIsUpdateBranch] = useState<boolean>(false);
    const [isLogs, setIsLogs] = useState<boolean>(false);
    const [currentUpdateTurnstile, setCurrentUpdateTurnstile] = useState<TurnstileDto | null>(null);
    const [currentLogTurnstileId, setCurrentLogTurnstileId] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState<GetTurnstiles>({
        branchId: branchId,
        pageNumber: 1,
        pageSize: 10,
      });
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [logs, setLogs] = useState<EntryLogDto[]>([]);
    const [searchLogParams, setSearchLogParams] = useState<GetEntryLogs>({
        turnstileId: currentLogTurnstileId,
        pageNumber: 1,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); 
    const [debouncedQuery, setDebouncedQuery] = useState(''); 
    const [currentTurnstile, setCurrentTurnstile] = useState<TurnstileDto | null>(null);

useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchBranch = async (branchId: string) => {
    try {
        const [branchResponse, fullnessResponse] = await Promise.all([
            getBranchAPI(branchId),
            getBranchFullnessAPI(branchId)
        ]);

        setBranch(branchResponse.data);
        setFullness(fullnessResponse.data);
        setError(null);
    } catch (error) {
        setError('Ошибка загрузки данных филиала');
        setBranch(null);
        setFullness(null);
    } finally {
        setLoadingBranch(false);
        setLoadingFullness(false);
    }
};

useEffect(() => {
    if (branchId) {
        setLoadingBranch(true);
        setLoadingFullness(true);
        fetchBranch(branchId);
    }
}, [branchId]);

    const fetchTurnstiles = async () => {
        try {
          const response = await getTurnstilesAPI(searchParams);
          setTurnstiles(response.data);
        } catch (error) {
          console.error('Ошибка загрузки турникетов:', error);
        }
    }

    useEffect(() => {
        if (branchId) {
            fetchTurnstiles()
          };
        }, [searchParams, branchId]);

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setSearchParams(prev => ({
            ...prev,
            [name]: value || null,
            pageNumber: 1 
          }));
        };

    const handleSearch = (e: React.FormEvent) => {
        if(typeof(branchId) === "string"){
            e.preventDefault();
            fetchTurnstiles();
        }
    };

    const handleDeleteBranch = async (branchId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить филиал?')) {
            if (typeof branchId !== "string") {
                toast.error('Ошибка при удалении филиала');
                return;
            }
    
            try {
                await deleteBranchAPI(branchId);
                toast.success('Филиал успешно удалён');
                navigate("/branches");
            } catch (error) {
                console.error('Ошибка при удаления филиала:', error);
                
                if (axios.isAxiosError(error) && error.response?.status === 500) {
                    const errorMessage = error.response.data as string;
                    if (errorMessage.includes('23502') && 
                        errorMessage.includes('Memberships') && 
                        errorMessage.includes('BranchId')) {
                        toast.error('Нельзя удалить филиал, так как есть клиенты с активными абонементами');
                    } else {
                        toast.error('Ошибка сервера при удалении филиала');
                    }
                } else {
                    toast.error('Ошибка при удалении филиала');
                }
            }
        }
    };

  const handleDeleteTurnstile = async (turnstileId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить турникет?')) {
      if(typeof(turnstileId) !== "string") {
        toast.error('Ошибка при удалении турникета');
      }
      else {
        try {
          await deleteTurnstileAPI(turnstileId);
          toast.success('Турникет успешно удалён');
          fetchTurnstiles();
        } catch (error) {
          toast.error('Ошибка при удалении турникета');
        }
      }
    }
  }

useEffect(() => {
    if (!isLogs || !currentLogTurnstileId) return;
  
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await getEntryLogsAPI({
          turnstileId: currentLogTurnstileId,
          clientNameSearchPhrase: debouncedQuery || undefined,
          pageNumber: currentPage,
          pageSize: 10,
        });
        setLogs(response.data);
        setHasMore(response.data.length === 10);
      } catch (error) {
        setError('Ошибка загрузки логов');
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchLogs();
  }, [currentLogTurnstileId, debouncedQuery, currentPage, isLogs]);

  const handleShowLogs = (turnstileId: string) => {
    setCurrentLogTurnstileId(turnstileId);
    setIsLogs(true);
    setCurrentPage(1); 
    setSearchQuery(''); 
  };


    // create turnstile
    const { 
        register: registerCreateTurnstileForm, 
        handleSubmit: handleCreateTurnstileSubmit, 
        reset: resetCreateTurnstileForm, 
        setValue: setCreateTurnstileValue, 
        watch: watchCreateTurnstile,
        formState: { errors: createTurnstileErrors } 
    } = useForm<CreateTurnstileForm>({
    defaultValues: {
        branchId: branchId
    }
    });

    const handleCreateTurnstile = async (data: CreateTurnstileForm) => {
        try {
            await createTurnstileAPI({
                name: data.name,
                isMain: data.isMain,
                branchId: data.branchId,
                serviceId: data.serviceId
            });
            toast.success('Турникет успешно создан');
            setIsCreateTurnstile(false);
            resetCreateTurnstileForm();
            fetchTurnstiles();
        } catch (error) {
            toast.error('Ошибка при создании турникета');
        }
    };

    // update turnstile
    const { 
        register: registerUpdateTurnstileForm, 
        handleSubmit: handleUpdateTurnstileSubmit, 
        reset: resetUpdateTurnstileForm, 
        setValue: setUpdateTurnstileValue, 
        watch: watchUpdateTurnstile,
        formState: { errors: updateTurnstileErrors } 
    } = useForm<UpdateTurnstileForm>({
    defaultValues: {

    }
    });

    const handleUpdateTurnstile = async (data: UpdateTurnstileForm) => {
        if(currentTurnstile) {
            try {
                await updateTurnstileAPI({
                    turnstileId: currentTurnstile?.id,
                    name: data.name,
                    isMain: data.isMain,
                    branchId: currentTurnstile.branchId,
                    serviceId: data.serviceId
                });
                toast.success('Турникет успешно обновлен');
                setIsUpdateTurnstile(false);
                resetUpdateTurnstileForm();
                fetchTurnstiles();
            } catch (error) {
                toast.error('Ошибка при обновлении турникета');
            }
        }
        else {
            toast.error('Ошибка при обновлении турникета');           
        }
    };

    useEffect(() => {
        if (currentTurnstile) {
          setUpdateTurnstileValue("turnstileId", currentTurnstile.id);
          setUpdateTurnstileValue("name", currentTurnstile.name || '');
          setUpdateTurnstileValue("isMain", currentTurnstile.isMain);
          setUpdateTurnstileValue("branchId", currentTurnstile.branchId);
          setUpdateTurnstileValue("serviceId", currentTurnstile.service?.id || null);
        }
      }, [currentTurnstile, setUpdateTurnstileValue]);

      const handleEditTurnstile = (turnstile: TurnstileDto) => {
        setCurrentTurnstile(turnstile);
        setIsUpdateTurnstile(true);
      };


      // update branch
        const { 
        register: registerUpdateBranchForm, 
        handleSubmit: handleUpdateBranchSubmit, 
        reset: resetUpdateBranchForm, 
        setValue: setUpdateBranchValue, 
        watch: watchUpdateBranch,
        formState: { errors: updateBranchErrors } 
      } = useForm<UpdateBranchForm>({
        defaultValues: {
            selectedServices: [],
            serviceNames: ""
        }
    });

      const handleUpdateBranch = async (data: UpdateBranchForm) => {
        if(branchId){
            try {
                // Обрабатываем услуги
                const servicesFromInput = typeof data.serviceNames === 'string' 
                    ? data.serviceNames.split(',').map(s => s.trim()).filter(Boolean)
                    : [];
        
                // Отправляем данные на сервер
                await updateBranchAPI({
                    branchId: branchId,
                    name: data.name,
                    maxOccupancy: data.maxOccupancy,
                    country: data.country === "" ? null : data.country,
                    city: data.city === "" ? null : data.city,
                    street: data.street === "" ? null : data.street,
                    houseNumber: data.houseNumber === "" ? null : data.houseNumber,
                    serviceNames: servicesFromInput
                });
                
                toast.success('Филиал успешно обновлен');
                setIsUpdateBranch(false);
                resetUpdateBranchForm();
                fetchBranch(branchId);
            } catch (error) {
                toast.error('Ошибка при обновлении филиала');
            }
        } else {
            toast.error('Ошибка при обновлении филиала');
        }

    };


    const handleUpdateClick = (branch: BranchDto) => {
        setBranch(branch);
        setIsUpdateBranch(true);
    
        const selectedServices = branch.services?.map(service => ({
            serviceId: service.id,
            serviceName: service.name
        })) || []; 
    
        // Если serviceNames - строка с перечислением имён услуг через запятую
        const serviceNames = branch.services?.map(service => service.name).join(', ') || '';
    
        setUpdateBranchValue('branchId', branch.id);
        setUpdateBranchValue('name', branch.name || '');
        setUpdateBranchValue('maxOccupancy', branch.maxOccupancy || 0);
        setUpdateBranchValue('country', branch.address?.country || '');
        setUpdateBranchValue('city', branch.address?.city || '');
        setUpdateBranchValue('street', branch.address?.street || '');
        setUpdateBranchValue('houseNumber', branch.address?.houseNumber || '');
        setUpdateBranchValue('selectedServices', selectedServices);
        setUpdateBranchValue('serviceNames', serviceNames);
    };

    return (
    <Layout>
        {error ? (
            <div className="p-6 text-red-500 text-center">
                {error}
            </div>
            ) : (
            <>{(branchId && branch && fullness) && (
                <div className="container mx-auto px-4 py-8">
                {isUpdateBranch && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-screen">
                            <h2 className="text-xl font-bold mb-4">Обновление филиала</h2>
                            <form onSubmit={handleUpdateBranchSubmit(handleUpdateBranch)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Название филиала */}
                                <div className="mb-4">
                                    <label className="block tex t-sm font-medium text-gray-700 mb-1">
                                        Название филиала
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateBranchForm("name", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            updateBranchErrors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите название тарифа"
                                    />
                                    {updateBranchErrors.name && (
                                        <p className="mt-1 text-sm text-red-500">{updateBranchErrors.name.message}</p>
                                    )}
                                </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Услуги (через запятую)
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateBranchForm("serviceNames")}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="Услуга 1, Услуга 2"
                                    />
                                </div>
                                    
                                    {/* Максимальная вместимость */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Максимальная вместимость
                                        </label>
                                        <input
                                            type="number"
                                            {...registerUpdateBranchForm("maxOccupancy", { required: "Обязательное поле" })}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                updateBranchErrors.maxOccupancy ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                    </div>

                                    {/* Адрес */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Страна
                                        </label>
                                        <input
                                            type="text"
                                            {...registerUpdateBranchForm("country")}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Город
                                        </label>
                                        <input
                                            type="text"
                                            {...registerUpdateBranchForm("city")}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Улица
                                        </label>
                                        <input
                                            type="text"
                                            {...registerUpdateBranchForm("street")}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Номер дома
                                        </label>
                                        <input
                                            type="text"
                                            {...registerUpdateBranchForm("houseNumber")}
                                            className="w-full px-4 py-2 border rounded-lg"
                                        />
                                    </div>
                                    {/* Услуги (ручной ввод) */}
                                    <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Услуги (через запятую)
                                            </label>
                                            <input
                                                type="text"
                                                {...registerUpdateBranchForm("serviceNames")}
                                                className="w-full px-4 py-2 border rounded-lg"
                                                placeholder="Услуга 1, Услуга 2"
                                            />
                                        </div>

                                {/* Кнопки */}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsUpdateBranch(false)}
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
                    {isUpdateTurnstile && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Обновление турникета</h2>
                            <form onSubmit={handleUpdateTurnstileSubmit(handleUpdateTurnstile)}>
                                {/* Поле названия турникета */}
                                <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Название турникета
                                </label>
                                <input
                                    type="text"
                                    {...registerUpdateTurnstileForm("name")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Введите название турникета"
                                />
                                </div>

                                {/* Поле типа турникета */}
                                <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тип турникета
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={!watchUpdateTurnstile("isMain")}
                                        onChange={() => {
                                        setUpdateTurnstileValue("isMain", false);
                                        setUpdateTurnstileValue("serviceId", "");
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2">Дополнительный</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={watchUpdateTurnstile("isMain")}
                                        onChange={() => {
                                        setUpdateTurnstileValue("isMain", true);
                                        setUpdateTurnstileValue("serviceId", null);
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2">Главный</span>
                                    </label>
                                </div>
                                </div>

                                {/* Поле выбора сервиса (только для дополнительных турникетов) */}
                                {!watchUpdateTurnstile("isMain") && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Сервис (только для внутренних турникетов)
                                    </label>
                                    <select
                                    {...registerUpdateTurnstileForm("serviceId")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                    <option value="">Не выбрано</option>
                                    {branch.services?.map(service => (
                                        <option 
                                        key={service.id} 
                                        value={service.id}
                                        selected={service.id === currentTurnstile?.service?.id}
                                        >
                                        {service.name}
                                        </option>
                                    ))}
                                    </select>
                                </div>
                                )}

                                <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateTurnstile(false)}
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
                    {isCreateTurnstile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">Создание нового турникета</h2>
                        <form onSubmit={handleCreateTurnstileSubmit(handleCreateTurnstile)}>
                            {/* Поле названия турникета */}
                            <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Название турникета
                            </label>
                            <input
                                type="text"
                                {...registerCreateTurnstileForm("name")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Введите название турникета"
                            />
                            </div>

                            {/* Поле типа турникета */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тип турникета
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={!watchCreateTurnstile("isMain")}
                                        onChange={() => {
                                            setCreateTurnstileValue("isMain", false);
                                            setCreateTurnstileValue("serviceId", "");
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2">Дополнительный</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        checked={watchCreateTurnstile("isMain")}
                                        onChange={() => {
                                            setCreateTurnstileValue("isMain", true);
                                            setCreateTurnstileValue("serviceId", null);
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2">Главный</span>
                                    </label>
                                </div>
                            </div>

                            {/* Поле выбора сервиса (только для дополнительных турникетов) */}
                            <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Сервис (только для внутренних турникетов)
                            </label>
                            <select
                                {...registerCreateTurnstileForm("serviceId")}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={watchCreateTurnstile("isMain")}
                            >
                                <option value="">Не выбрано</option>
                                {branch.services?.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name}
                                </option>
                                ))}
                            </select>
                            </div>

                            {/* Скрытое поле branchId */}
                            <input
                            type="hidden"
                            {...registerCreateTurnstileForm("branchId")}
                            value={branchId}
                            />

                            <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsCreateTurnstile(false)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                        {/* Плашка с общей информацией о филиале */}
                        <div className="bg-white rounded shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Информация о филиале</h2>
                            <div className="space-y-3">
                                <p>
                                <span className="font-semibold">Название:</span> {branch.name || 'Не указано'}
                                </p>
                                <p>
                                <span className="font-semibold">Макс. вместимость:</span> {branch.maxOccupancy}
                                </p>
                                <p>
                                <span className="font-semibold">Адрес:</span> {[
                                    branch.address.country,
                                    branch.address.city,
                                    branch.address.street,
                                    branch.address.houseNumber
                                ].filter(Boolean).join(', ')}
                                </p>
                                <p>
                                <span className="font-semibold">Услуги:</span> {branch.services?.map(s => s.name).join(', ') || 'Не указаны'}
                                </p>
                                <p>
                                <span className="font-semibold">Дата создания:</span> {new Date(branch.createdDate).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-10 p-4">
                                {currentRole() === "Admin" && <>
                                    <button
                                onClick={() => handleUpdateClick(branch)}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                Изменить
                                </button>
                                </>}                                
                                {currentRole() === "Admin" && <>
                                    <button
                                onClick={() => handleDeleteBranch(branchId)}
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                Удалить
                                </button>
                                </>}                                
                            </div>

                        </div>
                        
                        {/* Плашка с заполненностью*/}
                        <div className="bg-white rounded shadow p-4">
                            <h2 className="text-xl font-semibold mb-4">
                            Заполненность
                            </h2>
                            <div className="flex flex-col md:flex-row items-center">
                                <div className="w-full md:w-1/2">
                                    <Doughnut 
                                    data={{
                                        labels: ['Занято', 'Свободно'],
                                        datasets: [{
                                        data: [
                                            fullness.currentClientQuantity,
                                            fullness.maxOccupancy - fullness.currentClientQuantity
                                        ],
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.7)',
                                            'rgba(54, 162, 235, 0.7)'
                                        ],
                                        borderWidth: 1,
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                        legend: {
                                            position: 'right',
                                        },
                                        }
                                    }}
                                    />
                                </div>
                                <div className="w-full md:w-1/2 pl-4 mt-4 md:mt-0">
                                    <p className="mb-2">
                                    <span className="font-semibold">Макс. вместимость:</span> {fullness.maxOccupancy}
                                    </p>
                                    <p className="mb-2">
                                    <span className="font-semibold">Текущее кол-во клиентов:</span> {fullness.currentClientQuantity}
                                    </p>
                                    <p className="mb-2">
                                    <span className="font-semibold">Заполненность:</span> {Math.round(
                                        (fullness.currentClientQuantity / fullness.maxOccupancy) * 100
                                    )}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Блок с информацией о турникетах */}
                <div className="bg-white rounded shadow p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Турникеты филиала</h2>
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Название филиала</label>
                                <input
                                type="text"
                                name="nameSearchPhrase"
                                placeholder="Поиск по названию"
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
                            onClick={() => {setIsCreateTurnstile(true)}}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                            Создать новый турникет
                            </button>
                            </>}
                        {turnstiles && turnstiles.length > 0 ? (
                        <div className="overflow-x-auto mt-6">
                            <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Услуга</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {turnstiles.map(turnstile => (
                                <tr key={turnstile.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {turnstile.name || 'Без названия'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {turnstile.isMain ? 'Главный' : 'Внутренний'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {!turnstile.isMain ? 
                                        turnstile.service?.name : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(turnstile.createdDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                        onClick={() => handleShowLogs(turnstile.id)}
                                        className="text-blue-600 hover:text-blue-900"
                                        >
                                        Логи
                                        </button>
                                        {currentRole() === "Admin" && 
                                        <button
                                            onClick={() => {
                                                handleEditTurnstile(turnstile);
                                            }}
                                            className="text-blue-600 hover:text-blue-900"
                                            >
                                            Изменить
                                            </button>}
                                        <button
                                        onClick={() => handleDeleteTurnstile(turnstile.id)}
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
                        ) : (
                        <p className="text-gray-500">Нет данных о турникетах</p>
                        )}
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
                            disabled={turnstiles.length < (searchParams.pageSize ?? 10)}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                            Вперед
                            </button>
                        </div>
                        </div>
                    </div>
                    {isLogs && (
                        <div className="bg-white p-6 rounded-lg shadow mt-6">
                            <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Логи проходок турникета
                            </h3>
                            <button 
                                onClick={() => setIsLogs(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Закрыть
                            </button>
                            </div>

                            <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Поиск по имени клиента..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
    </div>

    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    ) : error ? (
      <div className="text-red-500 p-4 bg-red-50 rounded mb-4">
        {error}
      </div>
    ) : logs.length === 0 ? (
      <div className="text-gray-500 p-4 text-center">
        {debouncedQuery ? 'Логи не найдены' : 'Нет данных о проходках'}
      </div>
    ) : (
      <div className="relative flex flex-col">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
                <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.createdDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.clientFullName || 'Неизвестный клиент'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(log.entryType === "Enter") ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Вход
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Выход
                            </span>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-700">
            Страница {currentPage}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
   
                </div>
                )} </>)}
    </Layout>);
}
export default BranchPage;