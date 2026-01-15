import streamlit as st
import requests
from typing import Optional, Dict, List

# -------------------------
# Page configuration
# -------------------------
st.set_page_config(
    page_title="E-Commerce Store",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -------------------------
# Backend API URL
# -------------------------
API_BASE_URL = st.sidebar.text_input(
    "Backend API URL",
    value="http://localhost:3000/api",
    help="Enter your backend API base URL"
)

# -------------------------
# Session state initialization
# -------------------------
if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None
if "cart" not in st.session_state:
    st.session_state.cart = []

# -------------------------
# Helper functions
# -------------------------
def get_headers() -> Dict[str, str]:
    headers = {"Content-Type": "application/json"}
    if st.session_state.token:
        headers["Authorization"] = f"Bearer {st.session_state.token}"
    return headers

def api_request(method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
    url = f"{API_BASE_URL}{endpoint}"
    headers = get_headers()
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            return None
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            st.error(f"Error: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        st.error(f"Connection error: {str(e)}")
        return None

def login(email: str, password: str) -> bool:
    data = {"email": email, "password": password}
    result = api_request("POST", "/auth/login", data)
    if result and "token" in result:
        st.session_state.token = result["token"]
        st.session_state.user = result.get("user")
        return True
    return False

def register(name: str, email: str, password: str, role: str = "USER") -> bool:
    data = {"name": name, "email": email, "password": password, "role": role}
    result = api_request("POST", "/auth/register", data)
    if result and "token" in result:
        st.session_state.token = result["token"]
        st.session_state.user = result.get("user")
        return True
    return False

def logout():
    st.session_state.token = None
    st.session_state.user = None
    st.session_state.cart = []
    st.info("Logged out successfully! Refresh the page.")

def get_products() -> List[Dict]:
    result = api_request("GET", "/products")
    return result.get("products", []) if result else []

def get_cart() -> Optional[Dict]:
    result = api_request("GET", "/cart")
    return result.get("cart") if result else None

def add_to_cart(product_id: str, quantity: int):
    data = {"productId": product_id, "quantity": quantity}
    return api_request("POST", "/cart/items", data)

def create_order() -> Optional[Dict]:
    return api_request("POST", "/orders")

def get_orders() -> List[Dict]:
    result = api_request("GET", "/orders")
    return result.get("orders", []) if result else []

# -------------------------
# Sidebar - Authentication
# -------------------------
st.sidebar.title("🔐 Authentication")

if st.session_state.token and st.session_state.user:
    st.sidebar.success(f"Logged in as: {st.session_state.user.get('name', 'User')}")
    st.sidebar.write(f"Role: {st.session_state.user.get('role', 'USER')}")
    if st.sidebar.button("Logout"):
        logout()
else:
    tab1, tab2 = st.sidebar.tabs(["Login", "Register"])
    
    with tab1:
        st.subheader("Login")
        login_email = st.text_input("Email", key="login_email")
        login_password = st.text_input("Password", type="password", key="login_password")
        if st.button("Login", key="login_btn"):
            if login(login_email, login_password):
                st.success("Login successful! Refresh page to see updates.")
            else:
                st.error("Login failed!")
    
    with tab2:
        st.subheader("Register")
        reg_name = st.text_input("Name", key="reg_name")
        reg_email = st.text_input("Email", key="reg_email")
        reg_password = st.text_input("Password", type="password", key="reg_password")
        if st.button("Register", key="reg_btn"):
            if register(reg_name, reg_email, reg_password):
                st.success("Registration successful! Refresh page to see updates.")
            else:
                st.error("Registration failed!")

# -------------------------
# Main content
# -------------------------
st.title("🛒 E-Commerce Store")
st.markdown("---")

page = st.selectbox(
    "Navigate",
    ["Products", "Cart", "Orders"],
    key="nav_select"
)

# -------------------------
# Products Page
# -------------------------
if page == "Products":
    st.header("📦 Products")
    
    # Admin panel for managing products
    if st.session_state.user and st.session_state.user.get("role") == "ADMIN":
        st.subheader("🛠 Admin Panel - Manage Products")
        st.markdown("### ➕ Add Product")
        product_name = st.text_input("Product Name", key="admin_name")
        product_price = st.number_input("Price", min_value=0.0, key="admin_price")
        product_stock = st.number_input("Stock", min_value=0, key="admin_stock")
        product_desc = st.text_area("Description", key="admin_desc")

        if st.button("Add Product", key="add_product_btn"):
            data = {"name": product_name, "price": product_price, "stock": product_stock, "description": product_desc}
            res = api_request("POST", "/products", data)
            if res:
                st.success(f"Product '{product_name}' added successfully! Refresh page to see it.")

        st.markdown("---")
        st.markdown("### 📝 Manage Existing Products")
        products_admin = get_products()
        for prod in products_admin:
            with st.expander(f"{prod['name']} - {float(prod['price']):.2f}"):
                name = st.text_input("Name", prod["name"], key=f"edit_name_{prod['id']}")
                price = st.number_input("Price", min_value=0.0, value=float(prod["price"]), key=f"edit_price_{prod['id']}")
                stock = st.number_input("Stock", min_value=0, value=prod["stock"], key=f"edit_stock_{prod['id']}")
                desc = st.text_area("Description", value=prod.get("description", ""), key=f"edit_desc_{prod['id']}")
                col1, col2 = st.columns(2)
                with col1:
                    if st.button("Update", key=f"update_{prod['id']}"):
                        data = {"name": name, "price": price, "stock": stock, "description": desc}
                        api_request("PUT", f"/products/{prod['id']}", data)
                        st.success("Product updated successfully! Refresh page to see changes.")
                with col2:
                    if st.button("Delete", key=f"delete_{prod['id']}"):
                        api_request("DELETE", f"/products/{prod['id']}")
                        st.success("Product deleted successfully! Refresh page to see changes.")

    # Display products to all users
    products = get_products()
    if not products:
        st.info("No products available.")
    else:
        cols = st.columns(3)
        for idx, product in enumerate(products):
            with cols[idx % 3]:
                st.markdown(f"### {product.get('name', 'Unknown')}")
                st.write(f"**Price:** {float(product.get('price', 0)):.2f}")
                st.write(f"**Stock:** {product.get('stock', 0)}")
                if product.get('description'):
                    st.write(product['description'])

                # Only non-admin users can add to cart
                if st.session_state.token and st.session_state.user and st.session_state.user.get("role") != "ADMIN":
                    col1, col2 = st.columns(2)
                    quantity = col1.number_input(
                        "Quantity",
                        min_value=1,
                        max_value=product.get('stock', 1),
                        value=1,
                        key=f"qty_{product['id']}"
                    )
                    if col2.button("Add to Cart", key=f"add_{product['id']}"):
                        if add_to_cart(product['id'], quantity):
                            st.success("Added to cart! Refresh page to see your cart.")
                elif st.session_state.user and st.session_state.user.get("role") == "ADMIN":
                    st.info("Admins cannot add products to cart.")
                else:
                    st.info("Login to add to cart")
                st.markdown("---")

# -------------------------
# Cart Page
# -------------------------
# elif page == "Cart":
#     st.header("🛒 Shopping Cart")
#     if not st.session_state.token or st.session_state.user is None:
#         st.warning("Please login to view your cart.")
#     elif st.session_state.user.get("role") == "ADMIN":
#         st.info("Admins cannot use cart or checkout.")
#     else:
#         cart = get_cart()
#         if cart and cart.get("items"):
#             total = 0
#             for item in cart["items"]:
#                 product = item.get("product", {})
#                 quantity = item.get("quantity", 0)
#                 price = float(product.get("price", 0))
#                 item_total = price * quantity
#                 total += item_total

#                 col1, col2, col3, col4 = st.columns([3,1,1,1])
#                 col1.write(f"**{product.get('name', 'Unknown')}**")
#                 col2.write(f"Qty: {quantity}")
#                 col3.write(f"${price:.2f}")
#                 col4.write(f"${item_total:.2f}")
#                 st.markdown("---")

#             st.markdown(f"### Total: ${total:.2f}")

#             col1, col2 = st.columns(2)
#             if col1.button("Clear Cart"):
#                 api_request("DELETE", "/cart")
#                 st.info("Cart cleared! Refresh page.")
#             if col2.button("Checkout"):
#                 order = create_order()
#                 if order:
#                     st.success("Order created successfully! Refresh page to see order history.")
#         else:
#             st.info("Your cart is empty.")
# -------------------------
# Cart Page with Payment
# -------------------------
elif page == "Cart":
    st.header("🛒 Shopping Cart")
    
    if not st.session_state.token or st.session_state.user is None:
        st.warning("Please login to view your cart.")
    elif st.session_state.user.get("role") == "ADMIN":
        st.info("Admins cannot use cart or checkout.")
    else:
        cart = get_cart()
        if cart and cart.get("items"):
            total = 0
            for item in cart["items"]:
                product = item.get("product", {})
                quantity = item.get("quantity", 0)
                price = float(product.get("price", 0))
                item_total = price * quantity
                total += item_total

                col1, col2, col3, col4 = st.columns([3,1,1,1])
                col1.write(f"**{product.get('name', 'Unknown')}**")
                col2.write(f"Qty: {quantity}")
                col3.write(f"{price:.2f}")
                col4.write(f"{item_total:.2f}")
                st.markdown("---")

            st.markdown(f"### Total: {total:.2f}")

            col1, col2 = st.columns(2)
            with col1:
                if st.button("Clear Cart"):
                    api_request("DELETE", "/cart")
                    st.info("Cart cleared! Refresh page.")

            with col2:
                if st.button("Checkout"):
                    # 1️⃣ Create order
                    response = create_order()
                    if response and "order" in response:
                        order = response["order"]
                        order_id = order.get("id")
                        st.info(f"Order created with ID: {order_id}")

                        # 2️⃣ Create payment intent via backend
                        payment_data = {"orderId": order_id}
                        payment_intent = api_request("POST", "/payments/create-intent", payment_data)

                        if payment_intent and payment_intent.get("checkoutUrl"):
                            checkout_url = payment_intent["checkoutUrl"]
                            st.success("Payment ready! Click below to pay in Stripe Sandbox.")
                            st.markdown(f"[💳 Pay Now]({checkout_url})", unsafe_allow_html=True)
                        else:
                            st.error("Failed to generate Stripe Checkout link. Check backend.")
        else:
            st.info("Your cart is empty.")

# -------------------------
# Orders Page
# -------------------------
elif page == "Orders":
    st.header("📋 Orders")
    if not st.session_state.token or st.session_state.user is None:
        st.warning("Please login to view your orders.")
    else:
        orders = get_orders()
        if not orders:
            st.info("No orders found.")
        else:
            for order in orders:
                with st.expander(f"Order #{order.get('id', 'Unknown')[:8]} - {float(order.get('totalAmount', 0)):.2f} - {order.get('status', 'Unknown')}"):
                    st.write(f"**Status:** {order.get('status', 'Unknown')}")
                    st.write(f"**Payment Status:** {order.get('paymentStatus', 'Unknown')}")
                    st.write(f"**Date:** {order.get('createdAt', 'Unknown')}")
                    if order.get("items"):
                        st.subheader("Items:")
                        for item in order["items"]:
                            product = item.get("product", {})
                            st.write(f"- {product.get('name', 'Unknown')} x{item.get('quantity', 0)} @ {float(product.get('price', 0)):.2f}")

# -------------------------
# Footer
# -------------------------
st.markdown("---")
st.markdown("Built with ❤️ using Streamlit")
