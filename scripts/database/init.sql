/* Tables */
/*
admins_id_seq
adviser_id_seq
adviser_agency_id_seq
adviser_contacts_id_seq
adviser_person_id_seq
credentials_id_seq
event_id_seq
event_payload_id_seq
*/

CREATE TABLE admins
(
    id SERIAL,
    user_id character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    digest text NOT NULL,
    status character varying(50) NOT NULL DEFAULT 'Active',
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admin_pkey PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS adviser
(
    id SERIAL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    kra_pin character varying(50) NOT NULL,
    account_number character varying(50),
    partner_number character varying(50),
    intermediary_type character varying(100),
    country character varying(50),
    active boolean NOT NULL DEFAULT false,
    CONSTRAINT adviser_pkey PRIMARY KEY (account_number)
);

CREATE TABLE adviser_agency
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    id_doc_number character varying(50) NOT NULL,
    id_doc_type character varying(50) NOT NULL,
    date_of_incorporation character varying(50) NOT NULL,
    agency_name character varying(50) NOT NULL,
    CONSTRAINT adviser_agency_pkey PRIMARY KEY (id_doc_number, id_doc_type)
);

CREATE TABLE adviser_contacts
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    mobile_no character varying(20) NOT NULL,
    secondary_mobile_no character varying(20),
    primary_email character varying(100) NOT NULL,
    secondary_email character varying(100),
    fixed_phone_no character varying(20),
    secondary_fixed_phone_no character varying(20),
    primary_address character varying(200) NOT NULL,
    secondary_address character varying(200),
    city character varying(50) NOT NULL,
    secondary_city character varying(50),
    country character varying(50)
);

CREATE TABLE adviser_person
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    id_doc_number character varying(50) NOT NULL,
    id_doc_type character varying(50) NOT NULL,
    date_of_birth character varying(50),
    first_name character varying(50),
    last_name character varying(50),
    full_names character varying(150) COLLATE pg_catalog."default" NOT NULL,
    gender character varying(10),
    CONSTRAINT adviser_person_pkey PRIMARY KEY (id_doc_number, id_doc_type)
);

CREATE TABLE credentials
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    digest text NOT NULL,
    credential_type character varying(100) NOT NULL,
    status character varying(100) NOT NULL,
    CONSTRAINT credentials_pkey PRIMARY KEY (user_id)
);

CREATE TABLE event
(
    id SERIAL,
    trace_id character varying(100),
    user_id character varying(50) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    event_type character varying(50),
    endpoint text,
    direction character varying(20),
    process character varying(50),
    step character varying(50),
    status character varying(50)
);

CREATE TABLE event_payload
(
    id SERIAL,
    event_id bigint NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    request jsonb,
    result jsonb,
    response jsonb
);

CREATE VIEW adviser_agency_user
 AS
 SELECT c.id AS cred_id,
    c.user_id, c.credential_type, c.status, a.id, a.create_date, a.kra_pin, a.account_number, a.partner_number, a.intermediary_type, ag.id AS agency_id, ag.id_doc_number, ag.id_doc_type, ag.date_of_incorporation, ag.agency_name, ac.id AS contacts_id, ac.mobile_no, ac.secondary_mobile_no, ac.primary_email, ac.secondary_email, ac.fixed_phone_no, ac.secondary_fixed_phone_no, ac.primary_address, ac.secondary_address, ac.city, ac.secondary_city
   FROM credentials c,
    adviser a,
    adviser_agency ag,
    adviser_contacts ac
  WHERE c.credential_type::text = 'Non-Individual'::text AND a.id = c.adviser_id AND a.id = ag.adviser_id AND a.id = ac.adviser_id;


