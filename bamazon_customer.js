var mysql = require('mysql');
var inquirer = require("inquirer");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", //add MySQl password
  database: "bamazon"
});

con.connect(function(err) {

  if (err) throw err;

  con.query("SELECT id AS ID, product_name AS Product, price AS Price FROM products", function(err, result, fields) {

    if (err) throw err;

    // console.log(result);

    console.log(JSON.stringify(result, null, 2));

    promptUserToBuy();

  });
});

function promptUserToBuy() {

  inquirer
    .prompt([{
        type: "input",
        message: "Enter the ID of the product you want to buy.",
        name: "selectedId"
      },
      {
        type: "input",
        message: "Enter the quantity you want to buy.",
        name: "quantity"
      }
    ])
    .then(function(inquirerResponse) {

      //selecting & showing the product details
      con.query("SELECT product_name, price, stock_quantity FROM products WHERE id = ?", [inquirerResponse.selectedId], function(err, res) {

        console.log("\n" + "You requested for " + inquirerResponse.quantity + " " + res[0].product_name + " which costs $" + res[0].price + " each." + "\n");

        //checking for stock in store
        //if enough stock then update database by subtracting the product quantity requested by user
        if (res[0].stock_quantity >= inquirerResponse.quantity) {

          var updatedStock = res[0].stock_quantity - parseInt(inquirerResponse.quantity);
          console.log("Items remaining in stock " + updatedStock + "\n");

          var payment = res[0].price * inquirerResponse.quantity;

          //query for updating database
          con.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [updatedStock, inquirerResponse.selectedId], function(err, response) {

            console.log("Your Order was successfully placed." + "\n" +
              "The total amount to be paid is $" + payment + "\n");

          });

          // console.log(res[0].stock_quantity);

          //if stock has less items than requested then show this msg
        } else if ((res[0].stock_quantity < inquirerResponse.quantity) && (!res[0].stock_quantity == 0)) {

          console.log("\n" + "Sorry we couldn't complete your order for " + res[0].product_name + " as we have only " + res[0].stock_quantity + " in stock." + "\n");

          //if stock has 0 items for the requested product then show this msg	
        } else if (res[0].stock_quantity === 0) {

          console.log("\n" + "Sorry we are Out of Stock for " + res[0].product_name + "." + "\n");
        }
      });
    });

}