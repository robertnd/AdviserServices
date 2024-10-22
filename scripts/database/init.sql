
CREATE TABLE admins
(
    id SERIAL,
    user_id character varying(50) NOT NULL,
    email character varying(200) NOT NULL,
    mobile_no character varying(20) NOT NULL,
    verification_code character varying(64),
    verification_code_expires_at timestamp with time zone,
    is_verified boolean DEFAULT false,
    digest text NOT NULL,
    status character varying(50) NOT NULL DEFAULT 'Active',
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admin_pkey PRIMARY KEY (user_id)
);

CREATE TABLE adviser
(
    id SERIAL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    kra_pin character varying(50) NOT NULL,
    account_no character varying(50),
    partner_number character varying(50),
    intermediary_type character varying(100),
    legal_entity_type character varying(20) NOT NULL,
    country character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    CONSTRAINT adviser_pkey PRIMARY KEY (kra_pin)
);

CREATE TABLE adviser_nonperson
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    user_id character varying(100) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    id_number character varying(50) NOT NULL,
    id_type character varying(50) NOT NULL,
    date_of_incorporation character varying(50) NOT NULL,
    names character varying(50) NOT NULL,
    CONSTRAINT adviser_nonperson_pkey PRIMARY KEY (id_number, id_type)
);

CREATE TABLE adviser_contacts
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    load_date character varying(100),
    mobile_no character varying(20) NOT NULL,
    secondary_mobile_no character varying(20),
    primary_email character varying(200) NOT NULL,
    secondary_email character varying(200),
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
    id_number character varying(50) NOT NULL,
    id_type character varying(50) NOT NULL,
    date_of_birth character varying(50),
    first_name character varying(50),
    last_name character varying(50),
    full_names character varying(150) NOT NULL,
    gender character varying(10),
    CONSTRAINT adviser_person_pkey PRIMARY KEY (id_number, id_type)
);

CREATE TABLE adviser_user
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    user_id character varying(50) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_number character varying(50) NOT NULL,
    id_type character varying(50) NOT NULL,
    mobile_no character varying(20) NOT NULL,
    email character varying(200) NOT NULL,
    date_of_birth character varying(50),
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    gender character varying(10),
    CONSTRAINT adviser_user_pkey PRIMARY KEY (id_number, id_type)
);

CREATE TABLE api_access
(
    id SERIAL,
    rbac character varying(20) NOT NULL,
    api character varying(100) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT api_access_pkey PRIMARY KEY (rbac, api)
);

CREATE TABLE applicant
(
    id SERIAL,
    first_name character varying(50) NOT NULL,
    other_name character varying(50),
    surname character varying(50) NOT NULL,
    gender character varying(10) NOT NULL,
    date_of_birth character varying(50),
    id_number character varying(50) NOT NULL,
    id_type character varying(50) NOT NULL,
    pin character varying(50) NOT NULL,
    mobile_no character varying(20) NOT NULL,
    home_no character varying(20),
    email character varying(200) NOT NULL,
	nationality character varying(50) NOT NULL,
    country_of_residence character varying(50),
    postal_address character varying(50) NOT NULL,
    city character varying(50) NOT NULL,
    physical_address character varying(50) NOT NULL,    
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applicant_pkey PRIMARY KEY (id_number, id_type)
)

CREATE TABLE applicant_filedata
(
    id SERIAL,
    user_id character varying(50) NOT NULL,
    file_desc character varying(50) NOT NULL,
    file_data text,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applicant_filedata_pkey PRIMARY KEY (user_id, file_desc)
)

CREATE TABLE component_access
(
    id SERIAL,
    rbac character varying(20) NOT NULL,
    component character varying(100) NOT NULL,
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT component_access_pkey PRIMARY KEY (rbac, component)
);

