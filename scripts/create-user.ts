import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

async function createDefaultUser() {
  try {
    // Vérifier si un utilisateur existe déjà
    const existingUser = await prisma.user.findFirst()
    
    if (existingUser) {
      console.log('Un utilisateur existe déjà dans la base de données')
      return
    }

    // Créer un utilisateur par défaut
    const hashedPassword = await hash('admin123', 12)
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@transmission-manager.com',
        name: 'Administrateur',
        password: hashedPassword
      }
    })

    console.log('Utilisateur par défaut créé:')
    console.log(`Email: ${user.email}`)
    console.log('Mot de passe: admin123')
    console.log('⚠️  Pensez à changer ce mot de passe par défaut!')
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exporter la fonction pour utilisation dans le seed
export { createDefaultUser }

// Si ce fichier est exécuté directement
if (require.main === module) {
  createDefaultUser()
}
