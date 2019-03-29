DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    price INT NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES 
("Adidas Racer Shoes","Footwear",32,25),
("Nike Air Max Shoes","Footwear",180,4),
("Levis Women Skinny Jeans","Clothing",50,30),
("Wrangler Men Cowboy Jeans","Clothing",30,25),
("Sony Headphones","Electronics",350,2),
("Nikon Camera","Electronics",396,10),
("Panasonic Camera","Electronics",298,30),
("Recliner Leather Sofa","Home",986,8),
("Gel Memory Foam Mattress","Home",140,22),
("Digital Weighing Scale","Health & Wellness",15,40);