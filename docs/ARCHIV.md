# Hicore Ride: Archiv

Ältere Übergabe-Stände und erledigte Details. Für die laufende Arbeit reicht UEBERGABE.md im Repo-Root.

---

## Vollständige Übergabe, Stand 24.11.2026 (Version 0.11.8)


Stand: 24.11.2026, ca. 11:45 Uhr (Europe/Berlin). Letzte veröffentlichte Version: **0.11.8 Beta**.
Geschrieben für einen neuen Claude, der ohne Rückfragen weiterarbeiten soll.

---

### 0. Kurzfassung in 10 Zeilen

- Hicore Ride ist ein Zwift-ähnliches Indoor-Radspiel im Browser: Three.js r187 mit WebGPU (Rückfall WebGL 2), eine große HTML-Datei plus Datenpakete. Bluetooth läuft über Web Bluetooth.
- Hauptwelt ist das **Zittauer Gebirge**: echtes OSM-Straßennetz mit ca. 180 km, echte Höhen, Abbiegen an Kreuzungen, Kreisel, Verkehr, Bahn, Wahrzeichen, Wetter.
- Spiel: https://hicore77.github.io/hicore-ride/webgpu-spiel/
- Vorschau-Bilder für Hicore: https://hicore77.github.io/hicore-ride/vorschau/
- Repo: `hicore77/hicore-ride` (öffentlich), Branch `main`. **Quellcode liegt seit 24.11. im Repo unter `quelle/`**. Vorher lag er nur im Scratchpad der Cloud-Sitzung.
- Build: `python3 quelle/build_gpu.py`, dann `quelle/gpu/index.html`, `gpu/data/` und `gpu/props/` nach `webgpu-spiel/` kopieren, committen und pushen.
- Pflicht-Tests nach jeder Straßenänderung: `tturn.js`, `tjump.js` (mit `RBP=32`) und `tjun.js`. Nach jedem Build `terr.js`, das "none" ausgeben muss.
- Nächstes großes Paket: **Schnee als Wetter** (Plan in Abschnitt 7). Hicore hat es gewünscht, es ist noch nicht begonnen.
- Hicore möchte so angesprochen werden. Deutsch, du, kurz, direkt. Keine Credits ausgeben, ohne vorher Kosten und Guthaben zu nennen.
- Links immer komplett klein schreiben (`hicore-ride`, nie `Hicore-ride`).

---

### 1. Ziel und Vision

**Was:** Ein eigenes Indoor-Radspiel wie Zwift, das im Browser läuft. Man fährt mit Rollentrainer oder Powermeter durch virtuelle Welten. Schwerpunkt ist Hicores Heimat, das **Zittauer Gebirge und das Umland** (Spitzkunnersdorf, Großschönau, Jonsdorf, Oybin, Olbersdorf, Hainewalde, Zittau, Lückendorf, Waltersdorf, Lausche, Hochwald).

**Zielgruppe:** In erster Linie Hicore selbst, dazu Freunde im Multiplayer. Später eventuell öffentlich. Als Idee gab es ein Abo: Sonneninsel gratis, weitere Welten für ca. 5 €/Monat. Das ist nicht entschieden.

**Vorbild:** Zwift (Fahrgefühl, Abzweigungen, Bergwertungen, Leader-Trikots, Multiplayer). Grafisch ist das Ziel ein Zwift- bis Unreal-Look, so realistisch, wie es im Browser geht.

**Abgrenzung:**
- Kein Unreal, keine native App. Hicore hat am 19.11. entschieden: Das Spiel bleibt im Browser.
- Keine echten Markenlogos, keine Google-/Esri-Satellitenbilder (Lizenz).
- Kein 1:1-Nachbau fremder Spiele.
- Welten sind echte Orte nach offenen Daten (OSM, ESA WorldCover, Overture, SRTM, Mapillary-Sichtung).

**Leistungsziele:**
- Das iPad Air M1 soll flüssig laufen (30-fps-Takt, WebGPU).
- Die kleinste Grafikstufe soll auf fast jedem Smartphone laufen.
- Hicores Handy, ein Redmi Note 10 Pro, stürzte beim Start ab. Das Thema ist vorerst zurückgestellt.

---

### 2. Anforderungen

### 2.1 Features: Pflicht (umgesetzt) und Optional (Wünsche)

**Pflicht, umgesetzt:**
- Fahren nach Watt mit Physik:
  - Steigung, Windschatten, Bremsen vor Kurven, Wenden als Manöver
  - Haltung nach Watt (Oberlenker bergauf, Unterlenker bergab und beim Sprint, Wiegetritt)
- Welten:
  - Sonneninsel, Zittauer Gebirge (Graph-Welt), Elbsandstein, Hügelland, Alpenpass
  - Die Welt Spitzkunnersdorf wurde entfernt und ins Zittauer Gebirge integriert.
- Straßennetz Zittauer Gebirge:
  - Abbiegen an echten Kreuzungen mit Hinweis und Zeit zum Wählen
  - Kreisel gegen den Uhrzeigersinn
  - Einbahnstraßen und Ampeln in Zittau
  - Wegweiser, Ortstafeln, 8 Bergwertungen und Sprints, Minikarte, große Karte mit Startpunktwahl
- Verkehr:
  - 20 Fahrzeuge, 5 Typen
  - Überholen mit Abbruch, Gegenverkehr bremst (neu in 0.11.8)
  - Polizeikontrollen, Hupen und Lichthupe, Kennzeichen GR/ZI
- Bahn:
  - Zittauer Schmalspurbahn (Dampfzug, selten, mit Bahnübergängen)
  - Normalspur-Regionalzug, Schranken, Läutewerk, Brücken nach OSM
- Landschaft:
  - Wald und Felder nach ESA WorldCover und OSM, Einzelbäume nach OSM, Obstbäume
  - Fernsicht bis ca. 6 km, Kachel-Nachladen
- Gebäude:
  - ca. 27.400 aus Overture
  - Hausbaukasten mit 25 Typen, darunter Umgebindehäuser
  - Wahrzeichen als 3D-Modelle (Higgsfield/Tripo) oder selbst gebaut, zum Beispiel die Kirche Hainewalde und Gruft Hainewalde
- Wetter und Tageszeit:
  - Sonne, Wolken, Regen, Gewitter, Nebel
  - Nasse Straße mit Pfützen und Spritzwasser
  - Echtes Wetter und echte Tageszeit über Open-Meteo
- Ton:
  - Echte Aufnahmen (ElevenLabs), Raumklang (HRTF bzw. 5.1)
  - Geräusche nur mit sichtbarem Anlass
- Fahrerfigur:
  - GLB mit Skelett, Bein-IK, greifende Hände, wählbare Trikots, Leader-Trikots
  - Gesten (Tasten 1–5 und G)
- Multiplayer über Supabase Realtime (Raum-Code, Broadcast und Presence)
- Figuren zum Ansprechen (Wanderin Marlies am Kelchstein, Polizist):
  - Spracheingabe im Browser, KI über Gemini mit Hicores eigenem Schlüssel im Menü
  - Ohne Schlüssel gibt es Offline-Wissen.
- FIT-Export und Fahrtbild (auf dem iPad in Bluefy ist der Download noch kaputt)
- Grafikstufen Smartphone (LITE/MINI), Niedrig, Mittel, Hoch, Ultra, dazu eine FPS-Anzeige
- Bodentexturen-Schalter „bisherige / neu (Poly Haven, Test)“, eingebaut in 0.11.8

**Optional und Wünsche (offen):** siehe Abschnitt 6 und 7. Die wichtigsten:
- Schnee
- Poly-Haven-Paket Stufe 2
- Grashalme nah am Fahrer
- Laufmodus
- Accounts/Login
- Feld- und Waldwege
- Easter Eggs

### 2.2 Hardware

| Gerät | Stand |
|---|---|
| **Elite Drivo 1** (Trainer) | BLE-Name „DR“. Wirbt nur CSC 0x1816 und den Elite-Dienst `347B0001-7635-408B-8918-8FF3949CE592`, **kein FTMS**. Erscheint in Bluefy auf dem iPad nie. Widerstandssteuerung ist daher **nicht** gelöst. |
| **Stages-Powermeter** (links, „Stages 37854“) | Läuft über Cycling Power Service. Das ist Hicores Hauptweg für Watt und Kadenz. Glättung `pwSmooth` (Standard 3 s), Korrektur `pwFac` ±10 %. |
| **Wahoo TICKR X** (Puls) | Läuft (Heart Rate Service). |
| FTMS-Trainer allgemein | Code vorhanden (Cycling Power und FTMS), mit echtem FTMS-Gerät ungetestet. |
| ANT+ | Nicht möglich (der Browser hat kein ANT+). |
| Laufband / Footpod (FTMS Treadmill, RSC) | Idee für den Laufmodus, nicht begonnen. Concept2 PM5 (Rudern/SkiErg) ist eine ferne Idee. |

