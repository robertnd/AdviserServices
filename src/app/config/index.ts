import dotenv from 'dotenv'

// dotenv by default does not overwrite env variables once set
dotenv.config({ override:true })

export default {
    port: process.env.PORT,
    serving_name: process.env.SERVING_NAME,
    jwt_secret: process.env.JWT_SECRET,
    jwt_issuer: process.env.JWT_ISSUER,
    page_size: process.env.PAGE_SIZE,
    jwt_validity: process.env.JWT_VALIDITY,
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_name: process.env.DB_NAME,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    store_events: process.env.STORE_EVENTS,
    otp_length: process.env.OTP_LENGTH,
    sms_host: process.env.SMS_HOST,
    sms_endpoint: process.env.SMS_ENDPOINT,
    sms_apikey: process.env.SMS_APIKEY,
    sms_partner_id: process.env.SMS_PARTNER_ID,
    sms_shortcode: process.env.SMS_SHORTCODE,
    om_iprs_host: process.env.OM_IPRS_HOST,
    om_iprs_login_endpoint: process.env.OM_IPRS_LOGIN_ENDPOINT,
    om_iprs_query_endpoint: process.env.OM_IPRS_QUERY_ENDPOINT,
    om_iprs_key: process.env.OM_IPRS_KEY,
    om_iprs_secret: process.env.OM_IPRS_SECRET,
    om_partnermgmt_host: process.env.OM_PARTNERMGMT_HOST,
    om_partnermgmt_endpoint: process.env.OM_PARTNERMGMT_ENDPOINT,
    om_partnermgmt_apikey: process.env.OM_PARTNERMGMT_APIKEY,
    client_url: process.env.CLIENT_URL,
    gmail_user: process.env.GMAIL_USER,
    gmail_app_password: process.env.GMAIL_APP_PASSWORD,
}