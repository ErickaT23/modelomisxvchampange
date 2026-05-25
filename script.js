document.documentElement.classList.add('js-anim');

document.addEventListener('DOMContentLoaded', async function() {
    await hydrateSiteConfigForEvent();
    applySiteConfig();
    await InvitadoApp.init();
    MusicBubble.init();
    MensajeFlota.init();
    initPortada();
    initScrollAnimations();
    initCountdown();
    initCountdownParallax();
    initEventButtonsParallax();
    initRotatingSeparator();
    initAutoGallery();
    initRSVP();
    initGiftModal();
});

const externalConfig = window.config || {};

function resolveEventId() {
    const eventConfig = externalConfig.event || {};
    const eventIdParam = String(eventConfig.eventIdParam || 'eventId').trim() || 'eventId';
    const defaultEventId = String(eventConfig.defaultEventId || 'misxv-zoe-daniela-2026').trim() || 'misxv-zoe-daniela-2026';
    const params = new URLSearchParams(window.location.search || '');
    const paramValue = String(params.get(eventIdParam) || '').trim();
    const eventId = paramValue || defaultEventId;

    return {
        eventId,
        eventIdParam,
        defaultEventId
    };
}

const EventContext = resolveEventId();
window.EventContext = EventContext;
window.currentEventId = EventContext.eventId;

function normalizeRemoteEventConfig(rawConfig) {
    if (!rawConfig || typeof rawConfig !== 'object') return {};

    const remoteEvento = rawConfig.evento && typeof rawConfig.evento === 'object'
        ? rawConfig.evento
        : {};
    const remoteCeremonia = (remoteEvento.ceremonia && typeof remoteEvento.ceremonia === 'object'
        ? remoteEvento.ceremonia
        : rawConfig.ceremonia) || {};
    const remoteRecepcion = (remoteEvento.recepcion && typeof remoteEvento.recepcion === 'object'
        ? remoteEvento.recepcion
        : rawConfig.recepcion) || {};

    return {
        ...rawConfig,
        evento: {
            ...remoteEvento,
            ceremonia: {
                ...remoteCeremonia,
                ubicacionUrl: remoteCeremonia.ubicacionUrl || remoteCeremonia.ubicacion || ''
            },
            recepcion: {
                ...remoteRecepcion,
                ubicacionUrl: remoteRecepcion.ubicacionUrl || remoteRecepcion.ubicacion || ''
            }
        }
    };
}

function createSiteConfig(remoteConfig) {
    const normalizedRemoteConfig = normalizeRemoteEventConfig(remoteConfig);
    const localEvento = (externalConfig && externalConfig.evento) || {};
    const remoteEvento = normalizedRemoteConfig.evento || {};

    return {
        seo: {
            titulo: 'Anika Fernanda | Mis XV 2026',
            descripcion: 'Mis Quince Años de Anika Fernanda - 12 de diciembre, 2026',
            autor: 'Two Design',
            ...externalConfig.seo,
            ...normalizedRemoteConfig.seo
        },
        pareja: {
            nombres: 'Anika Fernanda',
            fecha: '12-12-2026',
            fechaVisible: '12.12.2026',
            ...externalConfig.pareja,
            ...normalizedRemoteConfig.pareja
        },
        musica: {
            titulo: 'Nuestra Cancion',
            archivo: 'audio/nuestra-cancion.mp3',
            ...externalConfig.musica,
            ...normalizedRemoteConfig.musica
        },
        evento: {
            ceremonia: {
                titulo: 'Ceremonia',
                lugar: 'Iglesia Catedral',
                hora: '17:00 hrs',
                direccion: 'Quetzaltenango',
                ubicacionUrl: 'https://maps.app.goo.gl/UR8YG5dqu9fzo5NeA',
                ...(localEvento.ceremonia || {}),
                ...(remoteEvento.ceremonia || {})
            },
            recepcion: {
                titulo: 'Recepción',
                lugar: 'Restaurante Don Carlos',
                hora: '19:00 hrs',
                direccion: 'Circunvalación Salcajá',
                ubicacionUrl: 'https://maps.app.goo.gl/AHz7RSJHoNs1GPiV7',
                ...(localEvento.recepcion || {}),
                ...(remoteEvento.recepcion || {})
            }
        },
        textos: {
            mensajeInvitado: 'Tu presencia es nuestra mayor bendicion. Hemos reservado para ustedes:',
            mensajePases: '{pases} lugares',
            ...externalConfig.textos,
            ...normalizedRemoteConfig.textos
        },
        footer: {
            hashtag: '#MisXVAnikaFernanda',
            instagramUrl: 'https://instagram.com/rocio.fernando.boda',
            facebookUrl: 'https://facebook.com/rociofernandoboda',
            marcaTexto: 'Diseno',
            marcaNombre: 'Two Design',
            marcaUrl: 'https://twodesign.com',
            ...externalConfig.footer,
            ...normalizedRemoteConfig.footer
        }
    };
}

let SiteConfig = createSiteConfig();
window.SiteConfig = SiteConfig;

