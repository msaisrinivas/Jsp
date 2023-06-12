//check if the user is logged in or not
if (
  localStorage.getItem("res-isAuthenticated") === null ||
  localStorage.getItem("res-isAuthenticated") === "false"
) {
  window.location.replace("login.html?error=Please login to continue");
}

//get name from res-user and display it in span tag with id=user-name
let user = JSON.parse(localStorage.getItem("res-user"));
document.getElementById("user-name").innerHTML = `Welcome! ${user.name}`;

//logout function
function logout() {
  //remove item from local storage which started with res-
  localStorage.removeItem("res-isAuthenticated");
  localStorage.removeItem("res-user");
  window.location.replace("login.html");
}

// decalring the elements in html
let tables = document.getElementById("tables");
let menu = document.getElementById("menu");
let tableSearch = document.getElementById("search-table");
let menuSearch = document.getElementById("search-foodItem");
const closeButton = document.querySelector(".close-button");
const modal = document.querySelector(".modal");
const billingTableName = document.getElementById("bill_heading");
const billingTable = document.getElementById("table_bill");

//values for js
const itemsurl = "items.json";
const tablesurl = "tables.json";
let tableCount = 0;
let tableData = [];
let foodItems = [];

//loading starts

function loadMenu() {
  fetch(itemsurl)
    .then((response) => response.json())
    .then((data) => {
      foodItems = data;
      data.forEach((items) => {
        let categoryNameDiv = document.createElement("div");
        menu.appendChild(categoryNameDiv);

        categoryNameDiv.style.marginLeft = "43%";

        let categoryName = document.createElement("h1");

        categoryNameDiv.appendChild(categoryName);
        categoryName.setAttribute("class", "categoryName");
        categoryName.style.padding = "5px";

        categoryName.innerHTML = items.category_name;
        items.menuItems.forEach((item) => {
          addFoodItemToMenu(item.name, item.price);
        });
      });
    })
    .catch((error) => console.log("Menu Json is not found"));
}

function loadTables() {
  fetch(tablesurl)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("tables", JSON.stringify(data));
      data.forEach((item) => {
        addTable(item.tableName, item.totalPrice, 0);
      });
    })
    .catch((error) => console.log("Tables Json is not found"));
}

function loadData() {
  loadTables();
  loadMenu();
}

//loading ends

//adding food Items to menu starts

function addFoodItemToMenu(name, cost) {
  let foodItem = document.createElement("div");
  menu.appendChild(foodItem);
  foodItem.setAttribute("class", "foodItem " + name);
  foodItem.setAttribute("draggable", "true");
  let foodItemName = document.createElement("h2");
  foodItem.appendChild(foodItemName);
  foodItemName.innerHTML = name;
  let foodItemPrice = document.createElement("h3");
  foodItem.appendChild(foodItemPrice);
  foodItemPrice.innerHTML = cost;

  foodItem.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("foodItem", name);
    e.dataTransfer.setData("price", cost);
  });
}

//adding food Items to menu ends

//adding tables to tables list starts

