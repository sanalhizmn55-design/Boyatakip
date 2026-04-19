// Firebase modüllerini import ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Senin Firebase Bilgilerin
const firebaseConfig = {
  apiKey: "AIzaSyByNIGTjC3_AKzn_0hfD_btA13Pg4378A8",
  authDomain: "boyatakip-f7c37.firebaseapp.com",
  projectId: "boyatakip-f7c37",
  storageBucket: "boyatakip-f7c37.firebasestorage.app",
  messagingSenderId: "92904189581",
  appId: "1:92904189581:web:98d079d2d599039efffcc4"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// HTML Elementlerini Seçelim
const ayarlarBtn = document.getElementById('ayarlarBtn');
const kayitPaneli = document.getElementById('kayitPaneli');
const boyaForm = document.getElementById('boyaForm');
const boyaAlanlari = document.getElementById('boyaAlanlari');
const sonucAlani = document.getElementById('sonucAlani');

// Yeni Boya Satırı Ekleme Fonksiyonu
window.boyaAlaniEkle = function() {
    const div = document.createElement('div');
    div.className = 'boya-satir';
    div.style.display = 'flex';
    div.style.gap = '5px';
    div.innerHTML = `
        <input type="text" class="boyaNo" placeholder="Boya No (Örn: 7.1)" style="flex:2">
        <input type="number" class="boyaGram" placeholder="Gr" style="flex:1">
    `;
    boyaAlanlari.appendChild(div);
}

// Ayarlar Çarkına Basınca Paneli Aç/Kapat
ayarlarBtn.onclick = () => {
    kayitPaneli.classList.toggle('hidden');
    // Panel açıldığında içinde alan yoksa bir tane ekle
    if(!kayitPaneli.classList.contains('hidden') && boyaAlanlari.children.length === 0) {
        boyaAlaniEkle();
    }
};

window.paneliKapat = () => {
    kayitPaneli.classList.add('hidden');
}

// Veriyi Firebase Firestore'a Kaydetme
boyaForm.onsubmit = async (e) => {
    e.preventDefault();
    
    const boyalar = [];
    const nolar = document.querySelectorAll('.boyaNo');
    const gramlar = document.querySelectorAll('.boyaGram');

    nolar.forEach((no, index) => {
        if(no.value) {
            boyalar.push({ 
                no: no.value, 
                gr: gramlar[index].value || "0" 
            });
        }
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
            kayitTarihi: new Date() // Sıralama yapmak için
        });
        
        alert("Müşteri başarıyla buluta kaydedildi!");
        boyaForm.reset();
        boyaAlanlari.innerHTML = '';
        paneliKapat();
    } catch (error) {
        console.error("Kayıt hatası: ", error);
        alert("Bir hata oluştu. Firestore ayarlarını (Test Modu) kontrol edin.");
    }
};

// Firebase'den Müşteri Sorgulama
window.musteriAra = async () => {
    const aranan = document.getElementById('aramaInput').value.toLowerCase().trim();
    
    if(aranan.length < 2) {
        sonucAlani.innerHTML = '';
        return;
    }

    // İsme göre arama yapalım
    const q = query(
        collection(db, "musteriler"), 
        where("isim", ">=", aranan), 
        where("isim", "<=", aranan + "\uf8ff")
    );

    try {
        const querySnapshot = await getDocs(q);
        sonucAlani.innerHTML = '';

        if (querySnapshot.empty) {
            sonucAlani.innerHTML = '<p style="text-align:center; color:gray;">Müşteri bulunamadı.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const m = doc.data();
            let boyaHtml = m.boyalar.map(b => `<span class="boya-liste-item">${b.no} (${b.gr}gr)</span>`).join(' ');
            
            sonucAlani.innerHTML += `
                <div class="kayit-ozet">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#2c3e50; font-size:16px;">${m.isim.toUpperCase()}</strong>
                        <small style="color:#7f8c8d;">${m.tarih}</small>
                    </div>
                    <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
                    <p><strong>Marka:</strong> ${m.marka}</p>
                    <div style="margin:10px 0;">${boyaHtml}</div>
                    <p><strong>Oksidan:</strong> ${m.oksidanGr}gr - ${m.oksidanVol} Volüm</p>
                    ${m.not ? `<p style="font-size:13px; color:#666; font-style:italic; background:#f9f9f9; padding:5px; border-radius:4px;">Not: ${m.not}</p>` : ''}
                </div>
            `;
        });
    } catch (error) {
        console.error("Arama hatası: ", error);
    }
};
