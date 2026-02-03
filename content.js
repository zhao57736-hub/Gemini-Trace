(function() {
  if (document.getElementById('gemini-map-sidebar')) return;

  // ==========================================
  // 1. 结构 (保持不变)
  // ==========================================
  const sidebar = document.createElement('div');
  sidebar.id = 'gemini-map-sidebar';
  // 去掉 Header，追求极致极简
  sidebar.innerHTML = `
    <div class="map-content" id="map-container"></div>
  `;
  document.body.appendChild(sidebar);

  const mapContainer = sidebar.querySelector('#map-container');
  const MSG_SELECTOR = 'user-query, .user-query, [data-test-id="user-query"]'; 

  // ==========================================
  // 2. 数据更新与渲染
  // ==========================================
  function updateMap() {
    const queries = document.querySelectorAll(MSG_SELECTOR);
    if (queries.length === 0) return;
    mapContainer.innerHTML = '';

    // 为了让滚轮上下有空白缓冲区，我们在列表头尾各加一个空白占位
    // 这样第一条和最后一条也能滚到正中间
    const paddingNode = document.createElement('div');
    paddingNode.style.height = '50px'; // 缓冲区高度
    paddingNode.style.flexShrink = '0';
    mapContainer.appendChild(paddingNode.cloneNode(true));

    queries.forEach((queryEl, index) => {
      let text = queryEl.textContent || queryEl.innerText || "";
      text = text.replace(/\s+/g, ' ').trim();
      
      const node = document.createElement('div');
      node.className = 'history-node';
      
      // 标记最新一条
      if (index === queries.length - 1) {
        node.classList.add('active-node');
      }
      
      node.innerHTML = `
        <span class="node-text">${text}</span>
        <span class="indicator-bar"></span>
      `;
      node.title = text; 

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        queryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 视觉反馈
        document.querySelectorAll('.history-node').forEach(n => n.classList.remove('active-node'));
        node.classList.add('active-node');
        
        queryEl.style.transition = 'outline 0.3s';
        queryEl.style.outline = '2px solid #4e9eff';
        setTimeout(() => { queryEl.style.outline = 'none'; }, 1500);
      });

      mapContainer.appendChild(node);
    });

    // 尾部缓冲
    mapContainer.appendChild(paddingNode.cloneNode(true));
  }

  // ==========================================
  // 3. 智能滚动定位 (核心交互优化)
  // ==========================================
  sidebar.addEventListener('mouseenter', () => {
    // 当鼠标放上去时，自动滚到“当前激活”的那一条
    const active = sidebar.querySelector('.active-node');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // 启动监听
  let updateTimer = null;
  const observer = new MutationObserver((mutations) => {
    if (mutations.some(m => sidebar.contains(m.target))) return;
    if (updateTimer) clearTimeout(updateTimer);
    updateTimer = setTimeout(updateMap, 1000); 
  });
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(updateMap, 1500);

})();