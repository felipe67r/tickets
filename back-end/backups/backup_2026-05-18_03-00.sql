/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.3-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: sistema
-- ------------------------------------------------------
-- Server version	11.8.3-MariaDB-0+deb13u1 from Debian

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `relatorio`
--

DROP TABLE IF EXISTS `relatorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `relatorio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tipo` varchar(10) DEFAULT NULL,
  `data_referencia` date DEFAULT NULL,
  `total_emitidas` int(11) DEFAULT NULL,
  `total_atendidas` int(11) DEFAULT NULL,
  `emitidas_sp` int(11) DEFAULT NULL,
  `atendidas_sp` int(11) DEFAULT NULL,
  `emitidas_sg` int(11) DEFAULT NULL,
  `atendidas_sg` int(11) DEFAULT NULL,
  `emitidas_se` int(11) DEFAULT NULL,
  `atendidas_se` int(11) DEFAULT NULL,
  `tempo_medio_sp` decimal(5,2) DEFAULT NULL,
  `tempo_medio_sg` decimal(5,2) DEFAULT NULL,
  `tempo_medio_se` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relatorio`
--

LOCK TABLES `relatorio` WRITE;
/*!40000 ALTER TABLE `relatorio` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `relatorio` VALUES
(1,'diario','2025-04-27',2,2,0,0,2,2,0,0,NULL,0.00,NULL),
(2,'mensal','2025-04-27',2,2,0,0,2,2,0,0,NULL,0.00,NULL);
/*!40000 ALTER TABLE `relatorio` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `senha`
--

DROP TABLE IF EXISTS `senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `senha` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `codigo_senha` varchar(20) DEFAULT NULL,
  `tipo_codigo` varchar(2) DEFAULT NULL,
  `data_emissao` date DEFAULT NULL,
  `hora_emissao` time DEFAULT NULL,
  `foi_atendida` tinyint(1) DEFAULT 0,
  `guiche_numero` int(11) DEFAULT NULL,
  `hora_atendimento` time DEFAULT NULL,
  `data_atendimento` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_senha` (`codigo_senha`),
  KEY `tipo_codigo` (`tipo_codigo`)
) ENGINE=MyISAM AUTO_INCREMENT=483 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `senha`
--

LOCK TABLES `senha` WRITE;
/*!40000 ALTER TABLE `senha` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `senha` VALUES
(476,'260514-SP001','SP','2026-05-14','19:15:44',1,1,'19:40:26','2026-05-14'),
(477,'260514-SG001','SG','2026-05-14','19:40:22',1,2,'19:40:28','2026-05-14'),
(478,'260514-SG002','SG','2026-05-14','19:40:22',1,7,'19:41:49','2026-05-14'),
(479,'260514-SP002','SP','2026-05-14','19:40:38',1,3,'19:40:53','2026-05-14'),
(480,'260514-SE001','SE','2026-05-14','19:40:39',1,4,'19:40:55','2026-05-14'),
(481,'260514-SE002','SE','2026-05-14','19:41:38',1,6,'19:41:47','2026-05-14'),
(482,'260514-SP003','SP','2026-05-14','19:41:39',1,5,'19:41:43','2026-05-14');
/*!40000 ALTER TABLE `senha` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `tipo_senha`
--

DROP TABLE IF EXISTS `tipo_senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_senha` (
  `codigo` varchar(2) NOT NULL,
  `descricao` varchar(50) DEFAULT NULL,
  `tempo_medio_minutos` int(11) DEFAULT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_senha`
--

LOCK TABLES `tipo_senha` WRITE;
/*!40000 ALTER TABLE `tipo_senha` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `tipo_senha` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `usuarios` VALUES
(1,'jonatas gonçalves','jonatas2044@gmail.com','$2b$10$Hq2w.Fnn6QlGSgN.9yhTWOLOYWxr02kqFHPkTJI9Fh57H8Z.qaZzS'),
(2,'jonatas gonçalves','jonatas2344@gmail.com','$2b$10$saQSacNeYU8ZLIA3dyTTSOckpvUz74fuBwo2PXsY5bwNLubGkv0nu'),
(3,'vitoria','ana@gmai.com','$2b$10$bzkSUuaUyQwFxOsW4.tzxemMY93trTea.I9AcjTwg24QNPlEw0IY.'),
(4,'flavin','flavin@hotmail.com','$2b$10$v2ZQMcuNm3BQfEai0IjFQemnxNm0e0a1tE3tFYoYAm3VBUQdyYcqW');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-05-18  0:00:00
