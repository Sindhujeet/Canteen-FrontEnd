const API_URL = "http://localhost:8000/api/order-list";

// ── Fetch all orders ────────────────────────────────────────────
async function fetchOrders() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) throw new Error("Server error: " + response.status);

        const result = await response.json();
        console.log("Fetched orders:", result);

        displayOrders(result.data);

    } catch (err) {
        console.error("Failed to fetch orders:", err);
        document.getElementById("ordersList").innerHTML =
            "<p style='color:red;'>❌ Could not load orders. Is the server running?</p>";
    }
}

// ── Display all orders ──────────────────────────────────────────
function displayOrders(orders) {
    const container = document.getElementById("ordersList");

    if (!orders || orders.length === 0) {
        container.innerHTML = "<p>No orders found.</p>";
        return;
    }

    container.innerHTML = "";

    orders.forEach(order => {
        const date = new Date(order.date).toLocaleString();

        const itemRows = order.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>₹${item.price * item.quantity}</td>
            </tr>
        `).join("");

        const card = document.createElement("div");
        card.classList.add("order-card");
        card.dataset.id = order._id;

        card.innerHTML = `

            <div id="print-header-${order._id}" style="display:none; text-align:center; margin-bottom:10px;">
                <h2 style="font-size:20px;">GUS Canteen</h2>
                <p style="font-size:11px;">Official Receipt</p>
                <hr style="border:1px dashed #000; margin:8px 0;">
                <p style="font-size:22px; font-weight:bold; color:#e11d48;">Token No: ${order.tokenNo}</p> <hr style="border:1px dashed #000; margin:8px 0;">
            </div>

            <div class="order-header">
                <span>Invoice No: <strong>#${order.invoiceNo}</strong></span>
                <span>Token: <strong>${order.tokenNo}</strong></span>
                <span>${date}</span>
                <span class="badge ${order.paymentStatus === 'paid' ? 'badge-paid' : 'badge-pending'}">
                    ${order.paymentStatus.toUpperCase()}
                </span>
            </div>

            <table class="order-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemRows}
                </tbody>
            </table>

            <div class="order-footer">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <span>Payment:</span>
                    <strong>${order.paymentMethod.toUpperCase()}</strong>
                </div>
                <div class="grand-total" style="display:flex; justify-content:space-between; font-size:15px; font-weight:bold; border-top:1px dashed #ccc; padding-top:6px;">
                    <span>TOTAL:</span>
                    <span>₹${order.total}</span>
                </div>
            </div>

            <div id="print-footer-${order._id}" style="display:none; text-align:center; margin-top:12px; border-top:1px dashed #000; padding-top:10px;">
                <p>Thank you for dining with us!</p>
                <p style="font-size:11px; margin-top:4px;">GUS Canteen</p>
            </div>

            <div style="display:flex; gap:8px; align-items:center; margin-top:12px;">
                ${order.paymentStatus === 'pending' ?
                    `<button onclick="markAsPaid('${order._id}')">✅ Mark as Paid</button>`
                    : '<span style="color:#16a34a; font-weight:bold;">✅ Paid</span>'
                }
                <button onclick="printOrder('${order._id}')" style="background:#3b82f6; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">🖨️ Print</button>
                <button onclick="deleteOrder('${order._id}')" style="background:#ef4444; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">🗑️ Delete</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ── Mark as Paid ────────────────────────────────────────────────
async function markAsPaid(id) {
    try {
        const response = await fetch(`http://localhost:8000/api/order-update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentStatus: "paid" })
        });

        const result = await response.json();

        if (result.status === 1) {
            fetchOrders(); // refresh list
        }

    } catch (err) {
        console.error("Error:", err);
        alert("❌ Could not update order.");
    }
}

// ── Print single order ──────────────────────────────────────────
function printOrder(id) {
    document.getElementById(`print-header-${id}`).style.display = "block";
    document.getElementById(`print-footer-${id}`).style.display = "block";

    const cards = document.querySelectorAll(".order-card");
    cards.forEach(card => {
        if (card.dataset.id !== id) {
            card.style.display = "none";
        } else {
            card.classList.add("printing");
        }
    });

    window.print();

    cards.forEach(card => {
        card.style.display = "block";
        card.classList.remove("printing");
    });

    document.getElementById(`print-header-${id}`).style.display = "none";
    document.getElementById(`print-footer-${id}`).style.display = "none";
}

// ── Delete Order ────────────────────────────────────────────────
async function deleteOrder(id) {
    // 1. Ask for confirmation before deleting
    if (!confirm("Are you sure you want to delete this bill? This cannot be undone.")) {
        return; 
    }

    try {
        // 2. Call your backend delete route
        const response = await fetch(`http://localhost:8000/api/order-delete/${id}`, {
            method: "DELETE", // Or "POST" depending on your backend setup
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();

        // 3. If successful, refresh the page to remove the deleted item
        if (result.status === 1 || response.ok) {
            fetchOrders(); 
        } else {
            alert("❌ Could not delete order: " + (result.message || "Server error"));
        }

    } catch (err) {
        console.error("Delete Error:", err);
        alert("❌ Failed to connect to server. Check if your backend route is set up.");
    }
}

// ── Init ────────────────────────────────────────────────────────
fetchOrders();

// 🚀 Auto-refresh the orders every 10 seconds!
setInterval(fetchOrders, 10000);