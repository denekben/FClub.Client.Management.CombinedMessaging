import { useNavigate, useNavigation } from "react-router-dom";
import { Layout } from "../../Components/Layout"
import { AuthContext } from "../../Context/AuthContext";
import { useState, useEffect } from "react";
import { createTariffAPI, deleteTariffAPI, GetTariffs, getTariffsAPI, updateTariffAPI } from "../../Services/Management/TariffsService";
import { toast } from "react-toastify";
import { TariffWithGroupsDto } from "../../Models/Management/Tariffs/TariffWithGroupsDto";
import { useForm } from "react-hook-form";
import { getSocialGroupsAPI } from "../../Services/Management/SocialGroupsService";
import { SocialGroupDto } from "../../Models/Management/SocialGroups/SocialGroupDto";
import { getServicesAPI } from "../../Services/Management/ServicesService";
import { ServiceDto } from "../../Models/Management/Services/ServiceDto";

interface CreateTariffForm {
    sendNotification: boolean;
    name: string;
    priceForNMonths: Record<number, number>;
    discountForSocialGroup?: Record<string, number> | null;
    allowMultiBranches: boolean;
    serviceNames: string;
    selectedServices: {serviceId: string, serviceName: string}[];
}

interface UpdateTariffForm {
    id: string,
    name: string,
    priceForNMonths: Record<number, number>,
    discountForSocialGroup?: Record<string, number> | null,
    allowMultiBranches: boolean,
    serviceNames: string,    
    selectedServices: {serviceId: string, serviceName: string}[];
}

