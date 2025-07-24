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
    const adminTabs = document.getElementById('adminTabs');
    if (adminTabs) adminTabs.style.display = '';
  }
  // Admin: Periodic Report
  const getPeriodicBtn = document.getElementById('getPeriodicBtn');
  if (getPeriodicBtn) {
    getPeriodicBtn.onclick = async function () {
      const periodicMsg = document.getElementById('periodicMsg');
      const periodicTableBody = document.getElementById('periodicTableBody');
      const startInput = document.getElementById('periodicStart');
      const endInput = document.getElementById('periodicEnd');
      const periodicTableOuter = document.getElementById('periodicTableOuter');
      periodicMsg.textContent = '';
      periodicTableBody.innerHTML = '';
      if (periodicTableOuter) periodicTableOuter.style.display = 'block';
      const startVal = startInput.value;
      const endVal = endInput.value;
      if (!startVal || !endVal) {
        periodicMsg.textContent = 'Please select both start and end dates.';
        periodicMsg.className = 'msg error';
        return;
      }
      // Set end date to next day for exclusive range
      const startISO = new Date(startVal).toISOString();
      const endDate = new Date(endVal);
      endDate.setDate(endDate.getDate() + 1);
      const endISO = endDate.toISOString();
      try {
        const res = await fetch(`/attend/all?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          periodicMsg.textContent = `Found ${users.length} user(s) with attendance in range:`;
          periodicMsg.className = 'msg success';
          users.forEach((u) => {
            let times = [];
            if (u.attendance && Array.isArray(u.attendance)) {
              const entries = u.attendance.filter((entry) => {
                const ts = new Date(entry.timestamp);
                return ts >= new Date(startVal) && ts < endDate;
              });
              times = entries.map((e) => {
                const date = new Date(e.timestamp);
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                return `${date.toLocaleDateString()} ${hours}:${minutes} ${ampm}`;
              });
            }
            const tr = document.createElement('tr');
            const tdUser = document.createElement('td');
            tdUser.className = 'user-col';
            tdUser.textContent = u.name || u.id || u.email;
            const tdTimes = document.createElement('td');
            tdTimes.className = 'attend-col';
            if (times.length) {
              let grouped = [];
              for (let i = 0; i < times.length; i += 5) {
                grouped.push(times.slice(i, i + 5).join(', '));
              }
              tdTimes.innerHTML = grouped.join('<br>');
            } else {
              tdTimes.textContent = '-';
            }
            tr.appendChild(tdUser);
            tr.appendChild(tdTimes);
            periodicTableBody.appendChild(tr);
          });
        } else {
          periodicMsg.textContent = 'No attendances found for this period.';
          periodicMsg.className = 'msg error';
          if (periodicTableOuter) periodicTableOuter.style.display = 'block';
        }
      } catch (err) {
        periodicMsg.textContent = 'Network error.';
        periodicMsg.className = 'msg error';
      }
    };
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
  // Tab logic
  const adminTabs = document.getElementById('adminTabs');
  const tabToday = document.getElementById('tabToday');
  const tabPeriodic = document.getElementById('tabPeriodic');
  const todayAttendanceTab = document.getElementById('todayAttendanceTab');
  const periodicReportTab = document.getElementById('periodicReportTab');
  if (adminTabs) {
    tabToday.onclick = function () {
      tabToday.classList.add('active');
      tabPeriodic.classList.remove('active');
      todayAttendanceTab.style.display = '';
      periodicReportTab.style.display = 'none';
      if (periodicTableOuter) periodicTableOuter.style.display = 'none';
    };
    tabPeriodic.onclick = function () {
      tabPeriodic.classList.add('active');
      tabToday.classList.remove('active');
      periodicReportTab.style.display = '';
      todayAttendanceTab.style.display = 'none';
      if (periodicTableOuter) periodicTableOuter.style.display = 'block';
    };
  }
}
// Tab switching logic
const tabRegister = document.getElementById('tabRegister');
const tabLogin = document.getElementById('tabLogin');
const registerSection = document.getElementById('registerSection');
const loginSection = document.getElementById('loginSection');
tabRegister.onclick = function () {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerSection.style.display = '';
  loginSection.style.display = 'none';
  setTimeout(() => {
    registerSection.style.opacity = 1;
    loginSection.style.opacity = 0;
  }, 10);
};
tabLogin.onclick = function () {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginSection.style.display = '';
  registerSection.style.display = 'none';
  setTimeout(() => {
    loginSection.style.opacity = 1;
    registerSection.style.opacity = 0;
  }, 10);
};
