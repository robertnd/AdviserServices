import express from "express"
import { AdviserController } from "../controllers/adviser.controller"
import { verifyToken } from "../../../../middleware/authMiddleware"
import { isAdmin } from "../../../../middleware/adminMiddleware"

const router = express.Router()

/**
 * @swagger
 * /adviser/adviser-migration:
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
router.post("/adviser-migration", AdviserController.migrateAdviser)

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
 *                     $ref: '#/components/schemas/Adviser'
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get("/get-adviser/:user_id", verifyToken, AdviserController.getAdviser)

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
 * /adviser/adviser-application:
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
router.post("/adviser-application", AdviserController.newAdviserApplication)

router.post("/adviser-application-file", AdviserController.saveFile)

/**
 * @swagger
 * /adviser/adviser-user:
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
router.post("/adviser-user", AdviserController.newStaffUser)

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

/**
 * @swagger
 * /adviser/search-adviser:
 *   post:
 *     summary: Search for Adviser
 *     description: Search for Adviser
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchAdviser'
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
router.post("/search-adviser", AdviserController.searchAdviser)

export const AdviserRoutes = router