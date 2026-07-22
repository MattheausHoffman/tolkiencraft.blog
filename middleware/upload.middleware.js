import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imageDirectory = path.join(projectRoot, 'assets/uploads/images');
const fileDirectory = path.join(projectRoot, 'assets/uploads/files');

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);
const FILE_EXTENSIONS = new Set(['.pdf', '.zip', '.txt', '.doc', '.docx', '.xls', '.xlsx']);

const EXTENSIONS = new Map([
  ['image/jpeg', '.jpg'], ['image/jpg', '.jpg'], ['image/png', '.png'], ['image/webp', '.webp'], ['image/gif', '.gif'],
  ['application/pdf', '.pdf'], ['application/zip', '.zip'], ['application/x-zip-compressed', '.zip'],
  ['text/plain', '.txt'], ['application/msword', '.doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.ms-excel', '.xls'],
  ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx']
]);

function isAllowedFile(file) {
  if (IMAGE_MIME_TYPES.has(file.mimetype) || FILE_MIME_TYPES.has(file.mimetype)) return true;
  return file.mimetype === 'application/octet-stream' && FILE_EXTENSIONS.has(path.extname(file.originalname).toLowerCase());
}

const storage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, IMAGE_MIME_TYPES.has(file.mimetype) ? imageDirectory : fileDirectory);
  },
  filename(request, file, callback) {
    const extension = EXTENSIONS.get(file.mimetype) || path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${randomBytes(12).toString('hex')}${extension}`);
  }
});

export const uploadPublicationFile = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter(request, file, callback) {
    if (isAllowedFile(file)) {
      callback(null, true);
      return;
    }
    callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'arquivo'));
  }
}).single('arquivo');

export function mediaTypeFromMime(mimeType) {
  return IMAGE_MIME_TYPES.has(mimeType) ? 'image' : 'file';
}
