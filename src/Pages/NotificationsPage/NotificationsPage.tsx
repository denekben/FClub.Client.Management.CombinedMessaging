import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Layout } from "../../Components/Layout"
import { AuthContext } from "../../Context/AuthContext";
import { NotificationDto } from "../../Models/Notifications/Notifications/NotificationDto";
import { createNotificationAPI, deleteNotificationAPI, GetNotifications, getNotificationsAPI, sendCreatedNotificationAPI, updateNotificationAPI } from "../../Services/Notifications/NotificationsService";
import Parser from 'html-react-parser';
import { getNotificationSettingsAPI, UpdateNotificationSettings, updateNotificationSettingsAPI } from "../../Services/Notifications/NotificationsSettingsService";
import { NotificationSettingsDto } from "../../Models/Notifications/NotificationSettingsDto/NotificationSettingsDto";
import { useForm } from "react-hook-form";

interface CreateNotificationForm {
    title: string;
    text: string;
  }

  interface UpdateNotificationForm {
    id: string;
    title: string;
    text: string;
  }

const NotificationsPage = () => {
    const {currentRole} = AuthContext();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [settings, setSettings] = useState<NotificationSettingsDto>();
    const [loading, setLoading] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorSettings, setErrorSettings] = useState<string | null>(null);
    const [isSend, setIsSend] = useState<boolean>(false);
    const [subject, setSubject] = useState<string>("");
    const [currentNotificationId, setCurrentNotificationId] = useState<string>("");
    const [isSettings, setIsSettings] = useState<boolean>(false);
    const [formData, setFormData] = useState<UpdateNotificationSettings>({
        allowAttendanceNotifications: false,
        attendanceNotificationPeriod: 0,
        attendanceNotificationReSendPeriod: 0,
        attendanceEmailSubject: '',
        tariffEmailSubject: '',
        branchEmailSubject: ''
    });
    const [notificationSearchParams, setNotificationSearchParams] = useState({
        pageNumber: 1,
        pageSize: 2,
        nameSearchPhrase: ""
    });
    const [availableNotifications, setAvailableNotifications] = useState<NotificationDto[]>([]);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState<"attendance" | "tariff" | "branch" | null>(null);
    const [searchParams, setSearchParams] = useState<GetNotifications>({
        pageNumber: 1,
        pageSize: 10,
    });
    const [isCreate, setIsCreate] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [currentUpdateNotification, setCurrentUpdateNotification] = useState<NotificationDto | null>(null);

    useEffect(() => {
        fetchNotifications();
        }, [searchParams]);

        const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNotifications();
    };

    useEffect(() => {
        if (isSettings) {
            fetchSettings();
        }
    }, [isSettings]);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        
        try {
        const response = await getNotificationsAPI(searchParams);
        setNotifications(response.data);
        } catch (err) {
        setError('Ошибка загрузки нотификаций');
        toast.error('Не удалось загрузить данные нотификаций');
        } finally {
        setLoading(false);
        }
    };

    const fetchSettings = async () => {
        setLoadingSettings(true);
        setErrorSettings(null);
        try {
            const response = await getNotificationSettingsAPI();
            setSettings(response.data);
            setFormData({
                allowAttendanceNotifications: response.data.allowAttendanceNotifications,
                attendanceNotificationPeriod: response.data.attendanceNotificationPeriod,
                attendanceNotificationReSendPeriod: response.data.attendanceNotificationReSendPeriod,
                attendanceEmailSubject: response.data.attendanceEmailSubject,
                attendanceNotificationId: response.data.attendanceNotification?.id || null,
                tariffEmailSubject: response.data.tariffEmailSubject,
                tariffNotificationId: response.data.tariffNotification?.id || null,
                branchEmailSubject: response.data.branchEmailSubject,
                branchNotificationId: response.data.branchNotification?.id || null
            });
        } catch (err) {
            setErrorSettings('Ошибка загрузки настроек');
            toast.error('Не удалось загрузить настройки уведомлений');
        } finally {
            setLoadingSettings(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateNotificationSettingsAPI(formData);
            toast.success('Настройки успешно сохранены');
            setIsSettings(false);
        } catch (error) {
            toast.error('Ошибка при сохранении настроек');
        }
    };

      const handleDelete = async (notificationId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить уведомление?')) {
          try {
            await deleteNotificationAPI(notificationId);
            toast.success('Уведомление успешно удалено');
            fetchNotifications();
          } catch (error) {
            toast.error('Ошибка при удалении уведомления');
          }
        }
      };

      const handleUpdate = async (id: string, title: string, text: string) => {
        setIsUpdate(true);
        setCurrentUpdateNotification({id, title, text} as NotificationDto)
      }

      const handleSendNotification = async () => {
        if (!subject.trim()) {
            toast.error('Введите тему письма');
            return;
        }

        try {
            await sendCreatedNotificationAPI({
                subject: subject,
                notificationId: currentNotificationId
            });
            toast.success('Уведомление успешно отправлено');
            setIsSend(false);
            setSubject("");
            fetchNotifications();
        } catch (error) {
            toast.error('Ошибка при отправке уведомления');
        }
    };

    const handleSendClick = (notificationId: string) => {
        setCurrentNotificationId(notificationId);
        setIsSend(true);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      const fetchAvailableNotifications = async () => {
        try {
            const response = await getNotificationsAPI(notificationSearchParams);
            setAvailableNotifications(response.data);
        } catch (err) {
            toast.error('Не удалось загрузить список уведомлений');
        }
    };

    useEffect(() => {
        if (dropdownOpen) {
            fetchAvailableNotifications();
        }
    }, [dropdownOpen, notificationSearchParams]);

    const handleNotificationSelect = (type: "attendance" | "tariff" | "branch", notification: NotificationDto) => {
        setFormData(prev => ({
            ...prev,
            [`${type}NotificationId`]: notification.id,
            [`${type}EmailSubject`]: prev[`${type}EmailSubject`] || notification.title
        }));
        console.log(formData)    

        setDropdownOpen(null);
    };

    const handleNotificationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setNotificationSearchParams(prev => ({
            ...prev,
            nameSearchPhrase: value,
            pageNumber: 1
        }));
    };

    const { register: registerCreateForm, handleSubmit: handleCreateSubmit, reset: resetCreateForm, formState: { errors: createErrors } } = useForm<CreateNotificationForm>();

    const handleCreateNotification = async (data: CreateNotificationForm) => {
        try {
            await createNotificationAPI({
                title: data.title,
                text: data.text
            });
            toast.success('Уведомление успешно создано');
            setIsCreate(false);
            resetCreateForm();
            fetchNotifications();
        } catch (error) {
            toast.error('Ошибка при создании уведомления');
        }
    };

    const { register: registerUpdateForm, handleSubmit: handleUpdateSubmit, reset: resetUpdateForm, formState: { errors: updateErrors } } = useForm<UpdateNotificationForm>({
        defaultValues: {
            title: currentUpdateNotification?.title || "",
            text: currentUpdateNotification?.text || ""
        }
    });

    useEffect(() => {
        if (currentUpdateNotification) {
            resetUpdateForm({
                title: currentUpdateNotification.title,
                text: currentUpdateNotification.text
            });
        }
    }, [currentUpdateNotification, resetUpdateForm]);

    const handleUpdateNotification = async (data: UpdateNotificationForm) => {
        if(typeof(currentUpdateNotification?.id) === "string"){
            try {
                await updateNotificationAPI({
                    id: currentUpdateNotification?.id,
                    title: data.title,
                    text: data.text
                });
                toast.success('Уведомление успешно обновлено');
                setIsUpdate(false);
                resetUpdateForm();
                fetchNotifications();
            } catch (error) {
                toast.error('Ошибка при обновлении уведомления');
            }            
        }
        else {
            toast.error('Ошибка при обновлении уведомления');           
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
            {isUpdate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Создание нового уведомления</h2>
                            <form onSubmit={handleUpdateSubmit(handleUpdateNotification)}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Заголовок
                                    </label>
                                    <input
                                        type="text"
                                        {...registerUpdateForm("title", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите заголовок"
                                    />
                                    {createErrors.title && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.title.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Текст уведомления
                                    </label>
                                    <textarea
                                        rows={5}
                                        {...registerUpdateForm("text", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            updateErrors.text ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите текст уведомления"
                                    />
                                    {updateErrors.text && (
                                        <p className="mt-1 text-sm text-red-500">{updateErrors.text.message}</p>
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
                                        Изменить
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            {isCreate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h2 className="text-xl font-bold mb-4">Создание нового уведомления</h2>
                            <form onSubmit={handleCreateSubmit(handleCreateNotification)}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Заголовок
                                    </label>
                                    <input
                                        type="text"
                                        {...registerCreateForm("title", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите заголовок"
                                    />
                                    {createErrors.title && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.title.message}</p>
                                    )}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Текст уведомления
                                    </label>
                                    <textarea
                                        rows={5}
                                        {...registerCreateForm("text", { required: "Обязательное поле" })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            createErrors.text ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="Введите текст уведомления"
                                    />
                                    {createErrors.text && (
                                        <p className="mt-1 text-sm text-red-500">{createErrors.text.message}</p>
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
            {isSettings && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Настройки уведомлений</h2>
                            {loadingSettings ? (
                                <div className="text-center">Загрузка настроек...</div>
                            ) : errorSettings ? (
                                <div className="text-red-500 text-center">{errorSettings}</div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="allowAttendanceNotifications"
                                            name="allowAttendanceNotifications"
                                            checked={formData.allowAttendanceNotifications}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="allowAttendanceNotifications" className="ml-2 block text-sm text-gray-900">
                                            Разрешить уведомления о посещениях
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="attendanceNotificationPeriod" className="block text-sm font-medium text-gray-700">
                                                Период уведомлений о посещениях (дни)
                                            </label>
                                            <input
                                                type="number"
                                                id="attendanceNotificationPeriod"
                                                name="attendanceNotificationPeriod"
                                                value={formData.attendanceNotificationPeriod}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="attendanceNotificationReSendPeriod" className="block text-sm font-medium text-gray-700">
                                                Период повторной отправки (дни)
                                            </label>
                                            <input
                                                type="number"
                                                id="attendanceNotificationReSendPeriod"
                                                name="attendanceNotificationReSendPeriod"
                                                value={formData.attendanceNotificationReSendPeriod}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="attendanceEmailSubject" className="block text-sm font-medium text-gray-700">
                                                Тема письма для уведомлений о посещениях
                                            </label>
                                            <input
                                                type="text"
                                                id="attendanceEmailSubject"
                                                name="attendanceEmailSubject"
                                                value={formData.attendanceEmailSubject}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="tariffEmailSubject" className="block text-sm font-medium text-gray-700">
                                                Тема письма для уведомлений о тарифах
                                            </label>
                                            <input
                                                type="text"
                                                id="tariffEmailSubject"
                                                name="tariffEmailSubject"
                                                value={formData.tariffEmailSubject}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="branchEmailSubject" className="block text-sm font-medium text-gray-700">
                                                Тема письма для уведомлений о филиалах
                                            </label>
                                            <input
                                                type="text"
                                                id="branchEmailSubject"
                                                name="branchEmailSubject"
                                                value={formData.branchEmailSubject}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Уведомление о посещениях
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    value={ availableNotifications.find(n => n.id === formData.attendanceNotificationId)?.title || 
                                                        settings?.attendanceNotification?.title || 
                                                        "Не выбрано"}
                                                    readOnly
                                                    className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    onClick={() => setDropdownOpen("attendance")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setDropdownOpen("attendance")}
                                                    className="inline-flex items-center px-3 rounded-r-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    Выбрать
                                                </button>
                                            </div>
                                            {dropdownOpen === "attendance" && (
                                                <div className="z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300">
                                                    <div className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Поиск уведомлений..."
                                                            className="w-full p-2 border rounded"
                                                            onChange={handleNotificationSearch}
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {availableNotifications.map(notification => (
                                                            <div
                                                                key={notification.id}
                                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                                onClick={() => handleNotificationSelect("attendance", notification)}
                                                            >
                                                                {notification.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 border-t">
                                                        <button
                                                            disabled={notificationSearchParams.pageNumber === 1}
                                                            onClick={() => setNotificationSearchParams(prev => ({
                                                                ...prev,
                                                                pageNumber: prev.pageNumber - 1
                                                            }))}
                                                            className="px-3 py-1 disabled:opacity-50"
                                                        >
                                                            Назад
                                                        </button>
                                                        <span>Страница {notificationSearchParams.pageNumber}</span>
                                                        <button
                                                            disabled={availableNotifications.length < notificationSearchParams.pageSize}
                                                            onClick={() => setNotificationSearchParams(prev => ({
                                                                ...prev,
                                                                pageNumber: prev.pageNumber + 1
                                                            }))}
                                                            className="px-3 py-1 disabled:opacity-50"
                                                        >
                                                            Вперед
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Уведомление о тарифах
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    value={ availableNotifications.find(n => n.id === formData.tariffNotificationId)?.title || 
                                                        settings?.tariffNotification?.title || 
                                                        "Не выбрано"}
                                                    readOnly
                                                    className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    onClick={() => setDropdownOpen("tariff")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setDropdownOpen("tariff")}
                                                    className="inline-flex items-center px-3 rounded-r-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    Выбрать
                                                </button>
                                            </div>
                                            {dropdownOpen === "tariff" && (
                                                <div className="z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300">
                                                    <div className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Поиск уведомлений..."
                                                            className="w-full p-2 border rounded"
                                                            onChange={handleNotificationSearch}
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {availableNotifications.map(notification => (
                                                            <div
                                                                key={notification.id}
                                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                                onClick={() => handleNotificationSelect("tariff", notification)}
                                                            >
                                                                {notification.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 border-t">
                                                        <button
                                                            disabled={notificationSearchParams.pageNumber === 1}
                                                            onClick={() => setNotificationSearchParams(prev => ({
                                                                ...prev,
                                                                pageNumber: prev.pageNumber - 1
                                                            }))}
                                                            className="px-3 py-1 disabled:opacity-50"
                                                        >
                                                            Назад
                                                        </button>
                                                        <span>Страница {notificationSearchParams.pageNumber}</span>
                                                        <button
                                                            disabled={availableNotifications.length < notificationSearchParams.pageSize}
                                                            onClick={() => setNotificationSearchParams(prev => ({
                                                                ...prev,
                                                                pageNumber: prev.pageNumber + 1
                                                            }))}
                                                            className="px-3 py-1 disabled:opacity-50"
                                                        >
                                                            Вперед
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Уведомление о филиалах
                                            </label>
                                            <div className="flex">
                                                <input
                                                    type="text"
                                                    value={ availableNotifications.find(n => n.id === formData.branchNotificationId)?.title || 
                                                        settings?.branchNotification?.title || 
                                                        "Не выбрано"}
                                                    readOnly
                                                    className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    onClick={() => setDropdownOpen("branch")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setDropdownOpen("branch")}
                                                    className="inline-flex items-center px-3 rounded-r-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    Выбрать
                                                </button>
                                            </div>
                                            {dropdownOpen === "branch" && (
                                                <div className="z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300">
                                                    <div className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Поиск уведомлений..."
                                                            className="w-full p-2 border rounded"
                                                            onChange={handleNotificationSearch}
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {availableNotifications.map(notification => (
                                                            <div
                                                                key={notification.id}
                                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                                onClick={() => handleNotificationSelect("branch", notification)}
                                                            >
                                                                {notification.title}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 border-t">
                                                        <button
                                                            disabled={notificationSearchParams.pageNumber === 1}
                                                            onClick={() => setNotificationSearchParams(prev => ({
                                                                ...prev,
                                                                pageNumber: prev.pageNumber - 1
                                                            }))}
                                                            className="px-3 py-1 disabled:opacity-50"
                                                        >
                                                            Назад
                                                        </button>
                                                        <span>Страница {notificationSearchParams.pageNumber}</span>
                                                        <button
                                                            disabled={availableNotifications.length < notificationSearchParams.pageSize}
                                                            onClick={() => setNotificationSearchParams(prev => ({
                                                                ...prev,
                                                                pageNumber: prev.pageNumber + 1
                                                            }))}
                                                            className="px-3 py-1 disabled:opacity-50"
                                                        >
                                                            Вперед
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsSettings(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={loadingSettings}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            {isSend && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">Отправка уведомления</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тема письма
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Введите тему письма"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setIsSend(false);
                                        setSubject("");
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleSendNotification}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Отправить
                                </button>
                            </div>
                            <p className="text-xs text-red-500 mt-2">Парсинг элементов типа &#123;entity.Field&#125; осуществляется только при автоматической отправке</p>
                        </div>
                    </div>
                )}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h1 className="text-2xl font-bold mb-6">Управление уведомлениями</h1>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Название нотификации</label>
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

                    <div className="flex gap-6">
                        {currentRole() === "Admin" && (
                            <button
                                onClick={() => setIsCreate(true)}
                                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                Создать новое уведомление
                            </button>
                        )}
                        <button
                            onClick={() => setIsSettings(true)}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            Настройки уведомлений
                        </button>
                    </div>
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
                    <div className="relative h-[calc(50vh)] overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                            <th
                                style={{ width: "300px", maxWidth: "300px" }}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                Текст
                                </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата создания</th>
                            {currentRole() === "Admin" && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                            )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {notifications.map((notification) => (
                            <tr key={notification.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {notification.title}
                                </td>
                                <td
                                    style={{
                                        width: "1000px",
                                        maxWidth: "1000px",
                                        wordBreak: "break-word",
                                        whiteSpace: "normal",
                                    }}
                                    className="px-6 py-4 text-sm text-gray-900"
                                    >
                                {notification.text}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(notification.createdDate)}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <button
                                    onClick={() => handleSendClick(notification.id)}
                                    className="text-blue-600 hover:text-blue-900"
                                    >
                                    Отправить
                                </button>
                                {currentRole() === "Admin" && (
                                    <>
                                    <button
                                    onClick={() => handleUpdate(notification.id, notification.title, notification.text)}
                                    className="text-blue-600 hover:text-blue-900"
                                    >
                                    Изменить
                                    </button>
                                    <button
                                    onClick={() => handleDelete(notification.id)}
                                    className="text-red-600 hover:text-red-900"
                                    >
                                    Удалить
                                    </button>
                                    </>                                   
                                )}
                                </td>
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
                        disabled={notifications.length < (searchParams.pageSize ?? 10)}
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

export default NotificationsPage;