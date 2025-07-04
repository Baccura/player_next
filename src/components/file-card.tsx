'use client'

import { FileWithRelations } from '@/types'
import Image from 'next/image'

interface FileCardProps {
  file: FileWithRelations
  onUpdate: () => void
}

export default function FileCard({ file, onUpdate }: FileCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DOWNLOADING': return 'bg-blue-500'
      case 'MOVING': return 'bg-yellow-500'
      case 'FINISHED': return 'bg-green-500'
      case 'PAUSED': return 'bg-gray-500'
      case 'ERROR': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DOWNLOADING': return 'En cours'
      case 'MOVING': return 'Déplacement'
      case 'FINISHED': return 'Terminé'
      case 'PAUSED': return 'En pause'
      case 'ERROR': return 'Erreur'
      default: return status
    }
  }

  const formatFileSize = (size: bigint | null) => {
    if (!size) return 'N/A'
    
    const bytes = Number(size)
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    
    if (bytes === 0) return '0 B'
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {file.imageUrl ? (
          <Image
            src={file.imageUrl}
            alt={file.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">📁</div>
              <div className="text-sm">{file.category.name}</div>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(file.status)}`}>
            {getStatusText(file.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {file.title}
        </h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Catégorie:</span>
            <span className="font-medium capitalize">{file.category.name}</span>
          </div>
          
          {file.size && (
            <div className="flex justify-between">
              <span>Taille:</span>
              <span className="font-medium">{formatFileSize(file.size)}</span>
            </div>
          )}
          
          {file.season && (
            <div className="flex justify-between">
              <span>Saison:</span>
              <span className="font-medium">{file.season}</span>
            </div>
          )}
          
          {file.downloadDate && (
            <div className="flex justify-between">
              <span>Ajouté:</span>
              <span className="font-medium">
                {new Date(file.downloadDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {file.status === 'DOWNLOADING' && file.progress !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progression</span>
              <span>{Math.round(file.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            ID: {file.transmissionId || 'N/A'}
          </div>
          
          {file.finalPath && (
            <div className="text-xs text-green-600">
              📂 Dans Plex
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