### 2.3 Plattformen

- **iPad Air M1** ist das Hauptgerät. Bluetooth geht nur in der App **Bluefy**, weil Safari kein Web Bluetooth hat. Chrome auf dem iPad läuft, aber ohne Bluetooth.
- Desktop-Chrome oder Edge: WebGPU und Bluetooth gehen.
- Android-Chrome: geht prinzipiell. Das Redmi Note 10 Pro stürzt ab, das Thema ruht.
- Hosting: GitHub Pages, öffentlich.

---

### 3. Getroffene Entscheidungen (mit Begründung)

| Thema | Entscheidung | Begründung / verworfene Alternativen |
|---|---|---|
| Plattform | Browser, eine HTML-Datei plus Datenpakete | Kein Installieren, iPad über Bluefy. Unreal bzw. nativ verworfen (Aufwand, iPad-Bluetooth). |
| Engine | **Three.js r187, WebGPURenderer**, TSL-Knoten. Rückfall auf WebGL 2 bei `?gl=1` oder ohne `navigator.gpu`. | Bis 0.3.6 lief r128/WebGL. Der Umstieg ab 0.4.0 brachte auf dem iPad deutlich mehr fps. Das alte r128-Spiel liegt noch als `index.html` im Repo-Root (0.3.6) und wird nicht mehr gepflegt. |
| Shader | Alte GLSL-Hooks (`onBeforeCompile`) markieren `material.userData.fx`. `gpuSetup()` hängt sich in `renderer.library.fromMaterial`, `gpuFx()` baut daraus TSL-Knoten. | So konnte der riesige r128-Code 1:1 weiterlaufen. |
| Farben | `ColorManagement` aus (r128-Farben), aber `ColorSpaceNode.setup` mit `enabled=true` | Sonst war das Bild viel zu dunkel. |
| Sprache | Vanilla JavaScript in `quelle/gpu/src.html` (ca. 6.800 sehr lange Zeilen), Build in Python | Bewusst ohne Framework und ohne npm-Build fürs Spiel. Nur das three-Bundle ist mit esbuild gebaut. |
| Bundle | `quelle/gpu/three187gpu.js` aus `entry_gpu.js` (three/webgpu, TSL, GLTFLoader, BloomNode; three@0.187.0) | Vermutlich mit `npx esbuild entry_gpu.js --bundle --format=iife --minify` gebaut. Der genaue Aufruf ist nicht mehr belegt, das fertige Bundle liegt im Repo. |
| Dateiaufteilung | Seit 0.11.0: `index.html` ca. 2,5 MB, dazu `data/zittau.js` (Weltdaten), `data/media.js` (Fahrer-GLB, Rahmen, Haut), `data/img/*` (Texturen, Trikots, Sounds), `props/*.glb`. Cache-Busting über `?h=md5`. | Vorher wuchs `index.html` auf 53 MB, die GitHub-Grenze liegt bei 100 MB. |
| Straßennetz | Eigener Graph aus OSM (`zg2/zg_net.json`: 317 Knoten, 407 Kanten, ca. 180 km). Die Fahrlinie wird per `gRoute` gebaut: N=3000 Punkte, nach Krümmung verteilt (seit 0.10.21). | Gleichmäßige Punkte kürzten Kreisel ab. |
| Gelände | SRTM-Höhen (geglättet, Messrauschen raus, Steigungen echt), Kacheln 500 m/10 m, Nachladen und LOD, Fernsicht als Instanzen | Hicore: echte Steigungen, kein 13-%-Deckel. Jede Kreuzung hat genau eine Höhe. |
| Landbedeckung | ESA WorldCover 10 m (CC BY 4.0) plus OSM-Wald, -Parks und -Bäume, Overture-Gebäude | Google/Esri-Bilder verworfen (Lizenz). Luftbild Sachsen DOP20 (WMS, DL-DE/BY) geht über die Sandbox. |
| Multiplayer | Supabase Realtime, kostenlos, Region Frankfurt, Projekt `snpmmskruuzqrvvsdztz`. Nur der öffentliche publishable Key steht im Code. | Firebase verworfen, Supabase reichte ohne Tabellen. |
| KI-Gespräche | Gemini direkt aus dem Browser mit Hicores eigenem Schlüssel (`localStorage hicoreRide.aiKey`, nie im Repo). Modellwahl über `/v1beta/models`. | Muss für Hicore kostenlos sein. Ein Server über eine Supabase-Funktion ist vorbereitet, aber nicht aktiv. |
| 3D-Modelle | Wahrzeichen: Higgsfield (Tripo, image_to_3d) aus Fotos oder Text. Kleine Häuser: eigener Hausbaukasten. Manche Wahrzeichen prozedural (Kirche Hainewalde 0.11.7). | Hicore-Regel: Higgsfield nur für markante Gebäude. Higgsfield-Bäume verworfen, sie sahen gröber aus als die prozeduralen. |
| Texturen | Eigene Fotos über Higgsfield (gpt_image), Poly Haven CC0 als Test-Schalter | Poly Haven ist lokal blockiert, nur über die Higgsfield-Sandbox erreichbar. |
| Ton | ElevenLabs-Aufnahmen (Loops nahtlos), synthetisches Abrollrauschen | Ketten- und Freilaufgeräusch hat Hicore abgelehnt. |
| Versionen | Beta-Schema 0.x.y. Kleine Schritte 0.11.1, 0.11.2 usw., größere 0.12.0. 1.0.0 erst nach der Beta. | Hicore-Regel vom 21.11.2026. |

---

### 4. Aktueller Stand

### 4.1 Versionen (zuletzt)

| Version | Inhalt |
|---|---|
| 0.11.0 | Aufteilung in Datenpakete |
| 0.11.1 | Alle OSM-Straßen sichtbar |
| 0.11.2 | Häuser von der Fahrbahn weg |
| 0.11.3 | Normalspurbahn |
| 0.11.4 | Grünring Zittau, Fußwege |
| 0.11.5 | Kreisel-Entscheidung 32 m vorher |
| 0.11.6 | Medien als Einzeldateien |
| 0.11.7 (9d868b9, 24.11. ca. 10:35) | Fernsicht, Gruft-GLB, Kirche Hainewalde selbst gebaut, Umgebinde braun statt türkis |
| **0.11.8 (721d568, 24.11. ca. 11:15)** | Poly-Haven-Bodentexturen als Schalter (Standard bleibt „bisherige“). Asphalt ohne sichtbare Wiederholung (Mosaik und zweites Foto fleckig eingeblendet). Kreuzungsflächen eben in Richtung der Hauptstraße texturiert statt radial. Überholen mit Zeitrechnung, Abbruch und bremsendem Gegenverkehr. |

### 4.2 Getestet

- **0.11.8:**
  - `tturn` und `tjump` (`RBP=32`): 1145/1145.
  - `tjun`: unverändert 3 bekannte Meldungen (Kreisel 4075/-4878 als Testartefakt, Knick Kirchstraße 132°).
  - `terr` gibt "none" aus.
  - `tpass` (Überholszenario): alte Version 1 Zusammenstoß, neue 0.
- **Echtes WebGPU** lässt sich nur auf Hicores iPad prüfen. In der Cloud verliert Swiftshader-WebGPU das Gerät, deshalb laufen alle Cloud-Tests mit `?gl=1` (WebGL 2).
- Open-Meteo, github.io, Poly Haven und Overpass sind aus dem Cloud-Container blockiert. Echtes Wetter ist nur gemockt getestet.

### 4.3 Halb fertig / unsicher

- Poly-Haven-Texturen: eingebaut, aber Hicore hat noch nicht entschieden, ob „neu“ Standard wird. Aus der Fahrerperspektive ist der Unterschied eher klein.
- KI-Gespräch mit Figuren: mit Mocks getestet, auf Hicores Gerät zuletzt nicht zuverlässig. Das Mikrofon in Bluefy ist ungetestet.
- FIT- und Screenshot-Download in Bluefy: geht nicht.
- Widerstandssteuerung Drivo: nicht möglich (kein FTMS, nicht in Bluefy sichtbar).

### 4.4 Wo liegt der Code

