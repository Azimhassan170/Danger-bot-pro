const APP_ID = 1089; 
const WS_URL = `wss://ws.binaryws.com/websockets/v3?app_id=${APP_ID}`;

let ws = null;

const tokenInput = document.getElementById('api-token');
const connectBtn = document.getElementById('connect-btn');
const statusMsg = document.getElementById('status-msg');
const authBox = document.getElementById('auth-box');
const userInfo = document.getElementById('user-info');
const userLoginid = document.getElementById('user-loginid');
const userBalance = document.getElementById('user-balance');
const userCurrency = document.getElementById('user-currency');
const logoutBtn = document.getElementById('logout-btn');

function showStatus(msg, type) {
  statusMsg.textContent = msg;
  statusMsg.className = `status ${type}`;
  statusMsg.style.display = 'block';
}

function initConnection(token) {
  showStatus('Connecting to Server...', 'info');

  if (ws) {
    ws.close();
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    showStatus('Authenticating Token...', 'info');
    ws.send(JSON.stringify({ authorize: token }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.error) {
      showStatus(`Error: ${data.error.message}`, 'error');
      localStorage.removeItem('deriv_token');
      return;
    }

    if (data.msg_type === 'authorize') {
      showStatus('Successfully Connected!', 'success');
      localStorage.setItem('deriv_token', token);
      
      authBox.style.display = 'none';
      userInfo.style.display = 'block';

      userLoginid.textContent = data.authorize.loginid;
      userBalance.textContent = `${data.authorize.balance} ${data.authorize.currency}`;
      userCurrency.textContent = data.authorize.currency;

      ws.send(JSON.stringify({ balance: 1, subscribe: 1 }));
    }

    if (data.msg_type === 'balance') {
      if (data.balance) {
        userBalance.textContent = `${data.balance.balance} ${data.balance.currency}`;
      }
    }
  };

  ws.onerror = (err) => {
    showStatus('Connection Error. Check Network.', 'error');
  };

  ws.onclose = () => {
    console.log('WebSocket Closed');
  };
}

connectBtn.addEventListener('click', () => {
  const token = tokenInput.value.trim();
  if (!token) {
    showStatus('Please enter a valid API Token!', 'error');
    return;
  }
  initConnection(token);
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('deriv_token');
  if (ws) ws.close();
  authBox.style.display = 'block';
  userInfo.style.display = 'none';
  statusMsg.style.display = 'none';
  tokenInput.value = '';
});

window.addEventListener('load', () => {
  const savedToken = localStorage.getItem('deriv_token');
  if (savedToken) {
    tokenInput.value = savedToken;
    initConnection(savedToken);
  }
});