import React, { useState, useEffect } from 'react';
import { UserLogDto } from '../../../Models/Logging/UserLogDto';
import { AuthContext } from '../../../Context/AuthContext';
import { GetLogs, getUserLogsAPI } from '../../../Services/Logging/AppUsersService';

const SERVICES = {
  management: 'Management API',
  accessControl: 'Access Control API',
  notifications: 'Notifications API',
};

interface UserLogsSearchPanelProps {
    userId: string | undefined;
  }

type ServiceKey = keyof typeof SERVICES;

export const UserLogsSearchPanel = (props: UserLogsSearchPanelProps) => {
    const {user: currentUser} = AuthContext();
  const [service, setService] = useState<ServiceKey>('management');
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<UserLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 4;

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
  
    const params: GetLogs = {
      userId: props.userId ? props.userId : null,
      serviceNameSearchPhrase: service.trim() ? service.trim() : null,
      textSearchPhrase: query.trim() ? query.trim() : null,
      sortByCreatedDate: false,
      pageNumber: page,
      pageSize: pageSize,
    };
    try {
      let response;
      response = await getUserLogsAPI(params);
      const newLogs = response?.data || [];
      setLogs(newLogs);
      setHasMore(newLogs.length >= pageSize);
    } catch {
      setError('Ошибка при загрузке логов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, service]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchLogs(nextPage);
  };

  const handlePrevPage = () => {
    const prevPage = Math.max(1, currentPage - 1);
    setCurrentPage(prevPage);
    fetchLogs(prevPage);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchLogs(1);
    }, 500);
  
    return () => clearTimeout(timer);
  }, [query, service, props.userId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
        {(props.userId == currentUser?.nameid || props.userId==null) ? 
        <>
            <h2 className="text-xl font-semibold mb-4">Мои логи</h2>
        </> : 
        <>
            <h2 className="text-xl font-semibold mb-4">Логи пользователя</h2>
        </>}


      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <input
          type="text"
          placeholder="Введите параметры поиска..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 flex-1 mb-2 md:mb-0"
        />

        <select
          value={service}
          onChange={(e) => setService(e.target.value as ServiceKey)}
          className="border border-gray-300 rounded px-4 py-2"
        >
          {Object.entries(SERVICES).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Загрузка логов...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && logs.length === 0 && query.trim() !== '' && (
        <div>Логи не найдены</div>
      )}

      {!loading && logs.length > 0 && (
        <div className="relative h-[calc(50vh-160px)] flex flex-col"> 
          <ul className="flex-1 overflow-auto border border-gray-200 rounded p-2">
            {logs.map((log) => (
              <li key={log.id} className="border-b border-gray-100 py-2">
                <p><b>Дата:</b> {new Date(log.createdDate).toLocaleString()}</p>
                <p><b>Сообщение:</b> {log.text}</p>
              </li>
            ))}
          </ul>
          
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function getUserLogs(params: GetLogs): any {
  throw new Error('Function not implemented.');
}