- **Repo:** https://github.com/hicore77/hicore-ride (öffentlich), Branch `main`, im Container lokal unter `/home/user/hicore-ride`.
- **Zentrale Ordner im Repo:**
  - `webgpu-spiel/`: das **veröffentlichte Spiel** (Build-Ergebnis): `index.html`, `data/zittau.js`, `data/media.js`, `data/img/*`, `props/*.glb`, `figuren/*.js` (lazy Figuren).
  - `quelle/`: **Quellcode und Build-Eingaben** (neu seit 24.11., ca. 45 MB):
    - `gpu/src.html`: der gesamte Spielcode. HTML, CSS und JS in einer Datei mit Platzhaltern `<script>/*THREE*/</script>`, `/*SUPA*/`, `/*PROPS*/`, `/*SPK*/` usw.
    - `gpu/three187gpu.js`, `gpu/entry_gpu.js`: three-Bundle.
    - `build_gpu.py`: baut `quelle/gpu/index.html`, `gpu/data/` und `gpu/props/`. Die Ausgabe ist identisch zum veröffentlichten 0.11.8 (geprüft).
    - `props/*.glb`: 3D-Modelle (Wahrzeichen, Fahrzeuge, Züge, Gruft usw.).
    - `rider.glb`, `bframe/frame.glb`, `rtex/`: Fahrerfigur, Aero-Rahmen, Haut.
    - `jer/`: Trikot-Texturen.
    - `texjpg/`: bisherige Fototexturen.
    - `texjpg_ph/`: Poly-Haven-Texturen.
    - `sfx/*.mp3`: Geräusche.
    - `zg2/`: Weltdaten Zittauer Gebirge:
      - `zg_net.json` (Straßennetz)
      - `zgres.json` (Orte, Ortstafeln, Bergwertungen, Wald)
      - `bld.b64` (Gebäude)
      - `lc10.png` (WorldCover)
      - `trees.bin` (OSM-Bäume)
      - `side.bin`/`side2.bin` (übrige Straßen und Fußwege)
      - `ow.bin` (Einbahn)
      - `park.png` (Grünflächen Zittau)
      - `zgdb.json` (Normalspur)
      - Python-Skripte, die die Daten erzeugt haben
    - `zsb/zsb.json`: Schmalspurbahn.
    - `zt/zt2.json`: Zittau-Markierungen und -Wegweiser.
    - `sbtest/.../supabase.js`: supabase-js 2.118.0 (wird eingebettet).
    - `werkzeuge/`: Hilfsskripte (Props mit Blender, Trikots backen, Sounds aufbereiten, Hautgenerator, OSM-Lückenprüfung).
    - `tests/`: Playwright-Tests (siehe unten).
  - `vorschau/`: Vorschau-Seite für Hicore (`index.html` und nummerierte Bilder, zuletzt 131/132).
  - `index.html` (Root): altes r128-Spiel 0.3.6, eingefroren.
  - `webgpu-test/`: alte WebGPU-Testwelt.
- **Projektordner** `/mnt/project-files/spiele/hicore-ride/`: ältere Stände, Fotos, Trikotvorlagen, Karte. Kirchenfotos Hainewalde unter `/mnt/project-files/hicore-ride/fotos/kirche-hainewalde/`.

### 4.5 So startet und baut man das Projekt

```bash
git clone https://github.com/hicore77/hicore-ride && cd hicore-ride/quelle
python3 build_gpu.py                       # -> quelle/gpu/index.html (+ gpu/data, gpu/props)
cd gpu && python3 -m http.server 8765      # lokal testen: http://127.0.0.1:8765/index.html?gl=1
```

URL-Schalter:
- `?gl=1`: WebGL 2 statt WebGPU
- `?mini` / `?normal`: kleinste Stufe bzw. Notfallmodus zurücksetzen
- `?tex=neu` / `?tex=alt`: Bodentexturen

**Tests** (Node und Playwright, Chromium vorinstalliert). Sie laden `http://127.0.0.1:8765/`, die Basis lässt sich über die Umgebungsvariable `BASE` ändern:

```bash
cd quelle/tests   # Server auf 8765 muss quelle/gpu ausliefern
node terr.js            # Seitenfehler -> muss "none" ausgeben
node tturn.js           # Abbiegen an jeder Kreuzung -> ok == pairs
RBP=32 node tjump.js    # kein Sprung beim Routenwechsel (maxJ < ~0.3)
node tjun.js            # Geometrie je Abbiegepaar (Knick/Schleife/Kreisel/Höhensprung)
node tpass.js           # Überholszenario (Zusammenstöße zählen)
node tfv.js             # Renderbilder; Env V='[[x,z,h,tx,tz,"name"],...]' PFX=… QS='&tex=neu'
```

Die Tests brauchen 2 bis 25 Minuten (Software-Rendering). Lange Läufe im Hintergrund starten.

**Veröffentlichen:**

```bash
cp quelle/gpu/index.html webgpu-spiel/
rm -rf webgpu-spiel/data webgpu-spiel/props
cp -r quelle/gpu/data quelle/gpu/props webgpu-spiel/
# Version in src.html anpassen ("Version 0.11.x Beta" in $('prog')),
# Bilder nach vorschau/ (+ Eintrag oben in vorschau/index.html),
# dann commit + push (main). Pages aktualisiert sich nach 1–2 Minuten.
```

Commit-Nachrichten enden mit der Attribution, die die jeweilige Sitzung vorgibt.

---

### 5. Dateien, Dokumente, Links, Assets

**Links:**
- Spiel: https://hicore77.github.io/hicore-ride/webgpu-spiel/
- Vorschau: https://hicore77.github.io/hicore-ride/vorschau/
- Altes Spiel (0.3.6): https://hicore77.github.io/hicore-ride/
- WebGPU-Testwelt: https://hicore77.github.io/hicore-ride/webgpu-test/
- Repo: https://github.com/hicore77/hicore-ride
- Altes Artifact (r128-Fassung, veraltet): https://claude.ai/artifact/Xcg7ZvzYiek19eWxL4JSYQ
- Supabase-Projekt (Multiplayer): `https://snpmmskruuzqrvvsdztz.supabase.co`. Nur der publishable Key steht im Code, nie einen secret/service_role-Key verwenden.
- Notion: Ziel „Hicore – KI-Wissensbackup & Kontextarchiv“, Seite 04 = Hicore Ride. Ständige Regel: Ergebnisse dort nachtragen.

**Assets im Repo (`quelle/`):** siehe 4.4. Herkunft:
- Props: Higgsfield/Tripo und Blender (`werkzeuge/props.py`, `props2.py`)
- Fahrer: Higgsfield/Meshy
- Texturen: Higgsfield gpt_image und Poly Haven CC0
- Sounds: ElevenLabs (Flow `LeqRGTLVdNIcjNK62qUC`) und edge-tts (Polizei-Ansagen)
- Figuren (Läufer, Spaziergängerin, Polizist, Wanderer) liegen als `webgpu-spiel/figuren/*.js`

**Daten-Rohquellen (nicht im Repo, in der Higgsfield-Sandbox):**
- `~/zg2`: OSM-Overpass-Rohdaten (bbox 50.795,14.600 bis 50.970,14.835), `raw.json`, Skripte `zfull.py`, `side.py`
- `~/osm/rail.json`
- `~/mly`: Mapillary-Bilder Strecke Jonsdorf–Hain; Hicores Token liegt nur dort in `.tok`
- `~/m3`: 3D-Konvertierung

Die Sandbox ist über das Higgsfield-MCP-Werkzeug `sandbox_exec` erreichbar und bleibt bestehen.

**Bilder und Fotos von Hicore:** `/mnt/project-files/spiele/hicore-ride/` (Unterordner `bilder`, `fotos-kirche`, `fotos-weberstrasse`, `trikots`, `texturen`) und `/mnt/project-files/hicore-ride/fotos/kirche-hainewalde/` (4 Fotos).

---

### 6. Offene Punkte, bekannte Bugs, Risiken, Fragen

**Bugs und Lücken:**
- FIT- und Fahrtbild-Download auf dem iPad (Bluefy) geht nicht.
- KI-Gespräch mit der Wanderin auf Hicores Gerät unzuverlässig, Mikrofon in Bluefy ungetestet.
- Drivo nicht als Trainer nutzbar (kein FTMS, in Bluefy unsichtbar), also keine Widerstandssteuerung.
- Redmi Note 10 Pro stürzt beim Start ab, auch mit `?mini` (ruht auf Hicores Wunsch).
- Häuserflackern auf Hoch (Chrome iPad), Ursache unbestätigt. Bloom wurde schon abgeschwächt.
- `tjun` meldet 3 bekannte Artefakte (Kreisel Zittau 4075/-4878, Knick Kirchstraße/S 128), real unkritisch.
- Grafikwechsel nur mit Neustart der Fahrt, Abbiegehinweise nach dem Wenden nicht perfekt (älterer Hicore-Wunsch).
- 27 Sackgassen im Netz (echt oder am Kartenrand).

