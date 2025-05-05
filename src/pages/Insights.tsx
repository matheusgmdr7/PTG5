"use client"

import { useEffect, useState } from "react" // Import useState
// Assuming you have these imports, adjust as necessary
// import { useConnections } from './connectionsContext'; // Example
// import { useBehaviors } from './behaviorsContext'; // Example
// import { useNotifications } from './notificationsContext'; // Example
// import api from './api'; // Example API client

interface Behavior {
  id: string
  type: string
  description: string
  severity: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  timestamp: number
  read: boolean
}

// Mock implementations for context and api
const useConnections = () => ({ connections: ["conn1", "conn2"], hasConnections: true })
const useBehaviors = () => ({ behaviors: [], addBehavior: (behavior: Behavior) => {} })
const useNotifications = () => ({ addNotification: (notification: Notification) => {} })
const api = {
  getBehaviors: async (connections: string[]) => {
    return [] as Behavior[]
  },
}

const Insights = () => {
  const { connections, hasConnections } = useConnections()
  const { behaviors, addBehavior } = useBehaviors()
  const { addNotification } = useNotifications()
  const [isLoading, setIsLoading] = useState(false) // Declare setIsLoading

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (hasConnections) {
          // Buscar comportamentos
          const behaviorsData = await api.getBehaviors(connections)

          // Verificar se há novos comportamentos
          if (behaviorsData.length > 0) {
            // Filtrar apenas comportamentos que ainda não estão no store
            const existingIds = behaviors.map((b) => b.id)
            const newBehaviors = behaviorsData.filter((b) => !existingIds.includes(b.id))

            // Adicionar novos comportamentos ao store
            newBehaviors.forEach((behavior) => {
              // Adicionar comportamento
              addBehavior(behavior)

              // Criar notificação para o comportamento
              const notification = {
                id: `behavior-${behavior.id}`,
                title: `Novo padrão de comportamento: ${behavior.type}`,
                message: behavior.description.substring(0, 100) + (behavior.description.length > 100 ? "..." : ""),
                type: behavior.severity === "high" ? "danger" : behavior.severity === "medium" ? "warning" : "info",
                timestamp: Date.now(),
                read: false,
              }

              // Adicionar notificação
              addNotification(notification)
            })

            console.log(`Added ${newBehaviors.length} new behaviors with notifications`)
          }
        }
      } catch (error) {
        console.error("Error fetching insights data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Configurar verificação periódica (a cada 15 minutos)
    const intervalId = setInterval(fetchData, 15 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [hasConnections, addBehavior, addNotification, connections, behaviors])

  return <div>{isLoading ? <p>Loading...</p> : <p>Insights content goes here.</p>}</div>
}

export default Insights
