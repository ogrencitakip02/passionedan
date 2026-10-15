import { useEffect, useMemo, useState } from 'react'
import './App.css'

const starterProducts = [
  { id: 1, name: 'Sculpt dantel bralet', category: 'Sütyen', price: 1290, oldPrice: 1590, badge: 'ÇOK SEVİLEN', image: 'photo-1539109136881-3be0616acf4b' },
  { id: 2, name: 'Luna saten takım', category: 'Takım', price: 1890, badge: 'YENİ', image: 'photo-1529139574466-a303027c1d8b' },
  { id: 3, name: 'İnci brazilian külot', category: 'Külot', price: 690, image: 'photo-1509631179647-0177331693ae' },
  { id: 4, name: 'Noir ipek sabahlık', category: 'Sabahlık', price: 2490, badge: 'AZ KALDI', image: 'photo-1483985988355-763728e1935b' },
  { id: 5, name: 'Muse balconette sütyen', category: 'Sütyen', price: 1190, image: 'photo-1525507119028-ed4c629a60a3' },
  { id: 6, name: 'Soft touch üçlü set', category: 'Takım', price: 1690, badge: '3 RENK', image: 'photo-1544441893-675973e31985' },
]

const categories = ['Tümü', 'Sütyen', 'Külot', 'Takım', 'Sabahlık']
const imageUrl = (id) => id.startsWith('http') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`
const formatPrice = (price) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)

function Icon({ name, size = 20 }) {
  const paths = {
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    heart: <path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.3 4.3 0 0 1 12 6.5a4.3 4.3 0 0 1 8.8 2.3Z" />,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function App() {
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem('maison-products') || 'null') || starterProducts)
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('maison-cart') || '[]'))
  const [favorites, setFavorites] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [category, setCategory] = useState('Tümü')
  const [query, setQuery] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCategory, setAdminCategory] = useState('Tümü')
  const [showProductForm, setShowProductForm] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  useEffect(() => localStorage.setItem('maison-products', JSON.stringify(products)), [products])
  useEffect(() => localStorage.setItem('maison-cart', JSON.stringify(cart)), [cart])

  const visibleProducts = useMemo(() => products.filter((product) =>
    (category === 'Tümü' || product.category === category) && (!showFavorites || favorites.includes(product.id)) && product.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')),
  ), [products, category, query, showFavorites, favorites])
  const adminProducts = useMemo(() => products.filter((product) =>
    (adminCategory === 'Tümü' || product.category === adminCategory) && product.name.toLocaleLowerCase('tr').includes(adminSearch.toLocaleLowerCase('tr')),
  ), [products, adminCategory, adminSearch])
  const categoryCount = new Set(products.map((product) => product.category)).size
  const averagePrice = products.length ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length) : 0
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  function addToCart(product) {
    setCart((items) => {
      const found = items.find((item) => item.id === product.id)
      return found ? items.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...items, { ...product, qty: 1 }]
    })
    setNotice('Sepetine eklendi')
    window.setTimeout(() => setNotice(''), 2200)
  }

  function updateQuantity(id, change) {
    setCart((items) => items.map((item) => item.id === id ? { ...item, qty: item.qty + change } : item).filter((item) => item.qty > 0))
  }

  function addProduct(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const image = form.get('image').trim()
    setProducts((items) => [...items, {
      id: Date.now(), name: form.get('name').trim(), category: form.get('category'), price: Number(form.get('price')),
      badge: 'YENİ', image: image.startsWith('http') || image.includes('photo-') ? image : 'photo-1525507119028-ed4c629a60a3',
    }])
    event.currentTarget.reset()
    setAdminSearch('')
    setAdminCategory('Tümü')
    setShowProductForm(false)
    setNotice('Ürün vitrinde yayınlandı')
    window.setTimeout(() => setNotice(''), 2400)
  }

  function removeProduct(productId) {
    setProducts((items) => items.filter((item) => item.id !== productId))
    setFavorites((items) => items.filter((id) => id !== productId))
    setNotice('Ürün vitrinden kaldırıldı')
    window.setTimeout(() => setNotice(''), 2400)
  }

  function placeOrder(event) {
    event.preventDefault()
    setOrderPlaced(true)
    setCart([])
  }

  return (
    <div className="storefront">
      <div className="announcement">İLK SİPARİŞİNE ÖZEL <strong>%10 İNDİRİM</strong> · KOD: MERHABA10 <span>ÜCRETSİZ KARGO · 1.500₺ ÜZERİ</span></div>
      <header className="site-header">
        <button className="mobile-menu icon-button" aria-label="Menüyü aç" onClick={() => setMobileMenu(!mobileMenu)}><Icon name="menu" /></button>
        <a className="wordmark" href="#top" aria-label="Maison Intime ana sayfa">maison<span> intime</span><i>®</i></a>
        <nav className={mobileMenu ? 'main-nav is-open' : 'main-nav'} aria-label="Ana menü">
          <a href="#shop" onClick={() => { setCategory('Tümü'); setShowFavorites(false) }}>Tüm ürünler</a><a href="#shop" onClick={() => { setCategory('Takım'); setShowFavorites(false) }}>İç giyim</a><a href="#story">Hikâyemiz</a><a href="#footer">Bize ulaşın</a>
        </nav>
        <div className="header-actions">
          <label className="search-box"><Icon name="search" size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }} placeholder="Ürün ara" aria-label="Ürün ara" /></label>
          <button className={showFavorites ? 'icon-button favorite-shortcut is-active' : 'icon-button favorite-shortcut'} aria-label="Favoriler" onClick={() => { setCategory('Tümü'); setQuery(''); setShowFavorites((value) => !value); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }) }}><Icon name="heart" /></button>
          <button className="icon-button bag-button" aria-label={`Sepet, ${cartCount} ürün`} onClick={() => setCartOpen(true)}><Icon name="bag" /><span className="bag-count">{cartCount}</span></button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">KENDİN İÇİN, KENDİNE GÖRE</span><h1>İçindeki<br /><em>güzelliği</em><br />hisset.</h1><p>Günün her anında sana eşlik eden, kendin gibi özel iç giyim parçaları.</p><a className="button button-dark" href="#shop">Koleksiyonu keşfet <Icon name="arrow" size={17} /></a><div className="hero-note"><span>✳</span> Kendine iyi bakmanın<br />en güzel hâli.</div></div>
          <div className="hero-visual"><img src={imageUrl('photo-1515886657613-9f3515b0c78f')} alt="Maison Intime yeni sezon moda çekimi" /><div className="hero-stamp"><span>FEEL</span><strong>YOUR</strong><span>OWN<br />BEAUTY</span><i>✳</i></div><div className="hero-caption">THE NEW<br />INTIMATES · 2025</div></div>
        </section>

        <div className="benefits-strip"><div><span>✳</span> Özenle seçilmiş kumaşlar</div><div><span>♧</span> Ücretsiz kargo · 1.500₺ üzeri</div><div><span>↺</span> 14 gün kolay iade</div><div><span>♡</span> Kendin ol, güzel hisset</div></div>

        <section className="shop-section" id="shop"><div className="section-heading"><div><span className="eyebrow">SENİN İÇİN SEÇTİK</span><h2>{showFavorites ? 'Favorilerin' : 'Favori parçaların'}</h2></div><a className="text-link" href="#shop" onClick={() => setShowFavorites(false)}>Tüm koleksiyonu gör <Icon name="arrow" size={16} /></a></div>
          <div className="shop-toolbar"><div className="category-tabs" role="tablist" aria-label="Ürün kategorileri">{categories.map((item) => <button key={item} className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => { setCategory(item); setShowFavorites(false) }}>{item}</button>)}</div><span className="product-count">{visibleProducts.length} ürün</span></div>
          {visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image-wrap"><img src={imageUrl(product.image)} alt={product.name} loading="lazy" />{product.badge && <span className="product-badge">{product.badge}</span>}<button className={favorites.includes(product.id) ? 'product-favorite selected' : 'product-favorite'} aria-label="Favorilere ekle" onClick={() => setFavorites((items) => items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id])}><Icon name="heart" size={19} /></button><button className="quick-add" onClick={() => addToCart(product)}>Sepete ekle <Icon name="plus" size={16} /></button></div><div className="product-meta"><div><h3>{product.name}</h3><span>{product.category}</span></div><div className="price">{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}<strong>{formatPrice(product.price)}</strong></div></div></article>)}</div> : <p className="empty-search">{showFavorites ? 'Henüz favori eklemedin.' : 'Bu seçimde ürün bulunamadı. Başka bir kelime deneyebilirsin.'}</p>}
        </section>

        <section className="story-section" id="story"><div className="story-image"><img src={imageUrl('photo-1524504388940-b1c1722653e1')} alt="Kendini iyi hissetmenin sade ve doğal hâli" loading="lazy" /><span>MAISON INTIME · EST. 2024</span></div><div className="story-copy"><span className="eyebrow">BİZİM KÜÇÜK BİR FİKRİMİZ VAR</span><h2>Güzellik,<br /><em>kendin olmaktır.</em></h2><p>Her bedenin, her ruh hâlinin ve her günün kendine özgü bir güzelliği var. Maison Intime, sana bunu her gün hatırlatmak için tasarlandı.</p><a className="text-link" href="#footer">Hikâyemizi tanı <Icon name="arrow" size={16} /></a></div></section>

        <section className="newsletter"><span className="eyebrow">MAISON'DAN NOTLAR</span><h2>Güzel şeylerden<br />ilk sen haberdar ol.</h2><form onSubmit={(event) => { event.preventDefault(); setNotice('Aramıza hoş geldin!'); window.setTimeout(() => setNotice(''), 2500); event.currentTarget.reset() }}><input type="email" placeholder="E-posta adresin" aria-label="E-posta adresin" required /><button aria-label="Abone ol"><Icon name="arrow" /></button></form><small>Yeni koleksiyonlar, sana özel fırsatlar ve biraz ilham. Söz, spam yok.</small></section>
      </main>

      <footer className="site-footer" id="footer"><a className="wordmark" href="#top">maison<span> intime</span><i>®</i></a><p>Kendin gibi özel hisset.</p><div className="footer-links"><a href="#shop">Koleksiyon</a><a href="#story">Hakkımızda</a><a href="mailto:merhaba@maisonintime.com">İletişim</a><a href="#footer">Gizlilik ve iade</a></div><div className="footer-bottom"><span>© 2026 Maison Intime. Tüm hakları saklıdır.</span><span>Güzel hissetmek, sana çok yakışıyor. ♡</span><button onClick={() => setAdminOpen(true)}>Mağaza yönetimi</button></div></footer>

      {notice && <div className="toast" role="status">♡ &nbsp; {notice}</div>}

      {cartOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false) }}><aside className="side-panel cart-panel" aria-label="Alışveriş sepeti"><div className="panel-heading"><div><span className="eyebrow">SANA ÇOK YAKIŞACAK</span><h2>Alışveriş çantam <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Kapat"><Icon name="close" /></button></div>{cart.length ? <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={imageUrl(item.image)} alt={item.name} /><div className="cart-item-info"><h3>{item.name}</h3><span>{item.category}</span><strong>{formatPrice(item.price)}</strong><div className="quantity-control"><button onClick={() => updateQuantity(item.id, -1)} aria-label="Adedi azalt"><Icon name="minus" size={14} /></button><span>{item.qty}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label="Adedi artır"><Icon name="plus" size={14} /></button><button className="remove-item" onClick={() => setCart((items) => items.filter((entry) => entry.id !== item.id))}>Kaldır</button></div></div></div>)}</div><div className="cart-footer"><div className="shipping-hint">{subtotal >= 1500 ? 'Ücretsiz kargo kazandın ♡' : `${formatPrice(1500 - subtotal)} daha ekle, kargo bizden olsun.`}<div><span style={{ width: `${Math.min(subtotal / 1500 * 100, 100)}%` }} /></div></div><div className="subtotal"><span>Ara toplam</span><strong>{formatPrice(subtotal)}</strong></div><button className="button button-dark full-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); setOrderPlaced(false) }}>Alışverişi tamamla <Icon name="arrow" size={17} /></button><small>Vergiler dahil · Kargo ödeme adımında hesaplanır</small></div></> : <div className="empty-cart"><span>♡</span><h3>Çantan şimdilik boş</h3><p>Kendine güzel bir şeyler seçmeye ne dersin?</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Alışverişe dön</button></div>}</aside></div>}

      {adminOpen && <div className="overlay admin-overlay"><section className="admin-dashboard" aria-label="Mağaza yönetim paneli">
        <header className="admin-topbar"><a className="wordmark" href="#top" onClick={() => setAdminOpen(false)}>maison<span> intime</span><i>®</i></a><span className="admin-topbar-label">MAĞAZA YÖNETİMİ</span><button className="admin-back" onClick={() => setAdminOpen(false)}>Mağazaya dön <Icon name="arrow" size={16} /></button></header>
        <main className="admin-content"><div className="admin-page-heading"><div><span className="eyebrow">MAISON INTIME · YÖNETİM</span><h1>Ürünlerin</h1><p>Vitrinindeki ürünleri tek yerden düzenle.</p></div><button className="button button-dark" onClick={() => setShowProductForm((value) => !value)}><Icon name="plus" size={17} />{showProductForm ? 'Formu kapat' : 'Yeni ürün ekle'}</button></div>
          <div className="admin-stats"><article><span>TOPLAM ÜRÜN</span><strong>{products.length}</strong><small>Vitrinde listelenen ürünler</small></article><article><span>KATEGORİ</span><strong>{categoryCount}</strong><small>Aktif ürün kategorisi</small></article><article><span>ORTALAMA FİYAT</span><strong>{formatPrice(averagePrice)}</strong><small>Mevcut ürünlerin ortalaması</small></article></div>
          {showProductForm && <form className="admin-create-card" onSubmit={addProduct}><div className="admin-create-heading"><div><h2>Yeni ürün bilgileri</h2><p>Ürün vitrinde hemen yayınlanır.</p></div><span className="new-product-mark">YENİ ÜRÜN</span></div><div className="admin-create-grid"><label>Ürün adı<input name="name" placeholder="Örn. Soft touch bralet" required maxLength="80" /></label><label>Kategori<select name="category">{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label>Satış fiyatı (₺)<input name="price" type="number" min="1" step="1" placeholder="1290" required /></label><label className="admin-image-field">Görsel URL'si veya Unsplash fotoğraf kimliği<input name="image" placeholder="https://... veya photo-..." /></label></div><div className="admin-create-actions"><span>Görsel eklemezsen varsayılan ürün görseli kullanılır.</span><button className="button button-dark" type="submit">Ürünü vitrinde yayınla <Icon name="arrow" size={16} /></button></div></form>}
          <section className="admin-inventory"><div className="inventory-heading"><div><h2>Ürün envanteri</h2><p>Ürünleri ara, filtrele veya vitrinden kaldır.</p></div><span>{adminProducts.length} / {products.length} ürün</span></div><div className="inventory-toolbar"><label className="inventory-search"><Icon name="search" size={17} /><input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Ürün adıyla ara" aria-label="Ürün adıyla ara" /></label><label className="inventory-filter"><span>Kategori</span><select value={adminCategory} onChange={(event) => setAdminCategory(event.target.value)} aria-label="Kategoriye göre filtrele">{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div>
            <div className="admin-product-list"><div className="admin-list-header"><span>ÜRÜN</span><span>KATEGORİ</span><span>FİYAT</span><span>İŞLEM</span></div>{adminProducts.length ? adminProducts.map((product) => <article className="admin-product-row" key={product.id}><div className="admin-product-name"><img src={imageUrl(product.image)} alt="" /><div><strong>{product.name}</strong><small>Ürün kodu: {product.id}</small></div></div><span className="admin-product-category">{product.category}</span><strong className="admin-product-price">{formatPrice(product.price)}</strong><button className="admin-remove-button" onClick={() => removeProduct(product.id)} aria-label={`${product.name} ürününü vitrinden kaldır`}><Icon name="close" size={16} />Kaldır</button></article>) : <div className="admin-empty-state"><span>♡</span><strong>{products.length ? 'Aramana uygun ürün bulunamadı.' : 'Vitrininde henüz ürün yok.'}</strong><p>{products.length ? 'Arama veya kategori filtresini değiştirebilirsin.' : 'Yeni ürün ekleyerek mağazanı oluşturmaya başla.'}</p></div>}</div>
          </section>
          <p className="admin-storage-note">Ürün değişiklikleri bu tarayıcıda saklanır. Canlı mağaza için sunucu ve yönetici girişi gerekir.</p>
        </main>
      </section></div>}

      {checkoutOpen && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false) }}><section className="checkout-modal"><div className="panel-heading"><div><span className="eyebrow">SON BİR ADIM</span><h2>{orderPlaced ? 'Siparişin hazır ♡' : 'Sipariş bilgileri'}</h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Kapat"><Icon name="close" /></button></div>{orderPlaced ? <div className="order-success"><div>♡</div><p>Demo siparişin oluşturuldu. Gerçek ödeme tahsilatı yapılmadı.</p><button className="button button-dark" onClick={() => { setCheckoutOpen(false); setOrderPlaced(false) }}>Mağazaya dön</button></div> : <><div className="demo-payment-note">Bu mağaza önizlemesidir. Canlı kart tahsilatı için ödeme sağlayıcısı entegrasyonu gerekir; kart bilgisi alınmaz.</div><form className="checkout-form" onSubmit={placeOrder}><label>Ad soyad<input name="name" autoComplete="name" required placeholder="Adın ve soyadın" /></label><label>E-posta<input name="email" type="email" autoComplete="email" required placeholder="ornek@email.com" /></label><label>Teslimat adresi<textarea name="address" autoComplete="street-address" required placeholder="Mahalle, sokak, bina ve daire no" rows="3" /></label><div className="checkout-total"><span>Toplam</span><strong>{formatPrice(subtotal)}</strong></div><button className="button button-dark full-button">Test siparişini oluştur <Icon name="arrow" size={17} /></button></form></>}</section></div>}
    </div>
  )
}

export default App
