import express from "express"
import { AdviserController } from "../controllers/adviser.controller"
import { verifyToken } from "../../../../middleware/authMiddleware"
import { isAdmin } from "../../../../middleware/adminMiddleware"


const router = express.Router()

/**
 * @swagger
 * /adviser/register-adviser:
 *   post:
 *     summary: Registers an existing adviser
 *     description: Registers an existing adviser
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
router.post("/register-adviser", verifyToken, AdviserController.registerAdviser)

/**
 * @swagger
 * /adviser/query-platform-adviser:
 *   post:
 *     summary: Query adviser details
 *     description: Returns adviser details from the data platform
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdviserQuery'
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
router.post("/query-platform-adviser", verifyToken, AdviserController.queryPlatformAdviser)

/**
 * @swagger
 * /adviser/get-adviser/{user_id}:
 *   get:
 *     summary: Returns adviser data from data-platform (external)
 *     description: Fetch a single adviser matching the user_id
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

export const AdviserRoutes = router