import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject category is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

const Course = mongoose.model('Course', CourseSchema);
export default Course;