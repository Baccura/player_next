'use client'

import { useState, useEffect } from 'react'
import { CreateFileData } from '@/types'

interface AddFileModalProps {
  onClose: () => void
  onFileAdded: () => void
}

interface Category {
  id: string
  name: string
  description: string
}

export default function AddFileModal({ onClose, onFileAdded }: AddFileModalProps) {
  const [formData, setFormData] = useState<CreateFileData>({
    title: '',
    categoryId: '',
    magnetLink: '',
    imageUrl: '',
    season: undefined,
    releaseDate: ''
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Erreur récupération catégories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          season: formData.season ? parseInt(formData.season.toString()) : undefined
        })
      })

      if (response.ok) {
        onFileAdded()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de l&apos;ajout du fichier')
      }
    } catch (error) {
      setError('Erreur de communication avec le serveur')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateFileData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedCategory = categories.find(c => c.id === formData.categoryId)
  const showMetadataFields = selectedCategory?.name !== 'autres'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ajouter un fichier
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du fichier"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} - {category.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Lien Magnet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lien Magnet (optionnel)
              </label>
              <textarea
                value={formData.magnetLink}
                onChange={(e) => handleInputChange('magnetLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="magnet:?xt=urn:btih:..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Si fourni, le téléchargement commencera automatiquement
              </p>
            </div>

            {/* Champs métadonnées (seulement pour films/séries) */}
            {showMetadataFields && (
              <>
                {/* URL Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l&apos;image (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si laissé vide, l&apos;image sera recherchée automatiquement
                  </p>
                </div>

                {/* Saison (seulement pour séries) */}
                {selectedCategory?.name === 'series' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro de saison
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.season || ''}
                      onChange={(e) => handleInputChange('season', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                  </div>
                )}

                {/* Date de sortie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de sortie (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
