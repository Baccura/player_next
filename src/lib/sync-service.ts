import cron from 'node-cron'
import { transmissionAPI, TransmissionAPI } from '@/lib/transmission'
import { prisma } from '@/lib/prisma'
import { FileStatus } from '@/types'
import fs from 'fs/promises'
import path from 'path'

class SyncService {
  private isRunning = false

  constructor() {
    // Lancer la synchronisation toutes les 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.syncTransmission()
    })

    console.log('Service de synchronisation Transmission démarré (toutes les 5 minutes)')
  }

  async syncTransmission() {
    if (this.isRunning) {
      console.log('Synchronisation déjà en cours, passage ignoré')
      return
    }

    this.isRunning = true
    
    try {
      console.log(`[${new Date().toISOString()}] Démarrage synchronisation Transmission...`)
      
      // Récupérer tous les torrents de Transmission
      const torrents = await transmissionAPI.getTorrents()
      
      // Récupérer tous les fichiers en cours de téléchargement
      const files = await prisma.file.findMany({
        where: {
          status: {
            in: ['DOWNLOADING', 'MOVING']
          },
          transmissionId: {
            not: null
          }
        },
        include: {
          category: true
        }
      })

      let updatedCount = 0

      for (const file of files) {
        const torrent = torrents.find(t => t.id === file.transmissionId)
        
        if (!torrent) {
          console.log(`Torrent ${file.transmissionId} non trouvé pour ${file.title}`)
          continue
        }

        const newStatus = TransmissionAPI.getFileStatus(torrent.status)
        const progress = Math.round(torrent.percentDone * 100)

        // Mettre à jour le statut et le progrès
        if (file.status !== newStatus || file.progress !== progress) {
          await prisma.file.update({
            where: { id: file.id },
            data: {
              status: newStatus as FileStatus,
              progress,
              size: BigInt(torrent.totalSize)
            }
          })

          updatedCount++
          console.log(`Fichier mis à jour: ${file.title} - ${newStatus} (${progress}%)`)

          // Si le téléchargement est terminé, déplacer le fichier
          if (newStatus === 'FINISHED' && file.status === 'DOWNLOADING') {
            await this.moveFileToPlexFolder(file, torrent.downloadDir)
          }
        }
      }

      console.log(`[${new Date().toISOString()}] Synchronisation terminée: ${updatedCount} fichiers mis à jour`)
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Erreur synchronisation:`, error)
    } finally {
      this.isRunning = false
    }
  }

  private async moveFileToPlexFolder(file: any, downloadDir: string) {
    try {
      // Définir le dossier de destination selon la catégorie
      let destinationBase = ''
      switch (file.category.name) {
        case 'films':
          destinationBase = process.env.PLEX_MOVIES_PATH || '/plex/movies'
          break
        case 'series':
          destinationBase = process.env.PLEX_SERIES_PATH || '/plex/series'
          break
        case 'autres':
          destinationBase = process.env.PLEX_OTHER_PATH || '/plex/other'
          break
        default:
          throw new Error(`Catégorie inconnue: ${file.category.name}`)
      }

      // Mettre le fichier en statut "moving"
      await prisma.file.update({
        where: { id: file.id },
        data: { status: 'MOVING' }
      })

      console.log(`Déplacement de ${file.title} vers ${destinationBase}`)

      // Construire le chemin de destination
      const fileName = file.title
      const sourcePath = path.join(downloadDir, fileName)
      const destinationPath = path.join(destinationBase, fileName)

      // Vérifier que le fichier source existe
      try {
        await fs.access(sourcePath)
      } catch {
        console.error(`Fichier source non trouvé: ${sourcePath}`)
        return
      }

      // Créer le dossier de destination s'il n'existe pas
      await fs.mkdir(path.dirname(destinationPath), { recursive: true })

      // Déplacer le fichier
      await fs.rename(sourcePath, destinationPath)

      // Mettre à jour le statut et le chemin final
      await prisma.file.update({
        where: { id: file.id },
        data: {
          status: 'FINISHED',
          finalPath: destinationPath
        }
      })

      console.log(`Fichier déplacé avec succès: ${sourcePath} -> ${destinationPath}`)
    } catch (error) {
      console.error(`Erreur déplacement fichier ${file.title}:`, error)
      
      // Marquer le fichier en erreur
      await prisma.file.update({
        where: { id: file.id },
        data: { status: 'ERROR' }
      })
    }
  }
}

// Exporter une instance singleton
export const syncService = new SyncService()
