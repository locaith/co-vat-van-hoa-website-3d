// Museum manifest — single source of placements. Artifact truth lives in artifacts-data.js (one ID everywhere).
// displayType: plinth | vitrine | niche | table. lightingProfile: hero | standard | soft.
// To swap a demo model with a real scan later: set model_url on the artifact record; museum loads GLB instead of procedural.
window.DS_MUSEUM = {
  rooms: [
    { id: 'hall', vi: 'Đại sảnh', en: 'Grand Hall', x: [-9, 9], z: [-8, 8] },
    { id: 'corridor', vi: 'Hành lang thời gian', en: 'Timeline Corridor', x: [-2, 2], z: [-16, -8] },
    { id: 'ceramics', vi: 'Phòng Gốm Việt', en: 'Ceramics Gallery', x: [-11, 11], z: [-40, -16] },
    { id: 'digital', vi: 'Tri thức số', en: 'Digital Heritage', x: [-7, 7], z: [-54, -40] }
  ],
  placements: [
    { room: 'hall', artifactId: 'DS-001', pos: [0, 0, -2.5], displayType: 'plinth', scale: 1.05, lightingProfile: 'hero', zone: null },
    { room: 'ceramics', artifactId: 'DS-003', pos: [0, 0, -21], displayType: 'vitrine', scale: 0.8, lightingProfile: 'hero', zone: 'HOA VĂN' },
    { room: 'ceramics', artifactId: 'DS-007', pos: [0, 0, -28], displayType: 'plinth', scale: 0.85, lightingProfile: 'hero', zone: 'MEN' },
    { room: 'ceramics', artifactId: 'DS-010', pos: [0, 0, -35], displayType: 'vitrine', scale: 0.85, lightingProfile: 'hero', zone: 'MEN' },
    { room: 'ceramics', artifactId: 'DS-002', pos: [-9.7, 0, -19.5], rotY: Math.PI / 2, displayType: 'niche', scale: 0.6, lightingProfile: 'standard', zone: 'ĐẤT' },
    { room: 'ceramics', artifactId: 'DS-004', pos: [-9.4, 0, -25], rotY: Math.PI / 2, displayType: 'plinth', scale: 0.7, lightingProfile: 'standard', zone: 'BÀN TAY' },
    { room: 'ceramics', artifactId: 'DS-005', pos: [-9.4, 0, -31], rotY: Math.PI / 2, displayType: 'plinth', scale: 0.7, lightingProfile: 'standard', zone: 'LỬA' },
    { room: 'ceramics', artifactId: 'DS-008', pos: [-9.7, 0, -36.5], rotY: Math.PI / 2, displayType: 'niche', scale: 0.55, lightingProfile: 'soft', zone: 'ĐỜI SỐNG' },
    { room: 'ceramics', artifactId: 'DS-009', pos: [9.7, 0, -19.5], rotY: -Math.PI / 2, displayType: 'niche', scale: 0.6, lightingProfile: 'standard', zone: 'THỜI GIAN' },
    { room: 'ceramics', artifactId: 'DS-006', pos: [9.4, 0, -25], rotY: -Math.PI / 2, displayType: 'plinth', scale: 0.75, lightingProfile: 'standard', zone: 'THỜI GIAN' },
    { room: 'ceramics', artifactId: 'DS-011', pos: [9.4, 0, -31], rotY: -Math.PI / 2, displayType: 'plinth', scale: 0.8, lightingProfile: 'standard', zone: 'ĐỜI SỐNG' },
    { room: 'ceramics', artifactId: 'DS-012', pos: [9.4, 0, -36.5], rotY: -Math.PI / 2, displayType: 'table', scale: 0.9, lightingProfile: 'soft', zone: 'ĐỜI SỐNG' }
  ],
  zones: [
    { vi: 'ĐẤT', en: 'EARTH', wall: 'west', z: -19.5 }, { vi: 'BÀN TAY', en: 'HANDS', wall: 'west', z: -25 },
    { vi: 'LỬA', en: 'FIRE', wall: 'west', z: -31 }, { vi: 'ĐỜI SỐNG', en: 'LIFE', wall: 'east', z: -31 },
    { vi: 'MEN', en: 'GLAZE', wall: 'north', z: -28 }, { vi: 'THỜI GIAN', en: 'TIME', wall: 'east', z: -22 }
  ],
  timeline: ['Lý', 'Trần', 'Lê sơ', 'Mạc', 'Lê Trung Hưng', 'Nguyễn'],
  tour: [
    { pos: [0, 0, 3.4], look: [0, 1.3, -2.5], vi: 'Chào mừng tới Đại sảnh. Toàn bộ hiện vật trong bảo tàng là bản thể số minh họa — kiến trúc dữ liệu đã sẵn sàng cho hiện vật quét thật.', en: 'Welcome to the Grand Hall. Every object here is an illustrative digital twin — the data architecture is ready for real scanned artifacts.' },
    { pos: [0, 0, -1], look: [0, 1.35, -2.5], vi: 'Bình gốm men ngọc — hiện vật trung tâm của bản demo. Lại gần bất kỳ hiện vật nào và nhấn E để mở chế độ nghiên cứu.', en: 'The celadon jar — hero object of this demo. Approach any exhibit and press E to open research mode.' },
    { pos: [0, 0, -12], look: [-2, 1.5, -12.5], vi: 'Hành lang thời gian: sáu giai đoạn lớn của gốm Việt. Chạm một mốc để tô sáng các hiện vật liên quan.', en: 'The timeline corridor: six major periods of Vietnamese ceramics. Click a marker to highlight related objects.' },
    { pos: [0, 0, -24.5], look: [0, 1.2, -28], vi: 'Phòng Gốm Việt — mười hai bản thể số theo tám chủ đề giám tuyển: đất, bàn tay, lửa, men, hoa văn, đời sống, thời gian.', en: 'The Ceramics Gallery — twelve digital objects across curated themes: earth, hands, fire, glaze, decoration, life, time.' },
    { pos: [9.0, 0, -34], look: [9.4, 1.0, -36.5], vi: 'Bàn nghiên cứu: hiện vật đời sống dân gian được đặt ngang tầm tay như trong kho mở của bảo tàng.', en: 'The research table: everyday-life objects placed at hand height, like a museum open storage.' },
    { pos: [0, 0, -43.5], look: [0, 1.3, -47], vi: 'Phòng Tri thức số: nơi vật thể trở thành dữ liệu, bằng chứng và tri thức. Kiosk AI phía trước mô phỏng tra cứu bằng ngôn ngữ tự nhiên.', en: 'The Digital Heritage room: where objects become data, evidence and knowledge. The AI kiosk ahead simulates natural-language search.' }
  ]
};
