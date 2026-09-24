
function uiIcon(name, cls='ui-icon'){ return `<svg class="${cls}" aria-hidden="true"><use href="#${name}"></use></svg>`; }

// ============================================================
// DỮ LIỆU TIẾNG NHẬT — JLPT
// 0 = Hiragana nền tảng; 1..5 = N5..N1.
// Dữ liệu dự phòng tiếng Việt được nhúng để app vẫn chạy khi offline.
// ============================================================
const hskData = {"0":[{"word":"あ","pinyin":"a","meaning":"Hiragana: a"},{"word":"い","pinyin":"i","meaning":"Hiragana: i"},{"word":"う","pinyin":"u","meaning":"Hiragana: u"},{"word":"え","pinyin":"e","meaning":"Hiragana: e"},{"word":"お","pinyin":"o","meaning":"Hiragana: o"},{"word":"か","pinyin":"ka","meaning":"Hiragana: ka"},{"word":"き","pinyin":"ki","meaning":"Hiragana: ki"},{"word":"く","pinyin":"ku","meaning":"Hiragana: ku"},{"word":"け","pinyin":"ke","meaning":"Hiragana: ke"},{"word":"こ","pinyin":"ko","meaning":"Hiragana: ko"},{"word":"さ","pinyin":"sa","meaning":"Hiragana: sa"},{"word":"し","pinyin":"shi","meaning":"Hiragana: shi"},{"word":"す","pinyin":"su","meaning":"Hiragana: su"},{"word":"せ","pinyin":"se","meaning":"Hiragana: se"},{"word":"そ","pinyin":"so","meaning":"Hiragana: so"},{"word":"た","pinyin":"ta","meaning":"Hiragana: ta"},{"word":"ち","pinyin":"chi","meaning":"Hiragana: chi"},{"word":"つ","pinyin":"tsu","meaning":"Hiragana: tsu"},{"word":"て","pinyin":"te","meaning":"Hiragana: te"},{"word":"と","pinyin":"to","meaning":"Hiragana: to"},{"word":"な","pinyin":"na","meaning":"Hiragana: na"},{"word":"に","pinyin":"ni","meaning":"Hiragana: ni"},{"word":"ぬ","pinyin":"nu","meaning":"Hiragana: nu"},{"word":"ね","pinyin":"ne","meaning":"Hiragana: ne"},{"word":"の","pinyin":"no","meaning":"Hiragana: no"},{"word":"は","pinyin":"ha","meaning":"Hiragana: ha"},{"word":"ひ","pinyin":"hi","meaning":"Hiragana: hi"},{"word":"ふ","pinyin":"fu","meaning":"Hiragana: fu"},{"word":"へ","pinyin":"he","meaning":"Hiragana: he"},{"word":"ほ","pinyin":"ho","meaning":"Hiragana: ho"},{"word":"ま","pinyin":"ma","meaning":"Hiragana: ma"},{"word":"み","pinyin":"mi","meaning":"Hiragana: mi"},{"word":"む","pinyin":"mu","meaning":"Hiragana: mu"},{"word":"め","pinyin":"me","meaning":"Hiragana: me"},{"word":"も","pinyin":"mo","meaning":"Hiragana: mo"},{"word":"や","pinyin":"ya","meaning":"Hiragana: ya"},{"word":"ゆ","pinyin":"yu","meaning":"Hiragana: yu"},{"word":"よ","pinyin":"yo","meaning":"Hiragana: yo"},{"word":"ら","pinyin":"ra","meaning":"Hiragana: ra"},{"word":"り","pinyin":"ri","meaning":"Hiragana: ri"},{"word":"る","pinyin":"ru","meaning":"Hiragana: ru"},{"word":"れ","pinyin":"re","meaning":"Hiragana: re"},{"word":"ろ","pinyin":"ro","meaning":"Hiragana: ro"},{"word":"わ","pinyin":"wa","meaning":"Hiragana: wa"},{"word":"を","pinyin":"wo","meaning":"Hiragana: wo"},{"word":"ん","pinyin":"n","meaning":"Hiragana: n"}],"1":[{"word":"こんにちは","pinyin":"konnichiwa","meaning":"xin chào"},{"word":"ありがとう","pinyin":"arigatou","meaning":"cảm ơn"},{"word":"すみません","pinyin":"sumimasen","meaning":"xin lỗi; xin phép"},{"word":"おはよう","pinyin":"ohayou","meaning":"chào buổi sáng"},{"word":"こんばんは","pinyin":"konbanwa","meaning":"chào buổi tối"},{"word":"さようなら","pinyin":"sayounara","meaning":"tạm biệt"},{"word":"はい","pinyin":"hai","meaning":"vâng; có"},{"word":"いいえ","pinyin":"iie","meaning":"không"},{"word":"お願いします","pinyin":"onegaishimasu","meaning":"làm ơn; nhờ bạn"},{"word":"私","pinyin":"watashi","meaning":"tôi"},{"word":"あなた","pinyin":"anata","meaning":"bạn"},{"word":"先生","pinyin":"sensei","meaning":"giáo viên"},{"word":"学生","pinyin":"gakusei","meaning":"học sinh; sinh viên"},{"word":"友達","pinyin":"tomodachi","meaning":"bạn bè"},{"word":"家族","pinyin":"kazoku","meaning":"gia đình"},{"word":"父","pinyin":"chichi","meaning":"bố của mình"},{"word":"母","pinyin":"haha","meaning":"mẹ của mình"},{"word":"兄","pinyin":"ani","meaning":"anh trai"},{"word":"姉","pinyin":"ane","meaning":"chị gái"},{"word":"弟","pinyin":"otouto","meaning":"em trai"},{"word":"妹","pinyin":"imouto","meaning":"em gái"},{"word":"人","pinyin":"hito","meaning":"người"},{"word":"男","pinyin":"otoko","meaning":"đàn ông; nam"},{"word":"女","pinyin":"onna","meaning":"phụ nữ; nữ"},{"word":"子供","pinyin":"kodomo","meaning":"trẻ em"},{"word":"名前","pinyin":"namae","meaning":"tên"},{"word":"学校","pinyin":"gakkou","meaning":"trường học"},{"word":"会社","pinyin":"kaisha","meaning":"công ty"},{"word":"先生","pinyin":"sensei","meaning":"thầy cô"},{"word":"本","pinyin":"hon","meaning":"sách"},{"word":"辞書","pinyin":"jisho","meaning":"từ điển"},{"word":"鉛筆","pinyin":"enpitsu","meaning":"bút chì"},{"word":"机","pinyin":"tsukue","meaning":"bàn học"},{"word":"椅子","pinyin":"isu","meaning":"ghế"},{"word":"時計","pinyin":"tokei","meaning":"đồng hồ"},{"word":"電話","pinyin":"denwa","meaning":"điện thoại"},{"word":"水","pinyin":"mizu","meaning":"nước"},{"word":"お茶","pinyin":"ocha","meaning":"trà"},{"word":"ご飯","pinyin":"gohan","meaning":"cơm; bữa ăn"},{"word":"朝","pinyin":"asa","meaning":"buổi sáng"},{"word":"昼","pinyin":"hiru","meaning":"buổi trưa"},{"word":"夜","pinyin":"yoru","meaning":"buổi tối; ban đêm"},{"word":"今日","pinyin":"kyou","meaning":"hôm nay"},{"word":"明日","pinyin":"ashita","meaning":"ngày mai"},{"word":"昨日","pinyin":"kinou","meaning":"hôm qua"},{"word":"今","pinyin":"ima","meaning":"bây giờ"},{"word":"朝ご飯","pinyin":"asagohan","meaning":"bữa sáng"},{"word":"昼ご飯","pinyin":"hirugohan","meaning":"bữa trưa"},{"word":"晩ご飯","pinyin":"bangohan","meaning":"bữa tối"},{"word":"食べる","pinyin":"taberu","meaning":"ăn"},{"word":"飲む","pinyin":"nomu","meaning":"uống"},{"word":"見る","pinyin":"miru","meaning":"xem; nhìn"},{"word":"聞く","pinyin":"kiku","meaning":"nghe; hỏi"},{"word":"話す","pinyin":"hanasu","meaning":"nói"},{"word":"読む","pinyin":"yomu","meaning":"đọc"},{"word":"書く","pinyin":"kaku","meaning":"viết"},{"word":"行く","pinyin":"iku","meaning":"đi"},{"word":"来る","pinyin":"kuru","meaning":"đến"},{"word":"帰る","pinyin":"kaeru","meaning":"về"},{"word":"買う","pinyin":"kau","meaning":"mua"},{"word":"会う","pinyin":"au","meaning":"gặp"},{"word":"する","pinyin":"suru","meaning":"làm"},{"word":"ある","pinyin":"aru","meaning":"có; tồn tại (đồ vật)"},{"word":"いる","pinyin":"iru","meaning":"có; tồn tại (người/động vật)"},{"word":"好き","pinyin":"suki","meaning":"thích"},{"word":"嫌い","pinyin":"kirai","meaning":"ghét; không thích"},{"word":"大きい","pinyin":"ookii","meaning":"to; lớn"},{"word":"小さい","pinyin":"chiisai","meaning":"nhỏ"},{"word":"新しい","pinyin":"atarashii","meaning":"mới"},{"word":"古い","pinyin":"furui","meaning":"cũ"},{"word":"高い","pinyin":"takai","meaning":"cao; đắt"},{"word":"安い","pinyin":"yasui","meaning":"rẻ"},{"word":"暑い","pinyin":"atsui","meaning":"nóng"},{"word":"寒い","pinyin":"samui","meaning":"lạnh"},{"word":"良い","pinyin":"ii","meaning":"tốt"},{"word":"悪い","pinyin":"warui","meaning":"xấu; tệ"},{"word":"忙しい","pinyin":"isogashii","meaning":"bận"},{"word":"楽しい","pinyin":"tanoshii","meaning":"vui; thú vị"},{"word":"元気","pinyin":"genki","meaning":"khỏe; năng động"},{"word":"綺麗","pinyin":"kirei","meaning":"đẹp; sạch"},{"word":"静か","pinyin":"shizuka","meaning":"yên tĩnh"},{"word":"町","pinyin":"machi","meaning":"thị trấn; khu phố"},{"word":"駅","pinyin":"eki","meaning":"nhà ga"},{"word":"電車","pinyin":"densha","meaning":"tàu điện"},{"word":"車","pinyin":"kuruma","meaning":"ô tô; xe"},{"word":"自転車","pinyin":"jitensha","meaning":"xe đạp"},{"word":"右","pinyin":"migi","meaning":"bên phải"},{"word":"左","pinyin":"hidari","meaning":"bên trái"},{"word":"上","pinyin":"ue","meaning":"trên"},{"word":"下","pinyin":"shita","meaning":"dưới"},{"word":"中","pinyin":"naka","meaning":"bên trong"},{"word":"外","pinyin":"soto","meaning":"bên ngoài"}],"2":[{"word":"必要","pinyin":"hitsuyou","meaning":"cần thiết"},{"word":"便利","pinyin":"benri","meaning":"tiện lợi"},{"word":"大切","pinyin":"taisetsu","meaning":"quan trọng; quý giá"},{"word":"簡単","pinyin":"kantan","meaning":"đơn giản"},{"word":"複雑","pinyin":"fukuzatsu","meaning":"phức tạp"},{"word":"有名","pinyin":"yuumei","meaning":"nổi tiếng"},{"word":"安全","pinyin":"anzen","meaning":"an toàn"},{"word":"危険","pinyin":"kiken","meaning":"nguy hiểm"},{"word":"特別","pinyin":"tokubetsu","meaning":"đặc biệt"},{"word":"普通","pinyin":"futsuu","meaning":"bình thường"},{"word":"上手","pinyin":"jouzu","meaning":"giỏi; khéo"},{"word":"下手","pinyin":"heta","meaning":"kém; vụng"},{"word":"親切","pinyin":"shinsetsu","meaning":"tử tế"},{"word":"元気","pinyin":"genki","meaning":"khỏe mạnh"},{"word":"病気","pinyin":"byouki","meaning":"bệnh"},{"word":"病院","pinyin":"byouin","meaning":"bệnh viện"},{"word":"薬","pinyin":"kusuri","meaning":"thuốc"},{"word":"体","pinyin":"karada","meaning":"cơ thể"},{"word":"頭","pinyin":"atama","meaning":"đầu"},{"word":"顔","pinyin":"kao","meaning":"khuôn mặt"},{"word":"目","pinyin":"me","meaning":"mắt"},{"word":"耳","pinyin":"mimi","meaning":"tai"},{"word":"口","pinyin":"kuchi","meaning":"miệng"},{"word":"手","pinyin":"te","meaning":"tay"},{"word":"足","pinyin":"ashi","meaning":"chân"},{"word":"天気","pinyin":"tenki","meaning":"thời tiết"},{"word":"雨","pinyin":"ame","meaning":"mưa"},{"word":"雪","pinyin":"yuki","meaning":"tuyết"},{"word":"風","pinyin":"kaze","meaning":"gió"},{"word":"春","pinyin":"haru","meaning":"mùa xuân"},{"word":"夏","pinyin":"natsu","meaning":"mùa hè"},{"word":"秋","pinyin":"aki","meaning":"mùa thu"},{"word":"冬","pinyin":"fuyu","meaning":"mùa đông"},{"word":"旅行","pinyin":"ryokou","meaning":"du lịch"},{"word":"ホテル","pinyin":"hoteru","meaning":"khách sạn"},{"word":"空港","pinyin":"kuukou","meaning":"sân bay"},{"word":"外国","pinyin":"gaikoku","meaning":"nước ngoài"},{"word":"日本","pinyin":"nihon","meaning":"Nhật Bản"},{"word":"外国人","pinyin":"gaikokujin","meaning":"người nước ngoài"},{"word":"料理","pinyin":"ryouri","meaning":"món ăn; nấu ăn"},{"word":"野菜","pinyin":"yasai","meaning":"rau"},{"word":"果物","pinyin":"kudamono","meaning":"trái cây"},{"word":"肉","pinyin":"niku","meaning":"thịt"},{"word":"魚","pinyin":"sakana","meaning":"cá"},{"word":"牛肉","pinyin":"gyuuniku","meaning":"thịt bò"},{"word":"豚肉","pinyin":"butaniku","meaning":"thịt lợn"},{"word":"店","pinyin":"mise","meaning":"cửa hàng"},{"word":"銀行","pinyin":"ginkou","meaning":"ngân hàng"},{"word":"郵便局","pinyin":"yuubinkyoku","meaning":"bưu điện"},{"word":"図書館","pinyin":"toshokan","meaning":"thư viện"},{"word":"公園","pinyin":"kouen","meaning":"công viên"},{"word":"映画","pinyin":"eiga","meaning":"phim"},{"word":"音楽","pinyin":"ongaku","meaning":"âm nhạc"},{"word":"写真","pinyin":"shashin","meaning":"ảnh"},{"word":"新聞","pinyin":"shinbun","meaning":"báo"},{"word":"宿題","pinyin":"shukudai","meaning":"bài tập về nhà"},{"word":"勉強","pinyin":"benkyou","meaning":"học tập"},{"word":"練習","pinyin":"renshuu","meaning":"luyện tập"},{"word":"質問","pinyin":"shitsumon","meaning":"câu hỏi"},{"word":"答え","pinyin":"kotae","meaning":"câu trả lời"},{"word":"問題","pinyin":"mondai","meaning":"vấn đề; câu hỏi"},{"word":"説明","pinyin":"setsumei","meaning":"giải thích"},{"word":"意味","pinyin":"imi","meaning":"ý nghĩa"},{"word":"言葉","pinyin":"kotoba","meaning":"từ; ngôn ngữ"},{"word":"文章","pinyin":"bunshou","meaning":"đoạn văn"},{"word":"漢字","pinyin":"kanji","meaning":"chữ Hán"},{"word":"平仮名","pinyin":"hiragana","meaning":"hiragana"},{"word":"片仮名","pinyin":"katakana","meaning":"katakana"},{"word":"覚える","pinyin":"oboeru","meaning":"nhớ; học thuộc"},{"word":"忘れる","pinyin":"wasureru","meaning":"quên"},{"word":"始める","pinyin":"hajimeru","meaning":"bắt đầu"},{"word":"終わる","pinyin":"owaru","meaning":"kết thúc"},{"word":"開ける","pinyin":"akeru","meaning":"mở"},{"word":"閉める","pinyin":"shimeru","meaning":"đóng"},{"word":"使う","pinyin":"tsukau","meaning":"sử dụng"},{"word":"作る","pinyin":"tsukuru","meaning":"làm; chế tạo"},{"word":"持つ","pinyin":"motsu","meaning":"cầm; có"},{"word":"待つ","pinyin":"matsu","meaning":"đợi"},{"word":"急ぐ","pinyin":"isogu","meaning":"vội; thúc giục"},{"word":"歩く","pinyin":"aruku","meaning":"đi bộ"},{"word":"走る","pinyin":"hashiru","meaning":"chạy"},{"word":"泳ぐ","pinyin":"oyogu","meaning":"bơi"},{"word":"働く","pinyin":"hataraku","meaning":"làm việc"},{"word":"休む","pinyin":"yasumu","meaning":"nghỉ"},{"word":"起きる","pinyin":"okiru","meaning":"thức dậy"},{"word":"寝る","pinyin":"neru","meaning":"ngủ"}],"3":[{"word":"社会","pinyin":"shakai","meaning":"xã hội"},{"word":"経済","pinyin":"keizai","meaning":"kinh tế"},{"word":"政治","pinyin":"seiji","meaning":"chính trị"},{"word":"文化","pinyin":"bunka","meaning":"văn hóa"},{"word":"教育","pinyin":"kyouiku","meaning":"giáo dục"},{"word":"環境","pinyin":"kankyou","meaning":"môi trường"},{"word":"技術","pinyin":"gijutsu","meaning":"kỹ thuật; công nghệ"},{"word":"情報","pinyin":"jouhou","meaning":"thông tin"},{"word":"経験","pinyin":"keiken","meaning":"kinh nghiệm"},{"word":"関係","pinyin":"kankei","meaning":"quan hệ; liên quan"},{"word":"原因","pinyin":"genin","meaning":"nguyên nhân"},{"word":"結果","pinyin":"kekka","meaning":"kết quả"},{"word":"理由","pinyin":"riyuu","meaning":"lý do"},{"word":"方法","pinyin":"houhou","meaning":"phương pháp"},{"word":"必要","pinyin":"hitsuyou","meaning":"sự cần thiết"},{"word":"可能","pinyin":"kanou","meaning":"có thể; khả năng"},{"word":"不可能","pinyin":"fukanou","meaning":"không thể"},{"word":"場合","pinyin":"baai","meaning":"trường hợp"},{"word":"場合によって","pinyin":"baai ni yotte","meaning":"tùy trường hợp"},{"word":"例えば","pinyin":"tatoeba","meaning":"ví dụ"},{"word":"最近","pinyin":"saikin","meaning":"gần đây"},{"word":"以前","pinyin":"izen","meaning":"trước đây"},{"word":"以後","pinyin":"igo","meaning":"sau đó"},{"word":"最初","pinyin":"saisho","meaning":"đầu tiên"},{"word":"最後","pinyin":"saigo","meaning":"cuối cùng"},{"word":"途中","pinyin":"tochuu","meaning":"giữa chừng"},{"word":"予定","pinyin":"yotei","meaning":"dự định; lịch"},{"word":"計画","pinyin":"keikaku","meaning":"kế hoạch"},{"word":"準備","pinyin":"junbi","meaning":"chuẩn bị"},{"word":"約束","pinyin":"yakusoku","meaning":"lời hứa; cuộc hẹn"},{"word":"連絡","pinyin":"renraku","meaning":"liên lạc"},{"word":"相談","pinyin":"soudan","meaning":"trao đổi; tư vấn"},{"word":"紹介","pinyin":"shoukai","meaning":"giới thiệu"},{"word":"参加","pinyin":"sanka","meaning":"tham gia"},{"word":"出発","pinyin":"shuppatsu","meaning":"khởi hành"},{"word":"到着","pinyin":"touchaku","meaning":"đến nơi"},{"word":"運転","pinyin":"unten","meaning":"lái xe"},{"word":"生活","pinyin":"seikatsu","meaning":"cuộc sống"},{"word":"習慣","pinyin":"shuukan","meaning":"thói quen"},{"word":"興味","pinyin":"kyoumi","meaning":"hứng thú"},{"word":"趣味","pinyin":"shumi","meaning":"sở thích"},{"word":"性格","pinyin":"seikaku","meaning":"tính cách"},{"word":"気持ち","pinyin":"kimochi","meaning":"cảm xúc; tâm trạng"},{"word":"考える","pinyin":"kangaeru","meaning":"suy nghĩ"},{"word":"決める","pinyin":"kimeru","meaning":"quyết định"},{"word":"選ぶ","pinyin":"erabu","meaning":"lựa chọn"},{"word":"比べる","pinyin":"kuraberu","meaning":"so sánh"},{"word":"調べる","pinyin":"shiraberu","meaning":"tra cứu; tìm hiểu"},{"word":"増える","pinyin":"fueru","meaning":"tăng lên"},{"word":"減る","pinyin":"heru","meaning":"giảm đi"},{"word":"変わる","pinyin":"kawaru","meaning":"thay đổi"},{"word":"変える","pinyin":"kaeru","meaning":"thay đổi (tha động từ)"},{"word":"続く","pinyin":"tsuzuku","meaning":"tiếp tục"},{"word":"続ける","pinyin":"tsuzukeru","meaning":"tiếp tục làm"},{"word":"受ける","pinyin":"ukeru","meaning":"nhận; tham gia; chịu"},{"word":"届ける","pinyin":"todokeru","meaning":"giao; gửi đến"},{"word":"伝える","pinyin":"tsutaeru","meaning":"truyền đạt"},{"word":"知らせる","pinyin":"shiraseru","meaning":"báo cho biết"},{"word":"認める","pinyin":"mitomeru","meaning":"công nhận"},{"word":"許す","pinyin":"yurusu","meaning":"tha thứ; cho phép"},{"word":"断る","pinyin":"kotowaru","meaning":"từ chối"},{"word":"断定","pinyin":"dantei","meaning":"khẳng định"},{"word":"確認","pinyin":"kakunin","meaning":"xác nhận; kiểm tra"},{"word":"注意","pinyin":"chuui","meaning":"chú ý; cảnh báo"},{"word":"利用","pinyin":"riyuu","meaning":"sử dụng; tận dụng"},{"word":"管理","pinyin":"kanri","meaning":"quản lý"},{"word":"予約","pinyin":"yoyaku","meaning":"đặt trước"},{"word":"料金","pinyin":"ryoukin","meaning":"phí; cước"},{"word":"価格","pinyin":"kakaku","meaning":"giá cả"},{"word":"商品","pinyin":"shouhin","meaning":"sản phẩm"},{"word":"サービス","pinyin":"saabisu","meaning":"dịch vụ"},{"word":"会社員","pinyin":"kaishain","meaning":"nhân viên công ty"},{"word":"研究","pinyin":"kenkyuu","meaning":"nghiên cứu"},{"word":"大学院","pinyin":"daigakuin","meaning":"cao học"},{"word":"卒業","pinyin":"sotsugyou","meaning":"tốt nghiệp"},{"word":"入学","pinyin":"nyuugaku","meaning":"nhập học"},{"word":"試験","pinyin":"shiken","meaning":"kỳ thi"},{"word":"成績","pinyin":"seiseki","meaning":"thành tích; điểm số"},{"word":"能力","pinyin":"nouryoku","meaning":"năng lực"},{"word":"努力","pinyin":"doryoku","meaning":"nỗ lực"},{"word":"成功","pinyin":"seikou","meaning":"thành công"},{"word":"失敗","pinyin":"shippai","meaning":"thất bại"}],"4":[{"word":"責任","pinyin":"sekinin","meaning":"trách nhiệm"},{"word":"権利","pinyin":"kenri","meaning":"quyền lợi; quyền"},{"word":"義務","pinyin":"gimu","meaning":"nghĩa vụ"},{"word":"影響","pinyin":"eikyou","meaning":"ảnh hưởng"},{"word":"傾向","pinyin":"keikou","meaning":"xu hướng"},{"word":"状況","pinyin":"joukyou","meaning":"tình hình"},{"word":"現状","pinyin":"genjou","meaning":"hiện trạng"},{"word":"課題","pinyin":"kadai","meaning":"vấn đề; nhiệm vụ"},{"word":"対策","pinyin":"taisaku","meaning":"biện pháp"},{"word":"目的","pinyin":"mokuteki","meaning":"mục đích"},{"word":"手段","pinyin":"shudan","meaning":"phương tiện; biện pháp"},{"word":"条件","pinyin":"jouken","meaning":"điều kiện"},{"word":"基準","pinyin":"kijun","meaning":"tiêu chuẩn"},{"word":"特徴","pinyin":"tokuchou","meaning":"đặc điểm"},{"word":"価値","pinyin":"kachi","meaning":"giá trị"},{"word":"効果","pinyin":"kouka","meaning":"hiệu quả; tác dụng"},{"word":"成果","pinyin":"seika","meaning":"thành quả"},{"word":"結果","pinyin":"kekka","meaning":"kết quả"},{"word":"判断","pinyin":"handan","meaning":"phán đoán; quyết định"},{"word":"決定","pinyin":"kettei","meaning":"quyết định"},{"word":"選択","pinyin":"sentaku","meaning":"lựa chọn"},{"word":"解決","pinyin":"kaiketsu","meaning":"giải quyết"},{"word":"改善","pinyin":"kaizen","meaning":"cải thiện"},{"word":"発展","pinyin":"hatten","meaning":"phát triển"},{"word":"発達","pinyin":"hattatsu","meaning":"phát triển"},{"word":"維持","pinyin":"iji","meaning":"duy trì"},{"word":"確保","pinyin":"kakuho","meaning":"đảm bảo; bảo đảm"},{"word":"防止","pinyin":"boushi","meaning":"phòng ngừa"},{"word":"防ぐ","pinyin":"fusegu","meaning":"ngăn chặn"},{"word":"避ける","pinyin":"sakeru","meaning":"tránh"},{"word":"備える","pinyin":"sonaeru","meaning":"chuẩn bị; trang bị"},{"word":"含む","pinyin":"fukumu","meaning":"bao gồm"},{"word":"含める","pinyin":"fukumeru","meaning":"bao gồm"},{"word":"表す","pinyin":"arawasu","meaning":"biểu thị"},{"word":"現れる","pinyin":"arawareru","meaning":"xuất hiện"},{"word":"現す","pinyin":"arawasu","meaning":"thể hiện"},{"word":"認識","pinyin":"ninshiki","meaning":"nhận thức"},{"word":"理解","pinyin":"rikai","meaning":"hiểu"},{"word":"判断力","pinyin":"handanryoku","meaning":"khả năng phán đoán"},{"word":"知識","pinyin":"chishiki","meaning":"kiến thức"},{"word":"専門","pinyin":"senmon","meaning":"chuyên môn"},{"word":"専門家","pinyin":"senmonka","meaning":"chuyên gia"},{"word":"研究者","pinyin":"kenkyuusha","meaning":"nhà nghiên cứu"},{"word":"技術者","pinyin":"gijutsusha","meaning":"kỹ sư; kỹ thuật viên"},{"word":"企業","pinyin":"kigyou","meaning":"doanh nghiệp"},{"word":"業界","pinyin":"gyoukai","meaning":"ngành; giới kinh doanh"},{"word":"市場","pinyin":"shijou","meaning":"thị trường"},{"word":"消費","pinyin":"shouhi","meaning":"tiêu dùng"},{"word":"生産","pinyin":"seisan","meaning":"sản xuất"},{"word":"輸入","pinyin":"yunyuu","meaning":"nhập khẩu"},{"word":"輸出","pinyin":"yushutsu","meaning":"xuất khẩu"},{"word":"国際","pinyin":"kokusai","meaning":"quốc tế"},{"word":"国内","pinyin":"kokunai","meaning":"trong nước"},{"word":"地域","pinyin":"chiiki","meaning":"khu vực"},{"word":"都市","pinyin":"toshi","meaning":"đô thị"},{"word":"人口","pinyin":"jinkou","meaning":"dân số"},{"word":"自然","pinyin":"shizen","meaning":"tự nhiên"},{"word":"資源","pinyin":"shigen","meaning":"tài nguyên"},{"word":"エネルギー","pinyin":"enerugii","meaning":"năng lượng"},{"word":"問題点","pinyin":"mondaiten","meaning":"điểm vấn đề"},{"word":"現実","pinyin":"genjitsu","meaning":"thực tế"},{"word":"理想","pinyin":"risou","meaning":"lý tưởng"},{"word":"将来","pinyin":"shourai","meaning":"tương lai"},{"word":"過去","pinyin":"kako","meaning":"quá khứ"},{"word":"現在","pinyin":"genzai","meaning":"hiện tại"},{"word":"当時","pinyin":"touji","meaning":"lúc đó"},{"word":"一方","pinyin":"ippou","meaning":"một mặt; trong khi đó"},{"word":"一応","pinyin":"ichiou","meaning":"tạm thời; về cơ bản"},{"word":"実際","pinyin":"jissai","meaning":"thực tế"},{"word":"当然","pinyin":"touzen","meaning":"đương nhiên"},{"word":"特に","pinyin":"tokuni","meaning":"đặc biệt"},{"word":"非常に","pinyin":"hijou ni","meaning":"vô cùng"},{"word":"必ず","pinyin":"kanarazu","meaning":"nhất định"},{"word":"確かに","pinyin":"tashika ni","meaning":"quả thật"}],"5":[{"word":"曖昧","pinyin":"aimai","meaning":"mơ hồ; không rõ ràng"},{"word":"概念","pinyin":"gainen","meaning":"khái niệm"},{"word":"抽象","pinyin":"chuushou","meaning":"trừu tượng"},{"word":"具体的","pinyin":"gutaiteki","meaning":"cụ thể"},{"word":"本質","pinyin":"honshitsu","meaning":"bản chất"},{"word":"構造","pinyin":"kouzou","meaning":"cấu trúc"},{"word":"過程","pinyin":"katei","meaning":"quá trình"},{"word":"前提","pinyin":"zentei","meaning":"tiền đề"},{"word":"仮定","pinyin":"katei","meaning":"giả định"},{"word":"根拠","pinyin":"konkyo","meaning":"căn cứ; cơ sở"},{"word":"証拠","pinyin":"shouko","meaning":"bằng chứng"},{"word":"論理","pinyin":"ronri","meaning":"logic"},{"word":"分析","pinyin":"bunseki","meaning":"phân tích"},{"word":"評価","pinyin":"hyouka","meaning":"đánh giá"},{"word":"批判","pinyin":"hihan","meaning":"phê bình"},{"word":"主張","pinyin":"shuchou","meaning":"chủ trương; lập luận"},{"word":"意見","pinyin":"iken","meaning":"ý kiến"},{"word":"見解","pinyin":"kenkai","meaning":"quan điểm"},{"word":"傾向","pinyin":"keikou","meaning":"xu hướng"},{"word":"妥当","pinyin":"datou","meaning":"thỏa đáng; hợp lý"},{"word":"適切","pinyin":"tekisetsu","meaning":"thích hợp"},{"word":"重大","pinyin":"juudai","meaning":"nghiêm trọng; quan trọng"},{"word":"微妙","pinyin":"bimyou","meaning":"tinh tế; khó nắm bắt"},{"word":"顕著","pinyin":"kencho","meaning":"nổi bật; rõ rệt"},{"word":"著しい","pinyin":"ichijirushii","meaning":"đáng kể"},{"word":"複雑","pinyin":"fukuzatsu","meaning":"phức tạp"},{"word":"合理的","pinyin":"gouriteki","meaning":"hợp lý"},{"word":"効率","pinyin":"kouritsu","meaning":"hiệu suất"},{"word":"能率","pinyin":"nouritsu","meaning":"năng suất"},{"word":"持続","pinyin":"jizoku","meaning":"duy trì; tiếp diễn"},{"word":"実現","pinyin":"jitsugen","meaning":"hiện thực hóa"},{"word":"達成","pinyin":"tassei","meaning":"đạt được"},{"word":"遂行","pinyin":"suikou","meaning":"thực hiện"},{"word":"促進","pinyin":"sokushin","meaning":"thúc đẩy"},{"word":"抑制","pinyin":"yokusei","meaning":"kiềm chế"},{"word":"阻止","pinyin":"soshi","meaning":"ngăn chặn"},{"word":"拡大","pinyin":"kakudai","meaning":"mở rộng"},{"word":"縮小","pinyin":"shukushou","meaning":"thu hẹp"},{"word":"増加","pinyin":"zouka","meaning":"gia tăng"},{"word":"減少","pinyin":"genshou","meaning":"giảm sút"},{"word":"変動","pinyin":"hendou","meaning":"biến động"},{"word":"安定","pinyin":"antei","meaning":"ổn định"},{"word":"不安定","pinyin":"fuantei","meaning":"không ổn định"},{"word":"適応","pinyin":"tekiou","meaning":"thích nghi"},{"word":"対応","pinyin":"taiou","meaning":"ứng phó; đáp ứng"},{"word":"対立","pinyin":"tairitsu","meaning":"đối lập; xung đột"},{"word":"協調","pinyin":"kyouchou","meaning":"phối hợp; hòa hợp"},{"word":"妥協","pinyin":"dakyou","meaning":"thỏa hiệp"},{"word":"交渉","pinyin":"koushou","meaning":"đàm phán"},{"word":"合意","pinyin":"goui","meaning":"đồng thuận"},{"word":"主導","pinyin":"shudou","meaning":"chủ đạo; dẫn dắt"},{"word":"実施","pinyin":"jisshi","meaning":"thực hiện; triển khai"},{"word":"導入","pinyin":"dounyuu","meaning":"đưa vào; áp dụng"},{"word":"採用","pinyin":"saiyou","meaning":"tuyển dụng; áp dụng"},{"word":"廃止","pinyin":"haishi","meaning":"bãi bỏ"},{"word":"規制","pinyin":"kisei","meaning":"quy định; hạn chế"},{"word":"制度","pinyin":"seido","meaning":"chế độ; hệ thống"},{"word":"政策","pinyin":"seisaku","meaning":"chính sách"},{"word":"法則","pinyin":"housoku","meaning":"quy luật"},{"word":"法律","pinyin":"houritsu","meaning":"pháp luật"},{"word":"裁判","pinyin":"saiban","meaning":"xét xử; phiên tòa"},{"word":"犯罪","pinyin":"hanzai","meaning":"tội phạm"},{"word":"被害","pinyin":"higai","meaning":"thiệt hại"},{"word":"被告","pinyin":"hikoku","meaning":"bị cáo"},{"word":"責任","pinyin":"sekinin","meaning":"trách nhiệm"},{"word":"権限","pinyin":"kengen","meaning":"quyền hạn"},{"word":"組織","pinyin":"soshiki","meaning":"tổ chức"},{"word":"機関","pinyin":"kikan","meaning":"cơ quan"},{"word":"企業","pinyin":"kigyou","meaning":"doanh nghiệp"},{"word":"経営","pinyin":"keiei","meaning":"quản lý; kinh doanh"},{"word":"財政","pinyin":"zaisei","meaning":"tài chính công"},{"word":"金融","pinyin":"kinyuu","meaning":"tài chính; tiền tệ"},{"word":"投資","pinyin":"toushi","meaning":"đầu tư"},{"word":"利益","pinyin":"rieki","meaning":"lợi nhuận; lợi ích"},{"word":"損失","pinyin":"sonshitsu","meaning":"tổn thất"},{"word":"需要","pinyin":"juyou","meaning":"nhu cầu"},{"word":"供給","pinyin":"kyoukyuu","meaning":"cung cấp; nguồn cung"},{"word":"市場","pinyin":"shijou","meaning":"thị trường"},{"word":"資産","pinyin":"shisan","meaning":"tài sản"},{"word":"負債","pinyin":"fusai","meaning":"nợ phải trả"},{"word":"雇用","pinyin":"koyou","meaning":"việc làm; tuyển dụng"},{"word":"労働","pinyin":"roudou","meaning":"lao động"}]};
const JLPT_LEVEL_NAMES = { "0":"Hiragana", "1":"JLPT N5", "2":"JLPT N4", "3":"JLPT N3", "4":"JLPT N2", "5":"JLPT N1" };
const JLPT_REMOTE = {
  "1":"https://raw.githubusercontent.com/allenlu2009/japanese-learning-datasets/master/vocabulary/n5.json",
  "2":"https://raw.githubusercontent.com/allenlu2009/japanese-learning-datasets/master/vocabulary/n4.json",
  "3":"https://raw.githubusercontent.com/allenlu2009/japanese-learning-datasets/master/vocabulary/n3.json",
  "4":"https://raw.githubusercontent.com/allenlu2009/japanese-learning-datasets/master/vocabulary/n2.json",
  "5":"https://raw.githubusercontent.com/allenlu2009/japanese-learning-datasets/master/vocabulary/n1.json"
};
async function loadExpandedJapaneseVocabulary() {
  await Promise.all(Object.entries(JLPT_REMOTE).map(async ([level,url]) => {
    try {
      const response = await fetch(url, {cache:'no-store'});
      if (!response.ok) return;
      const payload = await response.json();
      const words = Array.isArray(payload.words) ? payload.words : [];
      const converted = words.map(item => ({
        word: item.word || '',
        pinyin: item.kana || (Array.isArray(item.romaji) ? item.romaji[0] : ''),
        meaning: item.meaning || ''
      })).filter(item => item.word);
      if (converted.length >= 50) {
        hskData[level] = converted;
        const current = String(document.getElementById('jlpt-level')?.value || currentLevel || '1');
        if (current === level) {
          renderList();
          initTyping();
          updateExamStartInfo();
          updateProgressUI();
        }
      }
    } catch (e) {
      console.info('Không tải được bộ JLPT mở rộng; dùng dữ liệu dự phòng.', level);
    }
  }));
}
setTimeout(() => loadExpandedJapaneseVocabulary(), 250);
// Phát âm tiếng Nhật bằng Speech Synthesis của trình duyệt
function speakJapanese(index) {
    const list = hskData[currentLevel] || [];
    const item = list[index];
    if (!item || !item.word) return;

    if (!('speechSynthesis' in window)) {
        alert('Trình duyệt này không hỗ trợ phát âm.');
        return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.78;
    utterance.pitch = 1;

    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => /^ja-JP/i.test(v.lang));
    if (voice) utterance.voice = voice;

    speechSynthesis.speak(utterance);
}

