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
 *     description: Sign-In for root user, authenticates and issues a valid bearer token
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
 *     description: Sign-In for admin user, authenticates and issues a valid bearer token
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
 *     description: Creates a new admin. Must be logged in as Root to complete this action
 *     security:
 *       - bearerAuth: []
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
router.post("/create-admin", AdminController.createAdmin)

/**
 * @swagger
 * /admin/update-admin-status:
 *   post:
 *     summary: Updates the status of an Admin
 *     description: Updates the status of an Admin. Must be logged in as Root to complete this action.
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
 * /admin/update-adviser-status:
 *   post:
 *     summary: Updates the status of an adviser
 *     description: Updates the status of an adviser
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
router.post("/update-adviser-status", verifyToken, isAdmin, AdminController.updateAdviserStatus)

/**
 * @swagger
 * /admin/get-new-applicants-with-paging/{page}/{page_size}:
 *   get:
 *     summary: Returns a paged list of new applicants (status = Pending_Approval)
 *     description: Returns a paged list of new applicants (status = Pending_Approval)
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
 *       - name: page_size
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
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
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-new-applicants-with-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getNewApplicantsWithPaging)

/**
 * @swagger
 * /admin/get-new-applicants:
 *   get:
 *     summary: Returns a list of advisers (status = Pending_Approval)
 *     description: Returns a list of advisers (status = Pending_Approval)
 *     security:
 *       - bearerAuth: []
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
 *                       $ref: '#/components/schemas/Applicant'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-new-applicants", verifyToken, isAdmin, AdminController.getNewApplicants)

/**
 * @swagger
 * /admin/get-advisers-with-paging/{page}/{page_size}:
 *   get:
 *     summary: Returns a paged list of advisers (vetted)
 *     description: Returns a paged list of advisers (vetted)
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
 *       - name: page_size
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
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
router.get("/get-advisers-with-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getAdvisersWithPaging)

/**
 * @swagger
 * /admin/get-advisers:
 *   get:
 *     summary: Returns a list of advisers (vetted)
 *     description: Returns a list of advisers (vetted)
 *     security:
 *       - bearerAuth: []
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
router.get("/get-advisers", verifyToken, isAdmin, AdminController.getAdvisers)

/**
 * @swagger
 * /admin/get-all-advisers-with-paging/{page}/{page_size}:
 *   get:
 *     summary: Returns a paged list of all advisers (vetted and applicants)
 *     description: Returns a paged list of all advisers (vetted and applicants)
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
 *       - name: page_size
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
router.get("/get-all-advisers-with-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getALLAdvisersWithPaging)

/**
 * @swagger
 * /admin/get-all-advisers:
 *   get:
 *     summary: Returns a list of advisers (vetted)
 *     description: Returns a list of advisers (vetted)
 *     security:
 *       - bearerAuth: []
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
router.get("/get-all-advisers", verifyToken, isAdmin, AdminController.getALLAdvisers)

/**
 * @swagger
 * /admin/get-events-with-condition-and-paging/{page}/{page_size}:
 *   post:
 *     summary: Returns a paged list of events
 *     description: Returns a paged list of events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Condition'
 *     parameters:
 *       - name: page
 *         in: path
 *         description: The page number. Defaults to 1 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 1
 *       - name: page_size
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
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
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.post("/get-events-with-condition-and-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getEventsWithConditionAndPaging)

/**
 * @swagger
 * /admin/get-events-with-condition:
 *   post:
 *     summary: Returns a list of events
 *     description: Returns a list of events
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
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.post("/get-events-with-condition", verifyToken, isAdmin, AdminController.getEventsWithCondition)

/**
 * @swagger
 * /admin/get-events/{page}/{page_size}:
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
 *       - name: page_size
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
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
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-events-with-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getEventsWithPaging)

/**
 * @swagger
 * /admin/get-events:
 *   get:
 *     summary: Returns a list of events
 *     description: Returns a list of events
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of events
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
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-events", verifyToken, isAdmin, AdminController.getEvents)

/**
 * @swagger
 * /admin/get-admins-with-condition-and-paging/{page}/{page_size}:
 *   post:
 *     summary: 
 *     description: 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Condition'
 *     parameters:
 *       - name: page
 *         in: path
 *         description: The page number. Defaults to 1 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 1
 *       - name: page_size
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
 *     responses:
 *       200:
 *         description: Returns a paged list of admins
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
 *                       $ref: '#/components/schemas/Admin'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.post("/get-admins-with-condition-and-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getAdminsWithConditionAndPaging)

/**
 * @swagger
 * /admin/get-admins-with-condition:
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
 *                       $ref: '#/components/schemas/Admin'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.post("/get-admins-with-condition", verifyToken, isAdmin, AdminController.getAdminsWithCondition)

/**
 * @swagger
 * /admin/get-admins/{page}/{page_size}:
 *   get:
 *     summary: Returns a paged list of admins
 *     description: Returns a paged list of admins
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
 *       - name: page_size
 *         in: path
 *         description: The number of items to display per page. Defaults to 25 if not provided.
 *         required: true
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 10
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
 *                 advisers:
 *                   type: array
 *                   advisers:
 *                     type: object
 *                     schema:
 *                       $ref: '#/components/schemas/Admin'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-admins-with-paging/:page/:page_size", verifyToken, isAdmin, AdminController.getAdminsWithPaging)

/**
 * @swagger
 * /admin/get-events:
 *   get:
 *     summary: Returns a list of events
 *     description: Returns a list of events
 *     security:
 *       - bearerAuth: []
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
 *                       $ref: '#/components/schemas/Admin'
 *       400:
 *         description: A client error occurred
 *       500:
 *         description: Server error
 */
router.get("/get-admins", verifyToken, isAdmin, AdminController.getAdmins)


router.post("/query-iprs", verifyToken, isAdmin, AdminController.queryIPRS)
router.post("/get-iprs-token", verifyToken, isAdmin, AdminController.getIPRSToken)

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