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

CREATE TABLE IF NOT EXISTS app_migrations (
  migration_key VARCHAR(190) NOT NULL PRIMARY KEY,
  executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(190) NOT NULL UNIQUE,
  summary VARCHAR(500) NOT NULL,
  cover_image_url VARCHAR(500) NULL,
  cover_image_alt VARCHAR(255) NULL,
  author VARCHAR(100) NOT NULL,
  author_admin_id INT NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  display_order INT NOT NULL DEFAULT 0,
  previous_publication_id INT NULL,
  next_publication_id INT NULL,
  seo_title VARCHAR(180) NULL,
  meta_description VARCHAR(320) NULL,
  meta_keywords VARCHAR(500) NULL,
  og_title VARCHAR(180) NULL,
  og_description VARCHAR(320) NULL,
  og_image_url VARCHAR(500) NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_publications_author FOREIGN KEY (author_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  CONSTRAINT fk_publications_previous FOREIGN KEY (previous_publication_id) REFERENCES publications(id) ON DELETE SET NULL,
  CONSTRAINT fk_publications_next FOREIGN KEY (next_publication_id) REFERENCES publications(id) ON DELETE SET NULL,
  INDEX idx_publications_status_order (status, display_order, published_at),
  INDEX idx_publications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS publication_blocks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  publication_id INT NOT NULL,
  block_type VARCHAR(40) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  block_data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_publication_blocks_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE,
  UNIQUE KEY uq_publication_block_position (publication_id, position),
  INDEX idx_publication_blocks_type (block_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS media_files (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  publication_id INT NULL,
  uploaded_by_admin_id INT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL UNIQUE,
  public_url VARCHAR(500) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  media_type ENUM('image', 'file') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_publication FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE SET NULL,
  CONSTRAINT fk_media_admin FOREIGN KEY (uploaded_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_media_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS reinos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(190) NOT NULL UNIQUE,
  imagem VARCHAR(500) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  racas VARCHAR(255) NOT NULL,
  lideranca VARCHAR(150) NOT NULL,
  descricao VARCHAR(100) NOT NULL,
  ordem_exibicao INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reinos_status_order (status, ordem_exibicao, nome),
  INDEX idx_reinos_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  descricao VARCHAR(25) NOT NULL DEFAULT '',
  mes TINYINT UNSIGNED NOT NULL,
  dia_inicial TINYINT UNSIGNED NULL,
  dia_final TINYINT UNSIGNED NULL,
  ano SMALLINT UNSIGNED NOT NULL,
  ordem_exibicao INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_eventos_mes CHECK (mes BETWEEN 1 AND 12),
  CONSTRAINT chk_eventos_dia_inicial CHECK (dia_inicial IS NULL OR dia_inicial BETWEEN 1 AND 31),
  CONSTRAINT chk_eventos_dia_final CHECK (dia_final IS NULL OR dia_final BETWEEN 1 AND 31),
  CONSTRAINT chk_eventos_intervalo CHECK (dia_final IS NULL OR (dia_inicial IS NOT NULL AND dia_final >= dia_inicial)),
  INDEX idx_eventos_calendar (ano, mes, dia_inicial, ordem_exibicao, id),
  INDEX idx_eventos_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS kingdom_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kingdom_id INT NOT NULL UNIQUE,
  seo_title VARCHAR(180) NULL,
  meta_description VARCHAR(320) NULL,
  meta_keywords VARCHAR(500) NULL,
  og_title VARCHAR(180) NULL,
  og_description VARCHAR(320) NULL,
  og_image_url VARCHAR(500) NULL,
  updated_by_admin_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_kingdom_pages_kingdom FOREIGN KEY (kingdom_id) REFERENCES reinos(id) ON DELETE CASCADE,
  CONSTRAINT fk_kingdom_pages_admin FOREIGN KEY (updated_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_kingdom_pages_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS kingdom_page_blocks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  kingdom_page_id INT NOT NULL,
  block_type VARCHAR(40) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  block_data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_kingdom_page_blocks_page FOREIGN KEY (kingdom_page_id) REFERENCES kingdom_pages(id) ON DELETE CASCADE,
  UNIQUE KEY uq_kingdom_page_block_position (kingdom_page_id, position),
  INDEX idx_kingdom_page_blocks_type (block_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO kingdom_pages (kingdom_id)
SELECT id FROM reinos
ON DUPLICATE KEY UPDATE kingdom_id = VALUES(kingdom_id);
