(function(){
  const form = document.getElementById('studio-form');
  const topicEl = document.getElementById('studio-topic');
  const languageHidden = document.getElementById('studio-language');
  const chips = document.getElementById('lang-chips');
  const output = document.getElementById('studio-output');
  const titleEl = document.getElementById('studio-title');
  const contentEl = document.getElementById('studio-content');
  const statusEl = document.getElementById('studio-status');
  const loading = document.getElementById('studio-loading');
  const clearBtn = document.getElementById('studio-clear');
  const downloadBtn = document.getElementById('studio-download');
  const copyBtn = document.getElementById('studio-copy');
  const themeToggle = document.getElementById('toggle-theme');

  let lastTitle = '';
  let lastMarkdown = '';
  let typedMarkdown = '';

  // Theme toggle
  const applyTheme = (t) => {
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
  };
  let theme = localStorage.getItem('theme') || 'dark';
  applyTheme(theme);
  themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  });

  // Configure markdown rendering for nicer line breaks
  if (window.marked && window.marked.setOptions) {
    window.marked.setOptions({ gfm: true, breaks: true });
  }

  // Language chips
  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn) return;
    [...chips.querySelectorAll('.chip')].forEach(c => c.classList.remove('chip-active'));
    btn.classList.add('chip-active');
    languageHidden.value = btn.getAttribute('data-lang');
  });

  clearBtn.addEventListener('click', () => {
    titleEl.textContent = 'Your AI Blog';
    contentEl.innerHTML = '';
    statusEl.textContent = 'Idle';
    lastTitle = '';
    lastMarkdown = '';
  });

  const doDownload = () => {
    if (!lastMarkdown) return;
    const topic = (topicEl.value || 'blog').toLowerCase().replace(/\s+/g, '-');
    const lang = (languageHidden.value || 'english').toLowerCase();
    const safeTitle = (lastTitle || 'untitled').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-');
    const filename = `blog_${topic}_${lang}_${safeTitle}.md`;
    const blob = new Blob([`# ${lastTitle}\n\n${lastMarkdown}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  downloadBtn.addEventListener('click', doDownload);

  copyBtn.addEventListener('click', async () => {
    if (!lastMarkdown) return;
    try {
      await navigator.clipboard.writeText(`# ${lastTitle}\n\n${lastMarkdown}`);
      statusEl.textContent = 'Copied to clipboard';
      setTimeout(() => statusEl.textContent = languageHidden.value ? `Language: ${languageHidden.value}` : 'Language: English', 1200);
    } catch (err) {
      statusEl.textContent = 'Copy failed';
    }
  });

  // No streaming: render full content on response

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const topic = topicEl.value.trim();
    const language = languageHidden.value.trim();
    if (!topic) { topicEl.focus(); return; }

    statusEl.textContent = 'Generating…';
    loading.classList.remove('hidden');
    typedMarkdown = '';
    lastMarkdown = '';

    try {
      const payload = language ? { topic, language } : { topic };
      // IMPORTANT: Replace 'YOUR-APP-NAME' with your actual Heroku app name
      const res = await fetch('https://YOUR-APP-NAME.herokuapp.com/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const json = await res.json();
      const state = json.data || {};
      const blog = state.blog || {};

      const title = blog.title || 'Untitled';
      lastTitle = (typeof title === 'string') ? title.replace(/^#\s*/, '') : 'Generated Blog';
      titleEl.textContent = lastTitle;

      let contentMarkdown = '';
      if (typeof blog.content === 'string') {
        contentMarkdown = blog.content;
      } else if (blog.content && typeof blog.content.content === 'string') {
        contentMarkdown = blog.content.content;
      } else {
        contentMarkdown = 'No content returned. Try again or change topic.';
      }
      lastMarkdown = contentMarkdown;
      contentEl.innerHTML = window.marked.parse(contentMarkdown);
      statusEl.textContent = language ? `Language: ${language}` : 'Language: English';
    } catch (err) {
      statusEl.textContent = 'Error while generating blog.';
      contentEl.innerHTML = `<div class=\"panel\"><strong>${err.message}</strong><br/>Check server logs, API keys, and network.`;
    } finally {
      loading.classList.add('hidden');
    }
  });
})();
