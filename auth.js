/* Local progress mode: no login/register required. */
(function () {
  const KEY = 'jp_learning_progress_v1';
  let progressCache = {};
  let currentUser = null;
  try { progressCache = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { progressCache = {}; }

  window.ghCurrentUser = null;
  window.ghAuthReady = Promise.resolve(null);
  window.ghFirebaseConfigured = false;

  function saveProgress(patch) {
    progressCache = { ...progressCache, ...(patch || {}), updatedAt: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(progressCache)); return Promise.resolve(true); }
    catch (e) { console.warn('Không thể lưu tiến trình:', e); return Promise.resolve(false); }
  }
  function deleteProgress() {
    progressCache = {};
    try { localStorage.removeItem(KEY); return Promise.resolve(true); }
    catch (e) { return Promise.resolve(false); }
  }

  window.ghAuth = {
    isConfigured: () => false,
    getUser: () => currentUser,
    getProgress: () => ({ ...progressCache }),
    loadProgress: () => Promise.resolve({ ...progressCache }),
    saveProgress,
    deleteProgress,
    migrateLegacyProgress: () => Promise.resolve(false),
    getProfile: () => Promise.resolve(null),
    register: () => Promise.reject(new Error('Tài khoản đã được tắt trong phiên bản này.')),
    login: () => Promise.reject(new Error('Tài khoản đã được tắt trong phiên bản này.')),
    logout: () => Promise.resolve(true)
  };
})();
