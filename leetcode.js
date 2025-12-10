const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const acceptedElement = node.querySelector('[data-e2e-locator="submission-result"]');

        if (acceptedElement && acceptedElement.textContent.includes('Accepted')) {
          handleAcceptedSubmission();
        }
      }
    });
  });
});

async function handleAcceptedSubmission() {
  const problemTitle = document.title.split(' - ')[0];
  const submissionTime = new Date().toISOString();

  const statistics = await extractStatistics();

  const submissionData = {
    problem: problemTitle,
    timestamp: submissionTime,
    url: window.location.href,
    statistics
  };

  showNotesPopup(submissionData);
}

function extractStatistics() {
  const stats = {
    runtime: null,
    runtimeBeats: null,
    memory: null,
    memoryBeats: null
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      const allElements = document.querySelectorAll('*');

      allElements.forEach(el => {
        const text = el.textContent;

        if (text.startsWith('Runtime') && text.endsWith('Complexity') && text.includes('Memory')) {
          const runtimeMatch = text.match(/Runtime\s*(\d+)\s*msBeats/);
          if (runtimeMatch) stats.runtime = `${runtimeMatch[1]} ms`;

          const memoryMatch = text.match(/Memory\s*([\d.]+)\s*MBBeats/);
          if (memoryMatch) stats.memory = `${memoryMatch[1]} MB`;

          const runtimeBeatsMatch = text.match(/msBeats\s*([\d.]+)%\s*Analyze/);
          if (runtimeBeatsMatch) stats.runtimeBeats = `${runtimeBeatsMatch[1]}%`;

          const memoryBeatsMatch = text.match(/MBBeats\s*([\d.]+)%\s*Analyze/);
          if (memoryBeatsMatch) stats.memoryBeats = `${memoryBeatsMatch[1]}%`;
        }
      });

      resolve(stats);
    }, 1000);
  });
}

function showNotesPopup(submissionData) {
  if (!document.getElementById('lc-notes-style')) {
    const style = document.createElement('style');
    style.id = 'lc-notes-style';
    style.textContent = `
      #lc-notes-container {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 9999;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .lc-notes-modal {
        background: #ffffff;
        border-radius: 12px;
        padding: 14px 16px 12px 16px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
        max-width: 340px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        display: flex;
        flex-direction: column;
        gap: 8px;
        transform: translateX(120%);
        opacity: 0;
        animation: lc-notes-slide-in 220ms ease-out forwards;
        backdrop-filter: blur(8px);
      }

      .lc-notes-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .lc-notes-close {
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 2px;
        color: #6b7280;
      }

      .lc-notes-subtitle {
        font-size: 15px;
        color: #000000;
        font-weight: 600;
        margin: 0;
      }

      .lc-notes-textarea {
        width: 100%;
        min-height: 90px;
        max-height: 180px;
        resize: vertical;
        font-family: inherit;
        font-size: 13px;
        font-weight: 400;
        padding: 6px 8px;
        color: #000000;
        background: #ffffff;
        border: 1px solid #000000;
        box-sizing: border-box;
        outline: none;
      }

      .lc-notes-textarea:focus {
        border-color: #000000;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
      }

      .lc-notes-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
      }

      .lc-notes-btn {
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 999px;
        border: 1px solid transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .lc-notes-btn-primary {
        background: #ffffffff;
        color: #000000;
        border-color: #000000;
      }

      .lc-notes-btn-primary:hover {
        background: #d2d3d4ff;
      }

      .lc-notes-modal.lc-notes-hide {
        animation: lc-notes-slide-out 170ms ease-in forwards;
      }

      @keyframes lc-notes-slide-in {
        from {
          transform: translateX(120%);
          opacity: 0;
        }
        to {
          transform: translateX(0%);
          opacity: 1;
        }
      }

      @keyframes lc-notes-slide-out {
        from {
          transform: translateX(0%);
          opacity: 1;
        }
        to {
          transform: translateX(120%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const container = document.createElement('div');
  container.id = 'lc-notes-container';

  const modal = document.createElement('div');
  modal.className = 'lc-notes-modal';

  const header = document.createElement('div');
  header.className = 'lc-notes-header';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lc-notes-close';
  closeBtn.innerHTML = '×';

  const subtitle = document.createElement('p');
  subtitle.className = 'lc-notes-subtitle';
  subtitle.textContent = submissionData.problem;

  header.appendChild(subtitle);
  header.appendChild(closeBtn);

  const textarea = document.createElement('textarea');
  textarea.className = 'lc-notes-textarea';
  textarea.placeholder = 'Basic Idea';

  const buttonRow = document.createElement('div');
  buttonRow.className = 'lc-notes-buttons';

  const saveBtn = document.createElement('button');
  saveBtn.className = 'lc-notes-btn lc-notes-btn-primary';
  saveBtn.textContent = 'Save to Notion';

  buttonRow.appendChild(saveBtn);

  modal.appendChild(header);
  modal.appendChild(textarea);
  modal.appendChild(buttonRow);

  container.appendChild(modal);
  document.body.appendChild(container);

  function closeWithAnimation() {
    modal.classList.add('lc-notes-hide');
    setTimeout(() => {
      container.remove();
    }, 190);
  }

  closeBtn.addEventListener('click', closeWithAnimation);

  saveBtn.addEventListener('click', () => {
    const notes = textarea.value || '';

    chrome.runtime.sendMessage(
      {
        type: 'LEETCODE_SAVE_NOTION',
        payload: {
          ...submissionData,
          notes
        }
      }
    );

    closeWithAnimation();
  });

  setTimeout(() => {
    textarea.focus();
  }, 50);
}


observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Monitoring...');
