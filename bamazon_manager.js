var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", //add MySQl password
  database: "bamazon"
});

function createTable(data) {

  // By default, headers will be red, and borders will be grey
  var table = new Table({
    head: ["ID", "Product", "Department", "Price", "In Stock"],
    wordWrap: true
  });

  for (var i = 0; i < data.length; i++) {
    table.push([data[i].id, data[i].product_name, data[i].department_name, "$" + data[i].price, data[i].stock_quantity]);
  }

  console.log(table.toString());

}

function showMenu() {

  //prompt manager to select a task
  inquirer
    .prompt([{
      type: "list",
      message: "\n Hi, what do you want to do?",
      choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Log Out"],
      name: "task"
    }])
    .then(function(mngr) {

      switch (mngr.task) {
        case "View Products For Sale":
          viewProducts();
          break;
        case "View Low Inventory":
          viewLowStock();
          break;
        case "Add to Inventory":
          addToStock();
          break;
        case "Add New Product":
          addNewProduct();
          break;
        case "Log Out":
          logOut();
          break;
      }
    });
}

function viewProducts() {

  //query all products for the manager to view
  con.query("SELECT * FROM products", function(err, result, fields) {

    if (err) throw err;

    console.log("\n Here's a list of all the products in store. \n");

    createTable(result);
    continueManaging();

  });
}

function viewLowStock() {

  //query for products that have less than 5 items in stock
  con.query("SELECT * FROM products WHERE stock_quantity < ?", [5], function(err, result, fields) {

    if (err) throw err;

    //if there are items low on stock then do this
    if (result.length > 0) {

      console.log("\n The following products are low in stock. \n");

      createTable(result);
      continueManaging();

    } //if result set is empty/no items less than 5 in stock then do this
    else {
      console.log("\n Your inventory is well stocked. \n");
      continueManaging();

    }
  });
}

function addToStock() {

  //show all products to manager for reference
  con.query("SELECT * FROM products", function(err, result, fields) {

    if (err) throw err;

    console.log("\n Here's a list of all the products in store for your reference. \n");

    createTable(result);

    //prompt manager to add items in stock
    inquirer
      .prompt([{
          type: "input",
          message: "\n Enter the ID of the product you want to add more of in the stock.",
          name: "prodId",
          validate: function(idValue) {
            if (isNaN(idValue) === false) {
              return true;
            }
            return false;
          }
        },
        {
          type: "input",
          message: "\n Enter the quantity you want to add in stock.",
          name: "quantityAdded",
          validate: function(quantValue) {
            if (isNaN(quantValue) === false) {
              return true;
            }
            return false;
          }
        }
      ])
      .then(function(update) {

        //only select the item which is being updated for making a addedStock variable
        con.query("SELECT * FROM products WHERE id = ?", [update.prodId], function(err, result, fields) {

          if (err) throw err;

          var addedStock = result[0].stock_quantity + parseInt(update.quantityAdded);

          //query for updating database
          con.query("UPDATE products SET stock_quantity = ? WHERE id = ?", [addedStock, update.prodId], function(err, result, fields) {

            if (err) throw err;

            console.log("\n The inventory was successfully updated. \n");

            //show the row of product which was updated
            con.query("SELECT * FROM products WHERE id = ?", [update.prodId], function(err, result, fields) {

              if (err) throw err;

              createTable(result);
              continueManaging();
            });
          });
        });
      });
  });
}

function addNewProduct() {

  //prompt manager to add new product
  inquirer
    .prompt([{
        type: "list",
        message: "\n Select the product you want to add to the store.",
        choices: ["Sweater", "TV", "Microwave", "Sandals", "Dining Table", "Yoga Mat"],
        name: "prodName"
      },
      {
        type: "input",
        message: "\n Enter the price of the product.",
        name: "prodPrice",
        validate: function(priceValue) {
          if (isNaN(priceValue) === false) {
            return true;
          }
          return false;
        }
      },
      {
        type: "input",
        message: "\n Enter the quantity of the product.",
        name: "stock",
        validate: function(stockValue) {
          if (isNaN(stockValue) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(newProd) {

      var department;

      switch (newProd.prodName) {
        case "Sweater":
          department = "Clothing";
          break;
        case "TV":
          department = "Electronics";
          break;
        case "Microwave":
          department = "Electronics";
          break;
        case "Sandals":
          department = "Footwear";
          break;
        case "Dining Table":
          department = "Home";
          break;
        case "Yoga Mat":
          department = "Health & Wellness";
          break;
      }
      //query to insert new row in product table. Note the separate '?' for each VALUE
      con.query("INSERT INTO products (product_name, department_name,price,stock_quantity) VALUES (?,?,?,?)",
        [newProd.prodName, department, newProd.prodPrice, newProd.stock],
        function(err, result, fields) {

          if (err) throw err;

          console.log("\n The product was successfully added to the store. See the new entry included in the table below. \n");

          //show the new product included with the entire table
          con.query("SELECT * FROM products", function(err, result, fields) {

            if (err) throw err;

            createTable(result);
            continueManaging();
          });
        });
    });
}

function continueManaging() {

  //ask if manager wants to continue working
  inquirer
    .prompt([{
      type: "list",
      message: "\n Do you want to continue working?",
      choices: ["YES", "NO"],
      name: "manageMore"
    }])
    .then(function(userResponse) {

      if (userResponse.manageMore == "YES") {
        showMenu();
      } else {
        logOut();
      }
    });
}

function logOut() {
  console.log("\n Thank you for visiting Bamazon! See you soon again. Bye! \n");
  con.end();
}

showMenu();