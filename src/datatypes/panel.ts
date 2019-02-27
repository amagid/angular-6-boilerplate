export interface Panel {
    id: number
    companyId: number
    displayName: string
    description: string
    lastReportAt: string
    errorState: boolean
    deletedAt?: string
    unfinished?: boolean
    location?: string
    latitude?: number
    longitude?: number
    statusName?: string
}