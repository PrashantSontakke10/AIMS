// Note: Relative imports in Node.js ES Modules require the file extension (.js)
import Course from './course.model.js';

// ✅ 1. Create Course (POST /courses)
export const createCourse = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, subject, isActive } = req.body;
    
    const newCourse = new Course({ title, description, thumbnailUrl, subject, isActive });
    await newCourse.save();
    
    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ 2. Get All Courses (GET /courses)
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3. Get Single Course (GET /courses/:id)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid Course ID format' });
  }
};

// ✅ 4. Update Course (PATCH /courses/:id)
export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ 5. Delete Course (DELETE /courses/:id)
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, message: 'Course successfully deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};