(function(){
  function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      return navigator.clipboard.writeText(text);
    }
    const ta=document.createElement('textarea');
    ta.value=text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function extractCode(block){
    // Chroma table layout: second <td> contains real code
    const highlight = block.querySelector('.highlight');
    if(highlight){
      const tds = highlight.querySelectorAll('td');
      if(tds.length >= 2){
        const codeEl = tds[1].querySelector('code');
        if(codeEl) return codeEl.textContent || '';
      }
    }
    // Language tagged code
    const langCode = block.querySelector('code[class*="language-"], code[data-lang]');
    if(langCode) return langCode.textContent || '';
    // Any last code element
    const codes = block.querySelectorAll('code');
    if(codes.length) return codes[codes.length-1].textContent || '';
    // Fallback pre text
    const pre = block.querySelector('pre');
    if(pre) return pre.textContent || '';
    return '';
  }

  function clean(text){
    if(!text) return '';
    const lines = text.split('\n');
    const nonNum = lines.filter(l => !/^\s*\d+\s*$/.test(l));
    const result = (nonNum.length && nonNum.length !== lines.length) ? nonNum : lines;
    return result.join('\n').replace(/\r/g,'').replace(/\n+$/,'');
  }

  function enhance(){
    document.querySelectorAll('.code-block').forEach(block=>{
      const btn = block.querySelector('.copy-button');
      if(!btn || btn.dataset.bound) return;
      btn.dataset.bound='1';
      btn.addEventListener('click', async () => {
        const original = btn.innerHTML;
        const text = clean(extractCode(block));
        try {
          await copyText(text);
          btn.classList.add('copied');
          btn.innerHTML = '<span class="copy-label">'+(text ? 'Copied!' : 'Empty')+'</span>';
        } catch(e){
          btn.innerHTML = '<span class="copy-label">Error</span>';
        }
        setTimeout(()=>{ btn.classList.remove('copied'); btn.innerHTML = original; }, 1600);
      });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', enhance); else enhance();
  window.addEventListener('pageshow', e => { if(e.persisted) enhance(); });
})();