**Risiken:**
- `quelle/gpu/src.html` ist eine einzige Datei mit sehr langen Zeilen. Gezielt mit `grep -n` suchen, nicht ganz lesen.
- Größe: `data/media.js` ca. 6,4 MB, Ladezeit auf dem iPad beobachten. Die Repo-Historie ist ca. 1,8 GB groß.
- Cloud-Container: github.io, Open-Meteo, Poly Haven, Overpass, Mapillary und Higgsfield-CDN sind **blockiert**. Der Weg führt über die Higgsfield-Sandbox (`curl -A "Mozilla/5.0 ..."`). Dateien kommen zurück:
  - als JPG oder PNG über `image_paths` (landen byte-gleich in `tool-results/`)
  - GLB als RGB-PNG-Chunks; je Chunk nur die ersten 480000 Bytes nehmen
- Guthaben (24.11.): Higgsfield ca. 0,5 Credits (praktisch leer), aiqora ca. 137 Credits (image_to_3d ca. 29). Vor jeder Generierung Kosten nennen.

**Offene Fragen an Hicore:**
- Poly-Haven-Texturen als Standard? Er sollte am iPad `?tex=neu` vergleichen oder in den Einstellungen umschalten.
- Kirche Hainewalde später doch als 3D-Modell? Er wählte „erstmal ohne Modell“, der Selbstbau gefällt ihm.

---

### 7. Nächste Schritte (Reihenfolge)

1. **Schnee als Wetter**, von Hicore am 24.11. gewünscht, mit Fotos: leicht angezuckert sowie richtiger Winter. Plan, so mit Hicore abgestimmt:
   - **Zwei getrennte Einstellungen**:
     - Wetter (Sonne, Wolken, Regen, Nebel, Gewitter, neu Schneefall und Graupel)
     - Schneelage (keine, Flecken, angezuckert, viel, Tauwetter)
     - Jede Kombination ist möglich, auch blauer Himmel über einer dicken Schneedecke (Glitzern, Blenden, bläuliche Schatten).
   - Schneewert 0–1:
     - Schnee liegt zuerst auf flachen Flächen und im Schatten.
     - Steile Stellen und Südhänge tauen zuerst.
     - Höhe zählt: Lausche und Kamm bleiben länger weiß.
     - Ein Fleckenmuster verhindert einen weißen Teppich.
   - Straßen: geräumt (nass, Schneewall am Rand) oder festgefahren (weiß mit Fahrspuren). Bei Tauwetter nass und spiegelnd.
   - Viel Schnee:
     - dicke Dachschicht mit Kante am Traufrand
     - verschneite Fichten (Oberseiten weiß, Unterseiten grün), Laubbäume mit weißen Ästen
     - Autos mit weißem Dach
     - grauer, diesiger Himmel bei Schneefall
   - Flocken bzw. Graupelkörner statt Regenstrichen (wie das Regen-System in ATMO).
   - **Echtes Wetter:** Open-Meteo `snow_depth`, `snowfall` und Temperatur. Die Stufe stellt sich automatisch ein, Hicore wählt nur ohne Echtwetter von Hand.
   - Technisch:
     - Einbau im Node-Material-Umbau `gpuFx()` (in `src.html` um Zeile 1050, nach dem Block „Nasse Straße“ `if (isRoad && col)`). Dort gibt es `positionWorld`, Normalen und `WET`-Uniforms als Vorbild.
     - Neuer Uniform wie `WET` (z. B. `SNOW={a:GU(0), road:GU(0)}`).
     - ATMO-Modul (ca. Zeile 4230 ff.): `W()`, `apply()`, `RWX.catOf` (kennt schon 'schnee').
     - Menüs `#wx` und `#tod`.
   - Kostet keine Credits.
2. Poly-Haven-Paket **Stufe 2**, von Hicore freigegeben („so machen wir das“): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Holen über die Sandbox. Keine Modelle, keine HDRIs. Wieder umschaltbar, Vergleichsbilder auf die Vorschau-Seite.
3. **Grashalme** nur ca. 20–30 m um den Fahrer (vereinfachte Büschel als Instanzen, weich ausblenden), nach Poly Haven.
4. `media.js` weiter aufteilen und Ladezeit messen.
5. Feld- und Waldwege (OSM track) für den späteren Laufmodus: größere Wege belaufbar, schmale Pfade nur sichtbar. Keine Hofeinfahrten.
6. Laufmodus (Fußsensor RSC / Laufband FTMS), Figur und Animation gibt es schon (`walker.js` im Code).
7. Accounts/Login (Supabase Auth mit Google), Name sichtbar, Einstellungen gespeichert. Braucht Hicores Einrichtung in Supabase und Google Cloud.
8. Easter Eggs (alle sehr selten): Fan mit Kuhglocke, Traktorfahrer winkt, Eichhörnchen, Baudenwirt in Oberlausitzer Mundart, Glühwürmchen, Gleitschirmflieger, Laubwirbel. Tasten 6–0 mit Oberlausitzer Sprüchen.
9. Später: Abo-Modell (Stripe), nur nach Accounts und mit Rechtlichem.

---

### 8. Hicores Präferenzen und Vorgaben

**Kommunikation:**
- Anrede „Hicore“, Deutsch, du-Form, freundlich, direkt, kurz. Fundierte Einschätzungen statt Floskeln, Schwächen offen ansprechen.
- Ergebnisse zuerst. Bilder nicht als Thread-Anhang (der Thread war voll), sondern auf der **Vorschau-Seite** (`vorschau/`, nummeriert, neuester Abschnitt oben).
- **Links immer komplett klein schreiben** (`hicore-ride`).
- Hicore testet abends und nachts am iPad und schickt Screenshots. Er schreibt oft per Sprache, daher Tippfehler wie „Polyheaven“ = Poly Haven, „Fixfield“ = Higgsfield.

**Geld und Freigaben:**
- **Nie automatisch nachkaufen.** Vor jeder kostenpflichtigen Generierung Kosten und Restguthaben nennen, Hicore entscheidet. Ausnahme: eine konkrete Freigabe mit Budget.
- Senden, Buchen, Kaufen, Löschen nur mit ausdrücklicher Zustimmung. Nie Erfolg behaupten, der nicht eingetreten ist.
- Keine Secrets ins Repo oder Gedächtnis. Gemini-Schlüssel und Mapillary-Token bleiben bei Hicore bzw. in der Sandbox.

**Arbeitsweise:**
- Selbstständig abarbeiten. „Alles schön abarbeiten“ heißt freie Hand für die genannte Liste.
- Nach jeder Änderung testen, dann veröffentlichen.
- Neue Version = Versionsnummer im Menü, Commit, Vorschaubilder.
- Riskante Grafikumstellungen **umschaltbar** bauen („zurückrudern können“), alt bleibt erhalten.
- Modell: Hicore bleibt bei Opus (24.11. ausdrücklich gesagt).

**Ständige Regeln Straßennetz** (23.11., gelten für jede neue Straße, Kreuzung, jeden Kreisel):
- Alle Straßen enden genau im Kreuzungspunkt, die Entscheidung fällt erst dort: kein Schlenker vorher, kein Sprung beim Umschalten.
- Kreisel = eigene Ringstraße, Zufahrt stumpf, gegen den Uhrzeigersinn, richtige Ausfahrt, nie abkürzen.
- Die Fahrlinie liegt immer auf der Fahrbahn (rechte Seite), nie auf Bankett oder Graben.
- Fehlende Verbindungen prüfen (Sackgassen-Check), keine Höhensprünge, Kreuzungen genau eine Höhe.
- Danach `tturn`, `tjump` und `tjun` laufen lassen, dazu eine Draufsicht.
- Sackgassen sichtbar, aber ohne Abbiegehinweis, außer echten Anstiegen (Lausche, Hochwald). Waldwege wie der Grenzweg **nicht** befahrbar.
- Hochwald: Die Straße endet an der Baude, dann Schotterweg bis vor den Turm, dort wenden.

**Optik-Regeln:**
- Straßenrand: feines, einheitliches Gras (5–8 cm), nur selten ein kleiner Büschel. Innerorts Pflaster oder Splitt statt Gras, in Zittau fast nie Gras.
- Dachüberstände nur wenige cm (ca. 25 cm).
- Bäume nur, wo sie real stehen (OSM und WorldCover), keine Zufallshaine.
- Jedes reale Haus gibt es nur einmal: Foto-Typen nicht im Dorf verteilen. Häuser detailliert nur ca. 100–150 m um die Straße.
- Higgsfield-3D nur für markante Bauten. Kleine Häuser mit dem Hausbaukasten.
- Kein Türkis bei den Umgebindehäusern (0.11.7), außer dem echten alten Gemeindeamt in Spitzkunnersdorf.
- Abbiegehinweis klein, die Welt soll sichtbar bleiben.

