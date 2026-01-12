const { Router } = require('express');
const { approveSubject, approveSubjectById, rejectSubjectById, deleteSubjectByScholar, getAllScholarSubjects, getScholarSubjectsStatus, requestSubject, getAllScholarSubjectsAdmin } = require('../controller/scholarSubjectController');
const { authMiddleware } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roles');

const scholarSubjectRouter = Router();

scholarSubjectRouter.post('/', authMiddleware, authorizeRoles("Scholar"), requestSubject);
scholarSubjectRouter.post('/approve', authMiddleware, authorizeRoles("Admin"), approveSubject);
scholarSubjectRouter.put('/approve/:id', authMiddleware, authorizeRoles("Admin"), approveSubjectById);
scholarSubjectRouter.delete('/my/:id', authMiddleware, authorizeRoles("Scholar"), deleteSubjectByScholar);
scholarSubjectRouter.delete('/:id', authMiddleware, authorizeRoles("Admin"), rejectSubjectById);
scholarSubjectRouter.get('/status', authMiddleware, authorizeRoles("Scholar"), getScholarSubjectsStatus);
scholarSubjectRouter.get('/by-user', authMiddleware, authorizeRoles("Scholar"), getAllScholarSubjects);
scholarSubjectRouter.get('/all', authMiddleware, authorizeRoles("Admin"), getAllScholarSubjectsAdmin);

module.exports = scholarSubjectRouter;
