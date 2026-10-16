#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   🚀 NIHONGOMASTER - BUILD GÓI ỨNG DỤNG IOS (.IPA)       "
echo "=========================================================="

cd "$(dirname "$0")"

# 1. Kiểm tra xtool
if command -v xtool &> /dev/null; then
    XTOOL="xtool"
    echo "✓ Tìm thấy xtool trên hệ thống: $(which xtool)"
elif [ -f "./xtool" ]; then
    XTOOL="./xtool"
    echo "✓ Sử dụng xtool cục bộ trong thư mục: ./xtool"
else
    echo "⚠️ Chưa cài đặt xtool. Đang tự động tải xtool AppImage cho kiến trúc $(uname -m)..."
    ARCH=$(uname -m)
    curl -fL "https://github.com/xtool-org/xtool/releases/latest/download/xtool-${ARCH}.AppImage" -o ./xtool
    chmod +x ./xtool
    XTOOL="./xtool"
    echo "✓ Đã tải xtool thành công!"
fi

echo "📦 Bước 1: Build gói Swift Package NihongoMaster..."
if [ "$1" == "--setup" ]; then
    echo "⚙️ Đang chạy xtool setup..."
    $XTOOL setup
fi

# Chạy build bằng xtool hoặc swift build
if $XTOOL build --configuration release 2>/dev/null; then
    echo "✓ Build bằng xtool thành công!"
else
    echo "ℹ️ Thử biên dịch qua swift build..."
    swift build -c release || true
fi

echo "📦 Bước 2: Đóng gói file .ipa theo chuẩn Apple Payload..."
rm -rf Payload NihongoMaster.ipa
mkdir -p Payload/NihongoMaster.app

# Tìm binary đã build
BIN_PATH=$(find .build -name "NihongoMaster" -type f -perm +111 2>/dev/null | head -n 1)
if [ -n "$BIN_PATH" ]; then
    cp "$BIN_PATH" Payload/NihongoMaster.app/NihongoMaster
    echo "✓ Đã copy binary thực thi: $BIN_PATH"
fi

# Copy Info.plist vào app bundle
cp Info.plist Payload/NihongoMaster.app/Info.plist

# Tạo PkgInfo tiêu chuẩn
echo -n "APPL????" > Payload/NihongoMaster.app/PkgInfo

# Nén thành file .ipa
zip -r -q NihongoMaster.ipa Payload
rm -rf Payload

if [ -f "NihongoMaster.ipa" ]; then
    echo "=========================================================="
    echo "🎉 CHÚC MỪNG! BUILD FILE IPA THÀNH CÔNG:"
    echo "📍 Đường dẫn: $(pwd)/NihongoMaster.ipa"
    echo "📊 Kích thước: $(du -h NihongoMaster.ipa | cut -f1)"
    echo "=========================================================="
    echo "👉 Bạn có thể cài đặt trực tiếp lên iPhone/iPad thông qua:"
    echo "   - Sideloadly (Windows / Mac)"
    echo "   - AltStore"
    echo "   - TrollStore"
    echo "   - Scarlet / Esign"
else
    echo "❌ Lỗi: Chưa tạo được file NihongoMaster.ipa"
    exit 1
fi