**Ton:**
- Kein Ketten- und Freilaufgeräusch.
- Geräusche nur mit sichtbarem Anlass in der Nähe, zufällig, ohne direkte Wiederholung.
- In der Pause laufen Verkehr und Umgebung weiter, nur die Fahrgeräusche verstummen.

**Fairness:** Segment-Bestzeiten zählen nur mit echtem Trainer und echten Watt, nie im Demo-Modus.

**Verkehr:**
- Außerorts 80–100, innerorts 40–50 km/h, Stadt mehr Verkehr als Dorf.
- Nie durch den Fahrer durchfahren, keine Unfälle.
- Überholer warten auf freien Gegenverkehr oder brechen ab.
- Polizei kontrolliert über 52 km/h innerorts.

---

*Quellcode: Der Code existiert vollständig im Repo (`quelle/`). Er muss nicht in dieses Dokument kopiert werden: `src.html` hat ca. 6.800 sehr lange Zeilen und mehrere MB.*

## Aus UEBERGABE.md verschoben (Stand 0.16.0): Details 0.13.0

**Leistung (0.13.0), gemessen mit `tests/tperf.js` (Cloud, Software-Rendering, nur Zählwerte belastbar)**
- Vorher: 41 MB Erstladen (27 MB Modelle, die der Start abwartet), media.js 6,4 MB Base64, ca. 750 Zeichenaufrufe mit 3 Bots (jeder Fahrer ca. 130 Einzelteile), ca. 330 ohne Bots; 256–270 MB Texturen; jedes Auto wurde bei jedem Auftauchen neu gebaut (bis 66 ms Hänger, Kennzeichen-Texturen nie freigegeben); Shader nur für das beim Start Sichtbare vorkompiliert.
- Umgesetzt (alles abschaltbar):
  - Fahrer `data/rider.glb` und Rahmen `data/frame.glb` als Binärdateien statt Base64 (media.js 0,8 MB). Alter Weg: `EMBED_GLB=1 python3 build_gpu.py`.
  - Autos: 21 Pool-Autos werden im Ladebildschirm einmal gebaut und wiederverwendet (`TRAFFIC.prebuild`, `make` → `make0`). Aus: `window.NO_CARCACHE`.
  - `warmShaders()`: im Ladebildschirm je Material/Objektart ein Stellvertreter für alles bis 1,5 km plus Effekte und Pool-Autos, dann `compileAsync`. Aus: `?warm=0`. Ohne Radius stiegen die Texturen auf ~400 MB, deshalb `WARM_R`.
  - `RLOD`: Bots/Mitspieler blenden ab 20 m Kleinteile < 2 cm, ab 45 m < 10 cm über `layers` aus. Aus: `?rlod=0`.
  - `DRES`: dynamische Auflösung (bis 70 % der Stufe) vor der 30-FPS-Begrenzung, Menü „Auflösung automatisch“. FPS-Anzeige zeigt dann z. B. „45 FPS · 80 %“.
  - `TEXCAP`: am iPad/Handy Auto- und Zugtexturen 1536 → 1024. `?texcap=0` aus, `?texcap=1024` erzwingt am Rechner.
- Noch nicht gemacht: Modelle (27 MB) erst nach Bedarf laden statt vor dem Start; Wald-Instanzgruppen (~320 Aufrufe) zusammenfassen; Fahrer-Rad (130 Teile) zu wenigen Meshes verschmelzen. KTX2, Draco, Kacheldaten, Worker bewusst weggelassen.

**Straßennetz (0.13.0):** In `gnData()` werden OSM-Dreiecke an Einmündungen (Basis < 20 m, Äste < 80 m) aufgelöst: der namenlose bzw. längere Ast fällt weg, Kreisel (ZG_RB0) ausgenommen, Kantenindizes werden neu durchnummeriert (6 Stellen, u. a. Windgasse/S 136 Waltersdorf; tjun-Meldungen 48 → 40, keine neuen). Aus: `window.NO_TRIFIX`.

**Autos (0.13.0):** Schnee-Art `c` (`snowCar`): dunkle Stellen der Modelltextur (Scheiben, Reifen, Grill) bleiben frei. `TRAFFIC.lampFit()` findet rote Texturstellen hinten und lässt genau diese Dreiecke leuchten, dazu Lichthöfe (Sprites); Scheinwerfer seitlich wie die Rücklichter, mit Lichthof. Alter Weg: `window.OLD_CARLIGHTS`.

**Laub (0.13.0):** Das grelle Gelbgrün kam vom Gegenlicht-Leuchten der Blätter (`D.glow`): jetzt schwächer, enger um die Sonne und bei Schnee zusätzlich gedämpft; Schnee auf Laub dünner und Laubfarbe bei Schnee entsättigt. Alter Stand mit `?oldleaf=1`. Kontrollbild: `tests/ttree.js`.

## Aus UEBERGABE.md verschoben (Stand 0.15.0)

**Schnee (0.12.0), so gebaut**
- Zwei getrennte Einstellungen im Menü: Wetter (neu: Schneefall, Graupel) und Schneelage (keine, Schneeflecken, angezuckert, viel, Tauwetter), dazu Straßen geräumt/festgefahren. Jede Kombination geht.
- Schneewert im Shader (`gpuFx`): liegt auf flachen Flächen, Fleckenmuster, Höhe zählt (über ca. 420 m mehr), bei Tauwetter tauen Süd- und Steilhänge zuerst. Angezuckert lässt den Boden durchschimmern.
- Materialarten (`snowKind`): Gelände, Straße, Gras (verschwindet bei viel Schnee), Baumlaub (Oberseiten weiß), alles andere nach Normalen (Dächer, Autos, Mauern). Fahrer und Figuren nie (`noSnow`).
- Straße geräumt: feucht/nass mit Schneewall am Rand. Festgefahren: weiß mit vier Fahrspuren. Glitzern bei Sonne auf Gelände und Straße.
- Schnee hellt Schatten bläulich auf (Halbkugellicht). Flocken bzw. Graupel als in der Welt verankerte Scheibchen (man fährt hindurch).
- Echtes Wetter: Open-Meteo `snow_depth`, `snowfall`, Temperatur; Schneelage stellt sich dann selbst ein (Menü gesperrt).
- Noch nicht gebaut aus dem Plan: dicke Dachschicht mit sichtbarer Kante am Traufrand (bräuchte Geometrie), eigene Schneegeräusche.


## Aus UEBERGABE.md verschoben (Stand 0.16.1)

**Wege (0.14.0)**
- Daten: `quelle/zg2/ways.bin` (452 KB, gebaut in der Higgsfield-Sandbox `~/w14` mit `zg2/ways.py` aus Overpass `zg2/ways_query.txt`, bbox wie Straßen). OSM `highway=track|path|footway|cycleway|bridleway`, ohne Gehsteige/Überwege, ohne private Wege < 80 m (Hofzufahrten), ohne Stücke < 4 m. 12.518 Wege: track 1.154 km, path 491, footway 235, cycleway 18.
- Format: `'WAY1'`, Anzahl, je Weg Klasse (10 track, 11 path, 12 footway, 13 cycleway, 14 bridleway), Breite×10, Untergrund `sf`, `tracktype | smoothness<<4`, Flags (8 Brücke, 16 Tunnel, 32 Untergrund geschätzt, 64 privat), OSM-Id, Punkte als int16-Deltas in 0,5 m. Im Spiel `waysData()` → `window.WAYS` (alle Wege mit Untergrund), `WAY_SURF[sf]` = Name + Rollwiderstand `crr` (Schätzwerte) für späteren Lauf-/MTB-Modus.
- Untergrund `sf`: 0 Asphalt, 1 Pflaster, 2 Verbundpflaster, 3 Beton, 4 wassergebunden, 5 Feinschotter, 6 Schotter, 7 Erde, 8 Gras, 9 Sand, 10 Fels, 11 Holz, 12 unbefestigt, 13 befestigt. Ohne OSM-Angabe geschätzt aus `tracktype` (grade1 befestigt … grade5 Gras), Pfade = Erde.
- Darstellung: Nebenstraßen (side2.bin) und Wege teilen ein Material mit Texturatlas `quelle/texways/ways_atlas.jpg` (3×3 Poly-Haven-CC0: asphalt_02, cobblestone_floor_08, concrete_pavers_02, concrete_pavement, grass_path_2, forest_ground_04, grass_ground, forest_leaves_02, rocky_trail). Erde im Wald (`gnLC`=1) wird Waldboden. Feldwege (grade3+ bzw. Erde) mit Grasnarbe in der Mitte, unbefestigte Ränder ausgefranst, nass dunkler, Schnee wie Gelände (`snowKind` 't'). Shader-Zweig `fx.ways` in `gpuFx`.
- Pro 500-m-Kachel ein Netz für Straßen/Feldwege (bis Sichtweite) und eines für schmale Pfade (nur bis 650 m, LITE 450, MINI 300). Klassen 8/9 aus side2.bin werden durch ways.bin ersetzt.
- `waysNear()` hält Waldbäume 2,2 m und Einzelbäume 1,6 m von Wegen fern.
- Alter Stand (graue Bänder, keine Feldwege): `?oldways=1`. Brücken auf Wegen werden noch weggelassen (Gelände passt dort nicht). Befahrbar ist noch nichts.

