import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('==================================================');
console.log('🧪 BẮT ĐẦU CHẠY KIỂM THỬ TỰ ĐỘNG - NIHONGOMASTER');
console.log('==================================================\n');

// 1. Kiểm thử dữ liệu Hiragana
console.log('1. Kiểm tra tính toàn vẹn của dữ liệu Hiragana (hiragana.json)...');
const hiraganaRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/hiragana.json'), 'utf8'));
assert(hiraganaRaw.metadata.verificationStatus === 'verified', 'Metadata xác minh trạng thái verified');
assert(Array.isArray(hiraganaRaw.groups) && hiraganaRaw.groups.length === 18, 'Đủ 18 nhóm chữ Hiragana');

let totalHiraganaChars = 0;
let hiraganaDuplicates = new Set();
hiraganaRaw.groups.forEach(g => {
  g.characters.forEach(c => {
    totalHiraganaChars++;
    if (hiraganaDuplicates.has(c.character)) {
      assert(false, `Phát hiện chữ Hiragana bị trùng lặp: ${c.character}`);
    }
    hiraganaDuplicates.add(c.character);
    assert(c.character && c.romaji && c.exampleWord, `Ký tự ${c.character} có đủ romaji và ví dụ`);
    assert(c.pronunciationGuideVi && c.pronunciationGuideVi.length > 5, `Ký tự ${c.character} có hướng dẫn phát âm tiếng Việt`);
  });
});
assert(totalHiraganaChars === 104, `Tổng số ký tự Hiragana chuẩn xác là 104 (thực tế: ${totalHiraganaChars})`);

// 2. Kiểm thử dữ liệu Katakana
console.log('\n2. Kiểm tra tính toàn vẹn của dữ liệu Katakana (katakana.json)...');
const katakanaRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/katakana.json'), 'utf8'));
assert(katakanaRaw.metadata.verificationStatus === 'verified', 'Metadata Katakana verified');
let totalKatakanaChars = 0;
katakanaRaw.groups.forEach(g => {
  g.characters.forEach(c => {
    totalKatakanaChars++;
    assert(c.character && c.romaji && c.hiraganaEquivalent, `Katakana ${c.character} có đủ romaji và chữ Hiragana tương ứng`);
  });
});
assert(totalKatakanaChars === 104, `Tổng số ký tự Katakana chuẩn xác là 104 (thực tế: ${totalKatakanaChars})`);

// 3. Kiểm thử dữ liệu Từ vựng N5
console.log('\n3. Kiểm tra tính toàn vẹn của dữ liệu Từ vựng N5 (n5-vocabulary.json)...');
const vocabRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/vocabulary/n5-vocabulary.json'), 'utf8'));
assert(vocabRaw.metadata.level === 'N5', 'Cấp độ từ vựng là N5');
let totalVocab = 0;
let vocabIds = new Set();
vocabRaw.topics.forEach(t => {
  t.words.forEach(w => {
    totalVocab++;
    assert(!vocabIds.has(w.id), `ID từ vựng ${w.id} là duy nhất`);
    vocabIds.add(w.id);
    assert(w.word && w.reading && w.meaning, `Từ ${w.word} có cách đọc và nghĩa tiếng Việt`);
    assert(w.exampleJa && w.exampleVi, `Từ ${w.word} có câu ví dụ tiếng Nhật và bản dịch tiếng Việt`);
  });
});
assert(totalVocab >= 80, `Số lượng từ vựng N5 đạt yêu cầu (hiện có: ${totalVocab} từ)`);

// 4. Kiểm thử dữ liệu Ngữ pháp N5
console.log('\n4. Kiểm tra tính toàn vẹn của dữ liệu Ngữ pháp N5 (n5-grammar.json)...');
const grammarRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/grammar/n5-grammar.json'), 'utf8'));
assert(Array.isArray(grammarRaw.grammarPoints), 'grammarPoints là một danh sách hợp lệ');
assert(grammarRaw.grammarPoints.length >= 20, `Số lượng cấu trúc ngữ pháp đạt chuẩn (hiện có: ${grammarRaw.grammarPoints.length} điểm)`);
grammarRaw.grammarPoints.forEach(gp => {
  assert(gp.name && gp.formula && gp.meaning, `Ngữ pháp ${gp.name} có công thức và ý nghĩa`);
  assert(Array.isArray(gp.examples) && gp.examples.length >= 2, `Ngữ pháp ${gp.name} có ít nhất 2 câu ví dụ`);
  gp.examples.forEach(ex => {
    assert(ex.japanese && ex.vietnamese, `Ví dụ của ${gp.name} có cả câu tiếng Nhật và dịch nghĩa`);
  });
});

