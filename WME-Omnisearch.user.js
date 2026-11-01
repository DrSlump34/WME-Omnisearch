// ==UserScript==
// @name         WME Omnisearch
// @name:fr      WME Omnisearch
// @name:de      WME Omnisearch
// @name:es      WME Omnisearch
// @name:it      WME Omnisearch
// @name:pt-BR   WME Omnisearch
// @name:pt      WME Omnisearch
// @name:he      WME Omnisearch
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCcgdmlld0JveD0nMCAwIDI0IDI0Jz48Y2lyY2xlIGN4PScxMCcgY3k9JzEwJyByPSc2LjcnIGZpbGw9J25vbmUnIHN0cm9rZT0nIzYwN2Q4Yicgc3Ryb2tlLXdpZHRoPScyLjYnLz48cGF0aCBkPSdNMTUuMiAxNS4yIEwyMC42IDIwLjYnIHN0cm9rZT0nIzYwN2Q4Yicgc3Ryb2tlLXdpZHRoPSczLjInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcvPjxwYXRoIGQ9J00xMCA1LjYgTDExLjEgOC45IEwxNC40IDEwIEwxMS4xIDExLjEgTDEwIDE0LjQgTDguOSAxMS4xIEw1LjYgMTAgTDguOSA4LjkgWicgZmlsbD0nI2ZiOGMwMCcvPjwvc3ZnPg==
// @namespace    https://github.com/DrSlump34
// @version      0.07.06
// @description  Search everything from one box (Ctrl+K): streets, house numbers, Waze places, cities, editors, segment/node/place IDs, WME permalinks, links from other maps, coordinates (decimal, DMS, Lambert 93, Plus Codes) and Google places.
// @description:fr Tout chercher depuis un seul champ (Ctrl+K) : voies, numéros, lieux Waze, villes, éditeurs, ID de segment, de nœud ou de lieu, permaliens WME, liens d'autres cartes, coordonnées (décimales, DMS, Lambert 93, Plus Codes) et lieux Google.
// @description:de Alles aus einem Feld suchen (Strg+K): Straßen, Hausnummern, Waze-Orte, Städte, Editoren, Segment-, Knoten- und Orts-IDs, WME-Permalinks, Links anderer Karten, Koordinaten (dezimal, GMS, Lambert 93, Plus Codes) und Google-Orte.
// @description:es Buscarlo todo desde un solo campo (Ctrl+K): calles, números, lugares de Waze, ciudades, editores, ID de segmento, nodo o lugar, enlaces permanentes de WME, enlaces de otros mapas, coordenadas (decimales, GMS, Lambert 93, Plus Codes) y lugares de Google.
// @description:it Cercare tutto da un solo campo (Ctrl+K): strade, numeri civici, luoghi Waze, città, editor, ID di segmento, nodo o luogo, permalink WME, link di altre mappe, coordinate (decimali, GMS, Lambert 93, Plus Code) e luoghi Google.
// @description:pt-BR Buscar tudo em um só campo (Ctrl+K): ruas, números, lugares do Waze, cidades, editores, IDs de segmento, nó ou lugar, permalinks do WME, links de outros mapas, coordenadas (decimais, GMS, Lambert 93, Plus Codes) e lugares do Google.
// @description:pt Pesquisar tudo num só campo (Ctrl+K): ruas, números de porta, locais Waze, cidades, editores, IDs de segmento, nó ou local, permalinks do WME, ligações de outros mapas, coordenadas (decimais, GMS, Lambert 93, Plus Codes) e locais Google.
// @description:he חיפוש של הכול משדה אחד (Ctrl+K): רחובות, מספרי בתים, מקומות Waze, ערים, עורכים, מזהי מקטע, צומת או מקום, קישורי WME קבועים, קישורים ממפות אחרות, קואורדינטות ומקומות Google.
// @author       DrSlump34
// @copyright    DrSlump34 2026
// @license      MIT
// @homepageURL  https://github.com/DrSlump34/WME-Omnisearch
// @supportURL   https://www.waze.com/discuss/t/script-wme-omnisearch/415826
// @downloadURL  https://update.greasyfork.org/scripts/603036/WME%20Omnisearch.user.js
// @updateURL    https://update.greasyfork.org/scripts/603036/WME%20Omnisearch.meta.js
// @match        https://www.waze.com/*/editor*
// @match        https://www.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @exclude      https://www.waze.com/*user/*editor/*
// @exclude      https://www.waze.com/discuss/*
// @exclude      https://www.waze.com/editor/sdk/*
// @exclude      https://beta.waze.com/*user/*editor/*
// @exclude      https://beta.waze.com/editor/sdk/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      update.greasyfork.org
// @connect      raw.githubusercontent.com
// @connect      recherche-entreprises.api.gouv.fr
// @run-at       document-idle
// ==/UserScript==

/*  La recherche de WME ne connaît que les adresses et les lieux Waze : ni un ID de segment, ni un
 *  permalien, ni des coordonnées, ni un lien Google Maps, ni les lieux Google. Ce script ouvre une
 *  palette (Ctrl+K, ou /) qui comprend tout cela d'un seul champ.
 *
 *  Trois sources, dans cet ordre :
 *   ① ce qui est TAPÉ : permaliens, liens d'autres cartes, coordonnées, Plus Codes, ID — sans réseau ;
 *   ② ce que WME a CHARGÉ : voies (et noms alternatifs), numéros, lieux, villes, zones, éditeurs ;
 *   ③ Google Places, par la bibliothèque que WME charge déjà (aucune clé, aucun service tiers).
 *
 *  Waze n'expose aucun objet de carte par ID (mesuré le 30/10/2026 : Features?segments=… répond
 *  406). Mais l'HISTORIQUE d'un objet se demande par son seul ID (ElementHistory) et porte souvent
 *  une géométrie ou une ville : un ID absent est ainsi localisé n'importe où (34 segments sur 40
 *  à Lyon, le 30/10/2026), puis trouvé exactement par la carte AUTOUR de ce point, dalle par dalle
 *  — les requêtes mêmes que WME fait en se déplaçant. Sans indice, on cherche autour de l'écran.
 *  (w-tools.org, dont dépendait WME Enhanced Search, ne se résout plus le 30/10/2026.)
 *
 *  Il ne modifie jamais la carte : il déplace la vue et sélectionne, rien d'autre.
 */

(function _wmeIntegre() {
    'use strict';
    // Tampermonkey exécute le script dans un `with` posé sur un Proxy : chaque global consulté en boucle
    // (Math dans le score et les distances, à chaque frappe) le traverse — jusqu'à 250 fois plus lent,
    // mesuré sur WME Magic Wand le 31/10/2026. Liés ici une fois, ils deviennent des variables locales.
    const Math = globalThis.Math, Number = globalThis.Number, Date = globalThis.Date, Intl = globalThis.Intl;
    // Les formats Intl coûtent à construire : un par langue et par réglage, gardés (audit 0.07 n° 23).
    const formatsIntl = new Map();
    const formatIntl = (type, o) => { const k = _lang + '|' + type + '|' + JSON.stringify(o); let f = formatsIntl.get(k); if (!f) formatsIntl.set(k, f = new Intl[type](_lang, o)); return f; };

    const SCRIPT_ID = 'wme-omnisearch';
    const SCRIPT_NAME = 'WME Omnisearch';
    const VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || 'dev';
    const OPTS_KEY = 'wos.opts';
    const RECENTS_KEY = 'wos.recents';
    const GEOM_KEY = 'wos.geom';
    const URL_GH = 'https://github.com/DrSlump34/WME-Omnisearch';
    const URL_DISCUSS = 'https://www.waze.com/discuss/t/script-wme-omnisearch/415826';
    // La fiche GreasyFork se déduit de l'adresse de mise à jour que GreasyFork écrit dans l'en-tête
    // (…/scripts/<n°>/…) ; une copie installée d'ailleurs pointe sur la recherche de GreasyFork.
    const gmScript = () => (typeof GM_info !== 'undefined' && GM_info.script) || {};
    const N_GF = (/\/scripts\/(\d+)\//.exec(gmScript().updateURL || gmScript().downloadURL || '') || [])[1] || null;
    const URL_GF = N_GF ? 'https://greasyfork.org/scripts/' + N_GF : 'https://greasyfork.org/scripts?q=WME+Omnisearch';
    const PAR_SOUS_GROUPE = 15;    // objets montrés par rubrique de la fiche d'un éditeur
    const HISTO_MAX = 400;         // objets dont on lit l'historique, au plus, à la demande
    const HISTO_PAGES = 2;         // pages d'historique lues par objet pour les modifications anciennes
    const APERCU = 'wos-apercu';
    const PAR_GROUPE = 5;          // résultats montrés par groupe avant « N de plus »
    const PAR_FILTRE = 50;         // la même chose quand un filtre ne garde qu'un groupe
    const RECENTS_MAX = 8;
    // Dalles de « Chercher alentour » : ±0,02° (≈ 3 km) pèse 5,5 Mo et répond en 0,85 s à
    // Montpellier ; au-delà de ±0,05°, Waze ne renvoie plus que les grands axes (mesuré le 30/10/2026).
    const DALLE = [0.04, 0.03];
    const TYPES_VOIES = '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,22';
    const FLASH_MS = 1800;

    // Depuis la 0.06.01 le script demande GM_xmlhttpRequest (pastille de nouvelle version, version
    // minimale) : il tourne dans le bac à sable du gestionnaire, et getWmeSdk, google et le verrou
    // anti-double-chargement se lisent sur la page par unsafeWindow, comme dans WJN, WDA et WRP.
    // L'objet global W n'est PAS utilisé : il disparaît de WME le 24/11/2026 (annonce staff 413664).
    const pw = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

    // Loupe ardoise et étincelle orange : la famille d'icônes détourées de la charte (01/10/2026).
    const icone = h => '<svg xmlns="http://www.w3.org/2000/svg" width="' + h + '" height="' + h + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<circle cx="10" cy="10" r="6.7" fill="none" stroke="#607d8b" stroke-width="2.6"/><path d="M15.2 15.2 L20.6 20.6" stroke="#607d8b" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M10 5.6 L11.1 8.9 L14.4 10 L11.1 11.1 L10 14.4 L8.9 11.1 L5.6 10 L8.9 8.9 Z" fill="#fb8c00"/></svg>';

    let sdk = null;
    let opts = { google: true, discuss: true, entreprises: true, slash: true, bouton: true, fermer: false };

    const log = m => console.log('[WOS] ' + m);
    const dejaDit = new Set();
    const logUneFois = (cle, m) => { if (!dejaDit.has(cle)) { dejaDit.add(cle); log(m); } };
    const escHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // =====================================================================
    //  I18N — détection sur la locale de WME, repli sur l'anglais
    // =====================================================================

    const DICO = {
        en: {
            sbHint: 'Search everything from one box: streets, house numbers, places, cities, editors, IDs, permalinks, coordinates, links from other maps and Google places.',
            sbKeys: 'Open the search',
            sbOpts: 'Options',
            optGoogle: 'Google places',
            optGoogleHint: 'Suggestions from Google, through the library WME already loads. What you type is sent to Google.',
            optSlash: 'Open with /',
            optSlashHint: 'The / key opens the search when you are not typing in a field.',
            optBtn: 'Button next to the WME search box',
            sbHelp: 'Help',
            hTypeT: 'What you can type',
            hTypeB: '<table class="wos-help-table"><tr><td>Rue Clapies</td><td>A street, a place, a city: words in any order, accents optional, <i>st</i> = <i>street</i> or <i>saint</i>, <i>dr</i> = <i>drive</i>, <i>av</i> = <i>avenue</i>…</td></tr><tr><td>12 rue clapies</td><td>A house number on a loaded street.</td></tr><tr><td>62324199</td><td>A segment, node, zone, restricted area or map comment ID; several segments separated by commas.</td></tr><tr><td>123.456.789</td><td>A place ID.</td></tr><tr><td>@pseudo</td><td>An editor, and everything they touched on screen.</td></tr><tr><td>43.6107, 3.8767</td><td>Coordinates: decimal, DMS (43°36\'38"N), Lambert 93 (770100 6279300) or Plus Code.</td></tr><tr><td>https://…</td><td>A WME permalink, or a link from Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>A SIREN or SIRET (French companies), found anywhere.</td></tr><tr><td>g: bakery</td><td>Google places only.</td></tr><tr><td>d: closures</td><td>Discuss topics only.</td></tr><tr><td>works</td><td>Closures within about {N}\u00a0km, update requests around the map, MTE by name anywhere (past ones too); zones and cameras, restricted areas, map comments and turn guidance on screen.</td></tr></table>',
            hKeysT: 'Keyboard',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Move through the results; the map shows the one you are on.</td></tr><tr><td><kbd>Enter</kbd></td><td>Go there and select it.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Enter</kbd></td><td>Copy its permalink.</td></tr><tr><td><kbd>Shift</kbd> <kbd>Enter</kbd></td><td>Open it in a new tab.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Enter</kbd></td><td>Open the Google Maps place of a Waze place linked to Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>Next filter (streets, places…).</td></tr><tr><td><kbd>Esc</kbd></td><td>Close.</td></tr></table>',
            hSrcT: 'Where the results come from',
            hSrcB: '<p>Streets, numbers, places and cities come from what WME has <b>loaded</b>: the area on screen and a little around it. Move or zoom out to search further. Waze places are also found by name anywhere, through the search service of WME itself (same site, your own access).</p><p>Waze does not give a script an object by ID, but it gives its <b>history</b>, which often carries a position: a missing segment, node or place ID is thus located anywhere, then found exactly in the map around that point. Without a clue, the search looks around the screen.</p><p>Google places come from the Google library already loaded by WME. In France, if the option is on, what you type and the position of the map (to within 1 km) go to the State “Recherche d’entreprises” API. Once a day, the script asks GreasyFork for the published version; at start-up, it reads the minimum version on GitHub.</p><p>Discuss topics come from the Waze forum, on the same site as WME, with your own access.</p>',
            hSafeB: 'The script never changes the map: it moves the view, selects and, when needed, turns on the layer of the chosen object; nothing more.',
            btnTip: 'Search everything',
            phInput: 'Streets, places, numbers, IDs, links, coordinates…',
            ariaDialog: 'Search everything',
            ariaList: 'Results',
            fAll: 'All',
            fStreet: 'Streets',
            fAddress: 'Numbers',
            fVenue: 'Places',
            fCity: 'Cities',
            fEditor: 'Editors',
            fGoogle: 'Google',
            gDirect: 'Go to',
            gStreet: 'Streets',
            gAddress: 'House numbers',
            gVenue: 'Waze places',
            gCity: 'Cities',
            gHazard: 'Zones and cameras',
            gEditor: 'Editors',
            gGoogle: 'Google places',
            gRecent: 'Recent',
            kSeg: 'Segment',
            kSegs: n => n + ' segments',
            kNode: 'Node',
            kVenue: 'Place',
            kComment: 'Map comment',
            kHazard: 'Zone',
            kPermalink: 'WME permalink',
            kLink: s => 'Link · ' + s,
            kCoords: 'Coordinates',
            kSwap: 'Coordinates, read as longitude then latitude',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Update request',
            nSeg: n => n === 1 ? '1 segment' : n + ' segments',
            noCity: 'No city',
            altName: 'alternate name',
            alias: a => 'also: ' + a,
            residential: 'Residential',
            widen: id => 'ID ' + id + ' — not in the loaded area',
            widening: (k, n) => 'Searching around… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' not found: its history gives no position and it is not around the screen.',
            shortLink: 'Short link',
            shortLinkSub: 'Open it in the browser, then paste the full address here.',
            moreN: n => n + ' more',
            emptyTitle: 'Type or paste anything',
            emptyHint: 'A street, a place, an ID, a permalink, coordinates, a Google Maps link…',
            noRes: q => 'Nothing for “' + q + '”.',
            noResHint: 'Streets and house numbers are searched only around the map: move it, zoom out a little, or turn on Google places.',
            nRes: n => n === 0 ? 'No results' : n === 1 ? '1 result' : n + ' results',
            hintNav: 'move',
            hintGo: 'go',
            hintCopy: 'copy permalink',
            hintTab: 'new tab',
            hintFilter: 'filter',
            hintClose: 'close',
            copied: 'Permalink copied',
            copyFail: 'Could not copy the permalink',
            googleErr: 'Google did not answer.',
            gCompany: 'Companies (France)',
            optCompanies: 'French companies',
            optCompaniesHint: 'In France only: the State “Recherche d’entreprises” API (Sirene data), searched in the département of the map; a SIRET or SIREN is found anywhere. What you type and the position of the map (to within 1 km) are sent to it.',
            gmapOpen: 'Open its Google Maps place (Alt+Enter)',
            gmapNone: 'This result is not linked to a Google place.',
            gmapUnknown: 'Google link unknown until the place is loaded: press Enter to go there, then Alt+Enter.',
            venueCapped: 'The Waze search returns 10 places at most, and none contains every word: add the city or move the map.',
            srcVenueFar: 'Waze places off screen',
            srcTimeout: 'no answer',
            srArrived: 'Arrived: object selected.',
            urNoComments: 'UR conversations could not be read: a search on their text may miss some.',
            coNoDept: 'Companies: the département of the map is not found here (coast, lake…): move the map slightly.',
            coClosed: 'closed',
            edNoObj: 'Nothing of theirs on screen · opens their profile',
            edTryProfile: 'Open the profile with exactly this name',
            hEdAll: 'Editors with nothing on screen are found too (the Waze forum accounts): by the beginning of their name after @ or in the Editors filter, by their exact name in “All”. Their name opens their profile.',
            lnkDiscuss: 'Discuss thread',
            majBtn: v => 'Version ' + v + ' is available',
            majInstall: 'Install',
            widenErr: c => 'Searching around failed (' + c + '): press Enter to try again.',
            widenBudget: q => q + ': not found in the first 15 MB around the map. Move closer and try again.',
            noResAny: q => 'Nothing for “' + q + '”.',
            approxShort: 'approximate position',
            noResMove: 'Streets and house numbers are searched only around the map: move it or zoom out a little.',
            noResMte: 'No MTE has this name, anywhere in the world (past ones included).',
            noResDiscuss: 'No forum topic for this search.',
            noResEditor: 'No editor on screen, nor on the forum with a name starting this way.',
            noResGoogle: 'Google suggests nothing for this search.',
            srcOff: 'This source is turned off in the Scripts tab.',
            srOpen: 'expanded',
            srClosed: 'collapsed',
            oWest: '“O” read as West',
            oEast: '“O” read as East (Ost, Oost)',
            waitObj: 'Waiting for WME to load the object…',
            arrivedNoSel: 'Arrived, but the object could not be selected: deleted, or not loaded here.',
            approxPlace: 'Approximate position: the centre of its city.',
            srcBusy: 'Searching…',
            srcDown: l => 'Unavailable: ' + l + '. Results may be missing.',
            urCapped: n => 'Over ' + n + ' URs around here: the list is cut off, zoom in to see them all.',
            otherServer: e => 'Permalink from the ' + e + ' server',
            otherServerSub: 'Its objects are not on this map: it opens in a new tab.',
            linkUnknown: 'Unrecognised link',
            linkUnknownSub: 'No position or object could be read from this address.',
            locateErr: c => 'History unavailable' + (c ? ' (' + c + ')' : '') + ': press Enter to try again.',
            mteClosuresErr: c => 'The closures of this MTE could not be read' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'Waze is limiting requests: reading stopped, ' + n + ' objects left. Try again in a moment.',
            histPartial: n => n + ' histories could not be read: they are not counted.',
            inView: 'on screen',
            winMove: 'Drag to move · double-click to put it back',
            winClose: 'Close (Esc)',
            edToggle: 'Show or hide what they touched',
            edProfile: 'Open the editor profile',
            edNothing: 'Nothing touched on screen',
            secSeg: 'Segments',
            secVenue: 'Places',
            secClosure: 'Closures',
            secHazard: 'Zones',
            secJunction: 'Junction boxes',
            secComment: 'Map comments',
            secMte: 'Major traffic events',
            subCreated: 'Created',
            subUpdated: 'Last changed by them',
            subBefore: 'Changed earlier',
            whenCreated: d => 'created ' + d,
            whenChanged: d => 'changed ' + d,
            histBtn: n => 'Also look for older changes in the history (' + n + ' objects on screen)',
            histSub: 'One or two requests per object to the Waze history, six at a time; from a few seconds to a minute',
            histRun: (k, n) => 'Reading history… ' + k + '/' + n,
            noName: 'No name',
            kClosure: 'Closure',
            kJunction: 'Junction box',
            kMte: 'Major traffic event',
            locating: 'Locating it through its history…',
            located: v => 'Located near ' + v + ' — Enter to go there',
            notLocated: 'Its history gives no position: Enter searches around the screen',
            hEdT: 'Editors',
            hEdB: '<p>Type a name (or <b>@</b> alone for everyone on screen). From <b>All</b>, Enter opens the editor in the <b>Editors</b> tab.</p><p>There, everything they touched on screen is sorted by kind (segments, places, closures, zones, junction boxes, comments, MTE) and by role: <b>created</b>, <b>last changed by them</b> and, after reading the history, <b>changed earlier</b>. A click selects the object and zooms to it; the window stays open.</p><p>The name opens their profile; ▸ or → unfolds it.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Discuss topics',
            optDiscussHint: 'Topics from the Waze forum, same site as WME, from 3 characters. What you type is sent to the forum search. In “All”, it also controls the search for editor names on the forum.',
            discussPosts: n => n === 1 ? '1 post' : n + ' posts',
            hnNoStreet: q => 'No loaded street matches “' + q + '”.',
            hnNone: v => v + ' has no house number in Waze.',
            hnNoNumber: (n, v) => 'No number ' + n + ' on ' + v + ' in Waze.',
            hnNumberNowhere: n => 'No number ' + n + ' on the loaded streets.',
            optClose: 'Close the window after a choice',
            optCloseHint: 'Off: it stays open so you can go from one result to the next, and a click on the map keeps it. Esc or × closes it.',
            fClosure: 'Closures',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Map',
            gClosure: 'Closures',
            gMte: 'Major traffic events',
            gUR: 'Update requests',
            gRda: 'Restricted driving areas',
            gNote: 'Map comments',
            gIga: 'Turn guidance',
            stActive: 'Active',
            stPlanned: 'Scheduled',
            mteNoShape: 'around here, no route drawn',
            mteNoPlace: 'This MTE has neither a route nor closures left: it cannot be located.',
            stOver: 'Over',
            stFinished: 'Finished',
            urOpen: 'Open',
            urClosed: 'Closed',
            kRda: 'Restricted area',
            urComments: n => n === 1 ? '1 comment' : n + ' comments',
            urTypes: { 6: 'Incorrect turn', 7: 'Incorrect address', 8: 'Incorrect route', 9: 'Missing roundabout', 10: 'General error', 11: 'Turn not allowed', 12: 'Incorrect junction', 13: 'Missing bridge or overpass', 14: 'Wrong driving direction', 15: 'Missing exit', 16: 'Missing road', 18: 'Missing place', 19: 'Blocked road', 21: 'Missing street name', 22: 'Incorrect street prefix or suffix', 23: 'Missing or wrong speed limit' },
            hzTypes: { SCHOOL_ZONE: 'School zone', SPEED_BUMP: 'Speed bump', CAMERA: 'Speed camera', TRAFFIC_LIGHT: 'Traffic light', RAILROAD_CROSSING: 'Railroad crossing', TOLL_BOOTH: 'Toll booth', TOPES: 'Topes', DANGEROUS_CURVE: 'Dangerous curve', DANGEROUS_INTERSECTION: 'Dangerous intersection', DANGEROUS_MERGE: 'Dangerous merge', SIGN: 'Sign', LANE_ENDING: 'Lane ending', RAISED_CROSSWALK: 'Raised crosswalk', HIGHWAY_CROSSWALK: 'Crosswalk on a highway', SHOULDER_ENDING: 'Shoulder ending', NARROW_BRIDGE: 'Narrow bridge' },
            mteCats: { SPORTING_EVENT: 'Sporting event', CONCERT: 'Concert', FESTIVAL: 'Festival', PARADE: 'Parade', CONFERENCE: 'Conference', 'CONSTRUCTION': 'Roadworks', 'CRISIS': 'Crisis', 'DEMONSTRATION': 'Demonstration', 'DRIVING_ADVISORY': 'Driving advisory', 'HOLIDAY/FESTIVAL': 'Holiday or festival', 'OTHER': 'Other', 'PARTNER_USER_COMMS': 'Partner communication', 'SUMMIT': 'Summit', 'UNPLANNED_DISRUPTION': 'Unplanned disruption' },
            clearRecents: 'Clear',
        },
        fr: {
            sbHint: 'Tout chercher depuis un seul champ\u00a0: voies, numéros, lieux, villes, éditeurs, ID, permaliens, coordonnées, liens d\'autres cartes et lieux Google.',
            sbKeys: 'Ouvrir la recherche',
            sbOpts: 'Options',
            optGoogle: 'Lieux Google',
            optGoogleHint: 'Suggestions de Google, par la bibliothèque que WME charge déjà. La saisie est envoyée à Google.',
            optSlash: 'Ouvrir avec /',
            optSlashHint: 'La touche / ouvre la recherche quand vous n\'écrivez pas dans un champ.',
            optBtn: 'Bouton à côté de la recherche de WME',
            sbHelp: 'Aide',
            hTypeT: 'Ce qu\'on peut taper',
            hTypeB: '<table class="wos-help-table"><tr><td>Rue Clapies</td><td>Une voie, un lieu, une ville\u00a0: mots dans n\'importe quel ordre, accents facultatifs, <i>st</i> = <i>saint</i>, <i>av</i> = <i>avenue</i>…</td></tr><tr><td>12 rue clapies</td><td>Un numéro sur une voie chargée.</td></tr><tr><td>62324199</td><td>Un ID de segment, de nœud, de zone, de zone réglementée ou de commentaire de carte\u00a0; plusieurs segments, séparés par des virgules.</td></tr><tr><td>123.456.789</td><td>Un ID de lieu.</td></tr><tr><td>@pseudo</td><td>Un éditeur, et tout ce qu\'il a touché à l\'écran.</td></tr><tr><td>43.6107, 3.8767</td><td>Des coordonnées\u00a0: décimales, DMS (43°36\'38"N), Lambert 93 (770100 6279300) ou Plus Code.</td></tr><tr><td>https://…</td><td>Un permalien WME, ou un lien Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>Un SIREN ou un SIRET (entreprises françaises), trouvé partout.</td></tr><tr><td>g: boulangerie</td><td>Les lieux Google seulement.</td></tr><tr><td>d: fermetures</td><td>Les sujets Discuss seulement.</td></tr><tr><td>travaux</td><td>Fermetures dans un rayon d\'environ {N}\u00a0km, UR autour de la carte, MTE par leur nom partout (passés compris)\u00a0; zones et radars, zones réglementées, notes de carte et guidage des virages à l\'écran.</td></tr></table>',
            hKeysT: 'Clavier',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Parcourir les résultats\u00a0; la carte montre celui où vous êtes.</td></tr><tr><td><kbd>Entrée</kbd></td><td>Y aller et le sélectionner.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Entrée</kbd></td><td>Copier son permalien.</td></tr><tr><td><kbd>Maj</kbd> <kbd>Entrée</kbd></td><td>L\'ouvrir dans un nouvel onglet.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Entrée</kbd></td><td>Ouvrir la fiche Google Maps d\'un lieu Waze rattaché à Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>Filtre suivant (voies, lieux…).</td></tr><tr><td><kbd>Échap</kbd></td><td>Fermer.</td></tr></table>',
            hSrcT: 'D\'où viennent les résultats',
            hSrcB: '<p>Voies, numéros, lieux et villes viennent de ce que WME a <b>chargé</b>\u00a0: la zone à l\'écran et un peu autour. Déplacez la carte ou dézoomez pour chercher plus loin. Les lieux Waze se trouvent aussi par leur nom partout, par le service de recherche de WME lui-même (même site, vos propres accès).</p><p>Waze ne donne pas un objet par ID à un script, mais il donne son <b>historique</b>, qui porte souvent une position\u00a0: un ID de segment, de nœud ou de lieu absent est ainsi localisé n\'importe où, puis trouvé exactement dans la carte autour de ce point. Sans indice, la recherche se fait autour de l\'écran.</p><p>Les lieux Google viennent de la bibliothèque Google déjà chargée par WME. En France, si l\'option est allumée, la saisie et la position de la carte (à 1\u00a0km près) vont à l\'API Recherche d\'entreprises de l\'État. Une fois par jour, le script demande à GreasyFork la version publiée\u00a0; au démarrage, il lit la version minimale sur GitHub.</p><p>Les sujets Discuss viennent du forum de Waze, sur le même site que WME, avec vos propres accès.</p>',
            hSafeB: 'Le script ne modifie jamais la carte\u00a0: il déplace la vue, sélectionne et, au besoin, allume le calque de l\'objet choisi\u00a0; rien d\'autre.',
            btnTip: 'Tout chercher',
            phInput: 'Voies, lieux, numéros, ID, liens, coordonnées…',
            ariaDialog: 'Tout chercher',
            ariaList: 'Résultats',
            fAll: 'Tout',
            fStreet: 'Voies',
            fAddress: 'Numéros',
            fVenue: 'Lieux',
            fCity: 'Villes',
            fEditor: 'Éditeurs',
            fGoogle: 'Google',
            gDirect: 'Aller à',
            gStreet: 'Voies',
            gAddress: 'Numéros',
            gVenue: 'Lieux Waze',
            gCity: 'Villes',
            gHazard: 'Zones et radars',
            gEditor: 'Éditeurs',
            gGoogle: 'Lieux Google',
            gRecent: 'Récents',
            kSeg: 'Segment',
            kSegs: n => n + ' segments',
            kNode: 'Nœud',
            kVenue: 'Lieu',
            kComment: 'Commentaire de carte',
            kHazard: 'Zone',
            kPermalink: 'Permalien WME',
            kLink: s => 'Lien · ' + s,
            kCoords: 'Coordonnées',
            kSwap: 'Coordonnées, lues longitude puis latitude',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Demande de mise à jour',
            nSeg: n => n === 1 ? '1 segment' : n + ' segments',
            noCity: 'Sans ville',
            altName: 'nom alternatif',
            alias: a => 'aussi\u00a0: ' + a,
            residential: 'Résidentiel',
            widen: id => 'ID ' + id + ' — hors de la zone chargée',
            widening: (k, n) => 'Recherche alentour… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' introuvable\u00a0: son historique ne donne aucune position, et il n\'est pas autour de l\'écran.',
            shortLink: 'Lien court',
            shortLinkSub: 'Ouvrez-le dans le navigateur, puis collez ici l\'adresse complète.',
            moreN: n => n + ' de plus',
            emptyTitle: 'Tapez ou collez n\'importe quoi',
            emptyHint: 'Une voie, un lieu, un ID, un permalien, des coordonnées, un lien Google Maps…',
            noRes: q => 'Rien pour «\u00a0' + q + '\u00a0».',
            noResHint: 'Voies et numéros ne se cherchent qu\'autour de la carte\u00a0: déplacez-la, dézoomez un peu, ou activez les lieux Google.',
            nRes: n => n === 0 ? 'Aucun résultat' : n === 1 ? '1 résultat' : n + ' résultats',
            hintNav: 'parcourir',
            hintGo: 'y aller',
            hintCopy: 'copier le permalien',
            hintTab: 'nouvel onglet',
            hintFilter: 'filtrer',
            hintClose: 'fermer',
            copied: 'Permalien copié',
            copyFail: 'Impossible de copier le permalien',
            googleErr: 'Google n\'a pas répondu.',
            gCompany: 'Entreprises (France)',
            optCompanies: 'Entreprises françaises',
            optCompaniesHint: 'En France seulement\u00a0: l\'API Recherche d\'entreprises de l\'État (données Sirene), dans le département de la carte\u00a0; un SIRET ou un SIREN se trouve partout. La saisie et la position de la carte (à 1\u00a0km près) lui sont envoyées.',
            gmapOpen: 'Voir sa fiche Google Maps (Alt+Entrée)',
            gmapNone: 'Ce résultat n\'est rattaché à aucun lieu Google.',
            gmapUnknown: 'Rattachement Google inconnu tant que le lieu n\'est pas chargé\u00a0: Entrée pour y aller, puis Alt+Entrée.',
            venueCapped: 'La recherche de Waze rend 10 lieux au plus, et aucun ne contient tous les mots\u00a0: ajoutez la ville ou déplacez la carte.',
            srcVenueFar: 'Lieux Waze hors de l\'écran',
            srcTimeout: 'pas de réponse',
            srArrived: 'Arrivé\u00a0: objet sélectionné.',
            urNoComments: 'Les conversations des UR n\'ont pas pu être lues\u00a0: une recherche sur leur texte peut en manquer.',
            coNoDept: 'Entreprises\u00a0: département de la carte introuvable ici (littoral, étang…)\u00a0: déplacez un peu la carte.',
            coClosed: 'fermé',
            edNoObj: 'Rien de lui à l\'écran · ouvre son profil',
            edTryProfile: 'Ouvrir le profil de ce pseudo exact',
            hEdAll: 'Les éditeurs qui n\'ont rien à l\'écran sont trouvés aussi (les comptes du forum de Waze)\u00a0: par le début de leur pseudo après @ ou dans le filtre Éditeurs, par leur pseudo exact dans «\u00a0Tout\u00a0». Leur nom ouvre leur profil.',
            lnkDiscuss: 'Fil Discuss',
            majBtn: v => 'La version ' + v + ' est disponible',
            majInstall: 'Installer',
            widenErr: c => 'La recherche alentour a échoué (' + c + ')\u00a0: Entrée pour réessayer.',
            widenBudget: q => q + '\u00a0: introuvable dans les 15\u00a0premiers Mo autour de la carte. Rapprochez-vous et réessayez.',
            noResAny: q => 'Rien pour «\u00a0' + q + '\u00a0».',
            approxShort: 'position approximative',
            noResMove: 'Voies et numéros ne se cherchent qu\'autour de la carte\u00a0: déplacez-la ou dézoomez un peu.',
            noResMte: 'Aucun MTE de ce nom, nulle part dans le monde (passés compris).',
            noResDiscuss: 'Aucun sujet du forum pour cette recherche.',
            noResEditor: 'Aucun éditeur à l\'écran, ni sur le forum dont le pseudo commence ainsi.',
            noResGoogle: 'Google ne propose rien pour cette recherche.',
            srcOff: 'Cette source est désactivée dans l\'onglet Scripts.',
            srOpen: 'dépliée',
            srClosed: 'repliée',
            oWest: '«\u00a0O\u00a0» lu Ouest',
            oEast: '«\u00a0O\u00a0» lu Est (Ost, Oost)',
            waitObj: 'En attente du chargement de l\'objet par WME…',
            arrivedNoSel: 'Arrivé, mais l\'objet n\'a pas pu être sélectionné\u00a0: supprimé, ou pas chargé ici.',
            approxPlace: 'Position approximative\u00a0: le centre de sa commune.',
            srcBusy: 'Recherche en cours…',
            srcDown: l => 'Indisponible\u00a0: ' + l + '. Des résultats peuvent manquer.',
            urCapped: n => 'Plus de ' + n + ' UR alentour\u00a0: la liste est tronquée, zoomez pour toutes les voir.',
            otherServer: e => 'Permalien du serveur ' + e,
            otherServerSub: 'Ses objets ne sont pas sur cette carte\u00a0: il s\'ouvre dans un nouvel onglet.',
            linkUnknown: 'Lien non reconnu',
            linkUnknownSub: 'Aucune position ni aucun objet n\'a pu être lu dans cette adresse.',
            locateErr: c => 'Historique indisponible' + (c ? ' (' + c + ')' : '') + '\u00a0: Entrée pour réessayer.',
            mteClosuresErr: c => 'Les fermetures de ce MTE n\'ont pas pu être lues' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'Waze limite les requêtes\u00a0: lecture arrêtée, ' + n + ' objets restants. Réessayez dans un instant.',
            histPartial: n => n + ' historiques n\'ont pas pu être lus\u00a0: ils ne sont pas comptés.',
            inView: 'à l\'écran',
            winMove: 'Tirer pour déplacer · double-clic pour la remettre en place',
            winClose: 'Fermer (Échap)',
            edToggle: 'Afficher ou masquer ce qu\'il a touché',
            edProfile: 'Ouvrir le profil de l\'éditeur',
            edNothing: 'Rien de touché à l\'écran',
            secSeg: 'Segments',
            secVenue: 'Lieux',
            secClosure: 'Fermetures',
            secHazard: 'Zones',
            secJunction: 'Carrefours complexes',
            secComment: 'Commentaires de carte',
            secMte: 'Évènements majeurs (MTE)',
            subCreated: 'Créés',
            subUpdated: 'Modifiés en dernier par lui',
            subBefore: 'Modifiés auparavant',
            whenCreated: d => 'créé le ' + d,
            whenChanged: d => 'modifié le ' + d,
            histBtn: n => 'Chercher aussi les modifications plus anciennes dans l\'historique (' + n + ' objets à l\'écran)',
            histSub: 'Une ou deux requêtes par objet à l\'historique de Waze, six à la fois\u00a0; de quelques secondes à une minute',
            histRun: (k, n) => 'Lecture de l\'historique… ' + k + '/' + n,
            noName: 'Sans nom',
            kClosure: 'Fermeture',
            kJunction: 'Carrefour complexe',
            kMte: 'Évènement majeur',
            locating: 'Localisation par son historique…',
            located: v => 'Localisé près de ' + v + ' — Entrée pour y aller',
            notLocated: 'Son historique ne donne aucune position\u00a0: Entrée cherche autour de l\'écran',
            hEdT: 'Éditeurs',
            hEdB: '<p>Tapez un pseudo (ou <b>@</b> seul pour tous ceux de l\'écran). Depuis <b>Tout</b>, Entrée ouvre l\'éditeur dans l\'onglet <b>Éditeurs</b>.</p><p>Là, tout ce qu\'il a touché à l\'écran est rangé par nature (segments, lieux, fermetures, zones, carrefours complexes, commentaires, MTE) et par rôle\u00a0: <b>créés</b>, <b>modifiés en dernier par lui</b> et, après lecture de l\'historique, <b>modifiés auparavant</b>. Un clic sélectionne l\'objet et zoome dessus\u00a0; la fenêtre reste ouverte.</p><p>Le pseudo ouvre son profil\u00a0; ▸ ou → le déplie.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Sujets Discuss',
            optDiscussHint: 'Les sujets du forum de Waze, sur le même site que WME, dès 3 caractères. La saisie est envoyée à la recherche du forum. Dans «\u00a0Tout\u00a0», elle commande aussi la recherche des pseudos sur le forum.',
            discussPosts: n => n === 1 ? '1 message' : n + ' messages',
            hnNoStreet: q => 'Aucune voie chargée ne correspond à «\u00a0' + q + '\u00a0».',
            hnNone: v => v + ' n\'a aucun numéro dans Waze.',
            hnNoNumber: (n, v) => 'Pas de numéro ' + n + ' sur ' + v + ' dans Waze.',
            hnNumberNowhere: n => 'Pas de numéro ' + n + ' sur les voies chargées.',
            optClose: 'Fermer la fenêtre après un choix',
            optCloseHint: 'Décoché\u00a0: elle reste ouverte pour enchaîner les résultats, et un clic sur la carte la garde. Échap ou × la ferment.',
            fClosure: 'Fermetures',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Carte',
            gClosure: 'Fermetures',
            gMte: 'Évènements majeurs (MTE)',
            gUR: 'Demandes de mise à jour (UR)',
            gRda: 'Zones réglementées',
            gNote: 'Commentaires de carte',
            gIga: 'Guidage des virages (IGA)',
            stActive: 'En cours',
            stPlanned: 'Programmée',
            mteNoShape: 'aux alentours, sans tracé',
            mteNoPlace: 'Ce MTE n\'a ni tracé ni fermeture\u00a0: impossible de le situer.',
            stOver: 'Terminé',
            stFinished: 'Terminée',
            urOpen: 'Ouverte',
            urClosed: 'Fermée',
            kRda: 'Zone réglementée',
            urComments: n => n === 1 ? '1 commentaire' : n + ' commentaires',
            urTypes: { 6: 'Virage incorrect', 7: 'Adresse incorrecte', 8: 'Itinéraire incorrect', 9: 'Rond-point manquant', 10: 'Erreur générale', 11: 'Virage interdit', 12: 'Intersection incorrecte', 13: 'Pont ou passage supérieur manquant', 14: 'Sens de circulation incorrect', 15: 'Sortie manquante', 16: 'Route manquante', 18: 'Lieu manquant', 19: 'Route bloquée', 21: 'Nom de rue manquant', 22: 'Préfixe ou suffixe de rue incorrect', 23: 'Limitation de vitesse manquante ou erronée' },
            hzTypes: { SCHOOL_ZONE: 'Zone scolaire', SPEED_BUMP: 'Ralentisseur', CAMERA: 'Radar', TRAFFIC_LIGHT: 'Feu tricolore', RAILROAD_CROSSING: 'Passage à niveau', TOLL_BOOTH: 'Péage', TOPES: 'Topes', DANGEROUS_CURVE: 'Virage dangereux', DANGEROUS_INTERSECTION: 'Intersection dangereuse', DANGEROUS_MERGE: 'Insertion dangereuse', SIGN: 'Panneau', LANE_ENDING: 'Fin de voie', RAISED_CROSSWALK: 'Passage piéton surélevé', HIGHWAY_CROSSWALK: 'Passage piéton sur voie rapide', SHOULDER_ENDING: 'Fin de bande d\'arrêt d\'urgence', NARROW_BRIDGE: 'Pont étroit' },
            mteCats: { SPORTING_EVENT: 'Évènement sportif', CONCERT: 'Concert', FESTIVAL: 'Festival', PARADE: 'Défilé', CONFERENCE: 'Conférence', 'CONSTRUCTION': 'Travaux', 'CRISIS': 'Crise', 'DEMONSTRATION': 'Manifestation', 'DRIVING_ADVISORY': 'Conseil de conduite', 'HOLIDAY/FESTIVAL': 'Fête ou festival', 'OTHER': 'Autre', 'PARTNER_USER_COMMS': 'Communication partenaire', 'SUMMIT': 'Sommet', 'UNPLANNED_DISRUPTION': 'Perturbation imprévue' },
            clearRecents: 'Effacer',
        },
        de: {
            sbHint: 'Alles aus einem Feld suchen: Straßen, Hausnummern, Orte, Städte, Editoren, IDs, Permalinks, Koordinaten, Links anderer Karten und Google-Orte.',
            sbKeys: 'Suche öffnen',
            sbOpts: 'Optionen',
            optGoogle: 'Google-Orte',
            optGoogleHint: 'Vorschläge von Google, über die Bibliothek, die WME bereits lädt. Die Eingabe wird an Google gesendet.',
            optSlash: 'Mit / öffnen',
            optSlashHint: 'Die Taste / öffnet die Suche, wenn Sie nicht in ein Feld schreiben.',
            optBtn: 'Schaltfläche neben der WME-Suche',
            sbHelp: 'Hilfe',
            hTypeT: 'Was man eingeben kann',
            hTypeB: '<table class="wos-help-table"><tr><td>Hauptstraße</td><td>Eine Straße, ein Ort, eine Stadt: Wörter in beliebiger Reihenfolge, Akzente optional, <i>str</i> = <i>straße</i>…</td></tr><tr><td>12 hauptstraße</td><td>Eine Hausnummer an einer geladenen Straße.</td></tr><tr><td>62324199</td><td>Eine Segment-, Knoten-, Zonen-, Beschränkte-Zonen- oder Kartenkommentar-ID; mehrere Segmente durch Kommas getrennt.</td></tr><tr><td>123.456.789</td><td>Eine Orts-ID.</td></tr><tr><td>@name</td><td>Ein Editor und alles, was er auf dem Bildschirm bearbeitet hat.</td></tr><tr><td>43.6107, 3.8767</td><td>Koordinaten: dezimal, GMS (43°36\'38"N), Lambert 93 oder Plus Code.</td></tr><tr><td>https://…</td><td>Ein WME-Permalink oder ein Link von Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>Eine SIREN oder SIRET (französische Unternehmen), überall gefunden.</td></tr><tr><td>g: bäckerei</td><td>Nur Google-Orte.</td></tr><tr><td>d: sperrung</td><td>Nur Discuss-Themen.</td></tr><tr><td>baustelle</td><td>Sperrungen im Umkreis von etwa {N}\u00a0km, Update Requests rund um die Karte, MTE nach Namen überall (auch vergangene); Zonen und Blitzer, beschränkte Zonen, Kartenkommentare und Abbiegehinweise auf dem Bildschirm.</td></tr></table>',
            hKeysT: 'Tastatur',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Durch die Ergebnisse gehen; die Karte zeigt das aktuelle.</td></tr><tr><td><kbd>Enter</kbd></td><td>Hingehen und auswählen.</td></tr><tr><td><kbd>Strg</kbd> <kbd>Enter</kbd></td><td>Permalink kopieren.</td></tr><tr><td><kbd>Umschalt</kbd> <kbd>Enter</kbd></td><td>In neuem Tab öffnen.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Enter</kbd></td><td>Den Google-Maps-Eintrag eines mit Google verknüpften Waze-Orts öffnen.</td></tr><tr><td><kbd>Tab</kbd></td><td>Nächster Filter (Straßen, Orte…).</td></tr><tr><td><kbd>Esc</kbd></td><td>Schließen.</td></tr></table>',
            hSrcT: 'Woher die Ergebnisse kommen',
            hSrcB: '<p>Straßen, Hausnummern, Orte und Städte stammen aus dem, was WME <b>geladen</b> hat: der Bereich auf dem Bildschirm und etwas darum herum. Verschieben oder herauszoomen, um weiter zu suchen. Waze-Orte werden zudem überall nach Namen gefunden, über den Suchdienst von WME selbst (gleiche Website, Ihr eigener Zugang).</p><p>Waze gibt einem Skript kein Objekt per ID, aber seinen <b>Verlauf</b>, der oft eine Position enthält: Eine fehlende Segment-, Knoten- oder Orts-ID wird so überall geortet und dann genau in der Karte um diesen Punkt gefunden. Ohne Hinweis wird rund um den Bildschirm gesucht.</p><p>Google-Orte kommen aus der Google-Bibliothek, die WME bereits lädt. In Frankreich gehen bei eingeschalteter Option die Eingabe und die Kartenposition (auf 1 km genau) an die staatliche API „Recherche d’entreprises“. Einmal täglich fragt das Skript GreasyFork nach der veröffentlichten Version; beim Start liest es die Mindestversion auf GitHub.</p><p>Discuss-Themen kommen aus dem Waze-Forum, auf derselben Website wie WME, mit Ihren eigenen Rechten.</p>',
            hSafeB: 'Das Skript ändert die Karte nie: Es verschiebt die Ansicht, wählt aus und schaltet bei Bedarf die Ebene des gewählten Objekts ein; sonst nichts.',
            btnTip: 'Alles suchen',
            phInput: 'Straßen, Orte, Hausnummern, IDs, Links, Koordinaten…',
            ariaDialog: 'Alles suchen',
            ariaList: 'Ergebnisse',
            fAll: 'Alle',
            fStreet: 'Straßen',
            fAddress: 'Nummern',
            fVenue: 'Orte',
            fCity: 'Städte',
            fEditor: 'Editoren',
            fGoogle: 'Google',
            gDirect: 'Gehe zu',
            gStreet: 'Straßen',
            gAddress: 'Hausnummern',
            gVenue: 'Waze-Orte',
            gCity: 'Städte',
            gHazard: 'Zonen und Blitzer',
            gEditor: 'Editoren',
            gGoogle: 'Google-Orte',
            gRecent: 'Zuletzt',
            kSeg: 'Segment',
            kSegs: n => n + ' Segmente',
            kNode: 'Knoten',
            kVenue: 'Ort',
            kComment: 'Kartenkommentar',
            kHazard: 'Zone',
            kPermalink: 'WME-Permalink',
            kLink: s => 'Link · ' + s,
            kCoords: 'Koordinaten',
            kSwap: 'Koordinaten, gelesen als Länge dann Breite',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Update Request',
            nSeg: n => n === 1 ? '1 Segment' : n + ' Segmente',
            noCity: 'Ohne Stadt',
            altName: 'alternativer Name',
            alias: a => 'auch: ' + a,
            residential: 'Wohngebäude',
            widen: id => 'ID ' + id + ' — nicht im geladenen Bereich',
            widening: (k, n) => 'Suche in der Umgebung… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' nicht gefunden: Der Verlauf liefert keine Position, und sie ist nicht rund um den Bildschirm.',
            shortLink: 'Kurzlink',
            shortLinkSub: 'Im Browser öffnen und dann die vollständige Adresse hier einfügen.',
            moreN: n => n + ' weitere',
            emptyTitle: 'Etwas eingeben oder einfügen',
            emptyHint: 'Eine Straße, ein Ort, eine ID, ein Permalink, Koordinaten, ein Google-Maps-Link…',
            noRes: q => 'Nichts für „' + q + '“.',
            noResHint: 'Straßen und Hausnummern werden nur rund um die Karte gesucht: Karte verschieben, etwas herauszoomen oder Google-Orte einschalten.',
            nRes: n => n === 0 ? 'Keine Ergebnisse' : n === 1 ? '1 Ergebnis' : n + ' Ergebnisse',
            hintNav: 'blättern',
            hintGo: 'hingehen',
            hintCopy: 'Permalink kopieren',
            hintTab: 'neuer Tab',
            hintFilter: 'filtern',
            hintClose: 'schließen',
            copied: 'Permalink kopiert',
            copyFail: 'Permalink konnte nicht kopiert werden',
            googleErr: 'Google hat nicht geantwortet.',
            gCompany: 'Unternehmen (Frankreich)',
            optCompanies: 'Französische Unternehmen',
            optCompaniesHint: 'Nur in Frankreich: die staatliche API „Recherche d’entreprises“ (Sirene-Daten), im Département der Karte; eine SIRET oder SIREN wird überall gefunden. Die Eingabe und die Kartenposition (auf 1 km genau) werden dorthin gesendet.',
            gmapOpen: 'Google-Maps-Eintrag öffnen (Alt+Enter)',
            gmapNone: 'Dieses Ergebnis ist mit keinem Google-Ort verknüpft.',
            gmapUnknown: 'Google-Verknüpfung unbekannt, solange der Ort nicht geladen ist: Enter zum Hinspringen, dann Alt+Enter.',
            venueCapped: 'Die Waze-Suche liefert höchstens 10 Orte, und keiner enthält alle Wörter: Stadt ergänzen oder Karte verschieben.',
            srcVenueFar: 'Waze-Orte außerhalb des Bildschirms',
            srcTimeout: 'keine Antwort',
            srArrived: 'Angekommen: Objekt ausgewählt.',
            urNoComments: 'UR-Unterhaltungen konnten nicht gelesen werden: Bei einer Suche in ihrem Text können welche fehlen.',
            coNoDept: 'Unternehmen: Département der Karte hier nicht gefunden (Küste, See…): Karte leicht verschieben.',
            coClosed: 'geschlossen',
            edNoObj: 'Nichts von ihm auf dem Bildschirm · öffnet sein Profil',
            edTryProfile: 'Profil genau dieses Namens öffnen',
            hEdAll: 'Auch Editoren ohne Objekte auf dem Bildschirm werden gefunden (die Konten des Waze-Forums): über den Anfang ihres Namens nach @ oder im Filter Editoren, über den genauen Namen unter „Alle“. Ihr Name öffnet ihr Profil.',
            lnkDiscuss: 'Discuss-Thread',
            majBtn: v => 'Version ' + v + ' ist verfügbar',
            majInstall: 'Installieren',
            widenErr: c => 'Suche in der Umgebung fehlgeschlagen (' + c + '): Eingabe zum Wiederholen.',
            widenBudget: q => q + ': in den ersten 15 MB um die Karte nicht gefunden. Näher heran und erneut versuchen.',
            noResAny: q => 'Nichts für „' + q + '“.',
            approxShort: 'ungefähre Position',
            noResMove: 'Straßen und Hausnummern werden nur rund um die Karte gesucht: Karte verschieben oder etwas herauszoomen.',
            noResMte: 'Kein MTE mit diesem Namen, nirgends auf der Welt (auch vergangene).',
            noResDiscuss: 'Kein Forenthema zu dieser Suche.',
            noResEditor: 'Kein Editor auf dem Bildschirm und keiner im Forum, dessen Name so beginnt.',
            noResGoogle: 'Google schlägt für diese Suche nichts vor.',
            srcOff: 'Diese Quelle ist im Tab Skripte ausgeschaltet.',
            srOpen: 'aufgeklappt',
            srClosed: 'zugeklappt',
            oWest: '„O“ als West gelesen',
            oEast: '„O“ als Ost gelesen',
            waitObj: 'Warte, bis WME das Objekt lädt…',
            arrivedNoSel: 'Angekommen, aber das Objekt ließ sich nicht auswählen: gelöscht oder hier nicht geladen.',
            approxPlace: 'Ungefähre Position: die Mitte seiner Stadt.',
            srcBusy: 'Suche läuft…',
            srcDown: l => 'Nicht verfügbar: ' + l + '. Ergebnisse können fehlen.',
            urCapped: n => 'Mehr als ' + n + ' URs in der Umgebung: Liste gekürzt, hineinzoomen, um alle zu sehen.',
            otherServer: e => 'Permalink vom Server ' + e,
            otherServerSub: 'Seine Objekte sind nicht auf dieser Karte: er öffnet sich in einem neuen Tab.',
            linkUnknown: 'Link nicht erkannt',
            linkUnknownSub: 'Aus dieser Adresse ließ sich weder Position noch Objekt lesen.',
            locateErr: c => 'Verlauf nicht verfügbar' + (c ? ' (' + c + ')' : '') + ': Eingabe zum Wiederholen.',
            mteClosuresErr: c => 'Die Sperrungen dieses MTE konnten nicht gelesen werden' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'Waze begrenzt die Anfragen: Lesen angehalten, ' + n + ' Objekte übrig. Gleich noch einmal versuchen.',
            histPartial: n => n + ' Verläufe konnten nicht gelesen werden: sie sind nicht mitgezählt.',
            inView: 'sichtbar',
            winMove: 'Ziehen zum Verschieben · Doppelklick setzt zurück',
            winClose: 'Schließen (Esc)',
            edToggle: 'Bearbeitetes ein- oder ausblenden',
            edProfile: 'Editor-Profil öffnen',
            edNothing: 'Nichts auf dem Bildschirm bearbeitet',
            secSeg: 'Segmente',
            secVenue: 'Orte',
            secClosure: 'Sperrungen',
            secHazard: 'Zonen',
            secJunction: 'Junction Boxes',
            secComment: 'Kartenkommentare',
            secMte: 'Großereignisse (MTE)',
            subCreated: 'Erstellt',
            subUpdated: 'Zuletzt von ihm geändert',
            subBefore: 'Früher geändert',
            whenCreated: d => 'erstellt am ' + d,
            whenChanged: d => 'geändert am ' + d,
            histBtn: n => 'Auch ältere Änderungen im Verlauf suchen (' + n + ' Objekte auf dem Bildschirm)',
            histSub: 'Ein bis zwei Anfragen pro Objekt an den Waze-Verlauf, sechs gleichzeitig; einige Sekunden bis eine Minute',
            histRun: (k, n) => 'Verlauf wird gelesen… ' + k + '/' + n,
            noName: 'Ohne Namen',
            kClosure: 'Sperrung',
            kJunction: 'Junction Box',
            kMte: 'Großereignis',
            locating: 'Ortung über den Verlauf…',
            located: v => 'Geortet bei ' + v + ' — Enter, um hinzugehen',
            notLocated: 'Der Verlauf liefert keine Position: Enter sucht rund um den Bildschirm',
            hEdT: 'Editoren',
            hEdB: '<p>Einen Namen eingeben (oder <b>@</b> allein für alle auf dem Bildschirm). Unter <b>Alle</b> öffnet Enter den Editor im Tab <b>Editoren</b>.</p><p>Dort ist alles, was er auf dem Bildschirm bearbeitet hat, nach Art (Segmente, Orte, Sperrungen, Zonen, Junction Boxes, Kommentare, MTE) und Rolle sortiert: <b>erstellt</b>, <b>zuletzt von ihm geändert</b> und – nach dem Lesen des Verlaufs – <b>früher geändert</b>. Ein Klick wählt das Objekt aus und zoomt hin; das Fenster bleibt offen.</p><p>Der Name öffnet das Profil; ▸ oder → klappt auf.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Discuss-Themen',
            optDiscussHint: 'Themen aus dem Waze-Forum, auf derselben Website wie WME, ab 3 Zeichen. Die Eingabe wird an die Forensuche gesendet. Unter „Alle“ steuert sie auch die Suche nach Editornamen im Forum.',
            discussPosts: n => n === 1 ? '1 Beitrag' : n + ' Beiträge',
            hnNoStreet: q => 'Keine geladene Straße passt zu „' + q + '“.',
            hnNone: v => v + ' hat in Waze keine Hausnummern.',
            hnNoNumber: (n, v) => 'Keine Nummer ' + n + ' an ' + v + ' in Waze.',
            hnNumberNowhere: n => 'Keine Nummer ' + n + ' an den geladenen Straßen.',
            optClose: 'Fenster nach einer Auswahl schließen',
            optCloseHint: 'Aus: Es bleibt offen, um von Ergebnis zu Ergebnis zu gehen, und ein Klick auf die Karte behält es. Esc oder × schließt es.',
            fClosure: 'Sperrungen',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Karte',
            gClosure: 'Sperrungen',
            gMte: 'Großereignisse (MTE)',
            gUR: 'Update Requests (UR)',
            gRda: 'Zonen mit Fahrbeschränkung',
            gNote: 'Kartenkommentare',
            gIga: 'Abbiegehinweise',
            stActive: 'Aktiv',
            stPlanned: 'Geplant',
            mteNoShape: 'in der Nähe, ohne Strecke',
            mteNoPlace: 'Dieses MTE hat weder Strecke noch Sperrungen: Es lässt sich nicht verorten.',
            stOver: 'Beendet',
            stFinished: 'Beendet',
            urOpen: 'Offen',
            urClosed: 'Geschlossen',
            kRda: 'Beschränkte Zone',
            urComments: n => n === 1 ? '1 Kommentar' : n + ' Kommentare',
            urTypes: { 6: 'Falsches Abbiegen', 7: 'Falsche Adresse', 8: 'Falsche Route', 9: 'Fehlender Kreisverkehr', 10: 'Allgemeiner Fehler', 11: 'Abbiegen nicht erlaubt', 12: 'Falsche Kreuzung', 13: 'Fehlende Brücke oder Überführung', 14: 'Falsche Fahrtrichtung', 15: 'Fehlende Ausfahrt', 16: 'Fehlende Straße', 18: 'Fehlender Ort', 19: 'Gesperrte Straße', 21: 'Fehlender Straßenname', 22: 'Falsches Straßenpräfix oder -suffix', 23: 'Fehlendes oder falsches Tempolimit' },
            hzTypes: { SCHOOL_ZONE: 'Schulzone', SPEED_BUMP: 'Bremsschwelle', CAMERA: 'Blitzer', TRAFFIC_LIGHT: 'Ampel', RAILROAD_CROSSING: 'Bahnübergang', TOLL_BOOTH: 'Mautstelle', TOPES: 'Topes', DANGEROUS_CURVE: 'Gefährliche Kurve', DANGEROUS_INTERSECTION: 'Gefährliche Kreuzung', DANGEROUS_MERGE: 'Gefährliche Einmündung', SIGN: 'Schild', LANE_ENDING: 'Fahrstreifen endet', RAISED_CROSSWALK: 'Erhöhter Fußgängerüberweg', HIGHWAY_CROSSWALK: 'Fußgängerüberweg auf Schnellstraße', SHOULDER_ENDING: 'Seitenstreifen endet', NARROW_BRIDGE: 'Schmale Brücke' },
            mteCats: { SPORTING_EVENT: 'Sportveranstaltung', CONCERT: 'Konzert', FESTIVAL: 'Festival', PARADE: 'Umzug', CONFERENCE: 'Konferenz', 'CONSTRUCTION': 'Bauarbeiten', 'CRISIS': 'Krise', 'DEMONSTRATION': 'Demonstration', 'DRIVING_ADVISORY': 'Fahrhinweis', 'HOLIDAY/FESTIVAL': 'Feiertag oder Festival', 'OTHER': 'Sonstiges', 'PARTNER_USER_COMMS': 'Partnerkommunikation', 'SUMMIT': 'Gipfel', 'UNPLANNED_DISRUPTION': 'Unvorhergesehene Störung' },
            clearRecents: 'Leeren',
        },
        es: {
            sbHint: 'Buscarlo todo desde un solo campo: calles, números, lugares, ciudades, editores, ID, enlaces permanentes, coordenadas, enlaces de otros mapas y lugares de Google.',
            sbKeys: 'Abrir la búsqueda',
            sbOpts: 'Opciones',
            optGoogle: 'Lugares de Google',
            optGoogleHint: 'Sugerencias de Google, mediante la biblioteca que WME ya carga. Lo que escribe se envía a Google.',
            optSlash: 'Abrir con /',
            optSlashHint: 'La tecla / abre la búsqueda cuando no está escribiendo en un campo.',
            optBtn: 'Botón junto a la búsqueda de WME',
            sbHelp: 'Ayuda',
            hTypeT: 'Qué se puede escribir',
            hTypeB: '<table class="wos-help-table"><tr><td>Calle Mayor</td><td>Una calle, un lugar, una ciudad: palabras en cualquier orden, tildes opcionales, <i>av</i> = <i>avenida</i>…</td></tr><tr><td>12 calle mayor</td><td>Un número en una calle cargada.</td></tr><tr><td>62324199</td><td>Un ID de segmento, nodo, zona, zona restringida o comentario de mapa; varios segmentos separados por comas.</td></tr><tr><td>123.456.789</td><td>Un ID de lugar.</td></tr><tr><td>@usuario</td><td>Un editor y todo lo que tocó en pantalla.</td></tr><tr><td>43.6107, 3.8767</td><td>Coordenadas: decimales, GMS (43°36\'38"N), Lambert 93 o Plus Code.</td></tr><tr><td>https://…</td><td>Un enlace permanente de WME, o un enlace de Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>Un SIREN o SIRET (empresas francesas), en cualquier parte.</td></tr><tr><td>g: panadería</td><td>Solo lugares de Google.</td></tr><tr><td>d: cierres</td><td>Solo temas de Discuss.</td></tr><tr><td>obras</td><td>Cierres en unos {N}\u00a0km, solicitudes de actualización alrededor del mapa, MTE por nombre en todas partes (pasados incluidos); zonas y radares, zonas restringidas, comentarios de mapa y guía de giros en pantalla.</td></tr></table>',
            hKeysT: 'Teclado',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Recorrer los resultados; el mapa muestra el actual.</td></tr><tr><td><kbd>Intro</kbd></td><td>Ir allí y seleccionarlo.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Intro</kbd></td><td>Copiar su enlace permanente.</td></tr><tr><td><kbd>Mayús</kbd> <kbd>Intro</kbd></td><td>Abrirlo en una pestaña nueva.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Intro</kbd></td><td>Abrir la ficha de Google Maps de un lugar de Waze vinculado a Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>Filtro siguiente (calles, lugares…).</td></tr><tr><td><kbd>Esc</kbd></td><td>Cerrar.</td></tr></table>',
            hSrcT: 'De dónde vienen los resultados',
            hSrcB: '<p>Calles, números, lugares y ciudades vienen de lo que WME ha <b>cargado</b>: la zona en pantalla y un poco alrededor. Mueva el mapa o aleje el zoom para buscar más lejos. Los lugares de Waze también se encuentran por su nombre en cualquier parte, mediante el servicio de búsqueda del propio WME (mismo sitio, su propio acceso).</p><p>Waze no da a un script un objeto por ID, pero sí su <b>historial</b>, que a menudo lleva una posición: un ID de segmento, nodo o lugar ausente se localiza así en cualquier parte y luego se encuentra exactamente en el mapa alrededor de ese punto. Sin pista, se busca alrededor de la pantalla.</p><p>Los lugares de Google vienen de la biblioteca de Google que WME ya carga. En Francia, si la opción está activada, lo que escribe y la posición del mapa (con 1 km de precisión) van a la API estatal «Recherche d’entreprises». Una vez al día, el script pregunta a GreasyFork la versión publicada; al iniciarse, lee la versión mínima en GitHub.</p><p>Los temas de Discuss vienen del foro de Waze, en el mismo sitio que WME, con sus propios accesos.</p>',
            hSafeB: 'El script nunca modifica el mapa: mueve la vista, selecciona y, si hace falta, activa la capa del objeto elegido; nada más.',
            btnTip: 'Buscarlo todo',
            phInput: 'Calles, lugares, números, ID, enlaces, coordenadas…',
            ariaDialog: 'Buscarlo todo',
            ariaList: 'Resultados',
            fAll: 'Todo',
            fStreet: 'Calles',
            fAddress: 'Números',
            fVenue: 'Lugares',
            fCity: 'Ciudades',
            fEditor: 'Editores',
            fGoogle: 'Google',
            gDirect: 'Ir a',
            gStreet: 'Calles',
            gAddress: 'Números',
            gVenue: 'Lugares de Waze',
            gCity: 'Ciudades',
            gHazard: 'Zonas y radares',
            gEditor: 'Editores',
            gGoogle: 'Lugares de Google',
            gRecent: 'Recientes',
            kSeg: 'Segmento',
            kSegs: n => n + ' segmentos',
            kNode: 'Nodo',
            kVenue: 'Lugar',
            kComment: 'Comentario de mapa',
            kHazard: 'Zona',
            kPermalink: 'Enlace permanente de WME',
            kLink: s => 'Enlace · ' + s,
            kCoords: 'Coordenadas',
            kSwap: 'Coordenadas, leídas longitud y luego latitud',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Solicitud de actualización',
            nSeg: n => n === 1 ? '1 segmento' : n + ' segmentos',
            noCity: 'Sin ciudad',
            altName: 'nombre alternativo',
            alias: a => 'también: ' + a,
            residential: 'Residencial',
            widen: id => 'ID ' + id + ' — fuera de la zona cargada',
            widening: (k, n) => 'Buscando alrededor… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' no encontrado: su historial no da ninguna posición y no está alrededor de la pantalla.',
            shortLink: 'Enlace corto',
            shortLinkSub: 'Ábralo en el navegador y pegue aquí la dirección completa.',
            moreN: n => n + ' más',
            emptyTitle: 'Escriba o pegue cualquier cosa',
            emptyHint: 'Una calle, un lugar, un ID, un enlace permanente, coordenadas, un enlace de Google Maps…',
            noRes: q => 'Nada para «' + q + '».',
            noResHint: 'Las calles y los números solo se buscan alrededor del mapa: muévalo, aleje un poco el zoom o active los lugares de Google.',
            nRes: n => n === 0 ? 'Sin resultados' : n === 1 ? '1 resultado' : n + ' resultados',
            hintNav: 'recorrer',
            hintGo: 'ir',
            hintCopy: 'copiar enlace',
            hintTab: 'pestaña nueva',
            hintFilter: 'filtrar',
            hintClose: 'cerrar',
            copied: 'Enlace permanente copiado',
            copyFail: 'No se pudo copiar el enlace permanente',
            googleErr: 'Google no respondió.',
            gCompany: 'Empresas (Francia)',
            optCompanies: 'Empresas francesas',
            optCompaniesHint: 'Solo en Francia: la API estatal «Recherche d’entreprises» (datos Sirene), en el departamento del mapa; un SIRET o SIREN se encuentra en cualquier parte. Lo que escribe y la posición del mapa (con 1 km de precisión) se le envían.',
            gmapOpen: 'Abrir su ficha de Google Maps (Alt+Intro)',
            gmapNone: 'Este resultado no está vinculado a ningún lugar de Google.',
            gmapUnknown: 'Vínculo con Google desconocido mientras el lugar no esté cargado: Intro para ir, luego Alt+Intro.',
            venueCapped: 'La búsqueda de Waze devuelve 10 lugares como máximo y ninguno contiene todas las palabras: añada la ciudad o mueva el mapa.',
            srcVenueFar: 'Lugares de Waze fuera de la pantalla',
            srcTimeout: 'sin respuesta',
            srArrived: 'Listo: objeto seleccionado.',
            urNoComments: 'No se pudieron leer las conversaciones de las UR: una búsqueda en su texto puede omitir algunas.',
            coNoDept: 'Empresas: no se encuentra aquí el departamento del mapa (costa, lago…): mueva un poco el mapa.',
            coClosed: 'cerrado',
            edNoObj: 'Nada suyo en pantalla · abre su perfil',
            edTryProfile: 'Abrir el perfil con este nombre exacto',
            hEdAll: 'También se encuentran los editores sin nada en pantalla (las cuentas del foro de Waze): por el comienzo de su nombre tras @ o en el filtro Editores, por su nombre exacto en «Todo». Su nombre abre su perfil.',
            lnkDiscuss: 'Hilo en Discuss',
            majBtn: v => 'La versión ' + v + ' está disponible',
            majInstall: 'Instalar',
            widenErr: c => 'La búsqueda alrededor falló (' + c + '): Intro para reintentar.',
            widenBudget: q => q + ': no encontrado en los primeros 15 MB alrededor del mapa. Acérquese y vuelva a intentarlo.',
            noResAny: q => 'Nada para «' + q + '».',
            approxShort: 'posición aproximada',
            noResMove: 'Las calles y los números solo se buscan alrededor del mapa: muévalo o aleje un poco el zoom.',
            noResMte: 'Ningún MTE con este nombre, en ninguna parte del mundo (pasados incluidos).',
            noResDiscuss: 'Ningún tema del foro para esta búsqueda.',
            noResEditor: 'Ningún editor en pantalla ni en el foro cuyo nombre empiece así.',
            noResGoogle: 'Google no propone nada para esta búsqueda.',
            srcOff: 'Esta fuente está desactivada en la pestaña Scripts.',
            srOpen: 'desplegada',
            srClosed: 'plegada',
            oWest: '«O» leída como Oeste',
            oEast: '«O» leída como Este (Ost, Oost)',
            waitObj: 'Esperando a que WME cargue el objeto…',
            arrivedNoSel: 'Llegado, pero no se pudo seleccionar el objeto: eliminado, o no cargado aquí.',
            approxPlace: 'Posición aproximada: el centro de su ciudad.',
            srcBusy: 'Buscando…',
            srcDown: l => 'No disponible: ' + l + '. Pueden faltar resultados.',
            urCapped: n => 'Más de ' + n + ' UR por la zona: la lista está cortada, acerque el zoom para verlas todas.',
            otherServer: e => 'Enlace permanente del servidor ' + e,
            otherServerSub: 'Sus objetos no están en este mapa: se abre en una pestaña nueva.',
            linkUnknown: 'Enlace no reconocido',
            linkUnknownSub: 'No se pudo leer ninguna posición ni ningún objeto en esta dirección.',
            locateErr: c => 'Historial no disponible' + (c ? ' (' + c + ')' : '') + ': Intro para reintentar.',
            mteClosuresErr: c => 'No se pudieron leer los cierres de este MTE' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'Waze limita las solicitudes: lectura detenida, quedan ' + n + ' objetos. Reintente en un momento.',
            histPartial: n => n + ' historiales no se pudieron leer: no se cuentan.',
            inView: 'en pantalla',
            winMove: 'Arrastrar para mover · doble clic para recolocar',
            winClose: 'Cerrar (Esc)',
            edToggle: 'Mostrar u ocultar lo que tocó',
            edProfile: 'Abrir el perfil del editor',
            edNothing: 'Nada tocado en pantalla',
            secSeg: 'Segmentos',
            secVenue: 'Lugares',
            secClosure: 'Cierres',
            secHazard: 'Zonas',
            secJunction: 'Cruces complejos',
            secComment: 'Comentarios de mapa',
            secMte: 'Eventos de tráfico (MTE)',
            subCreated: 'Creados',
            subUpdated: 'Modificados por él en último lugar',
            subBefore: 'Modificados antes',
            whenCreated: d => 'creado el ' + d,
            whenChanged: d => 'modificado el ' + d,
            histBtn: n => 'Buscar también cambios anteriores en el historial (' + n + ' objetos en pantalla)',
            histSub: 'Una o dos solicitudes por objeto al historial de Waze, seis a la vez; de unos segundos a un minuto',
            histRun: (k, n) => 'Leyendo el historial… ' + k + '/' + n,
            noName: 'Sin nombre',
            kClosure: 'Cierre',
            kJunction: 'Cruce complejo',
            kMte: 'Evento de tráfico',
            locating: 'Localizando por su historial…',
            located: v => 'Localizado cerca de ' + v + ' — Intro para ir',
            notLocated: 'Su historial no da ninguna posición: Intro busca alrededor de la pantalla',
            hEdT: 'Editores',
            hEdB: '<p>Escriba un nombre (o <b>@</b> solo para todos los de la pantalla). Desde <b>Todo</b>, Intro abre el editor en la pestaña <b>Editores</b>.</p><p>Allí, todo lo que tocó en pantalla se ordena por tipo (segmentos, lugares, cierres, zonas, cruces complejos, comentarios, MTE) y por papel: <b>creados</b>, <b>modificados por él en último lugar</b> y, tras leer el historial, <b>modificados antes</b>. Un clic selecciona el objeto y acerca el zoom; la ventana sigue abierta.</p><p>El nombre abre su perfil; ▸ o → lo despliega.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Temas de Discuss',
            optDiscussHint: 'Los temas del foro de Waze, en el mismo sitio que WME, desde 3 caracteres. Lo que escribe se envía a la búsqueda del foro. En «Todo», también controla la búsqueda de nombres de editores en el foro.',
            discussPosts: n => n === 1 ? '1 mensaje' : n + ' mensajes',
            hnNoStreet: q => 'Ninguna calle cargada coincide con «' + q + '».',
            hnNone: v => v + ' no tiene ningún número en Waze.',
            hnNoNumber: (n, v) => 'No hay número ' + n + ' en ' + v + ' en Waze.',
            hnNumberNowhere: n => 'No hay número ' + n + ' en las calles cargadas.',
            optClose: 'Cerrar la ventana tras una elección',
            optCloseHint: 'Desactivado: sigue abierta para pasar de un resultado a otro, y un clic en el mapa la mantiene. Esc o × la cierran.',
            fClosure: 'Cierres',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Mapa',
            gClosure: 'Cierres',
            gMte: 'Eventos de tráfico (MTE)',
            gUR: 'Solicitudes de actualización (UR)',
            gRda: 'Zonas de circulación restringida',
            gNote: 'Comentarios de mapa',
            gIga: 'Guía de giros',
            stActive: 'Activo',
            stPlanned: 'Programado',
            mteNoShape: 'por aquí, sin trazado',
            mteNoPlace: 'Este MTE no tiene trazado ni cierres: no se puede ubicar.',
            stOver: 'Terminado',
            stFinished: 'Terminado',
            urOpen: 'Abierta',
            urClosed: 'Cerrada',
            kRda: 'Zona restringida',
            urComments: n => n === 1 ? '1 comentario' : n + ' comentarios',
            urTypes: { 6: 'Giro incorrecto', 7: 'Dirección incorrecta', 8: 'Ruta incorrecta', 9: 'Rotonda ausente', 10: 'Error general', 11: 'Giro no permitido', 12: 'Intersección incorrecta', 13: 'Puente o paso elevado ausente', 14: 'Sentido de circulación incorrecto', 15: 'Salida ausente', 16: 'Carretera ausente', 18: 'Lugar ausente', 19: 'Carretera bloqueada', 21: 'Nombre de calle ausente', 22: 'Prefijo o sufijo de calle incorrecto', 23: 'Límite de velocidad ausente o incorrecto' },
            hzTypes: { SCHOOL_ZONE: 'Zona escolar', SPEED_BUMP: 'Badén', CAMERA: 'Radar', TRAFFIC_LIGHT: 'Semáforo', RAILROAD_CROSSING: 'Paso a nivel', TOLL_BOOTH: 'Peaje', TOPES: 'Topes', DANGEROUS_CURVE: 'Curva peligrosa', DANGEROUS_INTERSECTION: 'Intersección peligrosa', DANGEROUS_MERGE: 'Incorporación peligrosa', SIGN: 'Señal', LANE_ENDING: 'Fin de carril', RAISED_CROSSWALK: 'Paso de peatones elevado', HIGHWAY_CROSSWALK: 'Paso de peatones en vía rápida', SHOULDER_ENDING: 'Fin de arcén', NARROW_BRIDGE: 'Puente estrecho' },
            mteCats: { SPORTING_EVENT: 'Evento deportivo', CONCERT: 'Concierto', FESTIVAL: 'Festival', PARADE: 'Desfile', CONFERENCE: 'Conferencia', 'CONSTRUCTION': 'Obras', 'CRISIS': 'Crisis', 'DEMONSTRATION': 'Manifestación', 'DRIVING_ADVISORY': 'Aviso de conducción', 'HOLIDAY/FESTIVAL': 'Fiesta o festival', 'OTHER': 'Otro', 'PARTNER_USER_COMMS': 'Comunicación de socio', 'SUMMIT': 'Cumbre', 'UNPLANNED_DISRUPTION': 'Interrupción imprevista' },
            clearRecents: 'Borrar',
        },
        it: {
            sbHint: 'Cercare tutto da un solo campo: strade, numeri civici, luoghi, città, editor, ID, permalink, coordinate, link di altre mappe e luoghi Google.',
            sbKeys: 'Aprire la ricerca',
            sbOpts: 'Opzioni',
            optGoogle: 'Luoghi Google',
            optGoogleHint: 'Suggerimenti di Google, tramite la libreria che WME carica già. Il testo digitato viene inviato a Google.',
            optSlash: 'Aprire con /',
            optSlashHint: 'Il tasto / apre la ricerca quando non si sta scrivendo in un campo.',
            optBtn: 'Pulsante accanto alla ricerca di WME',
            sbHelp: 'Aiuto',
            hTypeT: 'Cosa si può scrivere',
            hTypeB: '<table class="wos-help-table"><tr><td>Via Roma</td><td>Una strada, un luogo, una città: parole in qualsiasi ordine, accenti facoltativi, <i>v</i> = <i>via</i>, <i>p.za</i> = <i>piazza</i>…</td></tr><tr><td>12 via roma</td><td>Un numero civico su una strada caricata.</td></tr><tr><td>62324199</td><td>Un ID di segmento, nodo, zona, zona limitata o commento mappa; più segmenti separati da virgole.</td></tr><tr><td>123.456.789</td><td>Un ID di luogo.</td></tr><tr><td>@utente</td><td>Un editor e tutto ciò che ha toccato sullo schermo.</td></tr><tr><td>43.6107, 3.8767</td><td>Coordinate: decimali, GMS (43°36\'38"N), Lambert 93 o Plus Code.</td></tr><tr><td>https://…</td><td>Un permalink WME, o un link di Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>Un SIREN o SIRET (imprese francesi), ovunque.</td></tr><tr><td>g: panetteria</td><td>Solo luoghi Google.</td></tr><tr><td>d: chiusure</td><td>Solo argomenti Discuss.</td></tr><tr><td>lavori</td><td>Chiusure entro circa {N}\u00a0km, richieste di aggiornamento intorno alla mappa, MTE per nome ovunque (anche passati); zone e autovelox, zone limitate, commenti mappa e indicazioni di svolta sullo schermo.</td></tr></table>',
            hKeysT: 'Tastiera',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Scorrere i risultati; la mappa mostra quello corrente.</td></tr><tr><td><kbd>Invio</kbd></td><td>Andarci e selezionarlo.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Invio</kbd></td><td>Copiare il permalink.</td></tr><tr><td><kbd>Maiusc</kbd> <kbd>Invio</kbd></td><td>Aprirlo in una nuova scheda.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Invio</kbd></td><td>Aprire la scheda Google Maps di un luogo Waze collegato a Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>Filtro successivo (strade, luoghi…).</td></tr><tr><td><kbd>Esc</kbd></td><td>Chiudere.</td></tr></table>',
            hSrcT: 'Da dove vengono i risultati',
            hSrcB: '<p>Strade, numeri, luoghi e città vengono da ciò che WME ha <b>caricato</b>: l\'area sullo schermo e un po\' intorno. Spostare la mappa o ridurre lo zoom per cercare più lontano. I luoghi Waze si trovano anche per nome ovunque, tramite il servizio di ricerca di WME stesso (stesso sito, con i propri accessi).</p><p>Waze non dà a uno script un oggetto per ID, ma dà la sua <b>cronologia</b>, che spesso contiene una posizione: un ID di segmento, nodo o luogo assente viene così localizzato ovunque, poi trovato esattamente nella mappa intorno a quel punto. Senza indizi, si cerca intorno allo schermo.</p><p>I luoghi Google vengono dalla libreria Google già caricata da WME. In Francia, se l\'opzione è attiva, il testo digitato e la posizione della mappa (a 1 km) vanno all\'API statale «Recherche d’entreprises». Una volta al giorno lo script chiede a GreasyFork la versione pubblicata; all\'avvio legge la versione minima su GitHub.</p><p>Gli argomenti Discuss vengono dal forum di Waze, sullo stesso sito di WME, con i propri accessi.</p>',
            hSafeB: 'Lo script non modifica mai la mappa: sposta la vista, seleziona e, se serve, accende il livello dell\'oggetto scelto; nient\'altro.',
            btnTip: 'Cerca tutto',
            phInput: 'Strade, luoghi, numeri, ID, link, coordinate…',
            ariaDialog: 'Cerca tutto',
            ariaList: 'Risultati',
            fAll: 'Tutto',
            fStreet: 'Strade',
            fAddress: 'Numeri',
            fVenue: 'Luoghi',
            fCity: 'Città',
            fEditor: 'Editor',
            fGoogle: 'Google',
            gDirect: 'Vai a',
            gStreet: 'Strade',
            gAddress: 'Numeri civici',
            gVenue: 'Luoghi Waze',
            gCity: 'Città',
            gHazard: 'Zone e autovelox',
            gEditor: 'Editor',
            gGoogle: 'Luoghi Google',
            gRecent: 'Recenti',
            kSeg: 'Segmento',
            kSegs: n => n + ' segmenti',
            kNode: 'Nodo',
            kVenue: 'Luogo',
            kComment: 'Commento mappa',
            kHazard: 'Zona',
            kPermalink: 'Permalink WME',
            kLink: s => 'Link · ' + s,
            kCoords: 'Coordinate',
            kSwap: 'Coordinate, lette longitudine poi latitudine',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Richiesta di aggiornamento',
            nSeg: n => n === 1 ? '1 segmento' : n + ' segmenti',
            noCity: 'Senza città',
            altName: 'nome alternativo',
            alias: a => 'anche: ' + a,
            residential: 'Residenziale',
            widen: id => 'ID ' + id + ' — fuori dall\'area caricata',
            widening: (k, n) => 'Ricerca nei dintorni… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' non trovato: la cronologia non dà alcuna posizione e non è intorno allo schermo.',
            shortLink: 'Link breve',
            shortLinkSub: 'Aprirlo nel browser, poi incollare qui l\'indirizzo completo.',
            moreN: n => 'altri ' + n,
            emptyTitle: 'Scrivere o incollare qualsiasi cosa',
            emptyHint: 'Una strada, un luogo, un ID, un permalink, coordinate, un link Google Maps…',
            noRes: q => 'Niente per «' + q + '».',
            noResHint: 'Strade e numeri civici si cercano solo intorno alla mappa: spostarla, ridurre un po\' lo zoom o attivare i luoghi Google.',
            nRes: n => n === 0 ? 'Nessun risultato' : n === 1 ? '1 risultato' : n + ' risultati',
            hintNav: 'scorrere',
            hintGo: 'andare',
            hintCopy: 'copiare il permalink',
            hintTab: 'nuova scheda',
            hintFilter: 'filtrare',
            hintClose: 'chiudere',
            copied: 'Permalink copiato',
            copyFail: 'Impossibile copiare il permalink',
            googleErr: 'Google non ha risposto.',
            gCompany: 'Imprese (Francia)',
            optCompanies: 'Imprese francesi',
            optCompaniesHint: 'Solo in Francia: l\'API statale «Recherche d’entreprises» (dati Sirene), nel dipartimento della mappa; un SIRET o SIREN si trova ovunque. Il testo digitato e la posizione della mappa (a 1 km) le vengono inviati.',
            gmapOpen: 'Apri la scheda Google Maps (Alt+Invio)',
            gmapNone: 'Questo risultato non è collegato a un luogo Google.',
            gmapUnknown: 'Collegamento a Google sconosciuto finché il luogo non è caricato: Invio per andarci, poi Alt+Invio.',
            venueCapped: 'La ricerca di Waze restituisce al massimo 10 luoghi e nessuno contiene tutte le parole: aggiungere la città o spostare la mappa.',
            srcVenueFar: 'Luoghi Waze fuori dallo schermo',
            srcTimeout: 'nessuna risposta',
            srArrived: 'Arrivati: oggetto selezionato.',
            urNoComments: 'Non è stato possibile leggere le conversazioni delle UR: una ricerca nel loro testo può non trovarne alcune.',
            coNoDept: 'Imprese: dipartimento della mappa non trovato qui (costa, lago…): spostare un po’ la mappa.',
            coClosed: 'chiuso',
            edNoObj: 'Niente di suo sullo schermo · apre il suo profilo',
            edTryProfile: 'Aprire il profilo con esattamente questo nome',
            hEdAll: 'Si trovano anche gli editor senza nulla sullo schermo (gli account del forum di Waze): dall\'inizio del nome dopo @ o nel filtro Editor, dal nome esatto in «Tutto». Il nome apre il profilo.',
            lnkDiscuss: 'Discussione su Discuss',
            majBtn: v => 'La versione ' + v + ' è disponibile',
            majInstall: 'Installa',
            widenErr: c => 'La ricerca nei dintorni non è riuscita (' + c + '): Invio per riprovare.',
            widenBudget: q => q + ': non trovato nei primi 15 MB intorno alla mappa. Avvicinarsi e riprovare.',
            noResAny: q => 'Niente per «' + q + '».',
            approxShort: 'posizione approssimativa',
            noResMove: 'Strade e numeri civici si cercano solo intorno alla mappa: spostarla o ridurre un po\' lo zoom.',
            noResMte: 'Nessun MTE con questo nome, in nessuna parte del mondo (anche passati).',
            noResDiscuss: 'Nessun argomento del forum per questa ricerca.',
            noResEditor: 'Nessun editor sullo schermo né sul forum il cui nome inizi così.',
            noResGoogle: 'Google non propone nulla per questa ricerca.',
            srcOff: 'Questa fonte è disattivata nella scheda Script.',
            srOpen: 'espansa',
            srClosed: 'compressa',
            oWest: '«O» letta come Ovest',
            oEast: '«O» letta come Est (Ost, Oost)',
            waitObj: 'In attesa che WME carichi l\'oggetto…',
            arrivedNoSel: 'Arrivato, ma non è stato possibile selezionare l\'oggetto: eliminato, o non caricato qui.',
            approxPlace: 'Posizione approssimativa: il centro del suo comune.',
            srcBusy: 'Ricerca in corso…',
            srcDown: l => 'Non disponibile: ' + l + '. Potrebbero mancare risultati.',
            urCapped: n => 'Oltre ' + n + ' UR nei dintorni: elenco troncato, aumenta lo zoom per vederle tutte.',
            otherServer: e => 'Permalink del server ' + e,
            otherServerSub: 'I suoi oggetti non sono su questa mappa: si apre in una nuova scheda.',
            linkUnknown: 'Link non riconosciuto',
            linkUnknownSub: 'Da questo indirizzo non è stato possibile leggere né una posizione né un oggetto.',
            locateErr: c => 'Cronologia non disponibile' + (c ? ' (' + c + ')' : '') + ': Invio per riprovare.',
            mteClosuresErr: c => 'Impossibile leggere le chiusure di questo MTE' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'Waze limita le richieste: lettura interrotta, restano ' + n + ' oggetti. Riprova tra poco.',
            histPartial: n => n + ' cronologie non sono state lette: non sono conteggiate.',
            inView: 'sullo schermo',
            winMove: 'Trascinare per spostare · doppio clic per riposizionare',
            winClose: 'Chiudi (Esc)',
            edToggle: 'Mostrare o nascondere ciò che ha toccato',
            edProfile: 'Aprire il profilo dell\'editor',
            edNothing: 'Niente di toccato sullo schermo',
            secSeg: 'Segmenti',
            secVenue: 'Luoghi',
            secClosure: 'Chiusure',
            secHazard: 'Zone',
            secJunction: 'Incroci complessi',
            secComment: 'Commenti mappa',
            secMte: 'Eventi di traffico (MTE)',
            subCreated: 'Creati',
            subUpdated: 'Modificati per ultimo da lui',
            subBefore: 'Modificati prima',
            whenCreated: d => 'creato il ' + d,
            whenChanged: d => 'modificato il ' + d,
            histBtn: n => 'Cercare anche le modifiche precedenti nella cronologia (' + n + ' oggetti sullo schermo)',
            histSub: 'Una o due richieste per oggetto alla cronologia di Waze, sei alla volta; da qualche secondo a un minuto',
            histRun: (k, n) => 'Lettura della cronologia… ' + k + '/' + n,
            noName: 'Senza nome',
            kClosure: 'Chiusura',
            kJunction: 'Incrocio complesso',
            kMte: 'Evento di traffico',
            locating: 'Localizzazione tramite la cronologia…',
            located: v => 'Localizzato vicino a ' + v + ' — Invio per andarci',
            notLocated: 'La cronologia non dà alcuna posizione: Invio cerca intorno allo schermo',
            hEdT: 'Editor',
            hEdB: '<p>Scrivere un nome (o <b>@</b> da solo per tutti quelli sullo schermo). Da <b>Tutto</b>, Invio apre l\'editor nella scheda <b>Editor</b>.</p><p>Lì, tutto ciò che ha toccato sullo schermo è ordinato per tipo (segmenti, luoghi, chiusure, zone, incroci complessi, commenti, MTE) e per ruolo: <b>creati</b>, <b>modificati per ultimo da lui</b> e, dopo la lettura della cronologia, <b>modificati prima</b>. Un clic seleziona l\'oggetto e lo inquadra; la finestra resta aperta.</p><p>Il nome apre il profilo; ▸ o → lo espande.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Argomenti Discuss',
            optDiscussHint: 'Gli argomenti del forum di Waze, sullo stesso sito di WME, da 3 caratteri. Il testo digitato viene inviato alla ricerca del forum. In «Tutto», controlla anche la ricerca dei nomi degli editor sul forum.',
            discussPosts: n => n === 1 ? '1 messaggio' : n + ' messaggi',
            hnNoStreet: q => 'Nessuna strada caricata corrisponde a «' + q + '».',
            hnNone: v => v + ' non ha numeri civici in Waze.',
            hnNoNumber: (n, v) => 'Nessun numero ' + n + ' su ' + v + ' in Waze.',
            hnNumberNowhere: n => 'Nessun numero ' + n + ' sulle strade caricate.',
            optClose: 'Chiudere la finestra dopo una scelta',
            optCloseHint: 'Disattivato: resta aperta per passare da un risultato all\'altro, e un clic sulla mappa la mantiene. Esc o × la chiudono.',
            fClosure: 'Chiusure',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Mappa',
            gClosure: 'Chiusure',
            gMte: 'Eventi di traffico (MTE)',
            gUR: 'Richieste di aggiornamento (UR)',
            gRda: 'Zone a circolazione limitata',
            gNote: 'Commenti mappa',
            gIga: 'Indicazioni di svolta',
            stActive: 'Attiva',
            stPlanned: 'Programmata',
            mteNoShape: 'nei dintorni, senza tracciato',
            mteNoPlace: 'Questo MTE non ha né tracciato né chiusure: impossibile localizzarlo.',
            stOver: 'Terminato',
            stFinished: 'Terminata',
            urOpen: 'Aperta',
            urClosed: 'Chiusa',
            kRda: 'Zona limitata',
            urComments: n => n === 1 ? '1 commento' : n + ' commenti',
            urTypes: { 6: 'Svolta errata', 7: 'Indirizzo errato', 8: 'Percorso errato', 9: 'Rotonda mancante', 10: 'Errore generico', 11: 'Svolta non consentita', 12: 'Incrocio errato', 13: 'Ponte o cavalcavia mancante', 14: 'Senso di marcia errato', 15: 'Uscita mancante', 16: 'Strada mancante', 18: 'Luogo mancante', 19: 'Strada bloccata', 21: 'Nome della via mancante', 22: 'Prefisso o suffisso della via errato', 23: 'Limite di velocità mancante o errato' },
            hzTypes: { SCHOOL_ZONE: 'Zona scolastica', SPEED_BUMP: 'Dosso', CAMERA: 'Autovelox', TRAFFIC_LIGHT: 'Semaforo', RAILROAD_CROSSING: 'Passaggio a livello', TOLL_BOOTH: 'Casello', TOPES: 'Topes', DANGEROUS_CURVE: 'Curva pericolosa', DANGEROUS_INTERSECTION: 'Incrocio pericoloso', DANGEROUS_MERGE: 'Immissione pericolosa', SIGN: 'Segnale', LANE_ENDING: 'Fine corsia', RAISED_CROSSWALK: 'Attraversamento pedonale rialzato', HIGHWAY_CROSSWALK: 'Attraversamento pedonale su strada veloce', SHOULDER_ENDING: 'Fine corsia d\'emergenza', NARROW_BRIDGE: 'Ponte stretto' },
            mteCats: { SPORTING_EVENT: 'Evento sportivo', CONCERT: 'Concerto', FESTIVAL: 'Festival', PARADE: 'Sfilata', CONFERENCE: 'Conferenza', 'CONSTRUCTION': 'Lavori', 'CRISIS': 'Crisi', 'DEMONSTRATION': 'Manifestazione', 'DRIVING_ADVISORY': 'Avviso di guida', 'HOLIDAY/FESTIVAL': 'Festività o festival', 'OTHER': 'Altro', 'PARTNER_USER_COMMS': 'Comunicazione partner', 'SUMMIT': 'Vertice', 'UNPLANNED_DISRUPTION': 'Interruzione imprevista' },
            clearRecents: 'Cancella',
        },
        'pt-BR': {
            sbHint: 'Buscar tudo em um só campo: ruas, números, lugares, cidades, editores, IDs, permalinks, coordenadas, links de outros mapas e lugares do Google.',
            sbKeys: 'Abrir a busca',
            sbOpts: 'Opções',
            optGoogle: 'Lugares do Google',
            optGoogleHint: 'Sugestões do Google, pela biblioteca que o WME já carrega. O que você digita é enviado ao Google.',
            optSlash: 'Abrir com /',
            optSlashHint: 'A tecla / abre a busca quando você não está digitando em um campo.',
            optBtn: 'Botão ao lado da busca do WME',
            sbHelp: 'Ajuda',
            hTypeT: 'O que dá para digitar',
            hTypeB: '<table class="wos-help-table"><tr><td>Rua Augusta</td><td>Uma rua, um lugar, uma cidade: palavras em qualquer ordem, acentos opcionais, <i>av</i> = <i>avenida</i>…</td></tr><tr><td>12 rua augusta</td><td>Um número em uma rua carregada.</td></tr><tr><td>62324199</td><td>Um ID de segmento, nó, zona, zona restrita ou comentário de mapa; vários segmentos separados por vírgulas.</td></tr><tr><td>123.456.789</td><td>Um ID de lugar.</td></tr><tr><td>@usuario</td><td>Um editor e tudo o que ele mexeu na tela.</td></tr><tr><td>43.6107, 3.8767</td><td>Coordenadas: decimais, GMS (43°36\'38"N), Lambert 93 ou Plus Code.</td></tr><tr><td>https://…</td><td>Um permalink do WME, ou um link do Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>Um SIREN ou SIRET (empresas francesas), em qualquer lugar.</td></tr><tr><td>g: padaria</td><td>Só lugares do Google.</td></tr><tr><td>d: bloqueios</td><td>Só tópicos do Discuss.</td></tr><tr><td>obras</td><td>Bloqueios num raio de cerca de {N}\u00a0km, solicitações de atualização ao redor do mapa, MTE pelo nome em qualquer lugar (passados incluídos); zonas e radares, zonas restritas, comentários de mapa e orientação de conversões na tela.</td></tr></table>',
            hKeysT: 'Teclado',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Percorrer os resultados; o mapa mostra o atual.</td></tr><tr><td><kbd>Enter</kbd></td><td>Ir até lá e selecionar.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Enter</kbd></td><td>Copiar o permalink.</td></tr><tr><td><kbd>Shift</kbd> <kbd>Enter</kbd></td><td>Abrir em uma nova aba.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Enter</kbd></td><td>Abrir a ficha no Google Maps de um lugar do Waze vinculado ao Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>Próximo filtro (ruas, lugares…).</td></tr><tr><td><kbd>Esc</kbd></td><td>Fechar.</td></tr></table>',
            hSrcT: 'De onde vêm os resultados',
            hSrcB: '<p>Ruas, números, lugares e cidades vêm do que o WME <b>carregou</b>: a área na tela e um pouco ao redor. Mova o mapa ou afaste o zoom para buscar mais longe. Os lugares do Waze também são encontrados pelo nome em qualquer lugar, pelo próprio serviço de busca do WME (mesmo site, seu próprio acesso).</p><p>O Waze não dá a um script um objeto por ID, mas dá o seu <b>histórico</b>, que muitas vezes traz uma posição: um ID de segmento, nó ou lugar ausente é assim localizado em qualquer lugar e depois encontrado exatamente no mapa ao redor desse ponto. Sem pista, a busca é feita ao redor da tela.</p><p>Os lugares do Google vêm da biblioteca do Google que o WME já carrega. Na França, se a opção estiver ativada, o que você digita e a posição do mapa (com precisão de 1 km) vão para a API estatal “Recherche d’entreprises”. Uma vez por dia, o script consulta no GreasyFork a versão publicada; ao iniciar, lê a versão mínima no GitHub.</p><p>Os tópicos do Discuss vêm do fórum do Waze, no mesmo site do WME, com os seus próprios acessos.</p>',
            hSafeB: 'O script nunca altera o mapa: ele move a visão, seleciona e, se preciso, ativa a camada do objeto escolhido; nada mais.',
            btnTip: 'Buscar tudo',
            phInput: 'Ruas, lugares, números, IDs, links, coordenadas…',
            ariaDialog: 'Buscar tudo',
            ariaList: 'Resultados',
            fAll: 'Tudo',
            fStreet: 'Ruas',
            fAddress: 'Números',
            fVenue: 'Lugares',
            fCity: 'Cidades',
            fEditor: 'Editores',
            fGoogle: 'Google',
            gDirect: 'Ir para',
            gStreet: 'Ruas',
            gAddress: 'Números',
            gVenue: 'Lugares do Waze',
            gCity: 'Cidades',
            gHazard: 'Zonas e radares',
            gEditor: 'Editores',
            gGoogle: 'Lugares do Google',
            gRecent: 'Recentes',
            kSeg: 'Segmento',
            kSegs: n => n + ' segmentos',
            kNode: 'Nó',
            kVenue: 'Lugar',
            kComment: 'Comentário de mapa',
            kHazard: 'Zona',
            kPermalink: 'Permalink do WME',
            kLink: s => 'Link · ' + s,
            kCoords: 'Coordenadas',
            kSwap: 'Coordenadas, lidas longitude e depois latitude',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Solicitação de atualização',
            nSeg: n => n === 1 ? '1 segmento' : n + ' segmentos',
            noCity: 'Sem cidade',
            altName: 'nome alternativo',
            alias: a => 'também: ' + a,
            residential: 'Residencial',
            widen: id => 'ID ' + id + ' — fora da área carregada',
            widening: (k, n) => 'Buscando ao redor… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' não encontrado: o histórico não dá nenhuma posição e ele não está ao redor da tela.',
            shortLink: 'Link curto',
            shortLinkSub: 'Abra-o no navegador e cole aqui o endereço completo.',
            moreN: n => 'mais ' + n,
            emptyTitle: 'Digite ou cole qualquer coisa',
            emptyHint: 'Uma rua, um lugar, um ID, um permalink, coordenadas, um link do Google Maps…',
            noRes: q => 'Nada para “' + q + '”.',
            noResHint: 'Ruas e números só são buscados ao redor do mapa: mova-o, afaste um pouco o zoom ou ative os lugares do Google.',
            nRes: n => n === 0 ? 'Nenhum resultado' : n === 1 ? '1 resultado' : n + ' resultados',
            hintNav: 'percorrer',
            hintGo: 'ir',
            hintCopy: 'copiar permalink',
            hintTab: 'nova aba',
            hintFilter: 'filtrar',
            hintClose: 'fechar',
            copied: 'Permalink copiado',
            copyFail: 'Não foi possível copiar o permalink',
            googleErr: 'O Google não respondeu.',
            gCompany: 'Empresas (França)',
            optCompanies: 'Empresas francesas',
            optCompaniesHint: 'Só na França: a API estatal “Recherche d’entreprises” (dados Sirene), no departamento do mapa; um SIRET ou SIREN é encontrado em qualquer lugar. O que você digita e a posição do mapa (com precisão de 1 km) são enviados a ela.',
            gmapOpen: 'Abrir a ficha no Google Maps (Alt+Enter)',
            gmapNone: 'Este resultado não está vinculado a um lugar do Google.',
            gmapUnknown: 'Vínculo com o Google desconhecido enquanto o lugar não for carregado: Enter para ir até ele, depois Alt+Enter.',
            venueCapped: 'A busca do Waze retorna no máximo 10 lugares e nenhum contém todas as palavras: adicione a cidade ou mova o mapa.',
            srcVenueFar: 'Lugares do Waze fora da tela',
            srcTimeout: 'sem resposta',
            srArrived: 'Pronto: objeto selecionado.',
            urNoComments: 'Não foi possível ler as conversas das URs: uma busca no texto delas pode deixar algumas de fora.',
            coNoDept: 'Empresas: departamento do mapa não encontrado aqui (litoral, lagoa…): mova um pouco o mapa.',
            coClosed: 'fechado',
            edNoObj: 'Nada dele na tela · abre o perfil',
            edTryProfile: 'Abrir o perfil com exatamente este nome',
            hEdAll: 'Editores sem nada na tela também são encontrados (as contas do fórum do Waze): pelo começo do nome após @ ou no filtro Editores, pelo nome exato em “Tudo”. O nome abre o perfil.',
            lnkDiscuss: 'Tópico no Discuss',
            majBtn: v => 'A versão ' + v + ' está disponível',
            majInstall: 'Instalar',
            widenErr: c => 'A busca ao redor falhou (' + c + '): Enter para tentar de novo.',
            widenBudget: q => q + ': não encontrado nos primeiros 15 MB ao redor do mapa. Aproxime-se e tente de novo.',
            noResAny: q => 'Nada para “' + q + '”.',
            approxShort: 'posição aproximada',
            noResMove: 'Ruas e números só são buscados ao redor do mapa: mova-o ou afaste um pouco o zoom.',
            noResMte: 'Nenhum MTE com este nome, em nenhum lugar do mundo (passados incluídos).',
            noResDiscuss: 'Nenhum tópico do fórum para esta busca.',
            noResEditor: 'Nenhum editor na tela nem no fórum com um nome que comece assim.',
            noResGoogle: 'O Google não sugere nada para esta busca.',
            srcOff: 'Esta fonte está desativada na aba Scripts.',
            srOpen: 'expandida',
            srClosed: 'recolhida',
            oWest: '“O” lido como Oeste',
            oEast: '“O” lido como Leste (Ost, Oost)',
            waitObj: 'Aguardando o WME carregar o objeto…',
            arrivedNoSel: 'Chegou, mas não foi possível selecionar o objeto: excluído, ou não carregado aqui.',
            approxPlace: 'Posição aproximada: o centro da sua cidade.',
            srcBusy: 'Pesquisando…',
            srcDown: l => 'Indisponível: ' + l + '. Podem faltar resultados.',
            urCapped: n => 'Mais de ' + n + ' URs por perto: a lista foi cortada, aproxime o zoom para ver todas.',
            otherServer: e => 'Permalink do servidor ' + e,
            otherServerSub: 'Seus objetos não estão neste mapa: ele abre em uma nova aba.',
            linkUnknown: 'Link não reconhecido',
            linkUnknownSub: 'Não foi possível ler nenhuma posição nem objeto neste endereço.',
            locateErr: c => 'Histórico indisponível' + (c ? ' (' + c + ')' : '') + ': Enter para tentar de novo.',
            mteClosuresErr: c => 'Não foi possível ler os bloqueios deste MTE' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'O Waze está limitando as requisições: leitura interrompida, faltam ' + n + ' objetos. Tente de novo em instantes.',
            histPartial: n => n + ' históricos não puderam ser lidos: não são contados.',
            inView: 'na tela',
            winMove: 'Arraste para mover · clique duplo para recolocar',
            winClose: 'Fechar (Esc)',
            edToggle: 'Mostrar ou ocultar o que ele mexeu',
            edProfile: 'Abrir o perfil do editor',
            edNothing: 'Nada mexido na tela',
            secSeg: 'Segmentos',
            secVenue: 'Lugares',
            secClosure: 'Bloqueios',
            secHazard: 'Zonas',
            secJunction: 'Cruzamentos complexos',
            secComment: 'Comentários de mapa',
            secMte: 'Eventos de trânsito (MTE)',
            subCreated: 'Criados',
            subUpdated: 'Alterados por último por ele',
            subBefore: 'Alterados antes',
            whenCreated: d => 'criado em ' + d,
            whenChanged: d => 'alterado em ' + d,
            histBtn: n => 'Buscar também alterações antigas no histórico (' + n + ' objetos na tela)',
            histSub: 'Uma ou duas requisições por objeto ao histórico do Waze, seis de cada vez; de alguns segundos a um minuto',
            histRun: (k, n) => 'Lendo o histórico… ' + k + '/' + n,
            noName: 'Sem nome',
            kClosure: 'Bloqueio',
            kJunction: 'Cruzamento complexo',
            kMte: 'Evento de trânsito',
            locating: 'Localizando pelo histórico…',
            located: v => 'Localizado perto de ' + v + ' — Enter para ir',
            notLocated: 'O histórico não dá nenhuma posição: Enter busca ao redor da tela',
            hEdT: 'Editores',
            hEdB: '<p>Digite um nome (ou <b>@</b> sozinho para todos da tela). Em <b>Tudo</b>, Enter abre o editor na aba <b>Editores</b>.</p><p>Lá, tudo o que ele mexeu na tela é organizado por tipo (segmentos, lugares, bloqueios, zonas, cruzamentos complexos, comentários, MTE) e por papel: <b>criados</b>, <b>alterados por último por ele</b> e, depois de ler o histórico, <b>alterados antes</b>. Um clique seleciona o objeto e aproxima o zoom; a janela continua aberta.</p><p>O nome abre o perfil; ▸ ou → expande.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Tópicos do Discuss',
            optDiscussHint: 'Os tópicos do fórum do Waze, no mesmo site do WME, a partir de 3 caracteres. O que você digita é enviado à busca do fórum. Em “Tudo”, também controla a busca de nomes de editores no fórum.',
            discussPosts: n => n === 1 ? '1 mensagem' : n + ' mensagens',
            hnNoStreet: q => 'Nenhuma rua carregada corresponde a “' + q + '”.',
            hnNone: v => v + ' não tem nenhum número no Waze.',
            hnNoNumber: (n, v) => 'Nenhum número ' + n + ' em ' + v + ' no Waze.',
            hnNumberNowhere: n => 'Nenhum número ' + n + ' nas ruas carregadas.',
            optClose: 'Fechar a janela após uma escolha',
            optCloseHint: 'Desativado: ela fica aberta para passar de um resultado a outro, e um clique no mapa a mantém. Esc ou × a fecham.',
            fClosure: 'Bloqueios',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Mapa',
            gClosure: 'Bloqueios',
            gMte: 'Eventos de trânsito (MTE)',
            gUR: 'Solicitações de atualização (UR)',
            gRda: 'Zonas de circulação restrita',
            gNote: 'Comentários de mapa',
            gIga: 'Orientação de conversões',
            stActive: 'Ativo',
            stPlanned: 'Programado',
            mteNoShape: 'nas redondezas, sem traçado',
            mteNoPlace: 'Este MTE não tem traçado nem bloqueios: não é possível localizá-lo.',
            stOver: 'Encerrado',
            stFinished: 'Encerrado',
            urOpen: 'Aberta',
            urClosed: 'Fechada',
            kRda: 'Zona restrita',
            urComments: n => n === 1 ? '1 comentário' : n + ' comentários',
            urTypes: { 6: 'Conversão incorreta', 7: 'Endereço incorreto', 8: 'Rota incorreta', 9: 'Rotatória ausente', 10: 'Erro geral', 11: 'Conversão proibida', 12: 'Cruzamento incorreto', 13: 'Ponte ou viaduto ausente', 14: 'Sentido de circulação incorreto', 15: 'Saída ausente', 16: 'Via ausente', 18: 'Local ausente', 19: 'Via bloqueada', 21: 'Nome de rua ausente', 22: 'Prefixo ou sufixo de rua incorreto', 23: 'Limite de velocidade ausente ou incorreto' },
            hzTypes: { SCHOOL_ZONE: 'Zona escolar', SPEED_BUMP: 'Lombada', CAMERA: 'Radar', TRAFFIC_LIGHT: 'Semáforo', RAILROAD_CROSSING: 'Passagem de nível', TOLL_BOOTH: 'Pedágio', TOPES: 'Topes', DANGEROUS_CURVE: 'Curva perigosa', DANGEROUS_INTERSECTION: 'Cruzamento perigoso', DANGEROUS_MERGE: 'Convergência perigosa', SIGN: 'Placa', LANE_ENDING: 'Fim de faixa', RAISED_CROSSWALK: 'Faixa de pedestres elevada', HIGHWAY_CROSSWALK: 'Faixa de pedestres em via expressa', SHOULDER_ENDING: 'Fim do acostamento', NARROW_BRIDGE: 'Ponte estreita' },
            mteCats: { SPORTING_EVENT: 'Evento esportivo', CONCERT: 'Show', FESTIVAL: 'Festival', PARADE: 'Desfile', CONFERENCE: 'Conferência', 'CONSTRUCTION': 'Obras', 'CRISIS': 'Crise', 'DEMONSTRATION': 'Manifestação', 'DRIVING_ADVISORY': 'Aviso de direção', 'HOLIDAY/FESTIVAL': 'Feriado ou festival', 'OTHER': 'Outro', 'PARTNER_USER_COMMS': 'Comunicação de parceiro', 'SUMMIT': 'Cúpula', 'UNPLANNED_DISRUPTION': 'Interrupção imprevista' },
            clearRecents: 'Limpar',
        },
        'pt-PT': {
            sbHint: 'Pesquisar tudo num só campo: ruas, números de porta, locais, cidades, editores, IDs, permalinks, coordenadas, ligações de outros mapas e locais Google.',
            sbKeys: 'Abrir a pesquisa',
            sbOpts: 'Opções',
            optGoogle: 'Locais Google',
            optGoogleHint: 'Sugestões da Google, através da biblioteca que o WME já carrega. O que escreve é enviado à Google.',
            optSlash: 'Abrir com /',
            optSlashHint: 'A tecla / abre a pesquisa quando não está a escrever num campo.',
            optBtn: 'Botão ao lado da pesquisa do WME',
            sbHelp: 'Ajuda',
            hTypeT: 'O que se pode escrever',
            hTypeB: '<table class="wos-help-table"><tr><td>Rua Augusta</td><td>Uma rua, um local, uma cidade: palavras por qualquer ordem, acentos facultativos, <i>av</i> = <i>avenida</i>…</td></tr><tr><td>12 rua augusta</td><td>Um número de porta numa rua carregada.</td></tr><tr><td>62324199</td><td>Um ID de segmento, nó, zona, zona restrita ou comentário de mapa; vários segmentos separados por vírgulas.</td></tr><tr><td>123.456.789</td><td>Um ID de local.</td></tr><tr><td>@utilizador</td><td>Um editor e tudo o que tocou no ecrã.</td></tr><tr><td>43.6107, 3.8767</td><td>Coordenadas: decimais, GMS (43°36\'38"N), Lambert 93 ou Plus Code.</td></tr><tr><td>https://…</td><td>Um permalink do WME, ou uma ligação do Google Maps, OSM, Apple, Bing, Mapillary, Géoportail, Live Map.</td></tr><tr><td>552\u00a0100\u00a0554</td><td>Um SIREN ou SIRET (empresas francesas), em qualquer lado.</td></tr><tr><td>g: padaria</td><td>Só locais Google.</td></tr><tr><td>d: cortes</td><td>Só tópicos do Discuss.</td></tr><tr><td>obras</td><td>Cortes num raio de cerca de {N}\u00a0km, pedidos de atualização à volta do mapa, MTE pelo nome em qualquer sítio (passados incluídos); zonas e radares, zonas restritas, comentários de mapa e orientação de viragens no ecrã.</td></tr></table>',
            hKeysT: 'Teclado',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>Percorrer os resultados; o mapa mostra o atual.</td></tr><tr><td><kbd>Enter</kbd></td><td>Ir até lá e selecionar.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Enter</kbd></td><td>Copiar o permalink.</td></tr><tr><td><kbd>Shift</kbd> <kbd>Enter</kbd></td><td>Abrir num novo separador.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Enter</kbd></td><td>Abrir a ficha no Google Maps de um local do Waze associado ao Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>Filtro seguinte (ruas, locais…).</td></tr><tr><td><kbd>Esc</kbd></td><td>Fechar.</td></tr></table>',
            hSrcT: 'De onde vêm os resultados',
            hSrcB: '<p>Ruas, números, locais e cidades vêm do que o WME <b>carregou</b>: a área no ecrã e um pouco à volta. Mova o mapa ou afaste o zoom para pesquisar mais longe. Os locais do Waze também são encontrados pelo nome em qualquer lado, através do próprio serviço de pesquisa do WME (mesmo site, o seu próprio acesso).</p><p>O Waze não dá a um script um objeto por ID, mas dá o seu <b>histórico</b>, que muitas vezes traz uma posição: um ID de segmento, nó ou local ausente é assim localizado em qualquer sítio e depois encontrado exatamente no mapa à volta desse ponto. Sem pista, a pesquisa é feita à volta do ecrã.</p><p>Os locais Google vêm da biblioteca Google que o WME já carrega. Em França, se a opção estiver ativa, o que escreve e a posição do mapa (com precisão de 1 km) vão para a API estatal «Recherche d’entreprises». Uma vez por dia, o script consulta no GreasyFork a versão publicada; ao arrancar, lê a versão mínima no GitHub.</p><p>Os tópicos do Discuss vêm do fórum do Waze, no mesmo site do WME, com os seus próprios acessos.</p>',
            hSafeB: 'O script nunca altera o mapa: move a vista, seleciona e, se necessário, ativa a camada do objeto escolhido; nada mais.',
            btnTip: 'Pesquisar tudo',
            phInput: 'Ruas, locais, números, IDs, ligações, coordenadas…',
            ariaDialog: 'Pesquisar tudo',
            ariaList: 'Resultados',
            fAll: 'Tudo',
            fStreet: 'Ruas',
            fAddress: 'Números',
            fVenue: 'Locais',
            fCity: 'Cidades',
            fEditor: 'Editores',
            fGoogle: 'Google',
            gDirect: 'Ir para',
            gStreet: 'Ruas',
            gAddress: 'Números de porta',
            gVenue: 'Locais Waze',
            gCity: 'Cidades',
            gHazard: 'Zonas e radares',
            gEditor: 'Editores',
            gGoogle: 'Locais Google',
            gRecent: 'Recentes',
            kSeg: 'Segmento',
            kSegs: n => n + ' segmentos',
            kNode: 'Nó',
            kVenue: 'Local',
            kComment: 'Comentário de mapa',
            kHazard: 'Zona',
            kPermalink: 'Permalink do WME',
            kLink: s => 'Ligação · ' + s,
            kCoords: 'Coordenadas',
            kSwap: 'Coordenadas, lidas longitude e depois latitude',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'Pedido de atualização',
            nSeg: n => n === 1 ? '1 segmento' : n + ' segmentos',
            noCity: 'Sem cidade',
            altName: 'nome alternativo',
            alias: a => 'também: ' + a,
            residential: 'Residencial',
            widen: id => 'ID ' + id + ' — fora da área carregada',
            widening: (k, n) => 'A pesquisar à volta… ' + k + '/' + n,
            notFound: id => 'ID ' + id + ' não encontrado: o histórico não dá nenhuma posição e não está à volta do ecrã.',
            shortLink: 'Ligação curta',
            shortLinkSub: 'Abra-a no navegador e cole aqui o endereço completo.',
            moreN: n => 'mais ' + n,
            emptyTitle: 'Escreva ou cole qualquer coisa',
            emptyHint: 'Uma rua, um local, um ID, um permalink, coordenadas, uma ligação do Google Maps…',
            noRes: q => 'Nada para «' + q + '».',
            noResHint: 'Ruas e números só são pesquisados à volta do mapa: mova-o, afaste um pouco o zoom ou ative os locais Google.',
            nRes: n => n === 0 ? 'Nenhum resultado' : n === 1 ? '1 resultado' : n + ' resultados',
            hintNav: 'percorrer',
            hintGo: 'ir',
            hintCopy: 'copiar permalink',
            hintTab: 'novo separador',
            hintFilter: 'filtrar',
            hintClose: 'fechar',
            copied: 'Permalink copiado',
            copyFail: 'Não foi possível copiar o permalink',
            googleErr: 'A Google não respondeu.',
            gCompany: 'Empresas (França)',
            optCompanies: 'Empresas francesas',
            optCompaniesHint: 'Só em França: a API estatal «Recherche d’entreprises» (dados Sirene), no departamento do mapa; um SIRET ou SIREN encontra-se em qualquer lado. O que escreve e a posição do mapa (com precisão de 1 km) são-lhe enviados.',
            gmapOpen: 'Abrir a ficha no Google Maps (Alt+Enter)',
            gmapNone: 'Este resultado não está associado a um local do Google.',
            gmapUnknown: 'Associação ao Google desconhecida enquanto o local não estiver carregado: Enter para lá ir, depois Alt+Enter.',
            venueCapped: 'A pesquisa do Waze devolve no máximo 10 locais e nenhum contém todas as palavras: acrescente a cidade ou mova o mapa.',
            srcVenueFar: 'Locais Waze fora do ecrã',
            srcTimeout: 'sem resposta',
            srArrived: 'Pronto: objeto selecionado.',
            urNoComments: 'Não foi possível ler as conversas dos URs: uma pesquisa no seu texto pode falhar algumas.',
            coNoDept: 'Empresas: departamento do mapa não encontrado aqui (litoral, lagoa…): mova um pouco o mapa.',
            coClosed: 'encerrado',
            edNoObj: 'Nada dele no ecrã · abre o perfil',
            edTryProfile: 'Abrir o perfil com exatamente este nome',
            hEdAll: 'Editores sem nada no ecrã também são encontrados (as contas do fórum do Waze): pelo início do nome após @ ou no filtro Editores, pelo nome exato em «Tudo». O nome abre o perfil.',
            lnkDiscuss: 'Tópico no Discuss',
            majBtn: v => 'A versão ' + v + ' está disponível',
            majInstall: 'Instalar',
            widenErr: c => 'A pesquisa à volta falhou (' + c + '): Enter para tentar novamente.',
            widenBudget: q => q + ': não encontrado nos primeiros 15 MB à volta do mapa. Aproxime-se e tente novamente.',
            noResAny: q => 'Nada para «' + q + '».',
            approxShort: 'posição aproximada',
            noResMove: 'Ruas e números só são pesquisados à volta do mapa: mova-o ou afaste um pouco o zoom.',
            noResMte: 'Nenhum MTE com este nome, em parte nenhuma do mundo (passados incluídos).',
            noResDiscuss: 'Nenhum tópico do fórum para esta pesquisa.',
            noResEditor: 'Nenhum editor no ecrã nem no fórum com um nome que comece assim.',
            noResGoogle: 'A Google não sugere nada para esta pesquisa.',
            srcOff: 'Esta fonte está desativada no separador Scripts.',
            srOpen: 'expandida',
            srClosed: 'recolhida',
            oWest: '«O» lido como Oeste',
            oEast: '«O» lido como Este (Ost, Oost)',
            waitObj: 'A aguardar que o WME carregue o objeto…',
            arrivedNoSel: 'Chegou, mas não foi possível selecionar o objeto: eliminado, ou não carregado aqui.',
            approxPlace: 'Posição aproximada: o centro da sua localidade.',
            srcBusy: 'A pesquisar…',
            srcDown: l => 'Indisponível: ' + l + '. Podem faltar resultados.',
            urCapped: n => 'Mais de ' + n + ' URs nas redondezas: a lista foi cortada, aproxime o zoom para as ver todas.',
            otherServer: e => 'Ligação permanente do servidor ' + e,
            otherServerSub: 'Os seus objetos não estão neste mapa: abre num novo separador.',
            linkUnknown: 'Ligação não reconhecida',
            linkUnknownSub: 'Não foi possível ler nenhuma posição nem objeto neste endereço.',
            locateErr: c => 'Histórico indisponível' + (c ? ' (' + c + ')' : '') + ': Enter para tentar novamente.',
            mteClosuresErr: c => 'Não foi possível ler os cortes deste MTE' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'O Waze está a limitar os pedidos: leitura interrompida, faltam ' + n + ' objetos. Tente novamente daqui a pouco.',
            histPartial: n => n + ' históricos não puderam ser lidos: não são contados.',
            inView: 'no ecrã',
            winMove: 'Arraste para mover · duplo clique para recolocar',
            winClose: 'Fechar (Esc)',
            edToggle: 'Mostrar ou ocultar o que ele tocou',
            edProfile: 'Abrir o perfil do editor',
            edNothing: 'Nada tocado no ecrã',
            secSeg: 'Segmentos',
            secVenue: 'Locais',
            secClosure: 'Cortes de estrada',
            secHazard: 'Zonas',
            secJunction: 'Cruzamentos complexos',
            secComment: 'Comentários de mapa',
            secMte: 'Eventos de trânsito (MTE)',
            subCreated: 'Criados',
            subUpdated: 'Alterados por último por ele',
            subBefore: 'Alterados antes',
            whenCreated: d => 'criado em ' + d,
            whenChanged: d => 'alterado em ' + d,
            histBtn: n => 'Pesquisar também alterações antigas no histórico (' + n + ' objetos no ecrã)',
            histSub: 'Um ou dois pedidos por objeto ao histórico do Waze, seis de cada vez; de alguns segundos a um minuto',
            histRun: (k, n) => 'A ler o histórico… ' + k + '/' + n,
            noName: 'Sem nome',
            kClosure: 'Corte de estrada',
            kJunction: 'Cruzamento complexo',
            kMte: 'Evento de trânsito',
            locating: 'A localizar pelo histórico…',
            located: v => 'Localizado perto de ' + v + ' — Enter para ir',
            notLocated: 'O histórico não dá nenhuma posição: Enter pesquisa à volta do ecrã',
            hEdT: 'Editores',
            hEdB: '<p>Escreva um nome (ou <b>@</b> sozinho para todos os do ecrã). Em <b>Tudo</b>, Enter abre o editor no separador <b>Editores</b>.</p><p>Aí, tudo o que tocou no ecrã está arrumado por tipo (segmentos, locais, cortes, zonas, cruzamentos complexos, comentários, MTE) e por papel: <b>criados</b>, <b>alterados por último por ele</b> e, depois de ler o histórico, <b>alterados antes</b>. Um clique seleciona o objeto e aproxima; a janela continua aberta.</p><p>O nome abre o perfil; ▸ ou → expande.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'Tópicos do Discuss',
            optDiscussHint: 'Os tópicos do fórum do Waze, no mesmo site do WME, a partir de 3 caracteres. O que escreve é enviado à pesquisa do fórum. Em «Tudo», também controla a pesquisa de nomes de editores no fórum.',
            discussPosts: n => n === 1 ? '1 mensagem' : n + ' mensagens',
            hnNoStreet: q => 'Nenhuma rua carregada corresponde a «' + q + '».',
            hnNone: v => v + ' não tem nenhum número de porta no Waze.',
            hnNoNumber: (n, v) => 'Nenhum número ' + n + ' em ' + v + ' no Waze.',
            hnNumberNowhere: n => 'Nenhum número ' + n + ' nas ruas carregadas.',
            optClose: 'Fechar a janela após uma escolha',
            optCloseHint: 'Desativado: fica aberta para passar de um resultado a outro, e um clique no mapa mantém-na. Esc ou × fecham-na.',
            fClosure: 'Cortes',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'Mapa',
            gClosure: 'Cortes de estrada',
            gMte: 'Eventos de trânsito (MTE)',
            gUR: 'Pedidos de atualização (UR)',
            gRda: 'Zonas de circulação restrita',
            gNote: 'Comentários de mapa',
            gIga: 'Orientação de viragens',
            stActive: 'Ativo',
            stPlanned: 'Programado',
            mteNoShape: 'nas imediações, sem traçado',
            mteNoPlace: 'Este MTE não tem traçado nem cortes: não é possível localizá-lo.',
            stOver: 'Terminado',
            stFinished: 'Terminado',
            urOpen: 'Aberto',
            urClosed: 'Fechado',
            kRda: 'Zona restrita',
            urComments: n => n === 1 ? '1 comentário' : n + ' comentários',
            urTypes: { 6: 'Viragem incorreta', 7: 'Morada incorreta', 8: 'Percurso incorreto', 9: 'Rotunda em falta', 10: 'Erro geral', 11: 'Viragem proibida', 12: 'Cruzamento incorreto', 13: 'Ponte ou viaduto em falta', 14: 'Sentido de circulação incorreto', 15: 'Saída em falta', 16: 'Estrada em falta', 18: 'Local em falta', 19: 'Estrada bloqueada', 21: 'Nome de rua em falta', 22: 'Prefixo ou sufixo de rua incorreto', 23: 'Limite de velocidade em falta ou incorreto' },
            hzTypes: { SCHOOL_ZONE: 'Zona escolar', SPEED_BUMP: 'Lomba', CAMERA: 'Radar', TRAFFIC_LIGHT: 'Semáforo', RAILROAD_CROSSING: 'Passagem de nível', TOLL_BOOTH: 'Portagem', TOPES: 'Topes', DANGEROUS_CURVE: 'Curva perigosa', DANGEROUS_INTERSECTION: 'Cruzamento perigoso', DANGEROUS_MERGE: 'Convergência perigosa', SIGN: 'Sinal', LANE_ENDING: 'Fim de via', RAISED_CROSSWALK: 'Passadeira elevada', HIGHWAY_CROSSWALK: 'Passadeira em via rápida', SHOULDER_ENDING: 'Fim da berma', NARROW_BRIDGE: 'Ponte estreita' },
            mteCats: { SPORTING_EVENT: 'Evento desportivo', CONCERT: 'Concerto', FESTIVAL: 'Festival', PARADE: 'Desfile', CONFERENCE: 'Conferência', 'CONSTRUCTION': 'Obras', 'CRISIS': 'Crise', 'DEMONSTRATION': 'Manifestação', 'DRIVING_ADVISORY': 'Aviso de condução', 'HOLIDAY/FESTIVAL': 'Feriado ou festival', 'OTHER': 'Outro', 'PARTNER_USER_COMMS': 'Comunicação de parceiro', 'SUMMIT': 'Cimeira', 'UNPLANNED_DISRUPTION': 'Perturbação imprevista' },
            clearRecents: 'Limpar',
        },
        he: {
            sbHint: 'חיפוש של הכול משדה אחד: רחובות, מספרי בתים, מקומות, ערים, עורכים, מזהים, קישורים קבועים, קואורדינטות, קישורים ממפות אחרות ומקומות Google.',
            sbKeys: 'פתיחת החיפוש',
            sbOpts: 'אפשרויות',
            optGoogle: 'מקומות Google',
            optGoogleHint: 'הצעות מ-Google, דרך הספרייה ש-WME כבר טוען. הטקסט שמוקלד נשלח ל-Google.',
            optSlash: 'פתיחה עם /',
            optSlashHint: 'המקש / פותח את החיפוש כשאינכם מקלידים בשדה.',
            optBtn: 'כפתור ליד החיפוש של WME',
            sbHelp: 'עזרה',
            hTypeT: 'מה אפשר להקליד',
            hTypeB: '<table class="wos-help-table"><tr><td>הרצל</td><td>רחוב, מקום, עיר: מילים בכל סדר.</td></tr><tr><td>12 הרצל</td><td>מספר בית ברחוב טעון.</td></tr><tr><td>62324199</td><td>מזהה של מקטע, צומת, אזור, אזור מוגבל או הערת מפה; כמה מקטעים מופרדים בפסיקים.</td></tr><tr><td>123.456.789</td><td>מזהה מקום.</td></tr><tr><td>@<bdi>user</bdi></td><td>עורך וכל מה שנגע בו על המסך.</td></tr><tr><td><bdi>32.08, 34.78</bdi></td><td>קואורדינטות: עשרוניות, מעלות-דקות-שניות או Plus Code.</td></tr><tr><td><bdi>https://…</bdi></td><td>קישור קבוע של WME, או קישור מ-Google Maps,&nbsp;OSM,&nbsp;Apple,&nbsp;Bing,&nbsp;Mapillary,&nbsp;Live Map.</td></tr><tr><td><bdi>552\u00a0100\u00a0554</bdi></td><td>מספר SIREN או SIRET (חברות צרפתיות), בכל מקום.</td></tr><tr><td><bdi>g:</bdi> מאפייה</td><td>מקומות Google בלבד.</td></tr><tr><td><bdi>d:</bdi> חסימות</td><td>נושאי Discuss בלבד.</td></tr><tr><td>עבודות</td><td>חסימות ברדיוס של כ-{N}\u00a0ק״מ, בקשות עדכון סביב המפה, MTE לפי שם בכל מקום (כולל עבר); אזורים ומצלמות, אזורים מוגבלים, הערות מפה והנחיות פנייה על המסך.</td></tr></table>',
            hKeysT: 'מקלדת',
            hKeysB: '<table class="wos-help-table"><tr><td><kbd>↑</kbd> <kbd>↓</kbd></td><td>מעבר בין התוצאות; המפה מראה את הנוכחית.</td></tr><tr><td><kbd>Enter</kbd></td><td>מעבר אליה ובחירתה.</td></tr><tr><td><kbd>Ctrl</kbd> <kbd>Enter</kbd></td><td>העתקת הקישור הקבוע.</td></tr><tr><td><kbd>Shift</kbd> <kbd>Enter</kbd></td><td>פתיחה בכרטיסייה חדשה.</td></tr><tr><td><kbd>Alt</kbd> <kbd>Enter</kbd></td><td>פתיחת המקום ב-Google Maps של מקום Waze המקושר ל-Google.</td></tr><tr><td><kbd>Tab</kbd></td><td>המסנן הבא (רחובות, מקומות…).</td></tr><tr><td><kbd>Esc</kbd></td><td>סגירה.</td></tr></table>',
            hSrcT: 'מאיפה מגיעות התוצאות',
            hSrcB: '<p>רחובות, מספרים, מקומות וערים מגיעים ממה ש-WME <b>טען</b>: האזור שעל המסך ומעט סביבו. הזיזו את המפה או הקטינו את הזום כדי לחפש רחוק יותר. מקומות של Waze נמצאים גם לפי שמם בכל מקום, דרך שירות החיפוש של WME עצמו (אותו אתר, הגישה שלכם).</p><p>Waze אינו נותן לסקריפט אובייקט לפי מזהה, אבל נותן את <b>ההיסטוריה</b> שלו, שלעתים קרובות כוללת מיקום: מזהה חסר של מקטע, צומת או מקום מאותר כך בכל מקום, ואז נמצא במדויק במפה סביב הנקודה. ללא רמז, החיפוש נעשה סביב המסך.</p><p>מקומות Google מגיעים מספריית Google ש-WME כבר טוען. בצרפת, אם האפשרות מופעלת, הטקסט שמוקלד ומיקום המפה (בדיוק של 1 ק"מ) נשלחים ל-API הממשלתי Recherche d’entreprises. פעם ביום הסקריפט בודק ב-GreasyFork את הגרסה שפורסמה; בעת ההפעלה הוא קורא ב-GitHub את הגרסה המינימלית.</p><p>נושאי Discuss מגיעים מהפורום של Waze, באותו אתר כמו WME, עם ההרשאות שלכם.</p>',
            hSafeB: 'הסקריפט לעולם אינו משנה את המפה: הוא מזיז את התצוגה, בוחר, ובמידת הצורך מפעיל את השכבה של האובייקט שנבחר; לא יותר.',
            btnTip: 'חיפוש של הכול',
            phInput: 'רחובות, מקומות, מספרים, מזהים, קישורים, קואורדינטות…',
            ariaDialog: 'חיפוש של הכול',
            ariaList: 'תוצאות',
            fAll: 'הכול',
            fStreet: 'רחובות',
            fAddress: 'מספרים',
            fVenue: 'מקומות',
            fCity: 'ערים',
            fEditor: 'עורכים',
            fGoogle: 'Google',
            gDirect: 'מעבר אל',
            gStreet: 'רחובות',
            gAddress: 'מספרי בתים',
            gVenue: 'מקומות Waze',
            gCity: 'ערים',
            gHazard: 'אזורים ומצלמות',
            gEditor: 'עורכים',
            gGoogle: 'מקומות Google',
            gRecent: 'אחרונים',
            kSeg: 'מקטע',
            kSegs: n => n + ' מקטעים',
            kNode: 'צומת',
            kVenue: 'מקום',
            kComment: 'הערת מפה',
            kHazard: 'אזור',
            kPermalink: 'קישור קבוע של WME',
            kLink: s => 'קישור · ' + s,
            kCoords: 'קואורדינטות',
            kSwap: 'קואורדינטות, נקראות קו אורך ואז קו רוחב',
            kPlus: 'Plus Code',
            kLambert: 'Lambert 93',
            kUR: 'בקשת עדכון',
            nSeg: n => n === 1 ? 'מקטע אחד' : n + ' מקטעים',
            noCity: 'ללא עיר',
            altName: 'שם חלופי',
            alias: a => 'גם: ' + a,
            residential: 'מגורים',
            widen: id => 'מזהה ' + id + ' — מחוץ לאזור הטעון',
            widening: (k, n) => 'מחפש בסביבה… ' + k + '/' + n,
            notFound: id => 'המזהה ' + id + ' לא נמצא: ההיסטוריה אינה נותנת מיקום והוא אינו סביב המסך.',
            shortLink: 'קישור מקוצר',
            shortLinkSub: 'פתחו אותו בדפדפן והדביקו כאן את הכתובת המלאה.',
            moreN: n => 'עוד ' + n,
            emptyTitle: 'הקלידו או הדביקו כל דבר',
            emptyHint: 'רחוב, מקום, מזהה, קישור קבוע, קואורדינטות, קישור Google Maps…',
            noRes: q => 'אין תוצאות עבור "' + q + '".',
            noResHint: 'רחובות ומספרי בתים נחפשים רק סביב המפה: הזיזו אותה, הקטינו מעט את הזום או הפעילו את מקומות Google.',
            nRes: n => n === 0 ? 'אין תוצאות' : n === 1 ? 'תוצאה אחת' : n + ' תוצאות',
            hintNav: 'מעבר',
            hintGo: 'מעבר אל',
            hintCopy: 'העתקת קישור',
            hintTab: 'כרטיסייה חדשה',
            hintFilter: 'סינון',
            hintClose: 'סגירה',
            copied: 'הקישור הקבוע הועתק',
            copyFail: 'לא ניתן להעתיק את הקישור הקבוע',
            googleErr: 'Google לא ענה.',
            gCompany: 'חברות (צרפת)',
            optCompanies: 'חברות צרפתיות',
            optCompaniesHint: 'בצרפת בלבד: ה-API הממשלתי Recherche d’entreprises (נתוני Sirene), במחוז של המפה; מספר SIRET או SIREN נמצא בכל מקום. הטקסט שמוקלד ומיקום המפה (בדיוק של 1 ק"מ) נשלחים אליו.',
            gmapOpen: 'פתיחת המקום ב-Google Maps ‏(Alt+Enter)',
            gmapNone: 'תוצאה זו אינה מקושרת למקום של Google.',
            gmapUnknown: 'הקישור ל-Google אינו ידוע עד שהמקום נטען: Enter כדי לעבור אליו, ואז Alt+Enter.',
            venueCapped: 'החיפוש של Waze מחזיר 10 מקומות לכל היותר, ואף אחד מהם אינו מכיל את כל המילים: הוסיפו את העיר או הזיזו את המפה.',
            srcVenueFar: 'מקומות Waze מחוץ למסך',
            srcTimeout: 'אין תגובה',
            srArrived: 'הגעתם: האובייקט נבחר.',
            urNoComments: 'לא ניתן היה לקרוא את השיחות של בקשות העדכון: חיפוש בטקסט שלהן עלול לפספס חלק.',
            coNoDept: 'חברות: המחוז של המפה לא נמצא כאן (חוף, אגם…): הזיזו מעט את המפה.',
            coClosed: 'סגור',
            edNoObj: 'אין לו דבר על המסך · פותח את הפרופיל',
            edTryProfile: 'פתיחת הפרופיל בשם המדויק הזה',
            hEdAll: 'נמצאים גם עורכים שאין להם דבר על המסך (חשבונות הפורום של Waze): לפי תחילת השם אחרי @ או במסנן העורכים, לפי השם המדויק ב-"הכול". השם פותח את הפרופיל.',
            lnkDiscuss: 'שרשור ב-Discuss',
            majBtn: v => 'גרסה ' + v + ' זמינה',
            majInstall: 'התקנה',
            widenErr: c => 'החיפוש בסביבה נכשל (' + c + '): Enter כדי לנסות שוב.',
            widenBudget: q => q + ': לא נמצא ב-15 ה-MB הראשונים סביב המפה. התקרבו ונסו שוב.',
            noResAny: q => 'אין תוצאות עבור "' + q + '".',
            approxShort: 'מיקום משוער',
            noResMove: 'רחובות ומספרי בתים נחפשים רק סביב המפה: הזיזו אותה או הקטינו מעט את הזום.',
            noResMte: 'אין MTE בשם הזה, בשום מקום בעולם (כולל עבר).',
            noResDiscuss: 'אין נושא בפורום לחיפוש הזה.',
            noResEditor: 'אין עורך על המסך, וגם לא בפורום ששמו מתחיל כך.',
            noResGoogle: 'Google אינו מציע דבר לחיפוש הזה.',
            srcOff: 'מקור זה כבוי בלשונית הסקריפטים.',
            srOpen: 'מורחב',
            srClosed: 'מכווץ',
            oWest: '״O״ נקרא כמערב',
            oEast: '״O״ נקרא כמזרח (Ost, Oost)',
            waitObj: 'ממתין לטעינת האובייקט ב-WME…',
            arrivedNoSel: 'הגענו, אך לא ניתן היה לבחור את האובייקט: נמחק, או שלא נטען כאן.',
            approxPlace: 'מיקום משוער: מרכז העיר שלו.',
            srcBusy: 'מחפש…',
            srcDown: l => 'לא זמין: ' + l + '. ייתכן שחסרות תוצאות.',
            urCapped: n => 'יותר מ-' + n + ' דיווחי UR בסביבה: הרשימה קטועה, יש להתקרב כדי לראות את כולם.',
            otherServer: e => 'קישור קבוע מהשרת ' + e,
            otherServerSub: 'האובייקטים שלו אינם במפה הזו: הוא ייפתח בלשונית חדשה.',
            linkUnknown: 'הקישור לא זוהה',
            linkUnknownSub: 'לא ניתן היה לקרוא מיקום או אובייקט מכתובת זו.',
            locateErr: c => 'ההיסטוריה אינה זמינה' + (c ? ' (' + c + ')' : '') + ': Enter כדי לנסות שוב.',
            mteClosuresErr: c => 'לא ניתן היה לקרוא את החסימות של MTE זה' + (c ? ' (' + c + ')' : '') + '.',
            histStopped: n => 'Waze מגביל את הבקשות: הקריאה נעצרה, נותרו ' + n + ' אובייקטים. נסו שוב בעוד רגע.',
            histPartial: n => n + ' היסטוריות לא נקראו: הן אינן נספרות.',
            inView: 'על המסך',
            winMove: 'גררו להזזה · לחיצה כפולה להחזרה למקום',
            winClose: 'סגירה (Esc)',
            edToggle: 'הצגה או הסתרה של מה שנגע בו',
            edProfile: 'פתיחת פרופיל העורך',
            edNothing: 'לא נגע בדבר על המסך',
            secSeg: 'מקטעים',
            secVenue: 'מקומות',
            secClosure: 'חסימות',
            secHazard: 'אזורים',
            secJunction: 'צמתים מורכבים',
            secComment: 'הערות מפה',
            secMte: 'אירועי תנועה (MTE)',
            subCreated: 'נוצרו',
            subUpdated: 'שונו לאחרונה על ידו',
            subBefore: 'שונו קודם',
            whenCreated: d => 'נוצר ב-' + d,
            whenChanged: d => 'שונה ב-' + d,
            histBtn: n => 'חיפוש גם שינויים ישנים בהיסטוריה (' + n + ' אובייקטים על המסך)',
            histSub: 'בקשה אחת או שתיים לכל אובייקט להיסטוריה של Waze, שש בכל פעם; מכמה שניות ועד דקה',
            histRun: (k, n) => 'קורא היסטוריה… ' + k + '/' + n,
            noName: 'ללא שם',
            kClosure: 'חסימה',
            kJunction: 'צומת מורכב',
            kMte: 'אירוע תנועה',
            locating: 'מאתר לפי ההיסטוריה…',
            located: v => 'אותר ליד ' + v + ' — Enter כדי לעבור לשם',
            notLocated: 'ההיסטוריה אינה נותנת מיקום: Enter מחפש סביב המסך',
            hEdT: 'עורכים',
            hEdB: '<p>הקלידו שם (או <b>@</b> לבד לכל מי שעל המסך). מתוך <b>הכול</b>, Enter פותח את העורך בלשונית <b>עורכים</b>.</p><p>שם, כל מה שנגע בו על המסך ממוין לפי סוג (מקטעים, מקומות, חסימות, אזורים, צמתים מורכבים, הערות, MTE) ולפי תפקיד: <b>נוצרו</b>, <b>שונו לאחרונה על ידו</b> ולאחר קריאת ההיסטוריה — <b>שונו קודם</b>. לחיצה בוחרת את האובייקט ומתקרבת אליו; החלון נשאר פתוח.</p><p>השם פותח את הפרופיל; ◂ או ← פורשים.</p>',
            fDiscuss: 'Discuss',
            gDiscuss: 'Discuss',
            optDiscuss: 'נושאים ב-Discuss',
            optDiscussHint: 'נושאים מהפורום של Waze, באותו אתר כמו WME, החל מ-3 תווים. הטקסט שמוקלד נשלח לחיפוש הפורום. ב-"הכול" היא שולטת גם בחיפוש שמות עורכים בפורום.',
            discussPosts: n => n === 1 ? 'הודעה אחת' : n + ' הודעות',
            hnNoStreet: q => 'אין רחוב טעון שמתאים ל-"' + q + '".',
            hnNone: v => 'ל-' + v + ' אין מספרי בתים ב-Waze.',
            hnNoNumber: (n, v) => 'אין מספר ' + n + ' ב-' + v + ' ב-Waze.',
            hnNumberNowhere: n => 'אין מספר ' + n + ' ברחובות הטעונים.',
            optClose: 'סגירת החלון אחרי בחירה',
            optCloseHint: 'כבוי: החלון נשאר פתוח כדי לעבור מתוצאה לתוצאה, ולחיצה על המפה משאירה אותו. Esc או × סוגרים אותו.',
            fClosure: 'חסימות',
            fMte: 'MTE',
            fUR: 'UR',
            fMap: 'מפה',
            gClosure: 'חסימות',
            gMte: 'אירועי תנועה (MTE)',
            gUR: 'בקשות עדכון (UR)',
            gRda: 'אזורי נהיגה מוגבלים',
            gNote: 'הערות מפה',
            gIga: 'הנחיות פנייה',
            stActive: 'פעילה',
            stPlanned: 'מתוכננת',
            mteNoShape: 'בסביבה, ללא מסלול',
            mteNoPlace: 'ל-MTE זה אין מסלול ואין חסימות: לא ניתן לאתר אותו.',
            stOver: 'הסתיים',
            stFinished: 'הסתיימה',
            urOpen: 'פתוחה',
            urClosed: 'סגורה',
            kRda: 'אזור מוגבל',
            urComments: n => n === 1 ? 'תגובה אחת' : n + ' תגובות',
            urTypes: { 6: 'פנייה שגויה', 7: 'כתובת שגויה', 8: 'מסלול שגוי', 9: 'כיכר חסרה', 10: 'שגיאה כללית', 11: 'פנייה אסורה', 12: 'צומת שגוי', 13: 'גשר או מעבר עילי חסר', 14: 'כיוון נסיעה שגוי', 15: 'יציאה חסרה', 16: 'כביש חסר', 18: 'מקום חסר', 19: 'כביש חסום', 21: 'שם רחוב חסר', 22: 'קידומת או סיומת רחוב שגויה', 23: 'מגבלת מהירות חסרה או שגויה' },
            hzTypes: { SCHOOL_ZONE: 'אזור בית ספר', SPEED_BUMP: 'פס האטה', CAMERA: 'מצלמת מהירות', TRAFFIC_LIGHT: 'רמזור', RAILROAD_CROSSING: 'מפגש מסילת ברזל', TOLL_BOOTH: 'תא אגרה', TOPES: 'Topes', DANGEROUS_CURVE: 'עיקול מסוכן', DANGEROUS_INTERSECTION: 'צומת מסוכן', DANGEROUS_MERGE: 'השתלבות מסוכנת', SIGN: 'תמרור', LANE_ENDING: 'סיום נתיב', RAISED_CROSSWALK: 'מעבר חציה מוגבה', HIGHWAY_CROSSWALK: 'מעבר חציה בכביש מהיר', SHOULDER_ENDING: 'סיום שוליים', NARROW_BRIDGE: 'גשר צר' },
            mteCats: { SPORTING_EVENT: 'אירוע ספורט', CONCERT: 'הופעה', FESTIVAL: 'פסטיבל', PARADE: 'מצעד', CONFERENCE: 'כנס', 'CONSTRUCTION': 'עבודות', 'CRISIS': 'משבר', 'DEMONSTRATION': 'הפגנה', 'DRIVING_ADVISORY': 'הנחיית נהיגה', 'HOLIDAY/FESTIVAL': 'חג או פסטיבל', 'OTHER': 'אחר', 'PARTNER_USER_COMMS': 'תקשורת שותפים', 'SUMMIT': 'פסגה', 'UNPLANNED_DISRUPTION': 'שיבוש בלתי צפוי' },
            clearRecents: 'ניקוי',
        },
    };

    // Seul « br » distingue le portugais brésilien ; d'anciens navigateurs rendent encore
    // « iw » pour l'hébreu.
    // La langue de WME, lue par le SDK (Settings.getLocale, mesuré : « fr ») ; à défaut celle de la page,
    // puis celle du navigateur. Seul « br » distingue le portugais brésilien ; « iw » est l'ancien code
    // de l'hébreu.
    const detectLang = code => {
        try {
            const l = String(code || document.documentElement.lang || navigator.language || 'en').toLowerCase();
            if (l.startsWith('pt')) return l.includes('br') ? 'pt-BR' : 'pt-PT';
            if (l.startsWith('he') || l.startsWith('iw')) return 'he';
            return ['fr', 'de', 'es', 'it', 'en'].find(c => l.startsWith(c)) || 'en';
        } catch (e) { return 'en'; }
    };
    let _lang = 'en';
    const t = (key, ...args) => {
        const v = (DICO[_lang] && DICO[_lang][key]) || DICO.en[key];
        if (typeof v === 'function') return v(...args);
        return v !== undefined ? v : key;
    };
    const estMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
    const toucheK = () => estMac ? '⌘K' : 'Ctrl K';

    function lireOpts() {
        try { return Object.assign({ google: true, discuss: true, entreprises: true, slash: true, bouton: true, fermer: false }, JSON.parse(localStorage.getItem(OPTS_KEY) || '{}')); }
        catch (e) { return { google: true, discuss: true, entreprises: true, slash: true, bouton: true, fermer: false }; }
    }
    function ecrireOpts() {
        try { localStorage.setItem(OPTS_KEY, JSON.stringify(opts)); } catch (e) { }
    }

    // =====================================================================
    //  Texte — normalisation et correspondance
    // =====================================================================

    // Minuscules, sans accents ni ponctuation : « Saint-Jean d'Angély » et « st jean d angely »
    // se comparent mot à mot. Les lettres que NFD ne décompose pas sont ramenées à leur écriture
    // sans clavier spécial (« hauptstrasse » trouve « Hauptstraße », audit n° 10) ; le guershayim
    // d'un sigle hébreu est recollé ; « p.za » et « v.le » restent un seul mot.
    const LETTRES = { 'ß': 'ss', 'æ': 'ae', 'ø': 'o', 'œ': 'oe', 'ł': 'l', 'đ': 'd', 'ı': 'i', 'þ': 'th' };
    const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05c7]/g, '')
        .toLowerCase().replace(/[ßæøœłđıþ]/g, c => LETTRES[c])
        .replace(/([\u05d0-\u05ea])["'״׳]+(?=[\u05d0-\u05ea])/g, '$1')
        .replace(/(^|[\s(])(p|v|c|l)\.(za|le|so|go|lo)(?=[\s.,;:)]|$)/g, '$1$2$3')
        .replace(/[’'`´"«»״׳\-_.,;:/()[\]]/g, ' ').replace(/\s+/g, ' ').trim();

    // Abréviations courantes des noms de voies, dans les langues du script : elles valent dans les
    // deux sens, une donnée qui écrit « St » répond à « street » comme à « saint », et une recherche
    // « bd » trouve « Boulevard ». Une abréviation peut avoir plusieurs développements (audit n° 9 :
    // « main street » ne trouvait pas « Main St », ni « avenida » « Av. »). Pas de clé « c » (calle) :
    // une lettre seule ferait correspondre trop de mots.
    const ABR = {
        st: ['saint', 'street', 'sankt'], ste: ['sainte'], sta: ['santa'], sto: ['santo'],
        av: ['avenue', 'avenida'], ave: ['avenue'], avda: ['avenida'], bd: ['boulevard'], bld: ['boulevard'], blvd: ['boulevard'],
        pl: ['place', 'platz'], r: ['rue', 'rua'], rte: ['route'], ch: ['chemin'], chem: ['chemin'], imp: ['impasse'], all: ['allee'], sq: ['square'],
        fg: ['faubourg'], fbg: ['faubourg'], crs: ['cours'], res: ['residence'], lot: ['lotissement'], pte: ['porte'], qu: ['quai'],
        gal: ['general'], gen: ['general'], mal: ['marechal'], pdt: ['president'], mgr: ['monseigneur'], dr: ['docteur', 'drive', 'doktor'],
        prof: ['professeur', 'professor'], rd: ['road'], ln: ['lane'], hwy: ['highway'], ct: ['court'], cir: ['circle'], pkwy: ['parkway'],
        expy: ['expressway'], fwy: ['freeway'], tpke: ['turnpike'], trl: ['trail'], mt: ['mount'], ft: ['fort'],
        str: ['strasse'], cl: ['calle'], pza: ['piazza', 'plaza'], v: ['via'], vle: ['viale'], cso: ['corso'], lgo: ['largo'], ple: ['piazzale'], vlo: ['vicolo'],
        tv: ['travessa', 'travesia'], trav: ['travessa', 'traverse'], pca: ['praca'], estr: ['estrada'], rod: ['rodovia'], jd: ['jardim'], al: ['alameda'],
    };
    const motsDe = s => {
        const mots = norm(s).split(' ').filter(Boolean);
        for (const m of mots.slice()) if (ABR[m]) mots.push(...ABR[m]);
        return mots;
    };

    // Une faute de frappe au plus (insertion, suppression, substitution, inversion).
    function uneFaute(a, b) {
        if (Math.abs(a.length - b.length) > 1) return false;
        let i = 0, j = 0, fautes = 0;
        while (i < a.length && j < b.length) {
            if (a[i] === b[j]) { i++; j++; continue; }
            if (++fautes > 1) return false;
            if (a[i + 1] === b[j] && a[i] === b[j + 1]) { i += 2; j += 2; continue; }
            if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
        }
        return fautes + (a.length - i) + (b.length - j) <= 1;
    }

    // Score d'une ligne pour des mots cherchés : TOUS les mots doivent se retrouver (début de mot,
    // abréviation, sous-chaîne, faute de frappe), dans n'importe quel ordre. Le mot exact pèse plus
    // que le début de mot, qui pèse plus que l'approximation : une correspondance évidente ne passe
    // jamais derrière une correspondance floue.
    function force(j, mots) {
        let m = 0;
        const alt = ABR[j] || [];
        for (const w of mots) {
            if (w === j || alt.includes(w)) return 3;
            if (w.startsWith(j) || alt.some(a => w.startsWith(a))) m = 2;
        }
        if (!m && j.length >= 3 && mots.some(w => w.includes(j))) m = 1;
        if (!m && j.length >= 5 && mots.some(w => uneFaute(j, w.slice(0, j.length)) || uneFaute(j, w))) m = 0.7;
        return m;
    }
    // contexte : des mots qui peuvent COMPLÉTER une recherche (la ville d'une voie) sans suffire à
    // eux seuls — sinon « montpellier » listerait toutes les voies de Montpellier.
    function score(jetons, mots, plein, requete, contexte) {
        let s = 0, dansNom = 0;
        for (const j of jetons) {
            const m = force(j, mots);
            if (m) { s += m; dansNom++; continue; }
            if (contexte && force(j, contexte) >= 2) { s += 1; continue; }
            return 0;
        }
        if (!dansNom) return 0;
        if (plein === requete) s += 6;
        else if (plein.startsWith(requete)) s += 3;
        return s - mots.length * 0.03;
    }

    // Les morceaux du libellé qui correspondent, en gras. La normalisation change la longueur
    // (un « é » décomposé), on la refait donc caractère par caractère en gardant l'indice d'origine.
    function surligner(libelle, jetons) {
        const brut = String(libelle || '');
        if (!jetons.length) return escHtml(brut);
        let n = '', idx = [];
        for (let i = 0; i < brut.length; i++) {
            const c = norm(brut[i]) || ' ';
            for (const x of c) { n += x; idx.push(i); }
        }
        const marque = new Array(brut.length).fill(false);
        const re = /[a-z0-9\u05d0-\u05ea]+/g;
        let m;
        while ((m = re.exec(n))) {
            const w = m[0];
            let long = 0;
            for (const x of jetons) {
                if (w.startsWith(x)) long = Math.max(long, x.length);
                for (const a of ABR[x] || []) if (w.startsWith(a)) long = Math.max(long, a.length);
            }
            if (!long) continue;
            long = Math.min(w.length, long);
            for (let k = m.index; k < m.index + long; k++) marque[idx[k]] = true;
        }
        let out = '', ouvert = false;
        for (let i = 0; i < brut.length; i++) {
            if (marque[i] && !ouvert) { out += '<mark>'; ouvert = true; }
            if (!marque[i] && ouvert) { out += '</mark>'; ouvert = false; }
            out += escHtml(brut[i]);
        }
        return out + (ouvert ? '</mark>' : '');
    }

    // =====================================================================
    //  Géométrie — GeoJSON Waze en WGS84 (lon, lat)
    // =====================================================================

    // Distance de grand cercle (haversine), l'écart de longitude ramené dans [-180, 180] : l'approximation
    // plane donnait +17 % vers Tokyo et ×2,6 de part et d'autre de l'antiméridien (audit 0.07 n° 21).
    function metres(a, b) {
        const r = Math.PI / 180, dl = ((b[0] - a[0] + 540) % 360) - 180;
        const s1 = Math.sin((b[1] - a[1]) * r / 2), s2 = Math.sin(dl * r / 2);
        const h = s1 * s1 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * s2 * s2;
        return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
    }
    // En deçà, la carte n'a pas « bougé » (distances affichées, cache Google).
    const BOUGE_M = 50;
    const pointsDe = g => !g ? [] : g.type === 'Point' ? [g.coordinates] : g.type === 'LineString' ? g.coordinates
        : g.type === 'Polygon' ? g.coordinates[0] : [];
    function emprise(geos) {
        let o = null;
        for (const g of geos) for (const p of pointsDe(g)) {
            if (!o) o = [p[0], p[1], p[0], p[1]];
            else { o[0] = Math.min(o[0], p[0]); o[1] = Math.min(o[1], p[1]); o[2] = Math.max(o[2], p[0]); o[3] = Math.max(o[3], p[1]); }
        }
        return o;
    }
    // Milieu d'une ligne (au milieu du tracé, pas de l'emprise), centre d'emprise sinon.
    function centreDe(g) {
        if (g && g.type === 'Point') return g.coordinates;
        if (g && g.type === 'LineString' && g.coordinates.length) return g.coordinates[Math.floor(g.coordinates.length / 2)];
        const b = emprise([g]);
        return b ? [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2] : null;
    }
    const dansEmprise = (p, b) => !!(p && b && p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3]);
    const coordOk = (lat, lon) => isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && !(lat === 0 && lon === 0);

    // En milles et en pieds si l'éditeur a choisi l'impérial dans WME (audit n° 50).
    let imperial = false;
    function distanceTxt(m) {
        const nb = (v, d) => formatIntl('NumberFormat', { maximumFractionDigits: d }).format(v);
        if (imperial) {
            const pieds = m * 3.28084, milles = m / 1609.344;
            if (milles < 0.1) return nb(Math.round(pieds / 10) * 10, 0) + '\u00a0ft';
            return nb(milles, milles < 10 ? 1 : 0) + '\u00a0mi';
        }
        if (m < 1000) return nb(Math.round(m / 10) * 10, 0) + '\u00a0m';
        return nb(m / 1000, m < 10000 ? 1 : 0) + '\u00a0km';
    }

    // En hébreu, une valeur non traduite (coordonnées, ID, nom latin) est isolée du sens de la phrase,
    // et « de → vers » se lit de droite à gauche : « vers ← de » (audit n° 13). Caractères FSI/PDI :
    // le texte reste du texte, échappé comme le reste.
    const iso = x => _lang === 'he' ? '\u2068' + x + '\u2069' : String(x);
    const fleche = (a, b) => iso(a) + (_lang === 'he' ? ' ← ' : ' → ') + iso(b);

    // =====================================================================
    //  ① Ce qui est TAPÉ — permaliens, liens, coordonnées, codes, ID
    // =====================================================================

    // Lambert 93 (RGF93, ellipsoïde GRS80, à moins d'un mètre de WGS84) vers longitude, latitude.
    function lambert93(x, y) {
        const n = 0.7256077650532670, C = 11754255.426096, xs = 700000, ys = 12655612.049876, e = 0.0818191910428158;
        const R = Math.hypot(x - xs, y - ys), g = Math.atan((x - xs) / (ys - y));
        const lon = 3 * Math.PI / 180 + g / n;
        const li = -Math.log(Math.abs(R / C)) / n;
        let lat = 2 * Math.atan(Math.exp(li)) - Math.PI / 2;
        for (let i = 0; i < 12; i++) {
            const s = e * Math.sin(lat);
            lat = 2 * Math.atan(Math.pow((1 + s) / (1 - s), e / 2) * Math.exp(li)) - Math.PI / 2;
        }
        return [lon * 180 / Math.PI, lat * 180 / Math.PI];
    }

    // Open Location Code (Plus Codes) : code complet, ou code court rapporté au centre de la carte.
    const OLC = '23456789CFGHJMPQRVWX';
    const OLC_RES = [20, 1, 0.05, 0.0025, 0.000125];
    function olcDecoder(code) {
        const c = code.toUpperCase().replace('+', '').replace(/0+$/, '');
        let lat = -90, lon = -180, h = 20, l = 20;
        for (let i = 0; i < Math.min(c.length, 10); i += 2) {
            h = l = OLC_RES[i / 2];
            lat += OLC.indexOf(c[i]) * h;
            if (c[i + 1] !== undefined) lon += OLC.indexOf(c[i + 1]) * l;
        }
        for (let i = 10; i < c.length; i++) {
            h /= 5; l /= 4;
            const d = OLC.indexOf(c[i]);
            lat += Math.floor(d / 4) * h; lon += (d % 4) * l;
        }
        return [lon + l / 2, lat + h / 2];
    }
    function olcEncoderPrefixe(lat, lon, n) {
        let la = Math.min(Math.max(lat, -90), 89.9999999) + 90, lo = ((lon + 180) % 360 + 360) % 360, out = '';
        for (let i = 0; out.length < n; i++) {
            const r = OLC_RES[i];
            const a = Math.floor(la / r), b = Math.floor(lo / r);
            la -= a * r; lo -= b * r;
            out += OLC[a] + OLC[b];
        }
        return out.slice(0, n);
    }
    function olcLire(txt, centre) {
        const m = /^([23456789CFGHJMPQRVWX]{2,8})\+([23456789CFGHJMPQRVWX]{0,7})$/i.exec(txt.trim());
        if (!m) return null;
        const avant = m[1].toUpperCase();
        if (avant.length === 8) return olcDecoder(avant + '+' + m[2]);
        if (avant.length % 2 || !centre) return null;
        // Code court : on complète par le préfixe du centre, puis on retient la cellule voisine la
        // plus proche (algorithme de référence, « recoverNearest »).
        const manque = 8 - avant.length, res = Math.pow(20, 2 - manque / 2);
        let [lon, lat] = olcDecoder(olcEncoderPrefixe(centre[1], centre[0], manque) + avant + '+' + m[2]);
        if (centre[1] + res / 2 < lat && lat - res >= -90) lat -= res; else if (centre[1] - res / 2 > lat && lat + res <= 90) lat += res;
        if (centre[0] + res / 2 < lon) lon -= res; else if (centre[0] - res / 2 > lon) lon += res;
        return [lon, lat];
    }

    // Degrés, minutes, secondes : 43°36'38.5"N 3°52'36"E, 43 36 38 N, N43°36.643'…
    function dmsLire(txt) {
        const re = /([NSEWO])?\s*(\d{1,3}(?:[.,]\d+)?)\s*[°º]\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*['′’]\s*)?(?:(\d{1,2}(?:[.,]\d+)?)\s*(?:["″”]|'')\s*)?([NSEWO])?/gi;
        const v = [];
        let m;
        while ((m = re.exec(txt)) && v.length < 3) {
            if (!m[0].trim()) { re.lastIndex++; continue; }
            const f = x => x ? parseFloat(x.replace(',', '.')) : 0;
            const h = (m[1] || m[5] || '').toUpperCase();
            let d = f(m[2]) + f(m[3]) / 60 + f(m[4]) / 3600;
            if (h === 'S' || h === 'W' || h === 'O') d = -d;
            v.push({ d, h });
        }
        if (v.length !== 2) return null;
        let [a, b] = v;
        if ('EWO'.includes(a.h || '-') && 'NS'.includes(b.h || '-')) [a, b] = [b, a];
        if (!coordOk(a.d, b.d)) return null;
        const r = [b.d, a.d];
        // « O » est l'Ouest en français, en espagnol, en italien, en portugais… et l'EST en allemand
        // et en néerlandais (Ost, Oost) : les deux lectures, l'appelant ordonne (audit n° 11).
        if (b.h === 'O') r.autre = [-b.d, a.d];
        return r;
    }

    // Tout ce qu'une URL peut dire d'une position, d'une source à l'autre.
    function lienLire(url) {
        let u;
        try { u = new URL(url.trim()); } catch (e) { return null; }
        // Un « % » invalide ne doit pas faire échouer toute la recherche (audit n° 15).
        let brut = u.href;
        try { brut = decodeURIComponent(u.href); } catch (e) { }
        const h = u.hostname.replace(/^www\./, ''), q = u.searchParams;
        const res = (src, lat, lon, zoom, extra) => coordOk(lat, lon) ? Object.assign({ src, lat, lon, zoom }, extra || {}) : null;
        const num = x => x == null ? NaN : parseFloat(x);
        const zq = v => { const z = parseFloat(v); return isFinite(z) ? Math.max(3, Math.min(22, Math.round(z))) : null; };

        if (/(^|\.)waze\.com$/.test(h) && /\/editor/.test(u.pathname)) {
            const sel = {};
            for (const [p, k] of [['segments', 'segment'], ['venues', 'venue'], ['nodes', 'node'], ['mapComments', 'mapComment']]) {
                const v = q.get(p);
                if (v) sel[k] = v.split(',').map(s => s.trim()).filter(Boolean);
            }
            const zoom = q.get('zoomLevel') ? zq(q.get('zoomLevel')) : q.get('zoom') ? zq(+q.get('zoom') + 12) : null;
            // Un permalien d'un autre serveur (usa, il) mène à une carte vide ici : on l'ouvre tel quel (audit n° 12).
            const env = q.get('env');
            if (env && env !== region) return { autreServeur: env, url: u.href, src: 'WME' };
            // Des ID sans position : ils se localisent comme un ID tapé (audit n° 15).
            if (!coordOk(num(q.get('lat')), num(q.get('lon'))) && Object.keys(sel).length) return { wme: true, sel, sansPosition: true, src: 'WME' };
            return res('WME', num(q.get('lat')), num(q.get('lon')), zoom, { wme: true, sel, ur: q.get('mapUpdateRequest') });
        }
        if (/(^|\.)waze\.com$/.test(h) || h === 'ul.waze.com') {
            const m = /(?:ll|latlng|to=ll\.|from=ll\.)[=.]?(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/.exec(brut);
            if (m) return res('Live Map', num(m[1]), num(m[2]), zq(q.get('zoom')) || 17);
        }
        if (/^(maps\.app\.goo\.gl|goo\.gl|g\.co)$/.test(h)) return { court: true, src: 'Google' };
        if (/google\./.test(h)) {
            let m = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(brut);
            if (m) return res('Google Maps', num(m[1]), num(m[2]), 18);
            m = /@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+(?:\.\d+)?)z)?/.exec(brut);
            if (m) return res('Google Maps', num(m[1]), num(m[2]), zq(m[3]) || 17);
            for (const p of ['q', 'query', 'll', 'center', 'destination', 'cbll']) {
                m = /^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/.exec(q.get(p) || '');
                if (m) return res('Google Maps', num(m[1]), num(m[2]), zq(q.get('z')) || 17);
            }
        }
        if (/openstreetmap\.org$/.test(h)) {
            const m = /map=(\d+(?:\.\d+)?)\/(-?\d+\.\d+)\/(-?\d+\.\d+)/.exec(brut);
            if (q.get('mlat')) return res('OpenStreetMap', num(q.get('mlat')), num(q.get('mlon')), m ? zq(m[1]) : 17);
            if (m) return res('OpenStreetMap', num(m[2]), num(m[3]), zq(m[1]));
        }
        if (/apple\.com$/.test(h)) {
            const m = /^(-?\d+\.\d+),(-?\d+\.\d+)/.exec(q.get('ll') || q.get('coordinate') || q.get('sll') || '');
            if (m) return res('Apple Maps', num(m[1]), num(m[2]), zq(q.get('z')) || 17);
        }
        if (/bing\.com$/.test(h)) {
            const m = /^(-?\d+\.\d+)~(-?\d+\.\d+)/.exec(q.get('cp') || '');
            if (m) return res('Bing Maps', num(m[1]), num(m[2]), zq(q.get('lvl')) || 17);
        }
        if (/geoportail\.gouv\.fr$/.test(h)) {
            const m = /^(-?\d+\.\d+),(-?\d+\.\d+)/.exec(q.get('c') || '');
            if (m) return res('Géoportail', num(m[2]), num(m[1]), zq(q.get('z')) || 17);
        }
        if (/mapillary\.com$/.test(h) && q.get('lat')) return res('Mapillary', num(q.get('lat')), num(q.get('lng')), zq(q.get('z')) || 18);
        // Repli : n'importe quelle carte qui écrit lat= et lon= (ou lng=).
        if (q.get('lat') && (q.get('lon') || q.get('lng'))) return res(h, num(q.get('lat')), num(q.get('lon') || q.get('lng')), zq(q.get('zoom') || q.get('z')) || 17);
        return null;
    }

    // Deux nombres décimaux : « 43.6107, 3.8767 », « 43,6107 3,8767 », « 43.6N 3.8E ».
    function coordsLire(txt) {
        const s = txt.trim();
        let m = /^(-?\d{1,3}\.\d+)\s*([NSEWO])?\s*[,;\s]\s*(-?\d{1,3}\.\d+)\s*([NSEWO])?$/i.exec(s)
            || /^(-?\d{1,3},\d+)\s*([NSEWO])?\s*[;\s]\s*(-?\d{1,3},\d+)\s*([NSEWO])?$/i.exec(s);
        if (!m) {
            const p = /^([NSEWO])\s*(-?\d{1,3}[.,]\d+)\s*[,;\s]\s*([NSEWO])\s*(-?\d{1,3}[.,]\d+)$/i.exec(s);
            if (p) m = [p[0], p[2], p[1], p[4], p[3]];
        }
        if (!m) return null;
        const signe = (v, h) => /[SWO]/i.test(h || '') ? -Math.abs(v) : v;
        let a = signe(parseFloat(m[1].replace(',', '.')), m[2]), b = signe(parseFloat(m[3].replace(',', '.')), m[4]);
        const hA = (m[2] || '').toUpperCase(), hB = (m[4] || '').toUpperCase();
        if ('EWO'.includes(hA || '-') && 'NS'.includes(hB || '-')) [a, b] = [b, a];
        if (Math.abs(a) > 90 && Math.abs(b) <= 90) [a, b] = [b, a];
        if (!coordOk(a, b)) return null;
        // Sans lettre, « lat, lon » est l'usage ; l'ordre inverse reste proposé en second.
        const inverse = !hA && !hB && coordOk(b, a) && a !== b ? [b, a] : null;
        // « O » : Ouest ou Ost/Oost, les deux lectures (voir dmsLire).
        const autre = hA === 'O' || hB === 'O' ? [a, -b] : null;
        return { lat: a, lon: b, inverse, autre };
    }

    // =====================================================================
    //  ② Ce que WME a CHARGÉ — index refait quand de nouvelles données arrivent
    // =====================================================================

    let index = null, indexPromesse = null, categories = null, typesVoies = null;

    async function lireCategories() {
        if (categories) return categories;
        categories = new Map();
        try { for (const c of await sdk.DataModel.Venues.getAllVenueCategories()) categories.set(c.id, c.localizedName); }
        catch (e) { logUneFois('cat', 'catégories de lieux : ' + e.message); }
        return categories;
    }

    const toutLire = async (ns) => {
        try { return (await sdk.DataModel[ns].getAll()) || []; }
        catch (e) { logUneFois('getAll-' + ns, ns + '.getAll : ' + e.message); return []; }
    };

    // =====================================================================
    //  Ce que les calques éteints cachent au modèle — lu par le service Features
    // =====================================================================

    // Le modèle de WME ne contient que ce que ses CALQUES affichent (mesuré le 30/10/2026) : calque
    // Lieux éteint ⇒ 0 lieu au lieu de 423 ; calque Notes éteint ⇒ 0 note au lieu de 15 ; un calque
    // par type de zone ⇒ 64 zones au lieu de 159 (131 feux manquaient). Les zones réglementées n'y
    // sont jamais. On complète donc par la requête même de WME, sur la vue élargie d'un quart (méthode
    // de WCT), en ne demandant que ce qui manque :
    //  · lieux : `venueLevel=4&venueFilter=1,1,1,1` (avec trois valeurs, le service répond 406) ;
    //  · notes : `mapComments=true` ; zones réglementées : `restrictedDrivingAreas=true` ;
    //  · zones et radars : ils viennent AVEC les voies qui les portent — `roadTypes` est donc
    //    nécessaire (≈ 2 Mo pour une vue au zoom 17), et n'est demandé que si un calque de zones est éteint.
    // Un objet connu par ce seul biais n'est pas dans le modèle : au clic, on coche la case de son calque
    // (demande de l'auteur, 30/10/2026), WME le charge, et la sélection se fait. Seul le CLIC sur la case
    // déclenche le chargement (relevé par WCT pour les fermetures ; mesuré ici : notes 0 → 8, zones
    // réglementées 0 → 5, puis sélection réussie). Le calque reste allumé : l'objet choisi doit se voir.
    const TYPES_ZONE = { 1: 'SPEED_BUMP', 2: 'TOPES', 3: 'TOLL_BOOTH', 4: 'DANGEROUS_CURVE', 5: 'DANGEROUS_INTERSECTION', 7: 'DANGEROUS_MERGE',
        9: 'SCHOOL_ZONE', 10: 'CAMERA', 11: 'RAILROAD_CROSSING', 12: 'TRAFFIC_LIGHT', 13: 'SIGN', 14: 'LANE_ENDING', 15: 'RAISED_CROSSWALK',
        16: 'HIGHWAY_CROSSWALK', 17: 'SHOULDER_ENDING', 18: 'NARROW_BRIDGE' };   // relevé dans le code de WME v2.374
    // Les cases du sélecteur de calques qui font charger un objet (identifiants relevés dans WME v2.374).
    const CASE_ZONE = { SPEED_BUMP: 'speed_bump', TOPES: 'speed_bump', TOLL_BOOTH: 'toll_booth', DANGEROUS_CURVE: 'dangerous_curve',
        DANGEROUS_INTERSECTION: 'dangerous_intersection', DANGEROUS_MERGE: 'dangerous_merge', SCHOOL_ZONE: 'school_zone', CAMERA: 'camera',
        RAILROAD_CROSSING: 'railroad_crossing', TRAFFIC_LIGHT: 'traffic_lights_and_signs', SIGN: 'traffic_lights_and_signs', LANE_ENDING: 'lane_ending',
        RAISED_CROSSWALK: 'raised_crosswalk', HIGHWAY_CROSSWALK: 'highway_crosswalk', SHOULDER_ENDING: 'shoulder_ending', NARROW_BRIDGE: 'narrow_bridge' };
    function calquesPour(objectType, o) {
        if (objectType === 'venue') return ['group_places', 'item_' + (o.isResidential ? 'residential_places' : (o.categories || []).includes('PARKING_LOT') ? 'parking_places' : 'venues')];
        if (objectType === 'permanentHazard') {
            // Un type que la table ne connaît pas : le groupe seul, jamais une case au hasard (audit n° 47).
            if (!CASE_ZONE[o.type]) { if (o.type) logUneFois('zone-' + o.type, 'type de zone inconnu : ' + o.type); return ['group_permanent_hazards']; }
            return ['group_permanent_hazards', 'item_permanent_hazard_' + CASE_ZONE[o.type]];
        }
        if (objectType === 'mapComment') return ['item_map_comments'];
        if (objectType === 'restrictedDrivingArea') return ['group_restricted_driving_areas'];
        return [];
    }
    // La cible d'un objet : avec la liste des cases à cocher s'il n'est connu que par le service.
    const cibleCalque = (geo, objectType, o, zoom) => {
        const c = cibleObjet(geo, { objectType, ids: [o.id] }, zoom);
        if (o._api) c.calques = calquesPour(objectType, o);
        return c;
    };
    // Un lieu dont on ignore la sorte (permalien, ID localisé) : les lieux ordinaires d'abord, puis,
    // si la sélection échoue, les résidentiels et les parkings.
    const REPLI_LIEU = ['item_residential_places', 'item_parking_places'];
    function allumerCalques(ids) {
        let n = 0;
        for (const id of ids || []) {
            const e = document.getElementById('layer-switcher-' + id);
            if (e && !e.checked) { e.click(); n++; }
            else if (!e) logUneFois('case-' + id, 'case de calque introuvable : layer-switcher-' + id);
        }
        return n;
    }
    const calqueAllume = id => { const e = document.getElementById('layer-switcher-item_' + id); return !!(e && e.checked); };
    const zonesToutesAllumees = () => { const l = [...document.querySelectorAll('[id^="layer-switcher-item_permanent_hazard_"]')]; return l.length > 0 && l.every(e => e.checked); };
    // La voirie (qui porte les zones) n'est demandée que pour une emprise de 0,03° de large au plus :
    // ±0,05° autour de Montpellier = 30 Mo, ±0,15° = 15 Mo, sans la voirie 1,8 Mo (mesuré le 30/10/2026,
    // audit n° 28). Au-delà, les zones des calques éteints ne sont pas complétées.
    const LARGEUR_VOIRIE = 0.03;
    let complement = { bbox: null, demande: {}, lieux: [], notes: [], rda: [], zones: [] }, complementPromesse = null;

    function lireComplement(vue) {
        const b = complement.bbox;
        const veutLieux = !calqueAllume('venues'), veutNotes = !calqueAllume('map_comments');
        const bbox = vue ? elargie(vue) : null;
        const veutZones = !zonesToutesAllumees() && !!bbox && bbox[2] - bbox[0] <= LARGEUR_VOIRIE;
        // Le cache ne vaut que si la lecture couvrait la vue ET les calques maintenant éteints (audit
        // n° 22, mesuré : éteindre le calque Lieux fait passer le modèle de 423 lieux à 55).
        const d = complement.demande;
        const couverts = (!veutLieux || d.lieux) && (!veutNotes || d.notes) && (!veutZones || d.zones);
        if (!vue || (b && couverts && vue[0] >= b[0] && vue[1] >= b[1] && vue[2] <= b[2] && vue[3] <= b[3])) return Promise.resolve(complement);
        if (complementPromesse) return complementPromesse;
        complementPromesse = (async () => {
            try {
                const r = await fetch(descartes() + '/app/Features?bbox=' + bbox.map(x => x.toFixed(5)).join(',') + '&language=en&v=2&apiV2=true&zoomLevel=17&restrictedDrivingAreas=true'
                    + (veutLieux ? '&venueLevel=4&venueFilter=1,1,1,1' : '') + (veutNotes ? '&mapComments=true' : '') + (veutZones ? '&roadTypes=' + TYPES_VOIES : ''), { credentials: 'same-origin' });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const j = await r.json();
                const noms = new Map(((j.users && j.users.objects) || []).map(u => [u.id, u.userName]));
                const md = o => ({ createdBy: noms.get(o.createdBy) || null, createdOn: o.createdOn, updatedBy: noms.get(o.updatedBy) || null, updatedOn: o.updatedOn });
                const liste = k => (j[k] && j[k].objects) || [];
                complement = {
                    bbox, demande: { lieux: veutLieux, notes: veutNotes, zones: veutZones },
                    // Le service nomme `externalProviderIDs` ce que le SDK nomme `externalProviderIds`, et
                    // l'omet quand il est vide (mesuré le 01/11/2026 : 222 lieux sur 313 rattachés à Google).
                    lieux: liste('venues').map(v => ({ id: v.id, name: v.name, aliases: v.aliases || [], categories: v.categories || [], geometry: v.geometry, isResidential: !!v.residential,
                        externalProviderIds: v.externalProviderIDs || [], modificationData: md(v), _api: true })),
                    notes: liste('mapComments').map(c => ({ id: c.id, subject: c.subject, body: c.body, geometry: c.geometry, modificationData: md(c), _api: true })),
                    rda: liste('restrictedDrivingAreas').map(a => ({ id: a.id, name: a.name, restrictionName: '', geometry: a.geometry, modificationData: md(a), _api: true })),
                    zones: liste('permanentHazards').map(z => ({ id: z.id, type: TYPES_ZONE[z.type] || String(z.type), name: z.name, geometry: z.geometry, segmentId: z.segmentID || z.segmentId || null, modificationData: md(z), _api: true })),
                };
            } catch (e) { logUneFois('complement', 'calques éteints, service Features : ' + e.message); }
            complementPromesse = null;
            return complement;
        })();
        return complementPromesse;
    }
    // Le modèle d'abord (ses objets se sélectionnent), puis ce que le service ajoute.
    const fusion = (modele, api) => { const vus = new Set(modele.map(o => String(o.id))); return modele.concat(api.filter(o => !vus.has(String(o.id)))); };

    // Quand le complément arrive, l'index est refait et la recherche en cours relancée.
    async function completerCalques() {
        let vue = null;
        try { vue = await sdk.Map.getMapExtent(); } catch (e) { return; }
        const avant = complement, apres = await lireComplement(vue);
        if (apres !== avant) { invaliderIndex(); if (ouverte && champ.value.trim()) relancer(); }
    }

    async function construireIndex() {
        const [segs, rues, villes, lieuxM, zonesM, etats, pays, carrefours, commentairesM, rdaM, virages] = await Promise.all(
            ['Segments', 'Streets', 'Cities', 'Venues', 'PermanentHazards', 'States', 'Countries', 'BigJunctions', 'MapComments', 'RestrictedDrivingAreas', 'Turns'].map(toutLire));
        const lieux = fusion(lieuxM, complement.lieux), zones = fusion(zonesM, complement.zones);
        const commentaires = fusion(commentairesM, complement.notes), rda = fusion(rdaM, complement.rda);
        const cats = await lireCategories();
        if (!typesVoies) {
            typesVoies = new Map();
            try { for (const r of await sdk.DataModel.Segments.getRoadTypes()) typesVoies.set(r.id, r.localizedName); }
            catch (e) { logUneFois('types', 'types de voie : ' + e.message); }
        }
        const rueParId = new Map(rues.map(r => [r.id, r]));
        const villeParId = new Map(villes.map(v => [v.id, v]));
        const etatParId = new Map(etats.map(e => [e.id, e]));
        const paysParId = new Map(pays.map(p => [p.id, p]));
        const nomVille = id => { const v = villeParId.get(id); return v && !v.isEmpty && v.name ? v.name : ''; };

        // Une voie = un nom dans une ville, avec tous ses segments (nom principal ou alternatif).
        const voies = new Map();
        const ajouterVoie = (rue, seg, alt) => {
            if (!rue || rue.isEmpty || !rue.name) return;
            const cle = norm(rue.name) + '|' + (rue.cityId || 0);
            let v = voies.get(cle);
            if (!v) {
                v = { nom: rue.name, ville: nomVille(rue.cityId), segs: [], alt: true, mots: motsDe(rue.name), ctx: motsDe(nomVille(rue.cityId)), plein: norm(rue.name) };
                voies.set(cle, v);
            }
            v.segs.push(seg);
            if (!alt) v.alt = false;
        };
        for (const s of segs) {
            ajouterVoie(rueParId.get(s.primaryStreetId), s, false);
            for (const a of s.alternateStreetIds || []) ajouterVoie(rueParId.get(a), s, true);
        }

        return {
            segs, lieux, villes, zones, carrefours, commentaires, rda, voies: [...voies.values()], rueParId, nomVille, cats,
            // Les virages qui portent un guidage avancé (IGA) : 8 sur 2 307 autour de Montpellier, mesuré.
            virages: virages.filter(v => v.hasTurnGuidance && v.turnGuidance),
            lieuxIdx: lieux.filter(l => l.name || (l.aliases && l.aliases.length)).map(l => ({
                l, mots: motsDe([l.name, ...(l.aliases || [])].join(' ')), plein: norm(l.name),
                cat: (l.categories || []).map(c => cats.get(c) || c)[0] || '',
            })),
            villesIdx: villes.filter(v => !v.isEmpty && v.name).map(v => ({
                v, mots: motsDe(v.name), plein: norm(v.name),
                etat: (etatParId.get(v.stateId) || {}).name || '', pays: (paysParId.get(v.countryId) || {}).name || '',
            })),
        };
    }

    function lireIndex() {
        if (index) return Promise.resolve(index);
        if (!indexPromesse) {
            const g = genIndex;
            // Une invalidation PENDANT la construction n'est pas perdue (audit n° 32) : l'index construit
            // sur des données périmées n'est pas installé.
            indexPromesse = construireIndex().then(x => { if (g === genIndex) index = x; indexPromesse = null; return x; }, e => { indexPromesse = null; throw e; });
        }
        return indexPromesse;
    }
    let genIndex = 0;
    const invaliderIndex = () => { index = null; indexPromesse = null; genIndex++; };

    // =====================================================================
    //  Cibles — où aller, quoi sélectionner, quel permalien
    // =====================================================================

    // cible = { lon, lat, zoom?, bbox?, sel?: { objectType, ids }, google? }
    const cibleObjet = (geo, sel, zoomMin) => {
        const b = emprise([geo]), c = centreDe(geo);
        return { lon: c[0], lat: c[1], zoom: zoomMin, bbox: b && (b[2] - b[0] > 1e-5 || b[3] - b[1] > 1e-5) ? b : null, sel };
    };

    // Le zoom qui fait tenir une emprise dans la carte (projection de Mercator, tuiles de 256 px).
    // Surface de carte que rien ne recouvre — la méthode de WCT (_zoneVisible), pour que l'objet
    // choisi tombe au milieu de ce que l'éditeur VOIT, comme dans ses autres scripts (demande de
    // l'auteur, 30/10/2026). On retranche le volet de gauche, notre fenêtre si elle est ouverte (la
    // plus grande des quatre découpes : elle est déplaçable), et la barre du bas. Rien en dur.
    const estVisible = e => {
        if (!e || e.hidden || (e.style && e.style.display === 'none')) return false;
        const r = e.getBoundingClientRect();
        return r.width > 1 && r.height > 1;
    };
    function zoneVisible() {
        const carte = document.querySelector('#map') || document.querySelector('div.edit-area-main') || document.body;
        const rc = carte.getBoundingClientRect();
        let gauche = rc.left, droite = rc.right, haut = rc.top, bas = rc.bottom;
        for (const sel of ['#sidebarContent', '.sidebar-layout', '#user-info']) {
            const e = document.querySelector(sel);
            if (!estVisible(e)) continue;
            const r = e.getBoundingClientRect();
            if (r.right > gauche && r.left <= gauche + 2) gauche = Math.max(gauche, r.right);
        }
        if (ouverte && estVisible(pal)) {
            const r = pal.getBoundingClientRect();
            if (!(r.bottom < haut || r.top > bas || r.right < gauche || r.left > droite)) {
                let mieux = null, aire = -1;
                for (const c of [
                    { g: gauche, d: Math.min(droite, r.left), h: haut, b: bas },
                    { g: Math.max(gauche, r.right), d: droite, h: haut, b: bas },
                    { g: gauche, d: droite, h: haut, b: Math.min(bas, r.top) },
                    { g: gauche, d: droite, h: Math.max(haut, r.bottom), b: bas },
                ]) {
                    const a = Math.max(0, c.d - c.g) * Math.max(0, c.b - c.h);
                    if (a > aire) { aire = a; mieux = c; }
                }
                gauche = mieux.g; droite = mieux.d; haut = mieux.h; bas = mieux.b;
            }
        }
        for (const sel of ['.WMEToolbox', '#toolbox', '.edit-buttons', '.footer']) {
            const e = document.querySelector(sel);
            if (!estVisible(e)) continue;
            const r = e.getBoundingClientRect();
            if (r.top < bas && r.bottom >= bas - 4) bas = Math.min(bas, r.top);
        }
        // Retranchements qui se croisent (petit écran) : la carte entière plutôt qu'une zone absurde.
        if (droite - gauche < 80 || bas - haut < 80) return { gauche: rc.left, droite: rc.right, haut: rc.top, bas: rc.bottom, rc, complet: true };
        return { gauche, droite, haut, bas, rc, complet: false };
    }

    // Décalage à donner au centre de la carte pour que le point tombe au centre de la zone visible,
    // calculé pour le zoom d'ARRIVÉE (l'échelle double à chaque niveau) : une seule pose, pas de
    // rattrapage qui se verrait. Fonction PURE, reprise de WCT (_decalageVisible) ; éprouvée au banc.
    function decalageVisible(zone, ext, zoomActuel, zoomCible) {
        if (!zone || zone.complet) return { dLon: 0, dLat: 0 };
        const rc = zone.rc;
        if (!ext || ext.length !== 4 || !(rc.width > 0) || !(rc.height > 0)) return { dLon: 0, dLat: 0 };
        const f = zoomCible == null || zoomCible === zoomActuel ? 1 : Math.pow(2, zoomActuel - zoomCible);
        const dx = (zone.gauche + zone.droite) / 2 - (rc.left + rc.right) / 2;
        const dy = (zone.haut + zone.bas) / 2 - (rc.top + rc.bottom) / 2;
        // L'axe Y de l'écran descend, la latitude monte : le signe s'inverse sur dy.
        return { dLon: -dx * (ext[2] - ext[0]) / rc.width * f, dLat: dy * (ext[3] - ext[1]) / rc.height * f };
    }

    // Le zoom qui fait tenir une emprise dans la zone VISIBLE (Mercator, tuiles de 256 px) : mesuré
    // sur la carte entière, l'objet « tenait » sur une largeur dont l'éditeur ne voit qu'une partie.
    function zoomPour(b) {
        const z = zoneVisible();
        const w = Math.max(300, (z.droite - z.gauche) * 0.85), h = Math.max(200, (z.bas - z.haut) * 0.85);
        const latR = l => Math.log(Math.tan(Math.PI / 4 + l * Math.PI / 360));
        const zx = Math.log2(w * 360 / (256 * Math.max(b[2] - b[0], 1e-6)));
        const zy = Math.log2(h * 2 * Math.PI / (256 * Math.max(latR(b[3]) - latR(b[1]), 1e-9)));
        // 19 au plus : au-delà, une voie courte remplit l'écran et l'on perd ses abords.
        return Math.max(3, Math.min(19, Math.floor(Math.min(zx, zy))));
    }

    let region = 'row';
    const PARAM_SEL = { segment: 'segments', venue: 'venues', node: 'nodes', mapComment: 'mapComments' };
    function permalien(c) {
        const zoom = c.bbox ? zoomPour(c.bbox) : (c.zoom || 17);
        const lon = c.bbox ? (c.bbox[0] + c.bbox[2]) / 2 : c.lon, lat = c.bbox ? (c.bbox[1] + c.bbox[3]) / 2 : c.lat;
        let u = location.origin + location.pathname + '?env=' + encodeURIComponent(region) +
            '&lat=' + lat.toFixed(6) + '&lon=' + lon.toFixed(6) + '&zoomLevel=' + zoom;
        if (c.sel && PARAM_SEL[c.sel.objectType]) u += '&' + PARAM_SEL[c.sel.objectType] + '=' + c.sel.ids.join(',');
        return u;
    }

    function donneesChargees(ms) {
        return new Promise(res => {
            const minuterie = setTimeout(res, ms);
            Promise.resolve().then(() => sdk.Events.once({ eventName: 'wme-map-data-loaded' }))
                .then(() => { clearTimeout(minuterie); setTimeout(res, 300); }, () => { });
        });
    }

    // Les objets d'une sélection qui sont dans le modèle ; une sélection vide n'est pas posée.
    // Une exception du SDK n'est pas « absent » : elle est journalisée, et l'on renonce aussitôt
    // (audit n° 23 : une signature changée faisait mourir la sélection sans trace).
    const LECTEURS = {
        segment: id => sdk.DataModel.Segments.getById({ segmentId: +id }),
        node: id => sdk.DataModel.Nodes.getById({ nodeId: +id }),
        venue: id => sdk.DataModel.Venues.getById({ venueId: String(id) }),
        // L'ID d'une note est rendu en chaîne par le service (« 260414 », mesuré) ; on essaie aussi le nombre.
        mapComment: async id => (await sdk.DataModel.MapComments.getById({ mapCommentId: String(id) })) || sdk.DataModel.MapComments.getById({ mapCommentId: +id }),
        // ⚠️ « hazardId », pas « permanentHazardId » : le SDK lève alors une exception qu'on prenait pour « absent » (mesuré le 30/10/2026).
        permanentHazard: id => sdk.DataModel.PermanentHazards.getById({ hazardId: +id }),
        restrictedDrivingArea: id => sdk.DataModel.RestrictedDrivingAreas.getById({ restrictedDrivingAreaId: +id }),
        // « bigJunctionId » : mesuré le 30/10/2026 (audit n° 14 : les carrefours complexes n'étaient jamais sélectionnés).
        bigJunction: id => sdk.DataModel.BigJunctions.getById({ bigJunctionId: +id }),
    };
    async function presents(sel) {
        const lire = LECTEURS[sel.objectType];
        if (!lire) { logUneFois('lecteur-' + sel.objectType, 'type d\'objet sans lecteur : ' + sel.objectType); return null; }
        const ok = [];
        for (const id of sel.ids) {
            try { if (await lire(id)) ok.push(id); }
            catch (e) { logUneFois('presents-' + sel.objectType, 'lecture ' + sel.objectType + ' : ' + e.message); return null; }
        }
        return ok;
    }

    async function poserSelection(sel, ids) {
        const num = sel.objectType !== 'venue' && sel.objectType !== 'mapComment';
        try { await sdk.Editing.setSelection({ selection: { objectType: sel.objectType, ids: ids.map(x => num ? +x : String(x)) } }); return true; }
        catch (e) { log('sélection : ' + e.message); return false; }
    }
    async function selectionner(sel, arrete) {
        // Après un grand saut (250 km, mesuré), WME charge en plusieurs fois, ≈ 3 s : on attend
        // jusqu'à trois chargements avant de renoncer. Un type que le modèle ne sait pas lire
        // (null) : on tente la sélection directement, sans attendre trois fois 6 s.
        let ids = await presents(sel);
        if (ids === null) return poserSelection(sel, sel.ids);
        for (let k = 0; k < 3 && !ids.length; k++) {
            if (arrete()) return false;
            await donneesChargees(6000);
            if (arrete()) return false;
            ids = (await presents(sel)) || [];
        }
        return ids.length ? poserSelection(sel, ids) : false;
    }
    // La sélection ouvre le panneau de WME, qui rétrécit la carte : on laisse la mise en page se
    // faire avant de mesurer la zone visible (setTimeout et non une image : un onglet en
    // arrière-plan suspend requestAnimationFrame).
    const miseEnPage = () => new Promise(r => setTimeout(r, 250));

    async function poserCentre(lon, lat, zoom) {
        let p = { lon, lat };
        try {
            const d = decalageVisible(zoneVisible(), await sdk.Map.getMapExtent(), await sdk.Map.getZoomLevel(), zoom);
            p = { lon: lon + d.dLon, lat: lat + d.dLat };
        } catch (e) { logUneFois('centre', 'centrage sur la zone visible : ' + e.message); }
        await sdk.Map.setMapCenter({ lonLat: p, zoomLevel: zoom });
    }

    // L'objet au centre de la partie VISIBLE de la carte, comme dans les autres scripts de l'auteur.
    // Déjà chargé : on le sélectionne d'abord (le panneau de WME s'ouvre et rétrécit la carte),
    // puis on centre UNE fois, sur la carte définitive. Pas encore chargé : on y va, on attend
    // qu'il arrive, on le sélectionne, et l'on recentre sur la mise en page qui en résulte.
    // Rend vrai si l'on est arrivé ET que la sélection demandée est posée. Un jeton de génération :
    // une navigation lente qui finit après la suivante ne ramène pas la carte en arrière (audit n° 8).
    let genAller = 0;
    async function allerA(c) {
        const j = ++genAller, arrete = () => j !== genAller;
        navEnCours = false;   // une navigation abandonnée ne garde pas l'état
        let b = null;
        if (c.bbox) {
            const dx = (c.bbox[2] - c.bbox[0]) * 0.1, dy = (c.bbox[3] - c.bbox[1]) * 0.1;
            b = [c.bbox[0] - dx, c.bbox[1] - dy, c.bbox[2] + dx, c.bbox[3] + dy];
        }
        const lon = b ? (b[0] + b[2]) / 2 : c.lon, lat = b ? (b[1] + b[3]) / 2 : c.lat;
        const zoomCible = async () => b ? Math.max(zoomPour(b), c.zoomMin || 3) : (c.zoom || Math.max(await sdk.Map.getZoomLevel(), 17));
        const sel = c.sel && c.sel.ids && c.sel.ids.length ? c.sel : null;
        let choisi = !sel;
        try {
            // Calque éteint : la case cochée, WME charge l'objet, et `selectionner` attend qu'il arrive.
            if (sel && c.calques && allumerCalques(c.calques)) invaliderIndex();
            const deja = sel ? (await presents(sel)) || [] : [];
            if (arrete()) return false;
            if (deja.length && await poserSelection(sel, deja)) {
                choisi = true;
                await miseEnPage();
                if (arrete()) return false;
                await poserCentre(lon, lat, await zoomCible());
            } else {
                await poserCentre(lon, lat, await zoomCible());
                if (sel) {
                    // L'attente peut durer 18 s : elle se dit, et la relance de la recherche (la carte a
                    // bougé) ne l'efface pas.
                    navEnCours = true;
                    etatTexte(t('waitObj'));
                    try {
                        choisi = await selectionner(sel, arrete);
                        // Un lieu dont on ne connaît pas la sorte (permalien, historique) : on n'allume les
                        // calques des lieux résidentiels et des parkings qu'en second recours.
                        if (!choisi && !arrete() && c.repli && allumerCalques(c.repli)) { invaliderIndex(); choisi = await selectionner(sel, arrete); }
                    } finally { if (!arrete()) navEnCours = false; }
                    if (arrete()) return false;
                    if (choisi) { await miseEnPage(); if (arrete()) return false; await poserCentre(lon, lat, await zoomCible()); }
                }
            }
        } catch (e) { log('déplacement : ' + e.message); return false; }
        if (arrete()) return false;
        // Arrivé, mais rien de sélectionné : on le dit (objet supprimé, ou hors de ce que WME a chargé).
        etatTexte(choisi ? (c.approx ? t('approxPlace') : '') : t('arrivedNoSel'), !choisi);
        // Arrivé et sélectionné : dit au lecteur d'écran (la zone d'état, vidée, ne disait rien — audit 0.07 n° 19).
        if (choisi && annonce) { annonce.textContent = t('srArrived'); nombreAnnonce = t('srArrived'); }
        flasher(c.geo || [{ type: 'Point', coordinates: [c.lon, c.lat] }]);
        return choisi;
    }

    // =====================================================================
    //  Aperçu sur la carte — la ligne active se dessine sans déplacer la vue
    // =====================================================================

    let apercuOk = false, fileApercu = Promise.resolve(), genApercu = 0, flashMinuterie = null;

    async function poserCalque() {
        try {
            await sdk.Map.addLayer({
                layerName: APERCU,
                styleRules: [{ style: { strokeColor: '#ff6d00', strokeWidth: 9, strokeOpacity: 0.55, fillColor: '#ff6d00', fillOpacity: 0.12, pointRadius: 13 } },
                    { predicate: p => p.pt, style: { fillOpacity: 0, strokeWidth: 4, strokeOpacity: 1 } }],
            });
            apercuOk = true;
        } catch (e) { log('calque d\'aperçu : ' + e.message); }
    }

    // Le SDK refuse tout le lot pour une seule géométrie qu'il n'accepte pas (mesuré le
    // 03/10/2026) : on n'envoie que Point, LineString et Polygon, et au plus 300 objets.
    function dessiner(geos) {
        const gen = ++genApercu;
        const travail = async () => {
            if (!apercuOk || gen !== genApercu) return;
            await sdk.Map.removeAllFeaturesFromLayer({ layerName: APERCU });
            const f = (geos || []).filter(g => g && ['Point', 'LineString', 'Polygon'].includes(g.type)).slice(0, 300)
                .map((g, i) => ({ type: 'Feature', id: 'wos-' + gen + '-' + i, geometry: g, properties: { pt: g.type === 'Point' } }));
            if (f.length && gen === genApercu) await sdk.Map.addFeaturesToLayer({ layerName: APERCU, features: f });
        };
        fileApercu = fileApercu.then(travail, travail).catch(e => logUneFois('apercu', 'aperçu : ' + e.message));
    }
    function flasher(geos) {
        clearTimeout(flashMinuterie);
        dessiner(geos);
        flashMinuterie = setTimeout(() => { flashMinuterie = null; if (ouverte) dessinerActif(); else dessiner([]); }, FLASH_MS);
    }

    // =====================================================================
    //  Recherche — chaque source rend des lignes { g, k, label, sub, score, cible, geo }
    // =====================================================================

    const TITRE_GROUPE = { direct: 'gDirect', street: 'gStreet', address: 'gAddress', venue: 'gVenue', city: 'gCity', hazard: 'gHazard', editor: 'gEditor', google: 'gGoogle', discuss: 'gDiscuss', recent: 'gRecent',
        closure: 'gClosure', mte: 'gMte', ur: 'gUR', rda: 'gRda', note: 'gNote', iga: 'gIga', company: 'gCompany' };
    const FILTRES = [
        { id: 'all', t: 'fAll' }, { id: 'street', t: 'fStreet' }, { id: 'address', t: 'fAddress' }, { id: 'venue', t: 'fVenue' },
        { id: 'city', t: 'fCity' }, { id: 'closure', t: 'fClosure' }, { id: 'mte', t: 'fMte' }, { id: 'ur', t: 'fUR' }, { id: 'map', t: 'fMap' }, { id: 'editor', t: 'fEditor' }, { id: 'google', t: 'fGoogle' }, { id: 'discuss', t: 'fDiscuss' },
    ];

    // Ce qui est tapé et qui désigne déjà un endroit : aucun index, aucun réseau.
    async function chercherDirect(q, centre) {
        const out = [];
        const pt = (label, sub, lat, lon, zoom, k) => out.push({ g: 'direct', k: k || 'coords', label, sub, score: 100, cible: { lon, lat, zoom: zoom || 18 }, geo: [{ type: 'Point', coordinates: [lon, lat] }] });
        const fmt = (lat, lon) => iso(lat.toFixed(6) + ', ' + lon.toFixed(6));

        if (/^https?:\/\//i.test(q)) {
            const l = lienLire(q);
            if (l && l.court) { out.push({ g: 'direct', k: 'link', label: t('shortLink') + ' · ' + l.src, sub: t('shortLinkSub'), score: 100, inerte: true }); return out; }
            if (l && l.autreServeur) { out.push({ g: 'direct', k: 'link', label: t('otherServer', l.autreServeur), sub: t('otherServerSub'), score: 100, lien: l.url }); return out; }
            if (l && l.sansPosition) {
                const ids = l.sel.segment || l.sel.node || l.sel.venue || l.sel.mapComment;
                return chercherDirect(ids.join(','), centre);
            }
            // Un lien qu'on ne sait pas lire : une ligne qui le dit, et qui coupe le réseau — sinon l'URL
            // entière partait chez Google et dans Discuss (audit n° 15).
            if (!l) { out.push({ g: 'direct', k: 'link', label: t('linkUnknown'), sub: t('linkUnknownSub'), score: 100, inerte: true }); return out; }
            if (l) {
                const sel = l.sel && Object.keys(l.sel)[0];
                const c = { lon: l.lon, lat: l.lat, zoom: l.zoom || 17, sel: sel ? { objectType: sel, ids: l.sel[sel] } : null };
                if (sel === 'venue' || sel === 'mapComment') { c.calques = calquesPour(sel, {}); if (sel === 'venue') c.repli = REPLI_LIEU; }
                const quoi = sel ? (sel === 'segment' ? (l.sel.segment.length > 1 ? t('kSegs', l.sel.segment.length) : t('kSeg') + ' ' + l.sel.segment[0])
                    : sel === 'node' ? t('kNode') + ' ' + l.sel.node[0] : sel === 'venue' ? t('kVenue') + ' ' + l.sel.venue[0] : t('kComment') + ' ' + l.sel.mapComment[0])
                    : l.ur ? t('kUR') + ' ' + l.ur : fmt(l.lat, l.lon);
                out.push({ g: 'direct', k: 'link', label: quoi, sub: l.wme ? t('kPermalink') + ' · zoom ' + (l.zoom || '–') : t('kLink', l.src), score: 100, cible: c, geo: [{ type: 'Point', coordinates: [l.lon, l.lat] }] });
            }
            return out;
        }

        // Deux lectures d'un « O » : la plus proche de la carte d'abord, l'autre en second.
        const deuxO = (lat, lon, autre, quoi) => {
            const ouest = [lon, lat], est = [autre[1], autre[0]];
            const [p1, p2] = metres(centre, ouest) <= metres(centre, est) ? [ouest, est] : [est, ouest];
            const nom = p => p === ouest ? t('oWest') : t('oEast');
            pt(fmt(p1[1], p1[0]), quoi + ' · ' + nom(p1), p1[1], p1[0]);
            pt(fmt(p2[1], p2[0]), quoi + ' · ' + nom(p2), p2[1], p2[0]); out[out.length - 1].score = 90;
        };
        const c = coordsLire(q);
        if (c) {
            if (c.autre) { deuxO(c.lat, c.lon, c.autre, t('kCoords')); return out; }
            pt(fmt(c.lat, c.lon), t('kCoords'), c.lat, c.lon);
            if (c.inverse) { pt(fmt(c.inverse[0], c.inverse[1]), t('kSwap'), c.inverse[0], c.inverse[1]); out[out.length - 1].score = 90; }
            return out;
        }
        const d = /[°º]/.test(q) && dmsLire(q);
        if (d) {
            if (d.autre) deuxO(d[1], d[0], [d.autre[1], d.autre[0]], t('kCoords') + ' (DMS)');
            else pt(fmt(d[1], d[0]), t('kCoords') + ' (DMS)', d[1], d[0]);
            return out;
        }
        const l93 = /^\s*(\d{5,7}(?:[.,]\d+)?)\s*[,;\s]\s*(\d{7}(?:[.,]\d+)?)\s*$/.exec(q);
        if (l93) {
            const x = parseFloat(l93[1].replace(',', '.')), y = parseFloat(l93[2].replace(',', '.'));
            if (x > 50000 && x < 1300000 && y > 6000000 && y < 7200000) {
                const [lon, lat] = lambert93(x, y);
                // SWEREF99, UTM 32/33 et TM35FIN ont la même allure (audit n° 40) : hors de la France
                // métropolitaine, la lecture Lambert 93 reste proposée, mais en retrait et dite « France ».
                const enFrance = centre[0] > -5.5 && centre[0] < 10 && centre[1] > 41 && centre[1] < 51.5;
                pt(fmt(lat, lon), t('kLambert') + (enFrance ? '' : ' (France)') + ' · ' + Math.round(x) + ' ' + Math.round(y), lat, lon);
                if (!enFrance) out[out.length - 1].score = 60;
                return out;
            }
        }
        const plus = olcLire(q.split(/\s+/)[0], centre);
        if (plus) { pt(fmt(plus[1], plus[0]), t('kPlus'), plus[1], plus[0]); return out; }

        // ID : un nombre, une liste de nombres, ou un ID de lieu à trois parties.
        // 14 chiffres : un SIRET, pas un ID d'objet (les ID de segment ont 9 chiffres au plus aujourd'hui).
        const idsNum = /^\s*\d{3,}(\s*,\s*\d{3,})*\s*$/.test(q) && !/^\s*\d{14}\s*$/.test(q) ? q.split(',').map(s => +s.trim()) : null;
        const idLieu = /^\s*\d+\.\d+\.\d+\s*$/.test(q) ? q.trim() : null;
        if (!idsNum && !idLieu) return out;
        const trouves = await objetsParId(idsNum, idLieu);
        out.push(...trouves);
        if (!trouves.length) {
            // Absent de la zone chargée : on demande sa position à son historique, en arrière-plan
            // (3 à 18 requêtes de 3 Ko selon les essais : segment, nœud, zone, voisins) ; la ligne se
            // complète quand la réponse arrive. Départ après 400 ms sans frappe : un ID tapé chiffre
            // à chiffre ne lance pas une localisation par chiffre (audit n° 48).
            const type = idLieu ? 'venue' : 'segment', id = idLieu || idsNum[0], cle = type + ':' + id;
            const loc = localisations.get(cle), quoi = idLieu || idsNum.join(', ');
            const ligne = { g: 'direct', k: 'id', label: t('widen', quoi), score: 100, elargir: { idsNum, idLieu } };
            if (loc === undefined && erreursLoc.has(cle) && !localisationsEnCours.has(cle)) ligne.sub = t('locateErr', erreursLoc.get(cle));
            else if (loc === undefined) {
                ligne.sub = t('locating');
                clearTimeout(minuterieLoc);
                minuterieLoc = setTimeout(() => { if (ouverte && champ.value.trim() === q.trim()) lancerLocalisation(type, id, champ.value.trim()); }, 400);
            }
            else if (loc) {
                const nature = { node: t('kNode'), permanentHazard: t('kHazard'), venue: t('kVenue'), segment: t('kSeg') }[loc.type] || '';
                ligne.sub = [nature, t('located', loc.ville || (loc.pt[1].toFixed(4) + ', ' + loc.pt[0].toFixed(4))), loc.approx ? t('approxShort') : ''].filter(Boolean).join(' · ');
                // Le centre d'une commune n'est pas la position de l'objet : pas de distance affichée.
                if (!loc.approx) { ligne.dist = metres(centre, loc.pt); ligne.ptAff = loc.pt; }
                ligne.geo = [{ type: 'Point', coordinates: loc.pt }];
            } else ligne.sub = t('notLocated');
            out.push(ligne);
        }
        return out;
    }

    async function objetsParId(idsNum, idLieu) {
        const out = [];
        const essai = async f => { try { return await f(); } catch (e) { return null; } };
        if (idLieu) {
            const v = await essai(() => sdk.DataModel.Venues.getById({ venueId: idLieu }));
            if (v) out.push(ligneLieu({ l: v, cat: '' }, 100, []));
            // Un triplet est toujours un lieu : l'ID d'une note de carte est un nombre (mesuré).
            return out;
        }
        const segs = [];
        for (const id of idsNum) { const s = await essai(() => sdk.DataModel.Segments.getById({ segmentId: id })); if (s) segs.push(s); }
        if (segs.length) {
            const geos = segs.map(s => s.geometry), b = emprise(geos);
            const label = segs.length === 1 ? t('kSeg') + ' ' + segs[0].id : t('kSegs', segs.length);
            const rue = segs.length === 1 ? await essai(() => sdk.DataModel.Segments.getAddress({ segmentId: segs[0].id })) : null;
            const sub = rue ? [rue.street && !rue.street.isEmpty ? rue.street.name : '', rue.city && !rue.city.isEmpty ? rue.city.name : ''].filter(Boolean).join(', ') : '';
            out.push({ g: 'direct', k: 'segment', label, sub: sub || t('kSeg'), idTxt: segs.length === 1 ? String(segs[0].id) : '', score: 100,
                cible: { lon: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, bbox: b, zoomMin: 17, sel: { objectType: 'segment', ids: segs.map(s => s.id) } }, geo: geos });
        }
        if (idsNum.length === 1) {
            const id = idsNum[0];
            const n = await essai(() => sdk.DataModel.Nodes.getById({ nodeId: id }));
            if (n) out.push({ g: 'direct', k: 'node', label: t('kNode') + ' ' + id, sub: t('nSeg', (n.connectedSegmentIds || []).length), score: 99, cible: { lon: n.geometry.coordinates[0], lat: n.geometry.coordinates[1], zoom: 19, sel: { objectType: 'node', ids: [id] } }, geo: [n.geometry] });
            // Zones et zones réglementées : lues dans l'index. PermanentHazards.getById n'a pas rendu
            // une zone pourtant chargée (241232, mesuré le 30/10/2026) — la ligne « hors de la zone
            // chargée » s'affichait alors à côté du bon résultat.
            const ix = await lireIndex();
            const z = ix.zones.find(x => x.id === id);
            if (z && z.geometry) out.push({ g: 'direct', k: 'hazard', label: z.name || libelleType('hzTypes', z.type), sub: (z.name ? libelleType('hzTypes', z.type) + ' · ' : '') + 'ID ' + id, score: 98, cible: cibleCalque(z.geometry, 'permanentHazard', z, 17), geo: [z.geometry] });
            const a = ix.rda.find(x => x.id === id);
            if (a && a.geometry) out.push({ g: 'direct', k: 'rda', label: a.name || t('kRda') + ' ' + id, sub: [a.restrictionName, 'ID ' + id].filter(Boolean).join(' · '), score: 98, cible: cibleCalque(a.geometry, 'restrictedDrivingArea', a, 15), geo: [a.geometry] });
            // Une note de carte : son ID est un NOMBRE (« 33198 », mesuré), pas un triplet comme un lieu.
            const nc = ix.commentaires.find(x => String(x.id) === String(id));
            if (nc && nc.geometry) out.push({ g: 'direct', k: 'comment', label: nc.subject || t('kComment'), sub: t('kComment') + ' · ID ' + id, score: 97, cible: cibleCalque(nc.geometry, 'mapComment', nc, 18), geo: [nc.geometry] });
        }
        return out;
    }

    function ligneLieu(x, s, jetons) {
        const l = x.l;
        const alias = (l.aliases || []).find(a => jetons.length && jetons.every(j => norm(a).includes(j)) && !jetons.every(j => norm(l.name).includes(j)));
        const sub = [x.cat, l.isResidential ? t('residential') : '', alias ? t('alias', alias) : ''].filter(Boolean).join(' · ');
        return { g: 'venue', k: 'venue', label: l.name || (l.aliases || [])[0] || t('kVenue'), sub, score: s, cible: cibleCalque(l.geometry, 'venue', l, 18), geo: [l.geometry],
            // gpLu : le rattachement est CONNU (lu et éventuellement vide) — sinon il est seulement inconnu.
            gp: (l.externalProviderIds || []).find(x => typeof x === 'string' && x) || null, gpLu: true, cleObj: 'venue:' + l.id };
    }

    // La fiche Google d'un lieu Waze rattaché (demande de TxAgBQ, 01/11/2026 : comparer le lieu Waze
    // et le lieu Google d'une UR). URL officielle de Google Maps : `query` est obligatoire, `query_place_id`
    // désigne le lieu exact.
    const lienGoogleMaps = (placeId, nom) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(nom || placeId) + '&query_place_id=' + encodeURIComponent(placeId);
    function ouvrirGoogleMaps(l) {
        if (!l || !l.gp) return false;
        window.open(lienGoogleMaps(l.gp, l.label), '_blank', 'noopener');
        return true;
    }

    // Les sources locales, sur l'index ; filtrées et notées, sans limite (le rendu coupe).
    async function chercherLocal(q, filtre, vue) {
        const ix = await lireIndex();
        const out = [];
        const editeur = q.startsWith('@');
        const requete = norm(editeur ? q.slice(1) : q), jetons = requete.split(' ').filter(Boolean);
        if (!jetons.length && !editeur) return out;
        const veut = g => filtre === 'all' || filtre === g;

        // Les éditeurs : avec « @ », dans l'onglet Éditeurs, et aussi dans « Tout » (demande de
        // l'auteur, 30/10/2026). Leurs objets sont ceux qu'ils ont touchés À L'ÉCRAN.
        if (editeur || filtre === 'editor' || filtre === 'all') {
            for (const e of editeursALEcran(ix, vue)) {
                // « @ » seul : tous les éditeurs de l'écran, les plus présents d'abord.
                const s = jetons.length ? score(jetons, e.mots, e.plein, requete) : 1 + Math.log10(1 + e.fiches.length);
                if (!s) continue;
                const geos = e.fiches.map(x => x.f.geo).filter(Boolean), b = emprise(geos);
                out.push({ g: 'editor', k: 'editor', label: '@' + e.nom, sub: resumeEditeur(e), score: s, editeur: e.nom, ed: e, geo: geos.slice(0, 300),
                    cible: b ? { lon: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, bbox: b } : null });
            }
            if (editeur || filtre === 'editor') return out;
        }
        if (veut('street')) for (const v of ix.voies) {
            const s = score(jetons, v.mots, v.plein, requete, v.ctx);
            if (!s) continue;
            const geos = v.segs.map(x => x.geometry), b = emprise(geos);
            out.push({ g: 'street', k: 'street', label: v.nom, sub: [v.ville || t('noCity'), t('nSeg', v.segs.length), v.alt ? t('altName') : ''].filter(Boolean).join(' · '),
                score: s - (v.alt ? 0.5 : 0), geo: geos, voie: v,
                cible: { lon: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, bbox: b, zoomMin: 16, sel: { objectType: 'segment', ids: v.segs.map(x => x.id) } } });
        }
        if (veut('venue')) for (const x of ix.lieuxIdx) {
            const s = score(jetons, x.mots, x.plein, requete);
            if (s) out.push(ligneLieu(x, s, jetons));
        }
        if (veut('city')) for (const x of ix.villesIdx) {
            const s = score(jetons, x.mots, x.plein, requete);
            if (!s || !x.v.geometry) continue;
            out.push({ g: 'city', k: 'city', label: x.v.name, sub: [x.etat, x.pays].filter(Boolean).join(', '), score: s,
                cible: { lon: x.v.geometry.coordinates[0], lat: x.v.geometry.coordinates[1], zoom: 14 }, geo: [x.v.geometry] });
        }
        // « Carte » : radars et zones (par nom, type dans la langue de WME, ou ID), zones réglementées,
        // notes de carte (titre, texte, conversation) et guidage avancé des virages (IGA).
        if (veut('map')) {
            const segParId = new Map(ix.segs.map(x => [x.id, x]));
            const nomRue = sg => { const r = sg && ix.rueParId.get(sg.primaryStreetId); return r && !r.isEmpty && r.name ? r.name : ''; };
            const exact = q.trim();
            for (const z of ix.zones) {
                const type = libelleType('hzTypes', z.type);
                const s = String(z.id) === exact ? 50 : score(jetons, motsDe([z.name, type].join(' ')), norm(z.name || type), requete);
                if (s && z.geometry) out.push({ g: 'hazard', k: 'hazard', label: z.name || type, sub: [z.name ? type : '', nomRue(segParId.get(z.segmentId)), 'ID ' + z.id].filter(Boolean).join(' · '), score: s,
                    cible: cibleCalque(z.geometry, 'permanentHazard', z, 17), geo: [z.geometry] });
            }
            for (const a of ix.rda) {
                const s = String(a.id) === exact ? 50 : score(jetons, motsDe([a.name, a.restrictionName].join(' ')), norm(a.name || ''), requete);
                if (s && a.geometry) out.push({ g: 'rda', k: 'rda', label: a.name || t('kRda') + ' ' + a.id, sub: [a.restrictionName, 'ID ' + a.id].filter(Boolean).join(' · '), score: s,
                    cible: cibleCalque(a.geometry, 'restrictedDrivingArea', a, 15), geo: [a.geometry] });
            }
            for (const c of ix.commentaires) {
                const conv = (c.conversation || []).map(x => x && (x.text || x.body || '')).filter(Boolean);
                const s = String(c.id) === exact ? 50 : score(jetons, motsDe([c.subject, c.body, ...conv].join(' ')), norm(c.subject || ''), requete);
                if (s && c.geometry) out.push({ g: 'note', k: 'comment', label: c.subject || t('kComment'), sub: String(c.body || '').replace(/\s+/g, ' ').slice(0, 90), extrait: conv.join(' · ').slice(0, 300), score: s,
                    cible: cibleCalque(c.geometry, 'mapComment', c, 18), geo: [c.geometry] });
            }
            const textes = o => typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(textes) : o && typeof o === 'object' ? Object.values(o).flatMap(textes) : [];
            for (const v of ix.virages) {
                const de = segParId.get(v.fromSegmentId), vers = segParId.get(v.toSegmentId);
                if (!de || !de.geometry) continue;
                const mots = [...new Set(textes(v.turnGuidance).map(x => x.replace(/^[\s:;,.]+/, '').trim()).filter(Boolean))];
                if (!mots.length) continue;
                const s = score(jetons, motsDe(mots.join(' ')), norm(mots[0]), requete);
                if (!s) continue;
                // Le nœud du virage : l'extrémité du segment de départ dans le sens du trajet.
                const pts = de.geometry.coordinates, n = v.fromSegmentFwd ? pts[pts.length - 1] : pts[0];
                out.push({ g: 'iga', k: 'iga', label: mots.join(' · '), sub: fleche(nomRue(de) || t('noName'), nomRue(vers) || t('noName')), score: s,
                    cible: { lon: n[0], lat: n[1], zoom: 19, sel: { objectType: 'segment', ids: [v.fromSegmentId] } },
                    geo: [de.geometry, vers && vers.geometry, { type: 'Point', coordinates: n }].filter(Boolean) });
            }
        }
        return out;
    }

    // « 12 rue clapies », « rue clapies 12 », « 12bis, rue … » : les numéros des voies trouvées,
    // demandés au SDK pour leurs seuls segments, et gardés le temps de la session.
    // Les numéros (HN) de segments, demandés au SDK par lots de 100 et gardés le temps de la session.
    // Vidé à chaque ouverture et à chaque enregistrement (audit n° 4 : un numéro qu'on venait d'ajouter
    // restait « absent » jusqu'au rechargement de la page).
    const numerosCache = new Map();
    async function numerosDe(ids) {
        const manquants = ids.filter(id => !numerosCache.has(id));
        for (let k = 0; k < manquants.length; k += 100) {
            const lot = manquants.slice(k, k + 100);
            const hn = await sdk.DataModel.HouseNumbers.fetchHouseNumbers({ segmentIds: lot });
            for (const id of lot) numerosCache.set(id, []);
            for (const h of hn || []) (numerosCache.get(h.segmentId) || numerosCache.set(h.segmentId, []).get(h.segmentId)).push(h);
        }
    }
    // « 12 », « 12bis », « 12 b », « 123-45 » (Queens), « 12/A » (Italie, Espagne) — audit n° 10.
    // Une lettre détachée n'est prise que seule (« 12 b ») : « 12 rue » n'est pas un numéro.
    const NUM_SRC = String.raw`\d{1,6}(?:[-/]\d{1,4}[a-z]?|[-/][a-z]{1,2}\b|\s?(?:bis|ter|quater)\b|[a-z]{1,2}\b|\s[a-z]\b)?`;
    const NUMERO = new RegExp('^(' + NUM_SRC + ')$', 'i');
    // « 12 », « 12bis », « 12 b » : la valeur pour trier (12) et la forme pour comparer (« 12bis »).
    const valeurNumero = n => { const m = /^(\d+)\s*(.*)$/.exec(String(n).trim()); return m ? +m[1] + (m[2] ? 0.5 : 0) : Infinity; };
    const formeNumero = n => norm(n).replace(/\s/g, '');
    const ligneNumero = (h, v, s, score, ordre) => ({ g: 'address', k: 'address', label: h.number + ' ' + v.nom, sub: v.ville || t('noCity'), score, ordre,
        cible: { lon: h.geometry.coordinates[0], lat: h.geometry.coordinates[1], zoom: 19, sel: { objectType: 'segment', ids: [s.id] } }, geo: [h.geometry, s.geometry] });

    // « 12 rue clapies », « rue clapies 12 » : ce numéro sur les voies trouvées (partout).
    // Dans l'onglet Numéros seulement (demande de l'auteur, 30/10/2026) :
    //  · une voie seule ⇒ tous ses numéros, dans l'ordre — on voit d'un coup ce qui manque ;
    //  · un numéro seul ⇒ ce numéro sur toutes les voies chargées.
    // Rien trouvé : le tableau rendu porte la RAISON (`raison`), affichée sous la liste.
    async function chercherNumeros(q, filtre) {
        if (filtre !== 'all' && filtre !== 'address') return [];
        const s = q.trim(), onglet = filtre === 'address';
        let numero = null, reste = null, m = new RegExp('^(' + NUM_SRC + ')\\s*,?\\s+(.{2,})$', 'i').exec(s);
        if (m) { numero = m[1]; reste = m[2]; }
        else if ((m = new RegExp('^(.{2,}?)\\s*,?\\s+(' + NUM_SRC + ')$', 'i').exec(s))) { reste = m[1]; numero = m[2]; }
        else if (onglet && NUMERO.test(s)) numero = s;
        else if (onglet) reste = s;
        else return [];
        const avecRaison = (l, r) => Object.assign(l, { raison: l.length ? null : r });
        const cherche = numero && formeNumero(numero);
        const correspond = h => { const n = formeNumero(h.number); return n === cherche || (n.startsWith(cherche) && !/\d/.test(n.slice(cherche.length))); };

        if (!reste) {
            // Un numéro seul : toutes les voies chargées qui ont des numéros.
            const ix = await lireIndex();
            const avec = ix.voies.map(v => ({ v, segs: v.segs.filter(x => x.hasHouseNumbers) })).filter(x => x.segs.length);
            // Les 300 segments numérotés les plus proches au plus (audit n° 31) ; une erreur LÈVE.
            const c = (await centreCarte()) || [0, 0];
            const proches = avec.flatMap(x => x.segs).sort((a, b) => metres(c, centreDe(a.geometry) || c) - metres(c, centreDe(b.geometry) || c)).slice(0, 300).map(x => x.id);
            await numerosDe([...new Set(proches)]);
            const out = [];
            for (const { v, segs } of avec) for (const x of segs) for (const h of numerosCache.get(x.id) || []) if (correspond(h)) out.push(ligneNumero(h, v, x, formeNumero(h.number) === cherche ? 10 : 8));
            return avecRaison(out, t('hnNumberNowhere', numero.trim()));
        }

        const voies = (await chercherLocal(reste, 'street')).filter(r => r.g === 'street').sort((a, b) => b.score - a.score).slice(0, 4);
        if (!voies.length) return onglet ? avecRaison([], t('hnNoStreet', reste)) : [];
        const ids = [...new Set(voies.flatMap(v => v.voie.segs.filter(x => x.hasHouseNumbers).map(x => x.id)))];
        await numerosDe(ids.slice(0, 300));
        const out = [];
        voies.forEach((v, rang) => {
            for (const x of v.voie.segs) for (const h of numerosCache.get(x.id) || []) {
                if (numero && !correspond(h)) continue;
                // Tous les numéros d'une voie : dans l'ordre de la voie la mieux trouvée, puis par numéro.
                out.push(ligneNumero(h, v.voie, x, v.score + (numero ? (formeNumero(h.number) === cherche ? 5 : 3) : 0), numero ? undefined : rang * 1e6 + valeurNumero(h.number)));
            }
        });
        if (out.length || !onglet) return out;
        const nom = voies[0].voie.nom;
        return avecRaison(out, numero ? t('hnNoNumber', numero.trim(), nom) : t('hnNone', nom));
    }

    // ③ Google Places, par la nouvelle API (AutocompleteSuggestion) de la bibliothèque déjà chargée
    // par WME. Un jeton de session regroupe les frappes et la sélection en une seule session.
    let jetonGoogle = null;
    const googleCache = new Map();
    async function chercherGoogle(q, filtre, centre) {
        if (!opts.google || (filtre !== 'all' && filtre !== 'google')) return [];
        const P = pw.google && pw.google.maps && pw.google.maps.places;
        if (!P || !P.AutocompleteSuggestion) { logUneFois('gplaces', 'Google Places absent de la page'); return []; }
        // Une relance (déplacement de la carte, complément) ne refait pas l'appel : cache par saisie et
        // centre arrondi au centième de degré (audit n° 30).
        const cleG = q + '|' + centre.map(x => x.toFixed(2)).join(',');
        const dejaG = lireCache(googleCache, cleG);
        // Google compte distanceMeters depuis l'origine de l'appel : servie depuis un autre point du même
        // carré (jusqu'à 1,4 km), la distance serait fausse — on la retire (audit 0.07 n° 6).
        if (dejaG) return metres(dejaG.origine, centre) > BOUGE_M ? dejaG.lg.map(x => Object.assign({}, x, { dist: null })) : dejaG.lg;
        if (!jetonGoogle) jetonGoogle = new P.AutocompleteSessionToken();
        const r = await P.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: q, sessionToken: jetonGoogle, language: _lang,
            locationBias: { lat: centre[1], lng: centre[0] }, origin: { lat: centre[1], lng: centre[0] },
        });
        const lg = (r.suggestions || []).filter(s => s.placePrediction).map((s, i) => {
            const p = s.placePrediction;
            return { g: 'google', k: 'google', label: p.mainText ? p.mainText.text : p.text.text, sub: p.secondaryText ? p.secondaryText.text : '',
                score: 50 - i, dist: p.distanceMeters != null ? p.distanceMeters : null, google: p,
                // Une suggestion Google EST un lieu Google : Alt+Entrée et « G » ouvrent sa fiche.
                gp: p.placeId || null, gpLu: true };
        });
        ecrireCache(googleCache, cleG, { origine: centre.slice(), lg });
        return lg;
    }

    // ④ Discuss : le forum est sur le même site que WME (www.waze.com/discuss), sa recherche
    // Discourse répond donc à la page, avec la session de l'éditeur — on voit ce qu'il voit.
    // Mesuré le 30/10/2026 : « fermetures hivernales » = 33 sujets, 2,2 s. Discourse limite le
    // nombre de recherches : départ après 450 ms sans frappe, 3 caractères au moins, une requête
    // en vol à la fois (la précédente est annulée), et chaque réponse est gardée le temps de la session.
    // Caches de session BORNÉS (audit n° 4 et 52) : 3 minutes, 30 entrées au plus — un MTE qu'on vient
    // de créer, un sujet qu'on vient d'ouvrir, apparaissent sans recharger la page.
    const CACHE_MS = 3 * 60e3, CACHE_MAX = 30;
    const lireCache = (m, k) => { const e = m.get(k); if (!e) return undefined; if (Date.now() - e.t > CACHE_MS) { m.delete(k); return undefined; } return e.v; };
    const ecrireCache = (m, k, v) => { m.set(k, { t: Date.now(), v }); while (m.size > CACHE_MAX) m.delete(m.keys().next().value); };
    const discussCache = new Map();
    let discussAbandon = null, discussEnVol = null;
    async function chercherDiscuss(q, filtre) {
        if (!opts.discuss || (filtre !== 'all' && filtre !== 'discuss') || q.length < 3 || q.startsWith('@')) return [];
        let j = lireCache(discussCache, q);
        if (!j) {
            // La même recherche déjà en vol n'est pas annulée (audit n° 30 : une relance l'annulait 2 ou 3 fois).
            if (discussEnVol && discussEnVol.q === q) j = await discussEnVol.p;
            else {
                if (discussAbandon) discussAbandon.abort();
                discussAbandon = new AbortController();
                const signal = discussAbandon.signal;
                const p = (async () => {
                    const r = await fetch('/discuss/search.json?q=' + encodeURIComponent(q), { credentials: 'same-origin', headers: { Accept: 'application/json' }, signal });
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })();
                discussEnVol = { q, p };
                try { j = await p; } finally { if (discussEnVol && discussEnVol.p === p) discussEnVol = null; }
                ecrireCache(discussCache, q, j);
            }
        }
        const cats = new Map(((j.categories || [])).map(c => [c.id, c.name]));
        const extraits = new Map();
        for (const p of j.posts || []) if (!extraits.has(p.topic_id) && p.blurb) extraits.set(p.topic_id, p.blurb);
        return (j.topics || []).map((tp, i) => ({
            g: 'discuss', k: 'discuss', label: tp.title || tp.fancy_title || '#' + tp.id,
            sub: [cats.get(tp.category_id), t('discussPosts', tp.posts_count || 1), dateTxt(Date.parse(tp.last_posted_at || tp.created_at))].filter(Boolean).join(' · '),
            extrait: extraits.get(tp.id) || '', score: 30 - i * 0.1,
            lien: location.origin + '/discuss/t/' + encodeURIComponent(tp.slug || 'topic') + '/' + tp.id,
        }));
    }

    // =====================================================================
    //  Évènements — fermetures et UR autour de la carte, MTE par le serveur
    // =====================================================================

    // Mesuré à Paris le 30/10/2026 (Features, `roadClosures=true`) : ±0,3° = 10 701 fermetures, 12 Mo,
    // 3,1 s ; ±0,1° = 5 312, 6,1 Mo, 1,1 s — dont 96 % TERMINÉES, que le service rend quand même.
    // Les UR (Features SANS `apiV2`) plafonnent à 500 : au-delà, on en perdrait sans le savoir.
    // D'où : fermetures sur ±0,1° (≈ 8 km de chaque côté), UR sur un rayon qui rétrécit tant que le serveur plafonne,
    // chacune affichée dès qu'elle arrive ; les commentaires des UR se chargent ENSUITE, en arrière-plan
    // (la v0.04 attendait tous les commentaires — 7 lots à Paris — avant de rien montrer).
    // Une lecture vaut 10 minutes, tant que la VUE tient dans le rectangle réellement lu (audit n° 2 :
    // le cache se disait valable à 15 km du centre alors que ±0,1° ne couvre que ≈ 8 km de chaque côté,
    // et ±0,04° pour les UR à Paris ≈ 3 km). Une vue plus large que le rectangle (dézoom) le réutilise
    // tant que son centre reste dans la moitié centrale du rectangle.
    const R_FERMETURES = 0.1, R_UR = [0.3, 0.15, 0.075, 0.04], UR_PLAFOND = 500, LARGE_MS = 6e5;
    const kmFermetures = () => Math.round(R_FERMETURES * 0.72 * 111);
    const memo = { fermetures: null, ur: null };
    let rayonUr = R_UR[0];
    const promesses = { fermetures: null, ur: null };
    const rectangle = (c, d) => [c[0] - d, c[1] - d * 0.72, c[0] + d, c[1] + d * 0.72].map(x => x.toFixed(5)).join(',');
    const rect = (c, d) => [c[0] - d, c[1] - d * 0.72, c[0] + d, c[1] + d * 0.72];
    function couvre(m, vue, c) {
        if (!m || Date.now() - m.t >= LARGE_MS) return false;
        const b = m.bbox;
        if (vue && vue[0] >= b[0] && vue[1] >= b[1] && vue[2] <= b[2] && vue[3] <= b[3]) return true;
        const qx = (b[2] - b[0]) / 4, qy = (b[3] - b[1]) / 4;
        return !!(vue && vue[2] - vue[0] > b[2] - b[0] && c[0] > b[0] + qx && c[0] < b[2] - qx && c[1] > b[1] + qy && c[1] < b[3] - qy);
    }
    async function vueCarte() { try { return await sdk.Map.getMapExtent(); } catch (e) { return null; } }

    async function centreCarte() { try { const c = await sdk.Map.getMapCenter(); return [c.lon, c.lat]; } catch (e) { return null; } }

    // Une lecture en échec LÈVE (audit n° 1) : la source passe en panne, au lieu de rendre une lecture
    // d'un autre centre ou rien du tout, que la liste aurait présentées comme « rien trouvé ».
    async function lireFermeturesLarges() {
        const c = await centreCarte(), vue = await vueCarte();
        if (!c) throw new Error('carte illisible');
        if (couvre(memo.fermetures, vue, c)) return memo.fermetures;
        if (promesses.fermetures) return promesses.fermetures;
        promesses.fermetures = (async () => {
            try {
                const b = rect(c, R_FERMETURES);
                const r = await fetch(descartes() + '/app/Features?bbox=' + b.map(x => x.toFixed(5)).join(',') + '&language=en&v=2&apiV2=true&roadClosures=true&zoomLevel=12', { credentials: 'same-origin' });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const j = await r.json();
                memo.fermetures = { bbox: b, t: Date.now(), rc: (j.roadClosures && j.roadClosures.objects) || [] };
                return memo.fermetures;
            } finally { promesses.fermetures = null; }
        })();
        return promesses.fermetures;
    }

    async function lireUrLarges() {
        const c = await centreCarte(), vue = await vueCarte();
        if (!c) throw new Error('carte illisible');
        if (couvre(memo.ur, vue, c)) return memo.ur;
        if (promesses.ur) return promesses.ur;
        promesses.ur = (async () => {
            try {
                // On repart du dernier rayon qui suffisait (inutile de relire ±0,3° à Paris à chaque fois).
                let urs = [], rayon = rayonUr;
                for (rayon of R_UR.filter(x => x <= rayonUr)) {
                    const r = await fetch(descartes() + '/app/Features?bbox=' + rect(c, rayon).map(x => x.toFixed(5)).join(',') + '&language=en&mapUpdateRequestFilter=1&problemFilter=0', { credentials: 'same-origin' });
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    const j = await r.json();
                    urs = (j.mapUpdateRequests && j.mapUpdateRequests.objects) || [];
                    if (urs.length < UR_PLAFOND) break;
                }
                // Encore 500 au plus petit rayon : la liste est TRONQUÉE, et on le dira (audit n° 2).
                memo.ur = { bbox: rect(c, rayon), t: Date.now(), rayon, urs, sessions: new Map(), plafonne: urs.length >= UR_PLAFOND };
                // Peu d'UR : la prochaine lecture pourra repartir plus large.
                rayonUr = urs.length < UR_PLAFOND / 4 ? R_UR[0] : rayon;
                commentairesUr(memo.ur);   // en arrière-plan : la liste est utilisable tout de suite
                return memo.ur;
            } finally { promesses.ur = null; }
        })();
        return promesses.ur;
    }

    // Les commentaires, par lots de 80 (≈ 0,16 s le lot) ; à leur arrivée, la recherche en cours est relancée.
    async function commentairesUr(m) {
        for (let k = 0; k < m.urs.length; k += 80) {
            try {
                const r = await fetch(descartes() + '/app/MapProblems/UpdateRequests?ids=' + m.urs.slice(k, k + 80).map(u => u.id).join(','), { credentials: 'same-origin' });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const j = await r.json();
                for (const [cle, v] of Object.entries(j)) if (cle !== 'users') for (const s of (v && v.objects) || []) m.sessions.set(s.id, s);
            } catch (e) {
                // L'échec se DIT (note sous la liste) et la lecture sera retentée : sans quoi une recherche sur le
                // texte d'une conversation répondait « rien » pendant 10 min (audit 0.07 n° 7). Retentée à la
                // prochaine ouverture (pas tout de suite : une panne durable bouclerait).
                logUneFois('urdet', 'commentaires des UR : ' + e.message);
                m.comErr = true;
                if (memo.ur === m && ouverte && champ.value.trim()) relancer();
                return;
            }
        }
        if (memo.ur === m && ouverte && champ.value.trim()) relancer();
    }

    // Les libellés de types (UR, catégories de MTE, permanent hazards) : ceux qu'on connaît sont
    // traduits ; un type inconnu s'affiche tel quel, mis en forme (« LANE_CLOSED » → « Lane closed »).
    const enClair = s => { s = String(s || '').replace(/_/g, ' ').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
    const libelleType = (table, code) => { const v = (DICO[_lang] && DICO[_lang][table]) || DICO.en[table]; return (v && v[code]) || enClair(code); };
    const statutFermeture = c => { const s = String(c.closureStatus || c.status || ''); return /^FINISHED/.test(s) ? t('stFinished') : s === 'ACTIVE' ? t('stActive') : s === 'NOT_STARTED' ? t('stPlanned') : ''; };
    const nomMte = m => { const n = m.names || []; const v = n.find(x => x.locale && x.locale.slice(0, 2) === _lang.slice(0, 2)) || n[0]; return (v && v.value) || m.uniqueName || t('kMte'); };
    const jourTxt = d => { const x = Date.parse(String(d || '').replace(' ', 'T')); return isFinite(x) ? dateTxt(x) : ''; };
    // Date et heure dans la langue de l'éditeur (les fermetures s'affichaient en ISO brut, audit n° 34).
    const dateHeureTxt = d => {
        const x = Date.parse(String(d || '').replace(' ', 'T'));
        return isFinite(x) ? formatIntl('DateTimeFormat', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(x)) : String(d || '');
    };
    const periode = (a, b, heure) => { const f = heure ? dateHeureTxt : jourTxt; const x = a ? f(a) : '', y = b ? f(b) : ''; return x && y ? fleche(x, y) : x || y; };

    // ⑤ Fermetures et UR. Une fermeture se cherche par son motif, sa source, la voie de son segment
    // (si WME l'a chargé), son statut ou son ID ; une UR par son type, sa description, le texte de
    // ses commentaires ou son ID.
    // Appelée une fois par sorte (« closure » ou « ur ») : chacune a son propre état, en vol ou en panne.
    async function chercherEvenements(q, filtre, quoi) {
        const veutF = quoi === 'closure' && (filtre === 'all' || filtre === 'closure'), veutU = quoi === 'ur' && (filtre === 'all' || filtre === 'ur');
        if (!veutF && !veutU) return [];
        const requete = norm(q), jetons = requete.split(' ').filter(Boolean);
        if (!jetons.length) return [];
        const exact = q.trim(), out = [];
        const [F, U, ix] = await Promise.all([veutF ? lireFermeturesLarges() : null, veutU ? lireUrLarges() : null, lireIndex()]);
        const segParId = new Map(ix.segs.map(s => [s.id, s]));
        if (F) {
            // Une fermeture posée sur plusieurs segments, ou dans les deux sens, arrive en autant d'objets :
            // même motif, mêmes dates, même source = UNE ligne, qui sélectionne tous ses segments.
            const lots = new Map();
            for (const c of F.rc) {
                const seg = segParId.get(c.segID), r = seg && ix.rueParId.get(seg.primaryStreetId);
                const voie = r && !r.isEmpty ? r.name : '';
                const statut = statutFermeture(c);
                const texte = [c.reason, c.provider, voie, statut].filter(Boolean).join(' ');
                const s = String(c.id) === exact || String(c.segID) === exact ? 50 : score(jetons, motsDe(texte), norm(c.reason || voie), requete);
                if (!s) continue;
                const geo = c.geometry && c.geometry.type ? c.geometry : seg && seg.geometry;
                const cle = [c.reason, c.startDate, c.endDate, c.provider, statut].join('|');
                let l = lots.get(cle);
                if (!l) lots.set(cle, l = { c, statut, s, voies: new Set(), segs: new Set(), geos: [] });
                l.s = Math.max(l.s, s);
                if (voie) l.voies.add(voie);
                l.segs.add(c.segID);
                if (geo) l.geos.push(geo);
            }
            for (const l of lots.values()) {
                const c = l.c, b = emprise(l.geos), voies = [...l.voies];
                const quand = periode(c.startDate, c.endDate, true);
                out.push({ g: 'closure', k: 'closure', label: c.reason || voies[0] || t('kClosure') + ' ' + c.id,
                    sub: [l.statut, quand, c.provider, voies.slice(0, 2).join(', ') + (voies.length > 2 ? '…' : ''), t('nSeg', l.segs.size)].filter(Boolean).join(' · '),
                    // Une fermeture terminée passe après celles en cours ou programmées.
                    score: l.s - (/^FINISHED/.test(String(c.closureStatus || '')) ? 1 : 0), geo: l.geos.slice(0, 300),
                    cible: b ? { lon: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, bbox: b, zoomMin: 15, sel: { objectType: 'segment', ids: [...l.segs] } } : null, inerte: !b });
            }
        }
        if (U) for (const u of U.urs) {
            const sess = U.sessions.get(u.id), coms = ((sess && sess.comments) || []).map(x => x.text).filter(Boolean);
            const type = libelleType('urTypes', u.type);
            const s = String(u.id) === exact ? 50 : score(jetons, motsDe([type, u.description, ...coms].join(' ')), norm(u.description || type), requete);
            if (!s) continue;
            const pt = u.geometry && u.geometry.coordinates;
            if (!pt) continue;
            // Le commentaire qui correspond, en infobulle : c'est souvent lui qu'on cherchait.
            const com = coms.find(x => jetons.every(j => norm(x).includes(j))) || coms[coms.length - 1] || '';
            out.push({ g: 'ur', k: 'ur', label: type + (u.description ? ' — ' + u.description : ''), idTxt: String(u.id),
                sub: [u.open ? t('urOpen') : t('urClosed'), u.driveDate ? dateTxt(u.driveDate) : '', coms.length ? t('urComments', coms.length) : ''].filter(Boolean).join(' · '),
                extrait: com, score: s + (u.open ? 0.5 : 0), geo: [u.geometry], cible: { lon: pt[0], lat: pt[1], zoom: 18 } });
        }
        if (U && U.plafonne) out.note = t('urCapped', UR_PLAFOND);
        if (U && U.comErr) out.note = [out.note, t('urNoComments')].filter(Boolean).join(' · ');
        return out;
    }

    // ⑧ Les entreprises françaises (demande de l'auteur, 30/10/2026) : l'API Recherche d'entreprises de
    // l'État (recherche-entreprises.api.gouv.fr, données Sirene de l'INSEE, sans clé). SEULEMENT quand la
    // carte est en France. Mesuré le 30/10/2026 :
    //  · la recherche nationale classe mal (« boulangerie montpellier » ⇒ Châteaurenard en tête) ; filtrée
    //    par DÉPARTEMENT elle est juste (Paul au Polygone, Boulangerie du Coin…), et chaque établissement
    //    porte adresse et coordonnées ;
    //  · `near_point` refuse un texte (400) mais, sans texte, rend les établissements autour d'un point :
    //    le premier donne le code commune, donc le département — et son absence dit « pas en France ».
    //    Rayon de 2 km : à 5 km, le centre de Genève trouvait la Haute-Savoie ; à 2 km, rien, alors que la
    //    Lozère rurale, la haute Maurienne et la pointe du Finistère répondent encore.
    // La CSP de WME interdit fetch vers un autre domaine : GM_xmlhttpRequest, avec son @connect.
    const API_ENT = 'https://recherche-entreprises.api.gouv.fr';
    const gmJson = url => new Promise((res, rej) => {
        if (typeof GM_xmlhttpRequest !== 'function') { rej(new Error('GM_xmlhttpRequest absent')); return; }
        GM_xmlhttpRequest({
            method: 'GET', url, timeout: 8000, headers: { Accept: 'application/json' },
            onload: r => {
                if (r.status < 200 || r.status >= 300) { rej(new Error('HTTP ' + r.status)); return; }
                try { res(JSON.parse(r.responseText)); } catch (e) { rej(e); }
            },
            onerror: () => rej(new Error('réseau')), ontimeout: () => rej(new Error('délai')),
        });
    });
    // Un premier tri sans réseau : la métropole et la Corse, les cinq DROM. Le département tranche ensuite.
    const EMPRISES_FR = [[-5.3, 41.3, 9.7, 51.2], [-61.9, 15.8, -61.0, 16.6], [-61.3, 14.3, -60.8, 14.9],
        [-54.7, 2.0, -51.5, 5.9], [55.1, -21.5, 55.9, -20.8], [44.9, -13.1, 45.4, -12.6]];
    const enFranceGrossier = c => EMPRISES_FR.some(b => c[0] >= b[0] && c[0] <= b[2] && c[1] >= b[1] && c[1] <= b[3]);
    const dansRect = (c, b) => c[0] >= b[0] && c[0] <= b[2] && c[1] >= b[1] && c[1] <= b[3];
    // « En France seulement » doit être VRAI (audit 0.07 n° 4) : le rectangle de la métropole couvre aussi
    // Barcelone, Bruxelles, Zurich, Milan et Monaco. Dans ce rectangle, le pays de la carte est demandé au
    // SDK (`Countries.getTopCountry()`, mesuré le 01/11/2026 : `abbr: 'FR'` à Montpellier) ; les DROM ont
    // des rectangles sans voisin. Pays inconnu ⇒ rien n'est envoyé.
    async function carteEnFrance(c) {
        if (!c || !enFranceGrossier(c)) return false;
        if (!dansRect(c, EMPRISES_FR[0])) return true;
        try { const p = await sdk.DataModel.Countries.getTopCountry(); return !!p && p.abbr === 'FR'; } catch (e) { return false; }
    }
    // La position envoyée est arrondie à 0,01° (≈ 1 km) : assez pour trouver le département dans un rayon de
    // 2 km, sans livrer le point exact (audit 0.07 n° 4 ; le centre de la maille de 0,05° pouvait tomber à
    // 3,9 km du point et fabriquer de faux « hors de France »).
    const departements = new Map();    // position arrondie (≈ 1 km) → code du département
    async function departementDe(c) {
        if (!(await carteEnFrance(c))) return null;
        const arr = c.map(x => Math.round(x * 100) / 100), cle = arr.map(x => x.toFixed(2)).join(',');
        if (departements.has(cle)) return departements.get(cle);
        const j = await gmJson(API_ENT + '/near_point?lat=' + arr[1].toFixed(2) + '&long=' + arr[0].toFixed(2) + '&radius=2&per_page=1');
        const r = (j.results || [])[0], m = r && ((r.matching_etablissements || [])[0] || r.siege);
        const commune = m && String(m.commune || '');
        const dep = /^97\d/.test(commune) ? commune.slice(0, 3) : /^(\d{2}|2[AB])/.test(commune) ? commune.slice(0, 2) : null;
        // Un « inconnu » (étang, littoral) n'est PAS mis en mémoire : il resterait faux toute la session.
        if (dep) departements.set(cle, dep);
        return dep;
    }
    // Les noms arrivent en CAPITALES : « Mcdonald'S », « Sncf », « Rue De La » (audit 0.07 n° 25) ⇒ pas de
    // majuscule après « 's », mots outils en minuscules (sauf en tête), sigles sans voyelle gardés.
    const MOTS_OUTILS = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'sur', 'au', 'aux', 'a', 'à', 'd', 'l', 'par', 'pour']);
    const casse = a => String(a || '').toLowerCase().replace(/[\p{L}\p{N}]+/gu, (mot, i, tout) => {
        const avant = tout[i - 1] || '';
        if (/['’]/.test(avant) && mot === 's') return mot;
        if (mot.length >= 2 && !/[aeiouyàâäéèêëîïôöùûüÿœæ\d]/.test(mot)) return mot.toUpperCase();
        if (i > 0 && MOTS_OUTILS.has(mot) && !/[(\-/]/.test(avant)) return mot;
        return mot.charAt(0).toUpperCase() + mot.slice(1);
    });
    const SIRET_RE = /^\d{14}$/, SIREN_RE = /^\d{9}$/;
    const groupeSiret = s => String(s).replace(/^(\d{3})(\d{3})(\d{3})(\d{5})?$/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join(' '));
    const entreprisesCache = new Map();
    async function chercherEntreprises(q, filtre, centre) {
        if (!opts.entreprises || (filtre !== 'all' && filtre !== 'venue') || q.startsWith('@')) return [];
        const brut = q.replace(/\s/g, '');
        // Un SIRET (14 chiffres) ou un SIREN (9) se cherche partout, SANS position : il est testé avant
        // tout appel de localisation (audit 0.07 n° 4 et 15).
        const numero = SIRET_RE.test(brut) || SIREN_RE.test(brut);
        if (!numero && q.trim().length < 3) return [];
        const dep = numero ? null : await departementDe(centre);
        if (!dep && !numero) {
            // En France mais département introuvable : on le dit dans l'onglet Lieux (sinon « rien » sans raison).
            const out = [];
            if (filtre === 'venue' && centre && enFranceGrossier(centre) && opts.entreprises) out.note = t('coNoDept');
            return out;
        }
        const url = API_ENT + '/search?q=' + encodeURIComponent(numero ? brut : q.trim()) + (dep ? '&departement=' + dep : '') + '&per_page=10';
        let j = lireCache(entreprisesCache, url);
        if (!j) { j = await gmJson(url); ecrireCache(entreprisesCache, url, j); }
        const requete = norm(q), jetons = requete.split(' ').filter(Boolean);
        const out = [];
        for (const r of j.results || []) {
            // Par numéro, un établissement FERMÉ est montré (et dit fermé) : le cacher faisait croire à un
            // numéro inconnu. Par nom, seuls les établissements actifs.
            const tous = (r.matching_etablissements && r.matching_etablissements.length ? r.matching_etablissements : [r.siege]).filter(Boolean);
            const ets = numero ? tous : tous.filter(m => m.etat_administratif === 'A');
            for (const m of ets.slice(0, 3)) {
                const lat = parseFloat(m.latitude), lon = parseFloat(m.longitude);
                if (!coordOk(lat, lon)) continue;
                const enseigne = (m.liste_enseignes || [])[0] || m.nom_commercial || '';
                const nom = casse(enseigne || r.nom_complet);
                // Un nom se note comme ailleurs, l'adresse en contexte ; sans aucun mot commun, la société
                // tombe (audit 0.07 n° 14 : `|| 1` gardait des sociétés trouvées par leurs dirigeants).
                const s = numero ? 50 : score(jetons, motsDe(nom + ' ' + (r.nom_complet || '')), norm(nom), requete, motsDe(m.adresse || ''));
                if (!s) continue;
                out.push({ g: 'company', k: 'company', label: nom, score: s,
                    sub: [enseigne && casse(r.nom_complet) !== nom ? casse(r.nom_complet) : '', casse(m.adresse), 'SIRET ' + groupeSiret(m.siret),
                        m.etat_administratif !== 'A' ? t('coClosed') : ''].filter(Boolean).join(' · '),
                    cible: { lon, lat, zoom: 18 }, geo: [{ type: 'Point', coordinates: [lon, lat] }] });
            }
        }
        return out;
    }

    // ⑨ Les lieux Waze PARTOUT, par leur nom (demande de TxAgBQ sur Discuss, 01/11/2026 : « trouver le
    // lieu Waze » d'une UR qui porte sur un lieu). L'index ne connaît que les lieux autour de l'écran ;
    // la barre de recherche de WME, elle, interroge le service gRPC-web `searchLocations` du serveur de
    // l'éditeur (même site, session de l'éditeur, aucun tiers). Mesuré le 01/11/2026 (WME, Montpellier) :
    //  · requête = message { 1: texte, 2: { 1: 0, 2: { 1: lon, 2: lat } } }, en grpc-web-text (base64) ;
    //  · réponse = 10 résultats au plus, champ 1 répété : { 2: ID, 3: nom, 4: { 2: { 1: lon, 2: lat } },
    //    5: adresse { 1 rue, 2 ville, 3 numéro, 4 état, 5 pays }, 6: sorte (1 lieu, 2 voie), 7: source
    //    (1 Waze, 2 adresse d'un fournisseur extérieur) } ; l'ID d'un lieu est son vrai ID WME ;
    //  · 0,17 à 0,4 s ; « Musée des Confluences » trouvé à Lyon depuis Montpellier, « mairie ganges »
    //    à 40 km ; un texte sans résultat rend une liste vide (grpc-status 0).
    // Le classement du serveur mêle pertinence et distance (« Times Square » ⇒ « Times Burger ») : les
    // résultats sont donc notés ici comme les lieux de l'index, et ceux qui n'ont pas tous les mots tombent.
    function pbVarint(n) { const o = []; while (n > 127) { o.push((n & 127) | 128); n = Math.floor(n / 128); } o.push(n); return o; }
    const pbChamp = (f, octets) => [...pbVarint((f << 3) | 2), ...pbVarint(octets.length), ...octets];
    const pbDouble = (f, x) => { const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, x, true); return [...pbVarint((f << 3) | 1), ...b]; };
    // Le corps d'une requête `searchLocations`, prêt à envoyer (cadre gRPC-web de 5 octets, puis base64).
    function grpcRequeteRecherche(texte, lon, lat) {
        const point = [...pbDouble(1, lon), ...pbDouble(2, lat)];
        const msg = [...pbChamp(1, [...new TextEncoder().encode(texte)]), ...pbChamp(2, [0x08, 0x00, ...pbChamp(2, point)])];
        const cadre = [0, (msg.length >>> 24) & 255, (msg.length >>> 16) & 255, (msg.length >>> 8) & 255, msg.length & 255, ...msg];
        let s = '';
        for (const x of cadre) s += String.fromCharCode(x);
        return btoa(s);
    }
    // Un message protobuf, champ par champ : [numéro, valeur] ; une valeur « longueur » reste en octets.
    function pbLire(b) {
        const out = [];
        let i = 0;
        const v = () => { let r = 0, s = 0, x; do { if (i >= b.length) throw new Error('protobuf tronqué'); x = b[i++]; r += (x & 127) * 2 ** s; s += 7; } while (x & 128); return r; };
        while (i < b.length) {
            const k = v(), f = Math.floor(k / 8), w = k & 7;
            if (!f) throw new Error('protobuf : champ 0');
            if (w === 0) out.push([f, v()]);
            else if (w === 1) { if (i + 8 > b.length) throw new Error('protobuf tronqué'); out.push([f, new DataView(b.buffer, b.byteOffset + i, 8).getFloat64(0, true)]); i += 8; }
            else if (w === 5) { if (i + 4 > b.length) throw new Error('protobuf tronqué'); out.push([f, new DataView(b.buffer, b.byteOffset + i, 4).getFloat32(0, true)]); i += 4; }
            else if (w === 2) { const l = v(); if (i + l > b.length) throw new Error('protobuf tronqué'); out.push([f, b.subarray(i, i + l)]); i += l; }
            else throw new Error('protobuf : type ' + w);
        }
        return out;
    }
    // La réponse grpc-web-text : des cadres en base64 (chacun avec son propre remplissage « = »).
    // Rend les messages et le statut gRPC lu dans la remorque (cadre marqué 0x80). Mesuré le 01/11/2026 :
    // une réponse NORMALE, même vide, porte « grpc-status:0 » dans sa remorque ; une ERREUR arrive
    // « trailers-only » — corps vide, statut et message dans les EN-TÊTES HTTP (200 + grpc-status 3,
    // « (406) Missing parameter value… ») ⇒ `entetes` les fournit quand la remorque manque.
    function grpcLireReponse(texte, entetes) {
        const octets = [];
        for (const morceau of String(texte || '').replace(/\s/g, '').match(/[A-Za-z0-9+/]+={0,2}/g) || []) {
            const s = atob(morceau);
            for (let k = 0; k < s.length; k++) octets.push(s.charCodeAt(k));
        }
        const b = Uint8Array.from(octets), messages = [];
        const decode = x => { try { return decodeURIComponent(x); } catch (e) { return x; } };
        let p = 0, statut = null, cause = '';
        while (p + 5 <= b.length) {
            const l = ((b[p + 1] << 24) | (b[p + 2] << 16) | (b[p + 3] << 8) | b[p + 4]) >>> 0, corps = b.subarray(p + 5, p + 5 + l);
            if (b[p] & 0x80) {
                const r = new TextDecoder().decode(corps), m = /grpc-status:\s*(\d+)/i.exec(r), c = /grpc-message:\s*([^\r\n]*)/i.exec(r);
                if (m) statut = +m[1];
                if (c) cause = decode(c[1]);
            } else messages.push(corps);
            p += 5 + l;
        }
        if (statut == null && entetes && entetes.statut != null && entetes.statut !== '') {
            statut = +entetes.statut;
            cause = decode(entetes.message || '');
        }
        return { messages, statut, cause };
    }
    // Les LIEUX WAZE d'une réponse `searchLocations` : { id, nom, lon, lat, rue, numero, ville, etat, pays }.
    // `brutes` compte les entrées reçues, `comprises` celles dont la sorte (6) et la source (7) ont une
    // valeur connue : si Waze renumérote ses champs, brutes > 0 et comprises = 0 ⇒ panne VISIBLE, jamais
    // « aucun lieu » en silence (audit 0.07 n° 10). Une entrée illisible n'emporte pas les autres.
    function lieuxDeRecherche(messages) {
        const td = new TextDecoder(), txt = x => x instanceof Uint8Array ? td.decode(x) : '';
        const lieux = [];
        let brutes = 0, comprises = 0;
        for (const m of messages) for (const [f, r] of pbLire(m)) {
            if (f !== 1 || !(r instanceof Uint8Array)) continue;
            brutes++;
            try {
                const o = new Map(pbLire(r));
                if (![1, 2].includes(o.get(6)) || ![1, 2].includes(o.get(7))) continue;
                comprises++;
                if (o.get(6) !== 1 || o.get(7) !== 1) continue;        // un lieu, et de Waze
                const id = txt(o.get(2));
                if (!/^\d+\.\d+\.\d+$/.test(id)) continue;
                let lon = NaN, lat = NaN;
                if (o.get(4) instanceof Uint8Array) {
                    const pt = new Map(pbLire(o.get(4))).get(2);
                    if (pt instanceof Uint8Array) { const c = new Map(pbLire(pt)); lon = c.get(1); lat = c.get(2); }
                }
                const a = o.get(5) instanceof Uint8Array ? new Map(pbLire(o.get(5)).map(([k, v]) => [k, txt(v)])) : new Map();
                lieux.push({ id, nom: txt(o.get(3)), lon, lat, rue: a.get(1) || '', numero: a.get(3) || '', ville: a.get(2) || '', etat: a.get(4) || '', pays: a.get(5) || '' });
            } catch (e) { /* entrée illisible : les autres restent */ }
        }
        return { lieux, brutes, comprises };
    }
    // Les lignes des lieux distants, sans réseau (pure, au banc). Un lieu déjà dans l'index n'est pas
    // répété s'il y est TROUVÉ ; s'il y est mais que la saisie ne le trouve pas (« mairie ganges » à
    // Ganges : la ville n'est pas dans le nom), il est rendu depuis l'index, avec sa catégorie, son
    // rattachement Google et sa case de calque (audit 0.07 n° 2 : il disparaissait, trouvé depuis 40 km).
    function lignesLieuxDistants(lieux, ix, texte) {
        const parId = new Map(ix.lieuxIdx.map(x => [String(x.l.id), x]));
        const requete = norm(texte), jetons = requete.split(' ').filter(Boolean);
        const out = [];
        // Lieux qui contiennent tous les mots, rendus ici OU déjà dans l'index : c'est lui, et non le nombre de
        // lignes, qui dit si le plafond de 10 a pu cacher le bon lieu (vu le 01/11/2026 : la note s'affichait
        // après un saut, tous les lieux étant passés dans l'index).
        out.trouves = 0;
        for (const l of lieux) {
            if (!coordOk(l.lat, l.lon)) continue;
            // La ville compte comme contexte (« mairie ganges »), comme pour les voies.
            const s = score(jetons, motsDe(l.nom), norm(l.nom), requete, motsDe(l.ville));
            if (!s) continue;
            out.trouves++;
            const x = parId.get(l.id);
            if (x) {
                if (!score(jetons, x.mots, x.plein, requete)) out.push(ligneLieu(x, s, jetons));
                continue;
            }
            const rue = l.rue ? (l.numero ? l.numero + ' ' + l.rue : l.rue) : '';
            out.push({ g: 'venue', k: 'venue', label: l.nom || t('kVenue'), sub: [rue, l.ville, l.pays].filter(Boolean).join(', '), score: s,
                cleObj: 'venue:' + l.id, gpLu: false,
                cible: { lon: l.lon, lat: l.lat, zoom: 18, sel: { objectType: 'venue', ids: [l.id] }, calques: calquesPour('venue', {}), repli: REPLI_LIEU },
                geo: [{ type: 'Point', coordinates: [l.lon, l.lat] }] });
        }
        return out;
    }
    const lieuxWazeCache = new Map();
    const LIEUX_DELAI_MS = 8000;
    async function chercherLieuxWaze(q, filtre, centre) {
        const texte = q.trim();
        if ((filtre !== 'all' && filtre !== 'venue') || texte.length < 3 || texte.startsWith('@') || !centre) return [];
        // Le serveur tient compte de la position : le cache est donc par texte ET par endroit (≈ 5 km).
        const cle = texte.toLowerCase() + '|' + centre.map(x => (Math.round(x * 20) / 20).toFixed(2)).join(',');
        let rep = lireCache(lieuxWazeCache, cle);
        if (!rep) {
            // Un serveur qui ne répond pas ne laisse pas « recherche en cours » à vie (audit 0.07 n° 20) :
            // le délai est une PANNE (TimeoutError), pas un abandon silencieux.
            const ctl = new AbortController();
            const minut = setTimeout(() => ctl.abort(new DOMException('délai dépassé', 'TimeoutError')), LIEUX_DELAI_MS);
            let r, corps;
            try {
                r = await fetch(descartes() + '/grpc/com.waze.mapeditor.web.api.MapEditorWebServer/searchLocations', {
                    method: 'POST', credentials: 'same-origin', signal: ctl.signal,
                    headers: { 'content-type': 'application/grpc-web-text', accept: 'application/grpc-web-text', 'x-grpc-web': '1' },
                    body: grpcRequeteRecherche(texte, centre[0], centre[1]),
                });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                corps = await r.text();
            } finally { clearTimeout(minut); }
            const g = grpcLireReponse(corps, { statut: r.headers.get('grpc-status'), message: r.headers.get('grpc-message') });
            // Un statut gRPC non nul — ou ABSENT : une réponse normale le porte toujours — est une panne,
            // jamais « aucun lieu » (audit n° 1) ; rien n'est mis en cache.
            if (g.statut == null) throw new Error('gRPC : statut absent');
            if (g.statut) throw new Error('gRPC ' + g.statut + (g.cause ? ' ' + g.cause : ''));
            rep = lieuxDeRecherche(g.messages);
            if (rep.brutes && !rep.comprises) { logUneFois('grpc-format', 'searchLocations : format de réponse inconnu'); throw new Error('gRPC : format inconnu'); }
            ecrireCache(lieuxWazeCache, cle, rep);
        }
        const out = lignesLieuxDistants(rep.lieux, await lireIndex(), texte);
        // Le service rend 10 résultats au plus : s'il les a tous rendus et qu'aucun ne contient tous les mots,
        // on le dit — seulement dans ce cas, sinon la note serait du bruit permanent (audit 0.07 n° 12).
        if (rep.brutes >= 10 && !out.trouves) out.note = t('venueCapped');
        return out;
    }

    // ⑦ Tous les éditeurs, même sans rien à l'écran (demande de l'auteur, 30/10/2026) : leur profil
    // doit rester accessible. Les comptes Discuss SONT les comptes Waze (même connexion) : la recherche de
    // pseudos de Discuss (`/discuss/u/search/users.json`, par DÉBUT de pseudo, 20 au plus, ≈ 0,2 s,
    // mesuré le 30/10/2026) donne donc les éditeurs. L'API de profil de Waze (`UserProfile/Profile`) n'est
    // pas utilisée : 200 pour un pseudo, 502 pour un autre, le même soir.
    // Onglet Éditeurs et « @… » : la liste ; « Tout » : le seul pseudo EXACT (sinon « jean » ajouterait
    // vingt éditeurs à chaque recherche). Un éditeur déjà à l'écran n'est pas répété.
    const editeursCache = new Map();
    async function chercherEditeursWaze(q, filtre) {
        const arobase = q.startsWith('@'), nom = (arobase ? q.slice(1) : q).trim();
        const liste = filtre === 'editor' || arobase;
        if ((filtre !== 'all' && filtre !== 'editor') || nom.length < 2 || /\s/.test(nom) || (!liste && nom.length < 3)) return [];
        let j = lireCache(editeursCache, nom.toLowerCase());
        if (!j) {
            const r = await fetch('/discuss/u/search/users.json?term=' + encodeURIComponent(nom) + '&include_groups=false&limit=20', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            j = await r.json();
            ecrireCache(editeursCache, nom.toLowerCase(), j);
        }
        const ix = await lireIndex();
        const vus = new Set(editeursALEcran(ix, await vueCarte()).map(e => e.nom.toLowerCase()));
        const bas = nom.toLowerCase();
        const out = [];
        for (const u of (j.users || [])) {
            const n = String(u.username || '');
            if (!n || vus.has(n.toLowerCase())) continue;
            const exact = n.toLowerCase() === bas;
            if (!liste && !exact) continue;
            out.push({ g: 'editor', k: 'editor', label: '@' + n, sub: t('edNoObj'), score: exact ? 6 : 4, editeur: n, profil: true });
        }
        // Le pseudo tapé, s'il n'est ni à l'écran ni dans Discuss (éditeur jamais venu sur le forum) :
        // son profil s'ouvre quand même ; Waze dira s'il n'existe pas.
        // Proposé dès qu'aucun pseudo n'est EXACTEMENT celui-là, en dernier (score 3) : n'exiger « personne ne
        // commence ainsi » rendait inatteignable le profil de « jean » dès qu'un « jeanne » existait (audit
        // 0.07 n° 17).
        const exactQuelquePart = (j.users || []).some(u => String(u.username || '').toLowerCase() === bas) || vus.has(bas);
        if (liste && !exactQuelquePart && /^[\w.\-]{2,}$/.test(nom))
            out.push({ g: 'editor', k: 'editor', label: '@' + nom, sub: t('edTryProfile'), score: 3, editeur: nom, profil: true });
        return out;
    }

    // ⑥ Les MTE, par la liste même du panneau Évènements de WME (`v1/Features/MajorTrafficEvents`) :
    // recherche par NOM côté serveur, sans emprise donc dans le monde entier, passés compris, avec leur
    // polygone. Mesuré le 30/10/2026 : « adidas » = 6 MTE dans le monde, 0,2 s ; « 10k adidas paris » = 1
    // (le 8 juin 2025 — l'emprise des Features, elle, ne rend que les MTE en cours ou à venir).
    // Sans paramètre `categories`, le service rend TOUTES les catégories (mesuré le 30/10/2026 : 9
    // catégories pour « festival ») ; une liste figée en aurait laissé de côté (audit n° 46).
    const mteCache = new Map();
    async function chercherMte(q, filtre) {
        if ((filtre !== 'all' && filtre !== 'mte') || q.length < 3 || q.startsWith('@')) return [];
        // Deux lectures fusionnées : le monde entier (480 au plus, dans un ordre qui n'est pas la distance)
        // et la zone autour de la carte (±0,5° ; au-delà, le serveur répond 406, mesuré). Pour « marathon »,
        // le Marathon de Paris manquait à la liste mondiale, tronquée ; la lecture locale le garantit.
        const c = await centreCarte();
        const lire = async bbox => {
            const cle = q + '|' + (bbox || 'monde');
            const deja = lireCache(mteCache, cle);
            if (deja) return deja;
            const r = await fetch(descartes() + '/app/v1/Features/MajorTrafficEvents?' + (bbox ? 'bbox=' + encodeURIComponent(bbox) + '&' : '') + 'name=' + encodeURIComponent(q) + '&pageSize=480', { credentials: 'same-origin' });
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const j = await r.json();
            const l = (j.majorTrafficEvents && j.majorTrafficEvents.objects) || [];
            ecrireCache(mteCache, cle, l);
            return l;
        };
        // La zone locale est arrondie au quart de degré : un petit déplacement réutilise la lecture.
        const local = c ? rectangle(c.map(x => Math.round(x * 4) / 4), 0.5) : null;
        const [monde, proches] = await Promise.all([lire(null), local ? lire(local).catch(() => []) : []]);
        const vus = new Set(), locaux = new Set(proches.map(m => m.id));
        const l = [...proches, ...monde].filter(m => !vus.has(m.id) && vus.add(m.id));
        const maintenant = Date.now();
        const requete = norm(q), jetons = requete.split(' ').filter(Boolean);
        // Le serveur rend aussi des MTE qui n'ont qu'une partie des mots (« Adidas Split » pour
        // « 10k adidas paris », mesuré) : on garde ceux qui les ont TOUS, notés comme le reste.
        return l.map(m => ({ m, s: score(jetons, motsDe([nomMte(m), m.uniqueName, ...(m.names || []).map(x => x.value)].join(' ')), norm(nomMte(m)), requete) }))
            .filter(x => x.s).map(({ m, s: sc }) => {
            const fin = Date.parse(String(m.endDate || '').replace(' ', 'T'));
            const desc = (m.descriptions || []).find(x => x.locale && x.locale.slice(0, 2) === _lang.slice(0, 2)) || (m.descriptions || [])[0];
            const b = m.geometry ? emprise([m.geometry]) : null;
            // Sans tracé (282 MTE sur 415 autour de Paris, mesuré) : s'il vient de la lecture locale, on sait
            // seulement qu'il est dans les environs ; Entrée le situera par ses fermetures, s'il en a encore.
            const proche = !b && locaux.has(m.id);
            // Classés du plus proche au plus lointain du centre de la carte (demande de l'auteur, 30/10/2026).
            return { g: 'mte', k: 'mte', label: nomMte(m), extrait: desc ? desc.value : '', parDistance: true, proche, mteId: b ? null : m.id, actuel: !(isFinite(fin) && fin < maintenant),
                sub: [libelleType('mteCats', m.category), periode(m.startDate, m.endDate), isFinite(fin) && fin < maintenant ? t('stOver') : '', proche ? t('mteNoShape') : ''].filter(Boolean).join(' · '),
                // Les MTE en cours ou à venir d'abord.
                score: sc + (isFinite(fin) && fin >= maintenant ? 2 : 0), geo: m.geometry ? [m.geometry] : [],
                // Sans tracé, même lointain : Entrée le cherche par ses fermetures (audit n° 27 : la ligne
                // affichait ↵ et ne faisait rien).
                cible: b ? { lon: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, bbox: b, zoomMin: 12 } : null };
        });
    }

    async function cibleGoogle(r) {
        const place = r.google.toPlace();
        await place.fetchFields({ fields: ['location', 'viewport', 'id'] });
        jetonGoogle = null;   // la session se termine par la sélection
        const lon = place.location.lng(), lat = place.location.lat();
        const c = { lon, lat, zoom: 18 };
        if (place.viewport) {
            const v = place.viewport.toJSON();
            if (v.east - v.west > 0.003) c.bbox = [v.west, v.south, v.east, v.north];
        }
        // Un lieu Waze déjà chargé et rattaché à ce lieu Google est sélectionné avec lui.
        try {
            const lie = (await lireIndex()).lieux.find(l => (l.externalProviderIds || []).includes(place.id));
            if (lie) c.sel = { objectType: 'venue', ids: [lie.id] };
        } catch (e) { }
        return c;
    }

    // =====================================================================
    //  Palette — l'interface
    // =====================================================================

    // ⚠️ Pas d'accent grave dans ce bloc : il vit dans un template literal.
    const CSS = `
:root {
    --wos-blue: #2196f3; --wos-blue-btn: #1976d2; --wos-blue-dk: #1565c0; --wos-grey: #9e9e9e;
    --wos-surface: #ffffff; --wos-bg: #f5f7f9; --wos-border: #dde3ea; --wos-hover: #e3f2fd;
    --wos-text: #2d3748; --wos-text2: #566372; --wos-orange: #ef6c00;
    --wos-radius: 12px; --wos-blue-dk2: #0d47a1; --wos-shadow: 0 18px 48px rgba(15,23,42,.28), 0 3px 10px rgba(15,23,42,.14);
}
#wos-pal {
    position: absolute; z-index: 9995; top: 12px; width: 640px; max-width: calc(100vw - 32px);
    display: flex; flex-direction: column; max-height: min(72vh, 640px);
    background: var(--wos-surface); color: var(--wos-text); border: 1px solid var(--wos-border);
    border-radius: var(--wos-radius); box-shadow: var(--wos-shadow); overflow: hidden;
    font-family: 'Rubik','Open Sans',sans-serif; font-size: 13px;
    animation: wos-in .12s ease-out;
}
#wos-pal[hidden], #wos-pal [hidden] { display: none !important; }
/* Fenêtre : déplacée par son en-tête, redimensionnée par ses bords (8 poignées). */
.wos-poignee { position: absolute; z-index: 3; touch-action: none; }
.wos-poignee[data-dir="n"], .wos-poignee[data-dir="s"] { left: 10px; right: 10px; height: 6px; cursor: ns-resize; }
.wos-poignee[data-dir="e"], .wos-poignee[data-dir="w"] { top: 10px; bottom: 10px; width: 6px; cursor: ew-resize; }
.wos-poignee[data-dir="n"] { top: 0; } .wos-poignee[data-dir="s"] { bottom: 0; }
.wos-poignee[data-dir="e"] { right: 0; } .wos-poignee[data-dir="w"] { left: 0; }
.wos-poignee[data-dir="ne"], .wos-poignee[data-dir="nw"], .wos-poignee[data-dir="se"], .wos-poignee[data-dir="sw"] { width: 12px; height: 12px; }
.wos-poignee[data-dir="ne"] { top: 0; right: 0; cursor: nesw-resize; } .wos-poignee[data-dir="sw"] { bottom: 0; left: 0; cursor: nesw-resize; }
.wos-poignee[data-dir="nw"] { top: 0; left: 0; cursor: nwse-resize; } .wos-poignee[data-dir="se"] { bottom: 0; right: 0; cursor: nwse-resize; }
#wos-pal.wos-geste, #wos-pal.wos-geste * { user-select: none !important; }
.wos-tete { cursor: move; }
.wos-tete input { cursor: text; }
.wos-grip { flex-shrink: 0; color: #a0aab4; font-size: 14px; line-height: 1; letter-spacing: -2px; margin-inline-end: -4px; }
.wos-fermer {
    flex-shrink: 0; width: 28px; height: 28px; min-height: 0; margin: 0; padding: 0; border: none; border-radius: 50%;
    background: transparent; color: var(--wos-text2); font-size: 18px; line-height: 28px; cursor: pointer;
}
.wos-fermer:hover { background: var(--wos-bg); color: var(--wos-text); }
.wos-fermer:focus-visible { outline: 2px solid var(--wos-blue); outline-offset: 1px; }
/* Fiche d'un éditeur */
.wos-chev {
    flex-shrink: 0; width: 26px; height: 26px; min-height: 0; margin: 0; padding: 0; border: 1px solid var(--wos-border); border-radius: 50%;
    background: var(--wos-surface); color: var(--wos-text2); font-size: 11px; cursor: pointer;
}
.wos-chev:hover { background: var(--wos-blue-btn); border-color: var(--wos-blue-btn); color: #fff; }
.wos-chev { display: inline-flex; align-items: center; justify-content: center; }
.wos-chev svg { transition: transform .15s; }
.wos-chev[aria-expanded="true"] svg { transform: rotate(90deg); }
#wos-pal[dir="rtl"] .wos-chev[aria-expanded="false"] svg { transform: scaleX(-1); }
.wos-gmap { width: 24px; height: 24px; font: 700 12px/1 Rubik, sans-serif; }
.wos-opt.wos-ed-tete .wos-l1 { color: var(--wos-blue-dk); }
.wos-sec { display: flex; align-items: baseline; gap: 6px; margin: 10px 16px 2px 52px; padding-top: 6px; border-top: 1px solid var(--wos-border); font-size: 12px; font-weight: 700; color: var(--wos-text); }
.wos-sec span, .wos-sous span { font-weight: 400; color: var(--wos-text2); font-variant-numeric: tabular-nums; }
.wos-sous { margin: 4px 16px 0 52px; font-size: 10.5px; font-weight: 700; color: var(--wos-text2); text-transform: uppercase; letter-spacing: .05em; }
.wos-opt.wos-det { margin-inline-start: 46px; padding-top: 4px; padding-bottom: 4px; }
.wos-opt.wos-det .wos-ico { width: 24px; height: 24px; border-radius: 6px; }
.wos-opt.wos-det .wos-l1 { font-size: 12.5px; }
.wos-info { margin: 6px 16px 6px 58px; font-size: 12px; color: var(--wos-text2); }
@keyframes wos-in { from { opacity: 0; transform: translateY(-6px) scale(.985); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { #wos-pal { animation: none; } }
.wos-tete { display: flex; align-items: center; gap: 10px; padding: 0 14px; border-bottom: 1px solid var(--wos-border); }
.wos-tete .wos-loupe { display: inline-flex; flex-shrink: 0; }
#wos-q {
    flex: 1; min-width: 0; height: 50px; margin: 0; padding: 0; border: none; outline: none; box-shadow: none;
    background: transparent; color: var(--wos-text); font: 400 16px 'Rubik','Open Sans',sans-serif;
}
#wos-q::placeholder { color: #6b7785; }
.wos-esc { flex-shrink: 0; }
.wos-filtres { display: flex; flex-wrap: wrap; gap: 5px 6px; padding: 8px 14px; border-bottom: 1px solid var(--wos-border); }
/* Douze filtres ne tiennent pas sur une ligne dans une fenêtre étroite (constaté par l'auteur) : ils
   passent à la ligne, aucun n'est caché. Dans « Tout », chacun porte son nombre de résultats. */
.wos-nbf { margin-inline-start: 5px; font-weight: 700; color: var(--wos-blue-dk); font-variant-numeric: tabular-nums; }
.wos-nbf:empty { display: none; }
.wos-filtre[aria-pressed="true"] .wos-nbf { color: #fff; }
.wos-filtre {
    flex-shrink: 0; height: 24px; min-height: 0; margin: 0; padding: 0 10px; border-radius: 50px; cursor: pointer;
    border: 1px solid var(--wos-border); background: var(--wos-surface); color: var(--wos-text2);
    font: 600 11px 'Rubik','Open Sans',sans-serif; line-height: 22px; white-space: nowrap;
}
.wos-filtre:hover { background: var(--wos-bg); }
.wos-filtre[aria-pressed="true"] { background: var(--wos-blue-btn); border-color: var(--wos-blue-btn); color: #fff; }
.wos-liste { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: 6px 0; overscroll-behavior: contain; }
/* La palette est une colonne de hauteur bornée : sans flex-shrink:0, une longue liste comprimait
   la rangée des filtres (40 px à vide, 18 px mesurés avec « rue » en Voies) et rognait ses boutons. */
.wos-tete, .wos-filtres, .wos-etat, .wos-pied { flex-shrink: 0; }
.wos-gr { padding: 8px 16px 4px; font-size: 10.5px; font-weight: 700; color: var(--wos-text2); text-transform: uppercase; letter-spacing: .05em; display: flex; justify-content: space-between; }
.wos-opt {
    display: flex; align-items: center; gap: 12px; margin: 0 6px; padding: 7px 10px; border-radius: 8px;
    cursor: pointer; border-inline-start: 3px solid transparent; scroll-margin: 8px;
}
.wos-opt[aria-selected="true"] { background: var(--wos-hover); border-inline-start-color: var(--wos-blue-btn); }
.wos-opt.wos-inerte { cursor: default; }
.wos-opt.wos-inerte .wos-entree { display: none !important; }
.wos-ico {
    flex-shrink: 0; width: 30px; height: 30px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
    background: #eef2f6; color: #546e7a;
}
.wos-opt[aria-selected="true"] .wos-ico { background: #fff; color: var(--wos-blue-dk); }
.wos-ico.wos-k-google { color: #1a73e8; font: 700 14px Arial,sans-serif; }
.wos-ico.wos-k-link, .wos-ico.wos-k-coords, .wos-ico.wos-k-id { color: var(--wos-orange); }
.wos-txt { flex: 1; min-width: 0; }
.wos-l1 { font-size: 13px; font-weight: 500; color: var(--wos-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* WME donne à <mark> un padding de 2,6 px (mesuré) : il ouvrait des blancs dans « Saint-Roch ». */
.wos-l1 mark { background: none; color: inherit; font-weight: 700; padding: 0; margin: 0; letter-spacing: inherit; }
.wos-l2 { font-size: 11.5px; color: var(--wos-text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.wos-droite { flex-shrink: 0; display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--wos-text2); font-variant-numeric: tabular-nums; }
.wos-id { font-family: ui-monospace,Menlo,Consolas,monospace; font-size: 10.5px; color: var(--wos-text2); }
.wos-vue { width: 7px; height: 7px; border-radius: 50%; background: var(--wos-blue); display: inline-block; }
.wos-entree { display: none; font-size: 11px; color: var(--wos-blue-dk); }
.wos-opt[aria-selected="true"] .wos-entree { display: inline; }
.wos-vide { padding: 28px 24px; text-align: center; color: var(--wos-text2); }
.wos-vide b { display: block; font-size: 14px; color: var(--wos-text); margin-bottom: 4px; font-weight: 600; }
.wos-etat { padding: 8px 16px; font-size: 12px; color: var(--wos-text2); }
.wos-etat:empty { padding: 0; }
.wos-pbg { text-transform: none; letter-spacing: 0; font-weight: 500; }
.wos-sr { position: absolute !important; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.wos-opt.wos-act { min-height: 28px; padding-top: 4px; padding-bottom: 4px; }
.wos-opt.wos-act .wos-l1 { color: var(--wos-blue-dk); font-weight: 600; font-size: 12px; }
.wos-etat.wos-err { color: #c62828; }
.wos-pied {
    display: flex; align-items: center; gap: 14px; padding: 7px 14px; border-top: 1px solid var(--wos-border);
    background: var(--wos-bg); font-size: 11px; color: var(--wos-text2); flex-wrap: wrap;
}
.wos-pied .wos-nb { margin-inline-start: auto; font-variant-numeric: tabular-nums; }
/* Fenêtre étroite : copier, nouvel onglet et filtre quittent le pied (ils restent dans l'aide). */
#wos-pal.wos-etroit .wos-pied > span:nth-child(n+3):nth-child(-n+5) { display: none; }
#wos-pal kbd, #wos-sidebar kbd, .wos-nbtn kbd {
    display: inline-block; min-width: 16px; text-align: center; background: var(--wos-surface); color: var(--wos-text);
    border: 1px solid var(--wos-border); border-bottom-width: 2px; border-radius: 4px;
    padding: 0 4px; font-family: ui-monospace,Menlo,Consolas,monospace; font-size: 10px; line-height: 16px;
}
.wos-toast {
    position: absolute; z-index: 9996; top: 16px; padding: 8px 14px; border-radius: 50px;
    background: #263238; color: #fff; font: 600 12px 'Rubik','Open Sans',sans-serif; box-shadow: var(--wos-shadow);
}
.wos-nbtn {
    display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0; height: 32px; min-height: 0; margin: 0; margin-inline: 8px auto; padding: 0 10px 0 8px;
    border: 1px solid var(--wos-border); border-radius: 50px; background: var(--wos-surface); color: var(--wos-text2);
    font: 600 11px 'Rubik','Open Sans',sans-serif; cursor: pointer; align-self: center;
}
.wos-nbtn:hover { background: var(--wos-hover); border-color: #bbdefb; }
.wos-nbtn:focus-visible, .wos-filtre:focus-visible, #wos-sidebar :focus-visible { outline: 2px solid var(--wos-blue); outline-offset: 1px; }
/* La barre du haut de WME répartit ses éléments aux deux bouts (space-between) : la marge
   automatique après le bouton le garde collé au champ de recherche. */
/* WME Studio, thème sombre : ses variables, toujours avec un repli. */
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-pal { --wos-surface: var(--wme-studio-surface, #2b2f33); --wos-bg: var(--wme-studio-input, #33383d); --wos-border: var(--wme-studio-border, #4a5056); --wos-text: var(--wme-studio-text, #e8eaed); --wos-text2: var(--wme-studio-text-secondary, #b6c0ca); --wos-hover: #2f4a63; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-pal .wos-ico { background: #3a3f44; color: #b6c0ca; }
/* Accents en sombre (audit n° 19 : le bleu foncé, le rouge d'erreur et le « G » tombaient à 1,6–2,4:1). */
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) :is(#wos-pal, #wos-sidebar, .wos-nbtn) { --wos-blue-dk: #90caf9; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-pal .wos-etat.wos-err { color: #ef9a9a; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-pal .wos-ico.wos-k-google { color: #8ab4f8; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-pal .wos-opt[aria-selected="true"] .wos-ico { background: #2b2f33; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-q::placeholder { color: #b6c0ca; }
/* Onglet Scripts en sombre : le bloc de WJN (l. 675-681), le panneau de WME devient bien sombre (audit n° 18). */
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar { --wos-text: var(--wme-studio-text, #e8eaed); --wos-text2: var(--wme-studio-text-secondary, #b6c0ca); color: var(--wme-studio-text, #e8eaed); }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar :is(p,td,th,li,label,b,strong,bdi,dd,dt):not([class]) { color: inherit; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar :is([class*="hint"],[class*="foot"],[class*="-lbl"]) { color: var(--wme-studio-text-secondary, #b6c0ca); }
/* Titres en #1976d2 (charte du 31/10) : 2,93:1 sur le fond sombre ⇒ #64b5f6 (6,09:1), comme WMW (audit 0.07 n° 13). */
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar :is(h2,.wos-sb-sec) { color: #64b5f6; }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar :is([class*="help-hdr"],kbd) { background: var(--wme-studio-input, #3a3f44); color: var(--wme-studio-text, #e8eaed); border-color: var(--wme-studio-border, #4a5056); }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar [class*="help-hdr"]:is(.on, :hover) { background: var(--wme-studio-hover, #454b52); color: var(--wme-studio-text, #e8eaed); }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) #wos-sidebar [class*="help-body"] { color: var(--wme-studio-text, #e8eaed); }
html:is([data-wme-studio-theme="dark"],[data-wme-studio-theme="black"]) .wos-nbtn { background: var(--wme-studio-input, #3a3f44); color: var(--wme-studio-text, #e8eaed); border-color: var(--wme-studio-border, #4a5056); }
/* Onglet Scripts — calqué sur #wct-sidebar */
#wos-sidebar { padding: 10px 12px; font-family: 'Rubik','Open Sans',sans-serif; font-size: 12px; color: var(--wos-text); }
#wos-sidebar h2 { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: var(--wos-blue-btn); margin: 0 0 8px; }
#wos-sidebar h2 .wos-sb-ico { display: inline-flex; }
#wos-sidebar h2 .wos-sb-ver { font-size: 11px; font-weight: 400; color: var(--wos-text2); }
.wos-sb-hint { font-size: 11px; color: var(--wos-text2); line-height: 1.6; margin: 0; }
.wos-sb-sec { font-size: 11px; font-weight: 700; color: var(--wos-blue-btn); text-transform: uppercase; letter-spacing: .05em; margin: 14px 0 6px; }
.wos-sb-ouvrir {
    display: inline-flex; align-items: center; gap: 6px; height: auto; min-height: 0; margin: 2px 0 0; padding: 3px 10px; border: none; border-radius: 50px;
    background: var(--wos-blue-btn); color: #fff; font: 600 11px 'Rubik','Open Sans',sans-serif; cursor: pointer;
}
.wos-sb-ouvrir kbd { background: rgba(255,255,255,.18) !important; color: #fff !important; border-color: rgba(255,255,255,.35) !important; }
.wos-toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; }
.wos-toggle-lbl { font-size: 12px; font-weight: 600; cursor: pointer; }
.wos-toggle { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
.wos-toggle input { opacity: 0; width: 0; height: 0; }
.wos-toggle-slider { position: absolute; cursor: pointer; inset: 0; background: #8a94a0; border-radius: 50px; transition: background .2s; }
.wos-toggle-slider:before { content: ''; position: absolute; width: 14px; height: 14px; inset-inline-start: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform .2s; }
.wos-toggle input:checked + .wos-toggle-slider { background: var(--wos-blue); }
.wos-toggle input:focus-visible + .wos-toggle-slider { outline: 2px solid var(--wos-blue-dk); outline-offset: 2px; }
.wos-toggle input:checked + .wos-toggle-slider:before { transform: translateX(16px); }
#wos-sidebar[dir="rtl"] .wos-toggle input:checked + .wos-toggle-slider:before { transform: translateX(-16px); }
.wos-help-section { border: 1px solid var(--wos-border); border-radius: 8px; margin-bottom: 4px; overflow: hidden; }
.wos-help-hdr {
    display: flex; align-items: center; justify-content: space-between; width: 100%;
    height: auto; min-height: 0; margin: 0; border: none; font-family: inherit; text-align: start;
    padding: 5px 9px; font-size: 11px; font-weight: 700; cursor: pointer; background: var(--wos-bg); color: var(--wos-text); user-select: none;
}
.wos-help-hdr.on { color: var(--wos-blue-dk); background: #e3f2fd; }
.wos-help-hdr:hover { background: #eef4fb; }
.wos-help-body { padding: 7px 9px; font-size: 11px; line-height: 1.5; color: var(--wos-text); }
.wos-help-body p { margin: 0 0 5px; }
.wos-help-table { width: 100%; border-collapse: collapse; }
.wos-help-table td { padding: 3px 5px; vertical-align: top; border-bottom: 1px solid var(--wos-border); }
.wos-help-table td:first-child { white-space: nowrap; color: var(--wos-text2); font-family: ui-monospace,Menlo,Consolas,monospace; font-size: 10.5px; }
.wos-sb-links { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--wos-border); font-size: 11px; color: var(--wos-text2); text-align: center; }
.wos-sb-links a { color: var(--wos-blue-dk); }
.wos-sb-maj { margin: 0 0 8px; padding: 5px 8px; border-radius: 8px; background: #ffebee; color: #c62828; font-size: 11px; font-weight: 600; }
.wos-sb-maj[hidden] { display: none; }
.wos-sb-maj a { color: #c62828; }
.wos-sb-foot { margin-top: 10px; font-size: 11px; color: var(--wos-text2); line-height: 1.6; }
`;

    // Pictogrammes 16 px, un trait : la nature d'un résultat se lit avant son libellé.
    const SVG = d => '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
    const PICTO = {
        street: SVG('<path d="M4 20 L9 4 M20 20 L15 4 M12 6v2 M12 11v2 M12 16v2"/>'),
        segment: SVG('<circle cx="5" cy="17" r="2"/><circle cx="19" cy="7" r="2"/><path d="M6.7 15.8 L17.3 8.2"/>'),
        node: SVG('<circle cx="12" cy="12" r="3"/><path d="M12 3v6 M12 15v6 M3 12h6 M15 12h6"/>'),
        address: SVG('<path d="M4 11 L12 4 L20 11 V20 H4 Z"/><path d="M10 20 v-5 h4 v5"/>'),
        venue: SVG('<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>'),
        company: SVG('<path d="M4 20V9l5-3v3l5-3v3l6-3v14Z"/><path d="M8 13h2 M8 16h2 M13 13h2 M13 16h2"/>'),
        city: SVG('<path d="M3 21h18 M5 21V9l5-3v15 M10 21V4l9 4v13 M13 10h3 M13 13h3 M13 16h3"/>'),
        hazard: SVG('<path d="M12 3 L21 19 H3 Z"/><path d="M12 10v4 M12 16.5v.5"/>'),
        editor: SVG('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5"/>'),
        comment: SVG('<path d="M4 5h16v11H9l-5 4z"/>'),
        link: SVG('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
        coords: SVG('<circle cx="12" cy="12" r="7"/><path d="M12 2v4 M12 18v4 M2 12h4 M18 12h4"/><circle cx="12" cy="12" r="1.5"/>'),
        id: SVG('<path d="M9 4 L7 20 M17 4 L15 20 M4 9h16 M3 15h16"/>'),
        recent: SVG('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
        closure: SVG('<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M7 8l3 5 M12 8l3 5 M17 8l3 5 M6 13v7 M18 13v7"/>'),
        mte: SVG('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16 M9 3v4 M15 3v4"/>'),
        bigJunction: SVG('<path d="M12 3l9 9-9 9-9-9z"/><path d="M12 8v8 M8 12h8"/>'),
        history: SVG('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4 M12 8v4l3 2"/>'),
        google: 'G',
        ur: SVG('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>'),
        rda: SVG('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
        iga: SVG('<path d="M12 3v18 M5 6h11l3 3-3 3H5z"/>'),
        discuss: SVG('<path d="M4 5h11v8H8l-4 3z"/><path d="M15 9h5v8l-3-2h-6v-2"/>'),
    };

    // Le caractère ▾ faisait 11 px dans la police de WME, à peine visible (mesuré) : un chevron dessiné.
    const CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
    let pal = null, champ = null, liste = null, etat = null, nbEl = null, annonce = null, filtre = 'all';
    let lignes = [], actif = -1, ouverts = new Set(), genRecherche = 0, minuterieReseau = null, minuterieDiscuss = null, souris = null;

    function couche() {
        const zone = document.querySelector('div.edit-area-main');
        if (!zone) return document.body;
        let c = document.getElementById('wos-couche');
        if (!c) { c = document.createElement('div'); c.id = 'wos-couche'; c.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:1'; }
        if (c.parentElement !== zone) zone.appendChild(c);
        return c;
    }

    // =====================================================================
    //  Fenêtre — déplaçable par l'en-tête, redimensionnable par les bords
    // =====================================================================

    // La géométrie choisie (x, y, largeur, hauteur, relatives à la zone de carte) est retenue dans
    // ce navigateur ; null = placement automatique, centré en haut. Bornée à la zone de carte et à
    // GAUCHE de la colonne de boutons, mesurée à chaque geste (charte).
    const W_MIN = 380, H_MIN = 220, W_MAX = 1100;
    // En deçà, le pied ne garde que ↑↓, ↵ et Échap : il passait sur 3 ou 4 lignes (audit 0.07 n° 24).
    const LARGEUR_ETROITE = 520;
    let geom = null;
    const borne = (v, a, b) => Math.max(a, Math.min(b, v));
    function lireGeom() { try { const g = JSON.parse(localStorage.getItem(GEOM_KEY) || 'null'); return g && isFinite(g.x) && isFinite(g.y) && isFinite(g.w) ? g : null; } catch (e) { return null; } }
    function ecrireGeom() { try { if (geom) localStorage.setItem(GEOM_KEY, JSON.stringify(geom)); else localStorage.removeItem(GEOM_KEY); } catch (e) { } }
    function bornes() {
        const zone = document.querySelector('div.edit-area-main');
        const zr = zone ? zone.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        const col = document.querySelector('.overlay-buttons-container.top') || document.querySelector('.overlay-buttons-container');
        const cr = col && col.getBoundingClientRect();
        const droite = cr && cr.width && cr.left > zr.left + zr.width / 2 ? cr.left - zr.left - 12 : zr.width - 12;
        return { zone, zr, droite };
    }
    function appliquerGeom() {
        if (!pal) return;
        const { zone, zr, droite } = bornes();
        if (!zone) { pal.style.position = 'fixed'; pal.style.top = '76px'; }
        // Par défaut : à DROITE, contre la colonne de boutons qu'elle laisse visible, comme les
        // fenêtres des autres scripts de l'auteur (demande du 30/10/2026).
        if (!geom) {
            const w = Math.max(320, Math.min(620, droite - 24));
            pal.style.width = w + 'px';
            pal.style.left = Math.max(12, droite - w) + 'px';
            if (zone) pal.style.top = '12px';
            pal.style.height = ''; pal.style.maxHeight = '';
            pal.classList.toggle('wos-etroit', w < LARGEUR_ETROITE);
            return;
        }
        // La largeur minimale cède à la place disponible (zone étroite, volet ouvert) ; la position est
        // gardée par rapport au bord DROIT, là où la fenêtre vit par défaut (audit n° 33).
        const place = Math.max(200, droite - 12);
        const w = borne(geom.w, Math.min(W_MIN, place), Math.min(W_MAX, place));
        const h = geom.h ? borne(geom.h, Math.min(hMin(), zr.height - 24), zr.height - 24) : null;
        const x = geom.dr != null ? droite - w - geom.dr : geom.x;
        pal.style.width = w + 'px';
        pal.classList.toggle('wos-etroit', w < LARGEUR_ETROITE);
        pal.style.left = borne(x, 12, Math.max(12, droite - w)) + 'px';
        // Le plancher est la hauteur minimale RÉELLE (en-tête, filtres, pied, trois lignes) : 160 en dur
        // laissait une liste de 0 px en bas de zone (audit 0.07 n° 24).
        const hm = Math.min(hMin(), zr.height - 24);
        const top = borne(geom.y, 12, Math.max(12, zr.height - (h || hm) - 12));
        pal.style.top = top + 'px';
        // En hauteur automatique, la fenêtre ne déborde pas par le bas de la zone de carte.
        if (h) { pal.style.height = h + 'px'; pal.style.maxHeight = 'none'; } else { pal.style.height = ''; pal.style.maxHeight = Math.max(hm, zr.height - top - 12) + 'px'; }
    }
    // La hauteur minimale réelle : en-tête, filtres (sur une ou deux lignes), pied, et de quoi voir
    // trois résultats — H_MIN seul laissait une liste de 0 px à 380 × 220.
    function hMin() {
        if (!pal) return H_MIN;
        const h = sel => { const e = pal.querySelector(sel); return e ? e.offsetHeight : 0; };
        return Math.max(H_MIN, h('.wos-tete') + h('.wos-filtres') + h('.wos-pied') + h('.wos-etat') + 3 * 44);
    }
    // Ce qu'on retient d'une géométrie affichée : la distance au bord droit, en plus de la position.
    // Ancrée au bord le PLUS PROCHE : une fenêtre posée à gauche restait collée au bord droit quand la
    // zone de carte changeait de largeur (audit 0.07 n° 24).
    const geomAffichee = avecH => {
        const { droite } = bornes();
        const x = pal.offsetLeft, w = pal.offsetWidth, dr = Math.max(0, droite - x - w);
        return { x, y: pal.offsetTop, w, h: avecH ? pal.offsetHeight : null, dr: dr <= x ? dr : null };
    };
    // Un seul gabarit de geste pour déplacer et redimensionner : pointeur capturé, une image par
    // rafraîchissement, la géométrie écrite au lâcher. Échap pendant le geste le rend sans effet.
    function geste(ev, dir) {
        if (ev.button !== 0) return;
        ev.preventDefault();
        const r0 = { x: pal.offsetLeft, y: pal.offsetTop, w: pal.offsetWidth, h: pal.offsetHeight };
        const avant = geom, sx = ev.clientX, sy = ev.clientY, cible = ev.currentTarget;
        // Les tailles sont bornées AVANT de placer le bord opposé : sinon, au-delà du maximum, la poignée
        // ouest ou nord poussait le bord d'en face (audit 0.07 n° 24).
        const bz = bornes(), wMax = Math.min(W_MAX, Math.max(200, bz.droite - 12)), hMax = bz.zr.height - 24;
        try { cible.setPointerCapture(ev.pointerId); } catch (e) { }
        pal.classList.add('wos-geste');
        let image = null, dernier = null;
        const bouger = e => {
            dernier = e;
            if (image) return;
            image = requestAnimationFrame(() => {
                image = null;
                const dx = dernier.clientX - sx, dy = dernier.clientY - sy, g = { x: r0.x, y: r0.y, w: r0.w, h: r0.h };
                if (dir === 'move') { g.x += dx; g.y += dy; g.h = avant && avant.h ? r0.h : null; }
                else {
                    if (dir.includes('e')) g.w = r0.w + dx;
                    if (dir.includes('s')) g.h = r0.h + dy;
                    if (dir.includes('w')) { g.w = borne(r0.w - dx, Math.min(W_MIN, wMax), wMax); g.x = r0.x + r0.w - g.w; }
                    if (dir.includes('n')) { g.h = borne(r0.h - dy, Math.min(hMin(), hMax), hMax); g.y = r0.y + r0.h - g.h; }
                    if (dir.includes('s')) g.h = Math.max(hMin(), g.h);
                    if (!dir.includes('n') && !dir.includes('s')) g.h = avant && avant.h ? r0.h : null;
                }
                geom = g;
                appliquerGeom();
            });
        };
        const finir = annule => {
            cible.removeEventListener('pointermove', bouger);
            cible.removeEventListener('pointerup', lacher);
            cible.removeEventListener('pointercancel', annuler);
            document.removeEventListener('keydown', echap, true);
            if (image) cancelAnimationFrame(image);
            pal.classList.remove('wos-geste');
            // Un simple clic (aucun mouvement) n'écrase pas la préférence ; un geste interrompu par le
            // système (pointercancel) non plus (audit 0.07 n° 24).
            if (annule || !dernier) { geom = avant; appliquerGeom(); return; }
            // La géométrie retenue est celle qui est AFFICHÉE, bornes appliquées.
            if (geom) geom = geomAffichee(!!geom.h);
            ecrireGeom();
        };
        const lacher = () => finir(false), annuler = () => finir(true);
        const echap = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finir(true); } };
        cible.addEventListener('pointermove', bouger);
        cible.addEventListener('pointerup', lacher);
        cible.addEventListener('pointercancel', annuler);
        document.addEventListener('keydown', echap, true);
    }

    function construirePalette() {
        pal = document.createElement('div');
        pal.id = 'wos-pal';
        pal.hidden = true;
        pal.dir = _lang === 'he' ? 'rtl' : 'ltr';
        pal.setAttribute('role', 'dialog');
        pal.setAttribute('aria-modal', 'false');
        pal.setAttribute('aria-label', t('ariaDialog'));
        pal.innerHTML =
            '<div class="wos-tete" title="' + escHtml(t('winMove')) + '"><span class="wos-grip" aria-hidden="true">⠿</span><span class="wos-loupe">' + icone(22) + '</span>' +
            '<input id="wos-q" type="text" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="wos-liste" aria-autocomplete="list" placeholder="' + escHtml(t('phInput')) + '">' +
            '<button type="button" class="wos-fermer" title="' + escHtml(t('winClose')) + '" aria-label="' + escHtml(t('winClose')) + '">×</button></div>' +
            '<div class="wos-filtres" role="toolbar">' + FILTRES.map(f => '<button type="button" class="wos-filtre" data-f="' + f.id + '" aria-pressed="' + (f.id === filtre) + '">' + escHtml(t(f.t)) + '<span class="wos-nbf"></span></button>').join('') + '</div>' +
            '<div class="wos-liste" id="wos-liste" role="listbox" aria-label="' + escHtml(t('ariaList')) + '"></div>' +
            '<div class="wos-etat" role="status" aria-live="polite"></div>' +
            '<div class="wos-pied"><span><kbd>↑</kbd><kbd>↓</kbd> ' + escHtml(t('hintNav')) + '</span><span><kbd>↵</kbd> ' + escHtml(t('hintGo')) + '</span>' +
            '<span><kbd>' + (estMac ? '⌘' : 'Ctrl') + '</kbd><kbd>↵</kbd> ' + escHtml(t('hintCopy')) + '</span><span><kbd>⇧</kbd><kbd>↵</kbd> ' + escHtml(t('hintTab')) + '</span>' +
            '<span><kbd>Tab</kbd> ' + escHtml(t('hintFilter')) + '</span><span><kbd>Esc</kbd> ' + escHtml(t('hintClose')) + '</span><span class="wos-nb" aria-hidden="true"></span></div>' +
            // Une seule région d'annonce, présente dès la construction (une région créée au moment
            // où elle change n'est pas lue, audit n° 35) : compte des résultats et confirmations.
            '<div class="wos-sr" role="status" aria-live="polite" id="wos-annonce"></div>' +
            ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map(d => '<div class="wos-poignee" data-dir="' + d + '" aria-hidden="true"></div>').join('');
        couche().appendChild(pal);
        champ = pal.querySelector('#wos-q');
        liste = pal.querySelector('.wos-liste');
        etat = pal.querySelector('.wos-etat');
        nbEl = pal.querySelector('.wos-nb');
        annonce = pal.querySelector('#wos-annonce');
        geom = lireGeom();

        const tete = pal.querySelector('.wos-tete');
        tete.addEventListener('pointerdown', ev => { if (!ev.target.closest('input, button')) geste(ev, 'move'); });
        tete.addEventListener('dblclick', ev => { if (ev.target.closest('input, button')) return; geom = null; ecrireGeom(); appliquerGeom(); });
        pal.querySelectorAll('.wos-poignee').forEach(p => p.addEventListener('pointerdown', ev => geste(ev, p.getAttribute('data-dir'))));
        pal.querySelector('.wos-fermer').addEventListener('click', () => fermer());

        champ.addEventListener('input', () => lancerRecherche());
        champ.addEventListener('keydown', surTouche);
        pal.querySelector('.wos-filtres').addEventListener('click', ev => {
            const b = ev.target.closest('[data-f]');
            if (b) { choisirFiltre(b.getAttribute('data-f')); champ.focus(); }
        });
        // Le survol ne prend la main que si la souris BOUGE : un défilement au clavier qui fait
        // passer une ligne sous un pointeur immobile ne doit pas voler la sélection.
        liste.addEventListener('mousemove', ev => {
            if (souris && souris[0] === ev.clientX && souris[1] === ev.clientY) return;
            souris = [ev.clientX, ev.clientY];
            const o = ev.target.closest('.wos-opt');
            if (o) activer(+o.getAttribute('data-i'), false);
        });
        liste.addEventListener('mousedown', ev => ev.preventDefault());   // le champ garde le focus
        liste.addEventListener('click', ev => {
            const chev = ev.target.closest('[data-chev]');
            if (chev) { basculerEditeur(chev.getAttribute('data-chev')); return; }
            const gmap = ev.target.closest('[data-gmap]');
            if (gmap) { ouvrirGoogleMaps(lignes[+gmap.getAttribute('data-gmap')]); return; }
            const o = ev.target.closest('.wos-opt');
            if (o) executer(+o.getAttribute('data-i'), ev.ctrlKey || ev.metaKey ? 'copier' : ev.shiftKey ? 'onglet' : 'aller');
        });
    }

    // Le nombre de résultats de chaque filtre, affiché sur sa pastille quand on est dans « Tout ».
    const FILTRE_DU_GROUPE = { street: 'street', address: 'address', venue: 'venue', city: 'city', closure: 'closure', mte: 'mte', ur: 'ur',
        hazard: 'map', rda: 'map', note: 'map', iga: 'map', editor: 'editor', google: 'google', discuss: 'discuss', company: 'venue' };
    function compterParFiltre(res, q) {
        if (!pal) return;
        const n = new Map();
        if (filtre === 'all' && q) for (const r of res) { const f = FILTRE_DU_GROUPE[r.g]; if (f) n.set(f, (n.get(f) || 0) + 1); }
        pal.querySelectorAll('.wos-filtre').forEach(b => {
            const k = n.get(b.getAttribute('data-f'));
            b.querySelector('.wos-nbf').textContent = k ? String(k) : '';
        });
    }

    function choisirFiltre(f) {
        filtre = f;
        pal.querySelectorAll('.wos-filtre').forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)));
        ouverts.clear();
        lancerRecherche();
    }
    // Un nouveau rendu des mêmes résultats (« N de plus », dépli, historique lu) : la ligne active reste.
    const relancer = () => lancerRecherche(true);

    let ouverte = false, focusAvant = null;
    function ouvrir(texte) {
        if (!pal) construirePalette();
        if (pal.parentElement !== couche()) couche().appendChild(pal);
        focusAvant = document.activeElement;
        // Chaque ouverture repart sur « Tout » : un filtre resté d'une recherche précédente
        // ferait croire à une recherche vide.
        if (filtre !== 'all') { filtre = 'all'; pal.querySelectorAll('.wos-filtre').forEach(b => b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === 'all'))); }
        ouverts.clear();
        // Visible AVANT d'appliquer : hMin() mesure l'en-tête, les filtres et le pied (0 sur une fenêtre masquée).
        pal.hidden = false;
        appliquerGeom();
        ouverte = true;
        invaliderIndex();
        numerosCache.clear();
        lieuxWazeCache.clear();
        if (memo.ur && memo.ur.comErr) memo.ur = null;   // commentaires d'UR en échec : relus
        // Fermetures et UR lues d'avance, mais APRÈS l'ouverture (≈ 6 Mo à Paris) : la fenêtre et la première
        // frappe ne les attendent pas (décision de l'auteur, 01/11/2026). Rien pour un lien, des coordonnées ou
        // un ID ; une recherche qui en a besoin les lit de toute façon elle-même.
        clearTimeout(minuterieLarges);
        minuterieLarges = setTimeout(() => {
            const q = champ.value.trim();
            if (!ouverte || /^\s*\d{3,}(\s*,\s*\d{3,})*\s*$/.test(q) || /^\s*\d+\.\d+\.\d+\s*$/.test(q) || lienLire(q) || coordsLire(q)) return;
            lireFermeturesLarges().catch(() => { });
            lireUrLarges().catch(() => { });
        }, LARGES_DELAI_MS);
        completerCalques();
        if (texte != null) champ.value = texte;
        champ.focus();
        champ.select();
        lancerRecherche();
    }
    let minuterieLarges = null;
    const LARGES_DELAI_MS = 1000;
    function fermer() {
        if (!ouverte) return;
        ouverte = false;
        clearTimeout(minuterieLarges);
        pal.hidden = true;
        genRecherche++;
        elargissement = 0;
        histoJeton++;
        if (abandon) abandon.abort();
        clearTimeout(minuterieReseau);
        clearTimeout(minuterieDiscuss);
        if (discussAbandon) discussAbandon.abort();
        dessiner([]);
        if (focusAvant && focusAvant.focus && document.contains(focusAvant)) try { focusAvant.focus(); } catch (e) { }
    }

    function etatTexte(txt, erreur) {
        if (!etat) return;
        etat.hidden = false;
        etat.textContent = txt || '';
        etat.classList.toggle('wos-err', !!erreur);
    }

    // Une recherche par frappe : le local tout de suite, les numéros et Google un peu après. Un
    // compteur de génération garantit que seule la dernière frappe écrit.
    async function lancerRecherche(garder) {
        const gen = ++genRecherche;
        clearTimeout(minuterieReseau);
        clearTimeout(minuterieDiscuss);
        // Une nouvelle frappe arrête « Chercher alentour » (audit n° 20 : il finissait par déplacer la
        // carte vers l'ancien ID, et parfois fermer la fenêtre en pleine frappe).
        if (!garder && elargissement) { elargissement = 0; if (abandon) abandon.abort(); }
        sources = { gen, etat: new Map(), notes: [], raison: null, attente: false };
        if (!elargissement && !histoEnCours && !navEnCours) etatTexte('');
        // Un calque éteint depuis la dernière lecture (sans bouger la carte) : le complément est relu
        // AVANT de chercher, sinon ses objets manquaient (mesuré : calque Lieux éteint, 423 → 55 lieux).
        // Lecture déjà valable : la promesse est résolue tout de suite.
        if (!garder) {
            const avant = complement;
            try { await lireComplement(await vueCarte()); } catch (e) { }
            if (complement !== avant) invaliderIndex();
            if (gen !== genRecherche) return;
        }
        let q = champ.value.trim(), f = filtre;
        if (/^g:\s*/i.test(q)) { q = q.replace(/^g:\s*/i, ''); f = 'google'; }
        else if (/^d:\s*/i.test(q)) { q = q.replace(/^d:\s*/i, ''); f = 'discuss'; }
        if (!q && f !== 'editor') {
            lignes = recents();
            if (lignes.some(l => l.g === 'recent' && !l.entete)) lignes.push({ action: 'effacer', label: t('clearRecents') });
            actif = lignes.findIndex(selectionnable);
            rendre();
            return;
        }

        let centre = [0, 0], vue = null;
        try { const c = await sdk.Map.getMapCenter(); centre = [c.lon, c.lat]; vue = await sdk.Map.getMapExtent(); } catch (e) { }
        // Le centre de CLASSEMENT est figé pour une saisie : une relance (la carte a bougé, une source
        // est arrivée) ne reclasse pas la liste sous le clavier (audit n° 26). Les objets chargés,
        // eux, viennent de la vue courante.
        if (garder && fige && fige.q === q + '|' + f) centre = fige.centre;
        else fige = { q: q + '|' + f, centre };
        // Un ID seul (nombre, liste de nombres ou triplet de lieu) : ni numéros, ni MTE, ni Google, ni
        // Discuss — mais les fermetures et les UR, qui se cherchent aussi par ID (audit n° 6).
        const idSeul = /^\s*\d{3,}(\s*,\s*\d{3,})*\s*$/.test(q) || /^\s*\d+\.\d+\.\d+\s*$/.test(q);
        let res = [];
        try {
            const sansDirect = (f === 'address' && NUMERO.test(q)) || (idSeul && (f === 'ur' || f === 'closure'));
            const direct = q && !sansDirect ? await chercherDirect(q, centre) : [];
            res = direct.length && direct[0].k !== 'id' && f !== 'google' ? direct : direct.concat(f === 'google' ? [] : await chercherLocal(q || '@', f, vue));
        } catch (e) { log('recherche : ' + e.message); }
        if (f === 'editor') await majCandidats();
        if (gen !== genRecherche) return;
        const reseau = !!q && !res.some(r => r.g === 'direct' && r.k !== 'id');
        sources.attente = reseau;
        afficher(res, centre, vue, q, garder);
        majEtat();

        // Les fermetures et MTE viennent du service Features : à leur arrivée (ou quand la vue sort
        // de l'emprise lue), les éditeurs sont recomptés.
        if (vue && res.some(r => r.g === 'editor')) {
            const avant = fermeturesApi;
            lireFermetures(vue).then(fa => { if (fa !== avant && gen === genRecherche && ouverte) lancerRecherche(true); });
        }

        // Un endroit déjà désigné (lien, coordonnées, objet chargé) : rien d'autre à chercher.
        if (!reseau) return;
        // Chaque source réseau s'affiche dès qu'elle répond : Discuss met 2 s (mesuré), il ne doit
        // pas retenir les numéros ni Google.
        const extras = [];
        const ajouter = l => {
            if (gen !== genRecherche || !l || !l.length) return;
            extras.push(...l);
            afficher(res.concat(extras), centre, vue, q, true);
        };
        // Chaque source n'est suivie que si elle a quelque chose à chercher pour ce filtre et cette saisie.
        const pour = (...fs) => f === 'all' || fs.includes(f);
        // Les sources de 450 ms sont décidées D'AVANCE : sinon, entre 220 et 450 ms, une liste vide disait
        // « Rien pour … » (et l'annonçait) alors qu'elles n'étaient pas encore parties (audit 0.07 n° 11).
        // Éditeurs du forum : dans « Tout », seulement si l'option Discuss est allumée (audit 0.07 n° 16).
        const lancer450 = {
            editor: !idSeul && (q.startsWith('@') || f === 'editor' || (f === 'all' && opts.discuss)),
            company: opts.entreprises && pour('venue') && !q.startsWith('@') && (!idSeul || /^\d{9}(\d{5})?$/.test(q.replace(/\s/g, ''))),
            mte: !idSeul && pour('mte') && q.length >= 3 && !q.startsWith('@'),
            discuss: !idSeul && opts.discuss && pour('discuss') && q.length >= 3 && !q.startsWith('@'),
        };
        const tard = Object.values(lancer450).some(Boolean);
        minuterieReseau = setTimeout(() => {
            if (!idSeul && pour('address')) suivre(gen, 'address', chercherNumeros(q, f)).then(ajouter);
            if (q.length >= 2 && !q.startsWith('@')) {
                if (pour('closure')) suivre(gen, 'closure', chercherEvenements(q, f, 'closure')).then(ajouter);
                if (pour('ur')) suivre(gen, 'ur', chercherEvenements(q, f, 'ur')).then(ajouter);
            }
            if (!idSeul && pour('venue') && q.length >= 3 && !q.startsWith('@')) suivre(gen, 'lieuxWaze', chercherLieuxWaze(q, f, centre)).then(ajouter);
            if (!idSeul && opts.google && pour('google') && q.length >= 3 && !q.startsWith('@')) suivre(gen, 'google', chercherGoogle(q, f, centre)).then(ajouter);
            if (!sources.etat.size && !tard) { sources.attente = false; majEtat(); }
        }, 220);
        // Les MTE partent avec Discuss, après 450 ms sans frappe : une recherche mondiale par lettre
        // tapée était de trop (audit n° 52).
        minuterieDiscuss = setTimeout(() => {
            if (lancer450.editor) suivre(gen, 'editor', chercherEditeursWaze(q, f)).then(ajouter);
            if (lancer450.company) suivre(gen, 'company', chercherEntreprises(q, f, centre)).then(ajouter);
            if (lancer450.mte) suivre(gen, 'mte', chercherMte(q, f)).then(ajouter);
            if (lancer450.discuss) suivre(gen, 'discuss', chercherDiscuss(q, f)).then(ajouter);
            if (!sources.etat.size) { sources.attente = false; majEtat(); }
        }, 450);
    }

    // L'état de chaque source réseau pour la recherche en cours : en vol, finie, en panne (avec sa cause).
    // Une source en panne ou encore en vol ne doit jamais passer pour « rien trouvé » (audit du
    // 30/10/2026, n° 1 : sur 9 services, seuls Google et Discuss signalaient un échec).
    let sources = { gen: 0, etat: new Map(), notes: [], raison: null, attente: false };
    const NOMS_SOURCES = { lieuxWaze: 'srcVenueFar', company: 'optCompanies', editor: 'fEditor', closure: 'fClosure', ur: 'fUR', mte: 'fMte', address: 'fAddress', google: 'fGoogle', discuss: 'fDiscuss' };
    let histoEnCours = false, navEnCours = false;   // ces deux-là écrivent leur propre état
    function suivre(gen, nom, promesse) {
        if (sources.gen !== gen) return promesse.catch(() => []);
        sources.etat.set(nom, { etat: 'vol' });
        majEtat();
        return promesse.then(l => {
            if (sources.gen === gen) {
                sources.etat.set(nom, { etat: 'ok' });
                if (l && l.note) sources.notes.push(l.note);
                if (l && l.raison) sources.raison = l.raison;
                majEtat();
            }
            return l || [];
        }, e => {
            if (sources.gen === gen) {
                if (e && e.name === 'AbortError') sources.etat.delete(nom);
                else {
                    // Un délai dépassé est une panne nommée ; un statut gRPC se lit comme un statut HTTP.
                    const cause = e && e.name === 'TimeoutError' ? [t('srcTimeout')] : /HTTP \d+|gRPC \d+/.exec((e && e.message) || '');
                    sources.etat.set(nom, { etat: 'panne', cause: cause ? cause[0] : '' });
                    logUneFois('src-' + nom + '-' + (e && e.message), nom + ' : ' + (e && e.message));
                }
                majEtat();
            }
            return [];
        });
    }
    const enVol = () => sources.etat.size ? [...sources.etat.values()].some(x => x.etat === 'vol') : sources.attente;
    // La ligne d'état dit, dans l'ordre : ce qui est en panne, pourquoi un onglet est vide, les notes
    // des sources (UR plafonnées), puis « recherche en cours ». « Chercher alentour » et la lecture
    // de l'historique écrivent leur propre état : on ne l'écrase pas pendant qu'ils tournent.
    function majEtat() {
        if (!etat || elargissement || histoEnCours || navEnCours) return;
        const pannes = [...sources.etat.entries()].filter(([, x]) => x.etat === 'panne').map(([n, x]) => t(NOMS_SOURCES[n] || n) + (x.cause ? ' (' + x.cause + ')' : ''));
        // Pannes, raison et notes ENSEMBLE : une panne effaçait « UR plafonnées à 500 » (audit 0.07 n° 8).
        const dits = [sources.raison, ...sources.notes].filter(Boolean);
        if (pannes.length) etatTexte([t('srcDown', pannes.join(', ')), ...dits].join(' · '), true);
        else if (dits.length) etatTexte(dits.join(' · '));
        else if (enVol()) etatTexte(t('srcBusy'));
        else etatTexte('');
        if (!lignes.length && champ && champ.value.trim()) rendre();   // « en cours » n'est pas « rien »
    }

    // Une ligne qu'on peut rendre active (titres, rubriques et « N de plus » ne le sont pas).
    const selectionnable = l => !!l && !l.entete && !l.sec && !l.sous && !l.info;
    // Un objet garde sa clé quelle que soit la source qui le rend (lieu distant puis lieu de l'index) :
    // la ligne active ne saute pas quand il arrive à l'écran (audit 0.07 n° 27).
    const cleLigne = l => l && (l.action ? l.action + '|' + (l.cle || '') : l.cleObj || (l.label + '|' + l.sub + '|' + (l.editeur || '')));
    const resultat = l => selectionnable(l) && !l.action && !l.det;

    // Classement : distance et présence à l'écran départagent des correspondances de même force,
    // jamais une correspondance plus faible ne passe devant une plus forte.
    let derniers = null, fige = null;
    function afficher(res, centre, vue, q, garderActif) {
        const jetons = norm(q.replace(/^[@]|^[gd]:\s*/i, '')).split(' ').filter(Boolean);
        // Le classement suit le centre FIGÉ de la saisie ; la distance AFFICHÉE suit la carte actuelle
        // (01/11/2026 : après un saut à Lyon, la même saisie affichait encore « 246 km » pour un lieu à
        // 200 m). Une distance sans position (Google, comptée par son service depuis le centre figé)
        // n'est plus montrée dès que la carte a bougé.
        const ici = vue ? [(vue[0] + vue[2]) / 2, (vue[1] + vue[3]) / 2] : centre;
        const bouge = metres(ici, centre) > BOUGE_M;
        for (const r of res) {
            const p = r.cible ? [r.cible.lon, r.cible.lat] : null;
            if (r.dist == null && p) r.dist = metres(centre, p);
            // Sans cible, un point exact (ID localisé) garde quand même sa distance juste (audit 0.07 n° 21).
            const pAff = p || (r.ptAff || null);
            r.distAff = pAff ? metres(ici, pAff) : bouge ? null : r.dist;
            r.vue = !!(p && vue && dansEmprise(p, vue));
            r.rang = r.score * 10 + (r.vue ? 3 : 0) + (r.dist != null ? 2 * Math.exp(-r.dist / 5000) : 0);
        }
        const parGroupe = new Map();
        for (const r of res) (parGroupe.get(r.g) || parGroupe.set(r.g, []).get(r.g)).push(r);
        // Une liste ordonnée (tous les numéros d'une voie) garde son ordre ; une liste « par distance »
        // (les MTE) va du plus proche au plus lointain, ceux sans position à la fin ; le reste, par rang.
        // La distance AFFICHÉE d'abord : après un saut, une liste « du plus proche au plus lointain » triée
        // sur l'ancien centre se lisait « 240 km, 3 km, 180 km » (audit 0.07 n° 5). Seuls ces groupes-là
        // suivent la carte ; les autres gardent le rang figé (audit n° 26).
        const cleDistance = x => x.distAff != null ? x.distAff : x.dist != null ? x.dist : x.proche ? 60000 : Infinity;
        // Les MTE en cours ou à venir avant les passés, puis du plus proche au plus lointain (audit n° 27).
        const parDistance = (a, b) => (b.actuel ? 1 : 0) - (a.actuel ? 1 : 0) || cleDistance(a) - cleDistance(b);
        for (const l of parGroupe.values()) l.sort((a, b) => a.ordre != null && b.ordre != null ? a.ordre - b.ordre
            : a.parDistance && b.parDistance ? parDistance(a, b) : b.rang - a.rang);
        // L'ordre des groupes suit leur meilleur résultat ; « Aller à » d'abord, Google en dernier
        // (il arrive après les autres : le placer ailleurs ferait sauter la liste).
        const fin = { company: 1, discuss: 2, google: 3 };
        // Le rang d'un groupe est celui de son MEILLEUR résultat, quel que soit l'ordre d'affichage.
        const rangMax = l => l.reduce((m, x) => Math.max(m, x.rang), -Infinity);
        let ordre = [...parGroupe.keys()].sort((a, b) => a === 'direct' ? -1 : b === 'direct' ? 1
            : (fin[a] || 0) !== (fin[b] || 0) ? (fin[a] || 0) - (fin[b] || 0) : rangMax(parGroupe.get(b)) - rangMax(parGroupe.get(a)));
        // Même saisie : les groupes déjà affichés gardent leur place, un groupe arrivé plus tard
        // (réseau) se range APRÈS eux — mais avant Discuss et Google (audit n° 26).
        if (garderActif && derniers && derniers.q === q && derniers.ordre) {
            const avant = derniers.ordre.filter(g => parGroupe.has(g) && !fin[g] && g !== 'direct');
            ordre = [...ordre.filter(g => g === 'direct'), ...avant, ...ordre.filter(g => g !== 'direct' && !fin[g] && !avant.includes(g)), ...ordre.filter(g => fin[g])];
        }
        const cle = garderActif && selectionnable(lignes[actif]) ? cleLigne(lignes[actif]) : null;
        // Onglet Éditeurs : un seul éditeur trouvé se déplie de lui-même.
        if (filtre === 'editor' && !edOuvert && (parGroupe.get('editor') || []).length === 1 && parGroupe.get('editor')[0].ed) edOuvert = parGroupe.get('editor')[0].editeur;
        lignes = [];
        for (const g of ordre) {
            const l = parGroupe.get(g);
            // « rue » en Voies rendait des centaines de lignes (13 000 px de liste, mesuré).
            const montrer = g === 'direct' || ouverts.has(g) ? l : l.slice(0, filtre !== 'all' ? PAR_FILTRE : PAR_GROUPE);
            lignes.push({ entete: true, g });
            for (const r of montrer) {
                // Surligné seulement s'il est MONTRÉ : « rue » rendait 668 résultats, tous surlignés (audit 0.07 n° 23).
                r.html = surligner(r.label, r.g === 'direct' ? [] : jetons);
                lignes.push(r);
                if (filtre === 'editor' && r.editeur && r.ed) { r.tete = true; if (r.editeur === edOuvert) lignes.push(...lignesEditeur(r.ed)); }
            }
            // « N de plus » et « Effacer les récents » sont des lignes comme les autres : atteignables
            // au clavier, et assez hautes pour la souris (audit n° 16 : 13 px, hors du clavier).
            if (l.length > montrer.length) lignes.push({ action: 'plus', cle: g, label: t('moreN', l.length - montrer.length) });
            if (g === 'recent') lignes.push({ action: 'effacer', label: t('clearRecents') });
        }
        derniers = { n: res.length, q, ordre };
        compterParFiltre(res, q);
        actif = cle ? lignes.findIndex(l => selectionnable(l) && cleLigne(l) === cle) : -1;
        if (actif < 0) actif = lignes.findIndex(selectionnable);
        rendre();
    }

    // Le remède dépend de l'onglet (audit n° 25 : « activez les lieux Google » s'affichait aussi pour
    // les MTE, Discuss, les éditeurs, et quand Google était déjà actif).
    function texteVide() {
        if (filtre === 'mte') return t('noResMte');
        if (filtre === 'discuss') return opts.discuss ? t('noResDiscuss') : t('srcOff');
        if (filtre === 'google') return opts.google ? t('noResGoogle') : t('srcOff');
        if (filtre === 'editor') return t('noResEditor');
        return opts.google ? t('noResMove') : t('noResHint');
    }

    function rendre() {
        if (!pal) return;
        const q = champ.value.trim();
        champ.setAttribute('aria-expanded', String(lignes.some(selectionnable)));
        if (!lignes.length) {
            // Le message vide est un statut (audit n° 17 : zéro résultat n'était jamais annoncé).
            // Pas de role=status DANS la liste (hors du modèle d'un listbox) : l'annonce passe par la zone vivante,
            // remède compris — elle ne disait que « 0 résultat » (audit 0.07 n° 18).
            liste.innerHTML = '<div class="wos-vide">' + (q && enVol()
                ? '<b>' + escHtml(t('srcBusy')) + '</b>'
                : q || filtre === 'editor'
                ? '<b>' + escHtml(['mte', 'discuss', 'google'].includes(filtre) ? t('noResAny', q) : t('noRes', q || '@')) + '</b>' + escHtml(texteVide())
                : '<b>' + escHtml(t('emptyTitle')) + '</b>' + escHtml(t('emptyHint'))) + '</div>';
            const vide = q || filtre === 'editor' ? (['mte', 'discuss', 'google'].includes(filtre) ? t('noResAny', q) : t('noRes', q || '@')) + ' ' + texteVide() : '';
            annoncerNombre(q && !enVol() ? t('nRes', 0) : '', q && !enVol() ? vide : '');
            champ.removeAttribute('aria-activedescendant');
            dessinerActif();
            return;
        }
        let html = '', groupe = '';
        lignes.forEach((l, i) => {
            if (l.entete) {
                groupe = t(TITRE_GROUPE[l.g]);
                // Les suggestions Google affichées hors d'une carte Google portent la mention « powered by
                // Google » (conditions de Places Autocomplete) ; elle ne se traduit pas.
                html += '<div class="wos-gr" role="presentation"><span>' + escHtml(groupe) + '</span>' + (l.g === 'google' ? '<span class="wos-pbg" lang="en">powered by Google</span>' : '') + '</div>';
                return;
            }
            if (l.sec) { html += '<div class="wos-sec" role="presentation">' + escHtml(l.label) + ' <span>' + l.n + '</span></div>'; return; }
            if (l.sous) { html += '<div class="wos-sous" role="presentation">' + escHtml(l.label) + ' <span>· ' + l.n + '</span></div>'; return; }
            if (l.info) { html += '<div class="wos-info" role="presentation">' + escHtml(l.label) + '</div>'; return; }
            if (l.action) {
                html += '<div class="wos-opt wos-act' + (l.det ? ' wos-det' : '') + '" role="option" id="wos-o' + i + '" data-i="' + i + '" aria-selected="' + (i === actif) + '">' +
                    '<span class="wos-txt"><div class="wos-l1">' + escHtml(l.label) + '</div></span><span class="wos-droite"><span class="wos-entree" aria-hidden="true">↵</span></span></div>';
                return;
            }
            const picto = PICTO[l.k] || PICTO.coords;
            const ouvert = l.tete && l.editeur === edOuvert;
            const droite = [
                l.idTxt ? '<span class="wos-id">' + escHtml(l.idTxt) + '</span>' : '',
                l.vue && !l.det ? '<span class="wos-vue" title="' + escHtml(t('inView')) + '"></span>' : '',
                l.distAff != null && !l.vue && !l.det && !l.tete ? '<span>' + distanceTxt(l.distAff) + '</span>' : '',
                l.gp ? '<button type="button" class="wos-chev wos-gmap" tabindex="-1" data-gmap="' + i + '" title="' + escHtml(t('gmapOpen')) + '" aria-label="' + escHtml(t('gmapOpen')) + '">' + PICTO.google + '</button>' : '',
                '<span class="wos-entree" aria-hidden="true">↵</span>',
                l.tete ? '<button type="button" class="wos-chev" data-chev="' + escHtml(l.editeur) + '" aria-expanded="' + ouvert + '" title="' + escHtml(t('edToggle')) + '">' + CHEVRON + '</button>' : '',
            ].join('');
            const classes = 'wos-opt' + (l.inerte ? ' wos-inerte' : '') + (l.det ? ' wos-det' : '') + (l.tete ? ' wos-ed-tete' : '');
            // Sans extrait, la bulle donne le libellé entier, que la largeur peut couper (audit n° 51).
            const bulle = l.tete || l.profil ? t('edProfile') : l.extrait || [l.label, l.sub].filter(Boolean).join(' — ');
            // La catégorie et l'état du dépli sont dits au lecteur d'écran, pas montrés (audit n° 35).
            // Le bouton G n'est pas atteignable au Tab (le focus reste au champ) : son raccourci est dit.
            const pourLecteur = (l.det ? '' : groupe + ' : ') + (l.tete ? (ouvert ? t('srOpen') : t('srClosed')) + ', ' : '') + (l.gp ? t('gmapOpen') + ', ' : '');
            html += '<div class="' + classes + '" role="option" id="wos-o' + i + '" data-i="' + i + '" aria-selected="' + (i === actif) + '"' + (bulle ? ' title="' + escHtml(bulle) + '"' : '') + '>' +
                '<span class="wos-ico wos-k-' + escHtml(PICTO[l.k] ? l.k : 'coords') + '">' + picto + '</span>' +
                '<span class="wos-txt"><div class="wos-l1"><span class="wos-sr">' + escHtml(pourLecteur) + '</span><bdi>' + (l.html || escHtml(l.label)) + '</bdi></div>' + (l.sub ? '<div class="wos-l2">' + escHtml(l.sub) + '</div>' : '') + '</span>' +
                '<span class="wos-droite">' + droite + '</span></div>';
        });
        liste.innerHTML = html;
        const n = derniers && q ? derniers.n : lignes.filter(resultat).length;
        annoncerNombre(q ? t('nRes', n) : '');
        if (actif >= 0) champ.setAttribute('aria-activedescendant', 'wos-o' + actif); else champ.removeAttribute('aria-activedescendant');
        dessinerActif();
    }

    // Le compte s'affiche tout de suite, mais n'est ANNONCÉ qu'une fois stable (≈ 600 ms) et s'il
    // a changé : il était lu jusqu'à 6 fois par frappe, une fois par source (audit n° 35).
    let minuterieNombre = null, nombreAnnonce = '';
    function annoncerNombre(txt, parle) {
        nbEl.textContent = txt;
        const dit = parle || txt;
        clearTimeout(minuterieNombre);
        minuterieNombre = setTimeout(() => { if (dit !== nombreAnnonce) { nombreAnnonce = dit; annonce.textContent = dit; } }, 600);
    }

    function activer(i, defiler) {
        if (i === actif || i < 0 || i >= lignes.length || !selectionnable(lignes[i])) return;
        const avant = liste.querySelector('#wos-o' + actif);
        if (avant) avant.setAttribute('aria-selected', 'false');
        actif = i;
        const el = liste.querySelector('#wos-o' + i);
        if (el) { el.setAttribute('aria-selected', 'true'); if (defiler) el.scrollIntoView({ block: 'nearest' }); }
        champ.setAttribute('aria-activedescendant', 'wos-o' + i);
        dessinerActif();
    }

    let minuterieApercu = null;
    function dessinerActif() {
        clearTimeout(minuterieApercu);
        // Pendant le flash d'un choix, l'aperçu attend sa fin (puis la fin du flash le redessine).
        if (flashMinuterie) return;
        const l = lignes[actif];
        minuterieApercu = setTimeout(() => { if (ouverte) dessiner(selectionnable(l) ? l.geo : []); }, 60);
    }

    function deplacer(pas) {
        const n = lignes.length;
        if (!n) return;
        let i = actif;
        for (let k = 0; k < n; k++) {
            i = (i + pas + n) % n;
            if (selectionnable(lignes[i])) { activer(i, true); return; }
        }
    }

    // Ctrl+Alt+flèches déplace la fenêtre, avec Maj elle se redimensionne (Alt+← seul est « page
    // précédente » dans le navigateur) — l'alternative au glisser (audit n° 35).
    function geomClavier(k, taille) {
        const pas = 24, d = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] }[k];
        if (!d) return false;
        const g = { x: pal.offsetLeft, y: pal.offsetTop, w: pal.offsetWidth, h: geom && geom.h ? pal.offsetHeight : null };
        if (taille) { g.w += d[0]; if (d[1]) g.h = Math.max(hMin(), pal.offsetHeight + d[1]); }
        else { g.x += d[0]; g.y += d[1]; }
        geom = g; appliquerGeom();
        geom = geomAffichee(!!g.h); ecrireGeom();
        return true;
    }

    function surTouche(ev) {
        const k = ev.key;
        if (ev.ctrlKey && ev.altKey && geomClavier(k, ev.shiftKey)) { ev.preventDefault(); ev.stopPropagation(); return; }
        if (k === 'ArrowDown' || k === 'ArrowUp') { ev.preventDefault(); ev.stopPropagation(); deplacer(k === 'ArrowDown' ? 1 : -1); return; }
        // Sur l'en-tête d'un éditeur, la flèche du sens de lecture déplie et l'autre replie (→ en LTR,
        // ← en hébreu, convention ARIA APG) ; ailleurs, les flèches restent au champ.
        const l = lignes[actif];
        if ((k === 'ArrowRight' || k === 'ArrowLeft') && l && l.tete) {
            const ouvert = l.editeur === edOuvert, deplie = _lang === 'he' ? 'ArrowLeft' : 'ArrowRight';
            if ((k === deplie) !== ouvert) { ev.preventDefault(); ev.stopPropagation(); basculerEditeur(l.editeur); }
            return;
        }
        if (k === 'Enter') {
            ev.preventDefault(); ev.stopPropagation();
            // Alt+Entrée : la fiche Google d'un lieu Waze rattaché.
            // Sans Ctrl : Ctrl+Alt est AltGr sur un clavier français. Trois états (audit 0.07 n° 1) : fiche
            // ouverte, rattachement INCONNU (lieu pas encore chargé), aucun rattachement (lu et vide).
            if (ev.altKey && !ev.ctrlKey && !ev.metaKey) {
                const l = lignes[actif];
                if (actif < 0 || !resultat(l)) return;
                if (!ouvrirGoogleMaps(l)) etatTexte(t(l.k === 'venue' && !l.gpLu ? 'gmapUnknown' : 'gmapNone'));
                return;
            }
            if (actif >= 0) executer(actif, ev.ctrlKey || ev.metaKey ? 'copier' : ev.shiftKey ? 'onglet' : 'aller');
            return;
        }
        if (k === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fermer(); return; }
        if (k === 'Tab') {
            ev.preventDefault(); ev.stopPropagation();
            const i = FILTRES.findIndex(f => f.id === filtre);
            choisirFiltre(FILTRES[(i + (ev.shiftKey ? -1 : 1) + FILTRES.length) % FILTRES.length].id);
        }
    }

    // Après un choix, la fenêtre reste ouverte pour enchaîner les résultats ; l'option « Fermer
    // après un choix » rétablit l'ancien comportement (demande de l'auteur, 30/10/2026).
    const apresChoix = () => { if (opts.fermer) fermer(); };
    const reprendreLaMain = () => { if (ouverte) champ.focus(); };

    async function executer(i, mode) {
        const l = lignes[i];
        if (!selectionnable(l) || l.inerte) return;
        if (l.action === 'plus') { ouverts.add(l.cle); relancer(); return; }
        if (l.action === 'effacer') { ecrireRecents([]); relancer(); return; }
        if (l.histo) { await lireHistoriqueEcran(); return; }
        // Un éditeur : depuis « Tout », on ouvre sa fiche dans l'onglet Éditeurs ; dans l'onglet
        // Éditeurs, son nom ouvre son profil (le dépli se fait par la flèche ou par →).
        if (l.editeur) {
            // Sans rien à l'écran, il n'a pas de fiche : son profil s'ouvre directement, d'où qu'on vienne.
            if (filtre !== 'editor' && !l.profil) { edOuvert = l.editeur; choisirFiltre('editor'); return; }
            let url = null;
            try { url = await sdk.DataModel.Users.getLocalizedUserProfileLink({ userName: l.editeur }); } catch (e) { log('profil : ' + e.message); }
            if (!url) return;
            if (mode === 'copier') { try { await navigator.clipboard.writeText(url); toast(t('copied')); } catch (e) { toast(t('copyFail')); } return; }
            window.open(url, '_blank', 'noopener');
            return;
        }
        if (l.elargir) { await elargir(l.elargir); return; }
        if (l.mteId && !l.cible) {
            try {
                const r = await fetch(descartes() + '/app/v1/Features/Closures?majorTrafficEventId=' + encodeURIComponent(l.mteId), { credentials: 'same-origin' });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const j = await r.json();
                const rc = ((j.roadClosures && j.roadClosures.objects) || []).filter(x => x.geometry);
                const b = emprise(rc.map(x => x.geometry));
                if (b) { l.cible = { lon: (b[0] + b[2]) / 2, lat: (b[1] + b[3]) / 2, bbox: b, zoomMin: 12, sel: { objectType: 'segment', ids: [...new Set(rc.map(x => x.segID))] } }; l.geo = rc.map(x => x.geometry).slice(0, 300); }
            } catch (e) {
                // Un échec de lecture n'est pas « ce MTE n'a pas de fermeture » (audit n° 1).
                logUneFois('mtefer', 'fermetures du MTE : ' + e.message);
                etatTexte(t('mteClosuresErr', (/HTTP \d+/.exec(e.message) || [''])[0]), true);
                return;
            }
            if (!l.cible) { etatTexte(t('mteNoPlace')); return; }
        }
        if (l.lien) {
            if (mode === 'copier') { try { await navigator.clipboard.writeText(l.lien); toast(t('copied')); } catch (e) { toast(t('copyFail')); } return; }
            window.open(l.lien, '_blank', 'noopener');
            return;
        }
        let c = l.cible;
        if (!c && l.google) {
            try { c = await cibleGoogle(l); } catch (e) { etatTexte(t('googleErr'), true); log('Google, lieu : ' + e.message); return; }
        }
        if (!c) return;
        c.geo = l.geo;
        if (mode === 'copier') {
            try { await navigator.clipboard.writeText(permalien(c)); toast(t('copied')); }
            catch (e) { toast(t('copyFail')); }
            if (!l.det) apresChoix();
            return;
        }
        if (mode === 'onglet') { window.open(permalien(c), '_blank', 'noopener'); return; }
        // Un objet de la fiche d'un éditeur : on y va et on le sélectionne, la fenêtre reste ouverte
        // pour passer au suivant (demande de l'auteur, 30/10/2026).
        if (l.det) { await allerA(c); reprendreLaMain(); return; }
        retenir(l, c);
        apresChoix();
        await allerA(c);
        reprendreLaMain();
        // Un lieu distant est maintenant chargé : UNE relance, et sa ligne vient de l'index avec son
        // rattachement Google lu (audit 0.07 n° 1) — pas une relance par chargement de données.
        if (l.k === 'venue' && !l.gpLu && ouverte && champ.value.trim()) { invaliderIndex(); relancer(); }
    }

    // =====================================================================
    //  Fermetures et MTE — par le service Features, comme WCT
    // =====================================================================

    // RoadClosures.getAll() LÈVE dès qu'une fermeture chargée n'a pas d'attributions (relevé par
    // WCT le 23/09/2026, ticket SDK 566467873 ; toujours vrai en v2.374 le 30/10/2026). WCT lit donc
    // les fermetures par le service Features, sur la vue élargie d'un quart de chaque côté, valable
    // tant que la vue tient dedans. Les auteurs y sont des NUMÉROS, et la réponse porte la table
    // numéro → pseudo. Mesuré : ±0,1° autour de Montpellier = 862 fermetures, 0,9 Mo, 0,9 s.
    let fermeturesApi = { bbox: null, rc: [], mte: [], noms: new Map() }, fermeturesPromesse = null;
    const elargie = e => { const dx = (e[2] - e[0]) * 0.25, dy = (e[3] - e[1]) * 0.25; return [e[0] - dx, e[1] - dy, e[2] + dx, e[3] + dy]; };
    function lireFermetures(vue) {
        const b = fermeturesApi.bbox;
        if (b && vue && vue[0] >= b[0] && vue[1] >= b[1] && vue[2] <= b[2] && vue[3] <= b[3]) return Promise.resolve(fermeturesApi);
        if (fermeturesPromesse) return fermeturesPromesse;
        // Bornée à ±R_FERMETURES autour du centre, comme la lecture large (audit n° 29 : en vue large,
        // plusieurs Mo à chaque vue).
        const e = elargie(vue), cx = (e[0] + e[2]) / 2, cy = (e[1] + e[3]) / 2, borneR = rect([cx, cy], R_FERMETURES);
        const bbox = [Math.max(e[0], borneR[0]), Math.max(e[1], borneR[1]), Math.min(e[2], borneR[2]), Math.min(e[3], borneR[3])];
        fermeturesPromesse = (async () => {
            try {
                let z = 17;
                try { z = Math.round(await sdk.Map.getZoomLevel()); } catch (e) { }
                const r = await fetch(descartes() + '/app/Features?bbox=' + bbox.map(x => x.toFixed(5)).join(',') + '&language=en&v=2&apiV2=true&roadClosures=true&zoomLevel=' + z, { credentials: 'same-origin' });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const j = await r.json();
                fermeturesApi = {
                    bbox, rc: (j.roadClosures && j.roadClosures.objects) || [], mte: (j.majorTrafficEvents && j.majorTrafficEvents.objects) || [],
                    noms: new Map(((j.users && j.users.objects) || []).map(u => [u.id, u.userName])),
                };
            } catch (e) { logUneFois('fermetures', 'fermetures par le service Features : ' + e.message); }
            fermeturesPromesse = null;
            return fermeturesApi;
        })();
        return fermeturesPromesse;
    }

    // =====================================================================
    //  Éditeurs — tout ce qu'un éditeur a touché à l'écran
    // =====================================================================

    const SECTIONS = [
        { id: 'segment', t: 'secSeg' }, { id: 'venue', t: 'secVenue' }, { id: 'closure', t: 'secClosure' }, { id: 'hazard', t: 'secHazard' },
        { id: 'bigJunction', t: 'secJunction' }, { id: 'comment', t: 'secComment' }, { id: 'mte', t: 'secMte' },
    ];
    const ROLES = [{ id: 'cree', t: 'subCreated' }, { id: 'modif', t: 'subUpdated' }, { id: 'avant', t: 'subBefore' }];
    let edOuvert = null;
    const dateTxt = ms => ms ? formatIntl('DateTimeFormat', { dateStyle: 'medium' }).format(new Date(ms)) : '';

    function basculerEditeur(nom) {
        edOuvert = edOuvert === nom ? null : nom;
        relancer();
    }

    // Une fiche par objet qui a un auteur : de quoi l'afficher, y aller, et qui l'a créé ou modifié.
    // Le modèle de WME donne des PSEUDOS (modificationData) ; le service Features, des NUMÉROS.
    function fiches(ix, fa, vue) {
        const out = [];
        const touche = b => !vue || !b || !(b[2] < vue[0] || b[0] > vue[2] || b[3] < vue[1] || b[1] > vue[3]);
        const ajouter = (type, o, md, label, sub, sel, zoom, geo) => {
            geo = geo || o.geometry;
            if (geo && !touche(emprise([geo]))) return;
            if (!geo && type !== 'mte') return;
            const cible = geo ? cibleObjet(geo, sel, zoom) : null;
            if (cible && sel && o._api) cible.calques = calquesPour(sel.objectType, o);
            out.push({ type, id: o.id, par: md.createdBy, le: md.createdOn, modifPar: md.updatedBy, modifLe: md.updatedOn, label, sub, geo, cible });
        };
        const rueDe = s => ix.rueParId.get(s.primaryStreetId);
        for (const s of ix.segs) {
            const r = rueDe(s);
            // Une voie sans nom se reconnaît à son type : « Voie privée · Sans nom ».
            ajouter('segment', s, s.modificationData || {}, (r && !r.isEmpty && r.name) || [typesVoies && typesVoies.get(s.roadType), t('noName')].filter(Boolean).join(' · '),
                [r ? ix.nomVille(r.cityId) : '', 'ID ' + s.id].filter(Boolean).join(' · '), { objectType: 'segment', ids: [s.id] }, 17);
        }
        for (const l of ix.lieux) {
            const cat = (l.categories || []).map(c => ix.cats.get(c) || c)[0] || '';
            ajouter('venue', l, l.modificationData || {}, l.name || cat || t('kVenue'), cat, { objectType: 'venue', ids: [l.id] }, 18);
        }
        for (const z of ix.zones) ajouter('hazard', z, z.modificationData || {}, z.name || libelleType('hzTypes', z.type), '', { objectType: 'permanentHazard', ids: [z.id] }, 17);
        for (const b of ix.carrefours) ajouter('bigJunction', b, b.modificationData || {}, b.name || t('kJunction') + ' ' + b.id, ix.nomVille(b.cityId), { objectType: 'bigJunction', ids: [b.id] }, 18);
        for (const c of ix.commentaires) ajouter('comment', c, c.modificationData || {}, c.subject || t('kComment'), '', { objectType: 'mapComment', ids: [c.id] }, 18);
        const nom = n => fa.noms.get(n) || null;
        const segParId = new Map(ix.segs.map(s => [s.id, s]));
        for (const c of fa.rc) {
            if (/^FINISHED/.test(String(c.closureStatus || c.status || ''))) continue;   // une fermeture finie n'est plus « à l'écran »
            const seg = segParId.get(c.segID), r = seg && rueDe(seg);
            const geo = (c.geometry && c.geometry.type ? c.geometry : null) || (seg && seg.geometry);
            const quand = periode(c.startDate, c.endDate, true);
            ajouter('closure', c, { createdBy: nom(c.createdBy), createdOn: c.createdOn, updatedBy: nom(c.updatedBy), updatedOn: c.updatedOn },
                c.reason || (r && !r.isEmpty && r.name) || t('kClosure'), [quand, c.provider].filter(Boolean).join(' · '), { objectType: 'segment', ids: [c.segID] }, 17, geo);
        }
        for (const m of fa.mte) {
            const n = (m.names && m.names[0] && (m.names[0].value || m.names[0].name)) || m.uniqueName || t('kMte');
            ajouter('mte', m, { createdBy: nom(m.createdBy), createdOn: m.createdOn, updatedBy: nom(m.updatedBy), updatedOn: m.updatedOn },
                n, periode(m.startDate, m.endDate), null, 15, null);
        }
        return out;
    }

    // Les éditeurs de l'écran, chacun avec ses objets : créés, modifiés en dernier, et — si
    // l'historique a été lu — modifiés avant le dernier passage.
    // Recalculé à chaque frappe dans « Tout » (toutes les fiches de l'écran, dates formatées) alors que rien
    // n'a changé : gardé tant que l'index, les fermetures, la vue et l'historique sont les mêmes (audit 0.07
    // n° 23 ; mesuré dans Tampermonkey le 01/11/2026 avant correctif : 4 tâches de ≈ 120 ms pour 9 frappes).
    let memoEditeurs = null;
    function editeursALEcran(ix, vue) {
        const cle = (vue || []).map(x => x.toFixed(5)).join(',') + '|' + historique.size;
        if (memoEditeurs && memoEditeurs.ix === ix && memoEditeurs.fa === fermeturesApi && memoEditeurs.cle === cle) return memoEditeurs.v;
        const v = calculerEditeurs(ix, vue);
        memoEditeurs = { ix, fa: fermeturesApi, cle, v };
        return v;
    }
    function calculerEditeurs(ix, vue) {
        const eds = new Map();
        const de = n => {
            let e = eds.get(n);
            if (!e) eds.set(n, e = { nom: n, fiches: [], vus: new Set(), mots: motsDe(n), plein: norm(n) });
            return e;
        };
        for (const f of fiches(ix, fermeturesApi, vue)) {
            const cle = f.type + ':' + f.id;
            if (f.par) { const e = de(f.par); e.fiches.push({ f, role: 'cree', date: f.modifPar === f.par ? f.modifLe || f.le : f.le, aussi: f.modifPar === f.par && f.modifLe && f.modifLe !== f.le }); e.vus.add(cle); }
            if (f.modifPar && f.modifPar !== f.par) { const e = de(f.modifPar); e.fiches.push({ f, role: 'modif', date: f.modifLe }); e.vus.add(cle); }
            const h = historique.get(cle);
            if (h) for (const x of h.values()) {
                const e = de(x.nom);
                if (e.vus.has(cle)) continue;
                e.fiches.push({ f, role: 'avant', date: x.date });
                e.vus.add(cle);
            }
        }
        return [...eds.values()];
    }

    function resumeEditeur(e) {
        const n = new Map();
        for (const x of e.fiches) n.set(x.f.type, (n.get(x.f.type) || 0) + 1);
        return SECTIONS.filter(s => n.get(s.id)).map(s => t(s.t) + ' ' + n.get(s.id)).join(' · ') || t('edNothing');
    }

    // La fiche dépliée : une rubrique par nature d'objet, et dans chacune « créés », « modifiés en
    // dernier », « modifiés avant », du plus récent au plus ancien.
    function lignesEditeur(e) {
        const out = [];
        const reste = candidatsHistorique().length;
        if (reste) out.push({ g: 'editor', k: 'history', label: t('histBtn', reste), sub: t('histSub'), histo: true, det: true, geo: [] });
        if (!e.fiches.length) { out.push({ info: true, label: t('edNothing') }); return out; }
        for (const sec of SECTIONS) {
            const l = e.fiches.filter(x => x.f.type === sec.id);
            if (!l.length) continue;
            out.push({ sec: true, label: t(sec.t), n: l.length });
            for (const role of ROLES) {
                const items = l.filter(x => x.role === role.id).sort((a, b) => (b.date || 0) - (a.date || 0));
                if (!items.length) continue;
                out.push({ sous: true, label: t(role.t), n: items.length });
                const cle = e.nom + '|' + sec.id + '|' + role.id;
                const montrer = ouverts.has(cle) ? items : items.slice(0, PAR_SOUS_GROUPE);
                for (const x of montrer) {
                    const quand = x.date ? (role.id === 'cree' && !x.aussi ? t('whenCreated', dateTxt(x.date)) : t('whenChanged', dateTxt(x.date))) : '';
                    out.push({ g: 'editor', k: sec.id === 'hazard' ? 'hazard' : sec.id === 'comment' ? 'comment' : sec.id, det: true,
                        label: x.f.label, sub: [quand, x.f.sub].filter(Boolean).join(' · '), cible: x.f.cible, geo: x.f.geo ? [x.f.geo] : [], inerte: !x.f.cible });
                }
                        if (items.length > montrer.length) out.push({ action: 'plus', cle, label: t('moreN', items.length - montrer.length), det: true });
            }
        }
        return out;
    }

    // =====================================================================
    //  Historique des objets — ElementHistory, par le seul ID
    // =====================================================================

    // Mesuré le 30/10/2026 : ≈ 3 Ko et 0,1 s par objet ; les transactions portent l'auteur (numéro,
    // avec la table numéro → pseudo), la date, et les valeurs changées — parfois une géométrie.
    // `nextTransaction` donne la page suivante, à passer en `till`.
    const historique = new Map();     // 'segment:123' → Map(pseudo en minuscules → { nom, date })
    let histoJeton = 0;

    async function pagesHistorique(type, id, signal, max) {
        const base = descartes() + '/app/ElementHistory?objectID=' + encodeURIComponent(id) + '&objectType=' + type;
        const pages = [];
        let url = base;
        while (url && pages.length < max) {
            const r = await fetch(url, { credentials: 'same-origin', signal });
            // 404 : l'objet n'a pas d'historique. Toute autre erreur LÈVE (audit n° 7 : un 429 passager
            // était retenu comme « aucun historique » pour toute la session).
            if (r.status === 404) break;
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const j = await r.json();
            pages.push(j);
            const nt = j.transactions && j.transactions.nextTransaction;
            url = nt ? base + '&till=' + encodeURIComponent(nt) : null;
        }
        return pages;
    }

    function retenirHistorique(type, id, pages) {
        const m = new Map();
        for (const j of pages) {
            const noms = new Map(((j.users && j.users.objects) || []).map(u => [u.id, u.userName]));
            for (const tx of (j.transactions && j.transactions.objects) || []) {
                const n = noms.get(tx.userID);
                if (!n) continue;
                const k = n.toLowerCase(), d = m.get(k);
                if (!d || d.date < tx.date) m.set(k, { nom: n, date: tx.date });
            }
        }
        historique.set(type + ':' + id, m);
    }

    // Segments et lieux à l'écran dont l'historique n'est pas encore lu, les plus proches d'abord.
    let candidatsCache = [];
    function candidatsHistorique() { return candidatsCache.filter(f => !historique.has(f.type + ':' + f.id)); }
    async function majCandidats() {
        try {
            const ix = await lireIndex(), vue = await sdk.Map.getMapExtent(), c = await sdk.Map.getMapCenter();
            const centre = [c.lon, c.lat];
            candidatsCache = fiches(ix, { rc: [], mte: [], noms: new Map() }, vue).filter(f => f.type === 'segment' || f.type === 'venue')
                .map(f => Object.assign(f, { d: metres(centre, centreDe(f.geo) || centre) })).sort((a, b) => a.d - b.d).slice(0, HISTO_MAX);
        } catch (e) { candidatsCache = []; }
    }

    // À la demande : l'historique des objets de l'écran, six à la fois, annulable (fermeture, ou
    // nouvelle demande). Chaque éditeur en profite : la lecture porte sur les OBJETS.
    async function lireHistoriqueEcran() {
        const jeton = ++histoJeton;
        const ctrl = new AbortController();
        const a = candidatsHistorique(), total = a.length;
        let fait = 0, rates = 0, limite = false;
        histoEnCours = true;
        const travail = async () => {
            while (a.length) {
                if (jeton !== histoJeton || !ouverte || limite) { ctrl.abort(); return; }
                const f = a.shift();
                // Un objet en échec n'est PAS retenu : il reste à lire, et la fiche le dit.
                try { retenirHistorique(f.type, f.id, await pagesHistorique(f.type, f.id, ctrl.signal, HISTO_PAGES)); }
                catch (e) {
                    if (ctrl.signal.aborted) return;
                    rates++;
                    logUneFois('histo-' + e.message, 'historique : ' + e.message);
                    if (/HTTP 429/.test(e.message)) limite = true;   // Waze limite : on s'arrête, on le dit
                }
                fait++;
                if (jeton === histoJeton) etatTexte(t('histRun', fait, total));
            }
        };
        try { await Promise.all(Array.from({ length: 6 }, travail)); }
        finally { if (jeton === histoJeton) histoEnCours = false; }
        if (jeton !== histoJeton || !ouverte) return;
        const restants = a.length + rates;
        etatTexte(limite ? t('histStopped', restants) : rates ? t('histPartial', rates) : '', !!(limite || rates));
        relancer();
    }

    // =====================================================================
    //  Localiser un ID absent — par son historique, n'importe où
    // =====================================================================

    // L'historique d'un segment porte une géométrie (sa création, une fermeture, un tracé modifié)
    // ou les villes de ses rues ; à défaut, celui d'un segment VOISIN, nommé par ses connexions.
    // Mesuré le 30/10/2026 sur 40 segments de Lyon : 30 par le leur, 4 par un voisin (≤ 200 m),
    // 6 sans indice ; ≈ 3 requêtes de 3 Ko par segment.
    const localisations = new Map();  // 'segment:123' → { pt, ville, type } | null
    const localisationsEnCours = new Map();
    const erreursLoc = new Map();     // 'segment:123' → cause de l'échec de la dernière tentative
    let minuterieLoc = null;

    // Les attributs utiles à l'allumage du bon calque, lus dans la première transaction qui les porte.
    function sorteDans(pages) {
        const r = {};
        for (const j of pages) for (const tx of (j.transactions && j.transactions.objects) || []) for (const o of tx.objects || []) {
            const v = Object.assign({}, o.oldValue || {}, o.newValue || {});
            if (r.type == null && typeof v.type === 'number') r.type = v.type;
            if (r.categories == null && Array.isArray(v.categories)) r.categories = v.categories;
            if (r.isResidential == null && typeof v.residential === 'boolean') r.isResidential = v.residential;
        }
        return r;
    }

    function indiceDans(pages) {
        let ville = null;
        for (const j of pages) {
            const v = ((j.cities && j.cities.objects) || []).find(c => c.name);
            if (v && !ville) ville = v.name;
        }
        for (const j of pages) for (const tx of (j.transactions && j.transactions.objects) || []) for (const o of tx.objects || []) {
            const g = (o.newValue && o.newValue.geometry) || (o.oldValue && o.oldValue.geometry);
            if (!g || !g.coordinates) continue;
            let c = g.coordinates;
            while (Array.isArray(c[0])) c = c[0];
            if (coordOk(c[1], c[0])) return { pt: [c[0], c[1]], ville };
        }
        for (const j of pages) {
            const v = ((j.cities && j.cities.objects) || []).find(c => c.geometry && c.geometry.coordinates);
            if (v) return { pt: v.geometry.coordinates, ville: v.name, approx: true };
        }
        return null;
    }

    async function localiser(type, id, signal) {
        let pages = await pagesHistorique(type, id, signal, 8);
        // Un nombre seul peut être un nœud : sans transaction comme segment, on essaie comme nœud.
        if (type === 'segment' && !pages.some(j => ((j.transactions && j.transactions.objects) || []).length)) {
            const n = await pagesHistorique('node', id, signal, 4);
            if (n.some(j => ((j.transactions && j.transactions.objects) || []).length)) { pages = n; type = 'node'; }
        }
        // Ni segment ni nœud : un radar ou une zone (leur historique porte la géométrie, mesuré).
        if (type === 'segment' && !pages.some(j => ((j.transactions && j.transactions.objects) || []).length)) {
            const z = await pagesHistorique('permanentHazard', id, signal, 2);
            if (z.some(j => ((j.transactions && j.transactions.objects) || []).length)) { pages = z; type = 'permanentHazard'; }
        }
        let loc = indiceDans(pages);
        if (!loc && type === 'segment') {
            const voisins = new Set();
            for (const j of pages) for (const tx of (j.transactions && j.transactions.objects) || []) for (const o of tx.objects || []) {
                if (o.objectType !== 'nodeConnection' || !o.objectID) continue;
                for (const v of [o.objectID.fromSegID, o.objectID.toSegID]) if (v && v !== id) voisins.add(v);
            }
            for (const v of [...voisins].slice(0, 6)) {
                loc = indiceDans(await pagesHistorique('segment', v, signal, 4));
                if (loc) { loc.voisin = true; break; }
            }
        }
        return loc ? Object.assign(loc, { type, sorte: sorteDans(pages) }) : null;
    }

    function lancerLocalisation(type, id, q) {
        const cle = type + ':' + id;
        if (localisationsEnCours.has(cle)) return localisationsEnCours.get(cle);
        // Un échec réseau n'est PAS retenu comme « non localisé » (audit n° 7) : la clé n'est pas
        // mise en cache, la ligne dit l'erreur, et Entrée réessaie.
        const p = localiser(type, id).then(loc => ({ loc }), e => { logUneFois('loc-' + e.message, 'localisation : ' + e.message); return { erreur: (/HTTP \d+/.exec(e.message) || [''])[0] || '?' }; })
            .then(({ loc, erreur }) => {
                if (erreur) { erreursLoc.set(cle, erreur); loc = null; }
                else { localisations.set(cle, loc); erreursLoc.delete(cle); }
                localisationsEnCours.delete(cle);
                if (ouverte && q != null && champ.value.trim() === q) relancer();
                return loc;
            });
        localisationsEnCours.set(cle, p);
        return p;
    }

    // =====================================================================
    //  Aller à un ID absent
    // =====================================================================

    // Localisé : on cherche l'objet exact dans la carte AUTOUR du point (dalles, la plus proche
    // d'abord) ; pour un lieu (le service refuse les lieux, 406), on va au point et l'on attend que
    // WME le charge. Sans indice, on cherche autour de l'écran. Dalles : ±0,02° (≈ 3 km) pèse 5,5 Mo
    // et répond en 0,85 s à Montpellier ; au-delà de ±0,05°, Waze ne rend plus que les grands axes.
    // ⚠️ Un déplacement déclenche « wme-map-move-end », qui relance la recherche (et change sa
    // génération) : l'élargissement a donc son PROPRE jeton, et la relance est suspendue pendant
    // qu'il tourne. Avec la génération de la recherche, il s'arrêtait en silence au premier palier.
    let elargissement = 0, abandon = null;
    const descartes = () => (region === 'usa' || region === 'na') ? '/Descartes' : '/' + region + '-Descartes';

    // Un ID déjà cherché sans succès autour du même centre n'est pas recherché de nouveau (audit n° 45),
    // et la recherche s'arrête à 15 Mo lus — elle le dit.
    const DALLES_BUDGET = 15e6;
    const absentsDalles = new Set();
    async function chercherEnDalles(centre, idsNum, signal, arrete) {
        const id = idsNum[0];
        const cleAbsent = id + '|' + centre.map(x => (Math.round(x / 0.02) * 0.02).toFixed(2)).join(',');
        if (absentsDalles.has(cleAbsent)) return null;
        let lus = 0;
        const dalles = [];
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dalles.push([dx, dy]);
        dalles.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
        for (let k = 0; k < dalles.length; k++) {
            const [dx, dy] = dalles[k];
            const b = [centre[0] + (dx - 0.5) * DALLE[0], centre[1] + (dy - 0.5) * DALLE[1], centre[0] + (dx + 0.5) * DALLE[0], centre[1] + (dy + 0.5) * DALLE[1]];
            etatTexte(t('widening', k + 1, dalles.length));
            let j = null;
            try {
                const r = await fetch(descartes() + '/app/Features?bbox=' + b.map(x => x.toFixed(5)).join(',') + '&language=en&v=2&apiV2=true&roadClosures=false&zoomLevel=17&roadTypes=' + TYPES_VOIES, { credentials: 'same-origin', signal });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const txt = await r.text();
                lus += txt.length;
                j = JSON.parse(txt);
            } catch (x) {
                if (signal.aborted) return null;
                // Une dalle en échec : la recherche n'est PAS « sans résultat », on s'arrête et on le dit.
                logUneFois('dalle', 'chercher alentour : ' + x.message);
                return { erreur: (/HTTP \d+/.exec(x.message) || [''])[0] || '?' };
            }
            if (arrete()) return null;
            const seg = j && ((j.segments && j.segments.objects) || []).find(o => o.id === id);
            const noeud = !seg && j && ((j.nodes && j.nodes.objects) || []).find(o => o.id === id);
            if (seg) return { g: seg.geometry, cible: cibleObjet(seg.geometry, { objectType: 'segment', ids: idsNum }, 17), k: 'segment' };
            if (noeud) return { g: noeud.geometry, cible: { lon: noeud.geometry.coordinates[0], lat: noeud.geometry.coordinates[1], zoom: 19, sel: { objectType: 'node', ids: [id] } }, k: 'node' };
            if (lus > DALLES_BUDGET && k < dalles.length - 1) return { budget: true };
        }
        absentsDalles.add(cleAbsent);
        return null;
    }

    async function elargir(e) {
        const jeton = ++elargissement;
        if (abandon) abandon.abort();
        abandon = new AbortController();
        const signal = abandon.signal;
        const fini = () => { if (jeton === elargissement) elargissement = 0; };
        const arrete = () => jeton !== elargissement || !ouverte;
        const quoi = e.idLieu || e.idsNum.join(', ');
        const type = e.idLieu ? 'venue' : 'segment', id = e.idLieu || e.idsNum[0], cle = type + ':' + id;

        etatTexte(t('locating'));
        let loc = localisations.has(cle) ? localisations.get(cle) : await lancerLocalisation(type, id, null);
        if (!localisations.has(cle) && erreursLoc.has(cle)) { fini(); etatTexte(t('locateErr', erreursLoc.get(cle)), true); return; }
        if (arrete()) return fini();

        if (e.idLieu) {
            // Un lieu (ou un commentaire) : on va au point de son historique, WME le charge, on le sélectionne.
            if (loc) {
                fini(); etatTexte('');
                const sorte = loc.sorte || {}, connue = sorte.isResidential != null || sorte.categories;
                const sel = { objectType: 'venue', ids: [e.idLieu] }, calques = calquesPour('venue', sorte);
                const cible = { lon: loc.pt[0], lat: loc.pt[1], zoom: 18, sel, calques, repli: connue ? null : REPLI_LIEU, approx: !!loc.approx };
                retenir({ label: t('kVenue') + ' ' + e.idLieu, sub: loc.ville || '', k: 'venue' }, cible);
                apresChoix();
                await allerA(cible);
                reprendreLaMain();
                return;
            }
            fini();
            etatTexte(t('notFound', quoi), true);
            return;
        }

        if (loc && loc.type === 'permanentHazard') {
            fini(); etatTexte('');
            const sel = { objectType: 'permanentHazard', ids: [id] };
            const cible = { lon: loc.pt[0], lat: loc.pt[1], zoom: 18, sel, calques: calquesPour('permanentHazard', { type: TYPES_ZONE[(loc.sorte || {}).type] }), approx: !!loc.approx };
            retenir({ label: t('kHazard') + ' ' + id, sub: loc.ville || '', k: 'hazard' }, cible);
            apresChoix();
            await allerA(cible);
            reprendreLaMain();
            return;
        }
        let centre = null;
        if (loc) centre = loc.pt;
        else { try { const c = await sdk.Map.getMapCenter(); centre = [c.lon, c.lat]; } catch (x) { centre = [0, 0]; } }
        let trouve = await chercherEnDalles(centre, e.idsNum, signal, arrete);
        if (arrete()) return fini();
        fini();
        if (trouve && trouve.erreur) { etatTexte(t('widenErr', trouve.erreur), true); return; }
        if (trouve && trouve.budget) { etatTexte(t('widenBudget', quoi), true); return; }
        if (!trouve && loc) {
            // L'indice est sûr mais l'objet n'est pas dans les dalles (ville trop éloignée, type de
            // voie non demandé) : on va au point, WME charge, et la sélection se pose si l'objet y est.
            etatTexte('');
            apresChoix();
            await allerA({ lon: loc.pt[0], lat: loc.pt[1], zoom: 17, approx: !!loc.approx, sel: { objectType: loc.type === 'node' ? 'node' : 'segment', ids: loc.type === 'node' ? [id] : e.idsNum } });
            reprendreLaMain();
            return;
        }
        if (!trouve) { etatTexte(t('notFound', quoi), true); return; }
        etatTexte('');
        trouve.cible.geo = [trouve.g];
        retenir({ label: (trouve.k === 'segment' ? t('kSeg') : t('kNode')) + ' ' + id, sub: loc && loc.ville || '', k: trouve.k }, trouve.cible);
        apresChoix();
        await allerA(trouve.cible);
        reprendreLaMain();
    }

    function toast(txt) {
        const d = document.createElement('div');
        d.className = 'wos-toast';
        d.setAttribute('aria-hidden', 'true');
        d.textContent = txt;
        if (annonce) annonce.textContent = txt;
        couche().appendChild(d);
        const zone = document.querySelector('div.edit-area-main');
        d.style.left = Math.max(12, ((zone ? zone.clientWidth : window.innerWidth) - d.offsetWidth) / 2) + 'px';
        setTimeout(() => d.remove(), 2000);
    }

    // =====================================================================
    //  Récents — les huit dernières destinations, dans ce navigateur
    // =====================================================================

    function lireRecents() {
        // Validés à la lecture (audit n° 53) : un libellé, une position finie, une sorte connue.
        const valide = r => r && typeof r.label === 'string' && r.cible && isFinite(r.cible.lon) && isFinite(r.cible.lat) && (!r.k || PICTO[r.k]);
        try { const v = JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); return Array.isArray(v) ? v.filter(valide) : []; } catch (e) { return []; }
    }
    function ecrireRecents(v) { try { localStorage.setItem(RECENTS_KEY, JSON.stringify(v)); } catch (e) { } }
    function retenir(l, c) {
        const cible = { lon: c.lon, lat: c.lat, zoom: c.zoom, bbox: c.bbox, zoomMin: c.zoomMin, sel: c.sel && c.sel.ids.length <= 50 ? c.sel : null, calques: c.calques };
        // Le rattachement Google suit dans les récents ; la sorte de lieu inconnue garde son repli.
        if (c.repli) cible.repli = c.repli;
        const r = { label: l.label, sub: l.sub, k: l.k, cible };
        if (l.gp) r.gp = l.gp;
        ecrireRecents([r, ...lireRecents().filter(x => !(x.label === r.label && x.sub === r.sub))].slice(0, RECENTS_MAX));
    }
    function recents() {
        const v = lireRecents();
        if (!v.length) return [];
        return [{ entete: true, g: 'recent', plus: 0 }, ...v.map(r => ({ g: 'recent', k: r.k || 'recent', label: r.label, sub: r.sub, cible: r.cible, gp: typeof r.gp === 'string' ? r.gp : null, geo: [{ type: 'Point', coordinates: [r.cible.lon, r.cible.lat] }] }))];
    }

    // =====================================================================
    //  Ouverture — Ctrl+K (⌘K), « / », et le bouton près de la recherche de WME
    // =====================================================================

    const enSaisie = el => !!(el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) ||
        (el.shadowRoot && el.shadowRoot.activeElement && enSaisie(el.shadowRoot.activeElement)) || /^WZ-(TEXT|TEXTAREA|AUTOCOMPLETE|SELECT)/.test(el.tagName)));

    function surToucheGlobale(ev) {
        if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && !ev.shiftKey && (ev.key === 'k' || ev.key === 'K')) {
            ev.preventDefault(); ev.stopPropagation();
            if (ouverte) { champ.focus(); champ.select(); } else ouvrir();
            return;
        }
        if (opts.slash && ev.key === '/' && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ouverte && !enSaisie(ev.target) && !enSaisie(document.activeElement)) {
            ev.preventDefault(); ev.stopPropagation();
            ouvrir();
        }
    }
    // Hors de la fenêtre, un clic ne la ferme que si l'option « Fermer après un choix » est cochée,
    // et jamais dans l'onglet Éditeurs : la fenêtre restée ouverte doit survivre au clic qu'on fait
    // sur la carte pour examiner l'objet choisi.
    function surClicGlobal(ev) {
        if (!ouverte || !opts.fermer || filtre === 'editor') return;
        if (pal.contains(ev.target) || ev.target.closest('.wos-nbtn')) return;
        fermer();
    }

    function poserBoutonNatif() {
        const deja = document.querySelector('.wos-nbtn');
        if (!opts.bouton) { if (deja) deja.remove(); return; }
        const champNatif = document.querySelector('#search-autocomplete');
        if (!champNatif || !champNatif.parentElement) return;
        if (deja && deja.previousElementSibling === champNatif) return;   // déjà en place : rien à faire
        if (deja) deja.remove();
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'wos-nbtn';
        b.title = t('btnTip') + ' (' + toucheK() + ')';
        b.setAttribute('aria-label', t('btnTip'));
        b.innerHTML = icone(16) + '<kbd>' + escHtml(toucheK()) + '</kbd>';
        b.addEventListener('click', () => { if (ouverte) fermer(); else ouvrir(); });
        champNatif.insertAdjacentElement('afterend', b);
    }

    // =====================================================================
    //  Nouvelle version publiée — même mécanique que WCT, WRP, WDA et WJN
    // =====================================================================
    //  La pastille ne s'allume que sur une version PUBLIÉE strictement supérieure à celle qui tourne ;
    //  hors ligne, réponse illisible ou page absente, elle reste éteinte. On lit le .meta.js de
    //  GreasyFork (quelques centaines d'octets), au plus une fois par 24 h.

    const URL_MAJ = gmScript().updateURL || (N_GF ? 'https://update.greasyfork.org/scripts/' + N_GF + '/WME%20Omnisearch.meta.js' : '');
    const URL_INSTALLER = gmScript().downloadURL || (N_GF ? 'https://update.greasyfork.org/scripts/' + N_GF + '/WME%20Omnisearch.user.js' : URL_GF);
    const VER_RE = /^\d+(\.\d+)*$/;
    const MAJ_KEY = 'wos.maj.v1', MAJ_DELAI = 864e5;
    let majEnLigne = null;
    // Segment par segment, en nombres : en chaînes, « 0.9.00 » passerait pour plus récent que « 0.13.00 ».
    const majCmp = (a, b) => {
        const pa = String(a).split('.'), pb = String(b).split('.');
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const x = Number(pa[i]) || 0, y = Number(pb[i]) || 0;
            if (x !== y) return x < y ? -1 : 1;
        }
        return 0;
    };
    function majRendre() {
        const e = document.getElementById('wos-sb-maj');
        if (e) { e.hidden = !majEnLigne; if (majEnLigne) e.querySelector('span').textContent = t('majBtn', majEnLigne); }
    }
    function verifierMaj() {
        if (!URL_MAJ || !VER_RE.test(VERSION) || typeof GM_xmlhttpRequest !== 'function') return;
        let memo = null;
        try { memo = JSON.parse(localStorage.getItem(MAJ_KEY) || 'null'); } catch (e) { }
        if (memo && Date.now() - memo.t < MAJ_DELAI) {
            if (memo.v && VER_RE.test(memo.v) && majCmp(VERSION, memo.v) < 0) { majEnLigne = memo.v; majRendre(); }
            return;
        }
        const retenir = v => { try { localStorage.setItem(MAJ_KEY, JSON.stringify({ t: Date.now(), v })); } catch (e) { } };
        GM_xmlhttpRequest({
            method: 'GET', url: URL_MAJ, timeout: 10000, nocache: true,
            onload: r => {
                // onload vient AUSSI sur un 404 : la page d'erreur ne doit pas être lue comme un script.
                if (r.status < 200 || r.status >= 300) { retenir(null); return; }
                const m = (r.responseText || '').match(/^\/\/\s*@version\s+(\S+)/m);
                retenir(m && VER_RE.test(m[1]) ? m[1] : null);
                if (!m || !VER_RE.test(m[1]) || majCmp(VERSION, m[1]) >= 0) return;
                majEnLigne = m[1];
                majRendre();
                log('nouvelle version publiée : ' + m[1] + ' (installée : ' + VERSION + ')');
            },
            onerror: () => { }, ontimeout: () => { },
        });
    }

    // =====================================================================
    //  Onglet Scripts — même ossature que celui de WCT
    // =====================================================================

    const AIDE = [
        { id: 'type', t: 'hTypeT', b: 'hTypeB' },
        { id: 'keys', t: 'hKeysT', b: 'hKeysB' },
        { id: 'ed', t: 'hEdT', b: 'hEdB' },
        { id: 'src', t: 'hSrcT', b: 'hSrcB' },
    ];
    // Une rubrique repliée pointe vers le sens de lecture : ▶ en LTR, ◀ en hébreu.
    const REPLIE = _lang === 'he' ? '&#x25C0;' : '&#x25B6;';
    const interrupteur = (id, lib, coche, aide) => `
    <div class="wos-toggle-row">
        <label class="wos-toggle-lbl" for="${id}">${lib}</label>
        <label class="wos-toggle"><input type="checkbox" id="${id}" ${coche ? 'checked' : ''}><span class="wos-toggle-slider"></span></label>
    </div>${aide ? `<p class="wos-sb-hint" style="margin-top:3px">${aide}</p>` : ''}`;

    const construireOnglet = () => `
<div id="wos-sidebar" dir="${_lang === 'he' ? 'rtl' : 'ltr'}">
    <h2><span class="wos-sb-ico">${icone(18)}</span>${SCRIPT_NAME} <span class="wos-sb-ver">v${VERSION}</span></h2>
    <p class="wos-sb-maj" id="wos-sb-maj" hidden><span></span> <a href="#" id="wos-maj">${t('majInstall')}</a></p>
    <p class="wos-sb-hint">${t('sbHint')}</p>
    <div class="wos-sb-sec">&#x2328;&#xFE0F; ${t('sbKeys')}</div>
    <button type="button" class="wos-sb-ouvrir" id="wos-sb-ouvrir">${t('btnTip')} <kbd>${escHtml(toucheK())}</kbd></button>
    <div class="wos-sb-sec">&#x2699;&#xFE0F; ${t('sbOpts')}</div>
    ${interrupteur('wos-o-google', t('optGoogle'), opts.google, t('optGoogleHint'))}
    ${interrupteur('wos-o-discuss', t('optDiscuss'), opts.discuss, t('optDiscussHint'))}
    ${interrupteur('wos-o-entreprises', t('optCompanies'), opts.entreprises, t('optCompaniesHint'))}
    ${interrupteur('wos-o-slash', t('optSlash'), opts.slash, t('optSlashHint'))}
    ${interrupteur('wos-o-bouton', t('optBtn'), opts.bouton, '')}
    ${interrupteur('wos-o-fermer', t('optClose'), opts.fermer, t('optCloseHint'))}
    <div class="wos-sb-sec">&#x2753; ${t('sbHelp')}</div>
    ${AIDE.map((s, i) => `
    <div class="wos-help-section">
        <button type="button" class="wos-help-hdr${i === 0 ? ' on' : ''}" data-aide="${s.id}" aria-expanded="${i === 0}">${t(s.t)} <span>${i === 0 ? '&#x25BC;' : REPLIE}</span></button>
        <div class="wos-help-body" data-corps="${s.id}"${i === 0 ? '' : ' hidden'}>${s.id === 'type' ? t(s.b).replace('{N}', kmFermetures()) : s.id === 'ed' ? t(s.b) + '<p>' + t('hEdAll') + '</p>' : t(s.b)}</div>
    </div>`).join('')}
    <div class="wos-sb-links">&#x1F4AC; <a href="${URL_DISCUSS}" target="_blank" rel="noopener">${t('lnkDiscuss')}</a> &nbsp;&#xB7;&nbsp; &#x1F517; <a href="${URL_GF}" target="_blank" rel="noopener">GreasyFork</a> &nbsp;&#xB7;&nbsp; <a href="${URL_GH}" target="_blank" rel="noopener">GitHub</a></div>
    <p class="wos-sb-foot">&#x1F512; ${t('hSafeB')}</p>
</div>`;

    async function poserOnglet() {
        try {
            const res = await sdk.Sidebar.registerScriptTab();
            res.tabLabel.innerHTML = '<span style="display:inline-flex;vertical-align:middle">' + icone(20) + '</span>';
            res.tabLabel.title = SCRIPT_NAME;
            res.tabLabel.setAttribute('aria-label', SCRIPT_NAME);
            res.tabPane.innerHTML = construireOnglet();
            majRendre();
            const lier = (id, cle, apres) => {
                const cb = res.tabPane.querySelector('#' + id);
                cb.addEventListener('change', () => { opts[cle] = cb.checked; ecrireOpts(); if (apres) apres(); });
            };
            lier('wos-o-google', 'google');
            lier('wos-o-discuss', 'discuss');
            lier('wos-o-entreprises', 'entreprises');
            lier('wos-o-slash', 'slash');
            lier('wos-o-bouton', 'bouton', poserBoutonNatif);
            lier('wos-o-fermer', 'fermer');
            res.tabPane.addEventListener('click', ev => {
                if (ev.target.closest('#wos-sb-ouvrir')) { ouvrir(); return; }
                if (ev.target.closest('#wos-maj')) { ev.preventDefault(); window.open(URL_INSTALLER, '_blank', 'noopener'); return; }
                const h = ev.target.closest('[data-aide]');
                if (!h) return;
                const corps = res.tabPane.querySelector('[data-corps="' + h.getAttribute('data-aide') + '"]');
                const ouvrirAide = corps.hidden;
                corps.hidden = !ouvrirAide;
                h.classList.toggle('on', ouvrirAide);
                h.setAttribute('aria-expanded', String(ouvrirAide));
                h.querySelector('span').innerHTML = ouvrirAide ? '&#x25BC;' : REPLIE;
            });
        } catch (e) { log('onglet : ' + e.message); }
    }

    // =====================================================================
    //  Démarrage
    // =====================================================================

    // ─── VERSION MINIMALE ET INTÉGRITÉ (consignes de l'auteur, 11/10/2026) ───────────────────────
    // Au démarrage, le script lit version-min.json à la racine de son dépôt GitHub. Il NE DÉMARRE PAS :
    //  - si sa version est plus ancienne que `min` (version retirée après une correction) ;
    //  - si son code ne correspond pas à l'empreinte publiée pour sa version (`empreintes`) — copie
    //    modifiée ou abîmée. L'empreinte est un SHA-256 du code, sans les lignes @downloadURL et
    //    @updateURL que GreasyFork réécrit ;
    //  - si le gestionnaire de scripts ne lui donne pas son code (Tampermonkey requis : choix de l'auteur) ;
    //  - si sa version n'est pas publiée (absente de `empreintes`) — sauf pour l'auteur, qui essaie ses
    //    versions avant de les publier.
    // Fichier injoignable ou illisible : le script démarre (une panne de GitHub ne doit pas paralyser
    // les éditeurs). ⚠️ Tout cela tourne dans le navigateur : il arrête la copie périmée ou bricolée,
    // pas celui qui retire ces lignes ; la vraie barrière reste côté Waze.
    const _VM_URL = 'https://raw.githubusercontent.com/DrSlump34/WME-Omnisearch/master/version-min.json';
    const _VM_MAJ = URL_GF;
    const _vmCmp = (a, b) => {
        const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
        for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d < 0 ? -1 : 1; }
        return 0;
    };
    const _vmJson = () => new Promise(res => {
        setTimeout(() => res(null), 7000);   // gestionnaire de scripts qui ne rappelle jamais : on démarre
        try {
            GM_xmlhttpRequest({ method: 'GET', url: _VM_URL + '?t=' + Date.now(), timeout: 6000,
                onload: r => { try { res(r.status === 200 ? JSON.parse(r.responseText) : null); } catch (e) { res(null); } },
                onerror: () => res(null), ontimeout: () => res(null) });
        } catch (e) { res(null); }
    });
    const _vmHx = t => { let x = 0x811c9dc5; for (let i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; } return x >>> 0; };
    // L'auteur essaie ses versions avant de les publier. ⚠️ Le contrôle tourne au DÉBUT du démarrage, souvent
    // AVANT que WME ait chargé le profil : getUserInfo() rend alors un pseudo vide (mesuré le 11/10/2026 —
    // une version non publiée bloquée chez l'auteur). On attend donc le pseudo jusqu'à 10 s, puis on essaie
    // la session Discuss (même site, mêmes cookies).
    const _vmAuteur = async () => {
        const estAuteur = n => !!n && _vmHx(String(n).toLowerCase()) === 0xc0bef069;
        try {
            const w = (typeof unsafeWindow !== 'undefined' && unsafeWindow.getWmeSdk) ? unsafeWindow : window;
            const sdkVm = w.getWmeSdk({ scriptId: 'wme-omnisearch-vm', scriptName: String(SCRIPT_NAME) + ' (version)', mode: 'async' });
            for (let i = 0; i < 20; i++) {
                let u = null;
                try { u = await sdkVm.State.getUserInfo(); } catch (e) { u = null; }
                if (u && u.userName) return estAuteur(u.userName);
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (e) { /* SDK indisponible : on tente Discuss */ }
        try {
            const w = (typeof unsafeWindow !== 'undefined' && unsafeWindow.fetch) ? unsafeWindow : window;
            const r = await w.fetch('/discuss/session/current.json', { credentials: 'same-origin' });
            const j = r.ok ? await r.json() : null;
            return estAuteur(j && j.current_user && j.current_user.username);
        } catch (e) { return false; }
    };
    const _vmEmpreinte = async src => {
        const t = String(src).replace(/\r\n/g, '\n').split('\n').filter(l => !/^\/\/ @(downloadURL|updateURL)\b/.test(l)).join('\n');
        const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
        return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
    };
    // Rend null (démarrer) ou le motif du refus : 'retiree', 'modifiee', 'source', 'inconnue'.
    // L'empreinte calculée est écrite dans la console : c'est le contrôle de l'auteur au moment de publier.
    const _vmVerdict = async () => {
        // Le texte de l'enveloppe du script, tel que le navigateur l'a chargé (indépendant du gestionnaire).
        const src = (() => { try { return _wmeIntegre.toString(); } catch (e) { return ''; } })();
        let h = '';
        if (typeof src === 'string' && src.length) {
            try { h = await _vmEmpreinte(src); console.info('[' + String(SCRIPT_NAME) + ' v' + String(VERSION) + '] empreinte ' + h); } catch (e) { h = ''; }
        }
        // Lisible depuis la page (les journaux d'un script Tampermonkey n'y arrivent pas) : l'empreinte, ou 'sans-source'.
        try { document.documentElement.setAttribute('data-vm-' + _vmHx(_VM_URL).toString(36), h || 'sans-source'); } catch (e) { }
        const j = await _vmJson();
        if (!j || typeof j !== 'object') return null;
        const v = String(VERSION), num = /^\d+(\.\d+)*$/;
        if (num.test(v) && typeof j.min === 'string' && num.test(j.min) && _vmCmp(v, j.min) < 0) return { motif: 'retiree', min: j.min };
        if (!j.empreintes || typeof j.empreintes !== 'object') return null;
        const attendue = j.empreintes[v];
        if (!attendue) return (await _vmAuteur()) ? null : { motif: 'inconnue' };
        if (typeof src !== 'string' || !src.length) return null;
        if (!h) return null;
        return h === String(attendue).toLowerCase() ? null : { motif: 'modifiee' };
    };
    const _vmBandeau = j => {
        const ident = 'vm-' + _vmHx(_VM_URL).toString(36);
        if (document.getElementById(ident)) return;
        const mLang = location.pathname.match(/^\/([a-z]{2})(-[A-Za-z]{2})?\//) || [];
        const l0 = (mLang[1] || (navigator.language || 'en').slice(0, 2)).toLowerCase();
        // Le portugais du Brésil a sa variante (« inicia », « Buscar ») : il recevait celle du Portugal.
        const l = l0 === 'pt' && /br/i.test(mLang[2] || navigator.language || '') ? 'ptbr' : l0;
        const n = String(SCRIPT_NAME), v = String(VERSION), m = j.min;
        const T = {
            fr: { retiree: `${n} v${v} est retirée\u00a0: une version corrigée est publiée (v${m} ou plus récente). Le script ne démarre pas tant qu’il n’est pas mis à jour (Tampermonkey ▸ Rechercher des mises à jour).`,
                  modifiee: `${n} v${v} ne correspond pas au code publié (copie modifiée ou abîmée). Le script ne démarre pas\u00a0: réinstallez-le depuis sa page officielle.`,
                  source: `${n} a besoin de Tampermonkey pour vérifier son code\u00a0: il ne démarre pas avec ce gestionnaire de scripts.`,
                  inconnue: `${n} v${v} n’est pas une version publiée. Le script ne démarre pas\u00a0: installez-le depuis sa page officielle.`,
                  maj: 'Mettre à jour', page: 'Page officielle' },
            en: { retiree: `${n} v${v} has been withdrawn: a fixed version is published (v${m} or later). The script will not start until it is updated (Tampermonkey ▸ Check for updates).`,
                  modifiee: `${n} v${v} does not match the published code (modified or damaged copy). The script will not start: reinstall it from its official page.`,
                  source: `${n} needs Tampermonkey to check its code: it will not start with this script manager.`,
                  inconnue: `${n} v${v} is not a published version. The script will not start: install it from its official page.`,
                  maj: 'Update', page: 'Official page' },
            it: { retiree: `${n} v${v} è stata ritirata: è pubblicata una versione corretta (v${m} o successiva). Lo script non si avvia finché non viene aggiornato (Tampermonkey ▸ Cerca aggiornamenti).`,
                  modifiee: `${n} v${v} non corrisponde al codice pubblicato (copia modificata o danneggiata). Lo script non si avvia: reinstallalo dalla sua pagina ufficiale.`,
                  source: `${n} ha bisogno di Tampermonkey per verificare il proprio codice: non si avvia con questo gestore di script.`,
                  inconnue: `${n} v${v} non è una versione pubblicata. Lo script non si avvia: installalo dalla sua pagina ufficiale.`,
                  maj: 'Aggiorna', page: 'Pagina ufficiale' },
            de: { retiree: `${n} v${v} wurde zurückgezogen: eine korrigierte Version ist veröffentlicht (v${m} oder neuer). Das Skript startet erst nach dem Update (Tampermonkey ▸ Nach Updates suchen).`,
                  modifiee: `${n} v${v} entspricht nicht dem veröffentlichten Code (veränderte oder beschädigte Kopie). Das Skript startet nicht: von der offiziellen Seite neu installieren.`,
                  source: `${n} braucht Tampermonkey, um seinen Code zu prüfen: mit diesem Skriptmanager startet es nicht.`,
                  inconnue: `${n} v${v} ist keine veröffentlichte Version. Das Skript startet nicht: von der offiziellen Seite installieren.`,
                  maj: 'Aktualisieren', page: 'Offizielle Seite' },
            es: { retiree: `${n} v${v} ha sido retirada: hay una versión corregida publicada (v${m} o posterior). El script no se inicia hasta que se actualice (Tampermonkey ▸ Buscar actualizaciones).`,
                  modifiee: `${n} v${v} no coincide con el código publicado (copia modificada o dañada). El script no se inicia: reinstálalo desde su página oficial.`,
                  source: `${n} necesita Tampermonkey para verificar su código: no se inicia con este gestor de scripts.`,
                  inconnue: `${n} v${v} no es una versión publicada. El script no se inicia: instálalo desde su página oficial.`,
                  maj: 'Actualizar', page: 'Página oficial' },
            pt: { retiree: `${n} v${v} foi retirada: há uma versão corrigida publicada (v${m} ou mais recente). O script não arranca enquanto não for atualizado (Tampermonkey ▸ Procurar atualizações).`,
                  modifiee: `${n} v${v} não corresponde ao código publicado (cópia modificada ou danificada). O script não arranca: reinstale-o a partir da página oficial.`,
                  source: `${n} precisa do Tampermonkey para verificar o seu código: não arranca com este gestor de scripts.`,
                  inconnue: `${n} v${v} não é uma versão publicada. O script não arranca: instale-o a partir da página oficial.`,
                  maj: 'Atualizar', page: 'Página oficial' },
            ptbr: { retiree: `${n} v${v} foi retirada: há uma versão corrigida publicada (v${m} ou mais recente). O script não inicia enquanto não for atualizado (Tampermonkey ▸ Buscar atualizações).`,
                  modifiee: `${n} v${v} não corresponde ao código publicado (cópia modificada ou danificada). O script não inicia: reinstale-o pela página oficial.`,
                  source: `${n} precisa do Tampermonkey para verificar o seu código: não inicia com este gerenciador de scripts.`,
                  inconnue: `${n} v${v} não é uma versão publicada. O script não inicia: instale-o pela página oficial.`,
                  maj: 'Atualizar', page: 'Página oficial' },
            he: { retiree: `${n} v${v} הוסרה: פורסמה גרסה מתוקנת (v${m} ומעלה). הסקריפט לא יופעל עד שיעודכן (Tampermonkey ▸ חיפוש עדכונים).`,
                  modifiee: `${n} v${v} אינו תואם לקוד שפורסם (עותק ששונה או נפגם). הסקריפט לא יופעל: התקינו אותו מחדש מהדף הרשמי.`,
                  source: `${n} זקוק ל-Tampermonkey כדי לאמת את הקוד שלו: הוא לא יופעל עם מנהל הסקריפטים הזה.`,
                  inconnue: `${n} v${v} אינה גרסה שפורסמה. הסקריפט לא יופעל: התקינו אותו מהדף הרשמי.`,
                  maj: 'עדכון', page: 'הדף הרשמי' },
        };
        const L = T[l] || T.en;
        const d = document.createElement('div');
        d.id = ident;
        d.dir = l === 'he' ? 'rtl' : 'ltr';
        d.setAttribute('role', 'alert');
        d.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);z-index:100000;max-width:560px;padding:10px 14px;' +
            'background:#ffebee;color:#b71c1c;border:1px solid #c62828;border-radius:8px;font:600 12px/1.5 Rubik,Arial,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25)';
        const p = document.createElement('div'); p.textContent = L[j.motif] || L.inconnue; d.appendChild(p);
        const a = document.createElement('a'); a.href = _VM_MAJ; a.target = '_blank'; a.rel = 'noopener';
        a.textContent = (j.motif === 'retiree' ? L.maj : L.page) + ' ↗';
        a.style.cssText = 'display:inline-block;margin-top:6px;padding:3px 10px;border-radius:50px;background:#c62828;color:#fff;text-decoration:none';
        const x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'OK');
        x.style.cssText = 'position:absolute;top:2px;inset-inline-end:6px;border:0;background:none;color:#b71c1c;font-size:16px;cursor:pointer';
        x.onclick = () => d.remove();
        d.appendChild(a); d.appendChild(x);
        (document.body || document.documentElement).appendChild(d);
    };
    // Vrai si le script ne doit pas démarrer : le bandeau est posé, et l'appelant s'arrête.
    const _vmBloque = async () => { const j = await _vmVerdict(); if (j) { _vmBandeau(j); return true; } return false; };
    const init = async () => {
        if (await _vmBloque()) return;   // version retirée ou copie modifiée : bandeau, rien d'autre
        if (pw.__WOS_LOADED) return;
        // Le verrou n'est posé qu'une fois le SDK obtenu : un démarrage raté peut ainsi être relancé.
        try { sdk = pw.getWmeSdk({ scriptId: SCRIPT_ID, scriptName: SCRIPT_NAME, mode: 'async' }); }
        catch (e) { log('SDK indisponible : ' + e.message); return; }
        pw.__WOS_LOADED = true;
        let code = null;
        try { code = ((await sdk.Settings.getLocale()) || {}).localeCode; } catch (e) { logUneFois('locale', 'langue de WME : ' + e.message); }
        _lang = detectLang(code);
        try { imperial = !!((await sdk.Settings.getUserSettings()) || {}).isImperial; } catch (e) { logUneFois('unites', 'unités de WME : ' + e.message); }
        opts = lireOpts();
        // Une région vide donnerait « /undefined-Descartes » pour TOUS les services : repli sur row.
        try { region = (await sdk.Settings.getRegionCode()) || 'row'; } catch (e) { }

        const st = document.createElement('style');
        st.textContent = CSS;
        document.head.appendChild(st);

        await poserCalque();
        poserOnglet();
        verifierMaj();
        // WME redessine sa barre du haut après le démarrage des scripts : le bouton posé tôt
        // partait avec l'ancienne barre, et un observateur accroché à celle-ci ne voyait plus rien
        // (constaté par l'auteur sur la version installée, 30/10/2026). On surveille donc le body,
        // et la vérification, une seule recherche dans le DOM, est regroupée en un passage.
        poserBoutonNatif();
        let verif = null;
        new MutationObserver(() => {
            if (verif) return;
            verif = setTimeout(() => { verif = null; poserBoutonNatif(); }, 250);
        }).observe(document.body, { childList: true, subtree: true });

        document.addEventListener('keydown', surToucheGlobale, true);
        document.addEventListener('mousedown', surClicGlobal, true);
        window.addEventListener('resize', () => { if (ouverte) appliquerGeom(); });
        // Le volet de WME qui s'ouvre ou se ferme change la zone de carte sans « resize » de la fenêtre.
        try {
            let zoneObs = null;
            const ro = new ResizeObserver(() => { if (ouverte) appliquerGeom(); });
            setInterval(() => { const z = document.querySelector('div.edit-area-main'); if (z && z !== zoneObs) { if (zoneObs) ro.unobserve(zoneObs); ro.observe(z); zoneObs = z; } }, 2000);
        } catch (e) { logUneFois('ro', 'ResizeObserver : ' + e.message); }

        try { sdk.Events.on({ eventName: 'wme-save-finished', eventHandler: () => { numerosCache.clear(); lieuxWazeCache.clear(); invaliderIndex(); } }); }
        catch (e) { log('évènement enregistrement : ' + e.message); }
        // « wme-data-model-objects-added » ne se déclenche qu'avec trackDataModelEvents (audit n° 42) :
        // le chargement de données suffit, il couvre ce que la carte apporte.
        for (const ev of ['wme-map-data-loaded']) {
            try { sdk.Events.on({ eventName: ev, eventHandler: invaliderIndex }); }
            catch (e) { log('événement ' + ev + ' : ' + e.message); }
        }
        try { sdk.Events.on({ eventName: 'wme-map-move-end', eventHandler: () => { if (ouverte) completerCalques(); if (ouverte && !elargissement && champ.value.trim()) lancerRecherche(true); } }); }
        catch (e) { log('événement déplacement : ' + e.message); }

        log('v' + VERSION + ' prêt — langue ' + _lang);
    };

    const lancer = () => { init().catch(e => log('démarrage : ' + e.message)); };
    // Démarrage dès que le SDK est prêt, à TOUS les zooms (comme WJN et WNA).
    (() => {
        let lance = false;
        const go = () => { if (lance) return; lance = true; clearInterval(minuterie); Promise.resolve(pw.SDK_INITIALIZED).then(lancer); };
        // Sans W : la promesse SDK_INITIALIZED, ou les évènements wme-initialized / wme-ready ci-dessous.
        const pret = () => !!pw.SDK_INITIALIZED;
        const minuterie = setInterval(() => { if (pret()) go(); }, 300);
        if (pret()) go();
        document.addEventListener('wme-initialized', go, { once: true });
        document.addEventListener('wme-ready', go, { once: true });
    })();

})();
