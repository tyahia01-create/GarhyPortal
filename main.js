// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // إنشاء نافذة المتصفح الرئيسية.
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    // (اختياري) يمكنك وضع أيقونة للتطبيق هنا
    // icon: path.join(__dirname, 'assets/icon.png') 
  });

  // تحميل ملف index.html الخاص بتطبيقك بعد عملية البناء.
  // تأكد من أن مجلد البناء هو 'dist'.
  win.loadFile(path.join(__dirname, 'dist/index.html'));

  // (اختياري) لإزالة القائمة العلوية (File, Edit, etc.) في النسخة النهائية
  // win.setMenu(null);
}

// هذه الدالة سيتم استدعاؤها عندما يكون Electron جاهزًا.
app.whenReady().then(createWindow);

// الخروج من التطبيق عندما يتم إغلاق جميع النوافذ (باستثناء macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // على نظام macOS، من الشائع إعادة إنشاء نافذة في التطبيق عندما
  // يتم النقر على أيقونة dock ولا توجد نوافذ أخرى مفتوحة.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
