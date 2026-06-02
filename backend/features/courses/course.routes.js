import express from 'express';
import { 
  createCourse, 
  getAllCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse 
} from './course.controller.js';

const router = express.Router();

// Group routes sharing the root path '/'
router.route('/')
  .post(createCourse)
  .get(getAllCourses);

// Group routes sharing '/:id'
router.route('/:id')
  .get(getCourseById)
  .patch(updateCourse)
  .delete(deleteCourse);

export default router;