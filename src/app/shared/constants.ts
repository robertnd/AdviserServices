export enum CredentialType {
    root = 'root', 
    admin = 'admin', 
    adviser_admin = 'adviser_admin', 
    adviser_user = 'adviser_user', 
    adviser_applicant = 'adviser_applicant'
}

export enum RBAC {
    Registered = 'Registered', 
    TBD = 'TBD'
}

export enum IntermediaryType {
    Applicant = 'Applicant', 
    Migrated = 'Migrated', 
    TBD = 'TBD'
}

export enum LegalEntityType {
    person = 'person', 
    non_person = 'non_person'
}

export enum AdviserStatus {
    Pending_Approval = 'Pending_Approval', 
    Active = 'Active', 
    Approved = 'Approved'
}

export enum CredentialStatus {
    Active = 'Active', 
    Expired = 'Expired', 
    Invalid = 'Invalid', 
    Must_Reset = 'Must_Reset', 
    Not_Set = 'Not_Set'
}


/*
credential_type = [ root, admin, adviser-admin, adviser-user, adviser-applicant ]
rbac = [ Registered, ? ]
intermediary_type = [ Applicant ]
legal_entity_type = [ person, non-person ]
status = [ Pending Approval, Active, ? ]

*/