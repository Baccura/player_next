'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

interface HealthStatus {
  status: string
  timestamp: string
  version: string
  database: {
    status: string
    users: number
  }
  transmission: {
    status: string
  }
  statistics: {
    totalFiles: number
    downloadingFiles: number
    finishedFiles: number
    totalReminders: number
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHealthStatus()
    // Actualiser toutes les 30 secondes
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
        setError('')
      } else {
        setError('Erreur lors de la récupération du statut')
      }
    } catch (error) {
      setError('Erreur de communication avec le serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const triggerSync = async () => {
    try {
      const response = await fetch('/api/transmission/sync', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        alert(`Synchronisation déclenchée: ${data.message}`)
        fetchHealthStatus() // Actualiser les stats
      } else {
        alert('Erreur lors de la synchronisation')
      }
    } catch (error) {
      alert('Erreur de communication avec le serveur')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du statut...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Administration
              </h1>
              <nav className="flex space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Fichiers
                </Link>
                <Link 
                  href="/reminders" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Reminders
                </Link>
                <Link 
                  href="/admin" 
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
              </nav>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={triggerSync}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Synchroniser maintenant
              </button>
              <button
                onClick={() => signOut()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {health && (
          <>
            {/* Statut général */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Statut du système
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    health.status === 'healthy' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-2xl ${
                      health.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {health.status === 'healthy' ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Application</p>
                  <p className="font-semibold capitalize">{health.status}</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    health.database.status === 'connected' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-2xl ${
                      health.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {health.database.status === 'connected' ? '✓' : '✗'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Base de données</p>
                  <p className="font-semibold capitalize">{health.database.status}</p>
                </div>
                
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    health.transmission.status === 'connected' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <span className={`text-2xl ${
                      health.transmission.status === 'connected' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {health.transmission.status === 'connected' ? '✓' : '⚠'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-semibold capitalize">{health.transmission.status}</p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">📁</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {health.statistics.totalFiles}
                    </p>
                    <p className="text-gray-600 text-sm">Fichiers total</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-xl">⏬</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {health.statistics.downloadingFiles}
                    </p>
                    <p className="text-gray-600 text-sm">En téléchargement</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">✅</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {health.statistics.finishedFiles}
                    </p>
                    <p className="text-gray-600 text-sm">Terminés</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-xl">📝</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {health.statistics.totalReminders}
                    </p>
                    <p className="text-gray-600 text-sm">Reminders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations système */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations système
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Application</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Version:</dt>
                      <dd className="font-medium">{health.version}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Dernière vérification:</dt>
                      <dd className="font-medium">
                        {new Date(health.timestamp).toLocaleString('fr-FR')}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Base de données</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Utilisateurs:</dt>
                      <dd className="font-medium">{health.database.users}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Statut:</dt>
                      <dd className="font-medium capitalize">{health.database.status}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
