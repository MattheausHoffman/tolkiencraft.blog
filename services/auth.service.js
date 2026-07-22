import bcrypt from 'bcrypt';
import { findAdminByEmail } from '../models/admin.model.js';

const DUMMY_PASSWORD_HASH = '$2b$12$2z7ZJ10JpIju6q4WJxIG8uQ4JjKDS6EZouWtqOwnl4hS9nmnKK/kC';

export async function authenticateAdmin(email, password) {
  const admin = await findAdminByEmail(email);
  const passwordHash = admin?.senha || DUMMY_PASSWORD_HASH;
  const passwordMatches = await bcrypt.compare(password, passwordHash);

  if (!admin || !passwordMatches) return null;

  return Object.freeze({
    id: admin.id,
    nome: admin.nome,
    email: admin.email
  });
}
