/*
SQLyog 
MySQL - 5.6.26 : Database - jscity
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`jscity` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `jscity`;

/*Table structure for table `tb_building` */

DROP TABLE IF EXISTS `tb_building`;

CREATE TABLE `tb_building` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `height` int(11) unsigned NOT NULL DEFAULT '0',
  `width` int(11) unsigned NOT NULL DEFAULT '0',
  `color` varchar(10) NOT NULL,
  `tooltip` varchar(255) NOT NULL,
  `district_id` int(11) DEFAULT NULL,
  `building_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fk_tb_construction_tb_district1` (`district_id`),
  KEY `idx_fk_tb_building_tb_building1_idx` (`building_id`),
  CONSTRAINT `fk_tb_building_tb_building1` FOREIGN KEY (`building_id`) REFERENCES `tb_building` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tb_construction_tb_district1` FOREIGN KEY (`district_id`) REFERENCES `tb_district` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

/*Data for the table `tb_building` */

insert  into `tb_building`(`id`,`name`,`height`,`width`,`color`,`tooltip`,`district_id`,`building_id`) values (1,'A',27,25,'0x337AB7','A, LOC: 27 [28-54]',1,NULL),(2,'Anonymous function',29,5,'0x4CAE4C','Anonymous function, LOC: 29 [56-84]',1,NULL),(3,'C',12,2,'0x337AB7','C, LOC: 12 [57-68]',NULL,2),(4,'B',8,2,'0x337AB7','B, LOC: 8 [70-77]',NULL,2),(5,'C',12,2,'0x337AB7','C, LOC: 12 [28-39]',4,NULL),(6,'B',11,3,'0x337AB7','B, LOC: 11 [41-51]',4,NULL),(7,'Anonymous function',12,2,'0x4CAE4C','Anonymous function, LOC: 12 [59-70]',4,NULL),(8,'Anonymous function',11,3,'0x4CAE4C','Anonymous function, LOC: 11 [72-82]',4,NULL),(9,'C',12,2,'0x337AB7','C, LOC: 12 [28-39]',5,NULL),(10,'B',11,3,'0x337AB7','B, LOC: 11 [41-51]',5,NULL),(11,'C',75,2,'0x337AB7','C, LOC: 75 [28-102]',6,NULL),(12,'B',11,3,'0x337AB7','B, LOC: 11 [104-114]',6,NULL),(13,'A',3,1,'0x337AB7','A, LOC: 3 [43-45]',NULL,6),(14,'Anonymous function',3,1,'0x4CAE4C','Anonymous function, LOC: 3 [74-76]',NULL,8),(15,'A',3,1,'0x337AB7','A, LOC: 3 [43-45]',NULL,10),(16,'A',3,1,'0x337AB7','A, LOC: 3 [106-108]',NULL,12);

/*Table structure for table `tb_city` */

DROP TABLE IF EXISTS `tb_city`;

CREATE TABLE `tb_city` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `tooltip` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

/*Data for the table `tb_city` */

insert  into `tb_city`(`id`,`name`,`tooltip`) values (1,'Example City','Example City @ ./system/metafora/');

/*Table structure for table `tb_district` */

DROP TABLE IF EXISTS `tb_district`;

CREATE TABLE `tb_district` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `color` varchar(10) NOT NULL,
  `tooltip` varchar(255) NOT NULL,
  `city_id` int(11) DEFAULT NULL,
  `district_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fk_tb_district_tb_city` (`city_id`),
  KEY `fk_tb_district_tb_district1_idx` (`district_id`),
  CONSTRAINT `fk_tb_district_tb_city` FOREIGN KEY (`city_id`) REFERENCES `tb_city` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tb_district_tb_district1` FOREIGN KEY (`district_id`) REFERENCES `tb_district` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

/*Data for the table `tb_district` */

insert  into `tb_district`(`id`,`name`,`color`,`tooltip`,`city_id`,`district_id`) values (1,'index.js','0xD9534F','index.js, LOC: 57 [28-84]',1,NULL),(2,'distrito-b','0xF0AD4E','Folder: distrito-b',1,NULL),(3,'distrito-a','0xF0AD4E','Folder: distrito-a',1,NULL),(4,'index-2.js','0xD9534F','index-2.js, LOC: 55 [28-82]',NULL,2),(5,'index.js','0xD9534F','index.js, LOC: 30 [28-57]',NULL,2),(6,'index.js','0xD9534F','index.js, LOC: 93 [28-120]',NULL,3);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
