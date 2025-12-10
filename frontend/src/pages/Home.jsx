import React from 'react';
import styles from './Home.module.css';
import ProductCard from '../components/ProductCard';

const Home = () => {
  // Mock data for products
  const products = [
    {
      name: 'Basic Tee – Regular Fit',
      price: '249.000đ',
      brand: 'basic color',
      colors: ['#f5f5f5', '#111111', '#d7c4a8'],
      label: 'Trắng',
      imageColor: '#f5f5f5' // Placeholder
    },
    {
      name: 'Oversized Tee – Sand',
      price: '299.000đ',
      brand: 'basic color',
      colors: ['#d7c4a8', '#6b7a4c'],
      label: 'Be',
      imageColor: '#d7c4a8' // Placeholder
    },
    {
      name: 'Heavyweight Tee – Olive',
      price: '349.000đ',
      brand: 'basic color',
      colors: ['#6b7a4c', '#111111'],
      label: 'Olive',
      imageColor: '#6b7a4c' // Placeholder
    },
    {
      name: 'Basic Polo – Navy',
      price: '399.000đ',
      brand: 'basic color',
      colors: ['#1e335a', '#ffffff'],
      label: 'Navy',
      imageColor: '#1e335a' // Placeholder
    }
  ];

  return (
    <div className={styles.home}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroTag}>everyday · minimal · brandable</div>
          <div className={styles.heroTitle}>
            Basic Color – Áo quần đơn sắc, <span>mang thương hiệu của bạn.</span>
          </div>
          <p className={styles.heroDesc}>
            Những thiết kế cơ bản, phom dáng đơn giản, trở thành canvas hoàn hảo
            để bạn đặt logo, thông điệp và câu chuyện thương hiệu của riêng mình.
          </p>
          <div className={styles.heroButtons}>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>Khám phá sản phẩm</button>
            <button className={`${styles.btn} ${styles.btnOutline}`}>Vào Studio Thương Hiệu ✨</button>
          </div>
          <div className={styles.heroColors}>
            <div className={styles.heroColorDot} style={{ background: '#111111' }}></div>
            <div className={styles.heroColorDot} style={{ background: '#d7c4a8' }}></div>
            <div className={styles.heroColorDot} style={{ background: '#22427a' }}></div>
            <div className={styles.heroColorDot} style={{ background: '#f6f6f6' }}></div>
            <span>4 tone màu bán chạy tuần này</span>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.heroBgBlock}></div>
          <div className={styles.heroCard}>
            <div className={styles.heroCardTitle}>STUDIO THƯƠNG HIỆU</div>
            <div className={styles.heroPreview}>
              <div className={styles.heroShirt}>
                <div className={styles.heroShirtBg}></div>
                <div className={styles.heroLogoPill}>your logo here</div>
              </div>
              <div className={styles.heroMiniText}>
                Upload logo thương hiệu và xem trước trực tiếp trên áo basic.
              </div>
            </div>
            <div className={styles.heroCardControls}>
              <div className={styles.uploadBtn}>
                <div>⬆ Upload logo của bạn</div>
                <div className={styles.uploadNote}>PNG nền trong suốt sẽ đẹp hơn</div>
              </div>
              <div className={styles.cardSelectRow}>
                <select defaultValue="Vị trí: Ngực trái">
                  <option>Vị trí: Ngực trái</option>
                  <option>Vị trí: Giữa ngực</option>
                  <option>Vị trí: Tay áo</option>
                </select>
                <select defaultValue="Màu áo: Trắng">
                  <option>Màu áo: Trắng</option>
                  <option>Đen</option>
                  <option>Be</option>
                  <option>Navy</option>
                </select>
              </div>
              <button className={styles.cardCta}>Vào Studio chi tiết</button>
            </div>
          </div>
        </div>
      </section>

      {/* COLOR STRIP */}
      <section className={styles.section} style={{ paddingTop: '24px' }}>
        <div className={styles.sectionInner}>
          <div className={styles.stripHeader}>
            <div className={styles.stripTitle}>Bộ sưu tập theo màu</div>
            <a href="#" className={styles.stripLink}>Xem tất cả</a>
          </div>
          <div className={styles.colorGrid}>
            <div className={styles.colorCard}>
              <div className={styles.colorSwatch} style={{ background: '#f5f5f5' }}></div>
              <div className={styles.colorMeta}>
                <span>Trắng Tinh Khôi</span>
                <span className={styles.colorArrow}>→</span>
              </div>
            </div>
            <div className={styles.colorCard}>
              <div className={styles.colorSwatch} style={{ background: '#d7c4a8' }}></div>
              <div className={styles.colorMeta}>
                <span>Be Cát</span>
                <span className={styles.colorArrow}>→</span>
              </div>
            </div>
            <div className={styles.colorCard}>
              <div className={styles.colorSwatch} style={{ background: '#6b7a4c' }}></div>
              <div className={styles.colorMeta}>
                <span>Olive Everyday</span>
                <span className={styles.colorArrow}>→</span>
              </div>
            </div>
            <div className={styles.colorCard}>
              <div className={styles.colorSwatch} style={{ background: '#1e335a' }}></div>
              <div className={styles.colorMeta}>
                <span>Navy City</span>
                <span className={styles.colorArrow}>→</span>
              </div>
            </div>
            <div className={styles.colorCard}>
              <div className={styles.colorSwatch} style={{ background: '#111111' }}></div>
              <div className={styles.colorMeta}>
                <span>Đen Classic</span>
                <span className={styles.colorArrow}>→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionTitleRow}>
            <div className={styles.sectionTitle}>Sản phẩm đơn sắc nổi bật</div>
            <a href="#" className={styles.stripLink}>Xem tất cả sản phẩm</a>
          </div>
          <div className={styles.productsGrid}>
            {products.map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