async function hydrateSiteConfigForEvent() {
    try {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.getEventConfig !== 'function') return;

        const eventId = String(window.currentEventId || '').trim();
        const remoteConfig = await rsvpDB.getEventConfig(eventId);
        if (!remoteConfig || typeof remoteConfig !== 'object') return;

        SiteConfig = createSiteConfig(remoteConfig);
        window.SiteConfig = SiteConfig;
    } catch (error) {
        console.warn('No se pudo cargar configuración remota del evento. Se usará config local:', error);
    }
}

function splitPairNames(nombres) {
    const safeNombres = String(nombres || '').trim();
    const parts = safeNombres.split('&');
    const left = (parts[0] || '').trim();
    const right = (parts[1] || '').trim();
    return { left, right };
}

function setStyledWord(container, word) {
    if (!container) return;
    const initialEl = container.querySelector('.inicial, .musica-inicial, .event-inicial');
    const restEl = container.querySelector('.resto, .musica-resto, .event-resto');
    const safeWord = String(word || '').trim();

    if (!safeWord) return;
    if (initialEl) initialEl.textContent = safeWord.charAt(0);
    if (restEl) restEl.textContent = safeWord.slice(1);
}

function applySiteConfig() {
    applySeoConfig();
    const { left, right } = splitPairNames(SiteConfig.pareja.nombres);

    const portadaNames = document.querySelectorAll('.portada-nombres .nombre');
    if (portadaNames[0]) setStyledWord(portadaNames[0], left);
    if (portadaNames[1]) setStyledWord(portadaNames[1], right);

    const heroNames = document.querySelectorAll('.hero-invitado-nombres .nombre');
    if (heroNames[0]) setStyledWord(heroNames[0], left);
    if (heroNames[1]) setStyledWord(heroNames[1], right);

    const heroDate = document.querySelector('.hero-invitado-fecha');
    if (heroDate) heroDate.textContent = SiteConfig.pareja.fechaVisible;

    const invitadoMensaje = document.querySelector('.invitado-mensaje');
    if (invitadoMensaje) invitadoMensaje.textContent = SiteConfig.textos.mensajeInvitado;

    applyEventCard('.events-container .event-card:nth-child(1)', SiteConfig.evento.ceremonia);
    applyEventCard('.events-container .event-card:nth-child(2)', SiteConfig.evento.recepcion);
    applyFooterConfig();
    MusicBubble.applyConfig();
}

function applySeoConfig() {
    if (SiteConfig.seo.titulo) {
        document.title = SiteConfig.seo.titulo;
    }

    setMetaContent('description', SiteConfig.seo.descripcion);
    setMetaContent('author', SiteConfig.seo.autor);
}

function setMetaContent(name, value) {
    if (!value) return;
    const meta = document.querySelector('meta[name="' + name + '"]');
    if (!meta) return;
    meta.setAttribute('content', value);
}

function applyEventCard(selector, data) {
    const card = document.querySelector(selector);
    if (!card || !data) return;

    const initial = card.querySelector('.event-inicial');
    const rest = card.querySelector('.event-resto');
    const titulo = String(data.titulo || '').trim();
    if (titulo) {
        if (initial) initial.textContent = titulo.charAt(0);
        if (rest) rest.textContent = titulo.slice(1);
    }

    const timeEl = card.querySelector('.event-time');
    const lugarEl = card.querySelector('.event-lugar');
    const direccionEl = card.querySelector('.event-direccion');
    const linkEl = card.querySelector('.btn-location');

    if (timeEl) timeEl.textContent = data.hora || '';
    if (lugarEl) lugarEl.textContent = data.lugar || '';
    if (direccionEl) direccionEl.textContent = data.direccion || '';
    if (linkEl) linkEl.setAttribute('href', data.ubicacionUrl || '#');
}

function applyFooterConfig() {
    const instagramEl = document.querySelector('#social-icons a[aria-label="Instagram"]');
    if (instagramEl && SiteConfig.footer.instagramUrl) {
        instagramEl.setAttribute('href', SiteConfig.footer.instagramUrl);
    }

    const facebookEl = document.querySelector('#social-icons a[aria-label="Facebook"]');
    if (facebookEl && SiteConfig.footer.facebookUrl) {
        facebookEl.setAttribute('href', SiteConfig.footer.facebookUrl);
    }
}

