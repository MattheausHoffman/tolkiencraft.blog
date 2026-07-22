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