CREATE VIEW adviser_person_user
 AS
 SELECT c.id AS cred_id,
    c.user_id, c.credential_type, c.status, a.id, a.create_date, a.kra_pin, a.account_number, a.partner_number, a.intermediary_type, ap.id AS person_id, ap.id_doc_number, ap.id_doc_type, ap.date_of_birth, ap.first_name, ap.last_name, ap.full_names, ap.gender, ac.id AS contacts_id, ac.mobile_no, ac.secondary_mobile_no, ac.primary_email, ac.secondary_email, ac.fixed_phone_no, ac.secondary_fixed_phone_no, ac.primary_address, ac.secondary_address, ac.city, ac.secondary_city
   FROM credentials c,
    adviser a,
    adviser_person ap,
    adviser_contacts ac
  WHERE c.credential_type::text = 'Individual'::text AND a.id = c.adviser_id AND a.id = ap.adviser_id AND a.id = ac.adviser_id;


CREATE VIEW all_advisers
 AS
 SELECT adviser_agency_user.cred_id,
    adviser_agency_user.user_id, adviser_agency_user.credential_type, adviser_agency_user.status, adviser_agency_user.id AS adviser_id, adviser_agency_user.create_date, adviser_agency_user.kra_pin, adviser_agency_user.account_number, adviser_agency_user.partner_number, adviser_agency_user.intermediary_type, adviser_agency_user.id AS person_or_agency_id, adviser_agency_user.id_doc_number, adviser_agency_user.id_doc_type, adviser_agency_user.date_of_incorporation AS date_of_birth_or_inc, adviser_agency_user.agency_name AS names, adviser_agency_user.id AS contacts_id, adviser_agency_user.mobile_no, adviser_agency_user.secondary_mobile_no, adviser_agency_user.primary_email, adviser_agency_user.secondary_email, adviser_agency_user.fixed_phone_no, adviser_agency_user.secondary_fixed_phone_no, adviser_agency_user.primary_address, adviser_agency_user.secondary_address, adviser_agency_user.city, adviser_agency_user.secondary_city
   FROM adviser_agency_user
UNION ALL
 SELECT adviser_person_user.cred_id,
    adviser_person_user.user_id, adviser_person_user.credential_type, adviser_person_user.status, adviser_person_user.id AS adviser_id, adviser_person_user.create_date, adviser_person_user.kra_pin, adviser_person_user.account_number, adviser_person_user.partner_number, adviser_person_user.intermediary_type, adviser_person_user.id AS person_or_agency_id, adviser_person_user.id_doc_number, adviser_person_user.id_doc_type, adviser_person_user.date_of_birth AS date_of_birth_or_inc, adviser_person_user.full_names AS names, adviser_person_user.id AS contacts_id, adviser_person_user.mobile_no, adviser_person_user.secondary_mobile_no, adviser_person_user.primary_email, adviser_person_user.secondary_email, adviser_person_user.fixed_phone_no, adviser_person_user.secondary_fixed_phone_no, adviser_person_user.primary_address, adviser_person_user.secondary_address, adviser_person_user.city, adviser_person_user.secondary_city
   FROM adviser_person_user;

/* Grants on Tables */
GRANT ALL ON adviser to omserviceuser;
GRANT ALL ON adviser_agency to omserviceuser;
GRANT ALL ON adviser_contacts to omserviceuser;
GRANT ALL ON adviser_person to omserviceuser;
GRANT ALL ON credentials to omserviceuser;
GRANT ALL ON event to omserviceuser;
GRANT ALL ON event_payload to omserviceuser;
GRANT ALL ON admins to omserviceuser;

/* Grants on VIEWS */
GRANT ALL ON adviser_person_user to omserviceuser;
GRANT ALL ON adviser_agency_user to omserviceuser;
GRANT ALL ON all_advisers to omserviceuser;

/* Grants on SEQUENCES */
GRANT ALL ON adviser_id_seq to omserviceuser;
GRANT ALL ON adviser_agency_id_seq to omserviceuser;
GRANT ALL ON adviser_contacts_id_seq to omserviceuser;
GRANT ALL ON adviser_person_id_seq to omserviceuser;
GRANT ALL ON credentials_id_seq to omserviceuser;
GRANT ALL ON event_id_seq to omserviceuser;
GRANT ALL ON event_payload_id_seq to omserviceuser;
GRANT ALL ON admins_id_seq to omserviceuser;