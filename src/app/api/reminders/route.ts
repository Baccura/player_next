import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { CreateReminderData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        category: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Erreur récupération reminders:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const data: CreateReminderData = await request.json()

    // Validation
    if (!data.title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }

    // Vérifier que la catégorie existe si fournie
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      })

      if (!category) {
        return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
      }
    }

    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        description: data.description,
        userId: session.user.id,
        categoryId: data.categoryId || null
      },
      include: {
        category: true,
        user: true
      }
    })

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Erreur création reminder:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
