// =========================
// LEAFLET MENDEZ MAP
// =========================

var mapElement = document.getElementById('map');
if (mapElement && typeof L !== 'undefined') {
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
}


// =========================
// PRODUCT MODAL SYSTEM
// =========================

function openProduct(name, price, img1, img2, img3, img4, description, category) {
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

    // Show customization only for Jerseys. Hide & clear for other categories.
    try {
        const customization = document.querySelector('.customization');
        const nameInput = document.getElementById('custom-name');
        const numberInput = document.getElementById('custom-number');
        if (customization) {
            const supported = ['Jerseys'];
            if (category && supported.indexOf(category) !== -1) {
                customization.style.display = '';
            } else if (!category) {
                // If category not provided, keep customization visible (legacy pages)
                customization.style.display = '';
            } else {
                // hide customization and clear any entered values
                customization.style.display = 'none';
                if (nameInput) nameInput.value = '';
                if (numberInput) numberInput.value = '';
                updateModalPrice();
            }
        }
    } catch (e) {
        // ignore
    }

    // Set size options based on category
    try {
        const sizeSelect = document.getElementById('product-size');
        if (sizeSelect) {
            // clear existing
            sizeSelect.innerHTML = '';
            if (category === 'Footballs') {
                const opt4 = document.createElement('option'); opt4.value = '4'; opt4.text = 'Size 4';
                const opt5 = document.createElement('option'); opt5.value = '5'; opt5.text = 'Size 5';
                sizeSelect.appendChild(opt4);
                sizeSelect.appendChild(opt5);
            } else {
                // default garment sizes
                ['Small','Medium','Large','XL','XXL'].forEach(s => {
                    const o = document.createElement('option'); o.value = s; o.text = s; sizeSelect.appendChild(o);
                });
            }
        }
    } catch (e) { /* ignore */ }
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

function loadCart() {
    const savedCart = localStorage.getItem('worldCupCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart) || [];
        } catch (error) {
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem('worldCupCart', JSON.stringify(cart));
}

let cartBtn;
let cartSidebar;

loadCart();

function bindCartEvents() {
    if (cartBtn) {
        cartBtn.addEventListener("click", function(e) {
            e.preventDefault();
            if (cartSidebar) {
                cartSidebar.classList.add("active");
                document.body.classList.add("no-scroll");
            }
        });
    }

    let closeCartBtn = document.getElementById("close-cart");
    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", function() {
            if (cartSidebar) {
                cartSidebar.classList.remove("active");
            }
            document.body.classList.remove("no-scroll");
        });
    }
}

function initializeCartUI() {
    cartBtn = document.getElementById("cart-btn");
    cartSidebar = document.querySelector(".cart");
    updateCart();
    bindCartEvents();
    bindMenuToggle();
    initializeHomepageVideo();
}

function bindMenuToggle() {
    const menuToggle = document.getElementById("menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener("click", function() {
        const isOpen = mainNav.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click", function(event) {
        if (!mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
            mainNav.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
}

function initializeHomepageVideo() {
    const homeVideo = document.getElementById("home-kit-video");
    if (!homeVideo) return;

    homeVideo.muted = true;
    homeVideo.setAttribute("playsinline", "");
    homeVideo.setAttribute("webkit-playsinline", "");

    const playPromise = homeVideo.play();
    if (playPromise !== undefined) {
        playPromise.catch(() => {
            homeVideo.addEventListener("click", function handleVideoTap() {
                homeVideo.play();
                homeVideo.removeEventListener("click", handleVideoTap);
            });
        });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCartUI);
} else {
    initializeCartUI();
}

// =========================
// PRODUCT REVIEWS (localStorage)
// =========================

function loadReviews() {
    const raw = localStorage.getItem('worldCupReviews');
    try {
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveReviews(reviews) {
    localStorage.setItem('worldCupReviews', JSON.stringify(reviews));
}

function renderReviews() {
    const list = document.getElementById('reviews-list');
    if (!list) return;
    const reviews = loadReviews();
    if (reviews.length === 0) {
        list.innerHTML = '<p>No reviews yet — be the first to review!</p>';
        return;
    }
    // render as horizontal cards to allow scrolling when many
    list.innerHTML = '';
    reviews.forEach(r => {
        const card = document.createElement('article');
        card.className = 'review-card';

        const meta = document.createElement('div');
        meta.className = 'review-meta';
        const name = document.createElement('div');
        name.className = 'review-name';
        name.textContent = r.name || 'Anonymous';
        const rating = document.createElement('div');
        rating.className = 'review-rating';
        rating.textContent = '★'.repeat(r.rating || 5);
        meta.appendChild(name);
        meta.appendChild(rating);

        card.appendChild(meta);

        if (r.image) {
            const img = document.createElement('img');
            img.className = 'review-photo';
            img.src = r.image;
            img.alt = 'Customer photo';
            card.appendChild(img);
        }

        const p = document.createElement('p');
        p.textContent = r.text || '';
        card.appendChild(p);

        // open detailed view when clicking a review card
        card.addEventListener('click', function(e) {
            e.stopPropagation();
            openReviewModal(r);
        });

        list.appendChild(card);
    });
}

function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

function bindReviewForm() {
    const form = document.getElementById('review-form');
    if (!form) return;
    const fileInput = document.getElementById('review-image');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('review-name').value.trim() || 'Anonymous';
        const rating = Number(document.getElementById('review-rating').value) || 5;
        let text = document.getElementById('review-text').value.trim();
        if (!text) return alert('Please write a short review.');
        // enforce max length server-side in case browser doesn't respect maxlength
        const MAX_REVIEW_LENGTH = 350;
        if (text.length > MAX_REVIEW_LENGTH) {
            text = text.slice(0, MAX_REVIEW_LENGTH);
        }

        let dataUrl = '';
        try {
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                // limit file size to ~1.5MB to avoid huge localStorage entries
                if (file.size > 1_600_000) {
                    if (!confirm('Image is large and may not save properly. Continue?')) {
                        return;
                    }
                }
                dataUrl = await readFileAsDataURL(file);
            }
        } catch (err) {
            console.error('Image read error', err);
            alert('Unable to read image file.');
            return;
        }

        const reviews = loadReviews();
        reviews.unshift({ name: name, rating: rating, text: text, image: dataUrl, created: Date.now() });
        saveReviews(reviews);
        renderReviews();

        form.reset();
    });
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function() { resolve(reader.result); };
        reader.onerror = function(err) { reject(err); };
        reader.readAsDataURL(file);
    });
}

