import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { UserPlus, ArrowLeft, Eye, EyeOff, Briefcase } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    state: "",
    specialty: "",
    registration_number: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const limitedValue = numericValue.slice(0, 11);
    let formattedValue = limitedValue;

    if (limitedValue.length > 2) {
      formattedValue = `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2)}`;
      if (limitedValue.length > 7) {
        formattedValue = `(${limitedValue.slice(0, 2)}) ${limitedValue.slice(2, 7)}-${limitedValue.slice(7)}`;
      }
    }

    setFormData((prev) => ({ ...prev, phone: formattedValue }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Email inválido");
      return false;
    }

    if (!formData.phone) {
      setError("Telefone é obrigatório");
      return false;
    }

    if (!formData.city.trim()) {
      setError("Cidade é obrigatória");
      return false;
    }

    if (!formData.state) {
      setError("Estado é obrigatório");
      return false;
    }

    if (!formData.specialty.trim()) {
      setError("Especialidade é obrigatória");
      return false;
    }

    if (!formData.registration_number.trim()) {
      setError("Número de registro é obrigatório");
      return false;
    }

    if (!formData.password) {
      setError("Senha é obrigatória");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.replace(/\D/g, ""),
        city: formData.city.trim(),
        state: formData.state,
        specialty: formData.specialty.trim(),
        registration_number: formData.registration_number.trim(),
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ocorreu um erro ao criar a conta");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">LUME</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastro Profissional
            </h1>
            <p className="text-gray-600">
              Inicie seu teste grátis de 3 dias agora mesmo
            </p>
            <div className="mt-4 inline-block bg-purple-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">
                Apenas R$ 19,99/mês após o período de teste
              </p>
            </div>
          </div>

          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o login
            </Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-purple-600" />
                Informações Pessoais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Digite seu nome completo"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="seu@email.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => formatPhone(e.target.value)}
                    className="input"
                    placeholder="(00) 00000-0000"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                Informações Profissionais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidade *
                  </label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Ex: Fisioterapeuta, Nutricionista..."
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Registro *
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="CRM, CRO, CREFITO, etc."
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Sua cidade"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input"
                    disabled={isLoading}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Segurança
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input pr-10"
                      placeholder="Mínimo 6 caracteres"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="input pr-10"
                      placeholder="Digite a senha novamente"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-purple-900 mb-2">O que você ganha:</h4>
              <ul className="space-y-1 text-sm text-purple-800">
                <li>✓ 3 dias de teste grátis</li>
                <li>✓ Gestão completa de pacientes e consultas</li>
                <li>✓ Agendamento online</li>
                <li>✓ Prontuários eletrônicos</li>
                <li>✓ Geração de documentos e relatórios</li>
                <li>✓ Suporte técnico</li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className={`w-full btn bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Começar Teste Grátis"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já possui uma conta?{" "}
                <Link
                  to="/"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Fazer login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
