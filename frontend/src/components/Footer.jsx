import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerInner}>
                <div>
                    <h4>Về Basic Color</h4>
                    <ul>
                        <li><a href="#">Câu chuyện thương hiệu</a></li>
                        <li><a href="#">Tuyển dụng</a></li>
                        <li><a href="#">Liên hệ</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Hỗ trợ khách hàng</h4>
                    <ul>
                        <li><a href="#">Chính sách đổi trả</a></li>
                        <li><a href="#">Hướng dẫn chọn size</a></li>
                        <li><a href="#">Phí vận chuyển</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Studio</h4>
                    <ul>
                        <li><a href="#">In logo doanh nghiệp</a></li>
                        <li><a href="#">Đặt hàng số lượng lớn</a></li>
                        <li><a href="#">Báo giá</a></li>
                    </ul>
                </div>
                <div>
                    <h4>Đăng ký nhận tin</h4>
                    <p>Nhận thông tin về bộ sưu tập màu mới nhất.</p>
                    <div className={styles.footerEmail}>
                        <input type="email" placeholder="Email của bạn..." />
                        <button>Gửi</button>
                    </div>
                </div>
            </div>
            <div className={styles.footerBottom}>
                © 2024 Basic Color Inc. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