// REVIEW DETAILS MODAL HANDLERS
function openReviewModal(r) {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    const img = document.getElementById('review-modal-image');
    const name = document.getElementById('review-modal-name');
    const rating = document.getElementById('review-modal-rating');
    const date = document.getElementById('review-modal-date');
    const text = document.getElementById('review-modal-text');

    if (img) {
        if (r.image) { img.src = r.image; img.style.display = ''; }
        else { img.src = ''; img.style.display = 'none'; }
    }
    if (name) name.textContent = r.name || 'Anonymous';
    if (rating) rating.textContent = '★'.repeat(r.rating || 5);
    if (date) date.textContent = r.created ? new Date(r.created).toLocaleString() : '';
    if (text) text.textContent = r.text || '';

    modal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

// close handlers: overlay click, close button, ESC
window.addEventListener('click', function(e) {
    const modal = document.getElementById('review-modal');
    if (!modal) return;
    if (e.target === modal) closeReviewModal();
});

window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeReviewModal();
});

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('close-review');
    if (closeBtn) closeBtn.addEventListener('click', closeReviewModal);
});

// initialize review UI after DOM ready
document.addEventListener('DOMContentLoaded', function() {
    renderReviews();
    bindReviewForm();
});

// =========================
// ITEMS PAGE: products grid, search & filters
// =========================

