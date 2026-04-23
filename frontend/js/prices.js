// Base URL for all API requests
// In production, change this to your live domain e.g. 'https://yoursite.com/api'
const API_URL = 'https://finalproject-hccp.onrender.com/api' // dont forget to change this later

// ===== PROTECT THE PAGE =====
// Read the token that was saved to localStorage when the user logged in
const token = localStorage.getItem('token')

// If there is no token, the user is not logged in — send them back to the login page
if (!token) {
  window.location.href = '/'
  throw new Error('No token') // stops the rest of the script from running

}

// ===== AUTH HEADER HELPER =====
// Every request to a protected route must include the JWT token in the Authorization header
// This function returns the headers object so we don't repeat it everywhere
function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // format required by our authMiddleware.js
  }
}

// ===== LOGOUT =====
// When logout is clicked, remove the token from localStorage and go back to login
// Without the token, the user can no longer make authenticated requests
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location.href = '/'
})

// ===== GET ALL PRICES =====
async function getPrices() {
  // GET /api/prices — protected route, needs Authorization header
  const res = await fetch(`${API_URL}/prices`, {
    method: 'GET',
    headers: authHeader()
  })

  const prices = await res.json()

  if (!res.ok) {
    // If the request failed, show the error in the prices container
    document.getElementById('displayCards').textContent = prices.message || 'Failed to load prices'
    return
  }

  // Pass the PRICES array to the render function to display them on the page
  renderPrices(prices)
}

// ===== RENDER PRICES TO THE PAGE =====
function renderPrices(prices) {
  const container = document.getElementById('pricings')

  // Clear whatever was previously rendered so we don't get duplicates
  container.innerHTML = ''

  if (prices.length === 0) {
    container.textContent = 'No prices yet. Add one above!'
    return
  }

  // Loop through each price and create HTML elements for it
  prices.forEach(price => {
    const div = document.createElement('div')
    div.innerHTML = `
      <p><strong>ID:</strong>${price.id}</p>
      <p><strong>Tier name:</strong>${price.tier_name}</p>
      <p><strong>Debugs allowed:</strong>${price.debug}</p>
      <p><strong>Price:</strong>${price.price}</p>
      <p><strong>One-on-One Time:</strong>${price.oneonone}</p>

      <button onclick = "deletePrice('${price.id}')">>Delete<</button>
      <button onclick = "startEdit('${price.id}','${price.tier_name}','${price.debug}','${price.price}','${price.oneonone}')">>Edit<</button>
      <hr>
    `
    container.appendChild(div)
  })
}

// ===== CREATE A PRICE =====
document.getElementById('createPriceForm').addEventListener('submit', async (e) => {
  // Prevent page refresh on form submit
  e.preventDefault()

  const id = document.getElementById('id').value
  const tier_name = document.getElementById('tier_name').value
  const debug = document.getElementById('debug').value
  const price = document.getElementById('price').value
  const oneonone = document.getElementById('oneonone').value

  // POST /api/prices — sends the prices text in the request body
  const res = await fetch(`${API_URL}/prices`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ 
      id,
      tier_name,
      debug,
      price,
      oneonone
    })
  })

  const data = await res.json()

  if (!res.ok) {
    // Show the error (e.g. "Please add a 'text' field")
    document.getElementById('createMsg').style.color = 'red'
    document.getElementById('createMsg').textContent = data.message || 'Failed to create pricing'
    return
  }

  // Show success message, clear the input, and refresh the prices list
  document.getElementById('createMsg').style.color = 'green'
  document.getElementById('createMsg').textContent = 'Pricing created!'
  getPrices()
})

// ===== DELETE A PRICE =====
async function deletePrice(id) {
  // Ask the user to confirm before permanently deleting
  const confirmed = confirm('Are you sure you want to delete this Price?')
  if (!confirmed) return

  // DELETE /api/prices/:id — the id is in the URL, no request body needed
  const res = await fetch(`${API_URL}/prices/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.message || 'Failed to delete price')
    return
  }

  // Refresh the list so the deleted price disappears
  getPrices()
}

// ===== SHOW EDIT FORM =====
// Called when the user clicks the Edit button on a price
// Populates the hidden edit section with the current price's id and text
function startEdit(id, tier_name, debug, price, oneonone) {
  document.getElementById('editSection').style.display = 'flex'
  document.getElementById('editing').style.display = 'flex'

  document.getElementById('editid').value = id
  document.getElementById('edittier_name').value = tier_name
  document.getElementById('editdebug').value = debug
  document.getElementById('editprice').value = price
  document.getElementById('editoneonone').value = oneonone

  document.getElementById('editSection').scrollIntoView()
}

// ===== CANCEL EDIT =====
// Hide the edit form without making any changes
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  document.getElementById('editSection').style.display = 'none'
  document.getElementById('editing').style.display = 'none'
})

// ===== SAVE EDIT =====
document.getElementById('saveEditBtn').addEventListener('click', async () => {
  // Read the price id (from the hidden input) and the updated text
  const id = Number(document.getElementById('editid').value)
  const tier_name = document.getElementById('edittier_name').value
  const debug = Number(document.getElementById('editdebug').value)
  const price = Number(document.getElementById('editprice').value)
  const oneonone = document.getElementById('editoneonone').value === 'true'

  

  // PUT /api/prices/:id — sends the updated text in the request body
  const res = await fetch(`${API_URL}/prices/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({
      tier_name,
      debug,
      price,
      oneonone
    })
  })

  const data = await res.json()

  if (!res.ok) {
    document.getElementById('editMsg').style.color = 'red'
    document.getElementById('editMsg').textContent = data.message || 'Failed to update pricing'
    return
  }

  // Show success, hide the edit form, and refresh the prices list
  document.getElementById('editMsg').style.color = 'green'
  document.getElementById('editMsg').textContent = 'Pricing updated!'
  document.getElementById('editSection').style.display = 'none'
  document.getElementById('editing').style.display = 'none'
  getPrices()
})

// ===== LOAD PRICES ON PAGE LOAD =====
// Automatically fetch and display all prices when dashboard.html is opened
getPrices()
