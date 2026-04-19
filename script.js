const ayarlarBtn = document.getElementById('ayarlarBtn');
const kayitPaneli = document.getElementById('kayitPaneli');
const boyaForm = document.getElementById('boyaForm');
const boyaAlanlari = document.getElementById('boyaAlanlari');
const sonucAlani = document.getElementById('sonucAlani');

// Paneli Aç/Kapat
ayarlarBtn.addEventListener('click', () => {
    kayitPaneli.classList.toggle('hidden');
    if(!kayitPaneli.classList.contains('hidden') && boyaAlanlari.children.length === 0) {
        boyaAlaniEkle();
    }
});

function paneliKapat() {
    kayitPaneli.classList.add('hidden');
}

// Dinamik Boya Satırı Ekleme
function boyaAlaniEkle() {
    const div = document.createElement('div');
    div.className = 'boya-satir';
    div.innerHTML = `
        <input type="text" class="boyaNo" placeholder="Boya No (Örn: 8.1)" style="flex:2">
        <input type="number" class="boyaGram" placeholder="Gram" style="flex:1">
    `;
    boyaAlanlari.appendChild(div);
}

// Veriyi Kaydetme
boyaForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const boyalar = [];
    const nolar = document.querySelectorAll('.boyaNo');
    const gramlar = document.querySelectorAll('.boyaGram');

    nolar.forEach((no, index) => {
        if(no.value) {
            boyalar.push({ no: no.value, gr: gramlar[index].value || '0' });
        }
    });

    const yeniMusteri = {
        id: Date.now(),
        isim: document.getElementById('adSoyad').value.trim().toLowerCase(),
        marka: document.getElementById('boyaMarka').value,
        boyalar: boyalar,
        oksidanGr: document.getElementById('oksidanGram').value,
        oksidanVol: document.getElementById('oksidanVol').value,
        not: document.getElementById('notlar').value,
        tarih: new Date().toLocaleDateString('tr-TR')
    };

    let liste = JSON.parse(localStorage.getItem('salonHidayetData')) || [];
    liste.push(yeniMusteri);
    localStorage.setItem('salonHidayetData', JSON.stringify(liste));

    alert('Kayıt Arşive Eklendi!');
    boyaForm.reset();
    boyaAlanlari.innerHTML = '';
    paneliKapat();
});

// Müşteri Arama
function musteriAra() {
    const aranan = document.getElementById('aramaInput').value.toLowerCase();
    const liste = JSON.parse(localStorage.getItem('salonHidayetData')) || [];
    sonucAlani.innerHTML = '';

    if(aranan.length < 2) return;

    const sonuclar = liste.filter(m => m.isim.includes(aranan));

    sonuclar.forEach(m => {
        let boyaHtml = m.boyalar.map(b => `<span class="boya-liste-item">${b.no} (${b.gr}gr)</span>`).join('');
        
        sonucAlani.innerHTML += `
            <div class="kayit-ozet">
                <div style="display:flex; justify-content:space-between">
                    <strong>${m.isim.toUpperCase()}</strong>
                    <small>${m.tarih}</small>
                </div>
                <p style="margin:10px 0 5px 0"><strong>Marka:</strong> ${m.marka}</p>
                <div>${boyaHtml}</div>
                <p style="margin:5px 0"><strong>Oksidan:</strong> ${m.oksidanGr}gr - ${m.oksidanVol} Vol</p>
                <p style="font-size:13px; color:#666; font-style:italic">${m.not ? 'Not: ' + m.not : ''}</p>
            </div>
        `;
    });
}
