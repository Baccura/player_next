import axios from 'axios'
import { TransmissionResponse, TransmissionTorrent } from '@/types'

export class TransmissionAPI {
  private baseUrl: string
  private sessionId: string = ''

  constructor() {
    const host = process.env.TRANSMISSION_HOST || 'localhost'
    const port = process.env.TRANSMISSION_PORT || '9091'
    this.baseUrl = `http://${host}:${port}/transmission/rpc`
  }

  private async request(method: string, arguments_: any = {}): Promise<any> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          method,
          arguments: arguments_,
        },
        {
          headers: {
            'X-Transmission-Session-Id': this.sessionId,
            'Content-Type': 'application/json',
          },
          auth: process.env.TRANSMISSION_USERNAME && process.env.TRANSMISSION_PASSWORD
            ? {
                username: process.env.TRANSMISSION_USERNAME,
                password: process.env.TRANSMISSION_PASSWORD,
              }
            : undefined,
        }
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Session ID manquant ou expiré
        const sessionId = error.response.headers['x-transmission-session-id']
        if (sessionId) {
          this.sessionId = sessionId
          return this.request(method, arguments_)
        }
      }
      throw error
    }
  }

  async getTorrents(): Promise<TransmissionTorrent[]> {
    const response: TransmissionResponse = await this.request('torrent-get', {
      fields: [
        'id',
        'name',
        'status',
        'percentDone',
        'totalSize',
        'downloadedEver',
        'uploadedEver',
        'downloadDir',
        'files',
      ],
    })
    return response.arguments.torrents
  }

  async addTorrent(magnetLink: string, downloadDir?: string): Promise<number> {
    const response = await this.request('torrent-add', {
      filename: magnetLink,
      'download-dir': downloadDir,
    })
    
    if (response.result === 'success') {
      return response.arguments['torrent-added']?.id || response.arguments['torrent-duplicate']?.id
    }
    throw new Error(`Erreur lors de l'ajout du torrent: ${response.result}`)
  }

  async pauseTorrent(id: number): Promise<void> {
    await this.request('torrent-stop', { ids: [id] })
  }

  async resumeTorrent(id: number): Promise<void> {
    await this.request('torrent-start', { ids: [id] })
  }

  async removeTorrent(id: number, deleteData: boolean = false): Promise<void> {
    await this.request('torrent-remove', {
      ids: [id],
      'delete-local-data': deleteData,
    })
  }

  // Convertir le statut Transmission en notre enum
  static getFileStatus(transmissionStatus: number): string {
    switch (transmissionStatus) {
      case 0: return 'PAUSED'      // TR_STATUS_STOPPED
      case 1: return 'DOWNLOADING' // TR_STATUS_CHECK_WAIT
      case 2: return 'DOWNLOADING' // TR_STATUS_CHECK
      case 3: return 'DOWNLOADING' // TR_STATUS_DOWNLOAD_WAIT
      case 4: return 'DOWNLOADING' // TR_STATUS_DOWNLOAD
      case 5: return 'DOWNLOADING' // TR_STATUS_SEED_WAIT
      case 6: return 'FINISHED'    // TR_STATUS_SEED
      default: return 'ERROR'
    }
  }
}

export const transmissionAPI = new TransmissionAPI()
