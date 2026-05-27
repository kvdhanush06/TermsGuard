(function(){
  const apiInput = document.getElementById('api-key');
  const saveBtn = document.getElementById('save');
  const clearBtn = document.getElementById('clear');
  const status = document.getElementById('status');

  const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  const storageSet = (items) => new Promise((resolve) => chrome.storage.local.set(items, resolve));
  const storageRemove = (keys) => new Promise((resolve) => chrome.storage.local.remove(keys, resolve));

  async function init(){
    try{
      const data = await storageGet('GROQ_API_KEY');
      if (data && data.GROQ_API_KEY) {
        apiInput.value = data.GROQ_API_KEY;
        status.textContent = 'Key loaded from storage.';
      } else {
        status.textContent = 'No key set yet.';
      }
    }catch(err){
      status.textContent = 'Error reading storage';
      console.error(err);
    }
  }

  saveBtn.addEventListener('click', async () => {
    const val = apiInput.value.trim();
    if (!val) {
      status.textContent = 'Please enter a valid API key.';
      return;
    }
    try{
      await storageSet({ GROQ_API_KEY: val });
      status.textContent = 'Saved successfully.';
    }catch(err){
      console.error(err);
      status.textContent = 'Failed to save key.';
    }
  });

  clearBtn.addEventListener('click', async () => {
    try{
      await storageRemove('GROQ_API_KEY');
      apiInput.value = '';
      status.textContent = 'Key removed.';
    }catch(err){
      console.error(err);
      status.textContent = 'Failed to remove key.';
    }
  });

  document.addEventListener('DOMContentLoaded', init);
})();
