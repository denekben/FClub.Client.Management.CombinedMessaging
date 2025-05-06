import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";

export const SideBar = () => {
  const { isLoggedIn, logout } = AuthContext();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Филиалы', path: '/branches' },
    { name: 'Клиенты', path: '/clients' },
    { name: 'Услуги', path: '/services' },
    { name: 'Социальные группы', path: '/social-groups' },
    { name: 'Тарифы', path: '/tariffs' },
    { name: 'Уведомления', path: '/notifications' },
    { name: 'Пользователи', path: '/users' },
    { name: 'Статистика', path: '/stats' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-md z-30 border-r border-gray-200">
      <div className="border-b border-gray-200">
        <Link to="/" className="flex items-center justify-center">
          <img src={logo} alt="Company Logo" className="h-20 w-auto" />
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => navigate(item.path)}
                className="w-full text-left p-3 rounded hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