// Render Danh sách từ
function renderList(filteredList = null) {
    const list = Array.isArray(filteredList) ? filteredList : (hskData[currentLevel] || []);
    const container = document.getElementById('word-list');
    const total = document.getElementById('total-words');

    if (!container) return;
    if (total) total.textContent = list.length;

    container.innerHTML = list.map((item, index) => `
        <div class="word-card">
            <div class="word-card-top">
                <div class="hanzi">${item.word || ''}</div>
                <button class="pronounce-btn" type="button"
                    title="Phát âm tiếng Nhật"
                    aria-label="Phát âm tiếng Nhật ${item.word || ''}"
                    onclick="speakJapanese(${index})">${uiIcon("icon-volume")}</button>
            </div>
            <div class="pinyin">${item.pinyin || ''}</div>
            <div class="meaning">${item.meaning || ''}</div>
        </div>
    `).join('');
}

// Khởi tạo bài tập gõ
function initTyping() {
    typingWordList = [...(hskData[currentLevel] || [])];
    typingWordList.sort(() => Math.random() - 0.5); 
    currentWordIndex = 0;
    showTypingWord();
}

function showTypingWord() {
    const feedback = document.getElementById('typing-feedback');
    const nextBtn = document.getElementById('next-word-btn');
    const input = document.getElementById('typing-input');

    if (typingWordList.length === 0) {
        document.getElementById('typing-word').textContent = "Trống";
        document.getElementById('typing-meaning').textContent = "Chưa có dữ liệu cho cấp độ này";
        input.disabled = true;
        return;
    }

    if (currentWordIndex >= typingWordList.length) {
        document.getElementById('typing-word').innerHTML = uiIcon("icon-spark");
        document.getElementById('typing-meaning').textContent = "Bạn đã hoàn thành cấp độ này!";
        input.disabled = true;
        return;
    }

    const currentItem = typingWordList[currentWordIndex];
    document.getElementById('typing-word').textContent = currentItem.word;
    document.getElementById('typing-meaning').textContent = currentItem.meaning;
    
    input.value = "";
    input.disabled = false;
    input.focus();
    feedback.textContent = "";
    nextBtn.classList.add('hidden');
}

