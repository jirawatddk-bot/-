document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupTriggerButton();
  setupScheduleForm();
  loadDashboardData();
  
  // Auto-refresh logs every 4 seconds
  setInterval(fetchLogs, 4000);
});

function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = document.getElementById(`tab-${tabName}`);
      if (targetTab) {
        targetTab.classList.add('active');
      }

      if (tabName === 'schedule') fetchWeeklySchedule();
      if (tabName === 'posts') fetchAllPosts();
      if (tabName === 'quotes') fetchAllQuotes();
      if (tabName === 'analytics') fetchAnalyticsDetail();
      if (tabName === 'logs') fetchFullLogs();
    });
  });
}

function setupTriggerButton() {
  const triggerBtn = document.getElementById('trigger-btn');
  const customTopicInput = document.getElementById('custom-topic-input');
  if (!triggerBtn) return;

  triggerBtn.addEventListener('click', async () => {
    const customTopic = customTopicInput ? customTopicInput.value.trim() : '';

    triggerBtn.disabled = true;
    triggerBtn.innerHTML = '<span class="btn-icon">⏳</span> ทีม AI กำลังทำงาน...';
    
    // Highlight agents
    animateAgentPipeline();

    try {
      const response = await fetch('/api/trigger-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customTopic: customTopic || undefined }),
      });
      const data = await response.json();

      if (data.success) {
        alert(`🎉 CEO Agent รันสำเร็จ! ${customTopic ? 'หัวข้อ: ' + customTopic : ''}`);
        if (customTopicInput) customTopicInput.value = '';
        loadDashboardData();
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ ข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์: ${err.message}`);
    } finally {
      triggerBtn.disabled = false;
      triggerBtn.innerHTML = '<span class="btn-icon">🚀</span> รันระบบทันที';
    }
  });
}

function setupScheduleForm() {
  const saveBtn = document.getElementById('save-schedule-btn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    const schedule = {};
    const days = [
      { id: '0', key: '0' },
      { id: '1', key: '1' },
      { id: '2', key: '2' },
      { id: '3', key: '3' },
      { id: '4', key: '4' },
      { id: '5', key: '5' },
      { id: '6', key: '6' },
    ];

    days.forEach(d => {
      const input = document.getElementById(`schedule-input-${d.id}`);
      const label = document.getElementById(`schedule-label-${d.id}`);
      if (input) {
        schedule[d.key] = {
          dayName: label ? label.innerText : `วัน`,
          topic: input.value.trim(),
        };
      }
    });

    try {
      const res = await fetch('/api/weekly-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ บันทึกตารางหัวข้อ 7 วันสำเร็จ!');
      } else {
        alert(`❌ บันทึกล้มเหลว: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ ข้อผิดพลาดในการบันทึก: ${err.message}`);
    }
  });
}

async function fetchWeeklySchedule() {
  const container = document.getElementById('schedule-form-container');
  if (!container) return;

  try {
    const res = await fetch('/api/weekly-topics');
    const data = await res.json();
    if (data.success && data.schedule) {
      const dayOrder = ['1', '2', '3', '4', '5', '6', '0']; // Mon to Sun order
      container.innerHTML = dayOrder.map(dayKey => {
        const item = data.schedule[dayKey] || { dayName: 'วัน', topic: '' };
        return `
          <div class="schedule-day-row">
            <div class="schedule-day-label" id="schedule-label-${dayKey}">📌 ${item.dayName}</div>
            <input type="text" id="schedule-input-${dayKey}" class="schedule-day-input" value="${escapeHtml(item.topic)}" placeholder="ใส่หัวข้อที่ต้องการให้แต่งใน${item.dayName}" />
          </div>
        `;
      }).join('');
    }
  } catch (err) {
    container.innerHTML = '<div class="empty-state">โหลดตารางหัวข้อล้มเหลว</div>';
  }
}

function animateAgentPipeline() {
  const agents = ['ceo', 'planner', 'quote', 'copywriter', 'image', 'publisher', 'analytics'];
  agents.forEach((id, idx) => {
    setTimeout(() => {
      document.querySelectorAll('.agent-box').forEach(b => b.classList.remove('active'));
      const box = document.getElementById(`agent-${id}`);
      if (box) box.classList.add('active');
    }, idx * 600);
  });
}

async function loadDashboardData() {
  await Promise.all([fetchAnalyticsSummary(), fetchPosts(), fetchLogs()]);
}

async function fetchAnalyticsSummary() {
  try {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    if (data.success && data.summary) {
      document.getElementById('stat-posts').innerText = data.summary.totalPosts || 0;
      document.getElementById('stat-reach').innerText = (data.summary.totalReach || 0).toLocaleString();
      document.getElementById('stat-likes').innerText = (data.summary.totalLikes || 0).toLocaleString();
      document.getElementById('stat-engagement').innerText = `${(data.summary.avgEngagement || 0).toFixed(1)}%`;
    }
  } catch (e) {
    console.error('Failed to fetch analytics summary', e);
  }
}

async function fetchPosts() {
  try {
    const res = await fetch('/api/posts?limit=5');
    const data = await res.json();
    const container = document.getElementById('latest-posts-container');
    
    if (!data.success || !data.posts || data.posts.length === 0) {
      container.innerHTML = '<div class="empty-state">ยังไม่มีข้อมูลโพสต์ กดรันระบบเพื่อสร้างโพสต์แรก</div>';
      return;
    }

    container.innerHTML = data.posts.map(p => `
      <div class="post-card">
        <div class="post-quote">"${escapeHtml(p.quote_isan)}"</div>
        <div class="post-meaning">แปลภาษาไทยกลาง: ${escapeHtml(p.thai_meaning)}</div>
        <div class="post-caption">${escapeHtml(p.opening_hook)}\n${escapeHtml(p.body)}</div>
        <div class="post-meta">
          <span class="badge-published">${p.status}</span>
          <span>FB Post ID: ${p.fb_post_id || 'Mock Post'}</span>
          <span>${new Date(p.created_at).toLocaleString('th-TH')}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to fetch posts', e);
  }
}

async function fetchLogs() {
  try {
    const res = await fetch('/api/logs?limit=15');
    const data = await res.json();
    const container = document.getElementById('live-logs-container');

    if (!data.success || !data.logs || data.logs.length === 0) {
      container.innerHTML = '<div class="empty-state">ยังไม่มี Log ยืนยันการรันระบบ</div>';
      return;
    }

    container.innerHTML = data.logs.map(l => `
      <div class="log-item ${l.level}">
        <span class="log-time">[${new Date(l.timestamp).toLocaleTimeString()}]</span>
        <span class="log-agent">[${escapeHtml(l.agent_name)}]</span>
        <span class="log-action">${escapeHtml(l.action)}</span>:
        <span class="log-details">${escapeHtml(l.details.slice(0, 100))}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error('Failed to fetch logs', e);
  }
}

async function fetchAllPosts() {
  const container = document.getElementById('all-posts-grid');
  container.innerHTML = '<div class="empty-state">กำลังโหลดรายการโพสต์ทั้งหมด...</div>';
  try {
    const res = await fetch('/api/posts?limit=50');
    const data = await res.json();
    if (data.posts && data.posts.length > 0) {
      container.innerHTML = data.posts.map(p => `
        <div class="post-card">
          <div class="post-quote">"${escapeHtml(p.quote_isan)}"</div>
          <div class="post-meaning">คำแปล: ${escapeHtml(p.thai_meaning)}</div>
          <div class="post-caption"><b>Hook:</b> ${escapeHtml(p.opening_hook)}<br><b>Prompt:</b> ${escapeHtml(p.image_prompt)}</div>
          <div class="post-meta">
            <span class="badge-published">${p.status}</span>
            <span>${new Date(p.created_at).toLocaleString('th-TH')}</span>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="empty-state">ยังไม่มีโพสต์ในระบบ</div>';
    }
  } catch (e) {
    container.innerHTML = '<div class="empty-state">โหลดข้อมูลล้มเหลว</div>';
  }
}

async function fetchAllQuotes() {
  const container = document.getElementById('all-quotes-grid');
  container.innerHTML = '<div class="empty-state">กำลังโหลดคลังคำคม...</div>';
  try {
    const res = await fetch('/api/quotes?limit=50');
    const data = await res.json();
    if (data.quotes && data.quotes.length > 0) {
      container.innerHTML = data.quotes.map(q => `
        <div class="quote-card">
          <div class="post-quote">"${escapeHtml(q.quote_isan)}"</div>
          <div class="post-meaning">แปล: ${escapeHtml(q.thai_meaning)}</div>
          <div class="post-meta">
            <span>อารมณ์: ${escapeHtml(q.emotion)}</span>
            <span>คีย์เวิร์ด: ${escapeHtml(q.keywords)}</span>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<div class="empty-state">ยังไม่มีคำคมในระบบ</div>';
    }
  } catch (e) {
    container.innerHTML = '<div class="empty-state">โหลดข้อมูลล้มเหลว</div>';
  }
}

async function fetchAnalyticsDetail() {
  const container = document.getElementById('analytics-detail-container');
  container.innerHTML = '<div class="empty-state">กำลังโหลดผลวิเคราะห์...</div>';
  try {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    if (data.recent && data.recent.length > 0) {
      container.innerHTML = `
        <div class="card">
          <h4>📊 สรุปประสิทธิภาพคอนเทนต์ (Performance Summary)</h4>
          <p>จำนวนโพสต์ที่วิเคราะห์: <b>${data.summary.totalPosts}</b> โพสต์</p>
          <p>ผู้เข้าถึงสะสม (Total Reach): <b>${data.summary.totalReach.toLocaleString()}</b> คน</p>
          <p>ยอด Like รวม: <b>${data.summary.totalLikes.toLocaleString()}</b> | Comment รวม: <b>${data.summary.totalComments.toLocaleString()}</b> | Share รวม: <b>${data.summary.totalShares.toLocaleString()}</b></p>
        </div>
      `;
    } else {
      container.innerHTML = '<div class="empty-state">ยังไม่มีข้อมูลวิเคราะห์ รันระบบเพื่อเริ่มเก็บข้อมูล</div>';
    }
  } catch (e) {
    container.innerHTML = '<div class="empty-state">โหลดข้อมูลล้มเหลว</div>';
  }
}

async function fetchFullLogs() {
  const container = document.getElementById('full-logs-container');
  try {
    const res = await fetch('/api/logs?limit=100');
    const data = await res.json();
    if (data.logs && data.logs.length > 0) {
      container.innerHTML = data.logs.map(l => `
        <div class="log-item ${l.level}">
          <span class="log-time">[${new Date(l.timestamp).toLocaleString()}]</span>
          <span class="log-agent">[${escapeHtml(l.agent_name)}]</span>
          <span class="log-action">${escapeHtml(l.action)}</span>:
          <span class="log-details">${escapeHtml(l.details)}</span>
        </div>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = '<div class="empty-state">โหลดข้อมูลล้มเหลว</div>';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
