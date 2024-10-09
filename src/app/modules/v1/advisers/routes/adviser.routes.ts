import express from "express"
import { AdviserController } from "../controllers/adviser.controller"
import { verifyToken } from "../../../../middleware/authMiddleware"
import { isAdmin } from "../../../../middleware/adminMiddleware"

const router = express.Router()

/**
 * @swagger
 * /adviser/migrate-adviser:
 *   post:
 *     summary: Creates an existing adviser on the platform
 *     description: Creates an existing adviser on the platform
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Adviser'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/migrate-adviser", AdviserController.migrateAdviser)

/**
 * @swagger
 * /adviser/get-adviser/{user_id}:
 *   get:
 *     summary: Returns an adviser
 *     description: Returns an adviser
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: path
 *         description: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Adviser entity matching user_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advisers:
 *                   type: object
 *                   schema:
 *                     $ref: '#/components/schemas/GetAdviser'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/get-adviser/:user_id", AdviserController.getAdviser)

/**
 * @swagger
 * /adviser/search-adviser:
 *   post:
 *     summary: 
 *     description: 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Condition'
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   format: int32
 *                   example: 1
 *                 page_size:
 *                   type: integer
 *                   format: int32
 *                   example: 10
 *                 total_items:
 *                   type: integer
 *                   format: int32
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   format: int32
 *                   example: 10
 *                 events:
 *                   type: array
 *                   events:
 *                     type: object
 *                     schema:
 *                       $ref: '#/components/schemas/Adviser'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.post("/search-adviser", AdviserController.searchAdviser)

/**
 * @swagger
 * /adviser/get-adviser-ext:
 *   post:
 *     summary: Search for Adviser (External System)
 *     description: Search for Adviser (External System)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Condition'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/get-adviser-ext", AdviserController.getAdviserExternal)

/**
 * @swagger
 * /adviser/sign-in:
 *   post:
 *     summary: Sign-In
 *     description: Sign-In, get valid bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignIn'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/sign-in", AdviserController.signIn)

/**
 * @swagger
 * /adviser/new-adviser-application:
 *   post:
 *     summary: Creates an adviser application
 *     description: Creates an adviser application
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Applicant'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/new-adviser-application", AdviserController.newAdviserApplication)

/**
 * @swagger
 * /adviser/new-adviser-application-file:
 *   post:
 *     summary: Uploads files related to a new application
 *     description: Uploads files related to a new application
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveFile'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/new-adviser-application-file", AdviserController.saveFile)

/**
 * @swagger
 * /adviser/new-adviser-staff:
 *   post:
 *     summary: Creates a staff user
 *     description: Creates a staff user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Staff'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/new-adviser-staff", AdviserController.newStaffUser)

/**
 * @swagger
 * /adviser/get-otp:
 *   post:
 *     summary: Request for OTP
 *     description: Request for OTP
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOTP'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/get-otp", AdviserController.createOTP)

/**
 * @swagger
 * /adviser/set-password:
 *   post:
 *     summary: Set password
 *     description: Set password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPassword'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: A client error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/set-password", AdviserController.setPassword)

export const AdviserRoutes = router