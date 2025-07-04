import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seeding de la base de données...')

  // Créer les catégories par défaut
  console.log('📁 Création des catégories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'films' },
      update: {},
      create: {
        name: 'films',
        description: 'Films et long-métrages'
      }
    }),
    prisma.category.upsert({
      where: { name: 'series' },
      update: {},
      create: {
        name: 'series',
        description: 'Séries TV et épisodes'
      }
    }),
    prisma.category.upsert({
      where: { name: 'autres' },
      update: {},
      create: {
        name: 'autres',
        description: 'Autres fichiers (documentaires, musique, etc.)'
      }
    })
  ])

  console.log('✅ Catégories créées:', categories.map((c: any) => c.name).join(', '))

  // Créer un utilisateur par défaut s'il n'en existe aucun
  const existingUser = await prisma.user.findFirst()
  
  if (!existingUser) {
    console.log('👤 Création de l\'utilisateur par défaut...')
    
    const hashedPassword = await hash('admin123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@transmission-manager.com',
        name: 'Administrateur',
        password: hashedPassword
      }
    })

    console.log('✅ Utilisateur par défaut créé:')
    console.log(`   Email: ${user.email}`)
    console.log('   Mot de passe: admin123')
    console.log('   ⚠️  Pensez à changer ce mot de passe!')
  } else {
    console.log('👤 Utilisateur existant trouvé, pas de création')
  }

  console.log('🎉 Seeding terminé avec succès!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
