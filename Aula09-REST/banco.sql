CREATE DATABASE loja_26_1;

USE loja_26_1;

CREATE TABLE produto (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
    nome VARCHAR(100) NOT NULL ,
    preco DOUBLE 
);

INSERT INTO produto (nome, preco ) VALUES 
( "Coca-Cola" , 9.89 ) , 
( "Pepsi" , 7.99 ) , 
( "Trakinas" , 3.50 ) ;

-- Alterações a partir da Aula 09

CREATE TABLE categoria (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
    nome VARCHAR(100) NOT NULL
);

INSERT INTO categoria (nome) VALUES ("Bebidas") , ("Alimentos");

ALTER TABLE produto ADD COLUMN codCategoria INT;

ALTER TABLE produto ADD CONSTRAINT `fk_categoria` 
FOREIGN KEY (codCategoria) REFERENCES categoria (id);

UPDATE produto SET codCategoria = 1 where id <= 2;
UPDATE produto SET codCategoria = 2 where id = 3;
