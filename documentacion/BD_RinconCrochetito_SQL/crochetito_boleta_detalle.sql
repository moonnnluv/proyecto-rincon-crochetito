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
-- Table structure for table `boleta_detalle`
--

DROP TABLE IF EXISTS `boleta_detalle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boleta_detalle` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int DEFAULT NULL,
  `precio_unitario` bigint DEFAULT NULL,
  `subtotal` bigint DEFAULT NULL,
  `boleta_id` bigint DEFAULT NULL,
  `producto_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhbg1h2a502s3h35hddoe9kg0d` (`boleta_id`),
  KEY `FK2mdwj8aqyy7lxu91257ocwpie` (`producto_id`),
  CONSTRAINT `FK2mdwj8aqyy7lxu91257ocwpie` FOREIGN KEY (`producto_id`) REFERENCES `producto` (`id`),
  CONSTRAINT `FKhbg1h2a502s3h35hddoe9kg0d` FOREIGN KEY (`boleta_id`) REFERENCES `boleta` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boleta_detalle`
--

LOCK TABLES `boleta_detalle` WRITE;
/*!40000 ALTER TABLE `boleta_detalle` DISABLE KEYS */;
INSERT INTO `boleta_detalle` VALUES (1,10,1500,15000,1,1),(2,1,6000,6000,1,2),(3,1,16000,16000,1,15),(4,10,1500,15000,2,1),(5,2,6000,12000,3,2),(6,10,1500,15000,4,1),(7,15,6000,90000,5,2),(8,4,1500,6000,6,1),(9,5,1500,7500,7,1),(10,15,6000,90000,8,2),(11,6,1500,9000,9,1),(12,5,1500,7500,10,1),(13,4,1500,6000,11,1),(14,5,1500,7500,12,1),(15,4,1500,6000,13,1),(16,1,1500,1500,14,1),(17,1,1500,1500,15,1),(18,2,7000,14000,16,3),(19,1,1500,1500,17,1),(20,1,1500,1500,18,1);
/*!40000 ALTER TABLE `boleta_detalle` ENABLE KEYS */;
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