function checkTyping() {
    if (currentWordIndex >= typingWordList.length) return;

    const inputVal = document.getElementById('typing-input').value.trim().toLowerCase();
    const currentItem = typingWordList[currentWordIndex];
    
    const cleanPinyin = currentItem.pinyin.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const isMatch = (inputVal === cleanPinyin) || 
                    (inputVal === currentItem.pinyin.toLowerCase()) || 
                    (inputVal === currentItem.word); 

    const feedback = document.getElementById('typing-feedback');
    const nextBtn = document.getElementById('next-word-btn');

    if (isMatch) {
        feedback.textContent = " Chính xác!";
        feedback.className = "correct";
        document.getElementById('typing-input').disabled = true;
        nextBtn.classList.remove('hidden');
        nextBtn.focus();
    } else {
        feedback.textContent = " Sai rồi, thử lại nhé!";
        feedback.className = "incorrect";
    }
}

function nextTypingWord() {
    currentWordIndex++;
    saveProgressData({ currentLevel, typingCompleted: Math.max(Number(getProgressData().typingCompleted || 0), currentWordIndex) });
    showTypingWord();
    updateProgressUI();
}

// ----------------------------------------------------
// Chức năng Luyện giao tiếp
// ----------------------------------------------------

function filterDifficulty(level) {
    currentCommFilter = level;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderCommunication();
}