// ============================================
// CONFIGURACIÓN - Editar aquí los invitados
// ============================================
const GuestConfig = {
    invitados: {
        "1": { nombre: "Sra. Carmen De León", pases: 1 },
        "2": { nombre: "Sr. Jorge Rodríguez y familia.", pases: 5 },
        "3": { nombre: "Sr. Francisco Rodríguez y familia.", pases: 3 },
        "4": { nombre: "Sra. Eugenia Estacuy y familia.", pases: 2 },
        "5": { nombre: "Sr. Gustavo Estacuy y familia.", pases: 4 },
        "6": { nombre: "Sr. Juan Ramón Alvarado y familia.", pases: 2 },
        "7": { nombre: "Sr. Rodolfo Robles y familia.", pases: 4 },
        "8": { nombre: "Sr. Mario Roberto Fernández y familia.", pases: 5 },
        "9": { nombre: "Sra. Carmen María Alvarado y familia.", pases: 5 },
        "10": { nombre: "Sr. Juan Carlos Alvarado y familia.", pases: 5 },
        "11": { nombre: "Sr. Carlos De León y familia.", pases: 2 },
        "12": { nombre: "Sr. Carlos Enrique de León y familia.", pases: 2 },
        "13": { nombre: "Sra, Anaydee de León y familia.", pases: 4 },
        "14": { nombre: "Sr. Luis Enrique de León y familia.", pases: 2 },
        "15": { nombre: "Sr. Frank Mancilla y familia.", pases: 4 },
        "16": { nombre: "Sr. Ivan Florian y familia.", pases: 2 },
        "17": { nombre: "Sr. Otto Rodríguez", pases: 1 },
        "18": { nombre: "Sra. Mareli Rodríguez y familia.", pases: 2 },
        "19": { nombre: "Sra. Maria del Carmen Rodríguez y familia.", pases: 3 },
        "20": { nombre: "Sr. Victor Manuel Say y familia.", pases: 3 },
        "21": { nombre: "Sra. Judith Rodríguez", pases: 1 },
        "22": { nombre: "Sr, Raúl Calito y familia.", pases: 3 },
        "23": { nombre: "Sr. Darío Díaz y familia.", pases: 5 },
        "24": { nombre: "Sr. Nestor Rodas y familia.", pases: 4 },
        "25": { nombre: "Sr. Enrique Vidal y familia.", pases: 2 },
        "26": { nombre: "Srita. Maritza González", pases: 1 },
        "27": { nombre: "Familia Ochoa de León", pases: 2 },
        "28": { nombre: "Paola Ochoa e Hijo", pases: 2 },
        "29": { nombre: "Familia Alvarado Ovalle", pases: 3 },
        "30": { nombre: "Familia Dominguez Morales", pases: 4 },
        "31": { nombre: "Familia Diaz Castillo", pases: 4 },
        "32": { nombre: "Familia Dominguez Rivera", pases: 2 },
        "33": { nombre: "Hector Bachez Ochoa", pases: 2 },
        "34": { nombre: "Licda. Magda Salazar", pases: 1 },
        "35": { nombre: "Familia Obregón Salazar", pases: 2 },
        "36": { nombre: "Carmen Natareno e Hijo", pases: 2 },
        "37": { nombre: "Roberto Leal y Familia", pases: 3 },
        "38": { nombre: "Familia Leal Sarmiento", pases: 4 },
        "39": { nombre: "Sra. Maribel de León", pases: 1 },
        "40": { nombre: "Sra. Angelica de León", pases: 1 },
        "41": { nombre: "Evelyn Ochoa", pases: 1 },
        "42": { nombre: "Eduardo Ochoa y Familia", pases: 4 },
        "43": { nombre: "Diogenes Ochoa y Familia", pases: 4 },
        "44": { nombre: "Jorge Roberto Ochoa y Familia", pases: 4 },
        "45": { nombre: "Familia Gonzalez Lorenzana", pases: 4 },
        "46": { nombre: "Licda. Ada Ojer y Familia", pases: 4 },
        "47": { nombre: "Familia Santizo", pases: 4 },
        "48": { nombre: "Familia Rodriguez Ochoa", pases: 5 },
        "49": { nombre: "Cristian Castillo y Familia", pases: 2 },
        "50": { nombre: "Karolselen Castillo y Familia", pases: 4 },
        "51": { nombre: "Sra. Debora Ochoa", pases: 1 },
        "52": { nombre: "Veronica Lobos y Familia", pases: 5 },
        "53": { nombre: "Familia Barrios Argueta", pases: 4 },
        "54": { nombre: "Veronica Sarai", pases: 1 },
        "55": { nombre: "Alejandro Garcia", pases: 1 },
        "56": { nombre: "Gizzel Chacon", pases: 1 },
        "57": { nombre: "Rafael Velazquez", pases: 1 },
        "58": { nombre: "Roberto Barillas", pases: 1 },
        "59": { nombre: "Ethan Rojas", pases: 1 },
        "60": { nombre: "David Mazariegos", pases: 1 },
        "61": { nombre: "Josue Samayoa", pases: 1 },
        "62": { nombre: "Rodrigo Domínguez", pases: 1 },
        "63": { nombre: "Danilo Gramajo", pases: 2 },
        "64": { nombre: "Sebastian Blanco", pases: 1 },
        "65": { nombre: "Isaias Santizo", pases: 1 },
        "66": { nombre: "Cesar Calderon", pases: 1 },
        "67": { nombre: "Fernando Rivera", pases: 1 },
        "68": { nombre: "Regina Borrayo", pases: 1 },
        "69": { nombre: "Natalia Albisurez", pases: 1 },
        "70": { nombre: "Sebastian Fernandez", pases: 1 },
        "71": { nombre: "Jose Polanco", pases: 1 },
        "72": { nombre: "Victor Robles", pases: 1 },
        "73": { nombre: "Magnolia Calderon", pases: 1 },
        "74": { nombre: "Maria Quan", pases: 1 },
        "75": { nombre: "Tiffanie Lam", pases: 1 },
        "76": { nombre: "Dulce Calderon", pases: 1 },
        "77": { nombre: "Carmen Noriega", pases: 1 },
        "78": { nombre: "Hermanos Alvarado", pases: 2 },
        "79": { nombre: "Samanta Fernandez", pases: 1 },
        "80": { nombre: "Dana Garcia", pases: 1 },
        "81": { nombre: "Joser Barrios", pases: 1 },
        "82": { nombre: "Andres Quintero", pases: 1 },
        "83": { nombre: "Fernanda Davila", pases: 1 },
        "84": { nombre: "Ronald Tzul", pases: 1 },
        "85": { nombre: "Sebastian Estacuy", pases: 1 },
        "86": { nombre: "Emiliano Dominguez", pases: 1 },
        "87": { nombre: "Yordi Hervias", pases: 1 },
        "88": { nombre: "Diana Rendon", pases: 1 },
        "89": { nombre: "Zoe", pases: 1 },
        "90": { nombre: "Arturo Reyna", pases: 3 },
        "91": { nombre: "Santiago Hernandez", pases: 1 },
        "92": { nombre: "Mariandre Pisqui", pases: 1 },
        "93": { nombre: "Sofia Rueda", pases: 2 },
        "94": { nombre: "Dylan Dareth", pases: 1 },
        "95": { nombre: "Sergio Marroquin", pases: 1 },
        "96": { nombre: "Adrian Avalos", pases: 1 },
        "97": { nombre: "Ariany", pases: 1 },
        "98": { nombre: "Valeria de León", pases: 1 },
        "99": { nombre: "Familia del Valle Rodas", pases: 3 },
        "100": { nombre: "Alessandro Loarca", pases: 1 },
        "101": { nombre: "Sofia de Leon", pases: 1 },
        "102": { nombre: "Natalia de leon", pases: 1 },
        "103": { nombre: "Luciano Monterroso", pases: 1 },
        "104": { nombre: "Jonathan Jeshke", pases: 1 },
        "105": { nombre: "Emil Vondemart", pases: 1 },
        "106": { nombre: "Fernando Hernandez", pases: 1 },
        "107": { nombre: "Martin Galindo", pases: 2 },
        "108": { nombre: "Lindsay Veliz", pases: 1 },
        "109": { nombre: "Javier Escalante", pases: 1 },
        "110": { nombre: "Adriana Uribe", pases: 1 },
        "111": { nombre: "Allyson Minnely", pases: 1 },
        "112": { nombre: "Camila", pases: 1 },
        "113": { nombre: "Melany Vasquez", pases: 1 },
        "114": { nombre: "Carlos Tucux", pases: 1 },
        "3B": { nombre: "Compañeros y Compañeras de 3ro. Básico", pases: 20 }
    },
    invitadoDefault: { nombre: "Invitado Especial", pases: 2 },
    paramId: 'id'
};

