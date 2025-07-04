'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { ReminderWithRelations, CreateReminderData } from '@/types'
import Link from 'next/link'

export default function RemindersPage() {
  const { data: session } = useSession()
  const [reminders, setReminders] = useState<ReminderWithRelations[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newReminder, setNewReminder] = useState<CreateReminderData>({
    title: '',
    description: '',
    categoryId: ''
  })
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchReminders()
    fetchCategories()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      if (response.ok) {
        const data = await response.json()
        setReminders(data)
      }
    } catch (error) {
      console.error('Erreur récupération reminders:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erreur récupération catégories:', error)
    }
  }

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReminder)
      })

      if (response.ok) {
        setIsAddModalOpen(false)
        setNewReminder({ title: '', description: '', categoryId: '' })
        fetchReminders()
      }
    } catch (error) {
      console.error('Erreur ajout reminder:', error)
    }
  }

  const deleteReminder = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce reminder ?')) return

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error('Erreur suppression reminder:', error)
    }
  }

  const toggleCompleted = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: !completed })
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error('Erreur mise à jour reminder:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Mes Reminders
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
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Reminders
                </Link>
              </nav>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Nouveau reminder
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Reminders actifs
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {reminders.filter(r => !r.completed).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Reminders terminés
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {reminders.filter(r => r.completed).length}
            </p>
          </div>
        </div>

        {/* Reminders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Liste de souhaits
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={reminder.completed}
                      onChange={() => toggleCompleted(reminder.id, reminder.completed)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className={`flex-1 ${reminder.completed ? 'opacity-50' : ''}`}>
                      <h3 className={`text-sm font-medium text-gray-900 ${reminder.completed ? 'line-through' : ''}`}>
                        {reminder.title}
                      </h3>
                      {reminder.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {reminder.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {reminder.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded capitalize">
                            {reminder.category.name}
                          </span>
                        )}
                        <span>
                          Ajouté le {new Date(reminder.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-400 hover:text-red-600 ml-4"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {reminders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun reminder trouvé</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Créer votre premier reminder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Nouveau reminder
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddReminder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du fichier à télécharger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Détails supplémentaires..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newReminder.categoryId}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Aucune catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
