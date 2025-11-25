-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: crochetito
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('CLIENTE','SUPERADMIN','VENDEDOR') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `uk_usuarios_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Admin Crochetito','admin@crochetito.cl','$2b$12$QHtgsEWXAV5FGB3gBrv38OECqHJvnw69387IQBUCi.jR2KSKarh.q','SUPERADMIN','ACTIVO','2025-10-20 02:08:36'),(2,'Alonso','alonso@crochetito.cl','$2a$10$vfGsRv7H1dlLFyHmNdGF9OnOafCsxeNFTHIA3LpEBIbGSeq9Pk8vy','VENDEDOR','ACTIVO','2025-10-22 04:21:20'),(4,'Emilia','emilia@gmail.com','$2a$10$ABCDT9BVqX1.SuFTLP57z.n5zxzVyRyP063Bs0fNVGQsAg31QNS/C','CLIENTE','INACTIVO','2025-10-22 04:23:10'),(5,'test','test@gmail.com','$2a$10$xlkDIlne6CjDTp7e.JGvAegk0Bfj4VsyKsEOF3zM42KWN8cjGUgD.','CLIENTE','ACTIVO','2025-10-22 04:25:07'),(6,'cachupin','cachupin@gmail.com','$2a$10$a5gqb2O90QCHhj1ee9ShMeUUvrfRC1QaxKBJ11hx4YCktLeHGzg26','CLIENTE','ACTIVO','2025-10-27 12:29:29'),(7,'Admin 2','admin2@crochetito.cl','$2b$12$QHtgsEWXAV5FGB3gBrv38OECqHJvnw69387IQBUCi.jR2KSKarh.q','SUPERADMIN','ACTIVO','2025-11-24 20:59:25');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-25  0:08:48
