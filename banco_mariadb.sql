-- ============================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS MARIADB / MYSQL
-- SISTEMA PROFAC - GESTÃO DE FACTORING
-- Compatível com MariaDB 10.3+ / MySQL 8.0+
-- Charset: utf8mb4 (suporte completo a acentuação e emojis)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabela de Usuários
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` TEXT NOT NULL,
  `full_name` TEXT NOT NULL,
  `cnpj` VARCHAR(20) NOT NULL,
  `company_name` TEXT NOT NULL,
  `phone` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `role` VARCHAR(20) NOT NULL DEFAULT 'user',
  `require_password_change` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_login` DATETIME DEFAULT NULL,
  `login_count` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Clientes
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `cnpj` VARCHAR(20) DEFAULT NULL UNIQUE,
  `cpf` VARCHAR(20) DEFAULT NULL UNIQUE,
  `legal_name` TEXT DEFAULT NULL,
  `trade_name` TEXT DEFAULT NULL,
  `client_type` VARCHAR(10) NOT NULL DEFAULT 'pj',
  `phone` TEXT DEFAULT NULL,
  `mobile` TEXT DEFAULT NULL,
  `website` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `number` TEXT DEFAULT NULL,
  `complement` TEXT DEFAULT NULL,
  `neighborhood` TEXT DEFAULT NULL,
  `city` TEXT DEFAULT NULL,
  `state` TEXT DEFAULT NULL,
  `zip_code` TEXT DEFAULT NULL,
  `monthly_revenue` DECIMAL(15,2) DEFAULT NULL,
  `credit_limit` DECIMAL(15,2) DEFAULT NULL,
  `risk_rating` VARCHAR(20) DEFAULT 'medium',
  `account_manager` TEXT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  `contract_start_date` DATETIME DEFAULT NULL,
  `last_operation_date` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Downloads
CREATE TABLE IF NOT EXISTS `downloads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `version` VARCHAR(50) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` VARCHAR(50) NOT NULL,
  `release_date` DATETIME NOT NULL,
  `download_count` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_beta` BOOLEAN DEFAULT FALSE,
  `description` TEXT DEFAULT NULL,
  `change_log` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabela de Comentários / Depoimentos
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `rating` INT NOT NULL,
  `content` TEXT NOT NULL,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `is_renewed` BOOLEAN DEFAULT FALSE,
  `original_comment_id` INT DEFAULT NULL,
  `approved_by` INT DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `renewed_at` DATETIME DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `position` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabela de Mensagens de Contato
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabela de Faturas
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `invoice_number` VARCHAR(100) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `due_date` DATETIME NOT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabela de Boletos / Contas
CREATE TABLE IF NOT EXISTS `bills` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `bill_type` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `due_date` DATETIME NOT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabela de Funcionalidades
CREATE TABLE IF NOT EXISTS `features` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `is_new` BOOLEAN DEFAULT FALSE,
  `release_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_active` BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabela de Histórico de Versões
CREATE TABLE IF NOT EXISTS `version_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `content` TEXT NOT NULL,
  `updated_by` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tabela de Tickets de Suporte
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `priority` VARCHAR(20) NOT NULL DEFAULT 'medium',
  `status` VARCHAR(30) NOT NULL DEFAULT 'open',
  `assigned_to` INT DEFAULT NULL,
  `attachments` JSON DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `customer_email` VARCHAR(255) NOT NULL,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `estimated_resolution` DATETIME DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Tabela de Respostas dos Tickets
CREATE TABLE IF NOT EXISTS `ticket_replies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `content` TEXT NOT NULL,
  `is_internal` BOOLEAN DEFAULT FALSE,
  `attachments` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Tabela de Configuração de E-mail
CREATE TABLE IF NOT EXISTS `email_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `smtp_host` VARCHAR(255) NOT NULL,
  `smtp_port` INT NOT NULL,
  `smtp_secure` BOOLEAN DEFAULT TRUE,
  `smtp_user` VARCHAR(255) NOT NULL,
  `smtp_password` VARCHAR(255) NOT NULL,
  `from_email` VARCHAR(255) NOT NULL,
  `from_name` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Tabela de Configuração FTP
CREATE TABLE IF NOT EXISTS `ftp_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ftp_host` VARCHAR(255) NOT NULL,
  `ftp_port` INT DEFAULT 21,
  `ftp_user` VARCHAR(255) NOT NULL,
  `ftp_password` VARCHAR(255) NOT NULL,
  `ftp_secure` BOOLEAN DEFAULT FALSE,
  `download_path` VARCHAR(255) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Tabela de Selos de Segurança
CREATE TABLE IF NOT EXISTS `security_badge_configs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `selected_badges` JSON NOT NULL,
  `layout` VARCHAR(20) NOT NULL DEFAULT 'horizontal',
  `size` VARCHAR(10) NOT NULL DEFAULT 'sm',
  `show_tooltips` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_active` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Tabela de Convites por E-mail
CREATE TABLE IF NOT EXISTS `email_invitations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL,
  `invite_token` VARCHAR(255) NOT NULL UNIQUE,
  `sent_by` INT DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'sent',
  `click_count` INT DEFAULT 0,
  `first_clicked_at` DATETIME DEFAULT NULL,
  `last_clicked_at` DATETIME DEFAULT NULL,
  `registered_at` DATETIME DEFAULT NULL,
  `registered_user_id` INT DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`sent_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`registered_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Tabela de Estatísticas / Analytics (Page Views)
CREATE TABLE IF NOT EXISTS `page_views` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `path` VARCHAR(255) NOT NULL,
  `referrer` VARCHAR(255) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `ip_hash` VARCHAR(64) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `session_id` VARCHAR(100) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `region` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_page_views_created_at` (`created_at`),
  INDEX `idx_page_views_path` (`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
