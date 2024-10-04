import { ApplicantDto } from "../../applicant.dto"
import { DataPlatformAdviserDto } from "../../data_platform/data-platform.adviser.dto"
import { StaffDto } from "../../staff.dto"

export type RegistrationDto = {
    user_id: string
    other_names: string
    password: string
} & ( MigratedAdviser | Applicant | Staff )

type MigratedAdviser = {
    reg_type: 'migrated'
    adviser: DataPlatformAdviserDto
}

type Applicant = {
    reg_type: 'applicant'
    adviser: ApplicantDto
}

type Staff = {
    reg_type: 'staff'
    adviser_user_id: string
    adviser: StaffDto
}