## Aus UEBERGABE.md verschoben (Stand 0.17.0)

**Radmodelle (0.16.0)**
- Code (alles in `src.html` vor `makeRider`): `BIKE_GEO` (Punkte je Rad, Tretlager immer z=-0.08, Sattel/Hüfte relativ zum Tretlager auf allen Rädern gleich), `BIKE_COLS` (Farben als Tabelle, **spätere Farbauswahl**: Eintrag überschreiben oder `opt.cols[typ]`, dann `setRiderBike`), `buildBike(typ, opt, g, seatUp)` → `buildRoadBike` (Rennrad unverändert, nur ausgelagert) bzw. `buildDirtBike` (Gravel/MTB). Gemeinsame Bausteine: `bikeDrive` (Antrieb, Rennrad 2-fach, sonst 1-fach 40T/32T mit großer Kassette), `dirtWheel`/`tireGeos` (Reifen als Drehkörper, Stollen eingeschmolzen), `bikeDiscs`, `bikeBottle`, `bikeBags`, `bikeDecal`.
- `setRiderBike(r, typ)` tauscht nur die Rad-Gruppe `r.bikeG` (Figur, Trikot, Kurbelwinkel bleiben), ruft `pbrApply` auf (sonst blasse Farben). Aufgerufen vom Menü Fahrrad, `me` startet mit `BIKE`. Mitspieler senden `rb` (Radtyp) und werden mit ihrem Rad gezeigt. Bots bleiben Rennrad.
- Gravel (Hicore): Bronze/Kupfer metallic, schwarze Anbauteile, Skinwall-Reifen 42 mm (hellbraune Flanken), Rahmen höher/kürzer (Lenker 5 cm höher, 5,5 cm näher), Lenker 5 % breiter, Unterlenker 15° Flare, Hoods oben 13° nach innen (`GRAVEL_BAR`, `gravelMap`). Rahmentasche + Oberrohrtasche (dunkelgrau, Zickzack, roter Zipper, „Hicore“), zwei schwarze Flaschen (Unterrohr = Trinkgeste, Sitzrohr).
- MTB: Hardtail mattes Dunkelgrün, orange Federgabel (Krone, Tauchrohre, Brücke), orange Griffringe/Felgen-/Rahmenschrift, 29 x 2,4 Stollenreifen, Flatbar 760 mm mit Backsweep (`MTB_BAR`), Teleskopstütze, eine schwarze Flasche.
- Haltung: `bikeRig(typ)` liefert Hüfthöhe, Oberkörperwinkel (`th` bei low 0/1: Gravel 34°/12°, MTB 43°/33°), Griffe `grips` und Greif-Rahmen `gripf`. Gravel-Griffe werden mit derselben Abbildung wie der Lenker berechnet, dadurch greifen Ober-, Hoods- und Unterlenkerhand exakt. MTB: alle drei Griffe = Flatbar, Haltung nur nach Leistung (`rig.flat`). `poseGLB` bekommt `opt.rig`.
- **Vorarbeit 0.17.0 (Treppen):** Rad ist eine eigene Gruppe `r.bikeG` im Fahrer-`g`, Haltung kommt komplett aus `rig` + `poseGLB`-Optionen. Zum Tragen/Schultern: `r.bikeG` relativ zum Fahrer bewegen/drehen und in `poseGLB` eigene Ziele für Hüfte, Füße (Gehen) und Hände (Oberrohr/Lenker) setzen, analog zu Stand (`stop`) und Gesten (`gestTarget`).
- Leistung: `mergeBikeStatic` fasst statische Radteile, Laufräder und Kurbel je Material zusammen (Rennrad 148 → 92 Zeichenaufrufe je Fahrer, Gravel 158 → 67, MTB 147 → 60). Aus: `window.NO_BIKEMERGE`. Radwechsel baut in 50–160 ms neu (nur im Menü spürbar).
- Test: `tests/tbike.js` (Studio-Bilder im Menü ohne Welt, ca. 10 s; `BIKES`, `VIEWS` side/q34/front/top/hands/handsF, `GRIPS` 0/1/2, `STOP=1`, `DRINK=2.2`), `tests/tbikew.js` (in der Welt, Wechsel während der Fahrt).


**Wegenetz und Radwahl (0.15.0)**
- Wege-Daten und Darstellung aus 0.14.0 (ways.bin-Format, Untergrund `sf`, Texturatlas, Kacheln): siehe `docs/ARCHIV.md`, Abschnitt „Stand 0.16.1“.
- `gnData()` (Straßennetz) bleibt unverändert für Optik, Verkehr, Gelände. Fahren/Abbiegen läuft über **`gnRG()`**: gleiche Knoten-/Kantennummern wie gnData, dazu Nebenstraßen (side2.bin, `kind 's'`, c=20+Klasse) und Wege (ways.bin, `kind 'w'`). Straßenkanten werden an Wege-Anbindungen nur im RG geteilt (erstes Stück behält die Nummer, `R.split[k]`, `R.pieceOf`), nie Kreisel, Schleifen, Doppelfahrbahnen. `R.loop` = Hauptrunde in RG-Kanten.
- Aufbau `rgBuildWays` (ca. 0,7 s, Cloud): Anbindung, wo ein Weg die Fahrbahn kreuzt oder darauf liegt (nicht unter Straßen > 3 m über DEM), Wege untereinander über gemeinsame Endpunkte, T-Einmündungen (0,6 m) und Schnittpunkte, Knoten < 0,9 m zusammengelegt. Stand: 30.700 Kanten, 27.000 Knoten, 2.670 km Wege/Nebenstraßen, 98 % mit der Runde verbunden. Aus: `window.NO_WAYNET`.
- Weg-Punkte (`RGE.P`) erst bei Bedarf: Höhe `terrainH+0.08` wie das Wege-Netz, an Straßen 10 m übergeblendet, Brücken gerade zwischen den Enden.
- Radwahl: Menü Welt → Fahrrad, `BIKE` ('road'|'gravel'|'mtb', localStorage `hicoreRide.bike`), `BIKES[...]` (CdA 0,32/0,34/0,37), Modell und Haltung siehe 0.16.0. `gAdj()`: Rennrad = Straßen + asphaltierte/gepflasterte Nebenstraßen + asphaltierte Wirtschafts-/Radwege (`adjS`), Gravel/MTB alles (`adjW`). `window.GADJ='R'` = reines Straßennetz (Tests, Startrunde in `zgApplyStart`).
- Rollwiderstand `BIKE_CRR[sf][rad]` und `gEdgeCrr(E)` (schmale Pfade: Gravel ×1,5, MTB ×0,95), Wurzelstellen `ROOT_CRR` (0,09/0,075/0,028) auf Pfaden/Reitwegen im Wald alle 70–220 m (`R.roots`, `gRootAt`, sichtbar `gtRootMesh`). Wird in der Physik pro Bild über `gEdgeAt(S.dist)` gesetzt (`meP.crr/cda`). Beim Wechsel auf einen Weg kurzer Hinweis mit Wegart und Untergrund.
- Abbiegen: `gPath` mit Binärheap, Nebenstraßen ×1,25 und Wege ×1,6 teurer (Rückweg zur Runde bevorzugt Straßen). Hinweise zeigen bei Wegen „Waldweg · Schotter“ usw. (`gWayName`). Kein Autoverkehr, solange man auf einem Weg/einer Nebenstraße fährt, Autos fahren nie auf Wege. Auf schmalen Wegen fährt man mittig.
- Brücken auf Wegen und Nebenstraßen: `buildWayBridges()` (Holz/Beton, Geländer, je 1-km-Feld ein Netz), Nebenstraßen-Brücken nicht mehr auf dem Gelände.
- Tests: `tnet.js` (Aufbau, Zeit, Verbundenheit), `twjun.js` (NS Knoten, BIKE: Abbiegen an Wege-Kreuzungen, Sprung, Lücke, Kehrtwende, Höhe), `tride.js` (im Spiel abbiegen + Bilder).
- Grenzen: Wege-Wege-Kreuzungen auf verschiedenen Ebenen ohne Brücken-Flag werden verbunden; Rückweg zur Runde nimmt den kürzesten Weg; Startpunkt auf der großen Karte nur auf Straßen; Höhen auf Wegen aus 25-m-DEM (steile Pfade bis ca. 30 %).

