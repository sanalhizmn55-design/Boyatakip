import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyByNIGTjC3_AKzn_0hfD_btA13Pg4378A8",
  authDomain: "boyatakip-f7c37.firebaseapp.com",
  projectId: "boyatakip-f7c37",
  storageBucket: "boyatakip-f7c37.firebasestorage.app",
  messagingSenderId: "92904189581",
  appId: "1:92904189581:web:98d079d2d599039efffcc4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ayarlarBtn = document.getElementById('ayarlarBtn');
const kayitPaneli = document.getElementById('kayitPaneli');
const boyaForm = document.getElementById('boyaForm');
const boyaAlanlari = document.getElementById('boyaAlanlari');
const sonucAlani = document.getElementById('sonucAlani');

// Panel Açma/Kapama
ayarlarBtn.addEventListener('click', () => {
    document.getElementById('duzenlenenId').value = ""; 
    document.getElementById('panelBaslik').innerText = "Yeni Kayıt Ekle";
    document.getElementById('kaydetBtn').innerText = "Buluta Kaydet";
    boyaForm.reset();
    boyaAlanlari.innerHTML = "";
    kayitPaneli.classList.toggle('hidden');
    if(!kayitPaneli.classList.contains('hidden')) window.boyaAlaniEkle();
});

window.paneliKapat = () => kayitPaneli.classList.add('hidden');

// Boya Satırı Ekleme Fonksiyonu
window.boyaAlaniEkle = function(no = '', gr = '') {
    const div = document.createElement('div');
    div.className = 'boya-satir';
    div.innerHTML = `
        <input type="text" class="boyaNo" placeholder="No" value="${no}" style="flex:2">
        <input type="number" class="boyaGram" placeholder="Gr" value="${gr}" style="flex:1">
    `;
    boyaAlanlari.appendChild(div);
}

// Kaydetme ve Güncelleme İşlemi
boyaForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('duzenlenenId').value;
    
    const boyalar = [];
    document.querySelectorAll('.boya-satir').forEach(satir => {
        const no = satir.querySelector('.boyaNo').value;
        const gr = satir.querySelector('.boyaGram').value;
        if(no) boyalar.push({ no, gr });
    });

    const veri = {
        isim: document.getElementById('adSoyad').value.toLowerCase().trim(),
        marka: document.getElementById('boyaMarka').value,
        boyalar: boyalar,
        oksidanGr: document.getElementById('oksidanGram').value,
        oksidanVol: document.getElementById('oksidanVol').value,
        not: document.getElementById('notlar').value,
        tarih: new Date().toLocaleDateString('tr-TR'),
        guncellemeZamani: new Date()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "musteriler", id), veri);
            alert("Müşteri Başarıyla Güncellendi!");
        } else {
            await addDoc(collection(db, "musteriler"), veri);
            alert("Müşteri Buluta Kaydedildi!");
        }
        boyaForm.reset();
        paneliKapat();
        sonucAlani.innerHTML = ""; // Ekranı temizle
    } catch (hata) {
        console.error(hata);
        alert("Hata oluştu, tekrar deneyin.");
    }
};

// Düzenleme Modunu Başlatma
window.duzenleDoldur = (id, isim, marka, oksGr, oksVol, not, boyalarJson) => {
    const boyalar = JSON.parse(decodeURIComponent(boyalarJson));
    
    document.getElementById('duzenlenenId').value = id;
    document.getElementById('adSoyad').value = isim;
    document.getElementById('boyaMarka').value = marka;
    document.getElementById('oksidanGram').value = oksGr;
    document.getElementById('oksidanVol').value = oksVol;
    document.getElementById('notlar').value = not;
    
    document.getElementById('panelBaslik').innerText = "Kaydı Düzenle";
    document.getElementById('kaydetBtn').innerText = "Değişiklikleri Kaydet";
    
    boyaAlanlari.innerHTML = "";
    boyalar.forEach(b => window.boyaAlaniEkle(b.no, b.gr));
    
    kayitPaneli.classList.remove('hidden');
    window.scrollTo(0,0);
};

// Müşteri Arama Fonksiyonu
window.musteriAra = async () => {
    const aranan = document.getElementById('aramaInput').value.toLowerCase().trim();
    if(aranan.length < 2) { sonucAlani.innerHTML = ''; return; }

    const q = query(collection(db, "musteriler"), where("isim", ">=", aranan), where("isim", "<=", aranan + "\uf8ff"));
    const snap = await getDocs(q);
    
    sonucAlani.innerHTML = '';
    snap.forEach((doc) => {
        const m = doc.data();
        const id = doc.id;
        const boyalarJson = encodeURIComponent(JSON.stringify(m.boyalar));
        let boyaHtml = m.boyalar.map(b => `<span class="boya-liste-item">${b.no} (${b.gr}gr)</span>`).join('');
        
        sonucAlani.innerHTML += `
            <div class="kayit-ozet">
                <button class="edit-btn" onclick="duzenleDoldur('${id}', '${m.isim}', '${m.marka}', '${m.oksidanGr}', '${m.oksidanVol}', '${m.not}', '${boyalarJson}')">
                    <i class="fas fa-edit"></i> Düzenle
                </button>
                <strong>${m.isim.toUpperCase()}</strong>
                <p style="font-size:12px; color:gray; margin-top:5px;">${m.tarih}</p>
                <p><strong>Marka:</strong> ${m.marka}</p>
                <div>${boyaHtml}</div>
                <p><strong>Oksidan:</strong> ${m.oksidanGr}gr - ${m.oksidanVol} Vol</p>
                ${m.not ? `<p style="font-size:13px; color:#555; background:#eee; padding:5px; border-radius:5px;">${m.not}</p>` : ''}
            </div>
        `;
    });
};