const TariffsPage = () => {
    const {currentRole} = AuthContext();
    const navigate = useNavigate();
    const [tariffs, setTariffs] = useState<TariffWithGroupsDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreate, setIsCreate] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [socialGroups, setSocialGroups] = useState<SocialGroupDto[]>([]);
    const [services, setServices] = useState<ServiceDto[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [newMonth, setNewMonth] = useState<number>(1);
    const [newPrice, setNewPrice] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'services' | 'groups'>('services');
    const [currentTariff, setCurrentTariff]  = useState<TariffWithGroupsDto>();

    const [searchParams, setSearchParams] = useState<GetTariffs>({
        pageNumber: 1,
        pageSize: 20,
    });

    useEffect(() => {
        fetchTariffs();
        }, [searchParams]);

        const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTariffs();
    };

    useEffect(() => {
        fetchTariffs();
        fetchSocialGroups();
        fetchServices();
    }, [isCreate, isUpdate]);

    const fetchTariffs = async () => {
        setLoading(true);
        setError(null);
        
        try {
        const response = await getTariffsAPI(searchParams);
        setTariffs(response.data);
        } catch (err) {
        setError('Ошибка загрузки тарифов');
        toast.error('Не удалось загрузить данные тарифов');
        } finally {
        setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await getServicesAPI({});
            setServices(response.data);
        } catch (error) {
            toast.error('Ошибка загрузки услуг');
        }
    };

    const fetchSocialGroups = async () => {
        try {
            const response = await getSocialGroupsAPI({});
            setSocialGroups(response.data);
        } catch (error) {
            toast.error('Ошибка загрузки социальных групп');
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value || null,
            pageNumber: 1
        }));
    };

      const handleDelete = async (serviceId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить тариф?')) {
          try {
            await deleteTariffAPI(serviceId);
            toast.success('Тариф успешно удален');
            fetchTariffs();
          } catch (error) {
            toast.error('Ошибка при удалении тарифа');
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

      // create
      const { 
        register, 
        handleSubmit, 
        reset, 
        setValue,
        watch,
        formState: { errors } 
    } = useForm<CreateTariffForm>({
        defaultValues: {
            sendNotification: false,
            allowMultiBranches: false,
            priceForNMonths: { 1: 0 }, 
            serviceNames: "",
            selectedServices: []
        }
    });

    const addPriceForMonth = () => {
        if (newMonth > 0 && newPrice > 0) {
            if (selectedMonths.includes(newMonth)) {
                toast.warning('Цена для этого количества месяцев уже добавлена');
                return;
            }
            setSelectedMonths([...selectedMonths, newMonth]);
            setValue(`priceForNMonths.${newMonth}`as any, newPrice, { shouldValidate: true });
            setNewMonth(1);
            setNewPrice(0);
        } else {
            toast.warning('Введите корректные значения для месяцев и цены');
        }
    };

    const removePriceForMonth = (month: number) => {
        setSelectedMonths(selectedMonths.filter(m => m !== month));
        setValue(`priceForNMonths.${month}` as any, undefined);
      };

      const handleServiceSelect = (selectedService: {serviceId: string, serviceName: string}) => {
        const currentSelected = watchUpdate("selectedServices") || [];
        const exists = currentSelected.some(s => s.serviceId === selectedService.serviceId);
        
        if (exists) {
            setValueUpdate(
                "selectedServices", 
                currentSelected.filter(s => s.serviceId !== selectedService.serviceId)
            );
        } else {
            setValueUpdate(
                "selectedServices", 
                [...currentSelected, selectedService]
            );
        }
    };

    const handleCreateTariff = async (data: CreateTariffForm) => {
        try {
            const validPrices = Object.entries(data.priceForNMonths)
                .filter(([_, value]) => value !== undefined && value > 0)
                .map(([month, price]) => ({ month: parseInt(month), price }));
    
            if (validPrices.length === 0) {
                toast.error('Добавьте хотя бы одну цену с положительным значением');
                return;
            }
    
            const prices = validPrices.reduce((acc, { month, price }) => {
                acc[month] = price;
                return acc;
            }, {} as Record<number, number>);
            
            const processedDiscounts = (() => {
                if (!data.discountForSocialGroup) return null;
                
                const filtered = Object.fromEntries(
                    Object.entries(data.discountForSocialGroup).filter(
                        ([_, value]) => value !== undefined && value !== null && value.toString() !== ""
                    )
                );
                
                return Object.keys(filtered).length > 0 ? filtered : null;
            })();

            const servicesFromInput = typeof data.serviceNames === 'string' 
                ? data.serviceNames.split(',').map(s => s.trim()).filter(Boolean)
                : [];

                await createTariffAPI({
                    sendNotification: data.sendNotification,
                    name: data.name,
                    priceForNMonths: prices,
                    discountForSocialGroup: processedDiscounts,
                    allowMultiBranches: data.allowMultiBranches,
                    serviceNames: [
                        ...servicesFromInput,
                        ...data.selectedServices.map(s => s.serviceName)
                    ]
                });
            
            toast.success('Тариф успешно создан');
            setIsCreate(false);
            reset();
            setSelectedMonths([]); 
            fetchTariffs();
        } catch (error) {
            toast.error('Ошибка при создании тарифа');
            console.error(error);
        }
    };

      // update
      const { 
        register: registerUpdate, 
        handleSubmit: handleSubmitUpdate, 
        reset: resetUpdate, 
        setValue: setValueUpdate,
        watch: watchUpdate,
        formState: { errors: errorsUpdate } 
    } = useForm<UpdateTariffForm>({
        defaultValues: {
            selectedServices: [],
            priceForNMonths: {},
            discountForSocialGroup: {},
            allowMultiBranches: false,
            serviceNames: ""
        }
    });

    const handleUpdateTariff = async (data: UpdateTariffForm) => {
        try {
            // Проверяем что currentTariff существует
            if (!currentTariff) {
                toast.error('Не выбран тариф для обновления');
                return;
            }
    
            // Обрабатываем цены
            const validPrices = Object.entries(data.priceForNMonths)
                .filter(([_, value]) => value !== undefined && value > 0)
                .map(([month, price]) => ({ month: parseInt(month), price }));
    
            if (validPrices.length === 0) {
                toast.error('Добавьте хотя бы одну цену с положительным значением');
                return;
            }
    
            const prices = validPrices.reduce((acc, { month, price }) => {
                acc[month] = price;
                return acc;
            }, {} as Record<number, number>);
            
            // Обрабатываем скидки
            const processedDiscounts = (() => {
                if (!data.discountForSocialGroup) return null;
                
                const filtered = Object.fromEntries(
                    Object.entries(data.discountForSocialGroup).filter(
                        ([_, value]) => value !== undefined && value !== null && value.toString() !== ""
                    )
                );
                
                return Object.keys(filtered).length > 0 ? filtered : null;
            })();
    
            // Обрабатываем услуги
            const servicesFromInput = typeof data.serviceNames === 'string' 
                ? data.serviceNames.split(',').map(s => s.trim()).filter(Boolean)
                : [];
    
            // Отправляем данные на сервер
            await updateTariffAPI({
                id: currentTariff.id,
                name: data.name,
                priceForNMonths: prices,
                discountForSocialGroup: processedDiscounts,
                allowMultiBranches: data.allowMultiBranches,
                serviceNames: [
                    ...servicesFromInput,
                    ...data.selectedServices.map(s => s.serviceName)
                ]
            });
            
            toast.success('Тариф успешно обновлен');
            setIsUpdate(false);
            resetUpdate();
            setSelectedMonths([]);
            fetchTariffs();
        } catch (error) {
            toast.error('Ошибка при обновлении тарифа');
            console.error(error);
        }
    };

    const handleUpdateClick = (tariff: TariffWithGroupsDto) => {
        setCurrentTariff(tariff);
        setIsUpdate(true);
        
        const priceForNMonths = tariff.priceForNMonths;
    
        const discountForSocialGroup = tariff.discountForSocialGroup?.reduce((acc, discount) => {
            acc[discount.socialGroupDto.id] = discount.dicsountValue;
            return acc;
        }, {} as Record<string, number>);
    
        const selectedServices = tariff.services.map(service => ({
            serviceId: service.id,
            serviceName: service.name
        }));
    
        setValueUpdate('id', tariff.id);
        setValueUpdate('name', tariff.name);
        setValueUpdate('priceForNMonths', priceForNMonths);
        setValueUpdate('discountForSocialGroup', discountForSocialGroup || null);
        setValueUpdate('allowMultiBranches', tariff.allowMultiBranches);
        setValueUpdate('selectedServices', selectedServices);
        setValueUpdate('serviceNames', ''); 
    
        setSelectedMonths(Object.keys(priceForNMonths).map(Number));
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
            {isUpdate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-screen">
                            <h2 className="text-xl font-bold mb-4">Обновление тарифа</h2>
                            <form onSubmit={handleSubmitUpdate(handleUpdateTariff)}>
                                {/* Название тарифа */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название тарифа
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdate("name", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите название тарифа"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Цены за месяцы */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Цены за количество месяцев
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={newMonth}
                                            onChange={(e) => setNewMonth(parseInt(e.target.value) || 1)}
                                            className="px-4 py-2 border rounded-lg"
                                            placeholder="Кол-во месяцев"
                                        />
                                        <input
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                                            className="px-4 py-2 border rounded-lg"
                                            placeholder="Цена"
                                        />
                                        <button
                                            type="button"
                                            onClick={addPriceForMonth}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                        >
                                            Добавить
                                        </button>
                                    </div>
                                    
                                    {/* Список добавленных цен */}
                                    <div className="space-y-2">
                                        {selectedMonths.map(month => (
                                            <div key={month} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                            <span>
                                                {month} месяцев: {(watchUpdate(`priceForNMonths.${month}` as any) || 0)} ₽
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removePriceForMonth(month)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Удалить
                                            </button>
                                            </div>
                                        ))}
                                        </div>
                                    </div>

                                <div className="mb-6 border-b border-gray-200">
                                        <nav className="-mb-px flex space-x-8">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('services')}
                                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                    activeTab === 'services'
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                Услуги
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('groups')}
                                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                    activeTab === 'groups'
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                Социальные группы
                                            </button>
                                        </nav>
                                    </div>
                                {activeTab === 'services' ? (
                                    <>
                                        {/* Услуги (ручной ввод) */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Услуги (через запятую)
                                            </label>
                                            <input
                                                type="text"
                                                {...registerUpdate("serviceNames")}
                                                className="w-full px-4 py-2 border rounded-lg"
                                                placeholder="Услуга 1, Услуга 2"
                                            />
                                        </div>

                                        {/* Выбор существующих услуг */}
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
                                                            checked={watchUpdate("selectedServices")?.some(s => s.serviceId === service.id)}
                                                            onChange={() => handleServiceSelect({serviceId: service.id, serviceName: service.name})}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor={`service-${service.id}`} className="ml-2 block text-sm text-gray-700">
                                                            {service.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Скидки для социальных групп */
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Скидки для социальных групп
                                        </label>
                                        {socialGroups.map(group => (
                                            <div key={group.id} className="flex items-center mb-2">
                                                <span className="w-48">{group.name}:</span>
                                                <input
                                                    type="number"
                                                    {...registerUpdate(`discountForSocialGroup.${group.id}`)}
                                                    className="ml-2 px-4 py-2 border rounded-lg w-24"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="ml-2">%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Дополнительные опции */}
                                <div className="mb-4 space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="allowMultiBranches"
                                            {...registerUpdate("allowMultiBranches")}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="allowMultiBranches" className="ml-2 block text-sm text-gray-700">
                                            Доступен во всех филиалах
                                        </label>
                                    </div>
                                </div>

                                {/* Кнопки */}
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
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl overflow-y-auto max-h-screen">
                            <h2 className="text-xl font-bold mb-4">Создание нового тарифа</h2>
                            <form onSubmit={handleSubmit(handleCreateTariff)}>
                                {/* Название тарифа */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Название тарифа
                                    </label>
                                    <input
                                        type="text"
                                        {...register("name", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите название тарифа"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                    )}
                                </div>

                                {/* Цены за месяцы */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Цены за количество месяцев
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            value={newMonth}
                                            onChange={(e) => setNewMonth(parseInt(e.target.value) || 1)}
                                            className="px-4 py-2 border rounded-lg"
                                            placeholder="Кол-во месяцев"
                                        />
                                        <input
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                                            className="px-4 py-2 border rounded-lg"
                                            placeholder="Цена"
                                        />
                                        <button
                                            type="button"
                                            onClick={addPriceForMonth}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                        >
                                            Добавить
                                        </button>
                                    </div>
                                    
                                    {/* Список добавленных цен */}
                                    <div className="space-y-2">
                                        {selectedMonths.map(month => (
                                            <div key={month} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                            <span>
                                                {month} месяцев: {(watch(`priceForNMonths.${month}` as any) || 0)} ₽
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removePriceForMonth(month)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Удалить
                                            </button>
                                            </div>
                                        ))}
                                        </div>
                                    </div>

                                <div className="mb-6 border-b border-gray-200">
                                        <nav className="-mb-px flex space-x-8">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('services')}
                                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                    activeTab === 'services'
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                Услуги
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('groups')}
                                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                                    activeTab === 'groups'
                                                        ? 'border-blue-500 text-blue-600'
                                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            >
                                                Социальные группы
                                            </button>
                                        </nav>
                                    </div>
                                {activeTab === 'services' ? (
                                    <>
                                        {/* Услуги (ручной ввод) */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Услуги (через запятую)
                                            </label>
                                            <input
                                                type="text"
                                                {...register("serviceNames")}
                                                className="w-full px-4 py-2 border rounded-lg"
                                                placeholder="Услуга 1, Услуга 2"
                                            />
                                        </div>

                                        {/* Выбор существующих услуг */}
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
                                                            checked={watch("selectedServices")?.some(s => s.serviceId === service.id)}
                                                            onChange={() => handleServiceSelect({serviceId: service.id, serviceName: service.name})}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label htmlFor={`service-${service.id}`} className="ml-2 block text-sm text-gray-700">
                                                            {service.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Скидки для социальных групп */
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Скидки для социальных групп
                                        </label>
                                        {socialGroups.map(group => (
                                            <div key={group.id} className="flex items-center mb-2">
                                                <span className="w-48">{group.name}:</span>
                                                <input
                                                    type="number"
                                                    {...register(`discountForSocialGroup.${group.id}`)}
                                                    className="ml-2 px-4 py-2 border rounded-lg w-24"
                                                    placeholder="%"
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="ml-2">%</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Дополнительные опции */}
                                <div className="mb-4 space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="sendNotification"
                                            {...register("sendNotification")}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
                                            Отправить уведомление о создании
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="allowMultiBranches"
                                            {...register("allowMultiBranches")}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="allowMultiBranches" className="ml-2 block text-sm text-gray-700">
                                            Доступен во всех филиалах
                                        </label>
                                    </div>
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
                    <h1 className="text-2xl font-bold mb-6">Управление тарифами</h1>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Название тарифа</label>
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
                        Создать новый тариф
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена (месяцы: сумма)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Скидки для соц. групп</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Мультифилиалы</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сервисы</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                            {currentRole() === "Admin" && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tariffs.map((tariff) => (
                            <tr key={tariff.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {tariff.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {Object.entries(tariff.priceForNMonths)
                                    .map(([months, price]) => `${months} мес: ${price}`)
                                    .join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tariff.discountForSocialGroup && tariff.discountForSocialGroup.length > 0
                                ? tariff.discountForSocialGroup
                                    .map(
                                        (item) =>
                                        `${item.socialGroupDto.name}: ${item.dicsountValue}%`
                                    )
                                    .join(', ')
                                : '-'}

                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                                    tariff.allowMultiBranches ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {tariff.allowMultiBranches ? 'Да' : 'Нет'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {tariff.services.length > 0
                                    ? tariff.services.map((s) => s.name).join(', ')
                                    : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(tariff.createdDate)}
                                </td>
                                {currentRole() === "Admin" && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                    onClick={() => {setIsUpdate(true); handleUpdateClick(tariff)}}
                                    className="text-blue-600 hover:text-blue-900"
                                    >
                                    Изменить
                                    </button>
                                    <button
                                    onClick={() => handleDelete(tariff.id)}
                                    className="text-red-600 hover:text-red-900"
                                    >
                                    Удалить
                                    </button>
                                </td>
                                )}
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    </>
                )}
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
                            disabled={tariffs.length < (searchParams.pageSize ?? 20)}
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
    )
}

export default TariffsPage