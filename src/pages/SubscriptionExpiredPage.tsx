import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, CreditCard, LogOut } from "lucide-react";

const SubscriptionExpiredPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Assinatura Expirada
            </h1>
            <p className="text-gray-600">
              Seu período de acesso ao LUME expirou
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
            <p className="text-sm text-blue-800">
              Para continuar utilizando o sistema LUME e gerenciar seus pacientes,
              você precisa renovar sua assinatura.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Plano Mensal</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-blue-600">R$ 19,99</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>✓ Gestão completa de pacientes</li>
                <li>✓ Agendamento online</li>
                <li>✓ Prontuários eletrônicos</li>
                <li>✓ Geração de documentos</li>
                <li>✓ Relatórios e análises</li>
                <li>✓ Suporte técnico</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full btn bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 flex items-center justify-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Renovar Assinatura
            </button>

            <button
              onClick={handleLogout}
              className="w-full btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </button>
          </div>

          {user?.professional && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Conta: {user.professional.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredPage;