CREATE TABLE credentials
(
    id SERIAL,
    adviser_id bigint NOT NULL,
    user_id character varying(50) NOT NULL,
    mobile_no character varying(20) NOT NULL,
    email character varying(200) NOT NULL,
    digest text NOT NULL,
    credential_type character varying(50) NOT NULL,
    rbac character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
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

CREATE TABLE applicant_filedata
(
    id SERIAL,
    user_id character varying(50) COLLATE pg_catalog."default" NOT NULL,
    file_desc character varying(50) COLLATE pg_catalog."default" NOT NULL,
    file_data text COLLATE pg_catalog."default",
    create_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT applicant_filedata_pkey PRIMARY KEY (user_id, file_desc)
);

CREATE TABLE advpt_customer_202410022003
(
    customer_id character varying(200),
    account_no character varying(200),
    first_name character varying(200),
    last_name character varying(200),
    surname character varying(200),
    phone character varying(200),
    email character varying(200),
    id_no character varying(200),
    id_type character varying(200),
    intermediary_code character varying(200),
    load_date character varying(200)
);

CREATE TABLE advpt_intermediary_202410022003
(
    intermediary_code character varying(200),
    intermediary_type character varying(200),
    first_name character varying(200),
    last_name character varying(200),
    full_names character varying(200),
    id_type character varying(200),
    id_number character varying(200),
    primary_address character varying(200),
    secondary_address character varying(200),
    secondary_city character varying(200),
    city character varying(200),
    country character varying(200),
    primary_phone character varying(200),
    mobile_no character varying(200),
    primary_email character varying(200),
    secondary_phone character varying(200),
    secondary_mobile character varying(200),
    secondary_email character varying(200),
    account_no character varying(200),
    kra_pin character varying(200),
    partner_number character varying(200),
    date_of_birth character varying(200),
    gender character varying(200),
    load_date character varying(200)
);

CREATE OR REPLACE VIEW adviser_nonperson_detailed
 AS
 SELECT 
    a.id AS adviser_id, a.create_date, a.kra_pin, a.account_no, a.partner_number, a.intermediary_type, a.legal_entity_type, anp.id AS entity_id, anp.user_id, anp.id_number, anp.id_type, anp.date_of_incorporation, anp.names, ac.id AS contacts_id, ac.mobile_no, ac.secondary_mobile_no AS mobile_no2, ac.primary_email AS email, ac.secondary_email AS email2, ac.fixed_phone_no AS fixed_phone, ac.secondary_fixed_phone_no AS fixed_phone2, ac.primary_address AS address, ac.secondary_address AS address2, ac.city, ac.secondary_city AS city2
   FROM adviser a,
    adviser_nonperson anp,
    adviser_contacts ac
  WHERE a.legal_entity_type = 'non_person' AND a.id = anp.adviser_id AND a.id = ac.adviser_id;

CREATE OR REPLACE VIEW adviser_person_detailed
 AS
 SELECT 
 a.id AS adviser_id, a.create_date, a.kra_pin, a.account_no, a.partner_number, a.intermediary_type, a.legal_entity_type, ap.id AS entity_id, ap.user_id, ap.id_number, ap.id_type, ap.date_of_birth, ap.first_name, ap.last_name, ap.full_names, ap.gender, ac.id AS contacts_id, ac.mobile_no, ac.secondary_mobile_no AS mobile_no2, ac.primary_email AS email, ac.secondary_email AS email2, ac.fixed_phone_no AS fixed_phone, ac.secondary_fixed_phone_no AS fixed_phone2, ac.primary_address AS address, ac.secondary_address AS address2, ac.city, ac.secondary_city AS city2
   FROM adviser a,
    adviser_person ap,
    adviser_contacts ac
  WHERE a.legal_entity_type = 'person' AND a.id = ap.adviser_id AND a.id = ac.adviser_id;

CREATE OR REPLACE VIEW all_advisers
 AS
 SELECT 
    an.adviser_id, an.create_date, an.kra_pin, an.account_no, an.partner_number, an.intermediary_type, an.legal_entity_type, an.entity_id, an.user_id, an.id_number, an.id_type, an.date_of_incorporation AS date_of_birth_or_inc, an.names, an.contacts_id, an.mobile_no, an.mobile_no2, an.email, an.email2, an.fixed_phone, an.fixed_phone2, an.address, an.address2, an.city, an.city2
  FROM adviser_nonperson_detailed an
UNION ALL
 SELECT 
 ap.adviser_id, ap.create_date, ap.kra_pin, ap.account_no, ap.partner_number, ap.intermediary_type, ap.legal_entity_type, ap.entity_id, ap.user_id, ap.id_number, ap.id_type, ap.date_of_birth AS date_of_birth_or_inc, ap.full_names AS names, ap.contacts_id, ap.mobile_no, ap.mobile_no2, ap.email, ap.email2, ap.fixed_phone, ap.fixed_phone2, ap.address, ap.address2, ap.city, ap.city2
  FROM adviser_person_detailed ap;


/* Grants on Tables */
GRANT ALL ON admins to omserviceuser;
GRANT ALL ON adviser to omserviceuser;
GRANT ALL ON adviser_nonperson to omserviceuser;
GRANT ALL ON adviser_contacts to omserviceuser;
GRANT ALL ON adviser_person to omserviceuser;
GRANT ALL ON api_access to omserviceuser;
GRANT ALL ON component_access to omserviceuser;
GRANT ALL ON credentials to omserviceuser;
GRANT ALL ON event to omserviceuser;
GRANT ALL ON event_payload to omserviceuser;
GRANT ALL ON applicant to omserviceuser;
GRANT ALL ON applicant_filedata to omserviceuser;
GRANT ALL ON advpt_intermediary_202410022003 to omserviceuser;
GRANT ALL ON advpt_customer_202410022003 to omserviceuser;

/* Grants on VIEWS */
GRANT ALL ON adviser_nonperson_detailed to omserviceuser;
GRANT ALL ON adviser_person_detailed to omserviceuser;
GRANT ALL ON all_advisers to omserviceuser;

/* Grants on SEQUENCES */
GRANT ALL ON admins_id_seq to omserviceuser;
GRANT ALL ON adviser_id_seq to omserviceuser;
GRANT ALL ON adviser_nonperson_id_seq to omserviceuser;
GRANT ALL ON adviser_contacts_id_seq to omserviceuser;
GRANT ALL ON adviser_person_id_seq to omserviceuser;
GRANT ALL ON api_access_id_seq to omserviceuser;
GRANT ALL ON component_access_id_seq to omserviceuser;
GRANT ALL ON credentials_id_seq to omserviceuser;
GRANT ALL ON event_id_seq to omserviceuser;
GRANT ALL ON event_payload_id_seq to omserviceuser;
GRANT ALL ON applicant_id_seq to omserviceuser;
GRANT ALL ON applicant_filedata_id_seq to omserviceuser;


\copy advpt_intermediary_202410022003 FROM '/home/ec2-user/advpt_intermediary_202410022003.csv' DELIMITER '|' HEADER CSV;
\copy advpt_customer_202410022003 FROM '/home/ec2-user/advpt_customer_202410022003.csv' DELIMITER '|' HEADER CSV;
