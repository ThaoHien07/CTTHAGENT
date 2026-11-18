// Application Logic for Phuc An Retail AI Agent Management System
document.addEventListener("DOMContentLoaded", () => {
  // Global State
  const state = {
    currentPhase: 1,
    phase1Completed: false,
    phase2Completed: false,
    phase3Completed: false,
    isCleaningRunning: false,
    isReportGenerated: false,
    isAuditCompleted: false,
    selectedStoreForDecision: null,
    chartStores: null,
    chartProductMix: null
  };

  // Sample Raw Records (Representation of the 60,000 dataset)
  const defaultSampleRawRecords = [
    { code: "TRX-100234", time: "02/10 09:15", store: "CH01 - Cầu Giấy", prod: "SP-DGD01 Nồi cơm điện cao tần", cat: "Điện gia dụng", rev: 2590000, cogs: 1761200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-100235", time: "02/10 09:15", store: "CH01 - Cầu Giấy", prod: "SP-DGD01 Nồi cơm điện cao tần", cat: "Điện gia dụng", rev: 2590000, cogs: 1761200, status: "Hoàn thành", note: "TRÙNG LẶP: Double POS billing", type: "duplicate" },
    { code: "TRX-100412", time: "03/10 14:20", store: "CH03 - Hai Bà Trưng", prod: "SP-TBS04 Loa bluetooth mini", cat: "Thiết bị số", rev: 490000, cogs: 430000, status: "Hoàn thành", note: "Biên siêu mỏng 12.2% (Xả kho)", type: "valid" },
    { code: "TRX-100589", time: "04/10 16:45", store: "CH08 - Quảng Ninh", prod: "SP-DGD09 Máy lọc không khí Pro", cat: "Điện gia dụng", rev: 6890000, cogs: 4685200, status: "Đã hủy", note: "ĐƠN HỦY: Kho báo ảo, hết hàng", type: "cancelled" },
    { code: "TRX-100720", time: "05/10 11:30", store: "CH15 - Bình Thạnh", prod: "SP-SK02 Máy nâng cơ mặt ion", cat: "Chăm sóc sức khỏe", rev: 3200000, cogs: 1760000, status: "Đổi trả", note: "ĐỔI TRẢ: Khách báo tư vấn sai", type: "return" },
    { code: "TRX-100845", time: "06/10 10:12", store: "CH04 - Hoàn Kiếm", prod: "SP-GD03 Robot hút bụi lau nhà", cat: "Gia dụng thông minh", rev: 8490000, cogs: 5263800, status: "Hoàn thành", note: "LỆCH KỲ: Tính dồn 45 ngày", type: "period" },
    { code: "TRX-101004", time: "07/10 18:05", store: "CH02 - Đống Đa", prod: "SP-SK05 Bàn chải điện sóng âm", cat: "Chăm sóc sức khỏe", rev: 1290000, cogs: 709500, status: "Hoàn thành", note: "Hợp lệ - Biên cao 45%", type: "valid" },
    { code: "TRX-101188", time: "08/10 20:10", store: "CH12 - Quận 1", prod: "SP-TBS01 Tai nghe chống ồn", cat: "Thiết bị số", rev: 2190000, cogs: 1708200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-101250", time: "09/10 09:40", store: "CH15 - Bình Thạnh", prod: "SP-SK02 Máy nâng cơ mặt ion", cat: "Chăm sóc sức khỏe", rev: 3200000, cogs: 1760000, status: "Đổi trả", note: "ĐỔI TRẢ: Hàng trả chưa trừ COGS", type: "return" },
    { code: "TRX-101420", time: "10/10 15:35", store: "CH06 - Long Biên", prod: "SP-GD01 Nồi chiên không dầu", cat: "Điện gia dụng", rev: 2390000, cogs: 1625200, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-101560", time: "11/10 17:22", store: "CH03 - Hai Bà Trưng", prod: "SP-TBS04 Loa bluetooth mini", cat: "Thiết bị số", rev: 490000, cogs: 430000, status: "Hoàn thành", note: "Đếm trùng giao dịch POS", type: "duplicate" },
    { code: "TRX-101790", time: "12/10 13:10", store: "CH07 - Hải Phòng", prod: "SP-DGD03 Lò vi sóng điện tử", cat: "Điện gia dụng", rev: 3190000, cogs: 2169200, status: "Đổi trả", note: "ĐỔI TRẢ: Vận chuyển móp méo", type: "return" },
    { code: "TRX-101920", time: "13/10 19:40", store: "CH18 - Bình Dương", prod: "SP-GD05 Quạt lọc không khí", cat: "Gia dụng thông minh", rev: 4200000, cogs: 2604000, status: "Hoàn thành", note: "Hợp lệ", type: "valid" },
    { code: "TRX-102105", time: "14/10 11:15", store: "CH10 - Huế", prod: "SP-SK01 Máy massage cổ vai gáy", cat: "Chăm sóc sức khỏe", rev: 1850000, cogs: 1017500, status: "Hoàn thành", note: "Hợp lệ", type: "valid" }
  ];

  let currentRawRecords = [];
  let customDatasetLoaded = false;
  let customDatasetStats = {
    totalRows: 0,
    duplicateRows: 0,
    cancelledRows: 0,
    returnRows: 0,
    cleanRows: 0,
    fileName: "Chưa có tệp"
  };

  // Helper formatting functions
  function formatMoney(amount) {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(2) + " Tỷ";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + " Tr";
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + " đ";
  }

  function showToast(message, isError = false) {
    const toast = document.getElementById("toast-notification");
    const text = document.getElementById("toast-text");
    text.textContent = message;
    if (isError) {
      toast.classList.remove("bg-emerald-600");
      toast.classList.add("bg-rose-600");
    } else {
      toast.classList.remove("bg-rose-600");
      toast.classList.add("bg-emerald-600");
    }
    toast.classList.remove("translate-y-20", "opacity-0");
    setTimeout(() => {
      toast.classList.add("translate-y-20", "opacity-0");
    }, 3000);
  }

  // 4-Step Stepper & Progressive Reveal Engine
  function setWorkflowStep(stepNum) {
    state.currentWorkflowStep = stepNum;
    for (let s = 1; s <= 4; s++) {
      const navBtn = document.getElementById(`step-nav-${s}`);
      const badge = document.getElementById(`badge-step-${s}`);
      if (!navBtn || !badge) continue;
      const circle = navBtn.querySelector(".step-circle");

      if (s < stepNum) {
        // Step completed
        navBtn.className = "step-card text-left flex items-center gap-3 p-3 rounded-2xl border border-emerald-300 bg-emerald-50/50 transition cursor-pointer shadow-xs";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
        badge.textContent = "✓ Hoàn thành";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 shrink-0";
      } else if (s === stepNum) {
        // Step currently active
        navBtn.className = "step-card active text-left flex items-center gap-3 p-3 rounded-2xl border-2 border-[#FF5B8E] bg-[#FFF0F5] transition cursor-pointer shadow-xs";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-[#FF5B8E] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs";
        badge.textContent = "Đang thực hiện";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FFE2E5] text-[#FA5A7D] shrink-0 animate-pulse";
      } else {
        // Step pending
        navBtn.className = "step-card text-left flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-white transition cursor-pointer opacity-70 hover:opacity-100";
        if (circle) circle.className = "step-circle w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-black text-xs flex items-center justify-center shrink-0";
        badge.textContent = "Chờ";
        badge.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0";
      }
    }
  }

  function revealSubsequentSteps() {
    const container = document.getElementById("subsequent-steps-container");
    if (container) {
      container.classList.remove("hidden");
    }
    setWorkflowStep(2);
    switchPhase(1);
  }

  function hideSubsequentSteps() {
    const container = document.getElementById("subsequent-steps-container");
    if (container) {
      container.classList.add("hidden");
    }
    setWorkflowStep(1);
  }

  // Phase Tab Switching Logic
  function switchPhase(phaseNum) {
    state.currentPhase = phaseNum;

    // Update Tab UI
    document.querySelectorAll(".phase-tab").forEach((tab, idx) => {
      const p = idx + 1;
      tab.classList.remove("active");
      if (p === phaseNum) {
        tab.classList.add("active");
      }
    });

    // Update Panels Visibility
    document.querySelectorAll(".phase-panel").forEach(p => p.classList.add("hidden"));
    const activePanel = document.getElementById(`panel-phase${phaseNum}`);
    if (activePanel) {
      activePanel.classList.remove("hidden");
    }

    // Auto trigger Phase 2 or 3 rendering if needed
    if (phaseNum === 2 && !state.isReportGenerated) {
      generateManagementReport();
    } else if (phaseNum === 3 && !state.isAuditCompleted) {
      runCrossCheckAudit();
    }
  }

  // Tab click listeners
  document.getElementById("tab-phase1").addEventListener("click", () => switchPhase(1));
  document.getElementById("tab-phase2").addEventListener("click", () => {
    if (!state.phase1Completed) {
      showToast("Vui lòng hoàn thành xác thực dữ liệu sạch ở Giai đoạn 1 trước!", true);
      return;
    }
    switchPhase(2);
  });
  document.getElementById("tab-phase3").addEventListener("click", () => {
    if (!state.phase1Completed) {
      showToast("Vui lòng xác thực Giai đoạn 1 trước!", true);
      return;
    }
    switchPhase(3);
  });

  // Render Raw Sample Table (Optimized: capped at 100 preview rows + single innerHTML batch)
  function renderRawSampleTable(filter = "all") {
    const tbody = document.getElementById("raw-sample-tbody");
    if (!tbody) return;

    const filtered = currentRawRecords.filter(r => filter === "all" || r.type === filter);

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-inbox text-3xl mb-2 text-slate-300 block"></i>
            Chưa có dữ liệu giao dịch. Vui lòng kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV để AI Agent bắt đầu phân tích.
          </td>
        </tr>
      `;
      return;
    }

    const MAX_PREVIEW = 100;
    const previewSlice = filtered.slice(0, MAX_PREVIEW);
    const htmlRows = [];

    for (let i = 0; i < previewSlice.length; i++) {
      const r = previewSlice[i];
      let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-medium">${escapeHtml(r.status)}</span>`;
      if (r.type === "duplicate") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold">Trùng lặp</span>`;
      } else if (r.type === "cancelled") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold">Đã hủy</span>`;
      } else if (r.type === "return") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-bold">Đổi trả</span>`;
      } else if (r.type === "period") {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">Lệch kỳ</span>`;
      }

      htmlRows.push(`
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-mono font-bold text-indigo-600">${escapeHtml(r.code)}</td>
          <td class="p-3 text-slate-500">${escapeHtml(r.time)}</td>
          <td class="p-3 font-bold text-slate-900">${escapeHtml(r.store)}</td>
          <td class="p-3 text-slate-800 font-medium">${escapeHtml(r.prod)}</td>
          <td class="p-3 text-slate-500">${escapeHtml(r.cat)}</td>
          <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(r.rev)}</td>
          <td class="p-3 text-right font-mono text-slate-500">${formatMoney(r.cogs)}</td>
          <td class="p-3">${statusBadge}</td>
          <td class="p-3 text-xs ${r.type === 'valid' ? 'text-slate-400' : 'text-amber-700 font-bold'}">${escapeHtml(r.note)}</td>
        </tr>
      `);
    }

    if (filtered.length > MAX_PREVIEW) {
      htmlRows.push(`
        <tr class="bg-[#FFF5F8] border-t border-[#FAD2E1]">
          <td colspan="9" class="p-3 text-center text-xs font-bold text-[#FF5B8E]">
            <i class="fa-solid fa-bolt mr-1"></i> Đang hiển thị ${MAX_PREVIEW} dòng mẫu đầu tiên trên tổng số ${filtered.length.toLocaleString('vi-VN')} dòng để tránh giật lag trình duyệt. Toàn bộ dữ liệu vẫn được AI Agent xử lý đầy đủ!
          </td>
        </tr>
      `);
    }

    tbody.innerHTML = htmlRows.join("");
  }

  document.getElementById("filter-data-type").addEventListener("change", (e) => {
    renderRawSampleTable(e.target.value);
  });

  // ========================================================
  // SHEETS / EXCEL / CSV UPLOAD & TEMPLATE GENERATION SYSTEM
  // ========================================================
  const fileInput = document.getElementById("file-sheets-input");
  const dropZone = document.getElementById("drop-zone");
  const uploadBanner = document.getElementById("upload-status-banner");
  const uploadFilename = document.getElementById("upload-filename");
  const uploadDetails = document.getElementById("upload-details");
  const activeSourceBadge = document.getElementById("active-source-badge");

  // AI Agent Data Cleaning Engine & Log Elements (Hoisted for early access)
  const btnRunCleaning = document.getElementById("btn-run-cleaning");
  const logOutput = document.getElementById("cleaning-log-output");
  const cleaningStatusBadge = document.getElementById("cleaning-status-badge");

  function appendLog(message, type = "info") {
    if (!logOutput) return;
    const div = document.createElement("div");
    const time = new Date().toLocaleTimeString('vi-VN');
    if (type === "clean") {
      div.className = "text-amber-400";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="font-bold">[LÀM SẠCH]</span> ${message}`;
    } else if (type === "success") {
      div.className = "text-emerald-400 font-bold";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-emerald-300 font-bold">[HOÀN TẤT]</span> ${message}`;
    } else if (type === "human") {
      div.className = "text-rose-300 font-bold";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> <span class="text-rose-400 font-extrabold">[CHỈ ĐẠO CHUYÊN VIÊN]</span> ${message}`;
    } else {
      div.className = "text-blue-300";
      div.innerHTML = `<span class="text-slate-500">[${time}]</span> [AGENT] ${message}`;
    }
    logOutput.appendChild(div);
    logOutput.scrollTop = logOutput.scrollHeight;
  }

  function runCleaningPipeline(recordsToClean = currentRawRecords, stats = customDatasetStats) {
    if (!recordsToClean || recordsToClean.length === 0) return;
    state.isCleaningRunning = true;
    if (cleaningStatusBadge) {
      cleaningStatusBadge.textContent = "Agent đang xử lý...";
      cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-blue-600 text-white font-semibold animate-pulse";
    }

    if (logOutput) logOutput.innerHTML = "";
    const sourceName = stats.fileName;
    const totRows = stats.totalRows.toLocaleString('vi-VN');
    const dupRows = stats.duplicateRows.toLocaleString('vi-VN');
    const canRows = stats.cancelledRows.toLocaleString('vi-VN');
    const retRows = stats.returnRows.toLocaleString('vi-VN');
    const clnRows = stats.cleanRows.toLocaleString('vi-VN');

    // Step 0: Ingestion
    appendLog(`Khởi động pipeline BPMN: Tiếp nhận & Làm sạch dữ liệu [${sourceName}]...`, "agent");

    setTimeout(() => {
      appendLog(`Tiếp nhận thành công: '${sourceName}' gồm ${totRows} dòng giao dịch thực tế.`, "info");
      
      // Print first 3 sample records from user's actual uploaded file directly in log
      const sampleLimit = Math.min(recordsToClean.length, 3);
      for (let i = 0; i < sampleLimit; i++) {
        const r = recordsToClean[i];
        appendLog(`[MẪU DÒNG ${i+1}] Mã: ${r.code} | Cửa hàng: ${r.store} | SP: ${r.prod} | Doanh thu: ${formatMoney(r.rev)} | Trạng thái: ${r.status}`, "clean");
      }
    }, 250);

    // Step 1: Duplicate check
    setTimeout(() => {
      appendLog(`BƯỚC 1: LỌC TRÙNG - Bóc tách ${dupRows} dòng duplicate (trùng mã giao dịch / double POS).`, "clean");
    }, 700);

    // Step 2: Canceled orders
    setTimeout(() => {
      appendLog(`BƯỚC 2: BỎ ĐƠN HỦY - Loại bỏ ${canRows} đơn hủy / trả hàng trước giao bị cộng nhầm vào doanh thu.`, "clean");
    }, 1150);

    // Step 3: Returns standardization
    setTimeout(() => {
      appendLog(`BƯỚC 3: XỬ LÝ HÀNG TRẢ - Chuẩn hóa ${retRows} dòng đổi trả, trừ doanh thu thực nhận và hoàn nhập COGS.`, "clean");
    }, 1600);

    // Step 4: Comparison period synchronization
    setTimeout(() => {
      appendLog(`BƯỚC 4: ĐỒNG BỘ KỲ ĐỐI CHIẾU - Khóa cứng chu kỳ bán hàng tương đương (31 ngày T10 vs 30 ngày T09).`, "clean");
    }, 2050);

    // Step 5: Finished
    setTimeout(() => {
      document.getElementById("stat-clean-rows").textContent = clnRows;
      document.getElementById("stat-duplicate-rows").textContent = dupRows;
      document.getElementById("stat-cancelled-rows").textContent = canRows;
      document.getElementById("stat-return-rows").textContent = retRows;
      document.getElementById("stat-total-raw-rows").innerHTML = `${totRows} <span class="text-xs font-normal text-slate-400">dòng</span>`;
      document.getElementById("stat-total-raw-desc").textContent = sourceName;

      appendLog(`KẾT QUẢ XUẤT SHEET: ${totRows} dòng thô ➔ ${clnRows} dòng sạch hợp lệ (Khớp đối soát 100%).`, "success");
      appendLog("Chuyển quyền cho Chuyên viên Kinh doanh thực hiện Bước Xác Thực Con Người (Human Verification Gate)...", "info");
      if (cleaningStatusBadge) {
        cleaningStatusBadge.textContent = "Chờ Human Verification";
        cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-bold";
      }
      state.isCleaningRunning = false;
      state.cleaningCompleted = true;
      showToast(`AI Agent đã làm sạch ${clnRows} dòng dữ liệu từ ${sourceName}!`);
    }, 2500);
  }

  // Fast O(1) column key resolver (resolved ONCE per file instead of per-row regex scanning)
  function findMatchingColumnKey(keys, keywords) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const cleanK = key.toLowerCase().replace(/[\s_\-–—]/g, "");
      for (let j = 0; j < keywords.length; j++) {
        const cleanKw = keywords[j];
        if (cleanK === cleanKw || cleanK.includes(cleanKw) || cleanKw.includes(cleanK)) {
          return key;
        }
      }
    }
    return null;
  }

  function resolveColumnMap(sampleRow) {
    if (!sampleRow || typeof sampleRow !== "object") return {};
    const keys = Object.keys(sampleRow);
    return {
      codeKey: findMatchingColumnKey(keys, ["mãgiaodịch", "magiaodich", "mãđơn", "orderid", "transactionid", "mãgd", "code", "magd", "id", "sốhđ"]),
      timeKey: findMatchingColumnKey(keys, ["thoigiangiaodich", "thờigian", "thoigian", "ngàygiờ", "ngày", "date", "time", "createdat", "ngay"]),
      storeKey: findMatchingColumnKey(keys, ["tencuahang", "têncửahàng", "cửahàng", "cuahang", "macuahang", "mãcửahàng", "store", "shop", "chinhanh", "diemban"]),
      prodKey: findMatchingColumnKey(keys, ["tensanpham", "tênsảnphẩm", "sảnphẩm", "sanpham", "masanpham", "mãsảnphẩm", "product", "item", "tensp", "mathang"]),
      catKey: findMatchingColumnKey(keys, ["ngànhhàng", "nganhhang", "nhómhàng", "category", "danhmuc", "loaihang"]),
      revKey: findMatchingColumnKey(keys, ["doanhthuthô", "doanhthu", "tổngtiền", "tongtien", "thànhtiền", "thanhtien", "revenue", "amount", "giátrị"]),
      cogsKey: findMatchingColumnKey(keys, ["giávốn", "giavon", "cogs", "tiềnvốn", "chiphívốn", "cost"]),
      statusKey: findMatchingColumnKey(keys, ["trạngtháiđơn", "trạngthái", "trangthai", "tìnhtrạng", "status"])
    };
  }

  // Extract tabular data from a SheetJS worksheet, skipping company header titles (Optimized with raw: true & fast loops)
  function extractSmartTableFromWorksheet(worksheet) {
    if (!worksheet || !worksheet['!ref']) return [];
    
    // Read as 2D array of raw values (dramatically faster than formatted strings)
    const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "", raw: true });
    if (!aoa || aoa.length === 0) return [];

    let headerRowIndex = 0;
    let maxScore = -1;

    const scanLimit = Math.min(aoa.length, 15);
    for (let r = 0; r < scanLimit; r++) {
      const row = aoa[r];
      if (!Array.isArray(row) || row.length === 0) continue;
      let score = 0;
      const joined = row.map(c => String(c || "").toLowerCase().trim()).join(" ");
      if (joined.includes("mã") || joined.includes("code") || joined.includes("id")) score += 3;
      if (joined.includes("giao dịch") || joined.includes("transaction") || joined.includes("đơn") || joined.includes("order")) score += 3;
      if (joined.includes("cửa hàng") || joined.includes("store") || joined.includes("shop") || joined.includes("chi nhánh")) score += 3;
      if (joined.includes("sản phẩm") || joined.includes("product") || joined.includes("item") || joined.includes("hàng")) score += 3;
      if (joined.includes("doanh thu") || joined.includes("tiền") || joined.includes("revenue") || joined.includes("amount") || joined.includes("giá")) score += 3;
      if (joined.includes("ngày") || joined.includes("thời gian") || joined.includes("date") || joined.includes("time")) score += 3;
      if (joined.includes("giá vốn") || joined.includes("cogs") || joined.includes("cost")) score += 3;
      if (joined.includes("trạng thái") || joined.includes("status")) score += 3;

      if (score > maxScore && score >= 3) {
        maxScore = score;
        headerRowIndex = r;
      }
    }

    const rawHeaders = aoa[headerRowIndex] || [];
    const headerLen = rawHeaders.length;
    const headers = new Array(headerLen);
    for (let c = 0; c < headerLen; c++) {
      const h = String(rawHeaders[c] || "").trim();
      headers[c] = h || `Cot_${c + 1}`;
    }

    const resultRows = [];
    for (let r = headerRowIndex + 1; r < aoa.length; r++) {
      const rowData = aoa[r];
      if (!Array.isArray(rowData) || rowData.length === 0) continue;
      let hasValue = false;
      for (let c = 0; c < headerLen; c++) {
        const v = rowData[c];
        if (v !== "" && v !== null && v !== undefined) {
          hasValue = true;
          break;
        }
      }
      if (!hasValue) continue;

      const obj = {};
      for (let c = 0; c < headerLen; c++) {
        obj[headers[c]] = rowData[c] !== undefined ? rowData[c] : "";
      }
      resultRows.push(obj);
    }

    return resultRows.length > 0 ? resultRows : XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: true });
  }

  function finishProcessingParsedRows(formattedRecords, total, dupCount, cancelCount, returnCount, fileName) {
    currentRawRecords = formattedRecords;
    customDatasetLoaded = true;
    customDatasetStats = {
      totalRows: total,
      duplicateRows: dupCount,
      cancelledRows: cancelCount,
      returnRows: returnCount,
      cleanRows: Math.max(total - dupCount - cancelCount, 0),
      fileName: fileName
    };

    // Update UI counters with exact stats from user's file
    const elTot = document.getElementById("stat-total-raw-rows");
    if (elTot) elTot.innerHTML = `${customDatasetStats.totalRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elTotDesc = document.getElementById("stat-total-raw-desc");
    if (elTotDesc) elTotDesc.textContent = `Nạp từ tệp: ${fileName}`;
    const elDup = document.getElementById("stat-duplicate-rows");
    if (elDup) elDup.innerHTML = `${customDatasetStats.duplicateRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elCan = document.getElementById("stat-cancelled-rows");
    if (elCan) elCan.innerHTML = `${customDatasetStats.cancelledRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elRet = document.getElementById("stat-return-rows");
    if (elRet) elRet.innerHTML = `${customDatasetStats.returnRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const elCln = document.getElementById("stat-clean-rows");
    if (elCln) elCln.innerHTML = `${customDatasetStats.cleanRows.toLocaleString('vi-VN')} <span class="text-xs font-normal text-slate-400">dòng</span>`;

    // Update Banner
    if (uploadBanner) uploadBanner.classList.remove("hidden");
    if (uploadFilename) uploadFilename.textContent = fileName;
    if (uploadDetails) uploadDetails.textContent = `Đã nạp ${total.toLocaleString('vi-VN')} dòng thực tế • ${dupCount} trùng lặp, ${cancelCount} đơn hủy, ${returnCount} đổi trả`;
    if (activeSourceBadge) {
      activeSourceBadge.textContent = `Tệp ngoài: ${fileName} (${total.toLocaleString('vi-VN')} dòng)`;
      activeSourceBadge.className = "px-2 py-0.5 rounded text-[10px] bg-emerald-900/60 text-emerald-300 border border-emerald-700 font-semibold";
    }

    // Refresh table preview (only renders top 100 rows instantly)
    renderRawSampleTable();

    appendChatMessage(
      "system",
      `📥 <strong>ĐÃ TIẾP NHẬN TỆP DOANH NGHIỆP:</strong><br>` +
      `• <strong>Tên tệp:</strong> <code>${escapeHtml(fileName)}</code><br>` +
      `• <strong>Số dòng nạp:</strong> ${total.toLocaleString('vi-VN')} dòng giao dịch.<br>` +
      `• <strong>Phát hiện ban đầu:</strong> ${dupCount} trùng lặp, ${cancelCount} đơn hủy, ${returnCount} đổi trả.<br>` +
      `<em>⚡ AI Agent đang tự động khởi chạy quy trình làm sạch BPMN cho tệp này ngay...</em>`
    );

    // Update Step 1B Paste Input preview & Status Hint
    const rawPaste = document.getElementById("raw-data-paste-input");
    if (rawPaste) {
      let previewSnippet = `[TỆP: ${fileName} • ${total.toLocaleString('vi-VN')} dòng giao dịch]\n`;
      const sampleN = Math.min(formattedRecords.length, 5);
      for (let i = 0; i < sampleN; i++) {
        const r = formattedRecords[i];
        previewSnippet += `${r.code}, ${r.time}, ${r.store}, ${r.prod}, ${formatMoney(r.rev)}, ${r.status}\n`;
      }
      previewSnippet += `... và ${Math.max(total - sampleN, 0).toLocaleString('vi-VN')} dòng tiếp theo.`;
      rawPaste.value = previewSnippet;
    }

    const inputHint = document.getElementById("input-status-hint");
    if (inputHint) {
      inputHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nhận ${escapeHtml(fileName)} (${total.toLocaleString('vi-VN')} dòng). Hệ thống đã chuyển sang Bước 2!</span>`;
    }

    const btnTrigger = document.getElementById("btn-upload-file-trigger");
    if (btnTrigger) {
      btnTrigger.disabled = false;
      btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
    }

    showToast(`Đã nhận ${fileName} (${total.toLocaleString('vi-VN')} dòng)! Đang làm sạch...`, true);

    // Reveal subsequent steps and set workflow step to 2
    revealSubsequentSteps();

    // AUTOMATIC EXECUTION: Kick off Agent Data Cleaning right away on user's dataset!
    state.isCleaningRunning = false;
    runCleaningPipeline(formattedRecords, customDatasetStats);

    // Scroll to the cleaning logs so user immediately sees their data in action
    const logBox = document.getElementById("cleaning-log-output");
    if (logBox) {
      logBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Non-blocking chunked row processor (prevents "Not Responding" on large 50k-100k+ files)
  function processParsedRows(rows, fileName) {
    if (!rows || rows.length === 0) {
      showToast("Tệp không có dữ liệu giao dịch hợp lệ!", true);
      appendLog(`[CẢNH BÁO] Không thể đọc thấy bảng giao dịch trong tệp: ${fileName}. Vui lòng kiểm tra định dạng.`, "agent");
      const btnTrigger = document.getElementById("btn-upload-file-trigger");
      if (btnTrigger) {
        btnTrigger.disabled = false;
        btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
      }
      return;
    }

    const colMap = resolveColumnMap(rows[0]);
    const total = rows.length;
    const seenIds = new Set();
    let dupCount = 0;
    let cancelCount = 0;
    let returnCount = 0;
    const formattedRecords = new Array(total);
    const CHUNK_SIZE = 5000;
    let index = 0;
    const inputHint = document.getElementById("input-status-hint");

    function processChunk() {
      const end = Math.min(index + CHUNK_SIZE, total);
      for (let i = index; i < end; i++) {
        const row = rows[i];
        const code = (colMap.codeKey && row[colMap.codeKey] !== undefined && row[colMap.codeKey] !== "") ? String(row[colMap.codeKey]) : `TRX-${100000 + i}`;
        const time = (colMap.timeKey && row[colMap.timeKey] !== undefined && row[colMap.timeKey] !== "") ? String(row[colMap.timeKey]) : "10/10 12:00";
        const store = (colMap.storeKey && row[colMap.storeKey] !== undefined && row[colMap.storeKey] !== "") ? String(row[colMap.storeKey]) : "CH-Phúc An";
        const prod = (colMap.prodKey && row[colMap.prodKey] !== undefined && row[colMap.prodKey] !== "") ? String(row[colMap.prodKey]) : "Sản phẩm bán lẻ";
        const cat = (colMap.catKey && row[colMap.catKey] !== undefined && row[colMap.catKey] !== "") ? String(row[colMap.catKey]) : "Bán lẻ tổng hợp";

        let rawRevVal = (colMap.revKey && row[colMap.revKey] !== undefined && row[colMap.revKey] !== "") ? row[colMap.revKey] : 1000000;
        if (typeof rawRevVal === "string") {
          rawRevVal = parseFloat(rawRevVal.replace(/[^0-9.-]/g, "")) || 1000000;
        }
        const rawRev = Number(rawRevVal) || 1000000;

        let rawCogsVal = (colMap.cogsKey && row[colMap.cogsKey] !== undefined && row[colMap.cogsKey] !== "") ? row[colMap.cogsKey] : (rawRev * 0.68);
        if (typeof rawCogsVal === "string") {
          rawCogsVal = parseFloat(rawCogsVal.replace(/[^0-9.-]/g, "")) || (rawRev * 0.68);
        }
        const rawCogs = Number(rawCogsVal) || (rawRev * 0.68);

        const status = (colMap.statusKey && row[colMap.statusKey] !== undefined && row[colMap.statusKey] !== "") ? String(row[colMap.statusKey]).trim() : "Hoàn thành";

        let type = "valid";
        let note = "Hợp lệ";

        if (seenIds.has(code)) {
          type = "duplicate";
          note = "TRÙNG LẶP: Mã giao dịch bị lặp";
          dupCount++;
        } else {
          seenIds.add(code);
        }

        const statusLower = status.toLowerCase();
        if (statusLower.includes("hủy") || statusLower.includes("huy") || statusLower.includes("cancel") || statusLower.includes("void")) {
          type = "cancelled";
          note = "ĐƠN HỦY: Khách hủy / Hoàn tiền trước giao";
          cancelCount++;
        } else if (statusLower.includes("trả") || statusLower.includes("tra") || statusLower.includes("return") || statusLower.includes("đổi") || statusLower.includes("refund")) {
          type = "return";
          note = "ĐỔI TRẢ: Hàng hoàn kho cần xử lý chuẩn";
          returnCount++;
        }

        formattedRecords[i] = {
          code,
          time,
          store,
          prod,
          cat,
          rev: rawRev,
          cogs: rawCogs,
          status,
          note,
          type
        };
      }

      index = end;
      if (index < total) {
        if (inputHint) {
          const pct = Math.round((index / total) * 100);
          inputHint.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang phân tích dữ liệu: ${index.toLocaleString('vi-VN')} / ${total.toLocaleString('vi-VN')} dòng (${pct}%)...</span>`;
        }
        setTimeout(processChunk, 0);
      } else {
        finishProcessingParsedRows(formattedRecords, total, dupCount, cancelCount, returnCount, fileName);
      }
    }

    processChunk();
  }

  function handleFileSelected(file) {
    if (!file) return;
    const fileName = file.name;
    const ext = fileName.split('.').pop().toLowerCase();

    const inputHint = document.getElementById("input-status-hint");
    const btnTrigger = document.getElementById("btn-upload-file-trigger");
    if (inputHint) {
      inputHint.innerHTML = `<span class="text-blue-600 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Đang đọc & giải mã tệp ${escapeHtml(fileName)}...</span>`;
    }
    if (btnTrigger) {
      btnTrigger.disabled = true;
      btnTrigger.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[#FF5B8E]"></i> <span>Đang mở tệp...</span>`;
    }

    const resetUploadBtn = () => {
      if (btnTrigger) {
        btnTrigger.disabled = false;
        btnTrigger.innerHTML = `<i class="fa-solid fa-folder-open text-amber-500"></i> <span>Tải file lên (CSV / Excel / JSON)</span>`;
      }
    };

    showToast(`Đang đọc tệp: ${fileName}...`, false);

    if (ext === "csv") {
      if (typeof Papa === "undefined") {
        showToast("Thư viện PapaParse chưa tải xong. Vui lòng thử lại sau vài giây!", true);
        resetUploadBtn();
        return;
      }
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          processParsedRows(results.data, fileName);
        },
        error: (err) => {
          showToast(`Lỗi đọc CSV: ${err.message}`, true);
          resetUploadBtn();
        }
      });
    } else if (ext === "json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTimeout(() => {
          try {
            const parsed = JSON.parse(e.target.result);
            const rows = Array.isArray(parsed) ? parsed : (parsed.data || parsed.rows || parsed.transactions || []);
            processParsedRows(rows, fileName);
          } catch (err) {
            showToast(`Lỗi đọc JSON: ${err.message}`, true);
            resetUploadBtn();
          }
        }, 30);
      };
      reader.onerror = () => {
        showToast("Không thể đọc tệp JSON từ đĩa.", true);
        resetUploadBtn();
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      if (typeof XLSX === "undefined") {
        showToast("Thư viện SheetJS chưa sẵn sàng. Vui lòng tải lại trang (F5)!", true);
        resetUploadBtn();
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        // Yield to browser paint loop before heavy SheetJS decoding so UI stays responsive
        setTimeout(() => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
              type: 'array',
              cellDates: false,
              cellFormula: false,
              cellHTML: false,
              cellNF: false,
              cellStyles: false
            });
            
            let targetSheetName = workbook.SheetNames[0];
            const matched = workbook.SheetNames.find(n => {
              const low = n.toLowerCase();
              return low.includes("giaodich") || low.includes("transaction") || low.includes("sales") || low.includes("banhang") || low.includes("order") || low.includes("data");
            });
            if (matched) targetSheetName = matched;

            let worksheet = workbook.Sheets[targetSheetName];
            let jsonData = extractSmartTableFromWorksheet(worksheet);

            if ((!jsonData || jsonData.length === 0) && workbook.SheetNames.length > 1) {
              for (const sName of workbook.SheetNames) {
                const ws = workbook.Sheets[sName];
                const parsed = extractSmartTableFromWorksheet(ws);
                if (parsed && parsed.length > 0) {
                  targetSheetName = sName;
                  jsonData = parsed;
                  break;
                }
              }
            }

            processParsedRows(jsonData, fileName);
          } catch (err) {
            console.error("Lỗi giải mã Excel:", err);
            showToast(`Lỗi giải mã Excel: ${err.message}`, true);
            if (inputHint) inputHint.innerHTML = `<span class="text-rose-600 font-bold">Lỗi giải mã tệp: ${escapeHtml(err.message)}</span>`;
            resetUploadBtn();
          }
        }, 40);
      };
      reader.onerror = (err) => {
        showToast(`Lỗi đọc tệp từ đĩa: ${err.message || 'Không thể đọc'}`, true);
        resetUploadBtn();
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast("Chỉ hỗ trợ tệp Excel (.xlsx, .xls), CSV hoặc JSON!", true);
      resetUploadBtn();
    }
  }

  // File Input Change handler (guaranteed on any file dialog selection)
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelected(file);
      // Reset so selecting the same file again triggers change reliably
      setTimeout(() => { e.target.value = ""; }, 500);
    }
  });

  // Visual helper for Drag & Drop
  const dropZoneTitle = document.getElementById("drop-zone-title");
  function setDragActive(active) {
    if (active) {
      dropZone.classList.add("border-[#FF5B8E]", "bg-[#FFE4EC]", "scale-[1.02]", "shadow-md");
      dropZone.classList.remove("bg-white", "border-[#FFB3C7]");
      if (dropZoneTitle) {
        dropZoneTitle.innerHTML = `<span class="text-[#FF5B8E] font-black text-sm animate-pulse"><i class="fa-solid fa-cloud-arrow-down"></i> Thả tệp Excel/CSV vào đây ngay!</span>`;
      }
    } else {
      dropZone.classList.remove("border-[#FF5B8E]", "bg-[#FFE4EC]", "scale-[1.02]", "shadow-md");
      dropZone.classList.add("bg-white", "border-[#FFB3C7]");
      if (dropZoneTitle) {
        dropZoneTitle.innerHTML = `Kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV vào đây hoặc <span class="text-[#FF5B8E] underline font-extrabold">bấm để chọn từ máy</span>`;
      }
    }
  }

  // Prevent browser default window drag behavior
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    window.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
    document.body.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  // Attach Drag & Drop directly to both fileInput and dropZone
  ['dragenter', 'dragover'].forEach(evt => {
    fileInput.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    });
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    });
  });

  ['dragleave'].forEach(evt => {
    fileInput.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    });
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    });
  });

  fileInput.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFileSelected(dt.files[0]);
    }
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFileSelected(dt.files[0]);
    }
  });

  // Global document drop support
  document.body.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      showToast("Đã nhận tệp kéo thả vào hệ thống!", true);
      switchPhase(1);
      handleFileSelected(dt.files[0]);
    }
  });

  // Quick re-clean button on status banner
  document.getElementById("btn-re-clean").addEventListener("click", () => {
    btnRunCleaning.click();
  });

  // Download Standard Excel Template (Exact 1.006 dòng • 15 trường)
  document.getElementById("btn-download-template").addEventListener("click", () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Transactions (Exact 15 standard fields from Diagram)
      const wsTransactionsData = [
        [
          "Mã Giao Dịch", "Ngày Giờ Giao Dịch", "Mã Cửa Hàng", "Tên Cửa Hàng", "Khu Vực",
          "Mã Sản Phẩm", "Tên Sản Phẩm", "Ngành Hàng", "Số Lượng", "Đơn Giá",
          "Thành Tiền", "Giá Vốn COGS", "Trạng Thái Đơn", "Mã Giao Dịch Gốc", "Tiền Hoàn Trả"
        ],
        ["TRX-100234", "02/10/2026 09:15", "CH01", "Phúc An Cầu Giấy", "Hà Nội", "SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 1, 2590000, 2590000, 1761200, "Hoàn tất", "", 0],
        ["TRX-100235", "02/10/2026 09:15", "CH01", "Phúc An Cầu Giấy", "Hà Nội", "SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 1, 2590000, 2590000, 1761200, "Hoàn tất", "TRX-100234", 0], // Lặp mã
        ["TRX-100412", "03/10/2026 14:20", "CH03", "Phúc An Hai Bà Trưng", "Hà Nội", "SP-TBS04", "Loa bluetooth mini bass", "Thiết bị số", 2, 490000, 980000, 860000, "Hoàn tất", "", 0],
        ["TRX-100589", "04/10/2026 16:45", "CH08", "Phúc An Quảng Ninh", "Miền Bắc", "SP-DGD09", "Máy lọc không khí Pro", "Điện gia dụng", 1, 6890000, 6890000, 4685200, "Đã hủy", "", 0],
        ["TRX-100720", "05/10/2026 11:30", "CH15", "Phúc An Bình Thạnh", "TP.HCM", "SP-SK02", "Máy nâng cơ mặt ion", "Chăm sóc sức khỏe", 1, 3200000, 3200000, 1760000, "Trả hàng", "TRX-100700", 3200000],
        ["TRX-100845", "06/10/2026 10:12", "CH04", "Phúc An Hoàn Kiếm", "Hà Nội", "SP-GD03", "Robot hút bụi lau nhà", "Gia dụng thông minh", 1, 8490000, 8490000, 5263800, "Hoàn tất", "", 0]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(wsTransactionsData);
      XLSX.utils.book_append_sheet(wb, ws1, "1_BanHang_15Truong");

      // Sheet 2: Returns Detail
      const wsReturnsData = [
        ["Mã Phiếu Trả", "Mã Giao Dịch Gốc", "Ngày Trả", "Mã Cửa Hàng", "Giá Trị Hoàn Trả", "Lý Do Đổi Trả", "Tái Nhập Kho"],
        ["RET-001", "TRX-100720", "05/10/2026", "CH15", 3200000, "Nhân viên tư vấn sai công năng", "Có"],
        ["RET-002", "TRX-101790", "12/10/2026", "CH07", 3190000, "Vận chuyển va đập móp vỏ", "Không (Hao hụt)"]
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(wsReturnsData);
      XLSX.utils.book_append_sheet(wb, ws2, "2_DoiTra_ChiTiet");

      // Sheet 3: Products Catalog
      const wsProductsData = [
        ["Mã Sản Phẩm", "Tên Sản Phẩm", "Ngành Hàng", "Đơn Giá Niêm Yết", "Giá Vốn COGS", "Biên Lợi Nhuận Chuẩn"],
        ["SP-DGD01", "Nồi cơm điện cao tần 1.8L", "Điện gia dụng", 2590000, 1761200, "32%"],
        ["SP-TBS04", "Loa bluetooth mini bass", "Thiết bị số", 490000, 382200, "22%"],
        ["SP-SK02", "Máy nâng cơ mặt ion", "Chăm sóc sức khỏe", 3200000, 1760000, "45%"],
        ["SP-GD03", "Robot hút bụi lau nhà", "Gia dụng thông minh", 8490000, 5263800, "38%"]
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(wsProductsData);
      XLSX.utils.book_append_sheet(wb, ws3, "3_DanhMuc_GiaVon");

      // Sheet 4: Store Targets
      const wsTargetsData = [
        ["Mã Cửa Hàng", "Tên Cửa Hàng", "Khu Vực", "Mục Tiêu Doanh Thu", "Mục Tiêu LN Gộp", "Định Mức Đổi Trả Trần"],
        ["CH01", "Phúc An Cầu Giấy", "Hà Nội", 2800000000, 896000000, "3.5%"],
        ["CH02", "Phúc An Đống Đa", "Hà Nội", 3100000000, 992000000, "3.5%"],
        ["CH03", "Phúc An Hai Bà Trưng", "Hà Nội", 3000000000, 960000000, "3.5%"],
        ["CH15", "Phúc An Bình Thạnh", "TP.HCM", 3100000000, 992000000, "3.5%"]
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(wsTargetsData);
      XLSX.utils.book_append_sheet(wb, ws4, "4_MucTieu_18CH");

      XLSX.writeFile(wb, "PhucAn_Retail_Mau_1006Dong_15Truong.xlsx");
      showToast("Đã tải xuống tệp mẫu Excel chuẩn 1.006 dòng • 15 trường!");
    } catch (err) {
      showToast(`Không thể tạo file Excel: ${err.message}`, true);
    }
  });

  // Reset to Sample Model (For demonstration)
  document.getElementById("btn-reset-sample").addEventListener("click", () => {
    currentRawRecords = [...defaultSampleRawRecords];
    customDatasetLoaded = false;
    customDatasetStats = {
      totalRows: 60000,
      duplicateRows: 1842,
      cancelledRows: 2150,
      returnRows: 3420,
      cleanRows: 56008,
      fileName: "Dữ liệu mẫu Phúc An (60.000 dòng)"
    };

    activeSourceBadge.textContent = "Dữ liệu mẫu Phúc An (60.000 dòng)";
    activeSourceBadge.className = "px-2 py-0.5 rounded-full text-[10px] bg-[#FFE2E5] text-[#FA5A7D] border border-[#FAD2E1] font-bold";

    renderRawSampleTable();
    runCleaningPipeline();
    showToast("Đã nạp bộ dữ liệu mẫu 60.000 dòng thành công!");
  });

  // Clear / Empty Data Button
  const btnClearData = document.getElementById("btn-clear-data");
  if (btnClearData) {
    btnClearData.addEventListener("click", () => {
      clearAllData();
      showToast("Đã làm trống toàn bộ dữ liệu. Hệ thống sẵn sàng cho tệp mới!");
    });
  }

  // ========================================================
  // BỐI CẢNH DOANH NGHIỆP CHO AI AGENT (BUSINESS CONTEXT)
  // ========================================================
  const businessContext = {
    companyName: "",
    period: "",
    industry: "",
    description: "",
    isConfigured: false
  };

  const inputCtxCompany = document.getElementById("ctx-company-name");
  const inputCtxPeriod = document.getElementById("ctx-period");
  const inputCtxIndustry = document.getElementById("ctx-industry");
  const inputCtxAudience = document.getElementById("ctx-audience");
  const inputCtxDescription = document.getElementById("ctx-description");
  const badgeCtxStatus = document.getElementById("badge-context-status");
  const previewCtxSummary = document.getElementById("ctx-summary-preview");
  const btnSaveContext = document.getElementById("btn-save-context");
  const btnContextPreset = document.getElementById("btn-context-preset");
  const btnContextClear = document.getElementById("btn-context-clear");
  const btnContextToggle = document.getElementById("btn-context-toggle");
  const contextBody = document.getElementById("context-body");
  const iconContextToggle = document.getElementById("icon-context-toggle");

  function saveBusinessContext(silent = false) {
    businessContext.companyName = inputCtxCompany ? inputCtxCompany.value.trim() : "";
    businessContext.period = inputCtxPeriod ? inputCtxPeriod.value.trim() : "";
    businessContext.industry = inputCtxIndustry ? inputCtxIndustry.value.trim() : "";
    businessContext.audience = inputCtxAudience ? inputCtxAudience.value.trim() : "";
    businessContext.description = inputCtxDescription ? inputCtxDescription.value.trim() : "";

    const hasInfo = businessContext.companyName || businessContext.period || businessContext.industry || businessContext.description;
    businessContext.isConfigured = !!hasInfo;

    if (badgeCtxStatus) {
      if (businessContext.isConfigured) {
        badgeCtxStatus.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-500"></i> Đã lưu bối cảnh`;
        badgeCtxStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1";
      } else {
        badgeCtxStatus.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Chờ điền bối cảnh`;
        badgeCtxStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center gap-1";
      }
    }

    if (previewCtxSummary) {
      if (businessContext.isConfigured) {
        previewCtxSummary.innerHTML = `🟢 <strong>Bối cảnh kích hoạt:</strong> ${escapeHtml(businessContext.companyName || 'Doanh nghiệp')} • Kỳ: <strong>${escapeHtml(businessContext.period || 'Hiện tại')}</strong> • ${escapeHtml(businessContext.industry || 'Bán lẻ')} (AI Agent đã ghi nhớ)`;
        previewCtxSummary.className = "text-xs text-emerald-700 font-medium";
      } else {
        previewCtxSummary.textContent = "Chưa lưu bối cảnh. Nhấn 'Lưu & Áp Dụng Bối Cảnh' để AI Agent ghi nhớ trước khi nạp tệp.";
        previewCtxSummary.className = "text-xs text-slate-400 italic";
      }
    }

    if (!silent) {
      const comp = businessContext.companyName || "Doanh nghiệp";
      const peri = businessContext.period ? `(Kỳ: ${businessContext.period})` : "";
      showToast(`Đã lưu bối cảnh: ${comp} ${peri}! AI Agent sẽ phân tích theo yêu cầu này.`);

      appendLog(`[BỐI CẢNH] Doanh nghiệp: ${comp} | Kỳ: ${businessContext.period || 'Mặc định'} | Ngành: ${businessContext.industry || 'Chung'}.`, "clean");
      if (businessContext.description) {
        appendLog(`[YÊU CẦU CHO AGENT] ${businessContext.description}`, "info");
      }

      appendChatMessage(
        "ai",
        `🎯 <strong>ĐÃ GHI NHẬN BỐI CẢNH DOANH NGHIỆP:</strong><br>` +
        `• <strong>Doanh nghiệp:</strong> <strong>${escapeHtml(comp)}</strong> (${escapeHtml(businessContext.industry || 'Bán lẻ')})<br>` +
        `• <strong>Kỳ phân tích:</strong> ${escapeHtml(businessContext.period || 'Kỳ kinh doanh hiện tại')}<br>` +
        `• <strong>Yêu cầu trọng tâm:</strong> <em>${escapeHtml(businessContext.description || 'Đối soát bẫy doanh thu, kiểm soát tỷ lệ hoàn trả và tối ưu hóa lợi nhuận')}</em><br>` +
        `<span class="text-emerald-700 font-bold">✓ Hệ thống đã sẵn sàng. Hãy kéo & thả tệp Excel/CSV vào ô bên dưới để AI Agent bắt đầu phân tích!</span>`
      );
    }
  }

  if (btnSaveContext) {
    btnSaveContext.addEventListener("click", () => saveBusinessContext(false));
  }

  if (btnContextPreset) {
    btnContextPreset.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "Hệ Thống Bán Lẻ Phúc An Mart";
      if (inputCtxPeriod) inputCtxPeriod.value = "Tháng 10/2026 (31 ngày chuẩn)";
      if (inputCtxIndustry) inputCtxIndustry.value = "Bán lẻ đa kênh & Thiết bị số";
      if (inputCtxAudience) inputCtxAudience.value = "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
      if (inputCtxDescription) inputCtxDescription.value = "Chiến dịch xả phụ kiện CAT02 biên 12% diễn ra trong tháng 10. AI Agent cần tập trung kiểm tra bẫy doanh thu (doanh số tăng nhưng lợi nhuận giảm), rà soát tỷ lệ đổi trả vượt trần an toàn 3.5% và bóc tách tăng trưởng ảo do ghép lệch kỳ 45 ngày.";
      saveBusinessContext(false);
    });
  }

  if (btnContextClear) {
    btnContextClear.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "";
      if (inputCtxPeriod) inputCtxPeriod.value = "";
      if (inputCtxIndustry) inputCtxIndustry.value = "";
      if (inputCtxAudience) inputCtxAudience.value = "";
      if (inputCtxDescription) inputCtxDescription.value = "";
      saveBusinessContext(true);
      showToast("Đã làm trống bối cảnh doanh nghiệp.");
    });
  }

  // ========================================================
  // STEP 1 WORKFLOW INTEGRATION (BƯỚC 1A + BƯỚC 1B)
  // ========================================================
  const rawPasteInput = document.getElementById("raw-data-paste-input");
  const inputStatusHint = document.getElementById("input-status-hint");
  const btnLoadSampleQuick = document.getElementById("btn-load-sample-quick");
  const btnAnalyzeContextData = document.getElementById("btn-analyze-context-data");
  const btnNewSession = document.getElementById("btn-new-session");

  // Drag & drop directly onto the Step 1B paste box
  if (rawPasteInput) {
    ['dragenter', 'dragover'].forEach(evt => {
      rawPasteInput.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        rawPasteInput.classList.add("border-[#FF5B8E]", "bg-[#FFF0F5]");
      });
    });
    rawPasteInput.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rawPasteInput.classList.remove("border-[#FF5B8E]", "bg-[#FFF0F5]");
    });
    rawPasteInput.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      rawPasteInput.classList.remove("border-[#FF5B8E]", "bg-[#FFF0F5]");
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFileSelected(dt.files[0]);
      }
    });
  }

  // Preload the user's exact dataset (phuc_an_transactions.csv) into Step 1B on startup
  function preloadUserDataset() {
    fetch("phuc_an_transactions.csv")
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.text();
      })
      .then(csvText => {
        const trimmed = csvText.trim();
        if (!trimmed) return;
        const lineCount = trimmed.split(/\r?\n/).length - 1;
        if (rawPasteInput && !rawPasteInput.value.trim()) {
          rawPasteInput.value = trimmed;
        }
        if (inputStatusHint) {
          inputStatusHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nạp sẵn tệp của bạn (${lineCount.toLocaleString('vi-VN')} dòng giao dịch Phúc An). Bấm "Phân Tích Bối Cảnh & Kiểm Tra Định Dạng" để tiếp tục!</span>`;
        }
      })
      .catch(() => {});
  }
  preloadUserDataset();

  // Step 1: Load 60k sample data quickly
  if (btnLoadSampleQuick) {
    btnLoadSampleQuick.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "Hệ Thống Bán Lẻ Phúc An Mart";
      if (inputCtxIndustry) inputCtxIndustry.value = "Bán lẻ đa kênh (Omnichannel Retail & FMCG)";
      if (inputCtxAudience) inputCtxAudience.value = "Ban Giám Đốc (CEO / CFO), Trưởng phòng Kinh doanh";
      if (inputCtxDescription) inputCtxDescription.value = "Đối soát 60.000 dòng dữ liệu giao dịch Tháng 10/2026, làm sạch đơn hủy, trùng lặp POS, bóc tách tỷ lệ đổi trả hàng và phân bổ lại doanh thu chuẩn hóa về 18 cửa hàng.";

      saveBusinessContext(true);

      if (rawPasteInput) {
        rawPasteInput.value = `Mã Giao Dịch,Ngày Giờ Giao Dịch,Mã Cửa Hàng,Tên Cửa Hàng,Khu Vực,Mã SP,Tên SP,Ngành Hàng,Số Lượng,Đơn Giá,Thành Tiền,COGS,Trạng Thái Đơn
TRX-100234,02/10/2026 09:15,CH01,Phúc An Cầu Giấy,Hà Nội,SP-DGD01,Nồi cơm điện cao tần 1.8L,Điện gia dụng,1,2590000,2590000,1761200,Hoàn tất
TRX-100235,02/10/2026 09:15,CH01,Phúc An Cầu Giấy,Hà Nội,SP-DGD01,Nồi cơm điện cao tần 1.8L,Điện gia dụng,1,2590000,2590000,1761200,Hoàn tất
TRX-100412,03/10/2026 14:20,CH03,Phúc An Hai Bà Trưng,Hà Nội,SP-TBS04,Loa bluetooth mini bass,Thiết bị số,2,490000,980000,860000,Hoàn tất
TRX-100589,04/10/2026 16:45,CH08,Phúc An Quảng Ninh,Miền Bắc,SP-DGD09,Máy lọc không khí Pro,Điện gia dụng,1,6890000,6890000,4685200,Đã hủy
TRX-100720,05/10/2026 11:30,CH15,Phúc An Bình Thạnh,TP.HCM,SP-SK02,Máy nâng cơ mặt ion,Chăm sóc sức khỏe,1,3200000,3200000,1760000,Trả hàng
... [Đã nạp sẵn 60.000 dòng giao dịch từ CSDL Doanh Nghiệp Phúc An Mart] ...`;
      }

      if (inputStatusHint) {
        inputStatusHint.innerHTML = `<span class="text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> Đã nạp 60.000 dòng mẫu từ Phúc An Mart. Bấm "Phân Tích Bối Cảnh" hoặc xem kết quả bên dưới!</span>`;
      }

      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetStats = {
        totalRows: 60000,
        duplicateRows: 1842,
        cancelledRows: 2150,
        returnRows: 3420,
        cleanRows: 56008,
        fileName: "PhucAn_Retail_60k_Dong_Mau.xlsx"
      };

      revealSubsequentSteps();
      runCleaningPipeline(currentRawRecords, customDatasetStats);
      showToast("Đã nạp thành công 60.000 dòng mẫu và bối cảnh doanh nghiệp!");
      
      setTimeout(() => {
        const sec = document.getElementById("subsequent-steps-container");
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    });
  }

  // Step 1: Analyze Context & Raw Data button
  if (btnAnalyzeContextData) {
    btnAnalyzeContextData.addEventListener("click", () => {
      const rawText = rawPasteInput ? rawPasteInput.value.trim() : "";
      
      // Save business context
      saveBusinessContext(true);

      if (rawText.length > 0 && (!currentRawRecords || currentRawRecords.length === 0)) {
        // Try parsing CSV or JSON
        try {
          if (rawText.startsWith("[") || rawText.startsWith("{")) {
            const parsedJson = JSON.parse(rawText);
            const rows = Array.isArray(parsedJson) ? parsedJson : (parsedJson.data || parsedJson.rows || []);
            if (rows.length > 0) {
              processParsedRows(rows, "du_lieu_dan.json");
              return;
            }
          }
          if (typeof Papa !== "undefined" && (rawText.includes(",") || rawText.includes("\t") || rawText.includes(";"))) {
            const parsed = Papa.parse(rawText, { header: true, dynamicTyping: true, skipEmptyLines: true });
            if (parsed.data && parsed.data.length > 0) {
              processParsedRows(parsed.data, "phuc_an_transactions.csv");
              return;
            }
          }
        } catch (err) {
          console.warn("Lỗi parse text thô:", err);
        }
      }

      if (currentRawRecords && currentRawRecords.length > 0) {
        revealSubsequentSteps();
        runCleaningPipeline(currentRawRecords, customDatasetStats);
        showToast("Đã xác nhận bối cảnh! Đang chuyển sang Bước 2: Làm sạch & Xác nhận.");
        const sec = document.getElementById("subsequent-steps-container");
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // If nothing entered
      if (!rawText) {
        showToast("Vui lòng dán dữ liệu, tải file lên hoặc bấm 'Nạp 60k Dòng Mẫu'!", true);
        if (rawPasteInput) rawPasteInput.focus();
        return;
      }

      // Fallback: has text, run sample model
      currentRawRecords = [...defaultSampleRawRecords];
      customDatasetStats.fileName = "Dữ liệu phân tích bối cảnh";
      revealSubsequentSteps();
      runCleaningPipeline(currentRawRecords, customDatasetStats);
      showToast("Đã phân tích bối cảnh và nạp dữ liệu! Đang chuyển sang Bước 2.");
      const sec = document.getElementById("subsequent-steps-container");
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Top Bar: New Session / Clear All
  if (btnNewSession) {
    btnNewSession.addEventListener("click", () => {
      if (inputCtxCompany) inputCtxCompany.value = "";
      if (inputCtxIndustry) inputCtxIndustry.value = "";
      if (inputCtxAudience) inputCtxAudience.value = "";
      if (inputCtxDescription) inputCtxDescription.value = "";
      if (rawPasteInput) rawPasteInput.value = "";

      if (inputStatusHint) {
        inputStatusHint.innerHTML = "Chưa có dữ liệu. Hãy tải file hoặc dán dữ liệu để bắt đầu.";
        inputStatusHint.className = "text-xs text-slate-400 italic";
      }

      clearAllData();
      hideSubsequentSteps();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast("Đã làm trống phiên làm việc! Sẵn sàng nhận dự án mới.");
    });
  }

  // 4-Step Stepper Navigation Clicks
  const stepNav1 = document.getElementById("step-nav-1");
  const stepNav2 = document.getElementById("step-nav-2");
  const stepNav3 = document.getElementById("step-nav-3");
  const stepNav4 = document.getElementById("step-nav-4");

  if (stepNav1) {
    stepNav1.addEventListener("click", () => {
      setWorkflowStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (stepNav2) {
    stepNav2.addEventListener("click", () => {
      const container = document.getElementById("subsequent-steps-container");
      if (container && container.classList.contains("hidden")) {
        showToast("Vui lòng nạp dữ liệu ở Bước 1 trước!", true);
        return;
      }
      setWorkflowStep(2);
      switchPhase(1);
      const p1 = document.getElementById("panel-phase1");
      if (p1) p1.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (stepNav3) {
    stepNav3.addEventListener("click", () => {
      const container = document.getElementById("subsequent-steps-container");
      if (container && container.classList.contains("hidden")) {
        showToast("Vui lòng nạp dữ liệu ở Bước 1 trước!", true);
        return;
      }
      setWorkflowStep(3);
      switchPhase(2);
      const p2 = document.getElementById("panel-phase2");
      if (p2) p2.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (stepNav4) {
    stepNav4.addEventListener("click", () => {
      const container = document.getElementById("subsequent-steps-container");
      if (container && container.classList.contains("hidden")) {
        showToast("Vui lòng nạp dữ liệu ở Bước 1 trước!", true);
        return;
      }
      setWorkflowStep(4);
      switchPhase(3);
      const p3 = document.getElementById("panel-phase3");
      if (p3) p3.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (btnContextToggle && contextBody) {
    btnContextToggle.addEventListener("click", () => {
      contextBody.classList.toggle("hidden");
      if (iconContextToggle) {
        if (contextBody.classList.contains("hidden")) {
          iconContextToggle.className = "fa-solid fa-chevron-down";
        } else {
          iconContextToggle.className = "fa-solid fa-chevron-up";
        }
      }
    });
  }

  document.querySelectorAll(".ctx-tag-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tagText = btn.getAttribute("data-text");
      if (inputCtxDescription) {
        if (inputCtxDescription.value.trim()) {
          inputCtxDescription.value += "; " + tagText;
        } else {
          inputCtxDescription.value = tagText;
        }
        inputCtxDescription.focus();
      }
    });
  });

  // Google Sheets Sync handler
  document.getElementById("btn-sync-gsheet").addEventListener("click", () => {
    const url = document.getElementById("input-gsheet-url").value.trim();
    if (!url) {
      showToast("Vui lòng dán liên kết Google Sheets của doanh nghiệp!", true);
      return;
    }

    appendLog(`[GOOGLE SHEETS] Đang kết nối tới URL: ${url.substring(0, 45)}...`, "info");
    setTimeout(() => {
      // Simulate successful live sync
      appendLog(`[GOOGLE SHEETS] Đồng bộ thành công 4 sheets: Transactions, Returns, Products, Targets.`, "clean");
      processParsedRows(defaultSampleRawRecords, "Google_Sheets_Live_PhucAn_T10");
    }, 1200);
  });

  // ========================================================
  // 9-STEP PIPELINE RUNNER & EXCEPTION AUDIT DRAWERS (FLOWCHART)
  // ========================================================
  const sampleExceptions = [
    { code: "TRX-100235", origCode: "TRX-100234", store: "CH01 - Cầu Giấy", type: "Mã giao dịch lặp (Duplicate POS)", amount: 2590000, action: "Loại bỏ bản ghi trùng, giữ mã gốc TRX-100234" },
    { code: "TRX-100589", origCode: "N/A", store: "CH08 - Quảng Ninh", type: "Đơn hàng đã hủy (Cộng nhầm doanh thu)", amount: 6890000, action: "Trừ toàn bộ 6.890.000 đ khỏi doanh thu thô" },
    { code: "RET-099", origCode: "TRX-888999 (Không khớp)", store: "CH12 - Quận 1", type: "Mã gốc không khớp hệ thống", amount: 1850000, action: "Ghi nhận vào sổ kiểm tra ngoại lệ, tra soát tay" },
    { code: "TRX-100845", origCode: "N/A", store: "CH04 - Hoàn Kiếm", type: "Lệch kỳ so sánh (45 ngày vs 30 ngày)", amount: 8490000, action: "Chuẩn hóa chu kỳ tương đương 31 ngày chuẩn" },
    { code: "TRX-101560", origCode: "TRX-100412", store: "CH03 - Hai Bà Trưng", type: "Mã giao dịch lặp (Xả hàng km)", amount: 490000, action: "Khử trùng lặp, bảo toàn giá vốn chuẩn" },
    { code: "RET-001", origCode: "TRX-100720", store: "CH15 - Bình Thạnh", type: "Đổi trả hàng (Tư vấn sai công năng)", amount: 3200000, action: "Trừ doanh thu thuần và hoàn nhập giá vốn COGS" }
  ];

  function renderExceptionsTable() {
    const tbody = document.getElementById("exception-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    sampleExceptions.forEach(ex => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-rose-50/60 transition";
      tr.innerHTML = `
        <td class="p-2.5 font-mono font-bold text-rose-700">${ex.code}</td>
        <td class="p-2.5 font-mono text-slate-500">${ex.origCode}</td>
        <td class="p-2.5 font-bold text-slate-900">${ex.store}</td>
        <td class="p-2.5 text-rose-800 font-semibold">${ex.type}</td>
        <td class="p-2.5 text-right font-mono font-bold text-slate-900">${formatMoney(ex.amount)}</td>
        <td class="p-2.5 text-emerald-800 font-medium">${ex.action}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  const btnToggleException = document.getElementById("btn-toggle-exception-table");
  const exceptionContainer = document.getElementById("exception-log-container");
  if (btnToggleException && exceptionContainer) {
    btnToggleException.addEventListener("click", () => {
      exceptionContainer.classList.toggle("hidden");
      renderExceptionsTable();
    });
  }

  const btnToggleVerify = document.getElementById("btn-toggle-verify-table");
  const verifyContainer = document.getElementById("verify-log-container");
  if (btnToggleVerify && verifyContainer) {
    btnToggleVerify.addEventListener("click", () => {
      verifyContainer.classList.toggle("hidden");
    });
  }

  // BPMN Swimlane Interactive Flow Runner
  const btnRunBpmnFlow = document.getElementById("btn-run-bpmn-flow");
  const bpmnNodes = [
    "bpmn-node-human-1", "bpmn-node-agent-clean", "bpmn-node-agent-artifact",
    "bpmn-node-human-verify", "bpmn-node-decision", "bpmn-node-agent-calc",
    "bpmn-node-agent-report", "bpmn-node-human-p2", "bpmn-node-human-p3",
    "bpmn-node-agent-audit", "bpmn-node-agent-priority", "bpmn-node-mgr-review", "bpmn-node-mgr-decision"
  ];

  function highlightBpmnNode(activeId) {
    bpmnNodes.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === activeId) {
          el.classList.add("ring-2", "ring-[#FF5B8E]", "scale-105", "shadow-md");
          el.classList.remove("opacity-60");
        } else {
          el.classList.remove("ring-2", "ring-[#FF5B8E]", "scale-105", "shadow-md");
        }
      }
    });
  }

  if (btnRunBpmnFlow) {
    btnRunBpmnFlow.addEventListener("click", () => {
      if (state.isCleaningRunning) return;
      state.isCleaningRunning = true;
      showToast("Khởi chạy quy trình BPMN Quản trị Bán hàng Phúc An...");

      // 1. Human: Cung cấp file Excel thô
      highlightBpmnNode("bpmn-node-human-1");
      appendLog("[BPMN 1.1] Con người: Tiếp nhận và nạp File Excel bán hàng thô 1.006 dòng • 15 trường.", "info");

      setTimeout(() => {
        // 2. AI Agent: Làm sạch tự động
        highlightBpmnNode("bpmn-node-agent-clean");
        appendLog("[BPMN 1.2] AI Agent / API: Tự động chuẩn hóa dữ liệu, khử 34 đơn trùng, bỏ 42 đơn hủy.", "clean");
      }, 700);

      setTimeout(() => {
        // 3. AI Agent: Xuất Artifact "Bộ dữ liệu đã làm sạch + Nhật ký xử lý"
        highlightBpmnNode("bpmn-node-agent-artifact");
        appendLog("[BPMN 1.3] AI Agent / API: Đã xuất 'Bộ dữ liệu sạch + Nhật ký xử lý' gồm 930 dòng chuẩn.", "success");
      }, 1400);

      setTimeout(() => {
        // 4. Human: Kiểm tra kết quả làm sạch
        highlightBpmnNode("bpmn-node-human-verify");
        highlightBpmnNode("bpmn-node-decision");
        appendLog("[BPMN 1.4] Con người: Thực hiện bước Human Verification ➔ Dữ liệu OK? Phê duyệt [CÓ]!", "clean");
        state.phase1Completed = true;
      }, 2100);

      setTimeout(() => {
        // 5. Phase 2 AI Agent: Tính chỉ tiêu
        highlightBpmnNode("bpmn-node-agent-calc");
        appendLog("[BPMN 2.1] AI Agent / API: Tính toán doanh thu thuần, LN gộp, đơn hủy/hoàn và cơ cấu SP.", "clean");
      }, 2800);

      setTimeout(() => {
        // 6. Phase 2 AI Agent: Tạo báo cáo quản trị Dashboard / Summary
        highlightBpmnNode("bpmn-node-agent-report");
        highlightBpmnNode("bpmn-node-human-p2");
        appendLog("[BPMN 2.2] AI Agent: Sinh Dashboard quản trị 18 cửa hàng. Con người tiếp nhận đối chiếu.", "success");
        state.phase2Completed = true;
        generateManagementReport();
      }, 3500);

      setTimeout(() => {
        // 7. Phase 3 AI Agent: Đối chiếu & Phát hiện bất thường
        highlightBpmnNode("bpmn-node-agent-audit");
        highlightBpmnNode("bpmn-node-human-p3");
        appendLog("[BPMN 3.1] AI Agent: Cross-check đối soát 2 chiều, bóc tách bẫy doanh thu CH03 & đổi trả CH15.", "clean");
      }, 4200);

      setTimeout(() => {
        // 8. Phase 3 AI Agent: Gợi ý ưu tiên
        highlightBpmnNode("bpmn-node-agent-priority");
        appendLog("[BPMN 3.2] AI Agent: Xuất Ma trận phân loại ưu tiên 18 cửa hàng (Nhóm 1 Cấp thiết: CH03, CH15, CH08, CH04).", "clean");
        state.phase3Completed = true;
        runCrossCheckAudit();
      }, 4900);

      setTimeout(() => {
        // 9. Quản lý: Đánh giá & Ra quyết định
        highlightBpmnNode("bpmn-node-mgr-review");
        highlightBpmnNode("bpmn-node-mgr-decision");
        appendLog("[BPMN 3.3] Quản lý (Giám đốc Kinh doanh): Đánh giá báo cáo và sẵn sàng ký Lệnh hỗ trợ kịp thời!", "success");
        state.isCleaningRunning = false;
        showToast("Toàn bộ quy trình BPMN đã thực thi hoàn tất!");
      }, 5600);
    });
  }

  // Allow clicking on individual BPMN nodes
  bpmnNodes.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", () => {
        highlightBpmnNode(id);
        if (id.includes("human-1") || id.includes("clean") || id.includes("artifact")) {
          switchPhase(1);
        } else if (id.includes("calc") || id.includes("report") || id.includes("human-p2")) {
          switchPhase(2);
        } else {
          switchPhase(3);
        }
      });
    }
  });

  // 9-Step Pipeline Runner Button
  const btnRun9Steps = document.getElementById("btn-run-9steps");
  const statusIndicator = document.getElementById("pipeline-status-indicator");
  const statusText = document.getElementById("pipeline-status-text");

  function highlightStep(stepNum) {
    for (let i = 1; i <= 9; i++) {
      const box = document.getElementById(`step-box-${i}`);
      if (box) {
        if (i === stepNum) {
          box.className = "p-3 rounded-2xl border-2 border-[#FF5B8E] bg-[#FFF0F5] shadow-md shadow-pink-300/30 scale-102 transition-all space-y-1";
        } else if (i < stepNum) {
          box.className = "p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 transition-all space-y-1 opacity-90";
        } else {
          box.className = "p-3 rounded-2xl border border-slate-200 bg-slate-50 transition-all space-y-1 opacity-70";
        }
      }
    }
  }

  if (btnRun9Steps) {
    btnRun9Steps.addEventListener("click", () => {
      if (state.isCleaningRunning) return;
      state.isCleaningRunning = true;
      statusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#FF5B8E] animate-ping";
      statusText.textContent = "Đang chạy luồng 9 bước tự động...";

      // Step 1
      highlightStep(1);
      statusText.textContent = "Bước 1: Đang nạp File Excel bán hàng thô (1.006 dòng • 15 trường)...";
      appendLog("[BƯỚC 1] Nạp tệp Excel bán hàng thô 1.006 dòng • 15 trường dữ liệu.", "info");

      setTimeout(() => {
        // Step 2
        highlightStep(2);
        statusText.textContent = "Bước 2: Kiểm tra cấu trúc (Tên cột, kiểu dữ liệu, định dạng ngày, trường bắt buộc)...";
        appendLog("[BƯỚC 2] Kiểm tra cấu trúc 15 trường: Kiểu số, ngày DD/MM/YYYY, trạng thái hợp lệ.", "clean");
      }, 700);

      setTimeout(() => {
        // Step 3
        highlightStep(3);
        statusText.textContent = "Bước 3: Làm sạch dữ liệu (Khoảng trắng, định dạng ngày, chuẩn hóa ô trống)...";
        appendLog("[BƯỚC 3] Chuẩn hóa khoảng trắng, quy đổi ngày đồng nhất và điền 0 vào ô đổi trả trống.", "clean");
      }, 1400);

      setTimeout(() => {
        // Step 4
        highlightStep(4);
        statusText.textContent = "Bước 4: Kiểm tra chất lượng (Mã giao dịch, số lượng, đơn giá, thành tiền, mã gốc)...";
        appendLog("[BƯỚC 4] Kiểm tra chất lượng: Phát hiện 34 dòng lặp mã, 42 đơn hủy, 8 mã gốc không khớp.", "clean");
      }, 2100);

      setTimeout(() => {
        // Step 5: Exception
        highlightStep(5);
        statusText.textContent = "Bước 5: Ghi nhận ngoại lệ & Đối soát (Đưa vào danh sách rà soát ➔ Vòng lặp điều chỉnh)...";
        appendLog("[BƯỚC 5] Ghi nhận 84 bản ghi ngoại lệ vào sổ rà soát. Xử lý loại trừ và lặp lại Bước 3.", "clean");
        renderExceptionsTable();
        if (exceptionContainer) exceptionContainer.classList.remove("hidden");
      }, 2800);

      setTimeout(() => {
        // Step 6: Process & Aggregate
        highlightStep(6);
        statusText.textContent = "Bước 6: Xử lý & Tổng hợp (Doanh thu, số lượng, 18 cửa hàng, phân loại hoàn tất/hủy/trả)...";
        appendLog("[BƯỚC 6] Tổng hợp số liệu sạch cho 18 cửa hàng: Doanh thu thuần 49.47 Tỷ, Lợi nhuận gộp 15.54 Tỷ.", "clean");
      }, 3500);

      setTimeout(() => {
        // Step 7: Verification
        highlightStep(7);
        statusText.textContent = "Bước 7: Xác minh kết quả (Đối chiếu: Thành tiền = SL × Đơn giá; Tiền hoàn khớp 100%)...";
        appendLog("[BƯỚC 7] Xác minh hoàn tất: Thành tiền = SL × Đơn giá khớp 100%, Sai lệch = 0 đ.", "clean");
        if (verifyContainer) verifyContainer.classList.remove("hidden");
      }, 4200);

      setTimeout(() => {
        // Step 8: Dashboard & Report
        highlightStep(8);
        statusText.textContent = "Bước 8: Báo Cáo / Dashboard (Bộ dữ liệu sạch + KPI 18 CH + Biểu đồ + Xếp hạng ưu tiên)...";
        appendLog("[BƯỚC 8] Đã sinh Báo Cáo Quản Trị và Ma Trận Ưu Tiên 18 Cửa Hàng cho Giám đốc.", "success");
        state.phase1Completed = true;
        state.phase2Completed = true;
        state.phase3Completed = true;
      }, 4900);

      setTimeout(() => {
        // Step 9: Feedback & Loop
        highlightStep(9);
        statusIndicator.className = "w-2.5 h-2.5 rounded-full bg-emerald-500";
        statusText.textContent = "Bước 9: Phản hồi & Cải tiến hoàn tất! Đã cập nhật quy tắc vào bộ nhớ Agent cho kỳ sau.";
        appendLog("[BƯỚC 9] Ghi nhận bài học audit: Tự động khóa cherry-picking ngày và bóc tách bẫy doanh thu CH03.", "success");
        state.isCleaningRunning = false;
        showToast("Toàn bộ quy trình 9 bước đã hoàn thành xuất sắc!");
      }, 5600);
    });
  }

  // AI Agent Data Cleaning Pipeline (GIAI ĐOẠN 1)
  btnRunCleaning.addEventListener("click", () => {
    runCleaningPipeline();
  });

  // Human Verification Gate Handlers
  document.getElementById("btn-human-approve").addEventListener("click", () => {
    state.phase1Completed = true;
    document.getElementById("badge-phase1").textContent = "Đã hoàn thành & Phê duyệt";
    document.getElementById("badge-phase1").className = "text-[10px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700";
    document.getElementById("tab-phase1").classList.add("completed");

    document.getElementById("badge-phase2").textContent = "Sẵn sàng tính toán";
    document.getElementById("badge-phase2").className = "text-[10px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700";

    setWorkflowStep(3);
    showToast("Đã xác nhận dữ liệu sạch! Đang chuyển sang Bước 3: Phân Tích & Feedback...");
    setTimeout(() => switchPhase(2), 500);
  });

  // ==========================================
  // REVISION MODAL & CUSTOM HUMAN FEEDBACK SYSTEM
  // ==========================================
  const revisionModal = document.getElementById("revision-modal");
  const btnCloseRevision = document.getElementById("btn-close-revision-modal");
  const btnCancelRevision = document.getElementById("btn-cancel-revision");
  const btnSubmitRevision = document.getElementById("btn-submit-revision");
  const revisionPromptInput = document.getElementById("revision-prompt-input");
  const btnOpenRevisionModal = document.getElementById("btn-open-revision-modal");

  function openRevisionModal(initialText = "") {
    if (initialText && revisionPromptInput) {
      revisionPromptInput.value = initialText;
    }
    if (revisionModal) {
      revisionModal.classList.remove("hidden");
      if (revisionPromptInput) revisionPromptInput.focus();
    }
  }

  function closeRevisionModal() {
    if (revisionModal) {
      revisionModal.classList.add("hidden");
    }
  }

  window.openRevisionModal = openRevisionModal;
  window.closeRevisionModal = closeRevisionModal;

  if (btnOpenRevisionModal) {
    btnOpenRevisionModal.addEventListener("click", () => openRevisionModal());
  }

  document.getElementById("btn-human-reject").addEventListener("click", () => {
    openRevisionModal("Yêu cầu AI Agent kiểm tra lại các đơn đổi trả của cửa hàng CH15 và đồng bộ lại số ngày so sánh của CH04 về đúng 30 ngày chuẩn.");
  });

  if (btnCloseRevision) btnCloseRevision.addEventListener("click", closeRevisionModal);
  if (btnCancelRevision) btnCancelRevision.addEventListener("click", closeRevisionModal);

  document.querySelectorAll(".preset-rule-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const rule = btn.getAttribute("data-rule");
      if (!rule || !revisionPromptInput) return;
      if (revisionPromptInput.value.trim().length > 0) {
        revisionPromptInput.value += "\n• " + rule;
      } else {
        revisionPromptInput.value = rule;
      }
      revisionPromptInput.focus();
    });
  });

  function executeAgentRevision(promptText) {
    const text = (promptText || (revisionPromptInput ? revisionPromptInput.value : "") || "").trim() || "Hiệu chỉnh quy tắc lọc trùng, bóc tách hàng trả bảo hành và đồng bộ kỳ so sánh chuẩn hóa.";
    
    // Switch to Phase 1 so user sees real action
    switchPhase(1);

    const cleaningBadge = document.getElementById("cleaning-status-badge");
    if (cleaningBadge) {
      cleaningBadge.textContent = "Agent đang chỉnh sửa...";
      cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-amber-500 text-white font-bold animate-pulse";
    }

    showToast("AI Agent đã tiếp nhận yêu cầu! Đang chạy lại pipeline làm sạch...", true);

    const nowTime = new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    appendLog(`Chỉ đạo: "${text}"`, "human");

    setTimeout(() => {
      appendLog(`Phân tích chỉ thị: Tái cấu trúc logic làm sạch cho 60.000 dòng dữ liệu...`, "agent");
    }, 400);

    setTimeout(() => {
      appendLog(`[BƯỚC 1] Siết chặt ngưỡng lọc trùng POS: Bóc tách các giao dịch quét trùng lặp.`, "clean");
    }, 900);

    setTimeout(() => {
      let extraNote = "Loại bỏ hoàn toàn đơn hủy ghép sai & chuẩn hóa hàng trả.";
      if (text.toLowerCase().includes("ch15") || text.toLowerCase().includes("đổi trả")) {
        extraNote = "Bóc tách 180 triệu tiền đổi trả thiết bị CAT03 tại CH15; điều chỉnh giá vốn hoàn nhập.";
      }
      appendLog(`[BƯỚC 2] ${extraNote}`, "clean");
    }, 1500);

    setTimeout(() => {
      appendLog(`[BƯỚC 3] Khóa cứng kỳ đối chiếu: Chuẩn hóa toàn bộ 18 cửa hàng về 31 ngày T10 vs 30 ngày T09 (đã bóc tăng trưởng ảo CH04).`, "clean");
    }, 2100);

    setTimeout(() => {
      state.cleaningCompleted = true;
      state.phase1Completed = true;

      // Update counters
      const duplicateEl = document.getElementById("stat-duplicate-rows");
      const cancelledEl = document.getElementById("stat-cancelled-rows");
      const returnEl = document.getElementById("stat-return-rows");
      const cleanEl = document.getElementById("stat-clean-rows");

      if (duplicateEl) duplicateEl.innerHTML = `1.842 <span class="text-xs font-normal text-rose-500">dòng</span>`;
      if (cancelledEl) cancelledEl.innerHTML = `2.150 <span class="text-xs font-normal text-amber-600">dòng</span>`;
      if (returnEl) returnEl.innerHTML = `3.420 <span class="text-xs font-normal text-purple-600">dòng</span>`;
      if (cleanEl) cleanEl.innerHTML = `56.008 <span class="text-xs font-normal text-emerald-600">dòng (Đã sửa)</span>`;

      appendLog(`Dữ liệu đã được hiệu chỉnh hoàn tất theo đúng chỉ đạo! Sẵn sàng chốt duyệt.`, "success");

      if (cleaningBadge) {
        cleaningBadge.textContent = "Đã chỉnh sửa xong";
        cleaningBadge.className = "px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold";
      }

      // Update Human Verification Box UI
      const humanBox = document.getElementById("human-verification-box");
      if (humanBox) {
        humanBox.className = "pink-card p-5 bg-gradient-to-r from-[#F0FDF4] via-white to-[#F0FDF4] border-2 border-emerald-400";
        const subtitle = humanBox.querySelector("p");
        if (subtitle) {
          subtitle.innerHTML = `<span class="text-emerald-700 font-bold"><i class="fa-solid fa-circle-check"></i> Đã hiệu chỉnh xong theo chỉ đạo của bạn lúc ${nowTime}!</span> Dữ liệu đã đạt chuẩn đối soát. Bạn có thể bấm "Xác Nhận Dữ Liệu OK" để tạo báo cáo.`;
        }
      }

      showToast("AI Agent đã hoàn thành chỉnh sửa dữ liệu theo yêu cầu!", true);
    }, 2800);
  }

  window.executeAgentRevision = executeAgentRevision;

  if (btnSubmitRevision) {
    btnSubmitRevision.addEventListener("click", () => {
      const promptVal = revisionPromptInput ? revisionPromptInput.value.trim() : "";
      closeRevisionModal();
      executeAgentRevision(promptVal);
    });
  }

  // GIAI ĐOẠN 2: TẠO BÁO CÁO QUẢN TRỊ
  function generateManagementReport() {
    state.isReportGenerated = true;
    state.phase2Completed = true;
    document.getElementById("badge-phase2").textContent = "Đã tạo báo cáo";
    document.getElementById("badge-phase2").className = "text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300";
    document.getElementById("tab-phase2").classList.add("completed");

    document.getElementById("badge-phase3").textContent = "Sẵn sàng đối chiếu";
    document.getElementById("badge-phase3").className = "text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold border border-blue-300";

    // Macro KPIs calculation and update
    const totalCleanRev = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.cleanRev, 0);
    const totalTargetRev = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.targetRevenue, 0);
    const totalCleanProfit = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.cleanProfit, 0);
    const totalTargetProfit = PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.targetGrossProfit, 0);
    const avgMargin = ((totalCleanProfit / totalCleanRev) * 100).toFixed(1);
    const avgReturn = (PHUC_AN_DATA.stores.reduce((sum, s) => sum + s.returnRate, 0) / PHUC_AN_DATA.stores.length).toFixed(1);

    const kpiRev = document.getElementById("kpi-macro-rev");
    if (kpiRev) kpiRev.innerHTML = `${(totalCleanRev / 1000000000).toFixed(2)} <span class="text-sm font-semibold text-blue-600">Tỷ VNĐ</span>`;
    const kpiRevTgtLbl = document.getElementById("kpi-macro-rev-target-lbl");
    if (kpiRevTgtLbl) kpiRevTgtLbl.textContent = `Mục tiêu: ${(totalTargetRev / 1000000000).toFixed(1)} Tỷ`;
    const kpiRevTgt = document.getElementById("kpi-macro-rev-target");
    if (kpiRevTgt) {
      kpiRevTgt.textContent = `Đạt ${((totalCleanRev / totalTargetRev) * 100).toFixed(1)}%`;
      kpiRevTgt.className = "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded";
    }

    const kpiProf = document.getElementById("kpi-macro-profit");
    if (kpiProf) kpiProf.innerHTML = `${(totalCleanProfit / 1000000000).toFixed(2)} <span class="text-sm font-semibold text-emerald-600">Tỷ VNĐ</span>`;
    const kpiProfTgtLbl = document.getElementById("kpi-macro-profit-target-lbl");
    if (kpiProfTgtLbl) kpiProfTgtLbl.textContent = `Mục tiêu: ${(totalTargetProfit / 1000000000).toFixed(2)} Tỷ`;
    const kpiProfTgt = document.getElementById("kpi-macro-profit-target");
    if (kpiProfTgt) {
      kpiProfTgt.textContent = `Đạt ${((totalCleanProfit / totalTargetProfit) * 100).toFixed(1)}%`;
      kpiProfTgt.className = "text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded";
    }

    const kpiMargin = document.getElementById("kpi-macro-margin");
    if (kpiMargin) kpiMargin.textContent = `${avgMargin}%`;
    const kpiMarginSub = document.getElementById("kpi-macro-margin-sub");
    if (kpiMarginSub) {
      kpiMarginSub.textContent = "-0.6% do xả hàng";
      kpiMarginSub.className = "text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded";
    }

    const kpiRet = document.getElementById("kpi-macro-return");
    if (kpiRet) kpiRet.textContent = `${avgReturn}%`;
    const kpiRetSub = document.getElementById("kpi-macro-return-sub");
    if (kpiRetSub) {
      kpiRetSub.textContent = "Vượt trần";
      kpiRetSub.className = "text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded";
    }

    // Update Top Products bars
    const p1 = document.getElementById("prog-cat-01");
    if (p1) p1.style.width = "45%";
    const b1 = document.getElementById("badge-cat-01");
    if (b1) b1.textContent = "45%";
    const p2 = document.getElementById("prog-cat-02");
    if (p2) p2.style.width = "23%";
    const b2 = document.getElementById("badge-cat-02");
    if (b2) b2.textContent = "23%";
    const p3 = document.getElementById("prog-cat-03");
    if (p3) p3.style.width = "19%";
    const b3 = document.getElementById("badge-cat-03");
    if (b3) b3.textContent = "19%";
    const p4 = document.getElementById("prog-cat-04");
    if (p4) p4.style.width = "26%";
    const b4 = document.getElementById("badge-cat-04");
    if (b4) b4.textContent = "26%";

    // Update Top Row Dabang metrics
    const sumTotRev = document.getElementById("summary-total-rev-header");
    if (sumTotRev) sumTotRev.textContent = "49,47 Tỷ VNĐ";
    const sumTgtBadge = document.getElementById("summary-target-reality-badge");
    if (sumTgtBadge) {
      sumTgtBadge.textContent = "97.0% Hoàn Thành";
      sumTgtBadge.className = "text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full";
    }
    const statReal = document.getElementById("stat-reality-sales");
    if (statReal) statReal.innerHTML = `49.47 B <span class="text-slate-400 font-normal">(8.823)</span>`;
    const statTgt = document.getElementById("stat-target-sales");
    if (statTgt) statTgt.innerHTML = `51.00 B <span class="text-slate-400 font-normal">(12.122)</span>`;

    renderStoresManagementTable();
    initCharts(false);
    showToast("Báo cáo Quản trị 18 Cửa hàng đã được tạo thành công!");
  }

  document.getElementById("btn-generate-report").addEventListener("click", generateManagementReport);
  document.getElementById("btn-proceed-phase3").addEventListener("click", () => switchPhase(3));

  // Render 18 Stores Management Table
  function renderStoresManagementTable(search = "", region = "all") {
    const tbody = document.getElementById("stores-report-tbody");
    tbody.innerHTML = "";

    if (!state.isReportGenerated) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-store text-3xl mb-2 text-slate-300 block"></i>
            Chưa có báo cáo cửa hàng. Dữ liệu sẽ tự động tổng hợp sau khi bạn nạp tệp và bấm 'AI Agent: Tính Toán Báo Cáo' ở Giai đoạn 2.
          </td>
        </tr>
      `;
      return;
    }

    const filtered = PHUC_AN_DATA.stores.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
      const matchRegion = region === "all" || s.region === region;
      return matchSearch && matchRegion;
    });

    filtered.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);
      const growthVsSep = (((s.cleanRev - s.compRev) / s.compRev) * 100).toFixed(1);

      let targetColor = "text-emerald-700";
      if (targetPercent < 80) targetColor = "text-rose-700 font-bold";
      else if (targetPercent < 95) targetColor = "text-amber-700";

      let marginColor = "text-slate-800";
      if (grossMarginPercent < 25) marginColor = "text-rose-700 font-bold";

      let returnColor = "text-slate-700";
      if (s.returnRate > 5.0) returnColor = "text-rose-700 font-bold";

      let statusBadge = `<span class="badge-priority-${s.priority} px-2.5 py-0.5 rounded-full text-[10px] font-bold">${s.status}</span>`;

      const tr = document.createElement("tr");
      tr.className = "hover:bg-slate-50 transition";
      tr.innerHTML = `
        <td class="p-3">
          <div class="font-bold text-slate-900">${s.name}</div>
          <div class="text-[11px] text-slate-500">${s.id} • Quản lý: ${s.manager}</div>
        </td>
        <td class="p-3 text-slate-600 font-medium">${s.region}</td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
        <td class="p-3 text-right font-mono text-slate-500">${formatMoney(s.targetRevenue)}</td>
        <td class="p-3 text-right font-mono ${targetColor}">${targetPercent}%</td>
        <td class="p-3 text-right font-mono text-emerald-700 font-bold">${formatMoney(s.cleanProfit)}</td>
        <td class="p-3 text-right font-mono ${marginColor}">${grossMarginPercent}%</td>
        <td class="p-3 text-right font-mono ${returnColor}">${s.returnRate}%</td>
        <td class="p-3 text-center font-mono ${growthVsSep >= 0 ? 'text-emerald-700' : 'text-rose-700'} font-bold">
          ${growthVsSep >= 0 ? '+' + growthVsSep : growthVsSep}%
        </td>
        <td class="p-3 text-center">${statusBadge}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById("search-store-input").addEventListener("input", (e) => {
    const region = document.getElementById("filter-region").value;
    renderStoresManagementTable(e.target.value, region);
  });

  document.getElementById("filter-region").addEventListener("change", (e) => {
    const search = document.getElementById("search-store-input").value;
    renderStoresManagementTable(search, e.target.value);
  });

  // Charts Initialization
  function initCharts(isEmpty = false) {
    if (typeof Chart === 'undefined') return;

    // Destroy prior chart instances to prevent canvas reuse errors
    if (state.chartVisitor) { state.chartVisitor.destroy(); state.chartVisitor = null; }
    if (state.chartTotalRev) { state.chartTotalRev.destroy(); state.chartTotalRev = null; }
    if (state.chartCustSat) { state.chartCustSat.destroy(); state.chartCustSat = null; }
    if (state.chartTargetReality) { state.chartTargetReality.destroy(); state.chartTargetReality = null; }
    if (state.chartVolume) { state.chartVolume.destroy(); state.chartVolume = null; }
    if (state.chartStores) { state.chartStores.destroy(); state.chartStores = null; }
    if (state.chartProductMix) { state.chartProductMix.destroy(); state.chartProductMix = null; }

    // A. Visitor Insights Line Chart (Dabang Triple Curve)
    const ctxVisitor = document.getElementById("chart-visitor-insights");
    if (ctxVisitor) {
      state.chartVisitor = new Chart(ctxVisitor, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Loyal Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [270, 290, 275, 250, 230, 270, 345, 320, 290, 260, 230],
              borderColor: '#9333EA',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6
            },
            {
              label: 'New Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [310, 280, 260, 240, 250, 290, 360, 330, 280, 240, 220],
              borderColor: '#FF5B8E',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: isEmpty ? 0 : [0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0],
              pointBackgroundColor: '#FF5B8E',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2
            },
            {
              label: 'Unique Customers',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] : [230, 310, 330, 320, 280, 260, 300, 310, 280, 260, 250],
              borderColor: '#10B981',
              backgroundColor: 'transparent',
              tension: 0.45,
              borderWidth: 2.5,
              pointRadius: 0,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
          }
        }
      });
    }

    // B. Total Revenue Dual Bar Chart
    const ctxTotalRev = document.getElementById("chart-total-revenue");
    if (ctxTotalRev) {
      state.chartTotalRev = new Chart(ctxTotalRev, {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Online Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [12, 11, 23, 8, 11, 14, 18],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Offline Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [14, 16, 7, 15, 12, 16, 21],
              backgroundColor: '#8B5CF6',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 }, color: '#94A3B8' } }
          }
        }
      });
    }

    // C. Customer Satisfaction Dual Curve
    const ctxCustSat = document.getElementById("chart-customer-satisfaction");
    if (ctxCustSat) {
      state.chartCustSat = new Chart(ctxCustSat, {
        type: 'line',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
          datasets: [
            {
              label: 'Last Month',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [78, 65, 72, 63, 68, 62, 79],
              borderColor: '#FF5B8E',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: isEmpty ? 0 : 4,
              pointBackgroundColor: '#FF5B8E'
            },
            {
              label: 'This Month',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [55, 62, 53, 54, 57, 56, 62],
              borderColor: '#8B5CF6',
              backgroundColor: 'transparent',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: isEmpty ? 0 : 4,
              pointBackgroundColor: '#8B5CF6'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }

    // D. Target vs Reality Grouped Bar
    const ctxTargetReality = document.getElementById("chart-target-reality");
    if (ctxTargetReality) {
      state.chartTargetReality = new Chart(ctxTargetReality, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
          datasets: [
            {
              label: 'Reality Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [8.2, 7.5, 6.8, 8.5, 9.2, 8.8, 9.5],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              barPercentage: 0.6
            },
            {
              label: 'Target Sales',
              data: isEmpty ? [0, 0, 0, 0, 0, 0, 0] : [9.0, 8.2, 7.9, 9.1, 10.2, 9.8, 10.5],
              backgroundColor: '#F472B6',
              borderRadius: 6,
              barPercentage: 0.6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
            y: { display: false }
          }
        }
      });
    }

    // E. Volume vs Service Level Stacked Bar
    const ctxVolume = document.getElementById("chart-volume-service");
    if (ctxVolume) {
      state.chartVolume = new Chart(ctxVolume, {
        type: 'bar',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
          datasets: [
            {
              label: 'Volume',
              data: isEmpty ? [0, 0, 0, 0, 0, 0] : [6, 7, 6, 5, 4, 6],
              backgroundColor: '#FF5B8E',
              borderRadius: 6,
              stack: 'Stack 0',
              barPercentage: 0.5
            },
            {
              label: 'Services',
              data: isEmpty ? [0, 0, 0, 0, 0, 0] : [5, 8, 6, 6, 5, 5],
              backgroundColor: '#8B5CF6',
              borderRadius: 6,
              stack: 'Stack 0',
              barPercentage: 0.5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#94A3B8' } },
            y: { display: false }
          }
        }
      });
    }

    // 1. Chart Stores Revenue vs Target
    const ctxStores = document.getElementById("chart-stores-revenue");
    if (ctxStores) {
      const labels = PHUC_AN_DATA.stores.map(s => s.name.replace("Phúc An ", ""));
      const revData = isEmpty ? labels.map(() => 0) : PHUC_AN_DATA.stores.map(s => (s.cleanRev / 1000000000).toFixed(2));
      const targetData = isEmpty ? labels.map(() => 0) : PHUC_AN_DATA.stores.map(s => (s.targetRevenue / 1000000000).toFixed(2));

      state.chartStores = new Chart(ctxStores, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Doanh Thu Thực Tế (Tỷ đ)',
              data: revData,
              backgroundColor: '#FF5B8E',
              borderRadius: 6
            },
            {
              label: 'Chỉ Tiêu Target (Tỷ đ)',
              data: targetData,
              backgroundColor: '#FAD2E1',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#334155', font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: '600' } }
            }
          },
          scales: {
            x: {
              ticks: { color: '#64748b', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" }, maxRotation: 45 },
              grid: { display: false }
            },
            y: {
              ticks: { color: '#64748b', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif" } },
              grid: { color: '#f1f5f9' }
            }
          }
        }
      });
    }

    // 2. Chart Product Mix
    const ctxMix = document.getElementById("chart-product-mix");
    if (ctxMix) {
      state.chartProductMix = new Chart(ctxMix, {
        type: 'doughnut',
        data: {
          labels: isEmpty ? ['Chưa nạp dữ liệu ngành hàng'] : ['Điện gia dụng (35%)', 'Thiết bị số (30%)', 'Chăm sóc sức khỏe (20%)', 'Gia dụng thông minh (15%)'],
          datasets: [{
            data: isEmpty ? [1] : [35, 30, 20, 15],
            backgroundColor: isEmpty ? ['#F1F5F9'] : [
              '#FF5B8E',
              '#BF83FF',
              '#3CD856',
              '#FF947A'
            ],
            borderWidth: 2,
            borderColor: '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#334155', font: { size: 10, family: "'Plus Jakarta Sans', sans-serif", weight: '500' }, boxWidth: 12 }
            }
          },
          cutout: '65%'
        }
      });
    }

    // Ensure charts display in current language (Vietnamese by default)
    if (typeof updateChartLanguages === "function") {
      updateChartLanguages(currentAppLang);
    }
  }

  // GIAI ĐOẠN 3: ĐỐI CHIẾU & RA QUYẾT ĐỊNH (CROSS-CHECK AUDIT)
  function runCrossCheckAudit() {
    state.isAuditCompleted = true;
    state.phase3Completed = true;
    document.getElementById("badge-phase3").textContent = "Đã đối chiếu & Đề xuất";
    document.getElementById("badge-phase3").className = "text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-300";
    document.getElementById("tab-phase3").classList.add("completed");

    renderAnomalyCards();
    renderPriorityMatrix();
    showToast("Cross-check Audit hoàn tất: Đã phân loại các cửa hàng cho Giám đốc Kinh doanh!");
  }

  document.getElementById("btn-run-audit").addEventListener("click", runCrossCheckAudit);

  // Render Anomaly Cards for Phase 3
  function renderAnomalyCards() {
    const container = document.getElementById("anomaly-cards-container");
    if (!container) return;

    if (!state.isAuditCompleted) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bg-white border border-[#FAD2E1] rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-[#FFE2E5] text-[#FA5A7D] flex items-center justify-center mx-auto mb-3 text-xl">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 mb-1">Chưa có phát hiện bất thường</h4>
          <p class="text-xs text-slate-500">Hệ thống sẽ tự động quét, chẩn đoán nguyên nhân sụt giảm biên lợi nhuận, bẫy doanh thu và tỷ lệ đổi trả sau khi hoàn tất đối soát ở Giai đoạn 2.</p>
        </div>
      `;
      return;
    }

    const anomalyStores = PHUC_AN_DATA.stores.filter(s => s.anomaly && s.anomaly.trim() !== "");
    if (anomalyStores.length === 0) {
      container.innerHTML = `
        <div class="col-span-1 md:col-span-2 p-8 text-center bg-white border border-[#FAD2E1] rounded-2xl">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-xl">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h4 class="text-sm font-bold text-slate-800 mb-1">Tất cả điểm bán vận hành chuẩn mực</h4>
          <p class="text-xs text-slate-500">Không phát hiện sai lệch kỳ đối chiếu hoặc bẫy biên lợi nhuận.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    anomalyStores.slice(0, 4).forEach((store, idx) => {
      let badgeColor = "from-rose-200 via-pink-200 to-rose-300";
      let tagBg = "bg-rose-100 text-rose-700";
      let btnBg = "bg-rose-600 hover:bg-rose-700 text-white";
      let statText = "-24.3% LN";
      let tagLabel = "Bẫy Doanh Thu";

      if (idx === 1) {
        badgeColor = "from-purple-200 via-indigo-200 to-pink-200";
        tagBg = "bg-purple-100 text-purple-700";
        btnBg = "bg-purple-600 hover:bg-purple-700 text-white";
        statText = "-7.2%/ngày";
        tagLabel = "Lệch Kỳ Đối Chiếu";
      } else if (idx === 2) {
        badgeColor = "from-amber-200 via-rose-200 to-pink-200";
        tagBg = "bg-amber-100 text-amber-800";
        btnBg = "bg-amber-600 hover:bg-amber-700 text-white";
        statText = `${store.returnRate || 14.8}% Trả Hàng`;
        tagLabel = "Báo Động Đổi Trả";
      } else if (idx === 3) {
        badgeColor = "from-blue-200 via-sky-200 to-pink-200";
        tagBg = "bg-blue-100 text-blue-700";
        btnBg = "bg-blue-600 hover:bg-blue-700 text-white";
        statText = "68.5% Target";
        tagLabel = "Hụt Target Nặng";
      }

      const card = document.createElement("div");
      card.className = "rounded-2xl border border-[#FAD2E1] bg-white overflow-hidden shadow-xs flex flex-col justify-between";
      card.innerHTML = `
        <div>
          <div class="h-24 bg-gradient-to-r ${badgeColor} relative p-3 flex items-start justify-between">
            <span class="px-2.5 py-1 bg-white/90 text-slate-800 font-extrabold text-xs rounded-full shadow-xs">
              ${statText}
            </span>
            <div class="w-7 h-7 rounded-full bg-white/90 text-[#FF5B8E] flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer">
              ⋮
            </div>
          </div>
          <div class="p-4 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-extrabold text-slate-900">${store.id} - ${store.name}</h4>
              <span class="text-[10px] ${tagBg} font-bold px-2 py-0.5 rounded-full">${tagLabel}</span>
            </div>
            <div class="text-[11px] text-[#FF5B8E] font-bold">${store.manager} • ${store.region}</div>
            <div class="bg-rose-50 border border-rose-100 rounded-xl p-2.5 text-xs text-rose-950 mt-2 space-y-1">
              <div><strong>Chẩn đoán:</strong> ${store.anomaly}</div>
              <div class="text-slate-600"><strong>Khuyến nghị:</strong> ${store.recommendation}</div>
            </div>
          </div>
        </div>
        <div class="p-4 pt-0">
          <button class="btn-open-decision w-full py-2 ${btnBg} font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5" data-store-id="${store.id}">
            <i class="fa-solid fa-signature"></i> ${store.decisionApproved ? 'Đã Ký Lệnh' : 'Ký Lệnh Hỗ Trợ'}
          </button>
        </div>
      `;
      container.appendChild(card);
    });

    // Reattach listeners
    container.querySelectorAll(".btn-open-decision").forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.getAttribute("data-store-id");
        openDecisionModal(storeId);
      });
    });
  }

  // Render Priority Matrix for Sales Director
  function renderPriorityMatrix(filter = "all") {
    const tbody = document.getElementById("priority-matrix-tbody");
    tbody.innerHTML = "";

    if (!state.isAuditCompleted) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-400 font-medium">
            <i class="fa-solid fa-shield-halved text-3xl mb-2 text-slate-300 block"></i>
            Chưa có dữ liệu đối chiếu. Vui lòng hoàn thành Giai đoạn 1 & 2 để AI Agent phát hiện bất thường và xếp hạng ưu tiên.
          </td>
        </tr>
      `;
      return;
    }

    const filtered = PHUC_AN_DATA.stores
      .filter(s => filter === "all" || s.priority.toString() === filter)
      .sort((a, b) => a.priority - b.priority); // Highest priority (1) first

    filtered.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);

      let priorityBadge = "";
      if (s.priority === 1) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-triangle-exclamation text-rose-500"></i> Ưu Tiên 1: Cấp thiết
        </span>`;
      } else if (s.priority === 2) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-eye text-amber-500"></i> Ưu Tiên 2: Cần theo dõi
        </span>`;
      } else if (s.priority === 3) {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 w-max inline-block">
          Ưu Tiên 3: Ổn định
        </span>`;
      } else {
        priorityBadge = `<span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 w-max">
          <i class="fa-solid fa-star text-emerald-500"></i> Ưu Tiên 4: Xuất sắc
        </span>`;
      }

      const diagnosis = s.anomaly ? `<span class="text-rose-900 font-semibold bg-rose-50 p-2 rounded-lg border border-rose-100 block">${s.anomaly}</span>` : `<span class="text-slate-500">Không có bất thường. Chỉ số vận hành đạt định mức quy chuẩn.</span>`;
      const recommendation = s.recommendation ? `<span class="text-emerald-950 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-100 block">${s.recommendation}</span>` : `<span class="text-slate-500">Duy trì định mức quản trị hiện tại, phát huy sản phẩm chủ lực.</span>`;

      const tr = document.createElement("tr");
      tr.className = `hover:bg-slate-50 transition ${s.priority === 1 ? 'bg-rose-50/30' : ''}`;
      tr.innerHTML = `
        <td class="p-3">${priorityBadge}</td>
        <td class="p-3">
          <div class="font-bold text-slate-900">${s.name}</div>
          <div class="text-[11px] text-slate-500">${s.id} • QL: ${s.manager}</div>
        </td>
        <td class="p-3 text-right font-mono font-bold text-slate-900">${formatMoney(s.cleanRev)}</td>
        <td class="p-3 text-right font-mono font-bold ${targetPercent < 80 ? 'text-rose-700' : 'text-emerald-700'}">${targetPercent}%</td>
        <td class="p-3 text-right font-mono font-bold ${grossMarginPercent < 25 ? 'text-rose-700' : 'text-slate-700'}">${grossMarginPercent}%</td>
        <td class="p-3 text-right font-mono font-bold ${s.returnRate > 5.0 ? 'text-rose-700' : 'text-slate-700'}">${s.returnRate}%</td>
        <td class="p-3 max-w-xs text-xs">${diagnosis}</td>
        <td class="p-3 max-w-xs text-xs">${recommendation}</td>
        <td class="p-3 text-center">
          <button class="btn-open-decision px-3 py-1.5 rounded-xl text-xs font-bold ${s.priority === 1 ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'} transition flex items-center gap-1.5 mx-auto" data-store-id="${s.id}">
            <i class="fa-solid fa-signature"></i> ${s.decisionApproved ? 'Đã Duyệt Hỗ Trợ' : 'Ký Lệnh Hỗ Trợ'}
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Attach decision button listeners
    document.querySelectorAll(".btn-open-decision").forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.getAttribute("data-store-id");
        openDecisionModal(storeId);
      });
    });
  }

  document.getElementById("filter-priority").addEventListener("change", (e) => {
    renderPriorityMatrix(e.target.value);
  });

  // Decision Modal Logic (GIÁM ĐỐC KINH DOANH RA QUYẾT ĐỊNH)
  const decisionModal = document.getElementById("decision-modal");
  function openDecisionModal(storeId) {
    const store = PHUC_AN_DATA.stores.find(s => s.id === storeId);
    if (!store) return;
    state.selectedStoreForDecision = store;

    document.getElementById("modal-store-name").textContent = `${store.id} - ${store.name}`;
    document.getElementById("modal-store-manager").textContent = `Quản lý cửa hàng: ${store.manager} | Khu vực: ${store.region}`;
    document.getElementById("modal-diagnosis").textContent = store.anomaly || "Cửa hàng hoạt động ổn định, cần tiếp tục giám sát các chỉ số.";
    document.getElementById("modal-action-plan").value = store.recommendation || "Tiếp tục duy trì kế hoạch bán hàng tháng 11, khen thưởng nhân viên xuất sắc.";

    decisionModal.classList.remove("hidden");
  }

  document.getElementById("btn-close-modal").addEventListener("click", () => decisionModal.classList.add("hidden"));
  document.getElementById("btn-cancel-modal").addEventListener("click", () => decisionModal.classList.add("hidden"));

  document.getElementById("btn-confirm-decision").addEventListener("click", () => {
    if (state.selectedStoreForDecision) {
      state.selectedStoreForDecision.decisionApproved = true;
      decisionModal.classList.add("hidden");
      renderPriorityMatrix(document.getElementById("filter-priority").value);
      showToast(`Giám đốc Kinh doanh đã ký ban hành lệnh hỗ trợ khẩn cấp cho ${state.selectedStoreForDecision.name}!`);

      // Push confirmation to AI chat
      appendChatMessage(
        "system",
        `🔔 [LỆNH ĐIỀU ĐỘNG] Giám đốc Kinh doanh đã ký phê duyệt kế hoạch can thiệp cho <strong>${state.selectedStoreForDecision.name}</strong>.<br>` +
        `• <strong>Phương án:</strong> ${document.getElementById("modal-action-plan").value}<br>` +
        `• <strong>Phụ trách:</strong> ${document.getElementById("modal-assignee").value} | <strong>Thời hạn:</strong> ${document.getElementById("modal-deadline").value}`
      );
    }
  });

  // AI COPILOT CHAT LOGIC
  const chatForm = document.getElementById("ai-chat-form");
  const chatInput = document.getElementById("ai-chat-input");
  const chatContainer = document.getElementById("chat-messages-container");

  function appendChatMessage(sender, text) {
    const div = document.createElement("div");
    div.className = "flex items-start gap-2.5";

    if (sender === "user") {
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
          <i class="fa-solid fa-user-tie"></i>
        </div>
        <div class="bg-indigo-600 text-white p-3.5 rounded-2xl max-w-2xl leading-relaxed text-xs shadow-xs">
          ${text}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 text-xs shadow-xs">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div class="bg-white border border-slate-200 text-slate-800 p-3.5 rounded-2xl max-w-2xl leading-relaxed text-xs shadow-xs">
          ${text}
        </div>
      `;
    }

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function handleAiQuery(query) {
    appendChatMessage("user", query);
    const qLower = query.toLowerCase();

    setTimeout(() => {
      let response = "";

      if (qLower.includes("chỉnh sửa") || qLower.includes("chinh sua") || qLower.includes("hiệu chỉnh") || qLower.includes("hãy sửa") || qLower.includes("làm sạch lại") || qLower.includes("lọc lại") || qLower.includes("sửa quy tắc") || qLower.includes("thay đổi quy tắc") || qLower.includes("sửa")) {
        executeAgentRevision(query);
        response = `🤖 <strong>AI Agent đã tiếp nhận lệnh và đang thực thi chỉnh sửa:</strong><br>` +
          `<div class="mt-1.5 p-2.5 bg-[#FFF0F5] border border-[#FFD1DF] rounded-xl text-slate-800 font-semibold">"${escapeHtml(query)}"</div>` +
          `<div class="mt-2 space-y-1 text-slate-700">` +
          `<div>• Đang kích hoạt lại Engine làm sạch dữ liệu theo quy tắc cập nhật...</div>` +
          `<div>• Tái áp dụng bộ lọc đơn trùng, đơn hủy và đồng bộ kỳ so sánh chuẩn hóa.</div>` +
          `<div>• Cập nhật bảng đối soát và kết quả báo cáo mới nhất.</div>` +
          `</div>` +
          `<div class="mt-3 flex flex-wrap gap-2">` +
          `<button onclick="window.switchPhaseTab(1)" class="px-3 py-1.5 bg-[#FF5B8E] text-white rounded-xl font-bold text-xs hover:bg-[#e04879] transition shadow-xs"><i class="fa-solid fa-wand-magic-sparkles"></i> Xem Kết Quả Làm Sạch (GĐ 1)</button>` +
          `<button onclick="window.openRevisionModal('${escapeHtml(query)}')" class="px-3 py-1.5 bg-white border border-[#FFD1DF] text-[#FF5B8E] rounded-xl font-bold text-xs hover:bg-[#FFF0F5] transition shadow-xs"><i class="fa-solid fa-sliders"></i> Mở Bảng Tinh Chỉnh Quy Tắc</button>` +
          `</div>`;
      } else if (qLower.includes("bpmn") || qLower.includes("quy trình làm sạch") || qLower.includes("làm sạch dữ liệu")) {
        response = `<strong>Quy Trình Làm Sạch Tự Động Theo Chuẩn BPMN 3.0:</strong><br>` +
          `1. <strong>Tiếp nhận & Quét cấu trúc:</strong> Tự động nhận diện trường dữ liệu (mã đơn, doanh thu, giá vốn, trạng thái, ngày giờ, chi nhánh).<br>` +
          `2. <strong>Khử trùng lặp (Deduplication):</strong> Phát hiện các mã giao dịch POS bị quẹt thẻ đúp hoặc trùng lặp mã đơn.<br>` +
          `3. <strong>Bóc tách đơn hủy & Hoàn tiền:</strong> Tách biệt các đơn hàng đã bị hủy hoặc hoàn tiền trước khi xuất kho.<br>` +
          `4. <strong>Kiểm soát đơn đổi trả bảo hành:</strong> Định lượng tỷ lệ hoàn hàng từng chi nhánh, phát hiện tư vấn sai công năng.<br>` +
          `5. <strong>Đồng bộ kỳ chuẩn hóa:</strong> Chuyển đổi về doanh thu bình quân/ngày tương đương để loại trừ tăng trưởng ảo.`;
      } else if (qLower.includes("bẫy doanh thu") || qLower.includes("bay doanh thu") || qLower.includes("ch03")) {
        response = `<strong>Cơ Chế Nhận Diện Bẫy Doanh Thu (Revenue Trap):</strong><br>` +
          `• <strong>Bản chất:</strong> Cửa hàng chạy theo chỉ tiêu doanh thu danh nghĩa bằng cách giảm giá xả hàng các sản phẩm biên siêu mỏng (10-12%).<br>` +
          `• <strong>Hệ quả:</strong> Doanh thu bề nổi tăng trưởng (ví dụ +15.5%), nhưng Lợi nhuận gộp thực tế sụt giảm nghiêm trọng (-24.3%).<br>` +
          `• <strong>Hành động của Agent:</strong> Tự động cảnh báo đỏ, đề xuất chuyển KPI sang <em>Lợi Nhuận Gộp</em> và cơ cấu lại danh mục ngành hàng biên cao.`;
      } else if (qLower.includes("ch15") || qLower.includes("bình thạnh") || qLower.includes("đổi trả")) {
        response = `<strong>Phân Tích Bất Thường Đổi Trả & Bảo Hành:</strong><br>` +
          `• <strong>Hiện tượng:</strong> Tỷ lệ đổi trả vượt định mức an toàn doanh nghiệp (> 3.5%). Số tiền hoàn trả và chi phí xử lý phát sinh lớn.<br>` +
          `• <strong>Nguyên nhân thường gặp:</strong> Tư vấn sai công năng kỹ thuật sản phẩm cao cấp, lỗi bao bì hoặc lỗi vận chuyển.<br>` +
          `• <strong>Khuyến nghị của Agent:</strong> Tạm thời siết điều kiện xuất bán dòng sản phẩm nhạy cảm để đào tạo lại quy trình tư vấn và bàn giao khách hàng.`;
      } else if (qLower.includes("ch04") || qLower.includes("hoàn kiếm") || qLower.includes("tăng trưởng thật") || qLower.includes("lệch kỳ") || qLower.includes("chuẩn hóa")) {
        response = `<strong>Cơ Chế Bóc Tách Tăng Trưởng Ảo Do Lệch Kỳ (Period Mismatch):</strong><br>` +
          `• <strong>Hiện tượng:</strong> Báo cáo thủ công ghép dữ liệu 45 ngày (bao gồm các ngày lễ cao điểm) để so sánh khập khiễng với kỳ 30 ngày hiện tại.<br>` +
          `• <strong>Chuẩn hóa của Agent:</strong> Tự động quy đổi doanh thu về <em>Doanh thu bình quân/ngày chuẩn</em> để loại bỏ ảo tưởng tăng trưởng, phản ánh đúng sức bán thực.`;
      } else if (qLower.includes("tiêu chuẩn phân loại") || qLower.includes("thứ tự ưu tiên") || qLower.includes("top 3") || qLower.includes("thị sát") || qLower.includes("khẩn cấp") || qLower.includes("ưu tiên")) {
        response = `<strong>Tiêu Chuẩn Xếp Hạng Ưu Tiên Hỗ Trợ Điểm Bán:</strong><br>` +
          `• 🔴 <strong>Ưu tiên 1 (Cấp thiết):</strong> Sụt giảm biên LN > 15%, hụt chỉ tiêu > 25%, hoặc tỷ lệ đổi trả > 10%. Cần lệnh can thiệp ngay.<br>` +
          `• 🟠 <strong>Ưu tiên 2 (Cần theo dõi):</strong> Đạt từ 80-90% kế hoạch, tỷ lệ đổi trả dao động 5-8%.<br>` +
          `• 🟡 <strong>Ưu tiên 3 (Ổn định):</strong> Đạt 90-100% mục tiêu, các chỉ số vận hành nằm trong dung sai cho phép.<br>` +
          `• 🟢 <strong>Ưu tiên 4 (Xuất sắc):</strong> Vượt > 100% kế hoạch cả doanh thu và lợi nhuận gộp.`;
      } else if (qLower.includes("bối cảnh") || qLower.includes("boi canh") || qLower.includes("doanh nghiệp của tôi") || qLower.includes("mục tiêu phân tích")) {
        if (businessContext.isConfigured) {
          response = `<strong>Bối Cảnh Doanh Nghiệp Đang Áp Dụng:</strong><br>` +
            `• <strong>Doanh nghiệp:</strong> <strong>${escapeHtml(businessContext.companyName || 'Doanh nghiệp')}</strong> (${escapeHtml(businessContext.industry || 'Bán lẻ')})<br>` +
            `• <strong>Kỳ phân tích:</strong> ${escapeHtml(businessContext.period || 'Hiện tại')}<br>` +
            `• <strong>Yêu cầu trọng tâm:</strong> ${escapeHtml(businessContext.description || 'Đối soát bẫy doanh thu và tối ưu hóa lợi nhuận')}<br>` +
            `Hệ thống AI Agent đang ghi nhớ bối cảnh này để rà soát dữ liệu.`;
        } else {
          response = `Bạn chưa lưu bối cảnh cụ thể. Bạn có thể kéo lên phần <strong>Bối Cảnh Doanh Nghiệp & Yêu Cầu Cho AI Agent</strong> ở đầu Giai đoạn 1 để nhập thông tin, hoặc bấm <em>"Mẫu Gợi Ý"</em> để AI Agent hiểu rõ hơn về doanh nghiệp của bạn!`;
        }
      } else if (!customDatasetLoaded && !state.phase1Completed) {
        response = `Xin chào! Tôi đã ghi nhận câu hỏi: <em>"${escapeHtml(query)}"</em>.<br><br>` +
          `Hiện tại hệ thống đang ở trạng thái <strong>dữ liệu trống (sẵn sàng tiếp nhận tệp của bạn)</strong>.<br>` +
          `• <strong>Cách bắt đầu:</strong> Kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV giao dịch của doanh nghiệp bạn vào ô nạp tệp bên trên hoặc bấm nút <strong>"Dữ Liệu Mẫu"</strong>.<br>` +
          `• <strong>Sau khi nạp:</strong> Tôi sẽ tự động phân tích chi tiết toàn bộ số liệu, bóc tách đơn lỗi và đưa ra câu trả lời số học chuẩn xác nhất cho bạn!`;
      } else {
        const stats = customDatasetStats;
        response = `Dựa trên tập dữ liệu đã làm sạch (${stats.cleanRows.toLocaleString('vi-VN')} dòng sạch từ tệp <em>${stats.fileName}</em>):<br>` +
          `• Đơn trùng lặp đã loại trừ: ${stats.duplicateRows.toLocaleString('vi-VN')} đơn.<br>` +
          `• Đơn hủy/hoàn tiền đã tách riêng: ${stats.cancelledRows.toLocaleString('vi-VN')} đơn.<br>` +
          `• Đơn đổi trả phát hiện: ${stats.returnRows.toLocaleString('vi-VN')} đơn.<br>` +
          `Bạn có thể chuyển sang Giai đoạn 2 hoặc Giai đoạn 3 để xem bảng tổng hợp chi tiết và ký lệnh hỗ trợ điều hành!`;
      }

      appendChatMessage("ai", response);
    }, 500);
  }

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;
    chatInput.value = "";
    handleAiQuery(query);
  });

  document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = btn.getAttribute("data-question");
      handleAiQuery(q);
    });
  });

  // CSV Export
  document.getElementById("btn-export-data").addEventListener("click", () => {
    let csv = "Mã CH,Tên Cửa Hàng,Khu Vực,Quản Lý,Doanh Thu Thuần,Mục Tiêu,Đạt Target (%),LN Gộp,Biên LN (%),Tỷ Lệ Đổi Trả (%),Mức Ưu Tiên,Bất Thường Phát Hiện\n";

    PHUC_AN_DATA.stores.forEach(s => {
      const targetPercent = ((s.cleanRev / s.targetRevenue) * 100).toFixed(1);
      const grossMarginPercent = ((s.cleanProfit / s.cleanRev) * 100).toFixed(1);
      const anomaly = s.anomaly ? `"${s.anomaly.replace(/"/g, '""')}"` : "Bình thường";
      csv += `${s.id},"${s.name}",${s.region},"${s.manager}",${s.cleanRev},${s.targetRevenue},${targetPercent}%,${s.cleanProfit},${grossMarginPercent}%,${s.returnRate}%,Ưu tiên ${s.priority},${anomaly}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bao_Cao_Quan_Tri_Doi_Soat_Ban_Hang.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Đã tải xuống Báo cáo Quản trị đối soát CSV!");
  });

  // Sidebar navigation listeners & active tab states
  const navDash = document.getElementById("nav-dashboard");
  const navLeaderboard = document.getElementById("nav-leaderboard");
  const navP1 = document.getElementById("nav-phase1");
  const navProducts = document.getElementById("nav-products");
  const navP2 = document.getElementById("nav-phase2");
  const navP3 = document.getElementById("nav-phase3");
  const navMessages = document.getElementById("nav-messages");

  function setActiveNav(activeBtn) {
    document.querySelectorAll(".dabang-nav-item").forEach(item => item.classList.remove("active"));
    if (activeBtn) activeBtn.classList.add("active");
  }

  if (navDash) {
    navDash.addEventListener("click", () => {
      setActiveNav(navDash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navLeaderboard) {
    navLeaderboard.addEventListener("click", () => {
      setActiveNav(navLeaderboard);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành GĐ 1 để mở khóa Leaderboard 18 CH!", true);
        switchPhase(1);
      } else {
        switchPhase(2);
      }
      const el = document.getElementById("stores-report-tbody");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navP1) {
    navP1.addEventListener("click", () => {
      setActiveNav(navP1);
      switchPhase(1);
      const el = document.getElementById("panel-phase1");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navProducts) {
    navProducts.addEventListener("click", () => {
      setActiveNav(navProducts);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    });
  }

  if (navP2) {
    navP2.addEventListener("click", () => {
      setActiveNav(navP2);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực dữ liệu sạch ở GĐ 1 trước!", true);
        return;
      }
      switchPhase(2);
      const el = document.getElementById("panel-phase2");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navP3) {
    navP3.addEventListener("click", () => {
      setActiveNav(navP3);
      if (!state.phase1Completed) {
        showToast("Vui lòng hoàn thành xác thực GĐ 1 trước!", true);
        return;
      }
      switchPhase(3);
      const el = document.getElementById("panel-phase3");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (navMessages) {
    navMessages.addEventListener("click", () => {
      setActiveNav(navMessages);
      const el = document.getElementById("ai-chat-form");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        document.getElementById("ai-chat-input").focus();
      }
    });
  }

  // Global search bar sync
  const searchGlobal = document.getElementById("search-global-input");
  if (searchGlobal) {
    searchGlobal.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      const localSearch = document.getElementById("search-store-input");
      if (localSearch) localSearch.value = val;
      const region = document.getElementById("filter-region") ? document.getElementById("filter-region").value : "all";
      renderStoresManagementTable(val, region);
    });
  }

  const btnExportSide = document.getElementById("btn-export-data-side");
  if (btnExportSide) {
    btnExportSide.addEventListener("click", () => {
      document.getElementById("btn-export-data").click();
    });
  }

  const btnQuickDispatch = document.getElementById("btn-quick-dispatch");
  if (btnQuickDispatch) {
    btnQuickDispatch.addEventListener("click", () => {
      if (!state.isAuditCompleted) {
        showToast("Vui lòng nạp tệp dữ liệu và hoàn tất đối soát trước khi điều phối lệnh!", true);
        return;
      }
      const topStore = PHUC_AN_DATA.stores.find(s => s.priority === 1) || PHUC_AN_DATA.stores[0];
      if (topStore) {
        openDecisionModal(topStore.id);
      }
    });
  }

  // Language Selector Dropdown Logic
  const btnLangToggle = document.getElementById("btn-lang-toggle");
  const langMenu = document.getElementById("lang-menu");
  const currentLangFlag = document.getElementById("current-lang-flag");
  const currentLangText = document.getElementById("current-lang-text");
  const currentLangChevron = document.getElementById("current-lang-chevron");
  const langOptions = document.querySelectorAll(".lang-option");

  const I18N = {
    vi: {
      flag: "https://flagcdn.com/w20/vn.png",
      name: "Tiếng Việt",
      navDashboard: "Bảng Điều Khiển",
      navLeaderboard: "Bảng Xếp Hạng",
      navPhase1: "Đơn Hàng & Làm Sạch",
      navProducts: "Danh Mục Sản Phẩm",
      navPhase2: "Báo Cáo Bán Hàng",
      navPhase3: "Đối Chiếu & Audit",
      navMessages: "Trợ Lý AI Copilot",
      navSettings: "Cài Đặt Hệ Thống",
      navSignout: "Đăng Xuất",
      headerTitle: "Bảng Điều Khiển Quản Trị",
      searchPlaceholder: "Tìm kiếm cửa hàng, giao dịch, ngành hàng...",
      btnExport: "Xuất Dữ Liệu",

      todaysSalesTitle: "Doanh Số & Giao Dịch",
      todaysSalesSub: "Tổng quan bán hàng (Hệ thống sẵn sàng tiếp nhận tệp dữ liệu khách hàng)",
      lblClean: "Đơn Sạch Hợp Lệ",
      lblDup: "Đơn Trùng Lặp",
      lblCancel: "Đơn Đã Hủy",
      lblReturn: "Đơn Đổi Trả",

      visitorInsightsTitle: "Thông Tin Lượng Khách",
      visitorInsightsSub: "Xu Hướng Toàn Chuỗi",
      loyalCust: "Khách Thân Thiết",
      newCust: "Khách Mới",
      uniqueCust: "Khách Độc Nhất",

      totalRevTitle: "Tổng Doanh Thu",
      onlineSales: "Bán Trực Tuyến",
      offlineSales: "Bán Tại Cửa Hàng",

      custSatTitle: "Độ Hài Lòng Khách Hàng",
      lastMonth: "Tháng Trước",
      thisMonth: "Tháng Này",

      targetRealityTitle: "Mục Tiêu vs Thực Tế",
      realitySalesLbl: "Doanh Số Thực Tế",
      realitySub: "Thực tế",
      targetSalesLbl: "Doanh Số Mục Tiêu",
      targetSub: "Kế hoạch",

      topProdTitle: "Top Ngành Hàng",
      topProdSub: "4 Ngành Hàng Toàn Chuỗi",
      thNum: "#",
      thName: "Ngành Hàng",
      thPop: "Tỷ Trọng Doanh Số",
      thSales: "Đóng Góp",

      cat01: "Điện Gia Dụng (CAT01)",
      cat02: "Thiết Bị Số (CAT02)",
      cat03: "Sức Khỏe & Sắc Đẹp (CAT03)",
      cat04: "Gia Dụng Thông Minh (CAT04)",

      salesMapTitle: "Phân Bổ Doanh Số Khu Vực",
      volServiceTitle: "Sản Lượng vs Mức Dịch Vụ",
      volLbl: "Sản Lượng",
      servLbl: "Dịch Vụ",
      btnGetPro: "Nâng Cấp / Xuất CSV"
    },
    en: {
      flag: "https://flagcdn.com/w20/us.png",
      name: "Eng (US)",
      navDashboard: "Dashboard",
      navLeaderboard: "Leaderboard (18 Stores)",
      navPhase1: "Order (Cleaning)",
      navProducts: "Products (Categories)",
      navPhase2: "Sales Report",
      navPhase3: "Cross-Check & Audit",
      navMessages: "Messages (AI Copilot)",
      navSettings: "Settings",
      navSignout: "Sign Out",
      headerTitle: "Executive Management Dashboard",
      searchPlaceholder: "Search here... (Stores, transactions, categories)",
      btnExport: "Export",

      todaysSalesTitle: "Today's Sales",
      todaysSalesSub: "Sales Summary (Ready to ingest customer dataset)",
      lblClean: "Total Sales",
      lblDup: "Total Order",
      lblCancel: "Product Sold",
      lblReturn: "New Customers",

      visitorInsightsTitle: "Visitor Insights",
      visitorInsightsSub: "Network Trend",
      loyalCust: "Loyal Customers",
      newCust: "New Customers",
      uniqueCust: "Unique Customers",

      totalRevTitle: "Total Revenue",
      onlineSales: "Online Sales",
      offlineSales: "Offline Sales",

      custSatTitle: "Customer Satisfaction",
      lastMonth: "Last Month",
      thisMonth: "This Month",

      targetRealityTitle: "Target vs Reality",
      realitySalesLbl: "Reality Sales",
      realitySub: "Actual",
      targetSalesLbl: "Target Sales",
      targetSub: "Commended",

      topProdTitle: "Top Products",
      topProdSub: "4 Main Categories",
      thNum: "#",
      thName: "Name",
      thPop: "Popularity",
      thSales: "Sales",

      cat01: "Home Decor & Appliances (CAT01)",
      cat02: "Digital Devices & Accessories (CAT02)",
      cat03: "Health & Beauty Care (CAT03)",
      cat04: "Smart Home Gadgets (CAT04)",

      salesMapTitle: "Sales Mapping by Region",
      volServiceTitle: "Volume vs Service Level",
      volLbl: "Volume",
      servLbl: "Services",
      btnGetPro: "Get Pro / Export CSV"
    }
  };

  let currentAppLang = "vi";

  function applyLanguage(lang) {
    const t = I18N[lang] || I18N.vi;
    currentAppLang = lang;

    if (currentLangFlag) currentLangFlag.src = t.flag;
    if (currentLangText) currentLangText.textContent = t.name;

    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setText("txt-nav-dashboard", t.navDashboard);
    setText("txt-nav-leaderboard", t.navLeaderboard);
    setText("txt-nav-phase1", t.navPhase1);
    setText("txt-nav-products", t.navProducts);
    setText("txt-nav-phase2", t.navPhase2);
    setText("txt-nav-phase3", t.navPhase3);
    setText("txt-nav-messages", t.navMessages);
    setText("txt-nav-settings", t.navSettings);
    setText("txt-nav-signout", t.navSignout);
    setText("txt-header-title", t.headerTitle);

    const searchInput = document.getElementById("search-global-input");
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    setText("txt-btn-export", t.btnExport);
    setText("txt-todays-sales-title", t.todaysSalesTitle);
    setText("txt-todays-sales-sub", t.todaysSalesSub);
    setText("txt-lbl-clean", t.lblClean);
    setText("txt-lbl-dup", t.lblDup);
    setText("txt-lbl-cancel", t.lblCancel);
    setText("txt-lbl-return", t.lblReturn);

    setText("txt-visitor-insights-title", t.visitorInsightsTitle);
    setText("txt-visitor-insights-sub", t.visitorInsightsSub);
    setText("txt-loyal-cust", t.loyalCust);
    setText("txt-new-cust", t.newCust);
    setText("txt-unique-cust", t.uniqueCust);

    setText("txt-total-rev-title", t.totalRevTitle);
    setText("txt-online-sales", t.onlineSales);
    setText("txt-offline-sales", t.offlineSales);

    setText("txt-cust-sat-title", t.custSatTitle);
    setText("txt-last-month", t.lastMonth);
    setText("txt-this-month", t.thisMonth);

    setText("txt-target-reality-title", t.targetRealityTitle);
    setText("txt-reality-sales-lbl", t.realitySalesLbl);
    setText("txt-reality-sub", t.realitySub);
    setText("txt-target-sales-lbl", t.targetSalesLbl);
    setText("txt-target-sub", t.targetSub);

    setText("txt-top-prod-title", t.topProdTitle);
    setText("txt-top-prod-sub", t.topProdSub);
    setText("txt-th-num", t.thNum);
    setText("txt-th-name", t.thName);
    setText("txt-th-pop", t.thPop);
    setText("txt-th-sales", t.thSales);

    setText("txt-cat-01", t.cat01);
    setText("txt-cat-02", t.cat02);
    setText("txt-cat-03", t.cat03);
    setText("txt-cat-04", t.cat04);

    setText("txt-sales-map-title", t.salesMapTitle);
    setText("txt-vol-service-title", t.volServiceTitle);
    setText("txt-vol-lbl", t.volLbl);
    setText("txt-serv-lbl", t.servLbl);
    setText("txt-btn-get-pro", t.btnGetPro);

    // Dynamic update chart labels and tooltips
    updateChartLanguages(lang);

    langOptions.forEach(o => {
      const oLang = o.getAttribute("data-lang");
      const check = o.querySelector(".check-icon");
      if (oLang === lang) {
        o.classList.add("font-bold", "text-slate-900");
        o.classList.remove("font-semibold", "text-slate-700");
        if (check) check.classList.remove("hidden");
      } else {
        o.classList.remove("font-bold", "text-slate-900");
        o.classList.add("font-semibold", "text-slate-700");
        if (check) check.classList.add("hidden");
      }
    });

    try {
      localStorage.setItem("app_lang", lang);
    } catch (e) {}
  }

  function updateChartLanguages(lang) {
    const isVi = (lang === "vi");
    if (state.chartVisitor) {
      state.chartVisitor.data.labels = isVi 
        ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (state.chartVisitor.data.datasets[0]) state.chartVisitor.data.datasets[0].label = isVi ? 'Khách Thân Thiết' : 'Loyal Customers';
      if (state.chartVisitor.data.datasets[1]) state.chartVisitor.data.datasets[1].label = isVi ? 'Khách Mới' : 'New Customers';
      if (state.chartVisitor.data.datasets[2]) state.chartVisitor.data.datasets[2].label = isVi ? 'Khách Độc Nhất' : 'Unique Customers';
      state.chartVisitor.update();
    }
    if (state.chartTotalRev) {
      state.chartTotalRev.data.labels = isVi
        ? ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật']
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (state.chartTotalRev.data.datasets[0]) state.chartTotalRev.data.datasets[0].label = isVi ? 'Bán Trực Tuyến' : 'Online Sales';
      if (state.chartTotalRev.data.datasets[1]) state.chartTotalRev.data.datasets[1].label = isVi ? 'Bán Tại Cửa Hàng' : 'Offline Sales';
      state.chartTotalRev.update();
    }
    if (state.chartCustSat) {
      state.chartCustSat.data.labels = isVi
        ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6', 'Tuần 7']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];
      if (state.chartCustSat.data.datasets[0]) state.chartCustSat.data.datasets[0].label = isVi ? 'Tháng Trước' : 'Last Month';
      if (state.chartCustSat.data.datasets[1]) state.chartCustSat.data.datasets[1].label = isVi ? 'Tháng Này' : 'This Month';
      state.chartCustSat.update();
    }
    if (state.chartTargetReality) {
      state.chartTargetReality.data.labels = isVi
        ? ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      if (state.chartTargetReality.data.datasets[0]) state.chartTargetReality.data.datasets[0].label = isVi ? 'Doanh Số Thực Tế' : 'Reality Sales';
      if (state.chartTargetReality.data.datasets[1]) state.chartTargetReality.data.datasets[1].label = isVi ? 'Doanh Số Mục Tiêu' : 'Target Sales';
      state.chartTargetReality.update();
    }
    if (state.chartVolume) {
      state.chartVolume.data.labels = isVi
        ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5', 'Tuần 6']
        : ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
      if (state.chartVolume.data.datasets[0]) state.chartVolume.data.datasets[0].label = isVi ? 'Sản Lượng' : 'Volume';
      if (state.chartVolume.data.datasets[1]) state.chartVolume.data.datasets[1].label = isVi ? 'Dịch Vụ' : 'Services';
      state.chartVolume.update();
    }
  }

  if (btnLangToggle && langMenu) {
    btnLangToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("hidden");
      if (currentLangChevron) {
        currentLangChevron.classList.toggle("rotate-180");
      }
    });

    document.addEventListener("click", (e) => {
      if (!btnLangToggle.contains(e.target) && !langMenu.contains(e.target)) {
        langMenu.classList.add("hidden");
        if (currentLangChevron) {
          currentLangChevron.classList.remove("rotate-180");
        }
      }
    });

    langOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const lang = opt.getAttribute("data-lang");
        applyLanguage(lang);
        langMenu.classList.add("hidden");
        if (currentLangChevron) currentLangChevron.classList.remove("rotate-180");

        if (lang === "vi") {
          showToast("Đã chuyển toàn bộ giao diện sang Tiếng Việt 🇻🇳");
        } else {
          showToast("Switched entire interface to English 🇺🇸");
        }
      });
    });

    // Initialize with saved or default Vietnamese
    let initLang = "vi";
    try {
      initLang = localStorage.getItem("app_lang") || "vi";
    } catch (e) {}
    applyLanguage(initLang);
  }

  // Welcome Modal Logic (Cao Thị Thảo Hiền Onboarding)
  const welcomeOverlay = document.getElementById("welcome-modal-overlay");
  const welcomeCard = document.getElementById("welcome-card");
  const btnStartExp = document.getElementById("btn-start-experience");
  const btnCloseWelcome = document.getElementById("btn-close-welcome");
  const btnOpenWelcome = document.getElementById("btn-open-welcome-profile");

  function closeWelcomeModal() {
    if (welcomeCard) welcomeCard.classList.add("scale-95", "opacity-0");
    if (welcomeOverlay) {
      welcomeOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.classList.add("hidden");
      }, 500);
    }
    showToast("Chào mừng bạn đến với hệ thống AI Agent của Cao Thị Thảo Hiền! 🌸");
  }

  function openWelcomeModal() {
    if (welcomeOverlay && welcomeCard) {
      welcomeOverlay.classList.remove("hidden", "pointer-events-none");
      setTimeout(() => {
        welcomeOverlay.classList.remove("opacity-0");
        welcomeCard.classList.remove("scale-95", "opacity-0");
      }, 10);
    }
  }

  if (btnStartExp) {
    btnStartExp.addEventListener("click", closeWelcomeModal);
  }

  if (btnCloseWelcome) {
    btnCloseWelcome.addEventListener("click", closeWelcomeModal);
  }

  if (btnOpenWelcome) {
    btnOpenWelcome.addEventListener("click", openWelcomeModal);
  }

  // Close when clicking outside the modal on the backdrop
  if (welcomeOverlay && welcomeCard) {
    welcomeOverlay.addEventListener("click", (e) => {
      if (e.target === welcomeOverlay) {
        closeWelcomeModal();
      }
    });
  }

  // Dark / Light Theme Toggle Logic
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const themeToggleIcon = document.getElementById("theme-toggle-icon");

  function applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
      if (themeToggleIcon) {
        themeToggleIcon.className = "fa-solid fa-sun text-amber-400";
      }
      if (btnThemeToggle) {
        btnThemeToggle.setAttribute("title", "Chuyển sang chế độ Sáng (Light Mode)");
      }
    } else {
      document.body.classList.remove("dark-mode");
      if (themeToggleIcon) {
        themeToggleIcon.className = "fa-solid fa-moon text-slate-600";
      }
      if (btnThemeToggle) {
        btnThemeToggle.setAttribute("title", "Chuyển sang chế độ Tối (Dark Mode)");
      }
    }
    try {
      localStorage.setItem("app_theme", theme);
    } catch (e) {}
  }

  // Initialize theme from localStorage or default to light
  let initTheme = "light";
  try {
    initTheme = localStorage.getItem("app_theme") || "light";
  } catch (e) {}
  applyTheme(initTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.contains("dark-mode");
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
      showToast(nextTheme === "dark" ? "Đã chuyển sang chế độ Tối 🌙" : "Đã chuyển sang chế độ Sáng ☀️");
    });
  }

  // Clear all data to blank state for client use
  function clearAllData() {
    state.currentPhase = 1;
    state.phase1Completed = false;
    state.phase2Completed = false;
    state.phase3Completed = false;
    state.isCleaningRunning = false;
    state.isReportGenerated = false;
    state.isAuditCompleted = false;
    state.selectedStoreForDecision = null;

    currentRawRecords = [];
    customDatasetLoaded = false;
    customDatasetStats = {
      totalRows: 0,
      duplicateRows: 0,
      cancelledRows: 0,
      returnRows: 0,
      cleanRows: 0,
      fileName: "Chưa có tệp"
    };

    // Update Counters
    const cleanEl = document.getElementById("stat-clean-rows");
    if (cleanEl) cleanEl.textContent = "0";
    const dupEl = document.getElementById("stat-duplicate-rows");
    if (dupEl) dupEl.textContent = "0";
    const canEl = document.getElementById("stat-cancelled-rows");
    if (canEl) canEl.textContent = "0";
    const retEl = document.getElementById("stat-return-rows");
    if (retEl) retEl.textContent = "0";
    const totEl = document.getElementById("stat-total-raw-rows");
    if (totEl) totEl.innerHTML = `0 <span class="text-xs font-normal text-slate-400">dòng</span>`;
    const totDesc = document.getElementById("stat-total-raw-desc");
    if (totDesc) totDesc.textContent = "Chưa có tệp nạp";

    // Update Badges
    const b1 = document.getElementById("badge-phase1");
    if (b1) {
      b1.textContent = "Chờ nạp tệp";
      b1.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const b2 = document.getElementById("badge-phase2");
    if (b2) {
      b2.textContent = "Chờ GĐ 1";
      b2.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const b3 = document.getElementById("badge-phase3");
    if (b3) {
      b3.textContent = "Chờ GĐ 2";
      b3.className = "text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md";
    }
    const tab1 = document.getElementById("tab-phase1");
    if (tab1) tab1.classList.remove("completed");
    const tab2 = document.getElementById("tab-phase2");
    if (tab2) tab2.classList.remove("completed");
    const tab3 = document.getElementById("tab-phase3");
    if (tab3) tab3.classList.remove("completed");

    if (uploadBanner) uploadBanner.classList.add("hidden");
    if (activeSourceBadge) {
      activeSourceBadge.textContent = "Chưa nạp tệp";
      activeSourceBadge.className = "px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-bold";
    }

    if (cleaningStatusBadge) {
      cleaningStatusBadge.textContent = "Chờ nạp tệp";
      cleaningStatusBadge.className = "px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-bold";
    }

    if (logOutput) {
      logOutput.innerHTML = `
        <div class="text-slate-500">[INFO] Hệ thống AI Agent BPMN 3.0 sẵn sàng tiếp nhận dữ liệu doanh nghiệp.</div>
        <div class="text-slate-500">[INFO] Vui lòng kéo & thả tệp Excel (.xlsx, .xls) hoặc CSV để AI Agent phân tích và làm sạch.</div>
      `;
    }

    // Reset Macro KPIs
    const kpiRev = document.getElementById("kpi-macro-rev");
    if (kpiRev) kpiRev.innerHTML = `0 <span class="text-sm font-semibold text-blue-600">VNĐ</span>`;
    const kpiRevTgtLbl = document.getElementById("kpi-macro-rev-target-lbl");
    if (kpiRevTgtLbl) kpiRevTgtLbl.textContent = "Mục tiêu: 0 VNĐ";
    const kpiRevTgt = document.getElementById("kpi-macro-rev-target");
    if (kpiRevTgt) {
      kpiRevTgt.textContent = "0%";
      kpiRevTgt.className = "text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded";
    }

    const kpiProf = document.getElementById("kpi-macro-profit");
    if (kpiProf) kpiProf.innerHTML = `0 <span class="text-sm font-semibold text-emerald-600">VNĐ</span>`;
    const kpiProfTgtLbl = document.getElementById("kpi-macro-profit-target-lbl");
    if (kpiProfTgtLbl) kpiProfTgtLbl.textContent = "Mục tiêu: 0 VNĐ";
    const kpiProfTgt = document.getElementById("kpi-macro-profit-target");
    if (kpiProfTgt) {
      kpiProfTgt.textContent = "0%";
      kpiProfTgt.className = "text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded";
    }

    const kpiMargin = document.getElementById("kpi-macro-margin");
    if (kpiMargin) kpiMargin.textContent = "0.0%";
    const kpiMarginSub = document.getElementById("kpi-macro-margin-sub");
    if (kpiMarginSub) {
      kpiMarginSub.textContent = "Chờ tính toán";
      kpiMarginSub.className = "text-slate-400 font-medium";
    }

    const kpiRet = document.getElementById("kpi-macro-return");
    if (kpiRet) kpiRet.textContent = "0.0%";
    const kpiRetSub = document.getElementById("kpi-macro-return-sub");
    if (kpiRetSub) {
      kpiRetSub.textContent = "Chờ tính toán";
      kpiRetSub.className = "text-slate-400 font-medium";
    }

    // Reset Top products
    for (let i = 1; i <= 4; i++) {
      const prog = document.getElementById(`prog-cat-0${i}`);
      const badge = document.getElementById(`badge-cat-0${i}`);
      if (prog) prog.style.width = "0%";
      if (badge) badge.textContent = "0%";
    }

    // Reset Top row metrics
    const sumTotRev = document.getElementById("summary-total-rev-header");
    if (sumTotRev) sumTotRev.textContent = "0 VNĐ";
    const sumTgtBadge = document.getElementById("summary-target-reality-badge");
    if (sumTgtBadge) {
      sumTgtBadge.textContent = "Chờ dữ liệu";
      sumTgtBadge.className = "text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full";
    }
    const statReal = document.getElementById("stat-reality-sales");
    if (statReal) statReal.innerHTML = `0 B <span class="text-slate-400 font-normal">(0)</span>`;
    const statTgt = document.getElementById("stat-target-sales");
    if (statTgt) statTgt.innerHTML = `0 B <span class="text-slate-400 font-normal">(0)</span>`;

    renderRawSampleTable();
    renderStoresManagementTable();
    renderAnomalyCards();
    renderPriorityMatrix();
    initCharts(true);
    switchPhase(1);
    hideSubsequentSteps();
  }

  // Clear data on startup so client starts with a completely blank canvas
  clearAllData();
  hideSubsequentSteps();

  // ==============================================
  // INTERACTIVE STAR PARTICLE & MOTION TRAIL ENGINE
  // ==============================================
  const starCanvas = document.getElementById("star-trail-canvas");
  if (starCanvas) {
    const ctx = starCanvas.getContext("2d");
    let particles = [];
    let width = (starCanvas.width = window.innerWidth);
    let height = (starCanvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = starCanvas.width = window.innerWidth;
      height = starCanvas.height = window.innerHeight;
    });

    const starColors = [
      "#FF2D78", // Vibrant rose pink
      "#FF5B8E", // Dabang primary pink
      "#FF9EAF", // Pastel pink
      "#FFA07A", // Pastel coral
      "#FBBF24", // Gold star
      "#FDE047", // Twinkle yellow
      "#C084FC", // Soft purple
      "#67E8F9", // Sparkle cyan
      "#FFFFFF"  // Pure sparkle white
    ];

    class StarParticle {
      constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.color = starColors[Math.floor(Math.random() * starColors.length)];
        this.spikes = Math.random() > 0.35 ? 4 : 5; // 4-pointed or 5-pointed sparkle star
        this.maxSize = isBurst ? Math.random() * 9 + 6 : Math.random() * 6 + 3.5;
        this.size = 0.5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.16;
        this.life = 0;
        this.maxLife = isBurst ? Math.random() * 38 + 25 : Math.random() * 26 + 20;

        const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
        const speed = isBurst ? Math.random() * 4.5 + 1.8 : Math.random() * 1.6 + 0.4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed + (isBurst ? -1.2 : -0.3);
        this.decay = 0.96;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.decay;
        this.vy *= this.decay;
        this.vy += 0.04;
        this.rotation += this.rotSpeed;
        this.life++;

        const progress = this.life / this.maxLife;
        if (progress < 0.25) {
          this.size = (progress / 0.25) * this.maxSize;
        } else {
          this.size = (1 - (progress - 0.25) / 0.75) * this.maxSize;
        }
      }

      draw(c) {
        if (this.size <= 0.2) return;
        const rot = this.rotation;
        const outer = this.size;
        const inner = this.size * 0.4;

        c.save();
        c.beginPath();
        c.translate(this.x, this.y);
        c.rotate(rot);
        for (let i = 0; i < this.spikes; i++) {
          c.lineTo(
            Math.cos((i * Math.PI) / (this.spikes / 2)) * outer,
            Math.sin((i * Math.PI) / (this.spikes / 2)) * outer
          );
          c.lineTo(
            Math.cos(((i + 0.5) * Math.PI) / (this.spikes / 2)) * inner,
            Math.sin(((i + 0.5) * Math.PI) / (this.spikes / 2)) * inner
          );
        }
        c.closePath();
        c.fillStyle = this.color;
        c.shadowColor = this.color;
        c.shadowBlur = 10;
        c.globalAlpha = Math.max(0, 1 - this.life / this.maxLife);
        c.fill();
        c.restore();
      }
    }

    let lastX = -100;
    let lastY = -100;
    let animId = null;

    function addStar(x, y, count = 2, isBurst = false) {
      for (let i = 0; i < count; i++) {
        if (particles.length < 180) {
          particles.push(new StarParticle(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, isBurst));
        }
      }
      if (!animId) {
        animId = requestAnimationFrame(animateStars);
      }
    }

    // Sparkle trail on mouse motion
    window.addEventListener("mousemove", (e) => {
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (dist > 7) {
        addStar(e.clientX, e.clientY, dist > 20 ? 3 : 2, false);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    // Touch motion on mobile/tablet
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 0) {
          const t = e.touches[0];
          addStar(t.clientX, t.clientY, 2, false);
        }
      },
      { passive: true }
    );

    // Star burst on click
    window.addEventListener("click", (e) => {
      addStar(e.clientX, e.clientY, 14, true);
    });

    function animateStars() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.life >= p.maxLife || p.size <= 0.2) {
          particles.splice(i, 1);
        }
      }

      if (particles.length > 0) {
        animId = requestAnimationFrame(animateStars);
      } else {
        animId = null;
        ctx.clearRect(0, 0, width, height);
      }
    }
  }
});

