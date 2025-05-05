import type React from "react"
import ExchangeConnector from "../components/ExchangeConnector"
import { useTranslation } from "react-i18next"
import { Lock, CheckCircle, ArrowRight } from "lucide-react"
import { useAppStore } from "../store"

const Connections: React.FC = () => {
  const { t } = useTranslation()
  const { connections } = useAppStore()
  const hasConnections = connections.length > 0

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-8 border border-violet-700/30 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-200 mb-2">
              {t("connections.exchangeConnections")}
            </h1>
            <p className="text-gray-400 max-w-3xl">
              Conecte sua corretora para começar a monitorar suas operações e gerenciar seu risco de trading. Nós
              solicitamos apenas permissões de leitura para garantir a segurança de seus fundos.
            </p>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl p-6 border border-violet-700/30 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="flex gap-4 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
              <Lock className="text-white z-10" size={20} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200 mb-1">{t("connections.securityNote")}</h3>
            <p className="text-gray-400 text-sm">{t("connections.securityDescription")}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg px-3 py-1.5 text-xs text-gray-300 flex items-center">
                <CheckCircle size={14} className="text-violet-400 mr-1.5" />
                Somente permissões de leitura
              </div>
              <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg px-3 py-1.5 text-xs text-gray-300 flex items-center">
                <CheckCircle size={14} className="text-violet-400 mr-1.5" />
                Sem acesso a saques
              </div>
              <div className="bg-violet-900/20 border border-violet-700/30 rounded-lg px-3 py-1.5 text-xs text-gray-300 flex items-center">
                <CheckCircle size={14} className="text-violet-400 mr-1.5" />
                Dados criptografados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Connection Form - 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-6 border-b border-violet-900/20 relative z-10">
              <h2 className="text-xl font-semibold text-gray-200">
                {hasConnections ? "Gerenciar Conexões" : "Conectar Corretora"}
              </h2>
            </div>
            <div className="p-6 relative z-10">
              <ExchangeConnector />
            </div>
          </div>
        </div>

        {/* Instructions - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-md overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
            <div className="p-6 border-b border-violet-900/20 relative z-10">
              <h2 className="text-xl font-semibold text-gray-200">Como Conectar</h2>
            </div>
            <div className="p-6 relative z-10">
              <div className="space-y-6">
                <div className="relative pl-8 pb-8 border-l border-violet-900/20">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                    <span className="text-white text-sm font-bold z-10">1</span>
                  </div>
                  <h3 className="font-medium text-gray-200 mb-2">Acesse sua conta Binance</h3>
                  <p className="text-sm text-gray-400">
                    Faça login na sua conta Binance e navegue até as configurações de API.
                  </p>
                </div>

                <div className="relative pl-8 pb-8 border-l border-violet-900/20">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                    <span className="text-white text-sm font-bold z-10">2</span>
                  </div>
                  <h3 className="font-medium text-gray-200 mb-2">Crie uma nova chave API</h3>
                  <p className="text-sm text-gray-400">
                    Clique em "Criar API" e configure as permissões para "Somente Leitura".
                  </p>
                </div>

                <div className="relative pl-8 pb-8 border-l border-violet-900/20">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                    <span className="text-white text-sm font-bold z-10">3</span>
                  </div>
                  <h3 className="font-medium text-gray-200 mb-2">Copie suas credenciais</h3>
                  <p className="text-sm text-gray-400">
                    Copie a Chave API e o Segredo API gerados. Guarde o Segredo API em um local seguro, pois ele não
                    será mostrado novamente.
                  </p>
                </div>

                <div className="relative pl-8">
                  <div className="absolute left-0 top-0 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-violet-800 to-fuchsia-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.4),transparent_70%)]"></div>
                    <span className="text-white text-sm font-bold z-10">4</span>
                  </div>
                  <h3 className="font-medium text-gray-200 mb-2">Insira as credenciais</h3>
                  <p className="text-sm text-gray-400">
                    Cole a Chave API e o Segredo API nos campos correspondentes ao lado e clique em "Conectar".
                  </p>
                  <div className="mt-3">
                    <div className="inline-flex items-center text-violet-400 text-sm">
                      <ArrowRight size={16} className="mr-1.5" />
                      <span>Pronto para começar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-br from-black to-violet-950/20 rounded-xl border border-violet-700/30 shadow-md overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)]"></div>
        <div className="p-6 relative z-10">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-200 mb-1">É seguro fornecer minha chave API?</h3>
              <p className="text-sm text-gray-400">
                Sim, solicitamos apenas permissões de leitura, o que significa que não podemos realizar operações ou
                saques em sua conta. Suas chaves são armazenadas de forma criptografada.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-200 mb-1">Quais corretoras são suportadas?</h3>
              <p className="text-sm text-gray-400">
                Atualmente suportamos apenas a Binance. Estamos trabalhando para adicionar suporte a mais corretoras em
                breve.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-200 mb-1">Como posso remover minha conexão?</h3>
              <p className="text-sm text-gray-400">
                Você pode desconectar sua corretora a qualquer momento clicando no botão "Desconectar" ao lado da
                conexão listada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Connections
