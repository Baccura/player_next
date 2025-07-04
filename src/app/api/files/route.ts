import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { transmissionAPI } from '@/lib/transmission'
import { tmdbAPI, TMDBAPI } from '@/lib/tmdb'
import { CreateFileData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    const where: any = {
      userId: session.user.id
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (category) {
      where.category = {
        name: category
      }
    }

    const files = await prisma.file.findMany({
      where,
      include: {
        category: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(files)
  } catch (error) {
    console.error('Erreur récupération fichiers:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data: CreateFileData = await request.json()

    // Validation
    if (!data.title || !data.categoryId) {
      return NextResponse.json({ error: 'Titre et catégorie requis' }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Si c'est un film ou une série, essayer de récupérer les métadonnées
    let imageUrl = data.imageUrl
    if (!imageUrl && category.name !== 'autres') {
      const cleanQuery = TMDBAPI.cleanSearchQuery(data.title)
      const results = category.name === 'films' 
        ? await tmdbAPI.searchMovie(cleanQuery)
        : await tmdbAPI.searchTV(cleanQuery)
      
      if (results.length > 0) {
        imageUrl = tmdbAPI.getImageUrl(results[0].poster_path || '')
      }
    }

    // Créer le fichier dans la base de données
    const file = await prisma.file.create({
      data: {
        title: data.title,
        status: 'DOWNLOADING',
        userId: session.user.id,
        categoryId: data.categoryId,
        magnetLink: data.magnetLink,
        imageUrl,
        season: data.season,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
        downloadDate: new Date()
      },
      include: {
        category: true,
        user: true
      }
    })

    // Si un lien magnet est fourni, l'ajouter à Transmission
    let transmissionId = null
    if (data.magnetLink) {
      try {
        transmissionId = await transmissionAPI.addTorrent(data.magnetLink)
        
        // Mettre à jour le fichier avec l'ID Transmission
        await prisma.file.update({
          where: { id: file.id },
          data: { transmissionId }
        })
      } catch (transmissionError) {
        console.error('Erreur ajout Transmission:', transmissionError)
        // On continue même si Transmission échoue
      }
    }

    return NextResponse.json({ ...file, transmissionId })
  } catch (error) {
    console.error('Erreur création fichier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
