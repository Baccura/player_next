import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params

    // Vérifier que le reminder appartient à l'utilisateur
    const reminder = await prisma.reminder.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder non trouvé' }, { status: 404 })
    }

    if (reminder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    await prisma.reminder.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Reminder supprimé' })
  } catch (error) {
    console.error('Erreur suppression reminder:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    // Vérifier que le reminder appartient à l'utilisateur
    const reminder = await prisma.reminder.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder non trouvé' }, { status: 404 })
    }

    if (reminder.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: {
        completed: data.completed,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || null
      },
      include: {
        category: true,
        user: true
      }
    })

    return NextResponse.json(updatedReminder)
  } catch (error) {
    console.error('Erreur mise à jour reminder:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
