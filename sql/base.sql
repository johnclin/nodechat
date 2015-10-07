--  Users table
CREATE TABLE users (
     id INT NOT NULL AUTO_INCREMENT,
     username CHAR(30) NOT NULL,
     password CHAR (60) NOT NULL,
     active BOOLEAN DEFAULT TRUE,
     PRIMARY KEY (id)
);