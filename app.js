// NTM v1 Landing Page JavaScript
// Interactive Setup Tabs and Time-Travel Visual Simulator

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================================
  // 1. SETUP TABS INTERACTIVITY
  // ==========================================
  const tabHeaders = document.querySelectorAll(".tab-header");
  const tabContents = document.querySelectorAll(".tab-content");

  tabHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const tabTarget = header.getAttribute("data-tab");

      tabHeaders.forEach(h => h.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      header.classList.add("active");
      document.getElementById(`tab-${tabTarget}`).classList.add("active");
    });
  });

  // ==========================================
  // 2. COPY TO CLIPBOARD BUTTONS
  // ==========================================
  window.copyCommand = function(id) {
    const codeText = document.getElementById(id).innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      showToast("✓ Command copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy command:", err);
    });
  };

  function showToast(message) {
    const toast = document.getElementById("toast-popup");
    toast.querySelector("span").textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  // ==========================================
  // 3. INTERACTIVE TIME-TRAVEL SIMULATOR
  // ==========================================
  const slider = document.getElementById("timeline-scrub");
  const timeLabels = document.querySelectorAll(".slider-labels span");
  
  const stabilityVal = document.getElementById("mock-stability");
  const latencyVal = document.getElementById("mock-latency");
  const lossVal = document.getElementById("mock-loss");
  const statusBadge = document.getElementById("mock-status");
  const logBox = document.getElementById("mock-logs");

  function getDynamicTimes() {
    const now = new Date();
    const t3 = now;
    const t2 = new Date(now.getTime() - 123 * 1000);
    const t1 = new Date(now.getTime() - 195 * 1000);
    const t0 = new Date(now.getTime() - 255 * 1000);
    
    const formatTime = (d) => {
      let hrs = d.getHours();
      let mins = d.getMinutes();
      let secs = d.getSeconds();
      let ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12;
      hrs = hrs < 10 ? '0' + hrs : hrs;
      mins = mins < 10 ? '0' + mins : mins;
      secs = secs < 10 ? '0' + secs : secs;
      return `${hrs}:${mins}:${secs} ${ampm}`;
    };
    
    return [formatTime(t0), formatTime(t1), formatTime(t2), formatTime(t3)];
  }

  function updateTimelineLabels() {
    const times = getDynamicTimes();
    timeLabels.forEach((label, i) => {
      label.textContent = times[i];
    });
  }

  // Update dynamically every second
  updateTimelineLabels();
  setInterval(updateTimelineLabels, 1000);

  const nodes = {
    rt: document.getElementById("node-rt"),
    sw: document.getElementById("node-sw"),
    pc: document.getElementById("node-pc")
  };

  const links = {
    rt_sw: document.getElementById("link-rt-sw"),
    sw_pc: document.getElementById("link-sw-pc")
  };

  // Timeline frames data
  const frames = [
    {
      stability: "100%",
      latency: "2.6 ms",
      loss: "0.0%",
      status: "LIVE VIEW",
      statusClass: "green",
      logs: "ntm# show status\n[Live] System running smoothly.\n[Live] Connection OSPF established on AZ-RT1 e0/0.\n[Live] Ping latency avg: 2.6 ms. Loss: 0%.\n[Live] Stability score: 100% (Healthy Trunk).",
      nodeStates: { rt: "online", sw: "online", pc: "online" },
      linkStates: { rt_sw: "active", sw_pc: "active" }
    },
    {
      stability: "92%",
      latency: "14.2 ms",
      loss: "0.2%",
      status: "ANOMALY FLAGGED",
      statusClass: "yellow",
      logs: "ntm# analyze health\n[Warning] High CPU load on AZ-Core1 (88%).\n[Warning] Packet latency spiked to 14.2 ms.\n[Warning] Churn detector flagged possible routing flap.\n[Warning] OSPF Hello timers approaching dead limit.",
      nodeStates: { rt: "online", sw: "online", pc: "online" },
      linkStates: { rt_sw: "active", sw_pc: "active" }
    },
    {
      stability: "45%",
      latency: "128 ms",
      loss: "82.5%",
      status: "CRITICAL OUTAGE",
      statusClass: "red",
      logs: "ntm# show rootcause\n[CRITICAL] Link AZ-Core1 Vlan1 ➔ AZ-RT1 e0/0 failed!\n[CRITICAL] Packet drop: 82.5%. Latency: 128 ms.\n[RCA] Blast impact: AZ-Core1 and PC1 disconnected.\n[RCA] Root Cause: Physical line breakdown on GNS3 emulator console Telnet 6005.",
      nodeStates: { rt: "online", sw: "offline", pc: "offline" },
      linkStates: { rt_sw: "broken", sw_pc: "active" }
    },
    {
      stability: "100%",
      latency: "4.8 ms",
      loss: "0.0%",
      status: "RECOVERED STATE",
      statusClass: "green",
      logs: "ntm# show events history\n[Event] Backup route OSPF convergent path active.\n[Event] Link states recovered.\n[Event] Latency normalized to 4.8 ms. Loss: 0%.\n[Event] stability index recovered to 100%.",
      nodeStates: { rt: "online", sw: "online", pc: "online" },
      linkStates: { rt_sw: "active", sw_pc: "active" }
    }
  ];

  // Update simulator state
  function updateSimulator(index) {
    const frame = frames[index];
    
    // Update slider and labels
    slider.value = index;
    timeLabels.forEach((label, i) => {
      if (i == index) label.classList.add("active");
      else label.classList.remove("active");
    });

    // Update telemetry sidebar metrics
    stabilityVal.textContent = frame.stability;
    latencyVal.textContent = frame.latency;
    lossVal.textContent = frame.loss;
    statusBadge.textContent = frame.status;
    statusBadge.className = `status-val ${frame.statusClass}`;
    
    // Update logs
    logBox.textContent = frame.logs;
    logBox.scrollTop = logBox.scrollHeight;

    // Update Node classes
    Object.keys(nodes).forEach(key => {
      const circle = nodes[key].querySelector(".node-circle");
      if (frame.nodeStates[key] === "offline") {
        circle.classList.add("offline");
      } else {
        circle.classList.remove("offline");
      }
    });

    // Update Link classes
    Object.keys(links).forEach(key => {
      const link = links[key];
      link.className = "mock-link"; // Reset
      if (frame.linkStates[key] === "active") {
        link.classList.add("active");
      } else if (frame.linkStates[key] === "broken") {
        link.classList.add("broken");
      }
    });
  }

  // Bind simulator events
  slider.addEventListener("input", (e) => {
    updateSimulator(parseInt(e.target.value));
  });

  timeLabels.forEach(label => {
    label.addEventListener("click", () => {
      const targetVal = parseInt(label.getAttribute("data-val"));
      updateSimulator(targetVal);
    });
  });

  // Initialize with frame 0
  updateSimulator(0);

  // ==========================================
  // 4. INTERACTIVE MOCKUP SPLITTERS (DRAG RESIZING)
  // ==========================================
  const mockMainSplitter = document.getElementById("mock-main-splitter");
  const mockSidebarSplitter = document.getElementById("mock-sidebar-splitter");
  const mockFooterSplitter = document.getElementById("mock-footer-splitter");
  
  const mockSidebar = document.getElementById("mock-sidebar");
  const mockInspectPanel = document.getElementById("mock-inspect-panel");
  const mockTimelineFooter = document.getElementById("mock-timeline-footer");
  
  let isDraggingMockMain = false;
  let isDraggingMockSidebar = false;
  let isDraggingMockFooter = false;

  mockMainSplitter.addEventListener("mousedown", (e) => {
    isDraggingMockMain = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  mockSidebarSplitter.addEventListener("mousedown", (e) => {
    isDraggingMockSidebar = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  });

  mockFooterSplitter.addEventListener("mousedown", (e) => {
    isDraggingMockFooter = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDraggingMockMain) {
      const demoContainer = document.getElementById("demo");
      const demoRect = demoContainer.getBoundingClientRect();
      const relativeX = e.clientX - demoRect.left;
      const newWidth = demoRect.width - relativeX - 12;
      if (newWidth > 120 && newWidth < demoRect.width - 150) {
        mockSidebar.style.width = newWidth + "px";
      }
    }
    
    if (isDraggingMockSidebar) {
      const sidebarRect = mockSidebar.getBoundingClientRect();
      const relativeY = e.clientY - sidebarRect.top;
      const newHeight = relativeY - 8;
      if (newHeight > 50 && newHeight < sidebarRect.height - 80) {
        mockInspectPanel.style.height = newHeight + "px";
      }
    }
    
    if (isDraggingMockFooter) {
      const demoContainer = document.getElementById("demo");
      const demoRect = demoContainer.getBoundingClientRect();
      const relativeY = e.clientY - demoRect.top;
      const newHeight = demoRect.height - relativeY - 24;
      if (newHeight > 40 && newHeight < 200) {
        mockTimelineFooter.style.height = newHeight + "px";
      }
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDraggingMockMain || isDraggingMockSidebar || isDraggingMockFooter) {
      isDraggingMockMain = false;
      isDraggingMockSidebar = false;
      isDraggingMockFooter = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
  });

});
