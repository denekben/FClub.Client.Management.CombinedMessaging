import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { GetUsers, getUsersAPI } from "../Services/Management/AppUsersService";
import { UserDto } from "../Models/Management/AppUsers/UserDto";

export const TopBar = () => {
  const { isLoggedIn, user, logout } = AuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers({
          fullNameSearchPhrase: searchQuery,
          pageNumber: 1,
          pageSize: 5
        });
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchUsers = async (params: GetUsers) => {
    try {
      const response = await getUsersAPI(params);
      setSearchResults(response.data);
      setIsSearchOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  return (
    <div className="fixed left-64 right-0 top-0 p-4 bg-white shadow-sm z-40 flex items-center px-6 border-b border-gray-200 h-20">
      <div className="flex-1 flex justify-start">
        <div className="relative" ref={searchRef}>
          <input
            type="text"
            placeholder="Поиск пользователя по имени..."
            className="w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-lightGreen"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setIsSearchOpen(true)}
          />
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
              {searchResults.map((user) => (
                <Link
                  key={user.id}
                  to={`/users/${user.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.fullName.firstName + " " + user.fullName.secondName}
                    </span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {isSearchOpen && searchQuery && searchResults.length === 0 && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 p-4 text-sm text-gray-500">
              No users found
            </div>
          )}
        </div>
      </div>
  
      {isLoggedIn() && (
        <div className="ml-6 flex items-center space-x-4">
          <div className="text-gray-700">Добро пожаловать, {user?.unique_name.split(' ')[0]}</div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Выход
          </button>
        </div>
      )}
    </div>
  )
}