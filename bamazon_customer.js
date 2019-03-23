var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", //add MySQl password
  database: "bamazon"
});

function initializeShopping() {

  con.connect(function(err) {

    if (err) throw err;

    getProductDetails();

  });
}

function getProductDetails() {

  con.query("SELECT id AS ID, product_name AS Product, price AS Price, stock_quantity AS Stock FROM products", function(err, result, fields) {

    if (err) throw err;

    // console.log(result);
    console.log("\n Welcome to Bamazon! Which is BETTER than AMAZON. \n");

    createTable(result);

    promptUserToBuy();

  });

}

function createTable(data) {

  // By default, headers will be red, and borders will be grey
  var table = new Table({
    head: ["ID", "Product", "Price", "In Stock"],
    wordWrap: true
  });

  for (var i = 0; i < data.length; i++) {
    table.push([data[i].ID, data[i].Product, "$" + data[i].Price, data[i].Stock]);
  }

  console.log(table.toString());

}

function promptUserToBuy() {

  inquirer
    .prompt([{
        type: "input",
        message: "\n Enter the ID of the product you want to buy.",
        name: "selectedId"
      },
      {
        type: "input",
        message: "\n Enter the quantity you want to buy.",
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

          // console.log("Items remaining in stock " + updatedStock + "\n");

          var payment = res[0].price * inquirerResponse.quantity;

          //query for updating database
          con.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [updatedStock, inquirerResponse.selectedId], function(err, response) {

            console.log("Your Order was successfully placed." + "\n \n" +
              "The total amount to be paid is $" + payment + "\n");
            continueShopping();

          });

          // console.log(res[0].stock_quantity);

          //if stock has less items than requested then show this msg
        } else if ((res[0].stock_quantity < inquirerResponse.quantity) && (!res[0].stock_quantity == 0)) {

          console.log("Sorry we couldn't complete your order for " + res[0].product_name + " as we have only " + res[0].stock_quantity + " in stock." + "\n");
          continueShopping();
          //if stock has 0 items for the requested product then show this msg 
        } else if (res[0].stock_quantity === 0) {

          console.log("Sorry we are Out of Stock for " + res[0].product_name + "." + "\n");
          continueShopping();
        }
      });
    });

}

function continueShopping() {

  inquirer
    .prompt([{
      type: "list",
      message: "Do you want to continue shopping?",
      choices: ["YES", "NO"],
      name: "shopMore"
    }])
    .then(function(userResponse) {

      if (userResponse.shopMore == "YES") {
        getProductDetails();
      } else {
        console.log("\n Thank you for visiting Bamazon! See you soon again. \n");
        con.end();
      }

    });
}

initializeShopping();