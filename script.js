// =========================
// LEAFLET MENDEZ MAP
// =========================

var map = L.map('map').setView([14.133014103571236, 120.87614638417914], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var storeMarker = L.marker([14.133014103571236, 120.87614638417914]).addTo(map);

storeMarker.bindPopup(`
    <b>World Cup Store</b><br>
    Mendez, Cavite<br>
    Open Daily: 9AM - 8PM
`).openPopup();


// =========================
// PRODUCT MODAL SYSTEM
// =========================

function openProduct(name, price, img1, img2, img3, img4, description) {
    document.getElementById("product-name").innerText = name;
    document.getElementById("product-price").dataset.base = price;
    document.getElementById("product-price").innerText = parseFloat(price).toFixed(2);
    document.getElementById("product-description").innerText = description;

    let customName = document.getElementById("custom-name");
    let customNumber = document.getElementById("custom-number");
    if (customName) customName.value = "";
    if (customNumber) customNumber.value = "";

    updateModalPrice();

    // Set Main Image
    document.getElementById("main-image").src = img1;

    // Set 4 Thumbnails
    if (document.getElementById("photo1")) document.getElementById("photo1").src = img1;
    if (document.getElementById("photo2")) document.getElementById("photo2").src = img2;
    if (document.getElementById("photo3")) document.getElementById("photo3").src = img3;
    if (document.getElementById("photo4")) document.getElementById("photo4").src = img4;

    // Show Modal
    document.getElementById("product-modal").classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeProduct() {
    document.getElementById("product-modal").classList.remove("active");
    document.body.classList.remove("no-scroll");
}

function changeImage(newSrc){

    document.getElementById("main-image").src = newSrc;

    scale = 1;
    posX = 0;
    posY = 0;

    updateTransform();

}

window.addEventListener("click", function(e) {
    let modal = document.getElementById("product-modal");
    if (e.target === modal) {
        closeProduct();
    }
});


// =========================
// SHOPPING CART SYSTEM
// =========================

let cart = [];

let modalCartBtn = document.getElementById("modal-cart");
if (modalCartBtn) {
    modalCartBtn.addEventListener("click", function() {
        let name = document.getElementById("product-name").innerText;
        let basePrice = Number(document.getElementById("product-price").dataset.base || document.getElementById("product-price").innerText);
        let size = document.getElementById("product-size").value;
        let customName = document.getElementById("custom-name").value.trim();
        let customNumber = document.getElementById("custom-number").value.trim();
        customName = sanitizeCustomName(customName).slice(0, 11);
        customNumber = sanitizeCustomNumber(customNumber).slice(0, 2);
        let customizationFee = (customName || customNumber) ? 1000 : 0;
        let price = basePrice + customizationFee;

        let label = `${name} (${size})`;
        if (customName || customNumber) {
            let suffix = [];
            if (customName) suffix.push(customName);
            if (customNumber) suffix.push(`#${customNumber}`);
            label += ` - ${suffix.join(' ')} (Custom)`;
        }

        let product = {
            id: `${name}|${size}|${customName}|${customNumber}`,
            name: label,
            basePrice: basePrice,
            price: price,
            size: size,
            customName: customName,
            customNumber: customNumber,
            customizationFee: customizationFee,
            image: document.getElementById("main-image").src,
            quantity: 1
        };

        let existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push(product);
        }

        updateCart();
        closeProduct();
        alert(product.name + " added to cart!");
    });
}

function updateModalPrice() {
    let priceEl = document.getElementById("product-price");
    let basePrice = Number(priceEl.dataset.base || priceEl.innerText);
    let customName = sanitizeCustomName(document.getElementById("custom-name").value.trim()).slice(0, 11);
    let customNumber = sanitizeCustomNumber(document.getElementById("custom-number").value.trim()).slice(0, 2);
    let customizationFee = (customName || customNumber) ? 1000 : 0;
    priceEl.innerText = (basePrice + customizationFee).toFixed(2);
}

let customNameInput = document.getElementById("custom-name");
let customNumberInput = document.getElementById("custom-number");

function sanitizeCustomName(value) {
    return value.replace(/[^A-Za-z ]/g, '');
}

function sanitizeCustomNumber(value) {
    return value.replace(/[^0-9]/g, '');
}

if (customNameInput) {
    customNameInput.addEventListener("input", function() {
        this.value = sanitizeCustomName(this.value);
        updateModalPrice();
    });
}

if (customNumberInput) {
    customNumberInput.addEventListener("input", function() {
        this.value = sanitizeCustomNumber(this.value);
        updateModalPrice();
    });
}

function updateCart() {
    let cartItems = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    let cartCount = document.getElementById("cart-count");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-preview">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h3>${item.name}</h3>
                        <p>Price: ₱${item.price}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span class="cart-quantity">${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                    <button class="remove-button" onclick="removeItem(${index})">Remove</button>
                </div>
            </div>
        `;
    });

    cartTotal.innerHTML = total.toFixed(2);
    cartCount.innerHTML = count;
}

function changeQuantity(index, amount) {
    cart[index].quantity += amount;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

// ======================
// IMAGE ZOOM + DRAG
// ======================

const viewer = document.querySelector(".image-viewer");
const image = document.getElementById("main-image");

image.draggable = false;

image.addEventListener("dragstart", function (e) {
    e.preventDefault();
});

let scale = 1;
let posX = 0;
let posY = 0;

let dragging = false;
let startX = 0;
let startY = 0;

function updateTransform(){

image.style.transform =
`translate3d(${posX}px, ${posY}px, 0) scale(${scale})`;

}

// Mouse wheel zoom
viewer.addEventListener("wheel",function(e){

    e.preventDefault();

    if(e.deltaY < 0){
        scale += 0.2;
    } else {
        scale -= 0.2;
    }

    if(scale < 1) scale = 1;
    if(scale > 5) scale = 5;

    updateTransform();

});

let pinchStartDistance = 0;
let initialScale = 1;
let touchDragging = false;

function getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.hypot(dx, dy);
}

viewer.addEventListener("touchstart", function(e) {
    if (!viewer) return;

    if (e.touches.length === 1 && scale > 1) {
        touchDragging = true;
        startX = e.touches[0].clientX - posX;
        startY = e.touches[0].clientY - posY;
        viewer.style.cursor = "grabbing";
    }

    if (e.touches.length === 2) {
        touchDragging = false;
        pinchStartDistance = getTouchDistance(e.touches[0], e.touches[1]);
        initialScale = scale;
    }

    e.preventDefault();
});

viewer.addEventListener("touchmove", function(e) {
    if (!viewer) return;

    if (e.touches.length === 1 && touchDragging && scale > 1) {
        posX = e.touches[0].clientX - startX;
        posY = e.touches[0].clientY - startY;
        updateTransform();
    }

    if (e.touches.length === 2) {
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        scale = initialScale * (distance / pinchStartDistance);
        if (scale < 1) scale = 1;
        if (scale > 5) scale = 5;
        updateTransform();
    }

    e.preventDefault();
});

viewer.addEventListener("touchend", function() {
    touchDragging = false;
    viewer.style.cursor = "grab";
});

// Start dragging
viewer.addEventListener("mousedown",function(e){

    if(scale <= 1) return;

    dragging = true;

    startX = e.clientX - posX;
    startY = e.clientY - posY;

    viewer.style.cursor = "grabbing";

});

// Drag
window.addEventListener("mousemove",function(e){

    if(!dragging) return;

    posX = e.clientX - startX;
    posY = e.clientY - startY;

    updateTransform();

});

// Stop drag
window.addEventListener("mouseup",function(){

    dragging = false;

    viewer.style.cursor = "grab";

});

// Double click reset
viewer.addEventListener("dblclick",function(){

    scale = 1;
    posX = 0;
    posY = 0;

    updateTransform();

});

viewer.addEventListener("touchcancel", function() {
    touchDragging = false;
    viewer.style.cursor = "grab";
});

// =========================
// OPEN / CLOSE CART
// =========================

let cartBtn = document.getElementById("cart-btn");
if (cartBtn) {
    cartBtn.addEventListener("click", function(e) {
        e.preventDefault();
        document.querySelector(".cart").classList.add("active");
        document.body.classList.add("no-scroll");
    });
}

let closeCartBtn = document.getElementById("close-cart");
if (closeCartBtn) {
    closeCartBtn.addEventListener("click", function() {
        document.querySelector(".cart").classList.remove("active");
        document.body.classList.remove("no-scroll");
    });
}


// =========================
// SHOP NOW BUTTON
// =========================

let heroBtn = document.querySelector(".hero button");
if (heroBtn) {
    heroBtn.addEventListener("click", function() {
        document.querySelector("#shop").scrollIntoView({
            behavior: "smooth"
        });
    });
}

// =========================
// PAYMONGO CHECKOUT HANDLER
// =========================

let checkoutBtn = document.getElementById("checkout-btn");

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async function() {
        if (cart.length === 0) {
            alert("Your shopping cart is empty!");
            return;
        }

        // Disable button while processing
        checkoutBtn.innerText = "Processing...";
        checkoutBtn.disabled = true;

        try {
            // Send cart data to your backend
            const response = await fetch("/api/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ items: cart })
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                // Redirect customer to PayMongo's secure payment page
                window.location.href = data.checkoutUrl;
            } else {
                alert("Could not start checkout. " + (data.error || ""));
                checkoutBtn.innerText = "Proceed to Checkout";
                checkoutBtn.disabled = false;
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Unable to connect to the checkout server.");
            checkoutBtn.innerText = "Proceed to Checkout";
            checkoutBtn.disabled = false;
        }
    });
}