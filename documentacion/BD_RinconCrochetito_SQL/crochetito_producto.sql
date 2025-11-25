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
-- Table structure for table `producto`
--

DROP TABLE IF EXISTS `producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `producto` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `precio` bigint DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '/img/no_producto.png',
  `destacado` tinyint(1) NOT NULL DEFAULT '0',
  `categoria_id` bigint DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activo` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_producto_categoria` (`categoria_id`),
  CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producto`
--

LOCK TABLES `producto` WRITE;
/*!40000 ALTER TABLE `producto` DISABLE KEYS */;
INSERT INTO `producto` VALUES (1,'Porta Encendedor/Labial Honguito','Funda a crochet en forma de hongo para encendedor o labial, con asa para colgar.',1500,10,'http://localhost:8080/uploads/9c0a052f-c243-47ff-a492-2407550c2033.png',1,1,'ACTIVO','2025-10-20 02:18:30',_binary ''),(2,'Cintillo Malla','Cintillo tejido en punto malla, cómodo y estiloso.',6000,15,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',1,2,'ACTIVO','2025-10-20 02:18:30',_binary ''),(3,'Posavasos Rosas','Set de posavasos tejidos en tonos rosados, 4 unidades.',7000,18,'http://localhost:8080/uploads/99d9a0d4-09c9-404b-9503-1f12dfdac6e6.png',1,3,'ACTIVO','2025-10-20 02:18:31',_binary ''),(4,'Gorro','Gorro tejido a crochet para adulto, ideal para invierno.',10000,10,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,2,'ACTIVO','2025-10-20 02:18:31',NULL),(5,'Bufanda Clásica','Bufanda larga y suave.',12000,8,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,2,'ACTIVO','2025-10-20 02:18:31',NULL),(6,'Amigurumi Zorro','Zorrito tierno hecho a mano.',15000,6,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,4,'ACTIVO','2025-10-20 02:18:31',NULL),(7,'Amigurumi Gatito','Gatito gris con bufanda.',15000,5,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,4,'ACTIVO','2025-10-20 02:18:31',NULL),(8,'Mantelito Círculos','Centro de mesa tejido.',13000,7,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,3,'ACTIVO','2025-10-20 02:18:31',NULL),(9,'Set Hogar Pastel','Pack deco en tonos pastel.',22000,3,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,5,'ACTIVO','2025-10-20 02:18:31',NULL),(10,'Llavero Flor','Flor de cinco pétalos.',3000,30,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,1,'ACTIVO','2025-10-20 02:18:31',NULL),(11,'Porta Audífonos','Mini bolso para audífonos.',5000,12,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,1,'ACTIVO','2025-10-20 02:18:31',NULL),(12,'Cojín Granny','Cojín con cuadrados granny.',18000,4,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,3,'ACTIVO','2025-10-20 02:18:31',_binary ''),(14,'Amigurumi Osito','Osito café con chaleco.',17000,5,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,4,'ACTIVO','2025-10-20 02:18:31',NULL),(15,'Set Bazar Rosado','Posavasos + mini flor.',16000,9,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,5,'ACTIVO','2025-10-20 02:18:31',NULL),(17,'Mitones','Mitones tejidos a crochet, abrigados y cómodos.',9000,10,'https://drive.google.com/uc?export=view&id=18qvVUNdvkBibj2sAZB1scdhQOq7PUVOp',0,2,'ACTIVO','2025-10-20 02:46:41',_binary '');
/*!40000 ALTER TABLE `producto` ENABLE KEYS */;
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
