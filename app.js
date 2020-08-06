//jshint esversion:6

// https://ejs.co
// npm install ejs

const express = require("express");
const bodyParser = require("body-parser");

// Load the full build.
const _ = require('lodash');


// it will pring hello world that is already in date.js on line 4
// console.log(date);

const app = express();

// let items = [];
// let workItems = [];

// getting-started.js
const mongoose = require('mongoose');
// mongoose.connect("mongodb://localhost:27017/todolistDB", {
//   useNewUrlParser: true
// });




mongoose.connect("mongodb+srv://admin-ahmed:Test123@cluster0.fzbmi.mongodb.net/todolistDB", {
  useNewUrlParser: true
});




// here we make a validate for the rating.
const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "You should enter a name"]
  }
});

// collection
const Item = mongoose.model("Item", itemsSchema);



// values
const item1 = new Item({
  name: "study"
});

const item2 = new Item({
  name: "play"
});

const item3 = new Item({
  name: "sleep"
});

const defaultItems = [item1, item2, item3];


// to tell the app start using EJS
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));

// to use the css with express
app.use(express.static("public"));



//
// Item.insertMany( defaultItems , function(err){
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("success saved");
//   }
// });

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("success saved");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItem: foundItems
      });
    }

  });

  // u must make views folder because by default it will look at it ,, and kindOfDay is the same with list.ejs

});



app.get("/:customListName", function(req, res) {

  // we use lodash here
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // console.log("doesn't exist! ");
        // create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("exist");
        // show the exist
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });

      }
    }
  });


});




app.post("/", function(req, res) {

  // the user that have enterend
  const itemName = req.body.newItem;
  const listName = req.body.list;


  const item = new Item({
    name: itemName
  });


  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {

  const checkedItemId = req.body.checkbox;

  const listName = req.body.listName;


  if (listName === "Today")

  {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("deleted");
        res.redirect("/");
      }
    });
  }
  // if the list name is not today is coming from customListName
  else {
    //                     condtion          update      callback
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }




})




app.get("/about", function(req, res) {
  res.render("about");
})





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("server is running");
});
