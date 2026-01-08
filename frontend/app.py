"""
E-Commerce Frontend - Streamlit Application
Main application file for the e-commerce store frontend
"""

import streamlit as st
import requests
from typing import Optional, Dict, List
import json

# Page configuration
st.set_page_config(
    page_title="E-Commerce Store",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Backend API URL
API_BASE_URL = st.sidebar.text_input(
    "Backend API URL",
    value="http://localhost:3000/api",
    help="Enter your backend API base URL"
)

# Session state initialization
if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None
if "cart" not in st.session_state:
    st.session_state.cart = []


def get_headers() -> Dict[str, str]:
    """Get request headers with authentication token"""
    headers = {"Content-Type": "application/json"}
    if st.session_state.token:
        headers["Authorization"] = f"Bearer {st.session_state.token}"
    return headers


def api_request(method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
    """Make API request to backend"""
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
    """Login user"""
    data = {"email": email, "password": password}
    result = api_request("POST", "/auth/login", data)
    
    if result and "token" in result:
        st.session_state.token = result["token"]
        st.session_state.user = result.get("user")
        return True
    return False


def register(name: str, email: str, password: str, role: str = "USER") -> bool:
    """Register new user"""
    data = {"name": name, "email": email, "password": password, "role": role}
    result = api_request("POST", "/auth/register", data)
    
    if result and "token" in result:
        st.session_state.token = result["token"]
        st.session_state.user = result.get("user")
        return True
    return False


def logout():
    """Logout user"""
    st.session_state.token = None
    st.session_state.user = None
    st.session_state.cart = []
    st.rerun()


def get_products() -> List[Dict]:
    """Get all products"""
    result = api_request("GET", "/products")
    return result.get("products", []) if result else []


def get_cart() -> Optional[Dict]:
    """Get user's cart"""
    result = api_request("GET", "/cart")
    return result.get("cart") if result else None


def add_to_cart(product_id: str, quantity: int):
    """Add item to cart"""
    data = {"productId": product_id, "quantity": quantity}
    return api_request("POST", "/cart/items", data)


def create_order() -> Optional[Dict]:
    """Create order from cart"""
    return api_request("POST", "/orders")


def get_orders() -> List[Dict]:
    """Get user's orders"""
    result = api_request("GET", "/orders")
    return result.get("orders", []) if result else []


# Sidebar - Authentication
st.sidebar.title("🔐 Authentication")

if st.session_state.token:
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
                st.success("Login successful!")
                st.rerun()
            else:
                st.error("Login failed!")
    
    with tab2:
        st.subheader("Register")
        reg_name = st.text_input("Name", key="reg_name")
        reg_email = st.text_input("Email", key="reg_email")
        reg_password = st.text_input("Password", type="password", key="reg_password")
        if st.button("Register", key="reg_btn"):
            if register(reg_name, reg_email, reg_password):
                st.success("Registration successful!")
                st.rerun()
            else:
                st.error("Registration failed!")

# Main content
st.title("🛒 E-Commerce Store")
st.markdown("---")

# Navigation
page = st.selectbox(
    "Navigate",
    ["Products", "Cart", "Orders"],
    key="nav_select"
)

if page == "Products":
    st.header("📦 Products")
    
    products = get_products()
    
    if not products:
        st.info("No products available.")
    else:
        # Display products in grid
        cols = st.columns(3)
        
        for idx, product in enumerate(products):
            with cols[idx % 3]:
                with st.container():
                    st.markdown(f"### {product.get('name', 'Unknown')}")
                    st.write(f"**Price:** ${float(product.get('price', 0)):.2f}")
                    st.write(f"**Stock:** {product.get('stock', 0)}")
                    if product.get('description'):
                        st.write(product['description'])
                    
                    if st.session_state.token:
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
                                st.success("Added to cart!")
                                st.rerun()
                    else:
                        st.info("Login to add to cart")
                    st.markdown("---")

elif page == "Cart":
    st.header("🛒 Shopping Cart")
    
    if not st.session_state.token:
        st.warning("Please login to view your cart.")
    else:
        cart = get_cart()
        
        if cart and cart.get('items'):
            total = 0
            for item in cart['items']:
                product = item.get('product', {})
                quantity = item.get('quantity', 0)
                price = float(product.get('price', 0))
                item_total = price * quantity
                total += item_total
                
                col1, col2, col3, col4 = st.columns([3, 1, 1, 1])
                col1.write(f"**{product.get('name', 'Unknown')}**")
                col2.write(f"Qty: {quantity}")
                col3.write(f"${price:.2f}")
                col4.write(f"${item_total:.2f}")
                st.markdown("---")
            
            st.markdown(f"### Total: ${total:.2f}")
            
            col1, col2 = st.columns(2)
            if col1.button("Clear Cart"):
                api_request("DELETE", "/cart")
                st.rerun()
            
            if col2.button("Checkout", type="primary"):
                order = create_order()
                if order:
                    st.success("Order created successfully!")
                    st.json(order)
                    st.rerun()
        else:
            st.info("Your cart is empty.")

elif page == "Orders":
    st.header("📋 Orders")
    
    if not st.session_state.token:
        st.warning("Please login to view your orders.")
    else:
        orders = get_orders()
        
        if not orders:
            st.info("No orders found.")
        else:
            for order in orders:
                with st.expander(f"Order #{order.get('id', 'Unknown')[:8]} - ${float(order.get('totalAmount', 0)):.2f} - {order.get('status', 'Unknown')}"):
                    st.write(f"**Status:** {order.get('status', 'Unknown')}")
                    st.write(f"**Payment Status:** {order.get('paymentStatus', 'Unknown')}")
                    st.write(f"**Date:** {order.get('createdAt', 'Unknown')}")
                    
                    if order.get('items'):
                        st.subheader("Items:")
                        for item in order['items']:
                            product = item.get('product', {})
                            st.write(f"- {product.get('name', 'Unknown')} x{item.get('quantity', 0)} @ ${float(item.get('price', 0)):.2f}")

# Footer
st.markdown("---")
st.markdown("Built with ❤️ using Streamlit")
