import axios from 'axios'
import { TMDBSearchResult } from '@/types'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export class TMDBAPI {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || ''
  }

  async searchMovie(query: string): Promise<TMDBSearchResult[]> {
    if (!this.apiKey) return []

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          api_key: this.apiKey,
          query,
          language: 'fr-FR',
        },
      })
      return response.data.results || []
    } catch (error) {
      console.error('Erreur recherche film TMDB:', error)
      return []
    }
  }

  async searchTV(query: string): Promise<TMDBSearchResult[]> {
    if (!this.apiKey) return []

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
        params: {
          api_key: this.apiKey,
          query,
          language: 'fr-FR',
        },
      })
      return response.data.results || []
    } catch (error) {
      console.error('Erreur recherche série TMDB:', error)
      return []
    }
  }

  getImageUrl(posterPath: string): string {
    return posterPath ? `${TMDB_IMAGE_BASE_URL}${posterPath}` : ''
  }

  // Nettoyer le titre pour une meilleure recherche
  static cleanSearchQuery(filename: string): string {
    return filename
      .replace(/\.(mkv|mp4|avi|mov|wmv|flv|webm)$/i, '') // Supprimer extensions
      .replace(/\d{4}/, '') // Supprimer année
      .replace(/[._-]/g, ' ') // Remplacer séparateurs par espaces
      .replace(/\b(FRENCH|TRUEFRENCH|VOSTFR|720p|1080p|4K|x264|x265|HEVC|HDRip|BluRay|WEBRip|WEB-DL)\b/gi, '') // Supprimer tags qualité
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim()
  }
}

export const tmdbAPI = new TMDBAPI()
