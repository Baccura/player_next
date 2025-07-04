'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { FileWithRelations } from '@/types'
import FileCard from './file-card'
import AddFileModal from './add-file-modal'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session } = useSession()
  const [files, setFiles] = useState<FileWithRelations[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [category, setCategory] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (category !== 'all') params.append('category', category)

      const response = await fetch(`/api/files?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Erreur récupération fichiers:', error)
    }
  }, [filter, category])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const handleFileAdded = () => {
    setIsAddModalOpen(false)
    fetchFiles()
  }

  const downloadingFiles = files.filter(f => f.status === 'DOWNLOADING')
  const movingFiles = files.filter(f => f.status === 'MOVING')
  const finishedFiles = files.filter(f => f.status === 'FINISHED')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Transmission Manager
              </h1>
              <nav className="flex space-x-4">
                <Link 
                  href="/" 
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Fichiers
                </Link>
                <Link 
                  href="/reminders" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Reminders
                </Link>
              </nav>
              <p className="text-gray-600">
                Bienvenue, {session?.user?.name || session?.user?.email}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Ajouter un fichier
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

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {downloadingFiles.length}
                </p>
                <p className="text-gray-600">En cours</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {movingFiles.length}
                </p>
                <p className="text-gray-600">En attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {finishedFiles.length}
                </p>
                <p className="text-gray-600">Terminés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Tous</option>
                <option value="downloading">En cours</option>
                <option value="moving">En attente</option>
                <option value="finished">Terminés</option>
              </select>
            </div>
            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Toutes</option>
                <option value="films">Films</option>
                <option value="series">Séries</option>
                <option value="autres">Autres</option>
              </select>
            </div>
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onUpdate={fetchFiles} />
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun fichier trouvé</p>
          </div>
        )}
      </div>

      {/* Add File Modal */}
      {isAddModalOpen && (
        <AddFileModal
          onClose={() => setIsAddModalOpen(false)}
          onFileAdded={handleFileAdded}
        />
      )}
    </div>
  )
}
