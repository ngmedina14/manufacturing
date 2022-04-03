const mysql2 = require("mysql2"); // get the client
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const async = require("hbs/lib/async");

// setup hidden config for database
dotenv.config({ path: "./.env" });

// create the connection to database
const db = mysql2.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT,
});

// get the list of product
exports.list = (req, res) => {
  displayList(res);
};

// display  a form for adding Product
exports.productAddForm = (req, res) => {
  db.query("select * from suppliers", (error, row) => {
    if (error) console.log(error);
    res.render("product", { suppliers: row });
  });
};

// display  a form for adding Product
exports.productUpdateForm = (req, res) => {
    let getID = req.params.product_id
    db.query("select * from products where product_id = ?",getID ,(error, result) => {
      if (error) console.log(error);
      db.query("select supplier_id from product_supplier where product_id = ?",getID , (error, selected) => {
        if (error) console.log(error);
            db.query("select * from suppliers", (error, row) => {
            if (error) console.log(error);
            row.map((obj,index)=>{
                selected.map((id)=>{
                    if(obj.supplier_id ==id.supplier_id ){
                    row[index]['selected'] = "selected"
                    }})})
            res.render("update-product", { suppliers: row,product:result[0]});
          });
      });
    });
  
};

// save the product
exports.saveProduct = (req, res) => {
  const { product_name, product_description, product_quantity, supplier_id } = req.body;
  let products = {
    product_name: product_name,
    product_description: product_description,
    product_quantity: parseInt(product_quantity),
  };
  db.beginTransaction((err) => {
    if (err) throw err;
    db.query("INSERT INTO products SET ?", products, (error, result) => {
      if (error) {
        return db.rollback(()=>{throw error;});
      }
      const newProductID = result.insertId;
      if (supplier_id != undefined){
        if (supplier_id.length > 1) {
            supplier_id.map((supplierID)=>{
                let productSupplier = {product_id:newProductID,supplier_id:supplierID};
                db.query("INSERT INTO product_supplier SET ?",productSupplier,(error, result)=>{
                    if (error) {
                      return db.rollback(()=>{throw error;});
                    }
                  });
              })
          }else if (supplier_id.length == 1){
            let productSupplier = {product_id:newProductID,supplier_id:supplier_id};
                db.query("INSERT INTO product_supplier SET ?",productSupplier,(error, result)=>{
                    if (error) {
                      return db.rollback(()=>{throw error;});
                    }
                  });
          }
      }
      db.commit(function (error) {
        if (error) {
          return db.rollback(()=>{throw error;});
        }
      });
      
    });
  });
  db.query("select * from suppliers", (error, row) => {
    if (error) console.log(error);
    res.render("product", { suppliers: row,message:"Product is Added" });
  });
};

// update the product
exports.updateProduct = (req, res) => {
    const { product_id, product_name, product_description, product_quantity, supplier_id } = req.body;
  let products = {
    product_name: product_name,
    product_description: product_description,
    product_quantity: parseInt(product_quantity),
  };
  let condition = {
      product_id: product_id 
  }
  db.beginTransaction((err) => {
    if (err) throw err;
    db.query("UPDATE products SET ? WHERE ?", [products,condition], (error, result) => {
      if (error) {
        return db.rollback(()=>{throw error;});
      }
      db.query("select * from product_supplier where ?",condition, (error, row) => {
        if (error) console.log(error);
        console.log(row)
        if (row.length != 0){
            db.query("DELETE FROM product_supplier WHERE ?",condition,(error, result)=>{
                if (error) {
                  return db.rollback(()=>{throw error;});
                }
                console.log('deleted')
            });
        }
      if (supplier_id != undefined){
        if (supplier_id.length != 1) {
            supplier_id.map((supplierID)=>{
                var productSupplier = {product_id:product_id,supplier_id:supplierID};
                db.query("INSERT INTO product_supplier SET ?",productSupplier,(error, result)=>{
                    if (error) {
                      return db.rollback(()=>{throw error;});
                    }
                  });
              })
          }else if (supplier_id.length == 1){
            let productSupplier = {product_id:product_id,supplier_id:supplier_id};
                db.query("INSERT INTO product_supplier SET ?",productSupplier,(error, result)=>{
                    if (error) {
                      return db.rollback(()=>{throw error;});
                    }
                  });
          }
        }
          db.commit(function (error) {
            if (error) {
              return db.rollback(()=>{throw error;});
            }
            displayList(res);
        });
      });
  });
})
}

// delete the product
exports.deleteProduct = (req, res) => {
  const pID = req.params.product_id;
  db.query("delete from products where product_id = ?", pID, (error) => {
    if (error) console.log(error);
    displayList(res);
  });
};

function displayList(res) {
  let queryString =
    "SELECT p.product_id,p.product_name,p.product_description,p.product_quantity, group_concat(s.supplier_name) as suppliers " +
    "FROM products p " +
    "LEFT JOIN product_supplier ps on p.product_id = ps.product_id " +
    "LEFT JOIN suppliers s on  ps.supplier_id = s.supplier_id " +
    "GROUP BY p.product_id";
  db.query(queryString, (error, row) => {
    // check has an error
    if (error) console.log(error);
    return res.render("list", { products: row });
  });
}