function addTable(name, price, itemcount) {
  tableCount++;
  let table = document.createElement("div");

  tables.appendChild(table);
  table.setAttribute("class", "table");

  let tableName = document.createElement("h1");
  tableName.innerHTML = name;
  table.appendChild(tableName);

  let priceItemCount = document.createElement("div");
  priceItemCount.setAttribute("class", "price-itemCount");
  table.appendChild(priceItemCount);

  let rupees = document.createElement("h3");
  rupees.innerHTML = "Rs. ";
  priceItemCount.appendChild(rupees);

  let totalPrice = document.createElement("h3");
  priceItemCount.appendChild(totalPrice);
  totalPrice.setAttribute("id", "table${tableCount}-price");
  totalPrice.style.marginRight = "20%";
  totalPrice.innerHTML = price;

  let totalItems = document.createElement("h3");
  priceItemCount.appendChild(totalItems);
  totalItems.innerHTML = "Total items : ";

  let itemCount = document.createElement("h3");
  priceItemCount.appendChild(itemCount);
  itemCount.setAttribute("id", "table${tableCount}-itemCount");
  itemCount.innerHTML = itemcount;

  table.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  table.addEventListener("drop", (e) => {
    e.preventDefault();
    let foodItemName = e.dataTransfer.getData("foodItem");
    let foodItemPrice = e.dataTransfer.getData("price");
    totalPrice.innerHTML =
      parseFloat(totalPrice.innerHTML) + parseFloat(foodItemPrice);
    itemCount.innerHTML = parseFloat(itemCount.innerHTML) + 1;

    addFoodItemToTable(foodItemName, foodItemPrice, tableName.innerHTML);
  });

  table.addEventListener("click", () => {
    modal.classList.toggle("show-modal");
    billingTableName.innerHTML = `${name} | Order Details`;
    let totalprice;
    for (let tableDataItem of tableData) {
      if (name === tableDataItem.tableName) {
        addTableItemsToBilling(tableDataItem);
        break;
      }
    }

    function addTableItemsToBilling(tableDataItem) {
      resetBillingTable();
      let j = 1;
      totalprice = 0;
      tableDataItem.foodItems.forEach((item) => {
        let tr = document.createElement("tr");
        billingTable.appendChild(tr);

        let tdSerial = document.createElement("td");
        tr.appendChild(tdSerial);
        tdSerial.innerHTML = j++;

        let tdItem = document.createElement("td");
        tr.appendChild(tdItem);
        tdItem.innerHTML = item.fooditem;

        let tdPrice = document.createElement("td");
        tr.appendChild(tdPrice);
        tdPrice.innerHTML = item.price;

        let tdQuantity = document.createElement("td");
        tr.appendChild(tdQuantity);

        let input = document.createElement("input");
        input.type = "number";
        input.setAttribute("min", "1");
        input.value = parseInt(item.count);

        input.addEventListener("change", () => {
          let currentCount = parseFloat(item.count);
          let updatedCount = parseFloat(input.value);
          if (currentCount < updatedCount) {
            item.count++;
            totalprice += parseFloat(item.price);
            tableDataItem.totalPrice += parseFloat(item.price);
            itemCount.innerHTML = parseInt(itemCount.innerHTML) + 1;
          } else if (currentCount > updatedCount) {
            item.count--;
            totalprice -= parseFloat(item.price);
            tableDataItem.totalPrice -= parseFloat(item.price);
            itemCount.innerHTML = parseInt(itemCount.innerHTML) - 1;
          }
          total.innerHTML = `Total : ${totalprice}`;
          totalPrice.innerHTML = tableDataItem.totalPrice;
          localStorage.setItem("tables", JSON.stringify(tableData));
        });

        tdQuantity.appendChild(input);
        totalprice += parseFloat(item.price) * input.value;
        let tdTrash = document.createElement("ion-icon");
        tdTrash.setAttribute("name", "trash-outline");
        tdTrash.style.fontSize = "30px";
        tdTrash.style.textAlign = "center";
        tr.appendChild(tdTrash);
        tdTrash.style.cursor = "pointer";
        tdTrash.addEventListener("click", () => {
          for (let x = 0; x < tableDataItem.foodItems.length; x++) {
            if (item === tableDataItem.foodItems[x]) {
              totalprice -=
                parseInt(tableDataItem.foodItems[x].price) *
                tableDataItem.foodItems[x].count;
              tableDataItem.totalPrice -=
                tableDataItem.foodItems[x].price *
                tableDataItem.foodItems[x].count;
              totalPrice.innerHTML = tableDataItem.totalPrice;
              itemCount.innerHTML =
                parseInt(itemCount.innerHTML) -
                tableDataItem.foodItems[x].count;
              tableDataItem.foodItems.splice(x, 1);
              localStorage.setItem("tables", JSON.stringify(tableData));
              addTableItemsToBilling(tableDataItem);
            }
          }
        });
      });
      let tr = document.createElement("tr");
      billingTable.appendChild(tr);
      tr.appendChild(document.createElement("td"));
      tr.appendChild(document.createElement("td"));
      let total = document.createElement("td");
      tr.appendChild(total);
      total.innerHTML = `Total : ${totalprice}`;
    }
  });
}

