// firebase-init.js
// Tương thích Firebase 10.x compat + GitHub Pages.
// File này không bắt buộc nếu trang đã tải auth.js, nhưng được giữ lại
// để các trang cũ dùng firebase-init.js không còn lỗi firebaseConfig undefined.
(function () {
    const config = window.FIREBASE_CONFIG;

    if (!config || !config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
        throw new Error("Firebase config chưa đầy đủ. Kiểm tra firebase-config.js");
    }

    if (!window.firebase) {
        throw new Error("Firebase SDK chưa được tải.");
    }

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }

    const firebaseAuth = firebase.auth();
    const firebaseDb = firebase.firestore();

    window.firebaseAuth = firebaseAuth;
    window.firebaseDb = firebaseDb;
    window.currentFirebaseUser = null;

    window.firebaseReady = new Promise((resolve, reject) => {
        const unsubscribe = firebaseAuth.onAuthStateChanged(
            (user) => {
                window.currentFirebaseUser = user || null;
                unsubscribe();
                resolve(user || null);
            },
            (error) => {
                unsubscribe();
                reject(error);
            }
        );
    });
})();
