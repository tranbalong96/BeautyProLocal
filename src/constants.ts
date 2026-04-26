import { IndustryType, Service } from './lib/types';

export const INDUSTRY_LABELS: Record<IndustryType, { text: string; emoji: string }> = {
  nail: { text: 'Nail', emoji: '💅' },
  spa: { text: 'Spa', emoji: '🧖' },
  makeup: { text: 'Makeup', emoji: '💄' },
  mi: { text: 'Mi mắt', emoji: '👁️' },
  toc: { text: 'Tóc', emoji: '✂️' },
  wax: { text: 'Waxing', emoji: '🌸' },
  facial: { text: 'Facial', emoji: '🫧' },
  other: { text: 'Làm đẹp', emoji: '✨' },
};

export const SEED_DATA: Record<string, Partial<Service>[]> = {
  nail: [
    { name: 'Sơn thường', type: 'service', price: 50000, dur: 30, desc: 'Sơn màu thường' },
    { name: 'Sơn gel', type: 'service', price: 120000, dur: 45, desc: 'Sơn gel bền màu' },
    { name: 'Đắp bột', type: 'service', price: 200000, dur: 90, desc: 'Đắp bột acrylic' },
    { name: 'Vẽ móng', type: 'service', price: 80000, dur: 30, desc: 'Vẽ hoạ tiết' },
    { name: 'Làm móng chân', type: 'service', price: 100000, dur: 45, desc: 'Cắt, giũa, sơn' },
    { name: 'Combo tay + chân', type: 'combo', price: 350000, dur: 90, desc: 'Sơn gel tay và chân' },
    { name: 'Combo cô dâu', type: 'combo', price: 500000, dur: 120, desc: 'Tay + chân + vẽ nghệ thuật' },
  ],
  spa: [
    { name: 'Massage thư giãn', type: 'service', price: 250000, dur: 60, desc: 'Massage toàn thân' },
    { name: 'Massage đá nóng', type: 'service', price: 400000, dur: 90, desc: 'Đá nóng núi lửa' },
    { name: 'Tắm trắng', type: 'service', price: 300000, dur: 60, desc: 'Tắm trắng toàn thân' },
    { name: 'Chăm sóc da mặt', type: 'service', price: 200000, dur: 60, desc: 'Làm sạch, dưỡng ẩm' },
    { name: 'Gói thư giãn 2h', type: 'combo', price: 600000, dur: 120, desc: 'Massage + chăm sóc da' },
    { name: 'Gói VIP', type: 'combo', price: 1200000, dur: 180, desc: 'Đầy đủ liệu trình spa' },
  ],
  makeup: [
    { name: 'Makeup dự tiệc', type: 'service', price: 350000, dur: 60, desc: 'Trang điểm tiệc tùng' },
    { name: 'Makeup cô dâu', type: 'service', price: 800000, dur: 90, desc: 'Trang điểm cô dâu chuyên nghiệp' },
  ],
  toc: [
    { name: 'Cắt tóc nữ', type: 'service', price: 100000, dur: 45, desc: 'Cắt, tạo kiểu' },
    { name: 'Uốn tóc', type: 'service', price: 400000, dur: 120, desc: 'Uốn xoăn/thẳng' },
    { name: 'Nhuộm tóc', type: 'service', price: 500000, dur: 150, desc: 'Nhuộm màu thời trang' },
    { name: 'Gội + sấy + tạo kiểu', type: 'service', price: 150000, dur: 60, desc: 'Gội đầu + tạo kiểu' },
  ],
};