//adding tables to tables list ends

closeButton.addEventListener("click", () => {
  modal.classList.toggle("show-modal");
});

function addFoodItemToTable(foodItemName, foodItemPrice, tableName) {
  tableData = JSON.parse(localStorage.getItem("tables"));
  tableData.forEach((item) => {
    if (tableName === item.tableName) {
      let isFoodItemPresent = false;
      item.foodItems.forEach((food) => {
        if (foodItemName === food.fooditem) {
          isFoodItemPresent = true;
          food.count = parseInt(food.count) + 1;
        }
      });
      if (!isFoodItemPresent) {
        item.foodItems.push({
          fooditem: foodItemName,
          price: foodItemPrice,
          count: 1,
        });
      }
      item.totalPrice = parseFloat(item.totalPrice) + parseFloat(foodItemPrice);
    }
  });
  localStorage.setItem("tables", JSON.stringify(tableData));
}

//search in tables starts

tableSearch.addEventListener("keyup", function (event) {
  let value = event.target.value.toLowerCase();
  let tableslist = document.querySelectorAll(".table");
  if (value !== "") {
    tableslist.forEach((table) => {
      if (!table.children[0].innerHTML.toLowerCase().includes(value)) {
        table.style.display = "none";
      } else {
        table.style.display = "";
      }
    });
  } else if (value === "") {
    tableslist.forEach((table) => {
      table.style.display = "";
    });
  }
});

//search in tables ends

//search in menu starts

menuSearch.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && event.target.value !== "") {
    let value = event.target.value.toLowerCase();
    let isCategory = false;
    let temporaryList = [];
    foodItems.forEach((item) => {
      if (value === item.category_name.toLowerCase()) {
        isCategory = true;
        item.menuItems.forEach((fooditem) => {
          temporaryList.push(fooditem.name);
        });
      }
    });
    if (isCategory) {
      let categories = document.querySelectorAll(".categoryName");
      categories.forEach((category) => {
        category.style.display = "none";
      });
      let foodList = document.querySelectorAll(".foodItem");
      foodList.forEach((food) => {
        if (temporaryList.indexOf(food.children[0].innerHTML) > -1) {
          food.style.display = "";
        } else {
          food.style.display = "none";
        }
      });
    } else {
      let categories = document.querySelectorAll(".categoryName");
      categories.forEach((category) => {
        category.style.display = "none";
      });
      let foodList = document.querySelectorAll(".foodItem");
      foodList.forEach((food) => {
        if (food.children[0].innerHTML.toLowerCase().includes(value)) {
          food.style.display = "";
        } else {
          food.style.display = "none";
        }
      });
    }
  } else if (event.target.value === "") {
    let categories = document.querySelectorAll(".categoryName");
    categories.forEach((category) => {
      category.style.display = "";
    });
    let foodList = document.querySelectorAll(".foodItem");
    foodList.forEach((food) => {
      food.style.display = "";
    });
  }
});

//search in menu ends

//resetting table starts

function resetBillingTable() {
  for (let i = billingTable.rows.length - 1; i > 0; i--) {
    billingTable.deleteRow(i);
  }
}

function resetTable(event) {
  resetBillingTable();
  let tablename = billingTableName.innerHTML.split("|")[0].trim();
  let index = tablename.split("-")[1];

  tableData.forEach((tableitem) => {
    if (tablename === tableitem.tableName) {
      tableitem.foodItems = [];
      tableitem.totalPrice = 0;
    }
  });

  let table = document.querySelectorAll(".table")[index - 1];
  table.children[1].children[1].innerHTML = 0;
  table.children[1].children[3].innerHTML = 0;

  modal.classList.toggle("show-modal");
  localStorage.setItem("tables", JSON.stringify(tableData));
}

//resetting table ends

loadData();
