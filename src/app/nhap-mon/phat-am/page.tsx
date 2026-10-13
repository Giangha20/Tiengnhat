'use client';

import { useState } from 'react';
import Link from 'next/link';
import { speak, isAudioSupported } from '@/lib/audio';

interface AudioExample {
  text: string;
  romaji: string;
  meaning: string;
  note?: string;
}

export default function PhatAmPage() {
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const handlePlayAudio = (text: string) => {
    setAudioError(null);
    setPlayingText(text);
    speak({
      text,
      onEnd: () => setPlayingText(null),
      onError: (err) => {
        setPlayingText(null);
        setAudioError(err);
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link href="/nhap-mon" className="hover:text-primary transition-colors">Nhập môn</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Phát âm tiếng Nhật</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3">
          Nhập môn • Trình độ 0
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Cẩm Nang Phát Âm Tiếng Nhật Chuẩn Xác Cho Người Việt
        </h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Tiếng Nhật có hệ thống ngữ âm đơn giản hơn tiếng Việt (chỉ có 5 nguyên âm chính và không có dấu thanh điệu phức tạp như tiếng Việt), nhưng có các đặc trưng nhịp điệu (Mora), trường âm, âm ngắt và cao độ (Pitch Accent) đòi hỏi sự chú ý đặc biệt.
        </p>
      </div>

      {/* Audio Disclaimer Alert */}
      <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-sm">
            <h3 className="font-semibold text-foreground">Thông báo tính năng âm thanh:</h3>
            <p className="text-muted-foreground mt-1">
              Âm thanh phát trên website sử dụng công nghệ Web Speech API (tổng hợp giọng nói TTS). 
              Đây <strong>không phải là bản thu âm của người bản ngữ</strong>. Giọng tổng hợp có thể chưa phản ánh hoàn toàn tự nhiên ngữ điệu và pitch accent bản xứ. Nếu trình duyệt của bạn chưa cài giọng tiếng Nhật, âm thanh có thể không phát được.
            </p>
            {audioError && (
              <p className="mt-2 text-error font-medium">Lỗi phát âm thanh: {audioError}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* Phần 1: 5 Nguyên Âm */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
            5 Nguyên Âm Cơ Bản (A - I - U - E - O)
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Mọi âm trong tiếng Nhật (ngoại trừ âm mũi ん) đều kết thúc bằng một trong 5 nguyên âm này. Độ mở miệng của tiếng Nhật vừa phải, không mở quá to và không kéo dài giọng tùy tiện.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { kana: 'あ', roma: 'a', desc: 'Gần như "a" tiếng Việt, khẩu hình mở vừa phải, tròn và dứt khoát.' },
              { kana: 'い', roma: 'i', desc: 'Giống "i" tiếng Việt, mép miệng kéo nhẹ sang hai bên.' },
              { kana: 'う', roma: 'u', desc: 'Khác "u" tiếng Việt! Môi KHÔNG chu ra phía trước, miệng dẹp nhẹ giữa "u" và "ư".' },
              { kana: 'え', roma: 'e', desc: 'Gần như "ê" hoặc "e" nhẹ tiếng Việt, mở miệng vừa phải.' },
              { kana: 'お', roma: 'o', desc: 'Gần như "ô" tiếng Việt, môi hơi tròn nhưng không chu nhiều.' },
            ].map((v) => (
              <div key={v.kana} className="p-4 rounded-xl border border-border bg-background text-center">
                <span className="ja-text text-4xl font-bold text-primary block">{v.kana}</span>
                <span className="text-sm font-semibold text-muted-foreground uppercase">{v.roma}</span>
                <p className="text-xs text-muted-foreground mt-2 text-left leading-relaxed">{v.desc}</p>
                <button
                  onClick={() => handlePlayAudio(v.kana)}
                  className="mt-3 w-full py-1.5 px-2 bg-secondary hover:bg-muted text-foreground text-xs rounded-lg font-medium transition-colors flex items-center justify-center gap-1"
                >
                  🔊 {playingText === v.kana ? 'Đang phát...' : 'Nghe mẫu'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Phần 2: Nhịp Mora (Đơn vị âm thanh) */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
            Khái Niệm Nhịp Phách (Mora - 拍)
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Tiếng Việt là ngôn ngữ đơn lập có thanh điệu. Tiếng Nhật là ngôn ngữ đẳng thời theo <strong>Mora</strong>. Mỗi ký tự Kana (bao gồm cả âm ngắt っ, trường âm, và âm ん) đều chiếm đúng <strong>1 phách thời gian bằng nhau</strong>.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
            <h4 className="font-semibold text-sm text-foreground mb-2">Ví dụ đếm Mora:</h4>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-card rounded-lg border border-border">
                <div>
                  <span className="ja-text font-bold text-base text-primary mr-2">ねこ (neko - con mèo)</span>
                  <span className="text-xs text-muted-foreground">→ 2 mora: [ne] (1 phách) + [ko] (1 phách) = 2 nhịp</span>
                </div>
                <button onClick={() => handlePlayAudio('ねこ')} className="text-xs px-3 py-1 bg-secondary hover:bg-muted rounded text-foreground font-medium w-fit">
                  🔊 Nghe
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-card rounded-lg border border-border">
                <div>
                  <span className="ja-text font-bold text-base text-primary mr-2">にほん (nihon - Nhật Bản)</span>
                  <span className="text-xs text-muted-foreground">→ 3 mora: [ni] + [ho] + [n] (âm ん tính riêng 1 nhịp!) = 3 nhịp</span>
                </div>
                <button onClick={() => handlePlayAudio('にほん')} className="text-xs px-3 py-1 bg-secondary hover:bg-muted rounded text-foreground font-medium w-fit">
                  🔊 Nghe
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-card rounded-lg border border-border">
                <div>
                  <span className="ja-text font-bold text-base text-primary mr-2">きって (kitte - tem thư)</span>
                  <span className="text-xs text-muted-foreground">→ 3 mora: [ki] + [っ] (khoảng lặng 1 phách) + [te] = 3 nhịp</span>
                </div>
                <button onClick={() => handlePlayAudio('きって')} className="text-xs px-3 py-1 bg-secondary hover:bg-muted rounded text-foreground font-medium w-fit">
                  🔊 Nghe
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Phần 3: Âm Ngắt (Sokuon - 促音) */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
            Âm Ngắt (促音 - Sokuon: chữ っ nhỏ)
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Chữ <span className="ja-text font-bold text-primary">っ</span> (viết nhỏ hơn chữ つ thông thường) biểu thị một khoảng lặng ngừng hơi đúng bằng 1 phách trước khi bật sang phụ âm tiếp theo (K, S, T, P).
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-border bg-background">
              <span className="text-xs font-semibold text-warning px-2 py-0.5 rounded bg-warning/10">Dễ nhầm lẫn:</span>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span><strong className="ja-text text-primary">おと (oto)</strong>: âm thanh (2 mora)</span>
                  <button onClick={() => handlePlayAudio('おと')} className="text-xs px-2 py-1 bg-secondary rounded">🔊</button>
                </div>
                <div className="flex justify-between items-center">
                  <span><strong className="ja-text text-primary">おっと (otto)</strong>: chồng tôi (3 mora, ngắt ở っ)</span>
                  <button onClick={() => handlePlayAudio('おっと')} className="text-xs px-2 py-1 bg-secondary rounded">🔊</button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Nếu không phát âm khoảng lặng của âm ngắt, từ sẽ bị hiểu sang nghĩa hoàn toàn khác!
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background">
              <span className="text-xs font-semibold text-info px-2 py-0.5 rounded bg-info/10">Quy tắc chuẩn:</span>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                <li>Khi gặp chữ っ, nín hơi ở cổ họng đúng 1 nhịp.</li>
                <li>Chuẩn bị sẵn khẩu hình cho âm đứng ngay sau nó.</li>
                <li>Ví dụ: <span className="ja-text">がっこう (gakkou)</span>: [ga] → ngừng ngắt hơi 1 nhịp → bật ra [kou].</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Phần 4: Trường Âm (Chōon - 長音) */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
            Trường Âm (長音 - Chōon: Nguyên âm kéo dài)
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Trường âm kéo dài nguyên âm ra gấp đôi thời lượng bình thường (2 mora thay vì 1 mora). Người Việt rất dễ quên kéo dài trường âm, dẫn tới biến đổi nghĩa của từ.
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="ja-text font-bold text-primary mr-2">おばさん (obasan)</span>
                <span className="text-muted-foreground">→ Cô/Dì (ngắn, 4 mora)</span>
              </div>
              <button onClick={() => handlePlayAudio('おばさん')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
            </div>

            <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="ja-text font-bold text-primary mr-2">おばあさん (obāsan)</span>
                <span className="text-muted-foreground">→ Bà cụ/Bà ngoại/Bà nội (kéo dài âm あ, 5 mora)</span>
              </div>
              <button onClick={() => handlePlayAudio('おばあさん')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
            </div>

            <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="ja-text font-bold text-primary mr-2">ゆき (yuki)</span>
                <span className="text-muted-foreground">→ Tuyết rơi (2 mora)</span>
              </div>
              <button onClick={() => handlePlayAudio('ゆき')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
            </div>

            <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between">
              <div>
                <span className="ja-text font-bold text-primary mr-2">ゆうき (yūki)</span>
                <span className="text-muted-foreground">→ Lòng dũng cảm (kéo dài âm う, 3 mora)</span>
              </div>
              <button onClick={() => handlePlayAudio('ゆうき')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
            </div>
          </div>
        </section>

        {/* Phần 5: Âm Mũi ん (Hatsuon) */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">5</span>
            Âm Mũi (撥音 - ん: Hatsuon)
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            Chữ <span className="ja-text font-bold text-primary">ん</span> không bao giờ đứng đầu một từ. Cách phát âm của nó tự động biến đổi tùy thuộc vào âm thanh đứng ngay sau nó:
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="p-4 rounded-xl border border-border bg-background">
              <h4 className="font-bold text-primary mb-1">Đọc thành [m]</h4>
              <p className="text-xs text-muted-foreground mb-2">Đứng trước các âm p, b, m (ngậm hai môi lại)</p>
              <div className="p-2 bg-secondary/50 rounded flex justify-between items-center text-xs">
                <span><span className="ja-text font-bold">しんぶん</span> (shinbun → [shimbun])</span>
                <button onClick={() => handlePlayAudio('しんぶん')} className="px-1.5 py-0.5 bg-card rounded">🔊</button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background">
              <h4 className="font-bold text-primary mb-1">Đọc thành [n]</h4>
              <p className="text-xs text-muted-foreground mb-2">Đứng trước các âm t, d, n, r (đầu lưỡi chạm lợi trên)</p>
              <div className="p-2 bg-secondary/50 rounded flex justify-between items-center text-xs">
                <span><span className="ja-text font-bold">おんな</span> (onna)</span>
                <button onClick={() => handlePlayAudio('おんな')} className="px-1.5 py-0.5 bg-card rounded">🔊</button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background">
              <h4 className="font-bold text-primary mb-1">Đọc thành [ng]</h4>
              <p className="text-xs text-muted-foreground mb-2">Đứng trước k, g hoặc đứng ở cuối câu (cuống họng đóng lại)</p>
              <div className="p-2 bg-secondary/50 rounded flex justify-between items-center text-xs">
                <span><span className="ja-text font-bold">まんが</span> (manga)</span>
                <button onClick={() => handlePlayAudio('まんが')} className="px-1.5 py-0.5 bg-card rounded">🔊</button>
              </div>
            </div>
          </div>
        </section>

        {/* Phần 6: Pitch Accent (Cao độ tiếng Nhật) */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">6</span>
            Cao Độ Trong Từ (Pitch Accent - 高低アクセント)
          </h2>
          <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/20 text-sm">
            <p className="font-semibold text-primary">Điểm mấu chốt:</p>
            <p className="text-muted-foreground mt-1">
              Tiếng Nhật <strong>KHÔNG CÓ</strong> trọng âm mạnh/nhẹ (stress accent) như tiếng Anh (nhấn to - nhỏ), và cũng <strong>KHÔNG CÓ</strong> 6 thanh điệu (sắc, huyền, hỏi, ngã, nặng, không dấu) uốn lượn như tiếng Việt.
              Thay vào đó, tiếng Nhật sử dụng <strong>Độ Cao Thấp (Cao - Thấp / High - Low)</strong> của từng mora.
            </p>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-muted-foreground">Ví dụ cùng chữ viết nhưng khác cao độ:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-border bg-background flex justify-between items-center">
                <div>
                  <span className="ja-text text-lg font-bold text-foreground">はし (Há-shi)</span>
                  <p className="text-xs text-muted-foreground">Cao ở [ha], thấp ở [shi] → <strong>Đôi đũa (箸)</strong></p>
                </div>
                <button onClick={() => handlePlayAudio('はし')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex justify-between items-center">
                <div>
                  <span className="ja-text text-lg font-bold text-foreground">はし (Ha-shí)</span>
                  <p className="text-xs text-muted-foreground">Thấp ở [ha], cao ở [shi] → <strong>Cây cầu (橋)</strong></p>
                </div>
                <button onClick={() => handlePlayAudio('はし')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex justify-between items-center">
                <div>
                  <span className="ja-text text-lg font-bold text-foreground">あめ (Á-me)</span>
                  <p className="text-xs text-muted-foreground">Cao ở [a], thấp ở [me] → <strong>Cơn mưa (雨)</strong></p>
                </div>
                <button onClick={() => handlePlayAudio('あめ')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background flex justify-between items-center">
                <div>
                  <span className="ja-text text-lg font-bold text-foreground">あめ (A-mé)</span>
                  <p className="text-xs text-muted-foreground">Thấp ở [a], cao ở [me] → <strong>Viên kẹo (飴)</strong></p>
                </div>
                <button onClick={() => handlePlayAudio('あめ')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊 Nghe</button>
              </div>
            </div>
          </div>
        </section>

        {/* Phần 7: So Sánh Phát Âm Nhật - Việt */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">7</span>
            Những Lỗi Phát Âm Người Việt Thường Gặp & Cách Khắc Phục
          </h2>

          <div className="mt-4 space-y-4 text-sm">
            <div className="p-4 rounded-xl border border-border bg-background">
              <h4 className="font-bold text-error flex items-center gap-2">
                ❌ Lỗi 1: Tự thêm dấu tiếng Việt vào từ tiếng Nhật
              </h4>
              <p className="text-muted-foreground mt-1">
                Người Việt hay vô thức gắn dấu sắc hoặc huyền: ví dụ nói <em>"a-ri-ga-tô"</em> thành <em>"a-rí-ga-tồ"</em>. 
              </p>
              <p className="text-success mt-1 font-medium">
                ✔️ Khắc phục: Giữ âm điệu phẳng, đều đều như gõ mõ từng phách. Không nhấn mạnh dấu sắc tiếng Việt.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background">
              <h4 className="font-bold text-error flex items-center gap-2">
                ❌ Lỗi 2: Nhầm lẫn âm R (Hàng ら, り, る, れ, ろ)
              </h4>
              <p className="text-muted-foreground mt-1">
                Tiếng Nhật không có âm [L] như tiếng Việt, cũng không rung lưỡi mạnh như âm [R].
              </p>
              <p className="text-success mt-1 font-medium">
                ✔️ Khắc phục: Đầu lưỡi vỗ nhẹ một cái lên nướu răng trên rồi hạ xuống ngay lập tức (giống âm 'đ' rất nhẹ hoặc flap 't' trong tiếng Mỹ).
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background">
              <h4 className="font-bold text-error flex items-center gap-2">
                ❌ Lỗi 3: Chữ つ (tsu) phát âm thành 'chu' hoặc 'tu'
              </h4>
              <p className="text-muted-foreground mt-1">
                Đây là âm khó nhất đối với người Việt mới bắt đầu.
              </p>
              <p className="text-success mt-1 font-medium">
                ✔️ Khắc phục: Khép nhẹ hai hàm răng lại, áp đầu lưỡi vào mặt sau răng cửa trên, bật nhẹ luồng hơi qua kẽ răng như tiếng xì "ts", miệng dẹp đọc "xư".
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-red-500/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">Bạn đã nắm vững quy tắc phát âm?</h3>
            <p className="text-sm text-muted-foreground mt-1">Hãy tiếp tục với những kiến thức ngữ pháp và giao tiếp đầu tiên.</p>
          </div>
          <Link
            href="/nhap-mon/kien-thuc-co-ban"
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shadow"
          >
            Học kiến thức cơ bản →
          </Link>
        </div>
      </div>
    </div>
  );
}
