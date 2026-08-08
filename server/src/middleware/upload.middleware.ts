import multer from 'multer';

// memory storage keeps the file as a buffer/stream in req.file, no local disk write
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cap — adjust as needed
});