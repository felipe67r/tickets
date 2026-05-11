CREATE DATABASE  IF NOT EXISTS `sistema` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sistema`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema
-- ------------------------------------------------------
-- Server version	9.1.0

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
-- Table structure for table `relatorio`
--

DROP TABLE IF EXISTS `relatorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relatorio` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo` varchar(10) DEFAULT NULL,
  `data_referencia` date DEFAULT NULL,
  `total_emitidas` int DEFAULT NULL,
  `total_atendidas` int DEFAULT NULL,
  `emitidas_sp` int DEFAULT NULL,
  `atendidas_sp` int DEFAULT NULL,
  `emitidas_sg` int DEFAULT NULL,
  `atendidas_sg` int DEFAULT NULL,
  `emitidas_se` int DEFAULT NULL,
  `atendidas_se` int DEFAULT NULL,
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
INSERT INTO `relatorio` VALUES (1,'diario','2025-04-27',2,2,0,0,2,2,0,0,NULL,0.00,NULL),(2,'mensal','2025-04-27',2,2,0,0,2,2,0,0,NULL,0.00,NULL);
/*!40000 ALTER TABLE `relatorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `senha`
--

DROP TABLE IF EXISTS `senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `senha` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `codigo_senha` varchar(20) DEFAULT NULL,
  `tipo_codigo` varchar(2) DEFAULT NULL,
  `data_emissao` date DEFAULT NULL,
  `hora_emissao` time DEFAULT NULL,
  `foi_atendida` tinyint(1) DEFAULT '0',
  `guiche_numero` int DEFAULT NULL,
  `hora_atendimento` time DEFAULT NULL,
  `data_atendimento` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_senha` (`codigo_senha`),
  KEY `tipo_codigo` (`tipo_codigo`)
) ENGINE=MyISAM AUTO_INCREMENT=433 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `senha`
--

LOCK TABLES `senha` WRITE;
/*!40000 ALTER TABLE `senha` DISABLE KEYS */;
/*!40000 ALTER TABLE `senha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_senha`
--

DROP TABLE IF EXISTS `tipo_senha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_senha` (
  `codigo` varchar(2) NOT NULL,
  `descricao` varchar(50) DEFAULT NULL,
  `tempo_medio_minutos` int DEFAULT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_senha`
--

LOCK TABLES `tipo_senha` WRITE;
/*!40000 ALTER TABLE `tipo_senha` DISABLE KEYS */;
/*!40000 ALTER TABLE `tipo_senha` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-28 10:23:50
