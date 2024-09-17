import express from "express"
import { verifyToken } from "../../../middleware/authMiddleware"
import { AdminController } from "../controllers/admin.controller"
import { isAdmin, isRoot } from "../../../middleware/adminMiddleware"

const router = express.Router()

/**
 * @swagger
 * /admin/root-sign-in:
 *   post:
 *     summary: Root sign-In
 *     description: Sign-In for Root user, authenticates and issues a valid bearer token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RootSignIn'
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
router.post("/root-sign-in", AdminController.rootSignIn)

/**
 * @swagger
 * /admin/admin-sign-in:
 *   post:
 *     summary: Admin sign-In
 *     description: Sign-In for Admin user, authenticates and issues a valid bearer token
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
router.post("/admin-sign-in", AdminController.adminSignIn)

/**
 * @swagger
 * /admin/create-admin:
 *   post:
 *     summary: Creates a new Admin
 *     description: Creates a new Admin. Must be logged in as Root to complete this action
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdmin'
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
router.post("/create-admin", verifyToken, isRoot, AdminController.createAdmin)

/**
 * @swagger
 * /admin/update-admin-status:
 *   post:
 *     summary: Updates the status of an Admin
 *     description: Updates the status of an Admin. Must be logged in as Root to complete this action
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminStatusUpdate'
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
router.post("/update-admin-status", verifyToken, isRoot, AdminController.updateAdminStatus)

/**
 * @swagger
 * /admin/get-advisers/{page}/{limit}:
 *   get:
 *     summary: Returns a list of advisers
 *     description: Fetch a paginated list of items with limit and page parameters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: path
 *         description: The page number. Defaults to 1 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 1
 *       - name: limit
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
 *     responses:
 *       200:
 *         description: A list of advisers (paginated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   format: int32
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   format: int32
 *                   example: 10
 *                 totalItems:
 *                   type: integer
 *                   format: int32
 *                   example: 100
 *                 totalPages:
 *                   type: integer
 *                   format: int32
 *                   example: 10
 *                 advisers:
 *                   type: array
 *                   advisers:
 *                     type: object
 *                     schema:
 *                       $ref: '#/components/schemas/Adviser'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-advisers/:page/:limit", verifyToken, isAdmin, AdminController.getAdvisersWithPaging)

/**
 * @swagger
 * /admin/update-adviser-status:
 *   post:
 *     summary: Update adviser status
 *     description: Update adviser status
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdviserStatusUpdate'
 *     responses:
 *       200:
 *         description: Adviser found.
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
router.post("/update-adviser-status", verifyToken, isAdmin, AdminController.updateAdviserStatus)

/**
 * @swagger
 * /admin/get-adviser/{user_id}:
 *   get:
 *     summary: Returns adviser data
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
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-adviser/:user_id", verifyToken, isAdmin, AdminController.getAdviser)

/**
 * @swagger
 * /admin/get-events/{page}/{limit}:
 *   get:
 *     summary: Returns a list of events
 *     description: Fetch a paginated list of items with limit and page parameters.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: path
 *         description: The page number. Defaults to 1 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 1
 *       - name: limit
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
 *     responses:
 *       200:
 *         description: A list of events (paginated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   format: int32
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   format: int32
 *                   example: 10
 *                 totalItems:
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
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-events/:page/:limit", verifyToken, isAdmin, AdminController.getEventsWithPaging)

/**
 * @swagger
 * /admin/get-event/{event_id}:
 *   get:
 *     summary: Returns adviser data
 *     description: Fetch a single adviser matching the user_id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: event_id
 *         in: path
 *         description: event_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event matching event_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: object
 *                   schema:
 *                     $ref: '#/components/schemas/FullEvent'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-event/:event_id", verifyToken, isAdmin, AdminController.getEvent)
export const AdminRoutes = router