window.GuestConfig = GuestConfig;

// ============================================
// APP DE INVITADOS - Lógica reutilizable
// ============================================
const InvitadoApp = {
    data: null,

    async init() {
        const localGuest = this.getLocalFromURL();
        const remoteGuest = await this.getRemoteGuest(localGuest.id);
        this.data = remoteGuest || localGuest;
        this.renderSection();
        this.renderRSVP();
        return this.data;
    },

    getLocalFromURL() {
        const params = new URLSearchParams(window.location.search);
        const rawId = String(params.get(GuestConfig.paramId) || '').trim();
        const safeId = rawId || 'default';
        const invitado = GuestConfig.invitados[rawId];

        if (invitado) {
            return {
                id: safeId,
                nombre: String(invitado.nombre || ''),
                pases: Math.max(1, Number(invitado.pases) || 1),
                activo: true
            };
        }

        return {
            id: safeId,
            nombre: String(GuestConfig.invitadoDefault.nombre || ''),
            pases: Math.max(1, Number(GuestConfig.invitadoDefault.pases) || 1),
            activo: true
        };
    },

    async getRemoteGuest(guestId) {
        try {
            const rsvpDB = window.RSVPDatabase;
            if (!rsvpDB || typeof rsvpDB.getInvitadoById !== 'function') return null;

            const eventId = String(window.currentEventId || '').trim();
            const remoteGuest = await rsvpDB.getInvitadoById(eventId, guestId);
            if (!remoteGuest || typeof remoteGuest !== 'object') return null;

            return {
                id: String(remoteGuest.id || guestId || 'default'),
                nombre: String(remoteGuest.nombre || '').trim() || String(GuestConfig.invitadoDefault.nombre || ''),
                pases: Math.max(1, Number(remoteGuest.pases) || Number(GuestConfig.invitadoDefault.pases) || 1),
                activo: typeof remoteGuest.activo === 'undefined' ? true : Boolean(remoteGuest.activo)
            };
        } catch (error) {
            console.warn('No se pudo cargar invitado remoto. Se usará fallback local:', error);
            return null;
        }
    },

    renderSection() {
        const nombreEl = document.getElementById('nombre-invitado');

        if (nombreEl) nombreEl.textContent = this.data.nombre;
        const displayPases = String(this.data && this.data.id || '') === '3B' ? 1 : this.data.pases;
        this.renderPasesText(displayPases);
    },

    renderPasesText(pases) {
        const lugaresEl = document.querySelector('.invitado-lugares');
        if (!lugaresEl) return;

        const template = String(SiteConfig.textos.mensajePases || '{pases} lugares');
        const withPases = template.replace('{pases}', String(pases));
        lugaresEl.textContent = pases === 1
            ? withPases
                .replace(/\blugares\s+especiales\b/gi, 'lugar especial')
                .replace(/\blugares\b/gi, 'lugar')
                .replace(/\bespeciales\b/gi, 'especial')
            : withPases;
    },

    renderRSVP() {
        const nameInput = document.getElementById('rsvp-name');
        const guestsWrapper = document.getElementById('guest-count-wrapper');
        const guestsSelect = document.getElementById('guest-count');
        const responseYes = document.getElementById('rsvp-response-yes');
        const responseNo = document.getElementById('rsvp-response-no');
        const isSpecialGroup = String(this.data && this.data.id || '') === '3B';
        const totalPases = isSpecialGroup ? 1 : Math.max(1, Number(this.data && this.data.pases) || 1);

        if (nameInput) {
            nameInput.value = this.data.nombre;
            nameInput.readOnly = true;
        }

        if (guestsSelect) {
            guestsSelect.replaceChildren();

            for (let i = 1; i <= totalPases; i += 1) {
                const option = document.createElement('option');
                option.value = String(i);
                option.textContent = i === 1 ? '1 invitado' : i + ' invitados';
                guestsSelect.appendChild(option);
            }

            guestsSelect.value = String(totalPases);
            guestsSelect.disabled = true;
            guestsSelect.required = false;
        }

        if (guestsWrapper) {
            guestsWrapper.style.display = 'none';
        }
        if (responseYes) responseYes.checked = false;
        if (responseNo) responseNo.checked = false;
    },

    getData() {
        return this.data;
    }
};