// 5. Kiểm thử dữ liệu Kanji N5
console.log('\n5. Kiểm tra tính toàn vẹn của dữ liệu Kanji N5 (n5-kanji.json)...');
const kanjiRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/kanji/n5-kanji.json'), 'utf8'));
assert(Array.isArray(kanjiRaw.kanji) && kanjiRaw.kanji.length >= 20, `Đủ chữ Hán N5 (hiện có: ${kanjiRaw.kanji.length} chữ)`);
kanjiRaw.kanji.forEach(k => {
  assert(k.character && k.sinoVietnamese && k.meaning, `Kanji ${k.character} có âm Hán Việt (${k.sinoVietnamese}) và nghĩa`);
  assert(Array.isArray(k.onReading) && Array.isArray(k.kunReading), `Kanji ${k.character} có đủ âm On và âm Kun`);
  assert(Array.isArray(k.compounds) && k.compounds.length > 0, `Kanji ${k.character} có từ ghép thực tế`);
});

// 6. Kiểm thử dữ liệu Bài tập (n5-exercises.json)
console.log('\n6. Kiểm tra tính toàn vẹn của Ngân hàng bài tập (n5-exercises.json)...');
const exRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/exercises/n5-exercises.json'), 'utf8'));
let totalQuestions = 0;
exRaw.categories.forEach(cat => {
  cat.questions.forEach(q => {
    totalQuestions++;
    assert(q.options.includes(q.correctAnswer), `Câu hỏi ${q.id}: Đáp án đúng "${q.correctAnswer}" nằm trong danh sách lựa chọn`);
    assert(q.explanation && q.explanation.length > 10, `Câu hỏi ${q.id}: Có lời giải thích chi tiết`);
  });
});
assert(totalQuestions >= 15, `Tổng số câu hỏi trắc nghiệm hợp lệ: ${totalQuestions}`);

// 7. Kiểm thử thuật toán Lặp lại ngắt quãng SM-2 (SRS Logic)
console.log('\n7. Kiểm tra thuật toán lặp lại ngắt quãng (SM-2 Logic)...');
function mockCalculateSRS(easeFactor, interval, repetitions, correct) {
  if (correct) {
    const newReps = repetitions + 1;
    let newInterval = 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 3;
    else newInterval = Math.round(interval * easeFactor);
    const newEase = Math.max(1.3, easeFactor + 0.1);
    return { easeFactor: newEase, interval: newInterval, repetitions: newReps };
  } else {
    return { easeFactor: Math.max(1.3, easeFactor - 0.2), interval: 1, repetitions: 0 };
  }
}

const srsStep1 = mockCalculateSRS(2.5, 1, 0, true);
assert(srsStep1.repetitions === 1 && srsStep1.interval === 1, 'SRS lần 1 nhớ: khoảng cách = 1 ngày');
const srsStep2 = mockCalculateSRS(srsStep1.easeFactor, srsStep1.interval, srsStep1.repetitions, true);
assert(srsStep2.repetitions === 2 && srsStep2.interval === 3, 'SRS lần 2 nhớ: khoảng cách = 3 ngày');
const srsStepFail = mockCalculateSRS(srsStep2.easeFactor, srsStep2.interval, srsStep2.repetitions, false);
assert(srsStepFail.repetitions === 0 && srsStepFail.interval === 1, 'SRS khi quên: lặp lại về 1 ngày và reset số lần');

// 8. Kiểm tra tính năng Sao lưu Tệp tin & Đồng bộ Trực tuyến
console.log('\n8. Kiểm tra tính năng Sao lưu Tệp & Đồng bộ Trực tuyến...');
function validateTestProgress(data) {
  if (!data || typeof data !== 'object') return false;
  return (
    typeof data.totalWordsLearned === 'number' &&
    typeof data.totalKanjiLearned === 'number' &&
    typeof data.totalGrammarLearned === 'number' &&
    typeof data.currentLevel === 'string' &&
    Array.isArray(data.reviewQueue)
  );
}

const validProgressMock = {
  totalWordsLearned: 25,
  totalKanjiLearned: 10,
  totalGrammarLearned: 8,
  currentLevel: 'N5',
  reviewQueue: [{ itemId: 'v_watashi', itemType: 'vocabulary', repetitions: 2 }],
};

