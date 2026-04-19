const boyaForm = document.getElementById('boyaForm');
const sonucAlani = document.getElementById('sonucAlani');

// Veriyi Kaydetme
boyaForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const yeniKayit = {
        id: Date.now(),
        ad: document.getElementById('adSoyad').value.toLowerCase(),
        marka: document.getElementById('boyaMarka').value,
        no: document.getElementById('boyaNo').value,
        gram: document.getElementById('oksidanGram').value,
        vol: document.getElementById('oksidanVol').value,
        not: document.getElementById('notlar').value,
        tarih: new Date().toLocaleDateString('tr-TR')
    };

    let musteriler = JSON.parse(localStorage.getItem('salonMusterileri')) || [];
    musteriler.push(yeniKayit);
    localStorage.setItem('salonMusterileri', JSON.stringify(musteriler));

    alert('Kayıt başarıyla eklendi!');
    boyaForm.reset();
});

// Arama Fonksiyonu
function musteriAra() {
    const aranan = document.getElementById('aramaInput').value.toLowerCase();
    const musteriler = JSON.parse(localStorage.getItem('salonMusterileri')) || [];
    sonucAlani.innerHTML = '';

    if(aranan.length < 2) return;

    const filtreli = musteriler.filter(m => m.ad.includes(aranan));

    filtreli.forEach(m => {
        sonucAlani.innerHTML += `
            <div class="kayit-ozet">
                <h4>${m.ad.toUpperCase()} <small>(${m.tarih})</small></h4>
                <p><strong>Boya:</strong> ${m.marka} - No: ${m.no}</p>
                <p><strong>Oksidan:</strong> ${m.gram}gr - ${m.vol} Volüm</p>
                <p><strong>Not:</strong> ${m.not}</p>
            </div>
        `;
    });
}
