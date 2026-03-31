async function loadDataFromServer() {
const response = await fetch('http://localhost:8000/api/item-list');
const items = await response.json();
console.log(items);
}
function addItem(){

let name=document.getElementById("itemName").value;
let quantity=document.getElementById("quantity").value;
let unit=document.getElementById("unit").value;

if(name=="" || quantity=="" || unit==""){
alert("Please fill all fields");
return;
}

let table=document.getElementById("inventoryTable").getElementsByTagName("tbody")[0];

let row=table.insertRow();

let status="Available";

if(quantity<10){
status="Low Stock";
}

row.innerHTML = `
<td>${name}</td>

<td>
<button onclick="decreaseQty(this)">-</button>
<span class="qty">${quantity}</span>
<button onclick="increaseQty(this)">+</button>
</td>

<td>${unit}</td>

<td class="status">${status}</td>

<td>
<button class="edit-btn" onclick="editItem(this)">Edit</button>
<button class="delete-btn" onclick="deleteItem(this)">Delete</button>
</td>
`;

document.getElementById("itemName").value="";
document.getElementById("quantity").value="";
document.getElementById("unit").value="";

}

function deleteItem(btn){

let row=btn.parentNode.parentNode;
row.remove();

}

function editItem(btn){

let row=btn.parentNode.parentNode;

let name=row.cells[0].innerText;
let quantity=row.cells[1].innerText;
let unit=row.cells[2].innerText;

document.getElementById("itemName").value=name;
document.getElementById("quantity").value=quantity;
document.getElementById("unit").value=unit;

row.remove();

}
function increaseQty(btn){

let qtySpan = btn.parentNode.querySelector(".qty");
let qty = parseInt(qtySpan.innerText);

qty++;

qtySpan.innerText = qty;

}

function decreaseQty(btn){

let qtySpan = btn.parentNode.querySelector(".qty");
let qty = parseInt(qtySpan.innerText);

if(qty > 0){
qty--;
}

qtySpan.innerText = qty;

}
loadDataFromServer();