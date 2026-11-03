-- Esquema relacional de StockManager para MySQL 8.0+.
-- En una instalación Django, ejecutar las migraciones es la fuente operativa
-- del esquema: python manage.py migrate

USE stockmanager_db;

CREATE TABLE `inventario_categoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventario_categoria_nombre_uniq` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventario_proveedor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `contacto` varchar(150) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `activo` tinyint(1) NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inventario_proveedor_nombre_uniq` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios_usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_usuario_email_uniq` (`email`),
  UNIQUE KEY `usuarios_usuario_username_uniq` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventario_material` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `ubicacion` varchar(100) NOT NULL,
  `cantidad_actual` int unsigned NOT NULL,
  `stock_minimo` int unsigned NOT NULL,
  `creado_en` datetime(6) NOT NULL,
  `categoria_id` bigint NULL,
  `proveedor_id` bigint NULL,
  PRIMARY KEY (`id`),
  KEY `material_categoria_idx` (`categoria_id`),
  KEY `material_proveedor_idx` (`proveedor_id`),
  CONSTRAINT `material_categoria_fk` FOREIGN KEY (`categoria_id`) REFERENCES `inventario_categoria` (`id`) ON DELETE SET NULL,
  CONSTRAINT `material_proveedor_fk` FOREIGN KEY (`proveedor_id`) REFERENCES `inventario_proveedor` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pedidos_pedido` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `producto` varchar(120) NOT NULL,
  `cantidad` int unsigned NOT NULL,
  `proveedor` varchar(120) NULL,
  `urgencia` varchar(10) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha` date NOT NULL,
  `observaciones` longtext NOT NULL,
  `solicitante_nombre` varchar(150) NOT NULL,
  `comentario_resolucion` longtext NOT NULL,
  `comentario_ingreso` longtext NOT NULL,
  `material_id` bigint NOT NULL,
  `solicitante_id` bigint NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_material_idx` (`material_id`),
  KEY `pedido_solicitante_idx` (`solicitante_id`),
  CONSTRAINT `pedido_material_fk` FOREIGN KEY (`material_id`) REFERENCES `inventario_material` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pedido_solicitante_fk` FOREIGN KEY (`solicitante_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auditoria_registroauditoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `material_nombre` varchar(120) NOT NULL,
  `tipo` varchar(11) NOT NULL,
  `cantidad` int unsigned NOT NULL,
  `stock_anterior` int unsigned NOT NULL,
  `stock_nuevo` int unsigned NOT NULL,
  `fecha` date NOT NULL,
  `fecha_hora` datetime(6) NULL,
  `observacion` longtext NOT NULL,
  `material_id` bigint NULL,
  `usuario_id` bigint NULL,
  PRIMARY KEY (`id`),
  KEY `auditoria_material_idx` (`material_id`),
  KEY `auditoria_usuario_idx` (`usuario_id`),
  CONSTRAINT `auditoria_material_fk` FOREIGN KEY (`material_id`) REFERENCES `inventario_material` (`id`) ON DELETE SET NULL,
  CONSTRAINT `auditoria_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tablas auxiliares creadas por las aplicaciones estándar de Django.
CREATE TABLE `django_content_type` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_model_uniq` (`app_label`, `model`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_permission` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` bigint NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_codename_uniq` (`content_type_id`, `codename`),
  CONSTRAINT `auth_permission_content_type_fk` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_group` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_name_uniq` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_permission_uniq` (`group_id`, `permission_id`),
  CONSTRAINT `auth_group_permissions_group_fk` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE CASCADE,
  CONSTRAINT `auth_group_permissions_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios_usuario_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `group_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_usuario_groups_usuario_group_uniq` (`usuario_id`, `group_id`),
  CONSTRAINT `usuario_groups_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_groups_group_fk` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuarios_usuario_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint NOT NULL,
  `permission_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_usuario_user_permissions_usuario_permission_uniq` (`usuario_id`, `permission_id`),
  CONSTRAINT `usuario_permissions_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuario_permissions_permission_fk` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_idx` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `django_admin_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` bigint NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_idx` (`content_type_id`),
  KEY `django_admin_log_user_idx` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_fk` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`) ON DELETE SET NULL,
  CONSTRAINT `django_admin_log_user_fk` FOREIGN KEY (`user_id`) REFERENCES `usuarios_usuario` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
