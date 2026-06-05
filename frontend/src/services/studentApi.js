import api from './api';

/**
 * Fetch all courses
 * GET /courses
 * Returns array of { _id, title, description, subject, thumbnailUrl }
 */
export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

/**
 * Fetch chapters for a given courseId
 * GET /chapters/:courseId
 * Returns array of { _id, title, sortOrder }
 */
export const getChapters = async (courseId) => {
  const response = await api.get(`/chapters/${courseId}`);
  return response.data;
};

/**
 * Fetch lectures for a given chapterId
 * GET /lectures/:chapterId
 * Returns array of { _id, title, videoUrl, chapter }
 */
export const getLectures = async (chapterId) => {
  const response = await api.get(`/lectures/${chapterId}`);
  return response.data;
};

/**
 * Fetch notes for a given chapterId
 * GET /notes/:chapterId
 * Returns array of { _id, title, description, fileId, fileUrl, downloadUrl, chapter }
 */
export const getNotes = async (chapterId) => {
  const response = await api.get(`/notes/${chapterId}`);
  return response.data;
};

