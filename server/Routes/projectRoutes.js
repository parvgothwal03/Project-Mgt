import express from 'express'
import { createProject, updateProject, addMember, deleteProject } from '../controllers/projectController.js'
const projectRouter = express.Router();

projectRouter.post('/', createProject);
projectRouter.put('/', updateProject);
projectRouter.post('/:projectId/addMember', addMember);
projectRouter.delete('/:projectId', deleteProject);

export default projectRouter;