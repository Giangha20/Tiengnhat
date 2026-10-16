export interface AvatarOption {
  id: string;
  name: string;
  nameJa: string;
  src: string;
  emoji: string;
  description: string;
}

export const JAPAN_AVATARS: AvatarOption[] = [
  {
    id: 'sakura',
    name: 'Hoa Anh Đào',
    nameJa: '桜 (Sakura)',
    src: '/images/avatars/sakura.png',
    emoji: '🌸',
    description: 'Biểu tượng của vẻ đẹp thanh tao, khởi đầu mới và mùa xuân Nhật Bản.',
  },
  {
    id: 'fuji',
    name: 'Núi Phú Sĩ',
    nameJa: '富士山 (Fujisan)',
    src: '/images/avatars/fuji.png',
    emoji: '🗻',
    description: 'Ngọn núi linh thiêng và là biểu tượng vĩ đại nhất của xứ sở Phù Tang.',
  },
  {
    id: 'torii',
    name: 'Cổng Torii Thần Đạo',
    nameJa: '鳥居 (Torii)',
    src: '/images/avatars/torii.png',
    emoji: '⛩️',
    description: 'Cánh cổng kết nối thế giới thực tại với chốn bình an linh thiêng.',
  },
  {
    id: 'maneki-neko',
    name: 'Mèo Thần Tài',
    nameJa: '招き猫 (Maneki Neko)',
    src: '/images/avatars/maneki-neko.png',
    emoji: '🐱',
    description: 'Chú mèo vẫy tay mang lại may mắn, thịnh vượng và động lực học tập.',
  },
  {
    id: 'samurai',
    name: 'Chiến Binh Samurai',
    nameJa: '侍 (Samurai)',
    src: '/images/avatars/samurai.png',
    emoji: '⚔️',
    description: 'Tinh thần võ sĩ đạo kiên cường, kỷ luật và quyết tâm chinh phục JLPT.',
  },
  {
    id: 'ninja',
    name: 'Nhẫn Giả Ninja',
    nameJa: '忍者 (Ninja)',
    src: '/images/avatars/ninja.png',
    emoji: '🥷',
    description: 'Nhanh nhẹn, tập trung cao độ và rèn luyện kỹ năng âm thầm vượt bậc.',
  },
  {
    id: 'daruma',
    name: 'Búp Bê May Mắn Daruma',
    nameJa: 'だるま (Daruma)',
    src: '/images/avatars/daruma.png',
    emoji: '🏮',
    description: 'Biểu tượng của sự kiên trì không bao giờ bỏ cuộc - ngã 7 lần, đứng dậy 8 lần.',
  },
  {
    id: 'shiba',
    name: 'Chú Chó Shiba Inu',
    nameJa: '柴犬 (Shiba Inu)',
    src: '/images/avatars/shiba.png',
    emoji: '🐕',
    description: 'Giống chó quốc bảo thông minh, trung thành và vô cùng đáng yêu.',
  },
  {
    id: 'matcha',
    name: 'Trà Đạo Matcha',
    nameJa: '抹茶 (Matcha)',
    src: '/images/avatars/matcha.png',
    emoji: '🍵',
    description: 'Hương vị trà thanh mát, tĩnh tâm tập trung trí não tối đa khi học tập.',
  },
  {
    id: 'ramen',
    name: 'Tô Mì Ramen Thơm Ngon',
    nameJa: 'ラーメン (Ramen)',
    src: '/images/avatars/ramen.png',
    emoji: '🍜',
    description: 'Món ăn quốc dân tiếp thêm năng lượng tràn trề cho những giờ ôn bài.',
  },
  {
    id: 'origami',
    name: 'Hạc Giấy Origami',
    nameJa: '折り紙 (Origami)',
    src: '/images/avatars/origami.png',
    emoji: '🕊️',
    description: 'Nghệ thuật gấp giấy tinh tế tượng trưng cho điều ước và hòa bình.',
  },
  {
    id: 'kimono',
    name: 'Trang Phục Kimono',
    nameJa: '着物 (Kimono)',
    src: '/images/avatars/kimono.png',
    emoji: '👘',
    description: 'Quốc phục truyền thống duyên dáng, đậm đà bản sắc văn hóa Nhật Bản.',
  },
];

export const DEFAULT_AVATAR = JAPAN_AVATARS[0].src;
