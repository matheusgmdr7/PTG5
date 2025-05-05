import type React from "react"
import { useTranslation } from "react-i18next"

type ConnectionsProps = {}

const Connections: React.FC<ConnectionsProps> = () => {
  const { t } = useTranslation()

  return (
    <div>
      {/* Instructions Section - Modified to show only Binance */}
      <div className="bg-dark-800 rounded-lg shadow-md p-6 border border-dark-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">{t("connections.connectionInstructions")}</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-200">Binance</h3>
            <ol className="mt-2 text-sm text-gray-400 list-decimal list-inside space-y-1">
              <li>Faça login na sua conta Binance</li>
              <li>Vá para Gerenciamento de API nas configurações da sua conta</li>
              <li>Crie uma nova chave API com permissões "Somente Leitura"</li>
              <li>Copie a Chave API e o Segredo</li>
              <li>Insira-os no formulário acima</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Rest of your component's UI can go here */}
    </div>
  )
}

export default Connections
