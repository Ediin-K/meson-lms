-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: meson_lms
-- ------------------------------------------------------
-- Server version	8.0.45


--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
CREATE TABLE `assignment_submissions` (
                                          `id` bigint NOT NULL AUTO_INCREMENT,
                                          `nota` double DEFAULT NULL,
                                          `pershkrimi` text,
                                          `statusi` enum('DOREZUAR','VLERESUAR','VONUAR') NOT NULL,
                                          `submission_url` varchar(255) DEFAULT NULL,
                                          `submitted_at` datetime(6) NOT NULL,
                                          `assignment_id` bigint NOT NULL,
                                          `student_id` bigint NOT NULL,
                                          PRIMARY KEY (`id`),
                                          KEY `FKm7i7ubgh7y2n6mvg8muw62oax` (`assignment_id`),
                                          KEY `FKgf6lwnlqvnetehdftwcij7r5g` (`student_id`),
                                          CONSTRAINT `FKgf6lwnlqvnetehdftwcij7r5g` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
                                          CONSTRAINT `FKm7i7ubgh7y2n6mvg8muw62oax` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;

INSERT INTO `assignment_submissions` VALUES (1,95,'Ketu eshte kodi im','VLERESUAR','https://github.com/student/hello-world','2026-04-29 08:36:58.034255',1,6);

UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;

CREATE TABLE `assignments` (
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `created_at` datetime(6) NOT NULL,
                               `deadline` datetime(6) NOT NULL,
                               `pershkrimi` text,
                               `resource_url` varchar(255) DEFAULT NULL,
                               `statusi` enum('AKTIV','DRAFT','MBYLLUR') NOT NULL,
                               `titulli` varchar(255) NOT NULL,
                               `lesson_id` bigint NOT NULL,
                               PRIMARY KEY (`id`),
                               KEY `FKj6l7dcv3gjrabhqjqsdolg78l` (`lesson_id`),
                               CONSTRAINT `FKj6l7dcv3gjrabhqjqsdolg78l` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;

INSERT INTO `assignments` VALUES (1,'2026-04-29 08:36:40.367719','2026-05-30 21:59:00.000000','Shkruaj programin e pare ne Java','https://drive.google.com/file/example','AKTIV','Detyre 1 - Hello World',1);

UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;

CREATE TABLE `certificates` (
                                `id` bigint NOT NULL AUTO_INCREMENT,
                                `data_leshimit` datetime(6) NOT NULL,
                                `kodi_unik` varchar(255) NOT NULL,
                                `enrollment_id` bigint NOT NULL,
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `UKw1o5x1pgsgfxbyugvjj73vg` (`kodi_unik`),
                                UNIQUE KEY `UK21ynuw4yilrbsr1nhm5mb9lre` (`enrollment_id`),
                                CONSTRAINT `FKjy46ubyh2tf64mgos6jgpcx4u` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;

INSERT INTO `certificates` VALUES (1,'2026-04-29 07:34:36.945556','3980056d-5229-4445-8b4f-314c26a763ee',1);

UNLOCK TABLES;

--
-- Table structure for table `course_categories`
--

DROP TABLE IF EXISTS `course_categories`;

CREATE TABLE `course_categories` (
                                     `id` bigint NOT NULL AUTO_INCREMENT,
                                     `emertimi` varchar(255) NOT NULL,
                                     `pershkrimi` text,
                                     PRIMARY KEY (`id`),
                                     UNIQUE KEY `UKiwxw676rhpovadb7ue0jebxcy` (`emertimi`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `course_categories`
--

LOCK TABLES `course_categories` WRITE;

INSERT INTO `course_categories` VALUES (2,'Computer Science and Engineering','Covers programming, algorithms, computer systems, databases, networking, cloud computing, and cybersecurity');

UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;

CREATE TABLE `courses` (
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `cmimi` double NOT NULL,
                           `created_at` datetime(6) NOT NULL,
                           `niveli` enum('AVANCUAR','FILLESTAR','MESATAR','TE_GJITHA_NIVELET') DEFAULT NULL,
                           `pershkrimi` varchar(255) NOT NULL,
                           `statusi` enum('ARKIVUAR','DRAFT','PUBLIKUAR') DEFAULT NULL,
                           `titulli` varchar(255) NOT NULL,
                           `category_id` bigint DEFAULT NULL,
                           `teacher_id` bigint DEFAULT NULL,
                           `semester` int NOT NULL,
                           `enrollment_key` varchar(255) DEFAULT NULL,
                           PRIMARY KEY (`id`),
                           UNIQUE KEY `UKltwerti8iv1i7poax22is0c77` (`titulli`),
                           KEY `FKlrqjut8xtbtgs6h7uosddyut7` (`category_id`),
                           KEY `FKt4ba5fab1x56tmt4nsypv5lm5` (`teacher_id`),
                           CONSTRAINT `FKlrqjut8xtbtgs6h7uosddyut7` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`),
                           CONSTRAINT `FKt4ba5fab1x56tmt4nsypv5lm5` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
INSERT INTO `courses` VALUES (2,0,'2026-04-27 19:40:10.963199','FILLESTAR','OBL - Introduction to Computing & Programming','DRAFT','Introduction to Computing & Programming',2,8,1),(3,0,'2026-04-27 19:41:51.191087','FILLESTAR','OBL - Mathematics I','DRAFT','Mathematics I',2,8,1),(4,0,'2026-04-27 19:42:00.401702','FILLESTAR','OBL - Fundamentals of Electronic and Electric Engineering','DRAFT','Fundamentals of Electronic/Electric Engineering',2,8,1),(5,0,'2026-04-27 19:42:09.627428','FILLESTAR','OBL - Computer Architecture and Organisation','DRAFT','Computer Architecture and Organisation',2,8,1),(6,0,'2026-04-27 19:42:15.891119','FILLESTAR','OBL - Academic Writing and Seminar','DRAFT','Academic Writing and Seminar',2,8,1),(7,0,'2026-04-27 19:42:21.351598','FILLESTAR','OBL - English for Engineers','DRAFT','English for Engineers',2,8,1);

UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;

CREATE TABLE `enrollments` (
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `data_regjistrimit` datetime(6) NOT NULL,
                               `progresi` double DEFAULT NULL,
                               `statusi` enum('AKTIV','ANULUAR','PERFUNDUAR') NOT NULL,
                               `course_id` bigint NOT NULL,
                               `user_id` bigint NOT NULL,
                               PRIMARY KEY (`id`),
                               KEY `FKho8mcicp4196ebpltdn9wl6co` (`course_id`),
                               KEY `FK3hjx6rcnbmfw368sxigrpfpx0` (`user_id`),
                               CONSTRAINT `FK3hjx6rcnbmfw368sxigrpfpx0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
                               CONSTRAINT `FKho8mcicp4196ebpltdn9wl6co` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;

INSERT INTO `enrollments` VALUES (1,'2026-04-29 07:30:17.486179',0,'PERFUNDUAR',2,6),(2,'2026-05-04 07:19:40.029325',0,'AKTIV',3,6),(3,'2026-05-04 07:28:22.587258',0,'AKTIV',4,6);

UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;

CREATE TABLE `lessons` (
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `created_at` datetime(6) NOT NULL,
                           `lloji` enum('QUIZ','TEKST','VIDEO') NOT NULL,
                           `permbajtja` text,
                           `resource_url` varchar(255) DEFAULT NULL,
                           `rradhitja` int NOT NULL,
                           `titulli` varchar(255) NOT NULL,
                           `video_url` varchar(255) DEFAULT NULL,
                           `module_id` bigint NOT NULL,
                           PRIMARY KEY (`id`),
                           KEY `FKt9yjhjbd9y3w6fxs66ny1wu02` (`module_id`),
                           CONSTRAINT `FKt9yjhjbd9y3w6fxs66ny1wu02` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;

INSERT INTO `lessons` VALUES (1,'2026-04-29 07:04:28.468575','TEKST','Java është gjuhë programimi...',NULL,1,'Çfarë është Java?',NULL,2);

UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;

CREATE TABLE `modules` (
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `created_at` datetime(6) NOT NULL,
                           `pershkrimi` varchar(255) NOT NULL,
                           `rradhitja` int NOT NULL,
                           `titulli` varchar(255) NOT NULL,
                           `course_id` bigint NOT NULL,
                           PRIMARY KEY (`id`),
                           KEY `FK8qnnp812q1jd38fx7mxrhpw9` (`course_id`),
                           CONSTRAINT `FK8qnnp812q1jd38fx7mxrhpw9` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;

INSERT INTO `modules` VALUES (2,'2026-04-28 17:06:33.454707','Intro to course',1,'Module 1',2);

UNLOCK TABLES;

--
-- Table structure for table `quiz_answers`
--

DROP TABLE IF EXISTS `quiz_answers`;

CREATE TABLE `quiz_answers` (
                                `id` bigint NOT NULL AUTO_INCREMENT,
                                `eshte_sakte` bit(1) NOT NULL,
                                `pergjigja` varchar(255) NOT NULL,
                                `question_id` bigint NOT NULL,
                                PRIMARY KEY (`id`),
                                KEY `FKb69mwpkm3kehim0klscpmmkc1` (`question_id`),
                                CONSTRAINT `FKb69mwpkm3kehim0klscpmmkc1` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `quiz_answers`
--

LOCK TABLES `quiz_answers` WRITE;

INSERT INTO `quiz_answers` VALUES (1,_binary '','Gjuhe programimi',1);

UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;

CREATE TABLE `quiz_attempts` (
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `data` datetime(6) NOT NULL,
                                 `koha_sekondat` int NOT NULL,
                                 `pikete` double NOT NULL,
                                 `quiz_id` bigint NOT NULL,
                                 `user_id` bigint NOT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `FKfwipvfipnnwsoacoyv5k7fbxc` (`quiz_id`),
                                 KEY `FKpj4a9hw0iv1mo1ut6rppg594u` (`user_id`),
                                 CONSTRAINT `FKfwipvfipnnwsoacoyv5k7fbxc` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
                                 CONSTRAINT `FKpj4a9hw0iv1mo1ut6rppg594u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;

INSERT INTO `quiz_attempts` VALUES (1,'2026-04-29 07:49:26.793610',450,85,1,6),(2,'2026-05-04 06:56:23.142534',0,100,1,6);

UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;

CREATE TABLE `quiz_questions` (
                                  `id` bigint NOT NULL AUTO_INCREMENT,
                                  `lloji` enum('SHUMEFISHTE','TEXT','VERTET_GABIM') NOT NULL,
                                  `pyetja` text NOT NULL,
                                  `rradhitja` int NOT NULL,
                                  `quiz_id` bigint NOT NULL,
                                  PRIMARY KEY (`id`),
                                  KEY `FKanfmgf6ksbdnv7ojb0pfve54q` (`quiz_id`),
                                  CONSTRAINT `FKanfmgf6ksbdnv7ojb0pfve54q` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;

INSERT INTO `quiz_questions` VALUES (1,'SHUMEFISHTE','Cfare eshte Java?',1,1);

UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;

CREATE TABLE `quizzes` (
                           `id` bigint NOT NULL AUTO_INCREMENT,
                           `created_at` datetime(6) NOT NULL,
                           `kohezgjatja_minuta` int NOT NULL,
                           `titulli` varchar(255) NOT NULL,
                           `lesson_id` bigint NOT NULL,
                           PRIMARY KEY (`id`),
                           KEY `FKbdv8uggpsin6pnkx0d80ryqey` (`lesson_id`),
                           CONSTRAINT `FKbdv8uggpsin6pnkx0d80ryqey` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
INSERT INTO `quizzes` VALUES (1,'2026-04-29 07:48:53.034375',30,'Quiz 1',1);
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
                                  `id` bigint NOT NULL AUTO_INCREMENT,
                                  `created` datetime(6) NOT NULL,
                                  `expires` datetime(6) NOT NULL,
                                  `revoked` bit(1) NOT NULL,
                                  `token` text NOT NULL,
                                  `user_id` bigint NOT NULL,
                                  PRIMARY KEY (`id`),
                                  KEY `FK1lih5y2npsf8u5o3vhdb9y0os` (`user_id`),
                                  CONSTRAINT `FK1lih5y2npsf8u5o3vhdb9y0os` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
INSERT INTO `refresh_tokens` VALUES (1,'2026-04-23 07:42:03.421657','2026-04-30 07:42:03.421657',_binary '','6566be48-2678-4e0b-9374-9c25a904e561',6),(2,'2026-04-23 07:42:25.721490','2026-04-30 07:42:25.721490',_binary '','49329054-cc2e-49a9-bba4-633e3f3e6c83',6),(3,'2026-04-23 07:49:27.472734','2026-04-30 07:49:27.472734',_binary '','51e87f0d-a788-4fda-8166-01c57e52e5c2',6),(4,'2026-04-23 07:50:01.070647','2026-04-30 07:50:01.070647',_binary '','386e08f1-0ed5-4eea-a1f4-7a9afdf7faee',6),(5,'2026-04-23 18:18:35.534189','2026-04-30 18:18:35.534189',_binary '','85a6916c-dea0-4e3e-916e-8d02596e7171',6),(6,'2026-04-23 18:59:31.296506','2026-04-30 18:59:31.296506',_binary '','d80edf8b-8816-4235-b217-2404a1a32d65',6),(7,'2026-04-23 18:59:46.838195','2026-04-30 18:59:46.838195',_binary '','69e5fc80-1eff-488f-84c5-84b5c1ea12e5',6),(8,'2026-04-23 19:01:47.820146','2026-04-30 19:01:47.820146',_binary '','85385c79-9724-4fab-96ee-8858866a45d8',7),(9,'2026-04-23 19:02:58.271526','2026-04-30 19:02:58.271526',_binary '','9c6440ce-5912-4544-861e-aa8511a152d4',6),(10,'2026-04-23 19:04:52.675889','2026-04-30 19:04:52.675889',_binary '','4d266030-e364-4579-9a43-1d2ac2e341c4',6),(11,'2026-04-26 06:48:37.808637','2026-05-03 06:48:37.808637',_binary '','7e141ff8-baf9-4850-b8c0-7b273c7a6c99',7),(12,'2026-04-27 15:44:25.741415','2026-05-04 15:44:25.741415',_binary '','b8743b5d-1230-450b-b9b5-2f46312b2eac',6),(13,'2026-04-27 18:54:25.593466','2026-05-04 18:54:25.593466',_binary '','cce024e7-f316-47ae-a8c8-a81af4d8749d',7),(14,'2026-04-27 18:55:15.712530','2026-05-04 18:55:15.712530',_binary '','0c51978d-8d53-43f6-8d3e-55d8ad3d6bbb',6),(15,'2026-04-28 12:27:36.163482','2026-05-05 12:27:36.163482',_binary '','15050348-11f0-4928-92f3-57d1b8fb0c6f',7),(16,'2026-04-28 12:27:52.400525','2026-05-05 12:27:52.400525',_binary '','8329143f-63e0-4961-8526-33fd3d0fd8d8',6),(17,'2026-04-28 17:03:26.033770','2026-05-05 17:03:26.033770',_binary '','534e3b60-5304-4275-8b64-594bbb9b9c4f',6),(18,'2026-04-28 17:10:35.460206','2026-05-05 17:10:35.460206',_binary '','53c25346-adc8-4fbb-ad48-23bb2b503f32',7),(19,'2026-04-29 07:12:24.384136','2026-05-06 07:12:24.384136',_binary '','4a566e7f-3242-4c10-b7cc-a72c0b83cc6b',6),(20,'2026-04-29 07:30:05.628197','2026-05-06 07:30:05.628197',_binary '','4a04fe87-9942-46b3-9c32-f5b38b6d1e5a',6),(21,'2026-05-01 09:33:10.223997','2026-05-08 09:33:10.223997',_binary '','5eab4260-139b-4d05-919e-2bb8b53132dc',6),(22,'2026-05-01 16:01:14.485806','2026-05-08 16:01:14.485806',_binary '','a7ff40ae-a53b-4d4f-bc06-dff12427ba24',6),(23,'2026-05-01 16:01:26.217054','2026-05-08 16:01:26.217054',_binary '','a64492c8-331f-47b2-bc88-e900ed97c2b4',6),(24,'2026-05-01 16:12:16.918291','2026-05-08 16:12:16.918291',_binary '','d77f8a39-4d0c-4ad1-84a9-b4b520487c1d',6),(25,'2026-05-01 16:14:56.212416','2026-05-08 16:14:56.212416',_binary '','868beb73-8a7c-426c-9803-0dcc0d6bbcfb',6),(26,'2026-05-03 19:52:36.958678','2026-05-10 19:52:36.959812',_binary '','791c2994-ea9c-4689-bf28-94001df6aaeb',6),(27,'2026-05-04 06:49:28.074356','2026-05-11 06:49:28.074356',_binary '','a3c73743-bbf6-4a77-a49f-25ee47bcfd62',6),(28,'2026-05-04 06:50:51.027433','2026-05-11 06:50:51.027433',_binary '','16e40433-cc28-4211-af17-88718220c2c7',6),(29,'2026-05-04 06:54:17.728298','2026-05-11 06:54:17.728298',_binary '','cc97b8df-d4e4-491e-bfab-52efeca756c9',6),(30,'2026-05-04 06:55:13.631120','2026-05-11 06:55:13.631120',_binary '','2779dfa9-4190-4493-b1af-a0967617224e',6),(31,'2026-05-04 07:29:53.144292','2026-05-11 07:29:53.144292',_binary '\0','4a309880-8317-4aa1-9d54-30730feb70ab',6),(32,'2026-05-04 07:38:16.768449','2026-05-11 07:38:16.768449',_binary '\0','1a0b3449-0a65-40a8-b0e5-08d753a226a0',7);
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `emertimi` varchar(255) NOT NULL,
                         `normalized_name` varchar(255) NOT NULL,
                         `pershkrimi` varchar(255) DEFAULT NULL,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `UKsq9veqd4etd0mi9e7m7l50hjq` (`emertimi`),
                         UNIQUE KEY `UKsfqdnqeex27tyen4tf3c5aqof` (`normalized_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
INSERT INTO `roles` VALUES (1,'admin','ADMIN','Administratori i sistemit'),(2,'teacher','TEACHER','Instruktor i kurseve'),(3,'student','STUDENT','Student i kurseve'),(4,'prind','PARENT','Prind i studentit');
UNLOCK TABLES;

--
-- Table structure for table `user_claims`
--

DROP TABLE IF EXISTS `user_claims`;
CREATE TABLE `user_claims` (
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `claim_type` varchar(255) NOT NULL,
                               `claim_value` varchar(255) NOT NULL,
                               `user_id` bigint NOT NULL,
                               PRIMARY KEY (`id`),
                               KEY `FKlf30x2alc8v7039romm2exygh` (`user_id`),
                               CONSTRAINT `FKlf30x2alc8v7039romm2exygh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_claims`
--

LOCK TABLES `user_claims` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
                              `id` bigint NOT NULL AUTO_INCREMENT,
                              `role_id` bigint NOT NULL,
                              `user_id` bigint NOT NULL,
                              PRIMARY KEY (`id`),
                              KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
                              KEY `FKhfh9dx7w3ubf1co1vdev94g3f` (`user_id`),
                              CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
                              CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
INSERT INTO `user_roles` VALUES (4,3,6),(5,1,7),(6,2,8);
UNLOCK TABLES;

--
-- Table structure for table `user_tokens`
--

DROP TABLE IF EXISTS `user_tokens`;
CREATE TABLE `user_tokens` (
                               `id` bigint NOT NULL AUTO_INCREMENT,
                               `login_provider` varchar(255) NOT NULL,
                               `token_name` varchar(255) NOT NULL,
                               `token_value` text NOT NULL,
                               `user_id` bigint NOT NULL,
                               PRIMARY KEY (`id`),
                               KEY `FK61iiu6gfevpvo2v3yl76sar7r` (`user_id`),
                               CONSTRAINT `FK61iiu6gfevpvo2v3yl76sar7r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_tokens`
--

LOCK TABLES `user_tokens` WRITE;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `access_failed_count` int NOT NULL,
                         `data_krijimit` datetime(6) NOT NULL,
                         `email` varchar(255) NOT NULL,
                         `email_confirmed` bit(1) NOT NULL,
                         `emri` varchar(255) NOT NULL,
                         `lockout_enable` bit(1) NOT NULL,
                         `mbiemri` varchar(255) NOT NULL,
                         `password_hash` varchar(255) NOT NULL,
                         `phone_number` varchar(255) DEFAULT NULL,
                         `statusi` varchar(255) NOT NULL,
                         `lockout_enabled` bit(1) NOT NULL,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (6,0,'2026-04-17 13:51:09.431824','student@gmail.com',_binary '\0','Student',_binary '\0','Test','$2a$10$0zYNp.4yh/LatDQ4MYbhJ.NSOfvulZIAFD3vgLlBt2uO8OYuJkNlC',NULL,'active',_binary '\0'),(7,0,'2026-04-17 13:52:02.553509','admin@gmail.com',_binary '\0','Admin',_binary '\0','Test','$2a$10$Rcv.mZrq6JFck8cuCp9t0ebzt/rQC5nYmJD4mk556d3jF3jom0uJC',NULL,'active',_binary '\0'),(8,0,'2026-04-17 13:53:36.139904','prof@gmail.com',_binary '\0','Prof',_binary '\0','Test','$2a$10$rtHyhx5hJu3EbSpEfBnDne9XDh63HTQq6V59P2ZEpDj6PMNG4.6xC',NULL,'active',_binary '\0'),(9,0,'2026-04-17 13:54:40.350554','prind@gmail.com',_binary '\0','Prind',_binary '\0','Test','$2a$10$iE3kOrg2MpDu8fsl7L0qlOJGx/4MR5lJdu41IH/VxEM6/bq0O7DIC',NULL,'active',_binary '\0');
UNLOCK TABLES;


-- Dump completed on 2026-05-04 17:46:09
