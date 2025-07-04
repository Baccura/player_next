import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { transmissionAPI, TransmissionAPI } from '@/lib/transmission'
import { FileStatus } from '@/types'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

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

    const updates = []

    for (const file of files) {
      const torrent = torrents.find(t => t.id === file.transmissionId)
      
      if (!torrent) {
        // Torrent n'existe plus dans Transmission
        continue
      }

      const newStatus = TransmissionAPI.getFileStatus(torrent.status)
      const progress = Math.round(torrent.percentDone * 100)

      // Mettre à jour le statut et le progrès
      if (file.status !== newStatus || file.progress !== progress) {
        const updatedFile = await prisma.file.update({
          where: { id: file.id },
          data: {
            status: newStatus as FileStatus,
            progress,
            size: BigInt(torrent.totalSize)
          }
        })

        updates.push(updatedFile)

        // Si le téléchargement est terminé, déplacer le fichier
        if (newStatus === 'FINISHED' && file.status === 'DOWNLOADING') {
          await moveFileToPlexFolder(file, torrent.downloadDir)
        }
      }
    }

    return NextResponse.json({ 
      message: `${updates.length} fichiers mis à jour`,
      updates 
    })
  } catch (error) {
    console.error('Erreur synchronisation Transmission:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

async function moveFileToPlexFolder(file: any, downloadDir: string) {
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

    console.log(`Fichier déplacé: ${sourcePath} -> ${destinationPath}`)
  } catch (error) {
    console.error(`Erreur déplacement fichier ${file.title}:`, error)
    
    // Marquer le fichier en erreur
    await prisma.file.update({
      where: { id: file.id },
      data: { status: 'ERROR' }
    })
  }
}
