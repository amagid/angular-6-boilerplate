export interface User {
    id: number,
    companyId: number,
    fname: string,
    lname: string,
    smsNumber: string,
    email: string,
    pushNotifId: string,
    role: string,
    deletedAt?: string,
    company?: {
        name: string
    }
}