export const getFrontendHTML = () => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Job Matcher & Assistant</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0b0f19;
      --card-bg: rgba(17, 24, 39, 0.7);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #8b5cf6;
      --primary-glow: rgba(139, 92, 246, 0.3);
      --secondary: #06b6d4;
      --secondary-glow: rgba(6, 182, 212, 0.3);
      --accent: #f97316;
      --success: #10b981;
      --success-glow: rgba(16, 185, 129, 0.2);
      --warning: #f59e0b;
      --font-outfit: 'Outfit', sans-serif;
      --font-inter: 'Inter', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-inter);
      min-height: 100vh;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 40%);
      background-attachment: fixed;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1.5rem;
    }

    .logo {
      font-family: var(--font-outfit);
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #a78bfa, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .docs-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      font-family: var(--font-outfit);
    }

    .docs-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--secondary);
      box-shadow: 0 0 10px var(--secondary-glow);
    }

    /* Grid Layout */
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .grid {
        grid-template-columns: 380px 1fr;
      }
    }

    /* Card styling */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
      transition: border-color 0.3s ease;
    }

    .card:hover {
      border-color: rgba(255, 255, 255, 0.15);
    }

    .card-title {
      font-family: var(--font-outfit);
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Input elements */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    textarea, input, select {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.8rem;
      color: #fff;
      font-family: var(--font-inter);
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    textarea:focus, input:focus, select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 10px var(--primary-glow);
    }

    textarea {
      resize: vertical;
      min-height: 250px;
    }

    .btn {
      width: 100%;
      background: linear-gradient(135deg, var(--primary), #7c3aed);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 1rem;
      font-family: var(--font-outfit);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
    }

    .btn:disabled {
      background: #374151;
      box-shadow: none;
      cursor: not-allowed;
      transform: none;
    }

    /* CV Analysis Tags */
    .analysis-section {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .analysis-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
      margin-top: 0.5rem;
    }

    .tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.8rem;
      border-radius: 20px;
      font-size: 0.85rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .tag-primary {
      border-color: var(--primary);
      color: #c084fc;
      background: rgba(139, 92, 246, 0.1);
    }

    .tag-secondary {
      border-color: var(--secondary);
      color: #22d3ee;
      background: rgba(6, 182, 212, 0.1);
    }

    /* Job list */
    .job-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .job-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .job-card:hover {
      background: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.8rem;
    }

    .job-title {
      font-family: var(--font-outfit);
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
    }

    .job-company {
      font-size: 0.9rem;
      color: var(--secondary);
      font-weight: 500;
      margin-top: 0.2rem;
    }

    .job-meta-row {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .job-desc {
      font-size: 0.9rem;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 1.2rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .job-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .link-btn {
      color: var(--secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
      transition: opacity 0.2s;
    }

    .link-btn:hover {
      opacity: 0.8;
      text-decoration: underline;
    }

    .action-btn {
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid var(--secondary);
      color: #22d3ee;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-family: var(--font-outfit);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: var(--secondary);
      color: var(--bg-dark);
      box-shadow: 0 0 15px var(--secondary-glow);
    }

    /* Modal / Split Side Panel for Deep Analysis */
    .analysis-panel {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      max-width: 600px;
      height: 100%;
      background: #0f172a;
      border-left: 1px solid var(--border-color);
      box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
      z-index: 1000;
      transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 2.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .analysis-panel.open {
      right: 0;
    }

    .panel-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(4px);
    }

    .panel-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #fff;
    }

    /* Score Radial Indicator */
    .score-container {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.2rem;
      margin-bottom: 2rem;
    }

    .radial-progress {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: conic-gradient(var(--primary) 0%, rgba(255, 255, 255, 0.05) 0%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .radial-progress::before {
      content: "";
      position: absolute;
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: #0f172a;
    }

    .score-value {
      position: relative;
      font-family: var(--font-outfit);
      font-size: 1.3rem;
      font-weight: 700;
      color: #fff;
    }

    .score-text-wrapper h4 {
      font-family: var(--font-outfit);
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }

    .score-text-wrapper p {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }

    .section-title {
      font-family: var(--font-outfit);
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 1.8rem;
      margin-bottom: 0.8rem;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .section-content {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.2rem;
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-main);
    }

    .tips-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .tips-list li {
      position: relative;
      padding-left: 1.5rem;
    }

    .tips-list li::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: var(--success);
      font-weight: 700;
    }

    .cover-letter-box {
      font-family: var(--font-inter);
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
      background: rgba(0, 0, 0, 0.4);
    }

    .copy-btn {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid var(--primary);
      color: #c084fc;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
      float: right;
      transition: all 0.2s;
    }

    .copy-btn:hover {
      background: var(--primary);
      color: #fff;
    }

    /* Loader */
    .loader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      gap: 1rem;
      color: var(--text-muted);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.05);
      border-top-color: var(--secondary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .intro-msg {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }

    .intro-msg svg {
      width: 64px;
      height: 64px;
      stroke: rgba(255, 255, 255, 0.1);
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <span class="logo-icon"></span>
        AI Job Matcher
      </div>
      <a href="/api/docs" class="docs-btn" target="_blank">Swagger API Docs</a>
    </header>

    <div class="grid">
      <!-- Input Sidebar -->
      <div>
        <div class="card">
          <div class="card-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Tải lên CV của bạn
          </div>
          <form id="recommendForm">
            <div class="form-group">
              <label for="cv_content">Nội dung CV (Văn bản)</label>
              <textarea id="cv_content" placeholder="Dán nội dung CV của bạn tại đây để phân tích..." required></textarea>
            </div>
            
            <div class="form-group">
              <label for="source">Nguồn tìm kiếm việc làm</label>
              <select id="source">
                <option value="linkedin">LinkedIn Jobs (Thật & Live)</option>
                <option value="fpt">FPT Software Jobs (Tuyển dụng FPT)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="query">Từ khóa tìm kiếm (Tùy chọn)</label>
              <input type="text" id="query" placeholder="Ví dụ: React Developer, Nodejs...">
            </div>

            <div class="form-group">
              <label for="location">Địa điểm (Tùy chọn)</label>
              <input type="text" id="location" placeholder="Ví dụ: Ho Chi Minh, Da Nang...">
            </div>

            <button type="submit" id="submitBtn" class="btn">Tìm công việc phù hợp</button>
          </form>
        </div>
      </div>

      <!-- Results Area -->
      <div>
        <!-- CV Analysis Banner (Hidden Initially) -->
        <div id="cvAnalysisCard" class="card" style="display: none; margin-bottom: 2rem;">
          <div class="card-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Hồ sơ ứng viên trích xuất
          </div>
          <div class="analysis-section">
            <h3 id="cvRole" style="font-family: var(--font-outfit); font-size: 1.4rem; margin-bottom: 0.5rem;"></h3>
            <div class="analysis-meta">
              <span id="cvExp" class="tag tag-primary"></span>
              <span id="cvEdu" class="tag tag-primary"></span>
              <span id="cvLoc" class="tag tag-secondary"></span>
            </div>
          </div>
          <div>
            <h4 style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.8rem;">Kỹ năng nhận diện:</h4>
            <div id="cvSkills" class="analysis-meta"></div>
          </div>
        </div>

        <!-- Job Board -->
        <div class="card">
          <div class="card-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Bảng tin việc làm đề xuất
          </div>

          <div id="boardContent">
            <div class="intro-msg">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p>Điền nội dung CV và bấm nút tìm kiếm để hiển thị các công việc phù hợp nhất.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Deep Analysis Side Panel -->
  <div id="panelBackdrop" class="panel-backdrop"></div>
  <div id="analysisPanel" class="analysis-panel">
    <div class="panel-header">
      <div>
        <h3 id="panelJobTitle" style="font-family: var(--font-outfit); font-size: 1.3rem; color: #fff;"></h3>
        <p id="panelJobCompany" style="font-size: 0.9rem; color: var(--secondary); font-weight: 500;"></p>
      </div>
      <button id="closePanelBtn" class="close-btn">&times;</button>
    </div>

    <div id="panelContent">
      <!-- Detailed analysis loaded here -->
    </div>
  </div>

  <script>
    let currentCvAnalysis = null;

    document.getElementById("recommendForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const cvContent = document.getElementById("cv_content").value;
      const source = document.getElementById("source").value;
      const query = document.getElementById("query").value;
      const locationVal = document.getElementById("location").value;
      
      const submitBtn = document.getElementById("submitBtn");
      const boardContent = document.getElementById("boardContent");
      const cvAnalysisCard = document.getElementById("cvAnalysisCard");

      submitBtn.disabled = true;
      submitBtn.innerText = "Đang tìm kiếm & phân tích...";
      boardContent.innerHTML = \`
        <div class="loader">
          <div class="spinner"></div>
          <p>Đang trích xuất thông tin CV và quét việc làm...</p>
        </div>
      \`;

      try {
        const response = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cv_content: cvContent,
            source,
            query: query || undefined,
            location: locationVal || undefined
          })
        });

        if (!response.ok) throw new Error("Yêu cầu thất bại");

        const data = await response.json();
        currentCvAnalysis = data.cv_analysis;

        // Render CV Analysis Banner
        document.getElementById("cvRole").innerText = currentCvAnalysis.current_role;
        document.getElementById("cvExp").innerText = currentCvAnalysis.years_experience + " năm kinh nghiệm";
        document.getElementById("cvEdu").innerText = currentCvAnalysis.education;
        document.getElementById("cvLoc").innerText = currentCvAnalysis.location;
        
        const cvSkillsDiv = document.getElementById("cvSkills");
        cvSkillsDiv.innerHTML = "";
        currentCvAnalysis.skills.forEach(skill => {
          cvSkillsDiv.innerHTML += \`<span class="tag">\${skill}</span>\`;
        });
        cvAnalysisCard.style.display = "block";

        // Render Jobs Grid
        if (data.jobs.length === 0) {
          boardContent.innerHTML = \`
            <div class="intro-msg">
              <p>Không tìm thấy công việc nào phù hợp.</p>
            </div>
          \`;
        } else {
          boardContent.innerHTML = "";
          const jobList = document.createElement("div");
          jobList.className = "job-list";

          data.jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.className = "job-card";
            jobCard.innerHTML = \`
              <div class="job-header">
                <div>
                  <h3 class="job-title">\${job.title}</h3>
                  <div class="job-company">\${job.company}</div>
                </div>
              </div>
              <div class="job-meta-row">
                <span>📍 \${job.location}</span>
                \${job.salary_range ? \`<span>💰 \${job.salary_range}</span>\` : ""}
                \${job.deadline ? \`<span>📅 Hạn: \${job.deadline}</span>\` : ""}
              </div>
              <p class="job-desc">\${job.job_description}</p>
              <div class="job-actions">
                <a href="\${job.job_url}" target="_blank" class="link-btn">
                  Xem gốc 
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>
                <button class="action-btn" onclick="openJobAnalysis(\${JSON.stringify(job).replace(/"/g, '&quot;')})">Đánh giá độ phù hợp</button>
              </div>
            \`;
            jobList.appendChild(jobCard);
          });
          boardContent.appendChild(jobList);
        }

      } catch (err) {
        boardContent.innerHTML = \`
          <div class="intro-msg">
            <p style="color: #ef4444;">Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng kiểm tra lại.</p>
          </div>
        \`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Tìm công việc phù hợp";
      }
    });

    async function openJobAnalysis(job) {
      const panel = document.getElementById("analysisPanel");
      const backdrop = document.getElementById("panelBackdrop");
      const panelContent = document.getElementById("panelContent");

      document.getElementById("panelJobTitle").innerText = job.title;
      document.getElementById("panelJobCompany").innerText = job.company;

      panel.classList.add("open");
      backdrop.classList.add("show");

      panelContent.innerHTML = \`
        <div class="loader">
          <div class="spinner"></div>
          <p>AI đang so sánh CV của bạn với công việc...</p>
        </div>
      \`;

      try {
        const response = await fetch("/api/analyze-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cv_analysis: currentCvAnalysis,
            job: job
          })
        });

        if (!response.ok) throw new Error("Phân tích thất bại");

        const data = await response.json();
        
        // Render detailed analytics
        const scorePercentage = Math.round(data.fit_score * 100);
        
        panelContent.innerHTML = \`
          <!-- Score Banner -->
          <div class="score-container">
            <div class="radial-progress" style="background: conic-gradient(var(--secondary) \&nbsp;\${scorePercentage}%, rgba(255, 255, 255, 0.05) 0%);">
              <span class="score-value">\${scorePercentage}%</span>
            </div>
            <div class="score-text-wrapper">
              <h4>Điểm số phù hợp</h4>
              <p>Mức độ tương thích giữa hồ sơ của bạn với mô tả công việc của nhà tuyển dụng.</p>
            </div>
          </div>

          <!-- Why Fit -->
          <div class="section-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Đánh giá từ AI
          </div>
          <div class="section-content">
            \${data.why_good_fit}
          </div>

          <!-- Skills Comparison -->
          <div class="section-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            Phân tích kỹ năng chuyên môn
          </div>
          <div class="section-content" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <div style="font-size: 0.85rem; color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">Kỹ năng đáp ứng:</div>
              <div class="analysis-meta">
                \${data.matching_skills.map(s => \`<span class="tag tag-primary" style="border-color: var(--success); color: #a7f3d0; background: rgba(16, 185, 129, 0.1);">\${s}</span>\`).join("") || '<span style="color: var(--text-muted);">Không phát hiện kỹ năng tương thích nào.</span>'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.85rem; color: var(--accent); font-weight: 600; margin-bottom: 0.5rem;">Kỹ năng còn thiếu / cần bổ sung:</div>
              <div class="analysis-meta">
                \${data.missing_skills.map(s => \`<span class="tag" style="border-color: var(--accent); color: #fdba74; background: rgba(249, 115, 22, 0.1);">\${s}</span>\`).join("") || '<span style="color: var(--success);">Bạn đã có đủ mọi kỹ năng bắt buộc!</span>'}
              </div>
            </div>
          </div>

          <!-- Interview Tips -->
          <div class="section-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            Mẹo phỏng vấn từ AI
          </div>
          <div class="section-content">
            <ul class="tips-list">
              \${data.interview_tips.map(tip => \`<li>\${tip}</li>\`).join("")}
            </ul>
          </div>

          <!-- Cover Letter -->
          <div class="section-title" style="justify-content: space-between;">
            <span style="display: flex; align-items: center; gap: 0.4rem;">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Thư xin việc gợi ý
            </span>
            <button class="copy-btn" onclick="copyCoverLetter()">Copy Thư</button>
          </div>
          <div id="coverLetterText" class="section-content cover-letter-box">\${data.cover_letter}</div>
        \`;

      } catch (err) {
        panelContent.innerHTML = \`
          <div class="intro-msg">
            <p style="color: #ef4444;">Không thể tải kết quả phân tích. Vui lòng thử lại sau.</p>
          </div>
        \`;
      }
    }

    function closePanel() {
      document.getElementById("analysisPanel").classList.remove("open");
      document.getElementById("panelBackdrop").classList.remove("show");
    }

    document.getElementById("closePanelBtn").addEventListener("click", closePanel);
    document.getElementById("panelBackdrop").addEventListener("click", closePanel);

    function copyCoverLetter() {
      const text = document.getElementById("coverLetterText").innerText;
      navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector(".copy-btn");
        copyBtn.innerText = "Đã Copy!";
        setTimeout(() => {
          copyBtn.innerText = "Copy Thư";
        }, 2000);
      });
    }
  </script>
</body>
</html>
`;
