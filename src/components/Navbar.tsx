import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { LogOut, User, Menu } from "lucide-react";

type NavbarProps = {
  onMenuClick: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar bg-white text-gray-800 shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>

            <div className="ml-2 md:ml-0">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">LUME</span>
                </div>
                <div className="ml-3 hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">LUME</h1>
                  <p className="text-xs text-gray-500">Gestão Profissional</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden sm:flex items-center mr-4">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-800">{user.email}</p>
                    {user.role === 'professional' && user.subscription && (
                      <p className="text-xs text-gray-500">
                        {user.subscription.status === 'trial' ? 'Período de teste' : 'Assinatura ativa'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-purple-600 focus:outline-none transition-colors duration-200"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-1 hidden sm:inline">Sair</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;