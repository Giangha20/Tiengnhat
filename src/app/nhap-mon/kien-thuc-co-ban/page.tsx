'use client';

import { useState } from 'react';
import Link from 'next/link';
import { speak } from '@/lib/audio';

export default function KienThucCoBanPage() {
  const [playingText, setPlayingText] = useState<string | null>(null);

  const play = (text: string) => {
    setPlayingText(text);
    speak({
      text,
      onEnd: () => setPlayingText(null),
      onError: () => setPlayingText(null),
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
        <span className="text-foreground font-medium">Kiến thức cơ bản đầu tiên</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-3">
          Nhập môn • Trình độ 0
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Những Kiến Thức Đầu Tiên Cho Người Mới Bắt Đầu
        </h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Trước khi bước vào giáo trình N5 chính thức, đây là toàn bộ nền tảng ngữ pháp cốt lõi, trật tự câu, cách xưng hô, số đếm, thời gian và mẫu câu tự giới thiệu bản thân bạn cần nắm chắc.
        </p>
      </div>

      <div className="space-y-10">
        {/* 1. Trật tự câu SOV */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
            Trật Tự Câu Tiếng Nhật (Khác Hoàn Toàn Tiếng Việt!)
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-border bg-background">
              <span className="font-bold text-muted-foreground block text-xs uppercase mb-1">Tiếng Việt (S - V - O)</span>
              <p className="text-base font-semibold text-foreground">Tôi (S) + Ăn (V) + Cơm (O)</p>
              <p className="text-xs text-muted-foreground mt-2">Động từ đứng NGAY SAU chủ ngữ, trước tân ngữ.</p>
            </div>
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
              <span className="font-bold text-primary block text-xs uppercase mb-1">Tiếng Nhật (S - O - V)</span>
              <p className="text-base font-semibold text-primary">
                わたしは (S) + ごはんを (O) + たべます (V)
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>ĐỘNG TỪ LUÔN NẰM Ở CUỐI CÂU!</strong> Bạn phải nghe đến từ cuối cùng mới biết câu khẳng định hay phủ định.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Khẳng định, Phủ định, Câu hỏi với Danh Từ */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
            Câu Khẳng Định, Phủ Định và Nghi Vấn Cơ Bản
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Cấu trúc cơ bản nhất trong tiếng Nhật: <span className="ja-text font-bold">A は B です</span> (A là B).
          </p>

          <div className="mt-6 space-y-3">
            <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-success px-2 py-0.5 rounded bg-success/10 mr-2">Khẳng định: ~ です</span>
                <p className="ja-text text-base font-bold text-foreground mt-1">わたしは がくせい です。</p>
                <p className="text-xs text-muted-foreground">Watashi wa gakusei desu. (Tôi là học sinh/sinh viên.)</p>
              </div>
              <button onClick={() => play('わたしはがくせいです')} className="text-xs px-3 py-1.5 bg-secondary hover:bg-muted rounded-lg font-medium self-start sm:self-auto">
                🔊 Nghe mẫu
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-error px-2 py-0.5 rounded bg-error/10 mr-2">Phủ định lịch sự: ~ ではありません / じゃないです</span>
                <p className="ja-text text-base font-bold text-foreground mt-1">わたしは せんせい では ありません。</p>
                <p className="text-xs text-muted-foreground">Watashi wa sensei dewa arimasen. (Tôi không phải là giáo viên.)</p>
              </div>
              <button onClick={() => play('わたしはせんせいではありません')} className="text-xs px-3 py-1.5 bg-secondary hover:bg-muted rounded-lg font-medium self-start sm:self-auto">
                🔊 Nghe mẫu
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-info px-2 py-0.5 rounded bg-info/10 mr-2">Câu hỏi: thêm か (ka) ở cuối</span>
                <p className="ja-text text-base font-bold text-foreground mt-1">あなたは がくせい ですか。</p>
                <p className="text-xs text-muted-foreground">Anata wa gakusei desu ka? (Bạn có phải là học sinh không?)</p>
              </div>
              <button onClick={() => play('あなたはがくせいですか')} className="text-xs px-3 py-1.5 bg-secondary hover:bg-muted rounded-lg font-medium self-start sm:self-auto">
                🔊 Nghe mẫu
              </button>
            </div>
          </div>
        </section>

        {/* 3. Đại từ xưng hô */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
            Đại Từ Xưng Hô & Văn Hóa Giao Tiếp
          </h2>
          <div className="mt-4 p-4 rounded-xl bg-warning/5 border border-warning/20 text-xs text-muted-foreground">
            <strong className="text-foreground">Lưu ý quan trọng:</strong> Trong tiếng Nhật tự nhiên, người ta thường <strong>lược bỏ đại từ</strong> nếu ngữ cảnh đã rõ. Hạn chế dùng từ <span className="ja-text font-bold">あなた (anata)</span> khi nói chuyện trực tiếp với người lớn tuổi hoặc người mới quen; thay vào đó, hãy gọi <strong>Họ/Tên + さん (san)</strong> hoặc chức danh (Thầy cô: せんせい).
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {[
              { jp: 'わたし', roma: 'watashi', vi: 'Tôi (trung tính, lịch sự thông dụng)', note: 'Ai cũng dùng được' },
              { jp: 'ぼく', roma: 'boku', vi: 'Tôi (nam giới, thân mật/lịch sự vừa)', note: 'Nam giới hay dùng' },
              { jp: 'かれ', roma: 'kare', vi: 'Anh ấy / Bạn trai', note: 'Ngôi thứ 3' },
              { jp: 'かのじょ', roma: 'kanojo', vi: 'Cô ấy / Bạn gái', note: 'Ngôi thứ 3' },
              { jp: 'わたしたち', roma: 'watashitachi', vi: 'Chúng tôi / Chúng ta', note: 'Số nhiều' },
              { jp: 'みなさん', roma: 'minasan', vi: 'Mọi người / Quý vị', note: 'Lịch sự khi nói trước đám đông' },
              { jp: 'これ / それ / あれ', roma: 'kore / sore / are', vi: 'Cái này / Cái đó / Cái kia', note: 'Đại từ chỉ vật' },
              { jp: 'ここ / そこ / あそこ', roma: 'koko / soko / asoko', vi: 'Ở đây / Ở đó / Ở đằng kia', note: 'Chỉ nơi chốn' },
            ].map((p) => (
              <div key={p.jp} className="p-3 bg-background rounded-xl border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="ja-text font-bold text-primary text-base">{p.jp}</span>
                    <button onClick={() => play(p.jp)} className="text-xs p-1 hover:bg-secondary rounded">🔊</button>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{p.roma}</span>
                  <p className="text-xs text-foreground mt-1 font-medium">{p.vi}</p>
                </div>
                <span className="text-[10px] text-muted-foreground mt-2 italic">{p.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Các loại từ: Danh từ, Tính từ (i và na), Động từ */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
            Ba Nhóm Từ Cốt Lõi: Động Từ, Tính Từ, Danh Từ
          </h2>

          <div className="mt-6 space-y-4 text-sm">
            {/* Động từ */}
            <div className="p-4 rounded-xl border border-border bg-background">
              <h3 className="font-bold text-base text-primary mb-2">Động Từ (Chia làm 3 nhóm):</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Ở trình độ N5 cơ bản, động từ khi nói lịch sự sẽ chia về đuôi <strong className="ja-text text-foreground">~ ます (masu)</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="font-bold block text-foreground mb-1">Nhóm 1 (Động từ ngũ đoạn - Godan):</span>
                  <p>Hàng kết thúc vần [u] đổi sang [i] + ます</p>
                  <p className="mt-1 font-mono text-primary">か<strong>く</strong> (kaku) → か<strong>きます</strong> (kakimasu: viết)</p>
                  <p className="font-mono text-primary">い<strong>く</strong> (iku) → い<strong>きます</strong> (ikimasu: đi)</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="font-bold block text-foreground mb-1">Nhóm 2 (Động từ nhất đoạn - Ichidan):</span>
                  <p>Bỏ る (ru) thêm ます</p>
                  <p className="mt-1 font-mono text-primary">たべ<strong>る</strong> (taberu) → たべ<strong>ます</strong> (tabemasu: ăn)</p>
                  <p className="font-mono text-primary">み<strong>る</strong> (miru) → み<strong>ます</strong> (mimasu: xem)</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="font-bold block text-foreground mb-1">Nhóm 3 (Bất quy tắc):</span>
                  <p>Chỉ gồm 2 động từ chính cần nhớ thuộc lòng:</p>
                  <p className="mt-1 font-mono text-primary"><strong>する</strong> (suru: làm) → <strong>します</strong> (shimasu)</p>
                  <p className="font-mono text-primary"><strong>くる</strong> (kuru: đến) → <strong>きます</strong> (kimasu)</p>
                </div>
              </div>
            </div>

            {/* Tính từ */}
            <div className="p-4 rounded-xl border border-border bg-background">
              <h3 className="font-bold text-base text-primary mb-2">Tính Từ: Tính từ đuôi [い] và Tính từ đuôi [な]</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="font-bold text-foreground block mb-1">Tính từ đuôi い (i-adjective):</span>
                  <p>Kết thúc bằng âm [い] như: おおきい (to lớn), たかい (đắt/cao), おいしい (ngon).</p>
                  <p className="mt-1 text-primary">おいしい です (Ngon ạ) | おいし<strong>くない</strong> です (Không ngon ạ).</p>
                </div>
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="font-bold text-foreground block mb-1">Tính từ đuôi な (na-adjective):</span>
                  <p>Khi đứng một mình không có [な]: しずか (yên tĩnh), べんり (tiện lợi), げんき (khỏe mạnh).</p>
                  <p className="mt-1 text-primary">しずか<strong>な</strong> まち (Thị trấn yên tĩnh) | しずか <strong>ではありません</strong>.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Số đếm, Thời gian, Giờ giấc */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">5</span>
            Số Đếm, Giờ Giấc & Ngày Tháng
          </h2>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-sm">
            {[
              { num: '1', jp: 'いち', roma: 'ichi' },
              { num: '2', jp: 'に', roma: 'ni' },
              { num: '3', jp: 'さん', roma: 'san' },
              { num: '4', jp: 'よん / し', roma: 'yon / shi' },
              { num: '5', jp: 'ご', roma: 'go' },
              { num: '6', jp: 'ろく', roma: 'roku' },
              { num: '7', jp: 'なな / しち', roma: 'nana / shichi' },
              { num: '8', jp: 'はち', roma: 'hachi' },
              { num: '9', jp: 'きゅう / く', roma: 'kyuu / ku' },
              { num: '10', jp: 'じゅう', roma: 'juu' },
            ].map((n) => (
              <div key={n.num} className="p-2.5 bg-background rounded-lg border border-border">
                <span className="text-xs text-muted-foreground font-bold">{n.num}</span>
                <span className="ja-text block font-bold text-primary">{n.jp}</span>
                <span className="text-[11px] text-muted-foreground">{n.roma}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-secondary/50 rounded-xl">
              <strong className="text-foreground block mb-1">Cách nói Giờ: Số + じ (ji)</strong>
              <p>1 giờ: いちじ | 4 giờ: <strong>よじ</strong> (chú ý biến âm!) | 7 giờ: <strong>しちじ</strong> | 9 giờ: <strong>くじ</strong></p>
              <p className="mt-1 text-muted-foreground">Phút: Số + ふん/ぷん (fun/pun): 5 phút = ごふん, 10 phút = じゅっぷん</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-xl">
              <strong className="text-foreground block mb-1">Cách nói Thứ trong tuần: ~ ようび (youbi)</strong>
              <p>Thứ 2: げつようび | Thứ 3: かようび | Thứ 4: すいようび</p>
              <p>Thứ 5: もくようび | Thứ 6: きんようび | Thứ 7: どようび | Chủ nhật: にちようび</p>
            </div>
          </div>
        </section>

        {/* 6. Bài Mẫu Tự Giới Thiệu (Jikoshoukai) */}
        <section className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">6</span>
            Bài Tự Giới Thiệu Bản Thân Mẫu (自己紹介 - Jikoshoukai)
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            Mẫu câu tiêu chuẩn khi bạn gặp người Nhật lần đầu tiên:
          </p>

          <div className="mt-4 p-5 bg-background rounded-xl border border-border space-y-4 text-sm">
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <p className="ja-text font-bold text-base text-foreground">1. はじめまして。</p>
                <p className="text-xs text-muted-foreground font-mono">Hajimemashite.</p>
                <p className="text-xs text-muted-foreground">Rất hân hạnh được gặp bạn lần đầu tiên.</p>
              </div>
              <button onClick={() => play('はじめまして')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊</button>
            </div>

            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <p className="ja-text font-bold text-base text-foreground">2. わたしは [Tên bạn] です。</p>
                <p className="text-xs text-muted-foreground font-mono">Watashi wa [Tên bạn] desu.</p>
                <p className="text-xs text-muted-foreground">Tôi tên là [Tên bạn].</p>
              </div>
            </div>

            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <p className="ja-text font-bold text-base text-foreground">3. ベトナムから きました。</p>
                <p className="text-xs text-muted-foreground font-mono">Betonamu kara kimashita.</p>
                <p className="text-xs text-muted-foreground">Tôi đến từ Việt Nam.</p>
              </div>
              <button onClick={() => play('ベトナムからきました')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊</button>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="ja-text font-bold text-base text-primary">4. どうぞ よろしく おねがいします。</p>
                <p className="text-xs text-muted-foreground font-mono">Douzo yoroshiku onegaishimasu.</p>
                <p className="text-xs text-muted-foreground">Rất mong nhận được sự giúp đỡ và chỉ giáo của bạn (cúi đầu nhẹ).</p>
              </div>
              <button onClick={() => play('どうぞよろしくおねがいします')} className="text-xs px-2.5 py-1 bg-secondary rounded">🔊</button>
            </div>
          </div>
        </section>

        {/* CTA sang N5 */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-red-500/10 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-foreground">Bạn đã sẵn sàng bước vào JLPT N5?</h3>
            <p className="text-sm text-muted-foreground mt-1">Bắt đầu học từ vựng và ngữ pháp N5 ngay bây giờ!</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/tu-vung"
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm shadow"
            >
              Học Từ Vựng N5 →
            </Link>
            <Link
              href="/ngu-phap"
              className="px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-muted transition-colors text-sm"
            >
              Học Ngữ Pháp N5
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