function initItemsPage() {
    const grid = document.getElementById('items-grid');
    if (!grid) return;

    // products list: include jerseys from index plus new items
    const products = [
        { name: 'Brazil Home Jersey', price: 3795, image: 'Pics/braziu.avif', category: 'Jerseys', thumbs: ['Pics/braziu.avif','Pics/brazilsecondpic.jpg','Pics/brazil/braziu2.jpg','Pics/brazil/braziu4.jpg'], description: 'Official 2026 Brazil Home Jersey.' },
        { name: 'Argentina Home Jersey', price: 3795, image: 'Pics/arg.jpg', category: 'Jerseys', thumbs: ['Pics/arg.jpg','Pics/arg/arg.jpg','Pics/arg/arg2.jpg','Pics/arg/arg3.jpg'], description: 'Official 2026 Argentina Home Jersey.' },
        { name: 'England Home Jersey', price: 3795, image: 'Pics/eng.jpg', category: 'Jerseys', thumbs: ['Pics/eng.jpg','Pics/eng]/eng1.jpg','Pics/eng]/eng2.jpg','Pics/eng]/eng3.jpg'], description: 'Official 2026 England Home Jersey.' },
        { name: 'Spain Home Jersey', price: 3795, image: 'Pics/spain.jpg', category: 'Jerseys', thumbs: ['Pics/spain.jpg','Pics/spain/spain1.jpg','Pics/spain/spain2.jpg','Pics/spain/spain3.jpg'], description: 'Official 2026 Spain Home Jersey.' },
        { name: 'Japan Home Jersey', price: 3795, image: 'Pics/jap/jap2.jpg', category: 'Jerseys', thumbs: ['Pics/jap/jap2.jpg','Pics/jap/jap.jpg','Pics/jap/jap3.jpg','Pics/jap/jap4.jpg'], description: 'Official 2026 Japan Home Jersey.' },
        { name: 'Germany Home Jersey', price: 3795, image: 'Pics/ger/ger.jpg', category: 'Jerseys', thumbs: ['Pics/ger/ger.jpg','Pics/ger/ger1.jpg','Pics/ger/ger2.jpg','Pics/ger/ger3.jpg'], description: 'Official 2026 Germany Home Jersey.' },

        // new items
        { name: 'Champions Match Ball', price: 1295, image: 'Pics/items/balls/ball4.jpg', category: 'Footballs', thumbs: ['Pics/items/balls/ball4.jpg','Pics/items/ball.jpg','Pics/items/balls/ball3.jpg','Pics/items/balls/ball2.jpg'], description: 'Official match ball.' },
        { name: 'Fan T-Shirt', price: 995, image: 'Pics/items/liverpool shirt.jpg', category: 'T-Shirts', thumbs: ['Pics/items/liverpool shirt.jpg','Pics/items/liverpool shirt.jpg','Pics/items/liverpool shirt.jpg','Pics/items/liverpool shirt.jpg'], description: 'Casual fan t-shirt.' },
        { name: 'Warm-Up Jacket', price: 2495, image: 'Pics/jacket.jpg', category: 'Jackets', thumbs: ['Pics/jacket.jpg','Pics/jacket.jpg','Pics/jacket.jpg','Pics/jacket.jpg'], description: 'Lightweight warm-up jacket.' }
    ];

    // render function
    function render(list) {
        grid.innerHTML = '';
        list.forEach(p => {
            const col = document.createElement('div');
            col.className = 'card';
            col.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>${p.category}</p>
                <span>₱${p.price}</span>
                <div class="product-card-actions" style="margin-top:12px;">
                    <button class="button primary">View Details</button>
                </div>
            `;

            // open modal when clicking the button
            const btn = col.querySelector('button');
            if (btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openProduct(p.name, p.price, p.thumbs[0], p.thumbs[1], p.thumbs[2], p.thumbs[3], p.description, p.category);
                });
            }

            // make the entire card clickable (except when clicking the button)
            col.addEventListener('click', function(e) {
                if (e.target.closest('button')) return;
                openProduct(p.name, p.price, p.thumbs[0], p.thumbs[1], p.thumbs[2], p.thumbs[3], p.description, p.category);
            });

            // ensure width fits grid
            col.style.width = '100%';
            col.style.cursor = 'pointer';

            grid.appendChild(col);
        });
    }

    // helpers
    function escapeForAttr(s) {
        return String(s).replace(/'/g, "\\'");
    }

    // initial render
    render(products);

    // search & filter
    const search = document.getElementById('product-search');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function applyFilters() {
        const q = search.value.trim().toLowerCase();
        const active = Array.from(filterBtns).find(b => b.classList.contains('active'));
        const category = active ? active.dataset.category : 'All';

        const filtered = products.filter(p => {
            const matchesCategory = category === 'All' || p.category === category;
            const matchesQuery = !q || p.name.toLowerCase().includes(q);
            return matchesCategory && matchesQuery;
        });
        render(filtered);
    }

    filterBtns.forEach(b => {
        b.addEventListener('click', function() {
            filterBtns.forEach(x => x.classList.remove('active'));
            this.classList.add('active');
            applyFilters();
        });
    });

    // default activate All
    const first = document.querySelector('.filter-btn[data-category="All"]');
    if (first) first.classList.add('active');

    search.addEventListener('input', function() {
        applyFilters();
    });
}

// initialize items page when present
document.addEventListener('DOMContentLoaded', function() {
    initItemsPage();
});


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

    if (cartItems) {
        cartItems.innerHTML = "";
    }

    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;

        if (cartItems) {
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
        }
    });

    if (cartTotal) {
        cartTotal.innerHTML = total.toFixed(2);
    }
    if (cartCount) {
        cartCount.innerHTML = count;
    }
    if (cartBtn) {
        cartBtn.dataset.count = count;
    }
    saveCart();
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

if (viewer && image) {
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
}

// =========================
// OPEN / CLOSE CART
// =========================

if (cartBtn) {
    cartBtn.addEventListener("click", function(e) {
        e.preventDefault();
        if (cartSidebar) {
            cartSidebar.classList.add("active");
            document.body.classList.add("no-scroll");
        }
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

initializeCartUI();

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