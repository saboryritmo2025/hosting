// app.js - Sistema Integral "Ritmo y Sabor" v16
(() => {
  const STORAGE_KEY = 'rysb_final_total_v16';
  function getEl(idList) {
    for (const id of idList) {
      const el = document.getElementById(id);
      if (el) return el;
    }
    return null;
  }

  // --- 1. ESTADO INICIAL ---
  let state = {
    user: null,
    registeredUsers: [], 
    purchases: [],       
    materials: [
      { id: 1, name: 'Letras con alma peruana - Separata completa', type: 'PDF', size: '4.2 MB', isGenerated: true, file: 'docs/letras_con_alma_peruana.pdf' },
      { id: 2, name: 'Vocabulario de términos criollos', type: 'DOC', size: '1.8 MB', file: 'docs/vocabulario_criollo.docx' },
      { id: 3, name: 'Cantantes máximas en Perú - Estilo Criollo, Ritmo y Sabor', type: 'PPTX', size: '8.5 MB', file: 'docs/cantantes_maximas_criollo.pptx'}
    ],
    modules: {
      1: { id: 1, name: 'Historia de la música criolla:', desc: 'Desde sus orígenes hasta hoy.', progress: 60, lessonsCompleted: [1,2,3,4,5,6], total: 10, img: 'img/modulo_historia.jpg' },
      2: { id: 2, name: 'Instrumentos criollos:', desc: 'La guitarra y el cajón.', progress: 30, lessonsCompleted: [1,2,3], total: 10, img: 'img/modulo_instrumentos.jpg' },
      3: { id: 3, name: 'Grandes Voces:', desc: 'Lucha Reyes y Chabuca Granda.', progress: 0, lessonsCompleted: [], total: 10, img: 'img/modulo_cantantes.jpg' }
    },
    lessons: {
      1: [{id:1,title:'Orígenes'},{id:2,title:'Influencia africana'},{id:3,title:'La guardia vieja'},{id:4,title:'El vals'},{id:5,title:'La polca'},{id:6,title:'Felipe Pinglo'},{id:7,title:'Edad de oro'},{id:8,title:'Radio y Cine'},{id:9,title:'Actualidad'},{id:10,title:'Legado'}],
      2: [{id:1,title:'La Guitarra'},{id:2,title:'El Cajón'},{id:3,title:'La Quijada'},{id:4,title:'Castañelas'},{id:5,title:'Bajo'},{id:6,title:'Percusión'},{id:7,title:'Arpa'},{id:8,title:'Violín'},{id:9,title:'Técnicas'},{id:10,title:'Mantenimiento'}],
      3: [{id:1,title:'Chabuca Granda'},{id:2,title:'Lucha Reyes'},{id:3,title:'Óscar Avilés'},{id:4,title:'Arturo Cavero'},{id:5,title:'Jesús Vásquez'},{id:6,title:'Eva Ayllón'},{id:7,title:'Cecilia Barraza'},{id:8,title:'Bartola'},{id:9,title:'Lucía de la Cruz'},{id:10,title:'Nuevos valores'}]
    },
    singers: [
      { id: 1, name: 'Chabuca Granda', desc: 'La poeta del criollismo.', img: 'img/chabuca_granda.jpeg', spotifyEmbed: 'https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO3dTTwz', youtubeLink: 'https://www.youtube.com/results?search_query=Chabuca+Granda+La+Flor+de+la+Canela'},
      { id: 2, name: 'Lucha Reyes', desc: 'La Morena de Oro del Perú.', img: 'img/lucha-reyes.jpg', spotifyLink: 'https://open.spotify.com/embed/track/3x2r1G6R7q0s5y9t8u4v3w?utm_source=generator&theme=01', youtubeLink: 'https://www.youtube.com/results?search_query=Lucha+Reyes+criollas'},
      { id: 3, name: 'Óscar Avilés', desc: 'La Primera Guitarra del Perú.', img: 'img/oscar_aviles.jpg', spotifyLink: 'https://open.spotify.com/embed/track/3x2r1G6R7q0s5y9t8u4v3w?utm_source=generator&theme=02', youtubeLink: 'https://www.youtube.com/results?search_query=Oscar+Aviles+guitarra'},
      { id: 4, name: 'Eva Ayllón', desc: 'La reina del landó.', img: 'img/eva_ayllon.jpg', youtubeLink: 'https://www.youtube.com/results?search_query=Eva+Ayllon'}
    ],
    
    communityPosts: [
      { id: 1, author: 'Fiorella Balque', time: 'Hace 10 min', content: '¡Increíble la historia de Lucha Reyes! No sabía que su última grabación fue justo antes de partir. Una verdadera leyenda. 🌹✨', likes: 15 },
      { id: 2, author: 'Dajanna Galvez', time: 'Hace 45 min', content: 'Acabo de descargar la separata de cronología. ¡Está super completa! Me servirá mucho para el examen del módulo 1. 📚🎸', likes: 24 }
    ],
    events: [
      { id: 1, title: 'Gran Peña: Homenaje a Lucha Reyes', time: '21:00', place: 'Peña Don Porfirio', price: 65.00 },
      { id: 2, title: 'Noche de Gala: Chabuca Vive', time: '20:00', place: 'Teatro Municipal', price: 120.00 }
    ]
  };

  // Respaldo de los valores iniciales para resetear al cerrar sesión
  const initialModules = JSON.parse(JSON.stringify(state.modules));

  // --- 2. PERSISTENCIA (CORREGIDA PARA HISTORIAL INDIVIDUAL) ---
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { 
        state = { ...state, ...JSON.parse(raw) }; 
      }
      if (!state.registeredUsers) state.registeredUsers = [];
    } catch (e) { console.warn('Error cargando datos', e); }
    applyUserUI();
  }

  function saveState() { 
    // Antes de guardar, sincronizamos el progreso del usuario actual en la lista maestra
    if (state.user) {
      const userIndex = state.registeredUsers.findIndex(u => u.email === state.user.email);
      if (userIndex !== -1) {
        state.registeredUsers[userIndex].history = {
          modules: JSON.parse(JSON.stringify(state.modules)),
          purchases: JSON.parse(JSON.stringify(state.purchases))
        };
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); 
  }

  // --- 3. NOTIFICACIONES ---
  function showToast(message, type = 'success') {
    const t = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas fa-info-circle"></i><span>${message}</span>`;
    t.appendChild(el); setTimeout(() => el.remove(), 3000);
  }

  // --- 4. FUNCIÓN DE DESCARGA ---
  window.handleFileDownload = (id) => {
    if (!state.user) {
      showToast('Debes registrarte para descargar este material', 'error');
      openAuth('register');
      return;
    }
    const material = state.materials.find(m => m.id === Number(id));
    const backupPaths = {
      1: 'docs/letras_con_alma_peruana.pdf',
      2: 'docs/vocabulario_criollo.docx',
      3: 'docs/cantantes_maximas_criollo.pptx'
    };
    const filePath = (material && material.file) ? material.file : backupPaths[id];
    if (filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Descargando archivo...`, 'success');
    } else {
      showToast('Error: Archivo no encontrado', 'error');
    }
  };

  // --- 5. LOGICA DE COMUNIDAD ---
  window.handleNewPost = () => {
    if (!state.user) {
      showToast('Inicia sesión para publicar', 'error');
      openAuth('login');
      return;
    }
    const input = document.getElementById('community-input');
    const content = input.value.trim();
    if (content.length < 5) {
      showToast('El mensaje es muy corto', 'error');
      return;
    }
    const newPost = { id: Date.now(), author: state.user.name, time: 'Ahora mismo', content: content, likes: 0 };
    state.communityPosts.unshift(newPost);
    input.value = '';
    saveState();
    renderCommunity();
    showToast('¡Mensaje publicado!', 'success');
  };

  // --- 6. TICKETS Y PDF ---
  window.buyTicket = (evId) => {
    if (!state.user) { showToast('Inicia sesión para comprar', 'error'); openAuth('login'); return; }
    const ev = state.events.find(x => x.id === evId);
    const p = { uid: Date.now(), title: ev.title, price: ev.price, place: ev.place, time: ev.time, date: new Date().toLocaleDateString() };
    state.purchases.push(p);
    saveState();
    showToast('¡Entrada adquirida!', 'success');
    renderProfile();
    downloadTicketPDF(p);
  };

  function downloadTicketPDF(p) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'pt', format:[300, 400] });
    doc.setFillColor(217, 16, 35);
    doc.rect(0, 0, 300, 60, 'F');
    doc.setTextColor(255);
    doc.text("RITMO Y SABOR TICKET", 150, 35, { align: 'center' });
    doc.setTextColor(0); doc.setFontSize(14);
    doc.text(p.title, 150, 100, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Asistente: ${state.user.name}`, 40, 140);
    doc.text(`Lugar: ${p.place}`, 40, 160);
    doc.text(`Precio: S/ ${p.price.toFixed(2)}`, 40, 180);
    doc.text(`ID Ticket: #${p.uid}`, 40, 250);
    doc.save(`Ticket_Criollo_${p.uid}.pdf`);
  }

  // --- 7. MÓDULOS Y LECCIONES ---
  window.openModuleLessons = (moduleId) => {
    const mod = state.modules[moduleId];
    const lessons = state.lessons[moduleId];
    if (!mod || !lessons) return;
    document.getElementById('lessons-title').textContent = mod.name;
    const content = document.getElementById('lessons-content');
    content.innerHTML = lessons.map(lesson => {
      const isDone = mod.lessonsCompleted.includes(lesson.id);
      return `
        <div class="flex items-center justify-between p-3 border rounded-lg mb-2 ${isDone ? 'bg-green-50 border-green-200' : 'bg-white'}">
          <div class="text-sm font-medium ${isDone ? 'text-green-700' : 'text-gray-700'}">${lesson.title}</div>
          <button onclick="toggleLesson(${moduleId}, ${lesson.id})" 
                  class="text-xs px-3 py-1 rounded-full border transition ${isDone ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-500 border-gray-200'}">
            ${isDone ? '<i class="fas fa-check"></i> Listo' : 'Marcar'}
          </button>
        </div>`;
    }).join('');
    document.getElementById('lessons-modal').classList.remove('hidden');
    document.getElementById('lessons-modal').classList.add('flex');
  };

  window.toggleLesson = (moduleId, lessonId) => {
    const mod = state.modules[moduleId];
    const index = mod.lessonsCompleted.indexOf(lessonId);
    if (index === -1) { mod.lessonsCompleted.push(lessonId); } else { mod.lessonsCompleted.splice(index, 1); }
    mod.progress = Math.round((mod.lessonsCompleted.length / mod.total) * 100);
    saveState();
    renderModules();
    renderProfile();
    openModuleLessons(moduleId);
    if (mod.progress === 100) showToast(`¡Felicidades! Completaste: ${mod.name}`, 'success');
  };

  // --- 8. RENDERIZADOS ---
  function renderMaterials() {
    const cont = document.getElementById('educational-materials-list');
    if (!cont) return;
    cont.innerHTML = state.materials.map(m => {
      // --- Lógica de selección de icono y color ---
      let iconClass = 'fa-file';
      let iconColor = 'text-gray-400';
      if (m.type === 'PDF') { iconClass = 'fa-file-pdf'; iconColor = 'text-red-500'; }
      else if (m.type === 'DOC') { iconClass = 'fa-file-word'; iconColor = 'text-blue-500'; }
      else if (m.type === 'PPTX') { iconClass = 'fa-file-powerpoint'; iconColor = 'text-orange-500'; }
      
      // --- Plantilla HTML actualizada con la etiqueta <i> ---
      return `
      <div class="flex items-center justify-between py-3 border-b last:border-none">
        <div class="flex items-center gap-3">
          <i class="fas ${iconClass} ${iconColor} text-2xl"></i>
          <div><p class="text-sm font-semibold text-gray-800">${m.name}</p><p class="text-xs text-gray-400 uppercase font-medium">${m.type} • ${m.size}</p></div>
        </div>
        <button onclick="handleFileDownload(${m.id})" class="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"><i class="fas fa-download text-lg"></i></button>
      </div>`;
    }).join('');
  }

  function renderModules() {
    const cont = document.getElementById('modules-grid');
    if (!cont) return;
    cont.innerHTML = Object.values(state.modules).map(m => {
      const barColor = m.progress === 100 ? 'bg-green-500' : 'bg-red-600';
      return `
      <div class="module-card bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full">
        <img src="${m.img}" onerror="this.src='https://via.placeholder.com/300x140?text=Modulo'" class="h-32 w-full object-cover">
        <div class="p-4 flex flex-col flex-grow">
          <h4 class="font-bold text-sm mb-1 text-gray-800">${m.name}</h4>
          <p class="text-[11px] text-gray-500 mb-3 flex-grow">${m.desc}</p>
          <div class="w-full bg-gray-100 rounded-full h-1.5 mb-2">
            <div class="${barColor} h-1.5 rounded-full transition-all" style="width:${m.progress}%"></div>
          </div>
          <div class="flex justify-between items-center mt-auto">
            <p class="text-[10px] text-gray-400">Progreso: ${m.progress}%</p>
            <button onclick="openModuleLessons(${m.id})" class="text-xs font-bold text-[#D91023] hover:underline">Continuar</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderSingers() {
  const grid = document.getElementById('singers-grid');
  if (!grid) return;

  grid.innerHTML = `
    <!-- Chabuca Granda -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
      <div class="p-4 border-b">
        <h4 class="font-bold text-gray-800 text-lg">Chabuca Granda</h4>
        <p class="text-xs text-gray-500">La poeta del criollismo.</p>
      </div>
      <div class="p-3 bg-gray-50">
        <iframe data-testid="embed-iframe" style="border-radius:12px"
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO3dTTwz?utm_source=generator"
          width="100%" height="152" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>

    <!-- Lucha Reyes -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
      <div class="p-4 border-b">
        <h4 class="font-bold text-gray-800 text-lg">Lucha Reyes</h4>
        <p class="text-xs text-gray-500">La Morena de Oro del Perú.</p>
      </div>
      <div class="p-3 bg-gray-50">
        <iframe data-testid="embed-iframe" style="border-radius:12px"
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DZ06evO35WKSd?utm_source=generator"
          width="100%" height="152" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>

    <!-- Óscar Avilés -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
      <div class="p-4 border-b">
        <h4 class="font-bold text-gray-800 text-lg">Óscar Avilés</h4>
        <p class="text-xs text-gray-500">La Primera Guitarra del Perú.</p>
      </div>
      <div class="p-3 bg-gray-50">
        <iframe data-testid="embed-iframe" style="border-radius:12px"
          src="https://open.spotify.com/embed/artist/2MmgnRT5i0nQpq9eQDLpke?utm_source=generator"
          width="100%" height="152" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>

    <!-- Eva Ayllón -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
      <div class="p-4 border-b">
        <h4 class="font-bold text-gray-800 text-lg">Eva Ayllón</h4>
        <p class="text-xs text-gray-500">La reina del landó.</p>
      </div>
      <div class="p-3 bg-gray-50">
        <iframe data-testid="embed-iframe" style="border-radius:12px"
          src="https://open.spotify.com/embed/playlist/75PXVyVagS1hO4nrLedvFU?utm_source=generator"
          width="100%" height="152" frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"></iframe>
      </div>
    </div>
  `;
}


  function renderCommunity() {
    const feed = document.getElementById('community-feed');
    if (!feed) return;
    feed.innerHTML = state.communityPosts.map(post => `
      <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-50 transition hover:border-red-100 mb-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-bold text-red-500 text-xs">${post.author.charAt(0)}</div>
          <div>
            <h4 class="font-bold text-sm text-gray-800 leading-none">${post.author}</h4>
            <p class="text-[10px] text-gray-400 mt-1">${post.time}</p>
          </div>
        </div>
        <p class="text-gray-600 text-sm leading-relaxed mb-4">${post.content}</p>
        <div class="flex gap-4 border-t pt-3">
          <button class="text-gray-400 text-xs hover:text-red-500 transition"><i class="far fa-heart mr-1"></i> ${post.likes}</button>
          <button class="text-gray-400 text-xs hover:text-blue-500 transition"><i class="far fa-comment mr-1"></i> Responder</button>
        </div>
      </div>`).join('');
  }

  function renderEvents() {
    const list = document.getElementById('events-list');
    if (!list) return;
    list.innerHTML = state.events.map(ev => `
      <div class="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center mb-3">
        <div>
          <h4 class="font-bold text-sm text-gray-800">${ev.title}</h4>
          <p class="text-[10px] text-gray-400 mt-1">${ev.time} • ${ev.place}</p>
          <p class="text-xs font-semibold text-green-600 mt-1">S/ ${ev.price.toFixed(2)}</p>
        </div>
        <button onclick="buyTicket(${ev.id})" class="text-xs text-red-600 font-bold hover:underline">Comprar</button>
      </div>`).join('');
  }

  function renderProfile() {
    if (!state.user) return;
    document.getElementById('profile-name-display').textContent = state.user.name;
    document.getElementById('stat-events').textContent = state.purchases.length;
    document.getElementById('stat-modules').textContent = Object.keys(state.modules).length;
    const totalDone = Object.values(state.modules).reduce((acc, curr) => acc + curr.lessonsCompleted.length, 0);
    document.getElementById('stat-points').textContent = (state.purchases.length * 50) + (totalDone * 10);
    const history = document.getElementById('purchase-history-list');
    history.innerHTML = state.purchases.length ? state.purchases.map(p => `
      <div class="p-4 flex justify-between items-center border-b border-gray-50">
        <div><p class="text-sm font-bold text-gray-800">${p.title}</p><p class="text-[10px] text-gray-400">${p.date}</p></div>
        <i class="fas fa-print text-red-500 cursor-pointer" onclick="buyTicket(${p.id})"></i>
      </div>`).join('') : '<p class="p-6 text-center text-xs text-gray-400">Sin compras aún</p>';
  }

  // --- 9. NAVEGACIÓN Y AUTH (LOGICA DE CAMBIO DE USUARIO) ---
  function showSection(id) {
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.nav-item').forEach(n => {
        const active = n.dataset.target === id;
        n.classList.toggle('text-[#D91023]', active);
        n.classList.toggle('text-gray-400', !active);
    });
    if (id === 'profile-section') renderProfile();
    if (id === 'tourism-section') { renderSingers(); renderEvents(); }
    if (id === 'community-section') renderCommunity();
  }

  let isLoginMode = true;
  function openAuth(mode) {
    isLoginMode = mode === 'login';
    document.getElementById('auth-title').textContent = isLoginMode ? 'Ingresar' : 'Registrarse';
    document.getElementById('field-name').classList.toggle('hidden', isLoginMode);
    document.getElementById('auth-overlay').classList.remove('hidden');
    document.getElementById('auth-toggle-btn').textContent = isLoginMode ? 'Regístrate' : 'Inicia sesión';
  }

  function applyUserUI() {
    const isL = !!state.user;
    document.getElementById('guest-actions').classList.toggle('hidden', isL);
    document.getElementById('user-actions').classList.toggle('hidden', !isL);
    if (isL) {
      document.getElementById('header-username').textContent = state.user.name;
      if (document.getElementById('profile-name-display')) document.getElementById('profile-name-display').textContent = state.user.name;
    }
  }

  // --- 10. INICIALIZACIÓN ---
  document.addEventListener('DOMContentLoaded', () => {
    loadState(); renderMaterials(); renderModules();
    document.getElementById('btn-open-login').onclick = () => openAuth('login');
    document.getElementById('btn-open-register').onclick = () => openAuth('register');
    document.getElementById('auth-toggle-btn').onclick = () => openAuth(isLoginMode ? 'register' : 'login');
    document.getElementById('close-auth').onclick = () => document.getElementById('auth-overlay').classList.add('hidden');
    document.getElementById('close-lessons').onclick = () => document.getElementById('lessons-modal').classList.add('hidden');
    
    const publishBtn = document.querySelector('#community-section button[onclick*="showToast"]');
    if (publishBtn) {
        publishBtn.removeAttribute('onclick'); 
        publishBtn.onclick = handleNewPost;    
    }

    document.getElementById('auth-form').onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('input-email').value, pass = document.getElementById('input-password').value;
      
      if (isLoginMode) {
        const u = state.registeredUsers.find(r => r.email === email && r.password === pass);
        if (u) { 
          state.user = u; 
          // CARGAR EL HISTORIAL ESPECÍFICO DEL USUARIO
          if (u.history) {
            state.modules = u.history.modules;
            state.purchases = u.history.purchases;
          }
          saveState(); 
          applyUserUI(); 
          renderModules(); 
          document.getElementById('auth-overlay').classList.add('hidden'); 
          showToast('¡Bienvenido!'); 
        }
        else showToast('Datos incorrectos', 'error');
      } else {
        const name = document.getElementById('input-name').value;
        if (!name || !email || !pass) return showToast('Completa todos los campos', 'error');
        // CREAR USUARIO CON HISTORIAL INICIAL LIMPIO
        const newUser = { 
          name, 
          email, 
          password: pass, 
          history: { modules: initialModules, purchases: [] } 
        };
        state.registeredUsers.push(newUser); 
        state.user = newUser;
        state.modules = initialModules;
        state.purchases = [];
        saveState(); 
        applyUserUI(); 
        renderModules();
        document.getElementById('auth-overlay').classList.add('hidden'); 
        showToast('Registro exitoso');
      }
    };

    document.getElementById('btn-logout').onclick = () => { 
      state.user = null; 
      // RESETEAR EL PROGRESO VISUAL AL CERRAR SESIÓN (GUEST)
      state.modules = initialModules;
      state.purchases = [];
      saveState(); 
      applyUserUI(); 
      renderModules();
      renderMaterials();
      showSection('education-section'); 
    };

    document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => showSection(btn.dataset.target));
    showSection('education-section');
  });

})();