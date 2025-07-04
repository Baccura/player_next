import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transmissionAPI } from '@/lib/transmission'

export async function GET(request: NextRequest) {
  try {
    // Tester la connexion à la base de données
    await prisma.$connect()
    const userCount = await prisma.user.count()

    // Tester la connexion à Transmission
    let transmissionStatus = 'unknown'
    try {
      const torrents = await transmissionAPI.getTorrents()
      transmissionStatus = 'connected'
    } catch (error) {
      transmissionStatus = 'disconnected'
    }

    // Statistiques générales
    const stats = await Promise.all([
      prisma.file.count(),
      prisma.file.count({ where: { status: 'DOWNLOADING' } }),
      prisma.file.count({ where: { status: 'FINISHED' } }),
      prisma.reminder.count(),
    ])

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: 'connected',
        users: userCount
      },
      transmission: {
        status: transmissionStatus
      },
      statistics: {
        totalFiles: stats[0],
        downloadingFiles: stats[1],
        finishedFiles: stats[2],
        totalReminders: stats[3]
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