---

## Versionsnotizen 0.16.1 (aus UEBERGABE.md verschoben am 24.11.2026)

**Abbiegen und Einmündungen (0.16.1)**
- Vorauswahl an Kreuzungen (`gNetStep`): abseits der Hauptrunde ist die **natürliche Weiterfahrt** vorgewählt, `gNatural(D,arr,opts)`: Punktzahl = |Winkel|/30 + 1,5·`gRank` − 3 gleicher Straßenname − 2 gleiche ref (Wege: −3 gleiche OSM-Id), Kehrtwenden nie. `gRank`: Straßen OSM-Klasse 0–4, Nebenstraßen 4,5–6, Wirtschafts-/Radwege 6,5, Pfade 7,5, Fußwege 8. Wer nichts drückt, folgt der Hauptstraße; der Rückweg zur Runde wird an jeder Kreuzung neu berechnet (`gTurn`, ca. 5–70 ms in der Cloud). Auf der Hauptrunde (Ankunft und Plan beide Rundenkanten, `gMainSet`) und am Kreisel bleibt der Plan (Bergwertungen, Kreisellogik). Aus: `window.NO_NATURAL`.
- Hinweisflut: sind alle Alternativen niedrigere Klasse (`p.minor`), erscheint der Hinweis erst ab ca. 70 m, kleiner und halbtransparent („Abzweig in …“, CSS `#junc.jmin`). Kein Toast, wenn man der natürlichen Weiterfahrt folgt. Test `tests/tnat.js` (abbiegen, dann ohne Eingriff fahren; `NONAT=1` zum Vergleich): Rennrad 25 statt 37 volle Hinweise auf 76 km.
- Nebenwege-Textur: zweite, gedrehte Atlas-Abtastung mit anderem Maßstab nach Welt-Rauschen eingemischt, dazu prozedurale Helligkeitsflecken, auf Asphalt/Beton Flickstellen, feine Risse, dunklere Fahrspuren (Shader-Zweig `fx.ways`). Aus: `window.NO_WAYVAR`.
- Wiegetritt am Berg (`animRider`, auch Bots, die jetzt ihre Watt übergeben): ab 12 % (Hysterese 10,5 %) oder bergauf (> 5 %) mit Kadenz < 58, unter 22 km/h; Phasen 4–9 s stehen, 8–20 s sitzen. Aus: `window.NO_CLIMBSTAND`. Bild: `STAND=1 node tbike.js`.
- Kurvenneigung: `curveLean(r,d,rev)` in `placeRider` (alle Fahrer und Bots): Neigung atan(v²·k/g) (max. ca. 23°), Vorderrad `r.wF.rotation.y` ≈ Radstand·k (max. 7°, langsam mehr), Krümmung über ±12 m, weich nachgeführt. Gabel und Lenker drehen noch nicht mit (statisch verschmolzen). Aus: `window.NO_CURVELEAN`. Test `tests/tlean.js`.
- Rollwiderstand `BIKE_CRR` nachgeschärft (Waldboden ×1,3, schmale Pfade ×1,3/1,6/1,2). Richtwerte bei 200 W, flach, 88 kg:

| Untergrund | Rennrad | Gravel | MTB |
|---|---|---|---|
| Asphalt | 0,004 (34 km/h) | 0,006 (33) | 0,008 (31) |
| Schotter | 0,030 | 0,022 (25) | 0,022 (25) |
| Erde/Feldweg | 0,035 | 0,026 (23) | 0,024 (24) |
| Waldweg (Erde, Wald) | – | 0,034 (21) | 0,031 (22) |
| Wiese | 0,050 | 0,040 (19) | 0,034 (21) |
| Waldpfad | – | 0,054 (15) | 0,037 (19) |
| Fels-Pfad | – | 0,080 (11) | 0,042 (18) |

- Einmündungen: `wayLiftY(x,z,base)` hebt Wege/Nebenstraßen bis 9 m neben einer Straße weich auf Fahrbahnhöhe (Optik in `gtSideMesh` und Fahrlinie in `rgPts`/`gNodeY` gleich), Wegenden enden genau 0,3 m im Fahrbahnrand (`edgePt` in `gtSideIdx`). Auf der Hauptrunde an Weg-Einmündungen kein Graben/keine Leitpfosten (JUNC ±5 m). Aus: `window.NO_WAYLIFT`.

## Aus UEBERGABE.md verschoben (Stand 0.17.2)

**0.16.2 / 0.16.3:** Hotfix: eigene Wahl wurde kurz vor der Kreuzung von der Vorwahl überschrieben (Kreuzung nach dem Umschalten jetzt als erledigt markiert, Test `tkalb.js`). Übernächste Kreuzung unter 150 m klein darunter („Danach in … m“), schon wählbar, folgt der gewählten Richtung (`gMakePend`, `NET.pend2v`, `NET.pre`, vorab berechnete Strecke `NET.hyp`; aus: `window.NO_JUN2`; Test `tjun2.js`, `TURN1=1 BIKE=gravel`)

## Aus UEBERGABE.md verschoben (Stand 0.17.3)

**Umgebung und Kacheln (0.17.0)**
- Daten ohne Higgsfield, direkt aus der Cloud (S3 offen): Overture 2026-11-18 (Gebäude, base/land, land_use, infrastructure; `werkzeuge/overture_holen.py PREFIX ziel.parquet spalten`), Copernicus GLO-30, ESA WorldCover 2021. Rohdaten nicht im Repo (ca. 140 MB), Skripte schon.
- `werkzeuge/rand_auffuellen.py COP.tif WC.tif OVDIR`: DEM jetzt x −10393…10607, z −14506…8019 (841×902, 25 m; alt innen unverändert, außen Copernicus mit Naht-Ausgleich über 600 m), `lc10.png` x0 −10400 z0 −14500 2100×2250 (`window.ZGLCO`), Wald- und Ortsraster in `zgres.json` bis zum Rand (OSM über Overture). Bricht ab, wenn schon erweitert.
- `werkzeuge/kacheln.py OVDIR` → `quelle/kacheln/k_I_J.bin` (2 km, 139 Dateien, 1,9 MB) + `index.json` + `zg2/lmb.b64` (Wahrzeichen-Grundrisse). Inhalt: Gebäude (alt 27.433 + 26.201 neu am Rand, Typ 5 = in Industriefläche → Hallen/Blech in `htPick`), OSM-Bäume (alt + Rand: tree, tree_row, scrub, orchard, hedge), Felsen (8 Byte: x,z, Typ 0 Wand an `natural=cliff` mit Höhe aus DEM-Gefälle, 1 Einzelfels, 2 Geröll, 3 Block in Felsfläche), Zäune/Mauern (0 Industrie 2 m Maschendraht, 1 Holz, 2 Mauer, 3 Stützmauer). `build_gpu.py` kopiert nach `data/kacheln` und schreibt nur Index + `ZGLMB` in zittau.js (ZGBLD/ZGTREES entfallen, zittau.js 4,5 MB).
- Spiel: `KC` (Laden per fetch, max. 4 gleichzeitig, Radius Fernsicht+1,5 km, frei ab +4 km), `kcTick` im Hauptloop, `kcReady(i,j)` (500-m-Kachel samt Nachbarn geladen) sperrt Häuser/Wald/Fernsicht bis die Daten da sind, `kcWait` beim Start (2,6 km um Start und Startpunkt, max. 15 s). `bldDecode`, `gtBldIndex`/`gtOsmTrees` liefern die geladenen Maps. Felsen und Zäune entstehen mit der Waldkachel (`gtRockList/gtRockMesh/gtRockHash`, `gtFenceMesh`; keine Bäume in Felsen, nichts auf Straßen/Wegen, nicht im Oybin-Modell/Schanze/Kelchsteine). Aus: `window.NO_KC`.
- Wanderer (`HIKE`, `hikeStep`): alle 14–40 s, max. 3 (LITE 2, MINI 1), erscheinen 150–380 m voraus auf Wegen ≥ 60 m, gehen weiter auf anschließende Wege, treten bei vorbeifahrendem Fahrer an den Rand und schauen, verschwinden ab 520 m; Figuren aus dem Pool (wanderer_w/_m, spaziergaengerin). Aus: `window.NO_HIKE`.
- Tests: `tkc.js` (PTS-Liste Bilder, Kachelzahlen), `thike.js` (braucht Verknüpfung `quelle/gpu/figuren` → `webgpu-spiel/figuren`, steht in .gitignore).

## Aus UEBERGABE.md verschoben (Stand 0.18.0)