function initPortada() {
    const portada = document.getElementById('portada');
    const btnAbrir = document.getElementById('btn-abrir');
    const envelopeTrigger = document.getElementById('portada-envelope-trigger');
    const invitacion = document.getElementById('invitacion');
    
    if (!portada || !btnAbrir || !invitacion) return;

    function openInvitation() {
        MusicBubble.startFromUserGesture();
        document.body.style.overflow = 'auto';
        document.body.classList.remove('portada-lock');

        invitacion.style.display = 'block';
        invitacion.style.visibility = 'visible';
        invitacion.setAttribute('aria-hidden', 'false');
        invitacion.inert = false;
        
        portada.classList.add('abrir');
        invitacion.classList.add('revelar');
        MensajeFlota.mostrar();
        
        setTimeout(function() {
            portada.style.display = 'none';
            MusicBubble.reveal();
        }, 1200);
    }

    btnAbrir.addEventListener('click', openInvitation);
    if (envelopeTrigger) {
        envelopeTrigger.addEventListener('click', openInvitation);
    }
}

// ============================================
// MENSAJE FLOTANTE
// ============================================
const MensajeFlota = {
    el: null,
    hideTimer: null,

    init() {
        this.el = document.getElementById('scroll-hint');
    },

    mostrar() {
        if (!this.el) return;

        if (this.hideTimer) {
            window.clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }

        this.el.style.transform = 'translateX(-50%) translateY(0)';
        this.el.classList.add('mostrar');

        this.hideTimer = window.setTimeout(() => {
            this.el.classList.remove('mostrar');
            this.el.style.transform = 'translateX(-50%) translateY(8px)';
        }, 10000);
    }
};

const MusicBubble = {
    button: null,
    icon: null,
    audio: null,
    isPlaying: false,

    init() {
        this.button = document.getElementById('music-fab');
        this.icon = this.button ? this.button.querySelector('.music-fab-icon') : null;
        this.audio = document.getElementById('bg-music');
        if (!this.button || !this.audio) return;

        this.audio.volume = 0.65;
        this.button.addEventListener('click', () => this.togglePlayback());
        this.syncVisualState(false);
    },

    applyConfig() {
        if (!this.audio) return;
        const configuredSrc = String((SiteConfig.musica && SiteConfig.musica.archivo) || '').trim();
        if (!configuredSrc) return;

        const source = this.audio.querySelector('source');
        if (source && source.getAttribute('src') !== configuredSrc) {
            source.setAttribute('src', configuredSrc);
            this.audio.load();
        }
    },

    async startFromUserGesture() {
        if (!this.audio || !this.button) return;

        try {
            await this.audio.play();
            this.isPlaying = true;
            this.syncVisualState(true);
        } catch (error) {
            this.isPlaying = false;
            this.syncVisualState(false);
            console.warn('No se pudo iniciar la musica automaticamente:', error);
        }
    },

    reveal() {
        if (!this.button) return;
        this.button.hidden = false;
        window.requestAnimationFrame(() => {
            this.button.classList.add('is-visible');
        });
    },

    async togglePlayback() {
        if (!this.audio) return;

        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.syncVisualState(false);
            return;
        }

        try {
            await this.audio.play();
            this.isPlaying = true;
            this.syncVisualState(true);
        } catch (error) {
            this.isPlaying = false;
            this.syncVisualState(false);
            console.warn('No se pudo reanudar la musica:', error);
        }
    },

    syncVisualState(playing) {
        if (!this.button) return;
        this.button.classList.toggle('is-playing', playing);
        this.button.setAttribute('aria-label', playing ? 'Pausar musica' : 'Reproducir musica');
        if (this.icon) this.icon.textContent = playing ? '♫' : '♪';
    }
};