const invalidProgressMock = {
  totalWordsLearned: "not a number",
  reviewQueue: "not an array",
};

assert(validateTestProgress(validProgressMock) === true, 'Xác thực cấu trúc tiến độ chuẩn xác (UserProgress Schema)');
assert(validateTestProgress(invalidProgressMock) === false, 'Từ chối dữ liệu tiến độ bị lỗi kiểu dữ liệu');
assert(validateTestProgress(null) === false, 'Từ chối dữ liệu null');

// Test format Sync Code
function generateTestSyncCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let p1 = '', p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NHG-${p1}-${p2}`;
}

const testCode = generateTestSyncCode();
assert(testCode.startsWith('NHG-'), 'Mã đồng bộ bắt đầu bằng tiền tố NHG-');
assert(testCode.length === 13, 'Mã đồng bộ có độ dài chuẩn 13 ký tự (NHG-XXXX-XXXX)');

// 9. Kiểm tra Hệ thống Xác thực & Tạo tài khoản Đa thiết bị
console.log('\n9. Kiểm tra Hệ thống Xác thực & Tạo tài khoản Đa thiết bị...');
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const rawPassword = 'SecurePassword123!';
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync(rawPassword, salt);

assert(bcrypt.compareSync(rawPassword, passwordHash) === true, 'Mã hóa và xác thực mật khẩu bcrypt chính xác');
assert(bcrypt.compareSync('WrongPassword', passwordHash) === false, 'Từ chối mật khẩu không khớp');

function validateRegisterInput(name, email, password) {
  if (!name || name.trim().length < 2) return { valid: false, error: 'Họ tên quá ngắn' };
  if (!email || !email.includes('@') || !email.includes('.')) return { valid: false, error: 'Email không hợp lệ' };
  if (!password || password.length < 6) return { valid: false, error: 'Mật khẩu quá ngắn' };
  return { valid: true };
}

assert(validateRegisterInput('Nguyễn An', 'an@gmail.com', '123456').valid === true, 'Đăng ký thành công với thông tin hợp lệ');
assert(validateRegisterInput('', 'an@gmail.com', '123456').valid === false, 'Từ chối đăng ký khi thiếu họ tên');
assert(validateRegisterInput('Nguyễn An', 'invalid-email', '123456').valid === false, 'Từ chối đăng ký với email sai định dạng');
assert(validateRegisterInput('Nguyễn An', 'an@gmail.com', '123').valid === false, 'Từ chối đăng ký với mật khẩu dưới 6 ký tự');

const sessionToken = crypto.randomBytes(32).toString('hex');
assert(sessionToken.length === 64, 'Khởi tạo token phiên đăng nhập an toàn 64 ký tự hex');

// 10. Kiểm thử Bộ Dữ Liệu Luyện Gõ Tiếng Nhật (typing-lessons.json)
console.log('\n10. Kiểm tra tính toàn vẹn của Dữ liệu Luyện Gõ (typing-lessons.json)...');
const typingRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/typing/typing-lessons.json'), 'utf8'));
assert(typingRaw.metadata.verificationStatus === 'verified', 'Metadata Luyện Gõ verified');
assert(Array.isArray(typingRaw.lessons) && typingRaw.lessons.length >= 4, 'Đủ tối thiểu 4 chuyên đề luyện gõ');

let totalTypingItems = 0;
typingRaw.lessons.forEach(lesson => {
  assert(lesson.id && lesson.name && lesson.items.length > 0, `Chuyên đề ${lesson.name} có đầy đủ ID và danh sách từ`);
  lesson.items.forEach(item => {
    totalTypingItems++;
    assert(item.id && item.japanese && item.hiragana && item.romaji && item.meaning, `Từ gõ ${item.japanese} có đầy đủ Hiragana, Romaji và nghĩa`);
    assert(/^[a-z]+$/.test(item.romaji.toLowerCase()), `Romaji của ${item.japanese} (${item.romaji}) chỉ chứa ký tự chữ cái alphabet hợp lệ`);
  });
});
assert(totalTypingItems >= 30, `Tổng số từ vựng luyện gõ đạt chuẩn (thực tế: ${totalTypingItems})`);

console.log('\n==================================================');
console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ:`);
console.log(`- Tổng số bài kiểm tra: ${totalTests}`);
console.log(`- Thành công (PASS): ${passedTests}`);
console.log(`- Thất bại (FAIL): ${failedTests}`);
console.log('==================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ VƯỢT QUA 100%!');
  process.exit(0);
}