**Fahrgefühl auf Wegen (0.17.1)**
- Alles in `src.html` bei `WF` / `wayFeelStep(dt)` (vor `placeRider(me)`) und `wayFeelFx(dt)` (danach), nur der eigene Fahrer. Untergrund aus `gEdgeAt(S.dist)`: Rauheit `WF_ROUGH[sf]`, Matschanteil `WF_MUD[sf]` (Wald ×, Nässe `WET.w` und Pfützenstand `WET.p`).
- Linie/Stöße: Schlängeln ±7–10 cm (MTB 6 cm) nach Strecke, Gierwinkel folgt, Stöße alle 0,8 m per Hash (Höhe ≤ 1,3 cm, Nicken, Rollen), MTB Stöße halb so stark. In `placeRider` für `me` angewendet. Aus: `window.NO_WAYFEEL`.
- Pfützen: `WET.p` (GUR) wächst nur bei Regen (`WET.tw>0.5`), voll nach ca. 18 min (Gewitter ca. 8), trocknet in ca. 45 min. Straßen: Rauschschwelle im Straßen-Shader nach `WET.p`. Wege: 6-m-Zellen, Hash `wfHash` in JS und Shader identisch (float32), Wahrscheinlichkeit unbefestigt 0,42/befestigt 0,12, Radius 0,5–1,2 m, jede Pfütze hat eigenen Startpegel. `wayPudHit` prüft 14 m voraus, Fahrer weicht seitlich aus (`WF.pOff`, nur wenn Platz bis 0,35 m vom Rand), sonst Spritzer. Test-Override `window.PUD_SET=0..1`. Aus: `window.NO_PUDDLE`.
- Matsch: erdige Wege (Layer Erde/Gras/Waldboden) dunkler und glänzend nach Regen; Matschbrocken als Billboards (`WF.fx`, Farbe je Teilchen), MTB ×2; seltener Hinterrad-Rutscher (2,9–5,7°, Drehung um das Vorderrad, Lenker gegen, Mindestabstand 8 s, im Test ca. 1 pro 50 s bei vollem Matsch). Aus: `window.NO_MUD`.
- Test `tests/twet.js` (Waldweg bei Jonsdorf, Regen, `PUD=1`): ohne `OUT` Logiktest über 600 m, mit `OUT=ordner` drei Bilder.
- Ältere Notizen 0.16.1 (Vorauswahl `gNatural`, Kurvenneigung, Wiegetritt, Rollwiderstandstabelle, Einmündungen) stehen in `docs/ARCHIV.md`.


## 0.17.2 Echte Bäume aus Luftbild (aus UEBERGABE.md verschoben am 24.11.2026)

- Quellen: Kronenhöhe Meta/WRI Global Canopy Height 1 m (CC BY 4.0, S3 `dataforgood-fb-data/forests/v1/alsgedi_global_v6_float/chm/120212122.tif`, 600 MB, aus der Cloud direkt ladbar) + Luftbild Sachsen DOP20 RGB und CIR (GeoSN, dl-de/by-2-0, WMS `geodienste.sachsen.de/wms_geosn_dop-rgb|dop-cir/guest`, Layer `sn_dop_020`/`sn_dop_020_cir`, CRS:84, nur über die Sandbox). Kein DOM/nDOM-WMS in Sachsen gefunden, deshalb CHM. Kostet keine Credits.
- Ablauf (alles in `werkzeuge/`): `chm_ausschnitt.py chm.tif lon0 lat0 lon1 lat1 chm.npz` (ohne GDAL), `dop_holen.py x0 z0 b h dop.npz` (Sandbox, 0,5 m → 1 m), `dop_baeume.py chm.npz dop.npz ziel.bin [vorschau.jpg …]` (Sandbox, numpy/scipy), Ergebnis per PNG über `image_paths` zurück, dann lokal `python3 werkzeuge/dop_einfuegen.py zg2/dop_jonsdorf.bin` (wiederholbar). Jonsdorf: lon 14.675–14.740, lat 50.838–50.870 (x −4569…0, z −2227…1336).
- Erkennung: Kronendach = CHM ≥ 3 m und Vegetation (NDVI aus CIR bzw. Grünanteil). Wald = Kronendach-Anteil im 30-m-Umkreis > 0,62 und Fläche ≥ 0,6 ha → Waldmaske 10 m. Außerhalb: Baumspitzen = lokale Maxima im geglätteten NIR+Grün-Bild (Fenster nach Höhe), Höhe = CHM-Maximum 5×5, Mindestabstand nach Höhe. Ergänzung kleine Gartenbäume, die das CHM nicht sieht: raues Grün (Krone + Schatten, Helligkeits-Streuung 5×5 > 13) mitten in Vegetation, je Fleck ein Baum, Höhe 5–9 m. Laub/Nadel aus Helligkeit und Rot/Grün (Bild ist im Frühjahr: Laub hell gelbgrün, Nadel dunkel). Ergebnis Jonsdorf: 23.640 Bäume (davon 3.221 Gartenbäume, ca. 58 % Nadel, Median 16 m), 31 wegen OSM-Baum weggelassen. Bauminstanzen um Jonsdorf ca. +9 % gegenüber vorher (ESA-Wald fiel im Ort weg).
- Daten: Kachel-Baumtyp ≥ 16 = DOP-Baum (`16 + 120·Nadel + (Höhe−3)·4`), Hecke/Gebüsch jetzt nur Typ 6/7. Waldmaske `zg2/dopwald.json` → `window.ZGDOPW` (Liste, mehrere Ausschnitte möglich).
- Spiel: `gnDopW(x,z)` (nur Zittau-Welt); im Ausschnitt entscheidet die Maske `gnForest`, ESA-„Baum“-Pixel außerhalb der Maske werden zu Wiese (`gnLC`). DOP-Bäume in `gtForestGen` (Schleife der OSM-Bäume): Art nach Laub/Nadel zufällig, Skalierung = Höhe / Modellhöhe (`gtKindH`), Abstand zu Häusern über echten Grundriss (`bldNearP`, 1 m), Straßen/Wege wie Einzelbäume. Aus: `window.NO_DOPT`. Test `tests/tdop.js` (Bilder, Baumzahlen; `NODOPT=1` alter Stand).
- Nächste Ausschnitte: gleiche Kette mit anderer bbox, dann `dop_einfuegen.py` mit allen .bin.


## Hotfix 0.17.3 (aus UEBERGABE.md verschoben am 24.11.2026)

**Hotfix 0.17.3**
- Ursache Büschel auf Feldweg (Hicore, Feldweg Kälbersträucher → Hainewalde): Nahgras `gfCell` prüfte nur Straßen (`gnNear`), nicht Wege. Ackerpflanzen (LC 3, Faktor 1,8–2,3, grün) standen dadurch auf jedem Feldweg durch Äcker; Fehler bestand seit Wege existieren, nicht durch DOP-Bäume (Ort liegt außerhalb Jonsdorf). Jetzt: nichts innerhalb Wegbreite+0,3 m (`waysNear`), keine Ackerpflanzen bis 4 m neben Wegen. Aus: `window.NO_GFWAY`.
- Acker je Schlag wie `lcCol` (Hash x/140, z/110): umgepflügt (≥0,75) kahl, Stoppel kurz strohfarben, Wintersaat kurz grün, jeweils ausgedünnt. Nahgras in Feldnähe ca. halbiert (Test: 23.763 → 11.467 Instanzen im 40-m-Umkreis), sollte die 30 FPS dort verbessern (am iPad prüfen).
- Wackeln (`wayFeelStep`): Grundamplitude ca. −30 %, schnelle Anteile kleiner; Phasen `WF.ph` zufällig (ruhig 1–3 s, normal 2–4 s, ruppig 3–4 s), ab und zu Einzelhuckel (`WF.hkS`). Alte Gleichmäßigkeit: `window.WF_PHASE=0`.
- Test `tests/tgf.js` (`PL`, `PL2` = Feldweg zwischen zwei Orten, `OLD=1`, `ROOT=…/webgpu-spiel` für alte Version, `OUT` Bild).


## Aus UEBERGABE.md verschoben (Stand 0.19.1)

**FIT-Export (0.18.0):** `geoOf` rechnet im Zittauer Gebirge mit derselben Umrechnung wie die OSM-Daten zurück (lat0/lon0 aus `ZGNET`, 111320 m/°), Höhe = y + 300 m (echte Höhe über NN). Strava zeigt die Fahrt auf den echten Straßen. Echte Orte (`WORLD.real`) wie bisher echt, Fantasiewelten weiter im „Hicore-Archipel“ (Südpazifik). Wetter-Position (`RWX.pos`) nutzt jetzt dieselbe Umrechnung.
