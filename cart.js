const CART_KEY = 'alvimCart';

function formatPrice(value) {
    return value.toFixed(2).replace('.', ',');
}

function getCart() {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    if (badges.length === 0) return;
    const totalQuantity = getCart().reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(badge => {
        badge.textContent = totalQuantity;
    });
}

function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.add('open');
    backdrop.classList.add('visible');
    drawer.setAttribute('aria-hidden', 'false');
    renderCartDrawer();
}

function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (!drawer || !backdrop) return;
    drawer.classList.remove('open');
    backdrop.classList.remove('visible');
    drawer.setAttribute('aria-hidden', 'true');
}

function renderCartDrawer() {
    const container = document.getElementById('drawer-cart-items');
    const totalElement = document.getElementById('drawer-total');
    if (!container || !totalElement) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="drawer-empty">
                <p>Seu carrinho está vazio.</p>
                <p>Adicione produtos para começar.</p>
            </div>
        `;
        totalElement.textContent = '0,00';
        return;
    }

    container.innerHTML = cart
        .map(item => `
            <div class="drawer-item">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <strong>R$ ${formatPrice(item.price)}</strong>
                <div class="drawer-item-controls">
                    <div class="quantity-control">
                        <button type="button" class="qty-change" data-id="${item.id}" data-change="-1">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="qty-change" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <button type="button" class="remove-item" data-id="${item.id}">Remover</button>
                </div>
            </div>
        `)
        .join('');

    totalElement.textContent = formatPrice(getCartTotal());
    container.querySelectorAll('.qty-change').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const delta = Number(button.dataset.change);
            changeQuantity(id, delta);
            renderCartDrawer();
        });
    });

    container.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            removeFromCart(button.dataset.id);
            renderCartDrawer();
        });
    });
}

function bindCartToggle() {
    const toggles = document.querySelectorAll('.cart-toggle, .floating-cart');
    const backdrop = document.getElementById('cart-backdrop');
    const closeButton = document.querySelector('.drawer-close');
    toggles.forEach(toggle => {
        if (toggle) toggle.addEventListener('click', openCartDrawer);
    });
    if (backdrop) backdrop.addEventListener('click', closeCartDrawer);
    if (closeButton) closeButton.addEventListener('click', closeCartDrawer);
}

function showToast(message) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(window.alvimCartToastTimer);
    window.alvimCartToastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
}

function addToCart(product) {
    const cart = getCart();
    const found = cart.find(item => item.id === product.id);
    if (found) {
        found.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    updateCartBadge();
    showToast(`${product.name} adicionado ao carrinho`);
}

function changeQuantity(id, delta) {
    const cart = getCart();
    const item = cart.find(product => product.id === id);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity < 1) item.quantity = 1;
    saveCart(cart);
    renderCart();
    renderCartDrawer();
    updateCartBadge();
    updateCheckoutButton();
}

function removeFromCart(id) {
    const cart = getCart().filter(product => product.id !== id);
    saveCart(cart);
    renderCart();
    renderCartDrawer();
    updateCartBadge();
    updateCheckoutButton();
}

function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
    const container = document.getElementById('carrinho-itens');
    const totalElement = document.getElementById('total');
    if (!container || !totalElement) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Seu carrinho está vazio.</p>
                <a href="catalogo.html" class="btn">Ver Produtos</a>
            </div>
        `;
        totalElement.textContent = '0,00';
        return;
    }

    container.innerHTML = cart
        .map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <strong>R$ ${formatPrice(item.price)}</strong>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button type="button" class="qty-change" data-id="${item.id}" data-change="-1">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" class="qty-change" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <button type="button" class="remove-item" data-id="${item.id}">Remover</button>
                </div>
            </div>
        `)
        .join('');

    totalElement.textContent = formatPrice(getCartTotal());
    container.querySelectorAll('.qty-change').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const delta = Number(button.dataset.change);
            changeQuantity(id, delta);
        });
    });

    container.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => removeFromCart(button.dataset.id));
    });
}

function bindAddButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const product = {
                id: button.dataset.id,
                name: button.dataset.name,
                description: button.dataset.description,
                price: Number(button.dataset.price)
            };
            addToCart(product);
            window.location.href = 'cart.html';
        });
    });
}

function bindClearCart() {
    const clearButton = document.querySelector('.clear-cart');
    if (!clearButton) return;
    clearButton.addEventListener('click', () => {
        if (getCart().length === 0) {
            showToast('Carrinho já está vazio');
            return;
        }
        if (confirm('Tem certeza que deseja limpar o carrinho?')) {
            localStorage.removeItem(CART_KEY);
            renderCart();
            renderCartDrawer();
            updateCartBadge();
            updateCheckoutButton();
            showToast('Carrinho limpo com sucesso');
        }
    });
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;
    const cart = getCart();
    const isEnabled = cart.length > 0;
    checkoutBtn.disabled = !isEnabled;
}

function bindCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;
    checkoutBtn.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            showToast('Seu carrinho está vazio!');
            return;
        }
        const total = getCartTotal();
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        showToast('Processando compra de R$ ' + formatPrice(total) + ' (' + itemCount + ' itens)...');
        setTimeout(() => {
            showToast('Pedido confirmado! Verifique seu email para mais informações.');
            localStorage.removeItem(CART_KEY);
            renderCart();
            renderCartDrawer();
            updateCartBadge();
            updateCheckoutButton();
        }, 2000);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    bindAddButtons();
    renderCart();
    renderCartDrawer();
    updateCartBadge();
    updateCheckoutButton();
    bindClearCart();
    bindCheckoutButton();
    bindCartToggle();
});