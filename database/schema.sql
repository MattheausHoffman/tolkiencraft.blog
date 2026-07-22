CREATE DATABASE IF NOT EXISTS admin_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE admin_system;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

INSERT INTO admins (id, nome, email, senha)
VALUES (
  1,
  'ADMIN',
  'Mattheaus.hoffman@gmail.com',
  '$2b$12$tDtK89VER86/J84OmoRwWuvumcYfEDW2GlXGjvsfP.wMS93WJTRRy'
)
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  email = VALUES(email);