function initScrollAnimations() {
    const elements = document.querySelectorAll('.section, .separator, .footer, .fade-in-element, .zoom-in-element');

    elements.forEach((element, index) => {
        const revealOrder = index % 4;
        element.style.setProperty('--reveal-order', String(revealOrder));
    });
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.14
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

function initCountdown() {
    const eventDate = getEventDateFromConfig();
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;
        
        if (distance < 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function initCountdownParallax() {
    const calendarBtn = document.querySelector('.countdown-calendar');
    if (!calendarBtn) return;

    function updateCalendarParallax() {
        const offset = window.scrollY * 0.04;
        calendarBtn.style.setProperty('--calendar-parallax', offset + 'px');
    }

    updateCalendarParallax();
    window.addEventListener('scroll', updateCalendarParallax, { passive: true });
}

function initEventButtonsParallax() {
    const buttons = Array.from(document.querySelectorAll('.event-parallax-btn'));
    if (buttons.length === 0) return;

    function updateEventButtonsParallax() {
        const offset = window.scrollY * 0.035;
        buttons.forEach((button) => {
            button.style.setProperty('--event-btn-parallax', offset + 'px');
        });
    }

    updateEventButtonsParallax();
    window.addEventListener('scroll', updateEventButtonsParallax, { passive: true });
}

function getEventDateFromConfig() {
    const rawDate = String((SiteConfig.pareja && SiteConfig.pareja.fecha) || '').trim();
    const parts = rawDate.split('-');

    if (parts.length === 3) {
        const day = Number(parts[0]);
        const monthIndex = Number(parts[1]) - 1;
        const year = Number(parts[2]);
        const parsedDate = new Date(year, monthIndex, day, 0, 0, 0, 0);

        if (!Number.isNaN(parsedDate.getTime())) {
            return parsedDate.getTime();
        }
    }

    return new Date('2026-12-12T00:00:00').getTime();
}

function initRotatingSeparator() {
    const separatorImage = document.getElementById('separador-v2-rotativo');
    if (!separatorImage) return;

    const images = [
        'images/fotos/V7.jpg',
        'images/fotos/V8.jpg',
        'images/fotos/V9.jpg',
        'images/fotos/V10.jpg'
    ];

    let currentIndex = Math.max(0, images.indexOf(separatorImage.getAttribute('src') || ''));

    window.setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        separatorImage.setAttribute('src', images[currentIndex]);
    }, 5000);
}

function initAutoGallery() {
    const section = document.getElementById('gallery-auto');
    if (!section) return;

    const slides = Array.from(section.querySelectorAll('.gallery-auto-slide'));
    if (slides.length === 0) return;

    let currentIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    if (currentIndex < 0 || currentIndex >= slides.length) currentIndex = 0;

    const intervalMs = 5200;
    let timerId = null;

    function render(index) {
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
    }

    function goTo(index) {
        currentIndex = (index + slides.length) % slides.length;
        render(currentIndex);
    }

    function next() {
        goTo(currentIndex + 1);
    }

    function startAutoplay() {
        stopAutoplay();
        timerId = window.setInterval(next, intervalMs);
    }

    function stopAutoplay() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    section.addEventListener('mouseenter', stopAutoplay);
    section.addEventListener('mouseleave', startAutoplay);

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    render(currentIndex);
    startAutoplay();
}

function initRSVP() {
    const form = document.getElementById('rsvp-form');
    const successMessage = document.getElementById('rsvp-success');
    const finalMessage = document.getElementById('rsvp-final-message');
    const introMessage = document.querySelector('#rsvp-section .rsvp-intro');
    const submitBtn = document.getElementById('rsvp-submit');
    const confirmationMessages = {
        si: 'Gracias por confirmar tu asistencia. Nos vemos pronto.',
        no: 'Lamentamos que no puedas acompañarnos, te extrañaremos.'
    };
    const activeEventId = String(window.currentEventId || '').trim();
    const specialGroupId = '3B';
    let formLocked = false;
    let isCheckingStatus = false;
    const previewMode = Boolean(externalConfig && externalConfig.event && externalConfig.event.previewMode);
    const defaultIntroText = introMessage ? introMessage.textContent : '';
    const confirmedIntroText = 'Gracias por haber completado el formulario de asistencia.';
    
    if (!form) return;

    function getOrCreatePopup() {
        let overlay = document.getElementById('rsvp-popup-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'rsvp-popup-overlay';
            overlay.className = 'rsvp-popup-overlay';
            overlay.innerHTML = '<div class="rsvp-popup" role="dialog" aria-modal="true" aria-live="polite"></div>';
            document.body.appendChild(overlay);

            overlay.addEventListener('click', function(event) {
                if (event.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        }

        return overlay;
    }

    function placePopupNearRSVP() {
        const overlay = document.getElementById('rsvp-popup-overlay');
        const rsvpSection = document.getElementById('rsvp-section');
        if (!overlay || !rsvpSection) return;

        const rect = rsvpSection.getBoundingClientRect();
        overlay.style.inset = 'auto';
        overlay.style.left = Math.max(0, rect.left) + 'px';
        overlay.style.top = Math.max(0, rect.top) + 'px';
        overlay.style.width = Math.max(1, rect.width) + 'px';
        overlay.style.height = Math.max(1, rect.height) + 'px';
        overlay.style.padding = '0.6rem';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
    }

    function showDecisionPopup(maxPases) {
        const overlay = getOrCreatePopup();
        const popup = overlay.querySelector('.rsvp-popup');
        if (!popup) return;

        const options = [];
        for (let i = 1; i <= maxPases; i += 1) {
            options.push('<option value="' + i + '">' + i + (i === 1 ? ' lugar' : ' lugares') + '</option>');
        }

        popup.classList.remove('is-error');
        popup.innerHTML = [
            '<h4 class="rsvp-popup-title">Confirmar Asistencia</h4>',
            '<p class="rsvp-popup-subtitle">Lugares reservados</p>',
            '<select id="rsvp-popup-count" class="rsvp-popup-select">' + options.join('') + '</select>',
            '<div class="rsvp-popup-actions">',
            '<button type="button" id="rsvp-popup-yes" class="rsvp-popup-btn">Sí, con mucho gusto</button>',
            '<button type="button" id="rsvp-popup-no" class="rsvp-popup-btn secondary">No, lamentablemente no podré</button>',
            '</div>'
        ].join('');

        const yesBtn = popup.querySelector('#rsvp-popup-yes');
        const noBtn = popup.querySelector('#rsvp-popup-no');
        const countSelect = popup.querySelector('#rsvp-popup-count');

        if (yesBtn) {
            yesBtn.addEventListener('click', function() {
                const selectedCount = Math.max(1, Number(countSelect && countSelect.value) || 1);
                processConfirmation('si', selectedCount);
            });
        }

        if (noBtn) {
            noBtn.addEventListener('click', function() {
                processConfirmation('no', 0);
            });
        }

        placePopupNearRSVP();
        overlay.classList.add('active');
    }

    function showResultPopup(message, isError) {
        const overlay = getOrCreatePopup();
        const popup = overlay.querySelector('.rsvp-popup');
        if (!popup) return;

        popup.classList.toggle('is-error', Boolean(isError));
        popup.innerHTML = [
            '<h4 class="rsvp-popup-title">Confirmar Asistencia</h4>',
            '<p class="rsvp-popup-message">' + message + '</p>',
            '<button type="button" class="rsvp-popup-close" aria-label="Cerrar mensaje">Aceptar</button>'
        ].join('');

        const closeBtn = popup.querySelector('.rsvp-popup-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                overlay.classList.remove('active');
            });
        }

        placePopupNearRSVP();
        overlay.classList.add('active');
    }

    function getDeviceKey() {
        const storageKey = 'rsvp-device-key::' + activeEventId + '::' + guestId;
        try {
            const existing = window.localStorage.getItem(storageKey);
            if (existing) return String(existing);
        } catch (error) {
            console.warn('No se pudo leer device key local:', error);
        }

        const parts = [
            String(navigator.userAgent || ''),
            String(navigator.language || ''),
            String(window.screen && window.screen.width || ''),
            String(window.screen && window.screen.height || ''),
            String(new Date().getTimezoneOffset() || '')
        ].join('|');
        let hash = 0;
        for (let i = 0; i < parts.length; i += 1) {
            hash = (hash << 5) - hash + parts.charCodeAt(i);
            hash |= 0;
        }
        const raw = 'dv_' + Math.abs(hash) + '_' + Math.floor(Math.random() * 1000000);
        try {
            window.localStorage.setItem(storageKey, raw);
        } catch (error) {
            console.warn('No se pudo guardar device key local:', error);
        }
        return raw;
    }

    function setConfirmedFormVisibility(confirmed) {
        form.hidden = confirmed;
        form.setAttribute('aria-hidden', confirmed ? 'true' : 'false');
        form.style.display = confirmed ? 'none' : '';
    }

    function setIntroMessageForConfirmed(confirmed) {
        if (!introMessage) return;
        introMessage.textContent = confirmed ? confirmedIntroText : defaultIntroText;
    }

    function setFormLocked(locked) {
        formLocked = locked;
        form.classList.toggle('is-locked', locked);

        const controls = form.querySelectorAll('input, select, textarea, button');
        controls.forEach(function(control) {
            if (control.id === 'rsvp-name') {
                control.readOnly = true;
                control.disabled = locked;
                return;
            }
            control.disabled = locked;
        });

        if (submitBtn) {
            submitBtn.disabled = locked;
            submitBtn.style.display = locked ? 'none' : '';
        }
    }

    function showPermanentMessage(respuesta) {
        const message = confirmationMessages[respuesta] || confirmationMessages.no;
        if (finalMessage) {
            finalMessage.textContent = message;
        }
        if (successMessage) {
            successMessage.style.display = 'block';
        }
    }

    function applyConfirmedState(record) {
        const respuesta = String(record && record.respuesta || '').toLowerCase() === 'si' ? 'si' : 'no';

        showPermanentMessage(respuesta);
        setFormLocked(true);
        setConfirmedFormVisibility(true);
        setIntroMessageForConfirmed(true);
    }

    async function getExistingConfirmation(guestId) {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.getConfirmationByGuestId !== 'function') return null;

        if (guestId === specialGroupId && typeof rsvpDB.getGroupDeviceStatus === 'function') {
            const deviceKey = getDeviceKey();
            return rsvpDB.getGroupDeviceStatus(activeEventId, guestId, deviceKey);
        }

        return rsvpDB.getConfirmationByGuestId(activeEventId, guestId);
    }

    async function saveConfirmation(payload) {
        const rsvpDB = window.RSVPDatabase;
        if (!rsvpDB || typeof rsvpDB.saveConfirmation !== 'function') {
            return payload;
        }
        if (guestId === specialGroupId) {
            const deviceKey = getDeviceKey();
            return rsvpDB.saveConfirmation(activeEventId, {
                ...payload,
                options: { deviceKey }
            });
        }
        return rsvpDB.saveConfirmation(activeEventId, payload);
    }

    const guestData = InvitadoApp.getData() || {};
    const guestId = String(guestData.id || 'default');
    const maxAllowedCount = guestId === specialGroupId ? 1 : Math.max(1, Number(guestData.pases) || 1);

    async function checkConfirmedStatusOnLoad() {
        if (previewMode) {
            if (successMessage) successMessage.style.display = 'none';
            if (finalMessage) finalMessage.textContent = '';
            setFormLocked(false);
            setConfirmedFormVisibility(false);
            setIntroMessageForConfirmed(false);
            return;
        }

        isCheckingStatus = true;
        if (submitBtn) submitBtn.disabled = true;

        try {
            const existing = await getExistingConfirmation(guestId);
            if (existing && existing.confirmado) {
                applyConfirmedState(existing);
            } else if (submitBtn && !formLocked) {
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('No se pudo verificar estado RSVP:', error);
            if (submitBtn && !formLocked) submitBtn.disabled = false;
        } finally {
            isCheckingStatus = false;
        }
    }

    checkConfirmedStatusOnLoad();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (formLocked) return;

        if (isCheckingStatus) {
            showResultPopup('Estamos validando tu estado de confirmacion. Intenta de nuevo en un momento.', true);
            return;
        }

        showDecisionPopup(maxAllowedCount);
    });

    async function processConfirmation(respuesta, confirmedCount) {
        if (formLocked) return;

        const payload = {
            id: guestId,
            nombre: String(guestData.nombre || ''),
            pasesAsignados: maxAllowedCount,
            respuesta,
            cantidadConfirmada: guestId === specialGroupId && respuesta === 'si' ? 1 : confirmedCount,
            confirmado: true,
            fechaConfirmacion: Date.now()
        };

        if (submitBtn) submitBtn.disabled = true;
        
        try {
            const savedRecord = await saveConfirmation(payload);
            applyConfirmedState(savedRecord);
            showResultPopup(confirmationMessages[respuesta]);
        } catch (error) {
            if (error && (error.code === 'RSVP_ALREADY_CONFIRMED' || error.code === 'RSVP_ALREADY_CONFIRMED_DEVICE')) {
                const existingRecord = (error.existingData && error.existingData.confirmado)
                    ? error.existingData
                    : await getExistingConfirmation(guestId);

                if (existingRecord && existingRecord.confirmado) {
                    applyConfirmedState(existingRecord);
                    const existingResponse = String(existingRecord.respuesta || '').toLowerCase() === 'si' ? 'si' : 'no';
                    if (guestId === specialGroupId && existingResponse === 'si') {
                        showResultPopup('Gracias, ya has confirmado tu asistencia');
                    } else if (guestId === specialGroupId && existingResponse === 'no') {
                        showResultPopup('Lamentamos que no puedas acompañarnos, te extrañaremos');
                    } else {
                        showResultPopup(confirmationMessages[existingResponse]);
                    }
                    return;
                }
            }

            if (error && error.code === 'RSVP_GROUP_FULL') {
                showResultPopup('Lo sentimos, el cupo para este grupo ya esta lleno.', true);
                if (submitBtn && !formLocked) submitBtn.disabled = false;
                return;
            }

            console.error('Error al guardar RSVP:', error);
            if (submitBtn && !formLocked) submitBtn.disabled = false;
            showResultPopup('No pudimos guardar tu confirmacion. Intenta nuevamente.', true);
        }
    }
}

function initGiftModal() {
    const openBtn = document.getElementById('btn-account-modal');
    const modal = document.getElementById('gift-modal');
    const closeBtn = document.getElementById('gift-modal-close');
    const copyBtn = document.getElementById('btn-copy-account');
    const feedbackEl = document.getElementById('gift-copy-feedback');
    const dataEl = document.getElementById('gift-account-data');

    if (!openBtn || !modal || !closeBtn || !copyBtn || !dataEl) return;

    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    async function copyAccountData() {
        const data = dataEl.innerText.trim();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(data);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = data;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            if (feedbackEl) feedbackEl.textContent = 'Datos copiados al portapapeles.';
        } catch {
            if (feedbackEl) feedbackEl.textContent = 'No se pudo copiar. Intenta de nuevo.';
        }
    }

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function(event) {
        if (event.target.dataset.modalClose === 'true') {
            closeModal();
        }
    });

    copyBtn.addEventListener('click', copyAccountData);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
