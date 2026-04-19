import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Panel Açma/Kapama İşlemi
const ayarlarBtn = document.getElementById('ayarlarBtn');
const kayitPaneli = document.getElementById('kayitPaneli');
const boyaForm = document.getElementById('boyaForm');
const boyaAlanlari = document.getElementById('boyaAlanlari');
const sonucAlani = document.getElementById('sonucAlani');

ayarlarBtn.addEventListener('click', () => {
    kayitPaneli.classList.toggle('hidden');
    if(!kayitPaneli.classList.contains('hidden') && boyaAlanlari.children.length === 0) {
        window.boyaAlaniEkle();
    }
});

window.paneliKapat = () => kayitPaneli.classList.add('hidden');

// Boya Satırı Ekleme
window.boyaAlaniEkle = function() {
    const div = document.createElement('div');
    div.className = 'boya-satir';
    div.innerHTML = `
        <input type="text" class="boyaNo" placeholder="No (Örn: 7.1)" style="flex:2">
        <input type="number" class="boyaGram" placeholder="Gr" style="flex:1">
    `;
    boyaAlanlari.appendChild(div);
}

// Firebase'e Kaydetme
boyaForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const boyalar = [];
    document.querySelectorAll('.boya-satir').forEach(satir => {
        const no = satir.querySelector('.boyaNo').value;
        const gr = satir.querySelector('.boyaGram').value;
        if(no) boyalar.push({ no, gr });
    });

    try {
        await addDoc(collection(db, "musteriler"), {
            isim: document.getElementById('adSoyad').value.toLowerCase().trim(),
            marka: document.getElementById('boyaMarka').value,
            boyalar: boyalar,
            oksidanGr: document.getElementById('oksidanGram').value,
            oksidanVol: document.getElementById('oksidanVol').value,
            not: document.getElementById('notlar').value,
            tarih: new Date().toLocaleDateString('tr-TR'),
            zaman: new Date()
        });
        alert("Buluta Kaydedildi!");
        boyaForm.reset();
        boyaAlanlari.innerHTML = '';
        paneliKapat();
    } catch (hata) {
        console.error("Hata oluştu: ", hata);
        alert("Kayıt yapılamadı! Firestore kurallarını kontrol edin.");
    }
};

// Arama Yapma
window.musteriAra = async () => {
    const aranan = document.getElementById('aramaInput').value.toLowerCase().trim();
    if(aranan.length < 2) { sonucAlani.innerHTML = ''; return; }

    const q = query(collection(db, "musteriler"), where("isim", ">=", aranan), where("isim", "<=", aranan + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    
    sonucAlani.innerHTML = '';
    querySnapshot.forEach((doc) => {
        const m = doc.data();
        let boyaHtml = m.boyalar.map(b => `<span class="boya-liste-item">${b.no} (${b.gr}gr)</span>`).join('');
        
        sonucAlani.innerHTML += `
            <div class="kayit-ozet">
                <div style="display:flex; justify-content:space-between">
                    <strong>${m.isim.toUpperCase()}</strong>
                    <small>${m.tarih}</small>
                </div>
                <p><strong>Boya:</strong> ${m.marka}</p>
                <div>${boyaHtml}</div>
                <p><strong>Oksidan:</strong> ${m.oksidanGr}gr - ${m.oksidanVol} Vol</p>
                ${m.not ? `<p style="font-size:12px; color:gray">Not: ${m.not}</p>` : ''}
            </div>
        `;
    });
};
