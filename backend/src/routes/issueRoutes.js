import express from 'express';
const router = express.Router();
import { authenticateToken } from '../middleware/authMiddleware.js';
import { 
    getAllIssues,
    createIssue,
    updateIssue,
    getIssueById,
    deleteIssue,
    clearResolvedIssues
} from '../controller/issueController.js';

router.get('/:creator_id/:repo_name', authenticateToken, getAllIssues);
router.post('/:creator_id/:repo_name/create', authenticateToken, createIssue);
router.get('/:creator_id/:repo_name/:issue_id', authenticateToken, getIssueById);
router.put('/:creator_id/:repo_name/:issue_id', authenticateToken, updateIssue);
router.delete('/:creator_id/:repo_name/clear-resolved', authenticateToken, clearResolvedIssues);
router.delete('/:creator_id/:repo_name/:issue_id', authenticateToken, deleteIssue);

export default router;