function renderCommunication() {
    const container = document.getElementById('comm-list');
    // Mục Giao tiếp đã bị gỡ khỏi giao diện và dữ liệu: thoát sớm để không làm hỏng khởi động app.
    if (!container || typeof communicationData === 'undefined') return;
    const rawList = communicationData[currentLevel] || [];

    let filteredList = rawList;
    if (currentCommFilter !== 'all') {
        filteredList = rawList.filter(item => item.difficulty === currentCommFilter);
    }

    if (filteredList.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#888;">Chưa có câu hỏi giao tiếp nào cho cấp độ hoặc bộ lọc này.</p>`;
        return;
    }

    container.innerHTML = filteredList.map((item, index) => {
        let badgeClass = "badge-easy";
        if (item.difficulty === "Trung bình") badgeClass = "badge-medium";
        if (item.difficulty === "Khó") badgeClass = "badge-hard";

        return `
            <div class="comm-card">
                <div class="comm-header">
                    <span class="badge ${badgeClass}">${item.difficulty}</span>
                    <button class="toggle-answer-btn" onclick="toggleAnswer(${index})">${uiIcon("icon-bulb")} Mẫu trả lời</button>
                </div>
                <div class="question-box">
                    <div class="q-hanzi">${uiIcon("icon-question")} ${item.question}</div>
                    <div class="q-pinyin">${uiIcon("icon-pin")} Pinyin: ${item.pinyin}</div>
                    <div class="q-meaning">${uiIcon("icon-chat")} Dịch: ${item.meaning}</div>
                </div>
                <div class="answer-box hidden" id="answer-${index}">
                    <div class="a-hanzi">${uiIcon("icon-chat")} ${item.answer}</div>
                    <div class="q-pinyin">${uiIcon("icon-pin")} Pinyin: ${item.answerPinyin}</div>
                    <div class="q-meaning">${uiIcon("icon-chat")} Dịch: ${item.answerMeaning}</div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleAnswer(index) {
    const answerBox = document.getElementById(`answer-${index}`);
    answerBox.classList.toggle('hidden');
}
// ==========================================
// BỔ SUNG: TÌM KIẾM TỪ VỰNG & BỎ QUA BÀI GÕ
// ==========================================

// 1. Hàm tìm kiếm từ vựng
function openVocabularySearch() {
    switchMode('list');
    setTimeout(() => {
        const input = document.getElementById('vocab-search');
        if (input) {
            input.hidden = false;
            input.removeAttribute('disabled');
            input.focus({ preventScroll: true });
            input.select();
        }
    }, 30);
}

window.openVocabularySearch = openVocabularySearch;

function searchWords() {
    filterVocabulary();
}


// 2. Hàm bỏ qua từ trong bài tập gõ
function skipTypingWord() {
    const feedbackEl = document.getElementById('typing-feedback');

    // Lấy từ hiện tại đang hiển thị (thay currentTypingWord bằng biến từ hiện tại của bạn)
    if (typeof currentTypingWord !== 'undefined' && currentTypingWord) {
        feedbackEl.style.color = '#e67e22';
        feedbackEl.innerText = `⏭️ Đã bỏ qua. Đáp án: "${currentTypingWord.word}" (${currentTypingWord.pinyin})`;
        
        setTimeout(() => {
            feedbackEl.innerText = '';
            nextTypingWord(); // Gọi hàm chuyển từ tiếp theo sẵn có của bạn
        }, 1200);
    } else {
        nextTypingWord();
    }
}
// Hàm đọc từ tiếng Nhật bằng giọng đọc chuẩn (ja-JP)
function speakWord(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Dừng câu đọc trước đó nếu đang đọc
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP'; // Ngôn ngữ Tiếng Nhật
        utterance.rate = 0.65;    // Tốc độ đọc vừa phải
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Trình duyệt của bạn không hỗ trợ phát âm!");
    }
}

// Hàm phát âm từ đang xuất hiện ở phần bài tập gõ
function speakCurrentTypingWord() {
    const wordElement = document.getElementById('typing-word');
    if (wordElement && wordElement.innerText) {
        speakWord(wordElement.innerText);
    }
}// Biến toàn cục cho chế độ thi thử
let examQuestions = [];
let currentQuestionIndex = 0;
let examScore = 0;

// Bảng cấu hình số câu hỏi theo JLPT
const HSK_QUESTION_COUNT = { "0": 40, "1": 40, "2": 50, "3": 60, "4": 70, "5": 80 };

// Cập nhật thông tin màn hình bắt đầu thi
function updateExamStartInfo() {
    const levelSelect = document.getElementById('jlpt-level');
    const selectedLevel = levelSelect ? levelSelect.value : "1";
    const count = HSK_QUESTION_COUNT[selectedLevel] || 30;

    const levelTitle = document.getElementById('exam-level-title');
    const infoText = document.getElementById('exam-info-text');

    if (levelTitle) levelTitle.innerText = selectedLevel;
    const levelBadge = document.getElementById('exam-level-badge');
    if (levelBadge) levelBadge.textContent = selectedLevel;
    if (infoText) infoText.innerText = `Bài thi gồm ${count} câu hỏi trắc nghiệm từ vựng cấp độ JLPT ${selectedLevel}.`;
}

// Hàm chuyển chế độ (Cập nhật thêm tính năng đổi số câu)


// Bắt đầu bài thi
function startExam() {
    const levelSelect = document.getElementById('jlpt-level');
    const currentLevel = levelSelect ? levelSelect.value : "1";
    const list = hskData[currentLevel];
    const targetCount = HSK_QUESTION_COUNT[currentLevel] || 30;

    if (!list || list.length < 4) {
        alert("Chưa đủ dữ liệu từ vựng để thi thử level này!");
        return;
    }

    // Trộn ngẫu nhiên danh sách từ vựng và lấy số câu tương ứng (30 hoặc 40)
    const shuffledList = [...list].sort(() => 0.5 - Math.random());
    const selectedWords = shuffledList.slice(0, Math.min(targetCount, list.length));

    // Tạo bộ câu hỏi kèm 4 lựa chọn
    examQuestions = selectedWords.map(targetWord => {
        const distractors = list
            .filter(w => w.word !== targetWord.word)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        
        const options = [...distractors, targetWord].sort(() => 0.5 - Math.random());
        return {
            target: targetWord,
            options: options
        };
    });

    currentQuestionIndex = 0;
    examScore = 0;

    document.getElementById('exam-start-screen').classList.add('hidden');
    document.getElementById('exam-result-screen').classList.add('hidden');
    document.getElementById('exam-quiz-screen').classList.remove('hidden');

    renderQuestion();

    // Bắt đầu đồng hồ đúng lúc bài tập JLPT được mở.
    // startExam() được gọi trực tiếp từ giao diện nên timer phải được khởi động tại đây.
    if (typeof startExamTimer === 'function') {
        startExamTimer();
    }
}

// Hiển thị câu hỏi
function renderQuestion() {
    const q = examQuestions[currentQuestionIndex];
    document.getElementById('quiz-current').innerText = currentQuestionIndex + 1;
    document.getElementById('quiz-total').innerText = examQuestions.length;
    document.getElementById('quiz-score').innerText = examScore;
    
    document.getElementById('quiz-word').innerText = q.target.word;
    document.getElementById('quiz-pinyin').innerText = q.target.pinyin ? `[${q.target.pinyin}]` : '';
    
    const optionsDiv = document.getElementById('quiz-options');
    optionsDiv.innerHTML = '';
    document.getElementById('quiz-feedback').innerText = '';
    document.getElementById('next-quiz-btn').classList.add('hidden');

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.innerText = opt.meaning;
        btn.onclick = () => checkExamAnswer(opt, q.target, btn);
        optionsDiv.appendChild(btn);
    });
    applyQuizOptionColors();
}

// Force quiz answer text colors so disabled buttons are readable on iOS/Safari too.
function applyQuizOptionColors() {
    const dark = document.body.classList.contains('dark-mode');
    document.querySelectorAll('#quiz-options .quiz-option-btn').forEach(b => {
        let color = dark ? '#edf2f7' : '#334155';
        let background = dark ? '#202934' : '#ffffff';
        let border = dark ? '#344150' : '#e5eaf1';

        if (b.classList.contains('quiz-correct')) {
            color = dark ? '#22c55e' : '#176b32';
            background = dark ? '#16452f' : '#dff7e8';
            border = dark ? '#28a745' : '#28a745';
        } else if (b.classList.contains('quiz-wrong')) {
            color = dark ? '#ff6b75' : '#a51f2b';
            background = dark ? '#4a2026' : '#ffe5e8';
            border = dark ? '#dc3545' : '#dc3545';
        }

        // Set the full visual state inline so iOS/Safari cannot replace it
        // with the disabled-button appearance or an earlier CSS rule.
        b.style.setProperty('color', color, 'important');
        b.style.setProperty('-webkit-text-fill-color', color, 'important');
        b.style.setProperty('background', background, 'important');
        b.style.setProperty('border-color', border, 'important');
        b.style.setProperty('opacity', '1', 'important');
        b.style.setProperty('text-shadow', 'none', 'important');
    });
}

// Kiểm tra đáp án
function checkExamAnswer(selected, correct, btn) {
    const buttons = document.querySelectorAll('.quiz-option-btn');
    buttons.forEach(b => b.disabled = true);

    if (selected.word === correct.word) {
        examScore++;
        btn.classList.add('quiz-correct');
        document.getElementById('quiz-feedback').innerText = ' Chính xác!';
        document.getElementById('quiz-feedback').style.color = '#28a745';
    } else {
        btn.classList.add('quiz-wrong');
        buttons.forEach(b => {
            if (b.innerText === correct.meaning) {
                b.classList.add('quiz-correct');
            }
        });
        document.getElementById('quiz-feedback').innerText = ` Sai rồi! Đáp án đúng: ${correct.meaning}`;
        document.getElementById('quiz-feedback').style.color = '#dc3545';
    }

    applyQuizOptionColors();
    document.getElementById('quiz-score').innerText = examScore;
    document.getElementById('next-quiz-btn').classList.remove('hidden');
}

// Câu hỏi tiếp theo
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < examQuestions.length) {
        renderQuestion();
    } else {
        finishExam();
    }
}

// Kết thúc bài thi
function finishExam() {
    if (typeof stopExamTimer === 'function') {
        stopExamTimer();
    }
    document.getElementById('exam-quiz-screen').classList.add('hidden');
    document.getElementById('exam-result-screen').classList.remove('hidden');
    
    document.getElementById('final-score').innerText = examScore;
    document.getElementById('final-total').innerText = examQuestions.length;

    const percentage = (examScore / examQuestions.length) * 100;
    const examResult = {
        level: String(currentLevel),
        score: examScore,
        total: examQuestions.length,
        percentage: Math.round(percentage),
        completedAt: new Date().toISOString()
    };
    const oldProgress = getProgressData();
    const oldExams = Array.isArray(oldProgress.exams) ? oldProgress.exams : [];
    saveProgressData({
        currentLevel: String(currentLevel),
        exams: [...oldExams.slice(-49), examResult]
    });

    let msg = '';
    if (percentage === 100) msg = uiIcon("icon-spark") + " Xuất sắc! Bạn đã đạt điểm tuyệt đối!";
    else if (percentage >= 80) msg = ' Rất tốt! Bạn nắm rất vững từ vựng cấp độ này.';
    else if (percentage >= 50) msg = ' Đạt yêu cầu! Hãy tiếp tục luyện tập để đạt điểm cao hơn.';
    else msg = ' Cần cố gắng thêm! Hãy xem lại danh sách từ vựng và thử lại nhé.';
    
    document.getElementById('result-message').innerText = msg;
}

// Reset bài thi
function resetExamUI() {
    if (typeof stopExamTimer === 'function') {
        stopExamTimer();
    }
    document.getElementById('exam-start-screen').classList.remove('hidden');
    document.getElementById('exam-quiz-screen').classList.add('hidden');
    document.getElementById('exam-result-screen').classList.add('hidden');
}// 1. Cập nhật hàm chọn cấp độ JLPT


// 2. Cập nhật hàm bắt đầu thi thử
// ============================================================
// BỔ SUNG MỚI - KHÔNG XÓA CODE CŨ
// 1. TÌM KIẾM TỪ VỰNG
// 2. ĐỒNG HỒ THI THỬ
// ============================================================


// ============================================================
// 1. TÌM KIẾM TỪ VỰNG
// ============================================================


function changeLevel() {
    const levelSelect = document.getElementById('jlpt-level');
    const nextLevel = levelSelect ? String(levelSelect.value) : '1';

    // Nếu thực sự đổi JLPT mới đồng bộ dữ liệu; không tự đổi tab.
    if (String(currentLevel) === nextLevel) return;
    currentLevel = nextLevel;
    saveProgressData({ currentLevel });

    // Danh sách từ: đổi ngay sang đúng JLPT đã chọn.
    renderList();

    // Chỉ khởi tạo lại mục ĐANG MỞ. Các mục khác sẽ dùng currentLevel mới
    // khi người dùng mở chúng, tránh reset/random dữ liệu ngoài ý muốn.
    const activeSection = document.querySelector('main > section.active, section.active');
    const activeId = activeSection ? activeSection.id : '';

    if (activeId === 'typing-mode') {
        initTyping();
    } else if (activeId === 'listening-mode') {
        if ('speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch(e) {} }
        initListening();
    } else if (activeId === 'exam-mode') {
        updateExamStartInfo();
        resetExamUI();
    } else if (activeId === 'progress-mode') {
        updateProgressUI();
    } else if (activeId === 'communication-mode') {
        renderCommunication();
    }

    const listeningLevel = document.getElementById('listening-level-label');
    if (listeningLevel) listeningLevel.textContent = `JLPT ${currentLevel}`;

    const searchInput = document.getElementById('vocab-search');
    const resultCount = document.getElementById('search-result-count');
    if (searchInput) searchInput.value = '';
    if (resultCount) resultCount.textContent = '';
}

function normalizeSearchText(text = "") {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim();
}


function filterVocabulary() {

    const searchInput = document.getElementById("vocab-search");
    const container = document.getElementById("word-list");
    const levelSelect = document.getElementById("jlpt-level");
    const resultCount = document.getElementById("search-result-count");

    if (!searchInput || !container || !levelSelect) {
        return;
    }

    const keyword = normalizeSearchText(searchInput.value);

    const level = String(levelSelect.value || currentLevel || '1');

    const vocabulary = hskData[level] || [];

    // Không nhập gì -> hiện toàn bộ danh sách
    if (!keyword) {

        if (typeof renderList === "function") {
            renderList();
        }

        if (resultCount) {
            resultCount.innerText = "";
        }

        return;
    }


    const filteredWords = vocabulary.filter(item => {

        const word = normalizeSearchText(item.word || "");
        const pinyin = normalizeSearchText(item.pinyin || "");
        const meaning = normalizeSearchText(item.meaning || "");

        return (
            word.includes(keyword) ||
            pinyin.includes(keyword) ||
            meaning.includes(keyword)
        );

    });


    // Render kết quả tìm kiếm
    container.innerHTML = filteredWords.map(item => `
        <div class="word-card">
            <div class="word-card-top">
                <div class="hanzi">${item.word || ""}</div>
                <button class="pronounce-btn" type="button"
                    title="Phát âm tiếng Nhật"
                    aria-label="Phát âm ${item.word || ""}"
                    onclick='speakWord(${JSON.stringify(item.word || "")})'>${uiIcon("icon-volume")}</button>
            </div>
            <div class="pinyin">${item.pinyin || ""}</div>
            <div class="meaning">${item.meaning || ""}</div>
        </div>
    `).join("");


    if (resultCount) {

        if (filteredWords.length > 0) {

            resultCount.innerText =
                ` Tìm thấy ${filteredWords.length}/${vocabulary.length} từ`;

        } else {

            resultCount.innerText =
                " Không tìm thấy từ phù hợp";

        }
    }
}


// Khi đổi JLPT thì tự động xóa tìm kiếm cũ
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("vocab-search");
    if (searchInput) {
        searchInput.addEventListener("input", filterVocabulary);
        searchInput.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                searchInput.value = "";
                filterVocabulary();
                searchInput.blur();
            }
        });
    }

    const levelSelect = document.getElementById("jlpt-level");

    if (levelSelect) {

        levelSelect.addEventListener("change", function () {

            const searchInput =
                document.getElementById("vocab-search");

            const resultCount =
                document.getElementById("search-result-count");

            if (searchInput) {
                searchInput.value = "";
            }

            if (resultCount) {
                resultCount.innerText = "";
            }

        });

    }

});


// ============================================================
// 2. ĐỒNG HỒ THI THỬ JLPT
// ============================================================

// Bạn có thể đổi số phút ở đây
const HSK_EXAM_TIME = {
    "1": 30,
    "2": 45,
    "3": 60,
    "4": 90,
    "5": 120,
    "6": 180
};


let examTimerInterval = null;

let examTimeLeft = 0;

let examStartTime = 0;


// Cập nhật đồng hồ
function updateExamTimerDisplay() {

    const timer = document.getElementById("exam-timer");

    if (!timer) return;


    let minutes = Math.floor(examTimeLeft / 60);

    let seconds = examTimeLeft % 60;


    timer.innerText =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    // Luôn hiện đồng hồ khi đang làm bài, kể cả trên iPhone/Safari.
    timer.style.setProperty("display", "inline-flex", "important");
    timer.style.setProperty("visibility", "visible", "important");
    timer.style.setProperty("opacity", "1", "important");


    // Còn dưới 1 phút
    if (examTimeLeft <= 60) {

        timer.style.color = "#dc3545";

    } else {

        timer.style.color = "";

    }

}


// Bắt đầu đếm giờ
function startExamTimer() {

    if (examTimerInterval) {
        clearInterval(examTimerInterval);
    }


    const levelSelect =
        document.getElementById("jlpt-level");

    const level =
        levelSelect ? levelSelect.value : "1";


    const minutes =
        HSK_EXAM_TIME[level] || 10;


    examTimeLeft = minutes * 60;

    examStartTime = Date.now();


    updateExamTimerDisplay();


    examTimerInterval = setInterval(function () {

        examTimeLeft--;

        updateExamTimerDisplay();


        if (examTimeLeft <= 0) {

            clearInterval(examTimerInterval);

            examTimerInterval = null;


            // Khóa đáp án
            document
                .querySelectorAll(".quiz-option-btn")
                .forEach(button => {

                    button.disabled = true;

                });


            alert("⏰ Hết thời gian làm bài!");


            if (typeof finishExam === "function") {

                finishExam();

            }

        }

    }, 1000);

}


// Dừng đồng hồ
function stopExamTimer() {

    if (examTimerInterval) {

        clearInterval(examTimerInterval);

        examTimerInterval = null;

    }

}


// ============================================================
// GIỮ HÀM startExam CŨ
// CHỈ BỔ SUNG TIMER VÀO SAU KHI HÀM CŨ CHẠY
// ============================================================

const originalStartExamWithTimer = window.startExam;


if (typeof originalStartExamWithTimer === "function") {

    window.startExam = function () {

        originalStartExamWithTimer.apply(this, arguments);


        const quizScreen =
            document.getElementById("exam-quiz-screen");


        // Chỉ chạy timer nếu màn hình thi thật sự được mở
        if (
            quizScreen &&
            !quizScreen.classList.contains("hidden")
        ) {

            startExamTimer();

        }

    };

}


// ============================================================
// GIỮ HÀM finishExam CŨ
// CHỈ BỔ SUNG DỪNG TIMER
// ============================================================

const originalFinishExamWithTimer = window.finishExam;


if (typeof originalFinishExamWithTimer === "function") {

    window.finishExam = function () {

        stopExamTimer();


        let usedSeconds = 0;


        if (examStartTime) {

            usedSeconds =
                Math.floor(
                    (Date.now() - examStartTime) / 1000
                );

        }


        originalFinishExamWithTimer.apply(this, arguments);


        const result =
            document.getElementById("exam-time-result");


        if (result) {

            const minutes =
                Math.floor(usedSeconds / 60);

            const seconds =
                usedSeconds % 60;


            result.innerText =
                `⏱️ Thời gian làm bài: ${minutes} phút ${seconds} giây`;

        }

    };

}


// ============================================================
// GIỮ resetExamUI CŨ + RESET TIMER
// ============================================================

const originalResetExamUIWithTimer =
    window.resetExamUI;


if (typeof originalResetExamUIWithTimer === "function") {

    window.resetExamUI = function () {

        stopExamTimer();

        originalResetExamUIWithTimer.apply(
            this,
            arguments
        );


        const timer =
            document.getElementById("exam-timer");


        if (timer) {

            timer.innerText = "--:--";

            timer.style.color = "";

        }

    };

}


// =====================================================
// LƯU TIẾN TRÌNH ONLINE THEO TÀI KHOẢN FIREBASE
// =====================================================
let onlineProgressCache = {};

function getLoggedUserForProgress() {
    const user = window.ghCurrentUser || (window.ghAuth && window.ghAuth.getUser ? window.ghAuth.getUser() : null);
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email || '',
        username: window.ghUserProfile?.username || user.displayName || user.email || 'Tài khoản'
    };
}

function getProgressData() {
    if (window.ghAuth?.getProgress) {
        onlineProgressCache = window.ghAuth.getProgress() || {};
    }
    return { ...onlineProgressCache };
}

function saveProgressData(patch) {
    if (!window.ghAuth?.saveProgress) return;
    onlineProgressCache = { ...onlineProgressCache, ...(patch || {}), updatedAt: new Date().toISOString() };
    window.ghAuth.saveProgress(patch || {}).catch(error => {
        console.warn('Không thể lưu tiến trình online:', error);
    });
}

function updateProgressUI() {
    const p = getProgressData();
    const user = getLoggedUserForProgress();
    const level = String(p.currentLevel || currentLevel || '1');
    const total = (hskData[level] || []).length;
    const typed = Math.min(Number(p.typingCompleted || 0), total);
    const typingPercent = total ? Math.min(100, Math.round((typed / total) * 100)) : 0;
    const exams = Array.isArray(p.exams) ? p.exams : [];

    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('progress-account', user ? (user.username || user.email || 'Tài khoản') : 'Chưa đăng nhập');
    set('progress-level', JLPT_LEVEL_NAMES[String(level)] || `JLPT N${level}`);
    set('progress-level-detail', `${total} từ trong cấp độ này`);
    set('progress-typing', `${typingPercent}%`);
    set('progress-typing-detail', `${typed} / ${total} từ đã hoàn thành`);
    set('progress-exam', `${exams.length} bài`);
    const lastExam = exams[exams.length - 1];
    set('progress-exam-detail', lastExam ? `${lastExam.score}/${lastExam.total} • JLPT ${lastExam.level}` : 'Chưa có kết quả');
    const listen = p.listening || {};
    const listenPct = Math.min(100, Math.max(0, Number(listen.pct || 0)));
    set('progress-listening', `${listenPct}%`);
    set('progress-listening-detail', `${Number(listen.answered || 0)} câu đã làm • ${Number(listen.correct || 0)} đúng`);
    set('progress-total-label', `${total} từ JLPT ${level}`);
    const fill = document.getElementById('progress-bar-fill');
    if (fill) fill.style.width = `${typingPercent}%`;
    set('progress-summary', total ? `Bạn đang học JLPT ${level}. Bài gõ đã hoàn thành ${typed}/${total}; luyện nghe đã làm ${Number(listen.answered || 0)} câu.` : 'Chưa có dữ liệu học tập.');
}

async function resetMyProgress() {
    if (!confirm('Xóa toàn bộ tiến trình học online của tài khoản này?')) return;
    if (!window.ghAuth?.deleteProgress) return;
    const ok = await window.ghAuth.deleteProgress();
    if (!ok) { alert('Không thể xóa tiến trình online. Hãy kiểm tra kết nối.'); return; }
    onlineProgressCache = {};
    currentLevel = '1';
    const select = document.getElementById('jlpt-level');
    if (select) select.value = '1';
    renderList(); initTyping(); renderCommunication(); updateProgressUI();
    alert('Đã xóa tiến trình online của tài khoản này.');
}

// ============================================================
// LUYỆN NGHE PHẢN XẠ - CHỌN CÂU ĐÚNG
// Không cần file âm thanh ngoài: dùng SpeechSynthesis của trình duyệt,
// vì vậy có thể chạy offline nếu thiết bị có giọng ja-JP.
// ============================================================
const LISTENING_BANK = [
  {
    "level": 1,
    "audio": "こんにちは。",
    "pinyin": "Konnichiwa.",
    "options": [
      "Xin chào.",
      "Cảm ơn.",
      "Tạm biệt.",
      "Xin lỗi."
    ],
    "correct": 0,
    "meaning": "Xin chào."
  },
  {
    "level": 1,
    "audio": "おはようございます。",
    "pinyin": "Ohayou gozaimasu.",
    "options": [
      "Chào buổi tối.",
      "Chào buổi sáng.",
      "Tạm biệt.",
      "Không có gì."
    ],
    "correct": 1,
    "meaning": "Chào buổi sáng."
  },
  {
    "level": 1,
    "audio": "ありがとうございます。",
    "pinyin": "Arigatou gozaimasu.",
    "options": [
      "Xin lỗi.",
      "Xin cảm ơn.",
      "Xin chào.",
      "Không."
    ],
    "correct": 1,
    "meaning": "Xin cảm ơn."
  },
  {
    "level": 1,
    "audio": "すみません。",
    "pinyin": "Sumimasen.",
    "options": [
      "Xin lỗi; xin phép.",
      "Cảm ơn.",
      "Tạm biệt.",
      "Vâng."
    ],
    "correct": 0,
    "meaning": "Xin lỗi; xin phép."
  },
  {
    "level": 1,
    "audio": "お元気ですか。",
    "pinyin": "Ogenki desu ka.",
    "options": [
      "Bạn tên gì?",
      "Bạn khỏe không?",
      "Bạn sống ở đâu?",
      "Bạn thích gì?"
    ],
    "correct": 1,
    "meaning": "Bạn khỏe không?"
  },
  {
    "level": 1,
    "audio": "私は学生です。",
    "pinyin": "Watashi wa gakusei desu.",
    "options": [
      "Tôi là giáo viên.",
      "Tôi là học sinh/sinh viên.",
      "Tôi là bác sĩ.",
      "Tôi là nhân viên."
    ],
    "correct": 1,
    "meaning": "Tôi là học sinh/sinh viên."
  },
  {
    "level": 1,
    "audio": "これは本です。",
    "pinyin": "Kore wa hon desu.",
    "options": [
      "Đây là sách.",
      "Đó là bàn.",
      "Đây là bút.",
      "Đây là nhà."
    ],
    "correct": 0,
    "meaning": "Đây là sách."
  },
  {
    "level": 1,
    "audio": "水を飲みます。",
    "pinyin": "Mizu o nomimasu.",
    "options": [
      "Tôi ăn cơm.",
      "Tôi uống nước.",
      "Tôi đọc sách.",
      "Tôi đi học."
    ],
    "correct": 1,
    "meaning": "Tôi uống nước."
  },
  {
    "level": 1,
    "audio": "学校へ行きます。",
    "pinyin": "Gakkou e ikimasu.",
    "options": [
      "Tôi về nhà.",
      "Tôi đi đến trường.",
      "Tôi đến ga.",
      "Tôi làm việc."
    ],
    "correct": 1,
    "meaning": "Tôi đi đến trường."
  },
  {
    "level": 1,
    "audio": "明日は休みです。",
    "pinyin": "Ashita wa yasumi desu.",
    "options": [
      "Hôm nay bận.",
      "Ngày mai được nghỉ.",
      "Hôm qua mưa.",
      "Tối nay học."
    ],
    "correct": 1,
    "meaning": "Ngày mai được nghỉ."
  },
  {
    "level": 1,
    "audio": "駅はどこですか。",
    "pinyin": "Eki wa doko desu ka.",
    "options": [
      "Nhà ga ở đâu?",
      "Bạn là ai?",
      "Cái này là gì?",
      "Mấy giờ rồi?"
    ],
    "correct": 0,
    "meaning": "Nhà ga ở đâu?"
  },
  {
    "level": 1,
    "audio": "いくらですか。",
    "pinyin": "Ikura desu ka.",
    "options": [
      "Bao nhiêu tuổi?",
      "Bao nhiêu tiền?",
      "Ở đâu?",
      "Ai vậy?"
    ],
    "correct": 1,
    "meaning": "Bao nhiêu tiền?"
  },
  {
    "level": 2,
    "audio": "日本語を勉強しています。",
    "pinyin": "Nihongo o benkyou shiteimasu.",
    "options": [
      "Tôi đang làm việc.",
      "Tôi đang học tiếng Nhật.",
      "Tôi đang ăn.",
      "Tôi đang ngủ."
    ],
    "correct": 1,
    "meaning": "Tôi đang học tiếng Nhật."
  },
  {
    "level": 2,
    "audio": "毎日練習します。",
    "pinyin": "Mainichi renshuu shimasu.",
    "options": [
      "Tôi luyện tập mỗi ngày.",
      "Tôi nghỉ mỗi ngày.",
      "Tôi đi du lịch mỗi ngày.",
      "Tôi đọc báo mỗi ngày."
    ],
    "correct": 0,
    "meaning": "Tôi luyện tập mỗi ngày."
  },
  {
    "level": 3,
    "audio": "予定を確認します。",
    "pinyin": "Yotei o kakunin shimasu.",
    "options": [
      "Tôi thay đổi kế hoạch.",
      "Tôi xác nhận lịch/kế hoạch.",
      "Tôi hủy cuộc hẹn.",
      "Tôi bắt đầu công việc."
    ],
    "correct": 1,
    "meaning": "Tôi xác nhận lịch/kế hoạch."
  },
  {
    "level": 3,
    "audio": "環境を守る必要があります。",
    "pinyin": "Kankyou o mamoru hitsuyou ga arimasu.",
    "options": [
      "Cần phát triển kinh tế.",
      "Cần bảo vệ môi trường.",
      "Cần học lịch sử.",
      "Cần tăng giá."
    ],
    "correct": 1,
    "meaning": "Cần phải bảo vệ môi trường."
  },
  {
    "level": 4,
    "audio": "社会に大きな影響を与えます。",
    "pinyin": "Shakai ni ookina eikyou o ataemasu.",
    "options": [
      "Gây ảnh hưởng lớn đến xã hội.",
      "Giúp đỡ gia đình.",
      "Thay đổi thời tiết.",
      "Tạo sản phẩm."
    ],
    "correct": 0,
    "meaning": "Gây ảnh hưởng lớn đến xã hội."
  },
  {
    "level": 4,
    "audio": "責任を果たす。",
    "pinyin": "Sekinin o hatasu.",
    "options": [
      "Từ chối trách nhiệm.",
      "Hoàn thành trách nhiệm.",
      "Tránh trách nhiệm.",
      "Tăng quyền hạn."
    ],
    "correct": 1,
    "meaning": "Hoàn thành trách nhiệm."
  },
  {
    "level": 5,
    "audio": "根拠を示す。",
    "pinyin": "Konkyo o shimesu.",
    "options": [
      "Đưa ra căn cứ.",
      "Che giấu bằng chứng.",
      "Thay đổi quan điểm.",
      "Giảm chi phí."
    ],
    "correct": 0,
    "meaning": "Đưa ra căn cứ."
  },
  {
    "level": 5,
    "audio": "曖昧な表現を避ける。",
    "pinyin": "Aimai na hyougen o sakeru.",
    "options": [
      "Tránh cách diễn đạt mơ hồ.",
      "Tăng tốc độ đọc.",
      "Bắt đầu cuộc họp.",
      "Giảm sản xuất."
    ],
    "correct": 0,
    "meaning": "Tránh cách diễn đạt mơ hồ."
  }
];

function initListening(){
  // TUYỆT ĐỐI KHÔNG tự phát khi mở tab Luyện nghe.
  // Hủy mọi giọng đọc còn sót lại từ tab trước.
  if ('speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch(e) {} }
  listeningWrongMode=false;
  const level=Number(document.getElementById('jlpt-level')?.value||1);
  if(!Array.isArray(LISTENING_BANK)||!LISTENING_BANK.length){ const h=document.getElementById('listening-hint'); if(h)h.textContent='Chưa tải được dữ liệu Luyện nghe. Hãy kiểm tra file script.js.'; return; }
  listeningQuestions=LISTENING_BANK.filter(x=>Number(x.level)===Math.max(1,level));
  listeningQuestions=listeningQuestions.map(q=>{ if(q.options&&q.options.length===4)return q; const pool=LISTENING_BANK.filter(x=>x!==q && x.level<=Math.max(1,level)); const ds=[...pool].sort(()=>Math.random()-0.5).slice(0,3); const opts=[q.audio,...ds.map(x=>x.audio)].sort(()=>Math.random()-0.5); return {...q,options:opts,correct:opts.indexOf(q.audio)}; });
  if(!listeningQuestions.length){ const h=document.getElementById('listening-hint'); if(h)h.textContent=`JLPT ${level} hiện chưa có dữ liệu Luyện nghe.`; const box=document.getElementById('listening-options'); if(box)box.innerHTML=''; return; }
  const recentKey='giangha_listening_recent_v2';
  let recent=[]; try { recent=JSON.parse(sessionStorage.getItem(recentKey)||'[]'); } catch(e){}
  const fresh=listeningQuestions.filter(q=>!recent.includes(q.audio));
  if(fresh.length >= Math.min(20,listeningQuestions.length)) listeningQuestions=fresh;
  listeningQuestions=[...listeningQuestions].sort(()=>Math.random()-0.5);
  listeningIndex=0; listeningScore=0; listeningAnswered=false; listeningSessionAnswered=0; listeningSessionCorrect=0;
  const cont=document.getElementById('listening-continue'); if(cont) cont.hidden=true;
  try { sessionStorage.setItem(recentKey, JSON.stringify(listeningQuestions.map(q=>q.audio))); } catch(e){}
  renderListeningQuestion();
}
function speakListeningSentence(){
  const q=listeningQuestions[listeningIndex]; if(!q) return;
  if(!('speechSynthesis' in window)){ const h=document.getElementById('listening-hint'); if(h) h.textContent='Thiết bị không hỗ trợ đọc tiếng Nhật.'; return; }
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(q.audio); u.lang='ja-JP'; u.rate=Number(document.getElementById('listening-speed')?.value||0.82); u.pitch=1;
  const voices=speechSynthesis.getVoices(); const v=voices.find(x=>/^zh-(CN|TW)/i.test(x.lang)); if(v) u.voice=v;
  speechSynthesis.speak(u);
}
function renderListeningQuestion(){
  const q=listeningQuestions[listeningIndex]; if(!q) return;
  listeningAnswered=false;
  document.getElementById('listening-round').textContent=`Câu ${listeningIndex+1} / ${listeningQuestions.length}`;
  document.getElementById('listening-level-label').textContent=`JLPT ${q.level}`;
  document.getElementById('listening-score').textContent=`${listeningScore} / ${listeningIndex}`;
  updateListeningProgressUI();
  document.getElementById('listening-feedback').textContent='';
  document.getElementById('listening-hint').textContent='Bấm “Nghe câu”, tập trung vào âm thanh rồi chọn một đáp án.';
  const next=document.getElementById('listening-next'); if(next) next.disabled=true;
  const box=document.getElementById('listening-options'); box.innerHTML='';
  q.options.forEach((text,i)=>{const b=document.createElement('button');b.type='button';b.className='listening-option';b.textContent=text;b.addEventListener('click',()=>checkListening(i));box.appendChild(b);});
}
function checkListening(choice){
  if(listeningAnswered) return; listeningAnswered=true;
  const q=listeningQuestions[listeningIndex]; const buttons=[...document.querySelectorAll('.listening-option')]; buttons.forEach(b=>b.disabled=true);
  listeningSessionAnswered++;
  const qMeaning = getListeningMeaning(q);
  const meaning = qMeaning ? `Nghĩa tiếng Việt: ${qMeaning}` : 'Nghĩa tiếng Việt: chưa có dữ liệu cho câu này.';
  if(choice===q.correct){ listeningScore++; listeningSessionCorrect++; buttons[choice].classList.add('correct'); document.getElementById('listening-feedback').innerHTML=`<strong>✓ Chính xác!</strong><div class="listening-meaning">${meaning}</div>`; document.getElementById('listening-feedback').style.color='#00a67d'; if(listeningWrongMode){ setWrongListening(getWrongListening().filter(x=>x.audio!==q.audio)); } }
  else { buttons[choice].classList.add('wrong'); buttons[q.correct].classList.add('correct'); document.getElementById('listening-feedback').innerHTML=`<strong>✗ Chưa đúng.</strong><div class="listening-answer">Đáp án: ${q.audio}</div><div class="listening-meaning">${meaning}</div>`; document.getElementById('listening-feedback').style.color='#d63031'; const wrong=getWrongListening().filter(x=>x.audio!==q.audio); wrong.push({audio:q.audio,pinyin:getListeningPinyin(q),meaning:getListeningMeaning(q),level:q.level}); setWrongListening(wrong); }
  document.getElementById('listening-score').textContent=`${listeningScore} / ${listeningIndex+1}`;
  saveListeningProgress();
  updateListeningProgressUI();
  const py=getListeningPinyin(q); document.getElementById('listening-hint').textContent=py?`Pinyin: ${py}`:'Nghe lại câu để kiểm tra cách phát âm.';
  document.getElementById('listening-next').disabled=false;
}
function startWrongListening(){
  if ('speechSynthesis' in window) { try { speechSynthesis.cancel(); } catch(e) {} }
  const saved = getWrongListening();
  const level = Number(document.getElementById('jlpt-level')?.value || currentLevel || 1);
  if (!saved.length) {
    const feedback = document.getElementById('listening-feedback');
    if (feedback) feedback.textContent = 'Hiện chưa có câu sai để ôn lại.';
    const panel = document.getElementById('listening-wrong-panel');
    if (panel) panel.hidden = false;
    updateWrongListeningUI();
    return;
  }

  const bank = Array.isArray(LISTENING_BANK) ? LISTENING_BANK : [];
  const questions = [];
  const used = new Set();

  for (const savedQ of saved) {
    if (!savedQ?.audio || used.has(String(savedQ.audio))) continue;
    used.add(String(savedQ.audio));

    const original = bank.find(q => q && q.audio === savedQ.audio);
    const baseLevel = Number(original?.level || savedQ.level || level);
    const source = original || {
      audio: String(savedQ.audio),
      pinyin: savedQ.pinyin || '',
      meaning: savedQ.meaning || getListeningMeaning(savedQ) || '',
      level: baseLevel
    };

    let options = Array.isArray(source.options) ? [...source.options] : [];
    if (options.length !== 4 || !options.includes(source.audio)) {
      const pool = bank.filter(q => q && q.audio !== source.audio && Number(q.level) === baseLevel);
      const fallbackPool = pool.length >= 3 ? pool : bank.filter(q => q && q.audio !== source.audio);
      const distractors = [...fallbackPool].sort(() => Math.random() - 0.5).slice(0, 3).map(q => q.audio);
      options = [source.audio, ...distractors];
    }

    options = [...new Set(options)].slice(0, 4);
    if (!options.includes(source.audio)) options.unshift(source.audio);
    options = options.slice(0, 4).sort(() => Math.random() - 0.5);

    questions.push({
      ...source,
      audio: source.audio,
      pinyin: source.pinyin || savedQ.pinyin || '',
      meaning: source.meaning || savedQ.meaning || getListeningMeaning(source),
      level: baseLevel,
      options,
      correct: options.indexOf(source.audio)
    });
  }

  if (!questions.length) {
    const feedback = document.getElementById('listening-feedback');
    if (feedback) feedback.textContent = 'Không thể tạo danh sách câu sai để ôn.';
    return;
  }

  listeningWrongMode = true;
  listeningQuestions = questions.sort(() => Math.random() - 0.5);
  listeningIndex = 0;
  listeningScore = 0;
  listeningAnswered = false;
  listeningSessionAnswered = 0;
  listeningSessionCorrect = 0;

  const nextBtn = document.getElementById('listening-next');
  if (nextBtn) nextBtn.disabled = true;
  const continueBtn = document.getElementById('listening-continue');
  if (continueBtn) { continueBtn.hidden = true; continueBtn.textContent = 'Ôn lại câu sai còn lại'; }
  const panel = document.getElementById('listening-wrong-panel');
  if (panel) panel.hidden = false;
  const feedback = document.getElementById('listening-feedback');
  if (feedback) feedback.textContent = `Bắt đầu ôn ${questions.length} câu sai.`;
  renderListeningQuestion();
}

function clearWrongListening(){
  const items = getWrongListening();
  if (!items.length) {
    updateWrongListeningUI();
    return;
  }
  if (!confirm('Bạn có chắc muốn xóa toàn bộ câu sai đã lưu không?')) return;
  try { localStorage.removeItem(LISTENING_WRONG_KEY); } catch(e) {}
  listeningWrongMode = false;
  updateWrongListeningUI();
  const panel = document.getElementById('listening-wrong-panel');
  if (panel) panel.hidden = false;
  const feedback = document.getElementById('listening-feedback');
  if (feedback) feedback.textContent = 'Đã xóa toàn bộ câu sai.';
}

function nextListeningQuestion(){
  if(!listeningAnswered) return;
  listeningIndex++;
  if(listeningIndex>=listeningQuestions.length){
    const total=listeningQuestions.length, pct=total?Math.round(listeningScore/total*100):0;
    const continueBtn=document.getElementById('listening-continue');
    const nextBtn=document.getElementById('listening-next');
    if(listeningWrongMode){
      const remaining=getWrongListening().length;
      document.getElementById('listening-feedback').textContent=remaining===0
        ? `Đã hoàn thành toàn bộ câu sai • ${listeningScore}/${total} đúng.`
        : `Đã ôn xong lượt này • ${listeningScore}/${total} đúng. Còn ${remaining} câu sai cần ôn lại.`;
      if(nextBtn) nextBtn.disabled=true;
      if(continueBtn){ continueBtn.hidden=false; continueBtn.textContent=remaining===0?'Tiếp tục luyện nghe':'Ôn lại câu sai còn lại'; }
    } else {
      document.getElementById('listening-feedback').textContent=`Hoàn thành ${total} câu • ${listeningScore} đúng (${pct}%).`;
      if(nextBtn) nextBtn.disabled=true;
      if(continueBtn) continueBtn.hidden=false;
    }
    saveListeningProgress();
    updateListeningProgressUI();
    return;
  }
  renderListeningQuestion();
}
function continueListening(){
  if(listeningWrongMode){
    const remaining=getWrongListening().length;
    if(remaining>0){ startWrongListening(); return; }
  }
  if('speechSynthesis' in window){try{speechSynthesis.cancel();}catch(e){}}
  const level=Number(document.getElementById('jlpt-level')?.value||1);
  listeningWrongMode=false;
  const base=LISTENING_BANK.filter(x=>Number(x.level)===Math.max(1,level));
  listeningQuestions=base.map(q=>{
    if(q.options&&q.options.length===4)return q;
    const pool=base.filter(x=>x!==q);
    const ds=[...pool].sort(()=>Math.random()-0.5).slice(0,3);
    const opts=[q.audio,...ds.map(x=>x.audio)].sort(()=>Math.random()-0.5);
    return {...q,options:opts,correct:opts.indexOf(q.audio)};
  }).sort(()=>Math.random()-0.5);
  if(!listeningQuestions.length)return;
  listeningIndex=0; listeningScore=0; listeningAnswered=false; listeningSessionAnswered=0; listeningSessionCorrect=0;
  const nextBtn=document.getElementById('listening-next'); if(nextBtn)nextBtn.disabled=true;
  const cont=document.getElementById('listening-continue'); if(cont){cont.hidden=true;cont.textContent='Tiếp tục luyện nghe';}
  const panel=document.getElementById('listening-wrong-panel'); if(panel)panel.hidden=false;
  renderListeningQuestion();
}

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('listening-play')?.addEventListener('click',speakListeningSentence);
  document.getElementById('listening-next')?.addEventListener('click',nextListeningQuestion);
  document.getElementById('listening-continue')?.addEventListener('click',continueListening);
  document.getElementById('listening-wrong-mode')?.addEventListener('click',startWrongListening);
  document.getElementById('listening-clear-wrong')?.addEventListener('click',clearWrongListening);
  updateWrongListeningUI();
});


/* ===== Premium Chines Dark Mode ===== */
(function initThemeMode() {
    const saved = localStorage.getItem('premiumChinesTheme');
    const dark = saved === 'dark';
    document.documentElement.classList.toggle('dark-mode', dark);
    document.body.classList.toggle('dark-mode', dark);
    updateThemeButton(dark);
})();

function updateThemeButton(dark) {
    const btn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-toggle-icon');
    const text = document.getElementById('theme-toggle-text');
    if (!btn) return;
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối');
    btn.setAttribute('title', dark ? 'Chế độ sáng' : 'Chế độ tối');
    const sun = document.getElementById('theme-sun');
    const moon = document.getElementById('theme-moon');
    if (sun) sun.setAttribute('aria-hidden', dark ? 'true' : 'false');
    if (moon) moon.setAttribute('aria-hidden', dark ? 'false' : 'true');
    if (icon) icon.textContent = dark ? '🌙' : '☀️';
    if (text) text.textContent = dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';
}

function toggleDarkMode() {
    const dark = !document.body.classList.contains('dark-mode');
    document.documentElement.classList.toggle('dark-mode', dark);
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem('premiumChinesTheme', dark ? 'dark' : 'light');
    updateThemeButton(dark);
    if (typeof applyQuizOptionColors === 'function') applyQuizOptionColors();
}

window.toggleDarkMode = toggleDarkMode;

/* ===== Premium Chines UI Effects ===== */
(function premiumUIEffects(){
  const init=()=>{
    document.querySelectorAll('button').forEach(btn=>{
      if(btn.dataset.premiumRipple==='1') return;
      btn.dataset.premiumRipple='1';
      btn.addEventListener('click',function(e){
        if(this.disabled) return;
        const rect=this.getBoundingClientRect();
        const size=Math.max(rect.width,rect.height)*.55;
        const wave=document.createElement('span');
        wave.className='ripple-wave';
        wave.style.width=wave.style.height=size+'px';
        wave.style.left=(e.clientX-rect.left-size/2)+'px';
        wave.style.top=(e.clientY-rect.top-size/2)+'px';
        this.appendChild(wave);
        wave.addEventListener('animationend',()=>wave.remove(),{once:true});
      });
    });

    const reveal=()=>{
      document.querySelectorAll('.word-card,.progress-card,.progress-main-card,.typing-container,.exam-card,.listening-card,.communication-card,.card').forEach((el,i)=>{
        if(el.dataset.premiumReveal==='1') return;
        el.dataset.premiumReveal='1';
        el.style.animationDelay=Math.min(i*35,280)+'ms';
      });
    };
    reveal();

    const observer=new MutationObserver(reveal);
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),12000);
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
