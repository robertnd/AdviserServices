import { DataPlatformAdviser } from "../../data_platform/data-platform.adviser.dto"

export type RegistrationDto = {
    user_id: string
    password: string
    otp: string
    dpAdviser: DataPlatformAdviser
}