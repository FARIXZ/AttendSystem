let currentUser = null;
let currentUserId = null;

// --- INDEX PAGE LOGIC ---
if (document.getElementById('registerForm')) {
  // Register
  document.getElementById('registerForm').onsubmit = async function (e) {
    e.preventDefault();
    const name = regName.value.trim();
    const email = regEmail.value.trim();
    const password = regPassword.value;
    registerMsg.textContent = '';
    try {
      const res = await fetch('/users/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        registerMsg.textContent = 'Registration successful!';
        registerMsg.className = 'msg success';
      } else {
        registerMsg.textContent = data.error || 'Registration failed.';
        registerMsg.className = 'msg error';
      }
    } catch (err) {
      registerMsg.textContent = 'Network error.';
      registerMsg.className = 'msg error';
    }
  };

  // Login
  document.getElementById('loginForm').onsubmit = async function (e) {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    loginMsg.textContent = '';
    try {
      const res = await fetch('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        // Fetch user info to get id
        const userRes = await fetch('/users/all');
        const users = await userRes.json();
        const user = users.find((u) => u.email === email.toLowerCase());
        if (user) {
          localStorage.setItem('attendUser', JSON.stringify(user));
          window.location.href = 'dashboard.html';
        } else {
          loginMsg.textContent = 'User info not found after login.';
          loginMsg.className = 'msg error';
        }
      } else {
        loginMsg.textContent = data.message || 'Invalid email or password.';
        loginMsg.className = 'msg error';
      }
    } catch (err) {
      loginMsg.textContent = 'Network error.';
      loginMsg.className = 'msg error';
    }
  };
}

// --- DASHBOARD PAGE LOGIC ---
if (document.getElementById('welcomeMsg')) {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem('attendUser'));
  if (!user) {
    window.location.href = 'index.html';
  }
  document.getElementById('welcomeMsg').textContent = `Welcome, ${user.name || user.email}!`;
  // Show sections
  document.getElementById('attendSection').style.display = '';
  if (user.role === 'admin') {
    document.getElementById('adminSection').style.display = '';
  }
  // Attendance
  document.getElementById('attendBtn').onclick = async function () {
    attendMsg.textContent = '';
    try {
      const res = await fetch('/attend/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        attendMsg.textContent = 'Attendance marked!';
        attendMsg.className = 'msg success';
      } else {
        attendMsg.textContent = data.error || 'Attendance failed.';
        attendMsg.className = 'msg error';
      }
    } catch (err) {
      attendMsg.textContent = 'Network error.';
      attendMsg.className = 'msg error';
    }
  };
  // Admin: Get all attendances
  document.getElementById('getAllAttendBtn').onclick = async function () {
    allAttendMsg.textContent = '';
    allAttendList.innerHTML = '';
    try {
      // Calculate today's range
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const startISO = start.toISOString();
      const endISO = end.toISOString();
      const res = await fetch(`/attend/all?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
      const users = await res.json();
      if (Array.isArray(users) && users.length > 0) {
        allAttendMsg.textContent = `Found ${users.length} user(s) with attendance today:`;
        allAttendMsg.className = 'msg success';
        users.forEach((u) => {
          let timeStr = '';
          if (u.attendance && Array.isArray(u.attendance)) {
            const todayEntries = u.attendance.filter((entry) => {
              const ts = new Date(entry.timestamp);
              return ts >= start && ts < end;
            });
            if (todayEntries.length > 0) {
              const latest = todayEntries[todayEntries.length - 1];
              const date = new Date(latest.timestamp);
              let hours = date.getHours();
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12;
              hours = hours ? hours : 12;
              timeStr = ` at ${hours}:${minutes} ${ampm}`;
            }
          }
          const li = document.createElement('li');
          li.textContent = `${u.name || u.id || u.email}${timeStr}`;
          allAttendList.appendChild(li);
        });
      } else {
        allAttendMsg.textContent = 'No attendances found for today.';
        allAttendMsg.className = 'msg error';
      }
    } catch (err) {
      allAttendMsg.textContent = 'Network error.';
      allAttendMsg.className = 'msg error';
    }
  };
  // Logout
  document.getElementById('logoutBtn').onclick = function () {
    localStorage.removeItem('attendUser');
    window.location.href = 'index.html';
  };
}
