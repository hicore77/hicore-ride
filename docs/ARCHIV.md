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


## Aus UEBERGABE.md verschoben (25.11.2026)

**Rennrad nur auf Straßen (0.18.1)**
- `gnRG`: `okS` (Kanten für `adjS`, Rennrad) neu: Hauptstraßen alle; Nebenstraßen nur Asphalt/Pflaster, Zufahrten (c 27) nur im Ort (`gnInner` in der Kantenmitte); Radwege (13) nur mit angegebenem Asphalt/Pflaster/Beton/befestigt; Feld-/Waldwege (10) nur mit angegebenem Asphalt; geschätzte Beläge (`inf`, ways.bin Flag 32) nie; Treppen nie. Rausgefallen: ca. 43 km Betonplatten-Feldwege, 27 km „befestigt“ geschätzt, 66 km Zufahrten außerorts. Alter Stand: `window.OLD_ROADADJ`.
- Test `tests/tadj.js` (km je Kantenart in `adjS`, `OLD=1`; schreibt zusätzlich Treppen mit Anbindung nach `SOUT`). Läuft in ca. 1 min, braucht keinen Fahrtstart.
- Nicht geändert: Hochwald-Schotterstück (0.9.10, Teil einer Hauptstraßenkante), Nebenstraßen ohne Belagsangabe zählen weiter als Asphalt (side2.bin hat kein „geschätzt“-Flag, Generator nicht im Repo).
- Gut erreichbare Treppen (Hicore genannt): Jonsdorf Auf der Heide 9 Stufen, Oybin Kammstraße ca. 10, Friedrich-Engels-Str. (S 133) 6 Felsstufen, Waltersdorf Hauptstraße 25, Kammstraße bei Hölle 3. Hochwald (80) und Lausche (58) sind Sackgassen ohne Hinweis.


## Aus UEBERGABE.md verschoben (Stand 0.20.0): 0.19.1 und 0.19.2

**Tschechien, Treppen, Arm (0.19.1)**
- Tschechischer Teil (Süd: Lausche, Krompach, Jiřetín; West: Varnsdorf-Rand) jetzt wie Sachsen: `dop_gebiet.py ergaenzen [sek] cz` holt Orthofoto ČÚZK (WMS `ags.cuzk.cz/arcgis1/services/ORTOFOTO`, © ČÚZK, offene Daten CC BY 4.0, nur RGB) für alle Kachelzellen ohne sächsisches Luftbild; Vegetation aus Grünanteil (ExG) statt NDVI, Schatten/dunkles Nadelholz zählt als Krone. Sachsen-Zellen bleiben unverändert (Original in Sandbox `dop/ks/`). Dann `packen` → PNG-Transfer → `dop_einfuegen.py`. Ergebnis gesamt 397.679 Bäume + 70.718 Sträucher (+127k/+21k), Kacheln 3,7 → 4,4 MB.
- Polen (schmaler Streifen östlich der Neiße, ca. 0,6 km²): Geoportal-WMS (`mapy.geoportal.gov.pl …/ORTO/WMS`) liefert aus der Sandbox nur leere Bilder (4326 und 2180 getestet), bleibt ESA/OSM.
- Treppen: siehe Höhe oben. Test `tests/tstairfit.js` (alle Treppen alt/neu: sink/float/flach). Ergebnis neu: von 483 Treppen 9 mehr als 10 cm unter Gelände (alt 186), Rest-Ausreißer bei sehr steilen langen Treppen (Stufen max. 24 cm). `tstair.js` neu: `SIDE=1,-1` (mehrere Seiten), `FLOAT=1` (Treppe mit größtem Überstand im Umkreis 2,5 km).
- Achtung: 0.19.0/0.19.1 nannten Weg-ID 41396618 „Oybin Kammstraße“, die liegt aber in **Jonsdorf** (x −2510, z −478). Die echte Oybiner Treppe ist 1209305178 (siehe 0.19.2).
- Schultern 0.19.1 (Arm hängt gestreckt) war für Hicore „noch schlimmer“, ersetzt in 0.19.2. Alt: `window.OLD_CARRYARM3`.

**Hotfix 0.19.2**
- Zaun Oybin Kammstraße: kam nicht aus OSM (`gtFenceMesh`), sondern aus der Runden-Deko `placeInstanced(g,'zaun',…)` (Weidezaun-Modell, 7,5 m neben der Startrunde, zufällig). Neu `propOnWay(x,z,m)` (nur Zittau: Nebenstraße per `gnNear` oder `waysNear`, enthält Treppen): Zaunfeld wird an Mitte und beiden Enden geprüft, `roadside()` (Bäume, Schilder usw.) prüft die Mitte. 24 von 452 Zaunfeldern fallen weg (`window.__PW`). Tor statt Lücke verworfen: der Weidezaun gehört dort nicht hin. Alt: `window.OLD_PROPWAY`.
- Schultern: linker Arm angewinkelt (Ellbogen ca. 90°, nach hinten-unten), Hand locker vor der Hüfte, schwingt mit dem Schritt (Referenz: Hicores Cyclocross-Fotos vom 24.11., `uploads/hearth/432deada…`).
- Neue Tests: `tests/tprobe.js` (listet alle Meshes im Umkreis `R` um `X,Z`, Zaunfeld-Zähler, mit `OUT`+`CAMS="x,y,z,lx,ly,lz;…"` Bilder an genau der Stelle; ca. 8 min), `tests/tcarry.js` (Studio-Bilder der Schulter-Pose ohne Welt, `US` Schrittphase, `OLD=1`; ca. 3 min). `tstair.js` kann jetzt `WID=` (findet die Oybiner Treppe trotzdem nicht, weil unten kein Weg > 25 m anschließt).

## Aus UEBERGABE.md verschoben (Stand 0.21.0): Schultern 0.19.3–0.19.8, Gabeln 0.19.5

**Schultern 0.19.3** (Hicore am iPad: linke Schulter hängt, Körper gebogen, Griff von außen über dem Oberrohr)
- Ursache Biegung: Rücken-Bogen in `poseGLB` hatte seinen Kontrollpunkt bei x der Fahrposition (`hx/sx` ≈ Radmitte), beim Tragen stehen Becken/Schulter aber 22 cm daneben. Jetzt Mitte aus `hipL/sh`. Schlüsselbeine beim Tragen waagerecht statt vorn-unten. Alt: `window.OLD_CARRYSPINE`.
- Griff: Rad Euler x 0,2 → 0,35 (vorn tiefer), Ellbogen-Pol (−0,15, −0,6, 1): Arm unter dem Oberrohr durchs Dreieck, Hand am inneren Unterlenker (`GRIPF[2]` gespiegelt). Bei Gravel liegt die Rahmentasche im Dreieck, der Arm verschwindet dahinter (kein sichtbares Durchdringen). Alt: `window.OLD_CARRYGRIP`.
- Prüfen mit `tests/tcarry.js` (Ansichten `front,back,outer,ic,oc,left,right,q34`; `outer`/`oc` = Radseite).
- 0.19.4 (Hicore: Unterarm lag noch VOR dem Steuerrohr, Referenz Foto 1 vom 24.11.): Kontaktpunkt am Oberrohr 0,32 → 0,40, Rad Euler x 0,35 → 0,15, Ellbogen-Ziel `H.Right.E` im Rad-System (−0,3, 0,6, 0,2) als Pol, Griff am inneren Unterlenker 6 cm weiter hinten. `tcarry.js` gibt je Bild eine Zeile `mess` aus (Rad-Koordinaten): `crossFore.hinterHT` muss true sein, `dForeHT` ≥ 0,06. Stand: Gravel 12,6 cm hinter dem Steuerrohr, 9,5 cm Abstand; MTB 15,7 cm, 13,1 cm. Ansicht `fl` = Hicores Kamera vorne links. Alt: `window.OLD_CARRYGRIP2`.

- 0.19.8 (Hicore mit Screenshots: beim Absteigen ging das rechte Bein durch den Rahmen): Übergang `CY.k` in Phasen. Kurbel dreht zum Absteigen auf linkes Pedal unten (bis k 0,85, dann waagerecht). `carryBody`: k 0–0,15 Becken aus dem Sattel nach vorn/links/oben über das linke Pedal, k 0,45–0,78 zum Gehen. Rechtes Bein k 0,1–0,72: Fuß hinten hoch (Scheitel 8 cm über Hüfthöhe, 85 cm hinter dem Tretlager, Knie leicht gebeugt, Knie-Pol nach unten), Seitenwechsel nur oben (x-Wechsel bei u 0,35–0,65), Landung links neben dem Rad (x 0,36), dann in die Gehspur. Linker Fuß bleibt bis k 0,72 auf dem Pedal. Hände/Rad heben erst ab k 0,7 (`carryRig` w). Aufsteigen = rückwärts. Test `tests/tdismount.js` (KS = k-Werte, Bildfolge, `mess` mit Fuß/Knie). Alt: `window.OLD_DISMOUNT`.
- 0.19.7 (Hicore: „erst durch den Rahmen, um das Steuerrohr herum und dann zurück zum Lenker; das Steuerrohr klemmt in der Achselhöhle“): In 0.19.6 lag die Schulter schon außen (x −0,05 im Rad-System), der Oberarm kreuzte die Rahmenebene nie. Jetzt Gravel t 0,83, dx −0,03 (Schulter innen, x +0,04), E (−0,08, 0,74, 0,6): Oberarm kreuzt 4,8 cm HINTER der Steuerrohrachse durchs Dreieck (`crossUpper`), Ellbogen außen vorn, Unterarm kreuzt 9,7 cm VOR der Achse (`crossFore`). Gleich in allen Schrittphasen. MTB unverändert. Alt: `window.OLD_CARRYGRIP4`. tcarry: `VIEWS=none` misst nur. Bild vorschau/197_schultern_achsel.jpg.
- 0.19.6 (Hicore mit Foto 1 und Render nebeneinander: Unterarm muss aus Sicht von vorn VOR dem Steuerrohr liegen; „hinter“ in seiner früheren Nachricht war falsch verstanden): `carryGripPar(T)` liefert je Rad Kontaktpunkt `t`, Kippung `ex`, Ellbogen-Pol `E`, Griffverschiebung `gz`, Schulterversatz `dx`. Gravel: t 0,7, ex 0,15, E (−0,35, 0,75, 0,5), gz 0, dx 0,06 → Unterarm kreuzt 7,3 cm VOR der Steuerrohrachse (`abstand` > 0 in `mess`), 6,8 cm Abstand. MTB bleibt 0,4/0,15/(−0,3,0,6,0,2)/0,06 (Flatbar-Griff neben dem Steuerrohr, vorn herum geht nicht ohne Durchdringung). Probieren mit `window.__CA={…}`. Alt: `window.OLD_CARRYGRIP3`.

**Gabeln 0.19.5** (Hicore: MTB soll federn, Gravel sah nach Federgabel aus)
- Gravel: Gabelbein jetzt `taperLeg()` (CatmullRom-Rohr, 2,0 → 1,05 cm, oval, leicht nach vorn gebogen) statt zwei `ft`-Stücken mit Absatz. Alt: `window.OLD_GRAVELFORK`.
- MTB: Tauchrohre, Brücke, Ausfallenden, Vorderrad (`wF`), Achse, Scheibe und Sattel liegen in Gruppe `r.fork.g` (aus `buildDirtBike`, nicht verschmolzen). `forkStep(r)` (aus `placeRider`, nur eigener Fahrer) = Feder-Dämpfer k 800, ζ 0,45, Ziel aus `WF.rough`·Tempo·Rauschen, `WF.y`, `STAIR.bump`, Bremsen; Weg 0–6 cm entlang Lenkachse. Schotter bei 18 km/h: 6–15 mm. Beim Tragen 0. Aus: `window.NO_FORKMOVE`.
- Test: `FORKX=0.05 BIKES=mtb VIEWS=forkS,fork node tbike.js` (Zeile `gabel` = Federweg-Simulation, Bild mit festem Einfederweg).



## Aus UEBERGABE.md verschoben (Stand 0.22.0): Leistung 0.20.0–0.20.2

**Leistung 0.20.0** (Hicore: Chrome am iPad konstant „30 FPS · 70 %“, auch an einfachen Stellen)
- Ursache 30: Die Logik senkte erst die Auflösung bis 70 % (`DRES`), dann begrenzte `FCAP` fest auf 30. Da 70 % nicht half, war das Gerät nicht an den Pixeln, sondern an CPU/Zeichenaufrufen begrenzt. Neu: bringt eine Senkung keine Verbesserung (< 6 %), geht die Auflösung zurück auf 100 % und bleibt 3 min gesperrt (`DRES.chk/block`). Alt: `window.OLD_DRES`.
- FPS-Anzeige zeigt jetzt „· max 30“ (Begrenzung aktiv) und „CPU x ms“ (JS + Zeichenbefehle je Bild, `window.FPSINFO`). CPU klein, aber trotzdem 30 → Grafikkarte oder Gerät (Stromsparmodus begrenzt Safari/WebKit auf 30).
- Messung neu: `tests/tgpuperf.js` (Zeichenaufrufe je Bild nach Gruppe, Präfix `S:` = Schattendurchgang, CPU-Zeit von `POST.render`; `GFX=0.5|0.7`, `QS='&gl=1'`, `WAIT`, `NF`). Echtes WebGPU über SwiftShader geht mit `channel:'chromium'` + `--enable-unsafe-webgpu --use-webgpu-adapter=swiftshader`, aber das Gerät geht nach kurzer Zeit verloren (Speicher), deshalb mit `&gl=1` messen.
- Ergebnis Jonsdorf, Mittel: Zeichenaufrufe ca. 1.450 → ca. 700 je Bild, `POST.render` CPU 33 → 19 ms (Cloud). Davon Wald-Kacheln 913 → ca. 100.
- Kachelwald gebündelt (`GT.w`, `gtwSet`): Nah-/Mittelstufe je Baumart und Teil ein Instanz-Mesh für alle Kacheln (wächst bei Bedarf ×1,4). Minikronen je Kachel nur noch 2 Meshes (`F.m2`, Kegel/Krone als Einheitsform `gtMiniU`, Größe in der Instanzmatrix `mp.P`, Farbe in der Instanzfarbe). Alt: `window.OLD_GTW`.
- Baumschatten (Strecken-Bäume `TREE_LOD`): nur Bäume im Schattenbereich (`nearS`, Radius `TREE_SHR` = Schattenausschnitt + 40 m) werfen Schatten, ferne nie. Alt: `window.OLD_TREESH`. Leere Instanz-Meshes werden unsichtbar geschaltet (`OLD_IMVIS`).
- HUD nur 10×/s und nur geänderte Texte, Fahrerliste 2×/s, Höhenprofil 5×/s ohne `clientWidth` je Bild (erzwang nach den Textänderungen jedes Bild ein Layout), Grundbild per `drawImage`. Alt: `window.OLD_HUD`.
- iPad-Werte 0.20.0 (Hicore, Chrome, 25.11.): Hoch 24 FPS · max 30 · CPU 10 ms (ruckelt), Mittel 29 FPS · max 30 · CPU 9,4 ms (flüssig). CPU reicht für 60, die **Grafikkarte** ist die Grenze.
- 0.20.1 `LTEST` (Tipp auf `#fps`): misst je 5 s ohne 30er-Grenze Basis, ohne Bloom, ohne Schatten, Auflösung 70/50 %, ohne Alphatest-Laub/Gras, ohne Bäume, ohne Gras/Deko; versteckt per `layers.set(7)`, Ergebnis-Tabelle oben, `window.LTEST_RES`. In der Cloud nur Ablauf prüfbar (0 FPS). 
- Leistungstest am iPad (25.11., Mittel, Pixel 1,4): **Chrome** Basis 51 FPS, ohne Bloom 54, ohne Schatten 59, Auflösung 70 % 60, ohne Bäume 55 (Werte durch überholende Autos verrauscht). **Bluefy** Basis 36, Auflösung egal (32–33), ohne Alpha-Laub/Gras 45, ohne Bäume 49. CPU überall ca. 10 ms. Lesart: Chrome hängt knapp unter der 54er-Schwelle und an den Pixeln, Bluefy an den Bäumen (Blattkarten, vermutlich Eckpunkt-Last), nicht an der Auflösung.
- 0.20.3 (Hicore: 0.20.2 lief erst 60 FPS/90 %, dann alle ~30 s Ruckler und wieder „28 FPS · max 30“): `FPSCTL.win(fps, maxFrameMs)` ersetzt `DRES.tick`/FCAP-Zweig. Unter 55 FPS Auflösung −10 % bis 70 % (nach jedem Wechsel ein Fenster Pause), kein Gewinn bei 70 % (< 3 FPS ggü. 100 %) → zurück auf 100 % und 5 min Sperre; 50–55 ungebremst, < 50 → 30er-Grenze, Probe alle 3 min; hoch +5 % nach 4×≥59, fällt es binnen 12 s → 3 min keine Erhöhung; Fenster mit Bild > 250 ms (Nachladen) zählen nicht. Alt: `window.OLD_FPSCTL`.


## Aus UEBERGABE.md verschoben (Stand 0.23.1): 0.21.0 Impostors, Ruckler

- **0.21.0 Impostors (Bild-Bäume)**, Hicore will vollen Mischwald: `IMP`, `impAtlas` rendert beim Laden jede Art (`IMP.kinds`, 14 ohne Obstbäume) aus 8 Richtungen in einen Atlas (`RenderTarget` 8×256 × 14×256 px, Mipmaps, schwarz+Alpha 0 = vormultipliziert; LITE 128 px). `impCal` misst einmal per 2-Farben-Bild, ob das Backend Render-Target-Texturen gespiegelt ausliest (`IMP.fl`; WebGL2 ja). `impSet`/`impPut`/`impFin`: ein Mesh (`InstancedBufferGeometry`, Attribute `iP` x,y,z,rIn · `iS` Breite,Höhe,Drehung,Zeile · `iC` Farbe,rOut) = 1 Zeichenaufruf für alle Bild-Bäume. In `gpuFx` Zweig `fx.imp`: Quad dreht zur Kamera, Atlasspalte aus Blickwinkel minus Baumdrehung, Nachbarspalten weich gemischt, Normale kugelförmig (Licht wie Blattkarten), Instanzfarbe nach der Gamma-Umrechnung (wie 3D-Bäume), Schnee wie Laub, Gegenlicht-Schimmer, Alpha-Anhebung bei Verkleinerung. Übergang 3D ↔ Bild per Raster über `LOD_B` 12 m, Bild ↔ Fernkrone (Streckenbäume) ebenso.
  - Radien: 3D bis `impR()` = 60 m (LITE 45, MINI 35, `window.__IR` zum Probieren), Kachelwald Bild bis `gtMidR` 280 m, dann Minikronen wie bisher. Streckenbäume (`TREE_LOD.I`): 3D bis max(60, Schattenbereich `TREE_SHR`), Bild bis `GFX_TREE_R`, dann Fernkrone. Mittelstufe (vereinfachte Kronen) entfällt für Arten mit Bild.
  - Neu für alle Baumstufen: Instanzmitte `iO` (gesetzt über Hook in `setMatrixAt`), Vertex-Shader legt Bäume außerhalb ihres Bereichs auf einen Punkt (vorher bis 30 m Überhang voll gerechnet und nur per Raster verworfen). Alt: `window.OLD_NCULL`.
  - Alt komplett: `window.OLD_IMP` oder `?oldimp=1`. Test `tests/timp.js` (`FPT=1` Waldrand-Punkte, `PRE='window.__IR=8'` = fast alles als Bild zum Vergleich, Atlas als `atlas*.jpg`). Bild vorschau/210_impostors.jpg.
  - Zahlen Waldrand Jonsdorf: 3D-Bäume 480–620 → 90–140 je Bild, dazu 1.100–1.600 Bild-Bäume in einem Aufruf; Mittelstufe 1.100–1.600 → 0.
- Ruckler (0.21.0, `tests/tstutter2.js` fährt die Strecke in 8-m-Schritten ohne Bildaufbau ab und misst die Streaming-Funktionen): Spitzen kommen von `gtFinish` (Gelände-Kachel fertigstellen, Cloud bis 18 ms), `gtForestRange` (bis 11 ms) und `fvFill` (Fernsicht neu verteilen, 5–13 ms, lief beim Nachrechnen alle 0,5 s und lud jedes Mal bis 8,5 MB Instanzdaten hoch). Neu: `upR` lädt nur den belegten Teil der Instanzpuffer hoch (Fernsicht, Wald, Bild-Bäume), Fernsicht beim Nachrechnen höchstens alle 2,5 s. Alt: `window.OLD_UPR`. `gtFinish` ist seit 0.22.0 in Zeitscheiben.
- Poly-Haven-Bodentexturen (0.21.0) sind Standard: gleiche Größe (512 px) und Anzahl wie die bisherigen, also kein FPS-/Speicherunterschied. Einmalige Umstellung über `hicoreRide.tex21`, danach gilt die Wahl im Menü.
- Nächster Hebel für Bluefy (falls Hicore dort 60 will): Nahstufe der Bäume billiger (weniger Blattkarten, kleinerer Radius `gtNearR`/`GFX_TREE_R`), sichtbar prüfen.
- Noch offen (falls nötig): eigener Fahrer 57 Zeichenaufrufe + 55 im Schatten, unbenannte Deko-Gruppe ca. 90, Häuser je Kachel ca. 60.

## 0.22.0 Tiere und Autos (aus UEBERGABE verschoben am 26.11.2026)

**Tiere und Autos 0.22.0** (Hicore: Hirsch auf der Kammstraße hüpfte; Autos sollen lenken/blinken; Räder wirkten achteckig wie Papier; Ruckler beim Nachladen)
- Blickrichtung korrigiert in `PROP_FIX` (`ry`, alt `ry0`): Reh lief rückwärts, Hirsch/Kuh seitwärts, Pferd/Huhn rückwärts, Ziege schräg.
- Skelett automatisch (`ANIM_CFG`, `animRig`, `animObject`, `animUpdate`, Block `/*ANIM-START*/`): Beine aus Punkten unter dem Bauch (`bf` = Bauchhöhe/Höhe) per k-Mittel vorn/hinten, links/rechts; Knochen Wurzel, Rumpf, Kopf/Hals, je Bein oben/unten, Gewichte weich; `SkinnedMesh` teilt Geometrie und Material (1 Zeichenaufruf je Tier wie vorher). `propObject` liefert für Tiere in `ANIM_CFG` das Skelett-Objekt.
- Gangarten (`ANIM_GAITS`, Beine LH, LV, RH, RV): Schritt lateral je 1/4, Trab diagonal, Transversalgalopp (Hirsch/Reh/Pferd), Sprunggalopp (Katze/Eichhörnchen), Hühner zweibeinig. Wechsel nach Froude-Zahl (Trab ab ~0,5, Galopp ab ~2,5), Schrittlänge 2,3·Beinlänge·Fr^0,3 (Alexander & Jayes), Kopfnicken im Schritt, Rumpfschwingen im Galopp, Grasen senkt den Kopf (`gr`).
- Verhalten: `deerStep` (grast/schaut/geht, unter 75 m schaut es zum Fahrer, unter 40 m Flucht mit Schreck, Antraben, Galopp bis `vmax` 11–12 m/s, Drehrate begrenzt), `critterAnim` (Weide-/Hoftiere grasen, gehen ab und zu ein paar Meter, Hühner trippeln und picken; über 160 m Pose eingefroren). Eichhörnchen/Katze laufen statt zu hüpfen. Hase hoppelt weiter (ist richtig). Vögel unverändert.
- Autos (`steerStep`, `blinkStep`, `turnAt`): Spurwechsel weich (`c.lv`, begrenzte Seitenbeschleunigung), Karosserie zeigt in die Bewegungsrichtung, Vorderräder lenken mit; Wanken ~3,7°/g, Nicken ~2,6°/g über gedämpfte Feder (1,4 Hz, ζ 0,4). Blinker (`c.bl`, 4 Lampen + Lichthof) 1,5 Hz: ~1 s vor dem Ausscheren (`c.pbT`), beim Wiedereinscheren, Anfahren vom Rand, Rechtsranfahren, vor Abbiegen an Kreuzungen (Kantenwechsel in `NET.cur.ents`, Knoten mit ≥3 Straßen, Richtungsänderung > 0,55 rad). Alt: `OLD_CARDYN`, `OLD_BLINK`.
- Räder (`wheelGeo`, `wheelTex`, `wheelMat`, `axleX`): eigener runder Reifen (Drehkörper 32 Segmente) + Alufelge 5 Speichen (Traktor gelb 8), Achsen/Spur aus den alten Rad-Dreiecken; über 26 rad/s verwischte Felge gegen Stroboskop. Alt: `OLD_WHEELS`.
- Nachladen: `gtFinishStep` verteilt das Fertigstellen einer Geländekachel auf 5 Bilder (Normalen, Schilder, Nebenstraßen, Wege+Treppen, Einhängen), `gtJobDrop`. Alt: `OLD_GTFS`.
- Test `tests/tanim.js` (`TI=1,4` Autotypen, `KINDS=reh,hirsch`, `OUT`): Auto seitlich/vorn/hinten mit Blinker, Tier ruhig/Schritt/Flucht. Gangbilder ohne Spiel: Harness in der Thread-Sandbox (lädt `props/*.glb` + Block ANIM), Bild vorschau/220_tiere.jpg, 221_autos.jpg.



## 0.23.0 Handy-Fernbedienung (aus UEBERGABE verschoben am 26.11.2026)

**Handy-Fernbedienung 0.23.0** (Hicore 25.11.: „wie bei Zwift eine Companion-App“)
- Seite `quelle/handy/index.html` (Quelle) → `build_gpu.py` kopiert nach `gpu/handy/` mit `qrcode.js` (qrcode-generator 2.0.4, MIT) und `supabase.js`. Online: https://hicore77.github.io/hicore-ride/webgpu-spiel/handy/ (ohne App Store, im Handy-Browser).
- Kopplung: Spiel erzeugt einen 6-stelligen Code (`store cmpCode`, bleibt gleich, „Neuer Code“ im Fenster), Kanal `hc:CODE` über dasselbe Supabase-Projekt, getrennt vom Multiplayer-Raum. Öffnen über 📱 oben rechts im Spiel oder Menü › 1 · Welt › unter Gruppenfahrt „Handy koppeln“ (QR-Code + Link). Einmal gekoppelt verbindet sich das Spiel beim Start selbst (`cmpOn`), das Handy merkt sich den Code.
- Spiel (`CMP` in `src.html` nach `MP`, `CMP.frame` in der Hauptschleife): Presence `r:'game'`/`r:'phone'`, sendet Live-Werte 2×/s nur bei verbundenem Handy (`s`: Watt, Kadenz, Puls, km/h, Steigung, Strecke, Zeit, Höhenmeter, Pause, Kreuzung mit Optionen), empfängt `k` (L/R/S Abbiegen, J Option direkt, U Wenden, P Pause, C Kamera, H Anzeige, G Geste) und antwortet `ack` mit Meldung. L/R wählt den nächstliegenden Abzweig der Seite (nochmal tippen = nächster, z. B. scharf links), ohne Kreuzung gilt der Pfeil 60 s als Vorwahl für die nächste. Aus: `window.NO_CMP`.
- Handy: große Pfeile, Kreuzungsoptionen mit Ziel, Wenden/Pause/Kamera/Anzeige, 5 Gesten, Bildschirm bleibt an (Wake Lock). Kein Server nötig außer Supabase (Free-Kontingent: ca. 7.000 Nachrichten je Fahrstunde).
- Test `tests/thandy.js` (Spiel + Handy-Seite im selben Browser, Supabase durch `tests/fake_supabase.js` über BroadcastChannel ersetzt, weil die Cloud Supabase nicht erreicht). Echte Verbindung nur bei Hicore prüfbar.

## Aus UEBERGABE.md verschoben (Stand 0.24.1)

**Restpunkte 0.23.1** (Hicore 25.11.: schwimmendes Feldwegende, Schneekante auf Dächern, FIT-Download)
- Prüfskript `tests/twend.js` (ca. 40 s): misst jede Wegecke (29.000 Stücke) gegen das gezeichnete Gelände (10-m-Raster), dazu Brückendecks und Treppen. Ergebnis vorher: 169 Treppen standen über 0,8 m (bis 6,4 m) in der Luft, der Weg am Treppenende schwebte mit (`stairBlend`); Wege auf Kuppen bis 1,4 m über dem sichtbaren Boden, in Mulden darunter; an Straßen angehobene Wegenden (`wayLiftY0`, meist 0,35–0,7 m) ohne Unterbau. Meldungen „einschnitt“ sind Fehlalarm (feines Einschnitt-Netz deckt das abgesenkte Raster).
- Treppen (`stairInit`): OSM-incline gegen das Gelände (> 0,5 m andersrum) → Gelände gewinnt; steht die Treppe schon 30 cm über dem Boden, Podest statt Stufe, fällt das Gelände (Kuppe), geht sie wieder hinunter (Rückseite gezeichnet). Jetzt 0 Treppen über 0,8 m. Alt: `window.OLD_STAIRFLOAT`.
- Wege: `terrMeshY(x,z)` = Höhe des gezeichneten Rasters (Cache `TMY`), genutzt in `gtSideMesh`, `rgPts` (Fahrlinie auf Wegen), Wurzeln. Alt: `OLD_WAYMESHY`. Böschung (Grasschicht 6, im Wald 7) an jeder Wegkante, die > 10 cm über dem Raster liegt. Alt: `OLD_WAYSKIRT`.
- Dachschnee (`roofSnowMesh`, `scFace`, `SNOWCAP.th`, `roofSnowTick`): je Häuserkachel eine Schneedecke auf Sattel-/Walmdächern (Attribut `so` = Verschiebung je m), Kante und 12 cm Überhang an der Traufe, First geschlossen. Dicke bis 24 cm nur bei geschlossener Schneelage („viel“), bei Tauwetter weniger, sonst unsichtbar. Nicht auf MINI. Aus: `NO_ROOFSNOW`. Sonderbauten (Kirchen, Higgsfield) ohne.
- Schneeknirschen (`AMB.snowBuf` erzeugt die Schleife, `snowUnder`): auf Wegen/Nebenstraßen nach Schneelage, Hauptstraße nur festgefahren (geräumt wenig Matsch), Abrollrauschen dann leiser. Regler „Fahrgeräusch“. Aus: `NO_SNOWSND`.
- Speichern (`saveFile`, `saveSheet`): auf iPad/iPhone immer eigenes Fenster; Teilen erst beim Tipp dort (Geste ging beim Bild vorher verloren), probiert mehrere Dateitypen, zeigt Fehlername; „An gekoppeltes Handy senden“ (`CMP.sendFile`, Kanal-Ereignis `f` in 40.000-Zeichen-Stücken, Bestätigung `fa`; Handy-Seite zeigt Teilen/Herunterladen), „Bild kopieren“, Download-Link. Alt: `OLD_SAVE`. Test `thandy` prüft Übertragung (150 KB) und Fenster.


## 0.23.1 und 0.23.2 (aus UEBERGABE verschoben am 26.11.2026)

**Autoräder und Einlenken 0.23.2** (Hicore 26.11.: „Räder sehen aufgesetzt aus, Einlenken sieht komisch aus“)
- Ursache Räder: Außenseite stand ca. 8 cm über dem Kotflügel (Lage aus den herausgeschnittenen Modellrädern), Radkasten zeigte Karosserie/Himmel und Reste des Modellreifens. Jetzt misst `split` je Achse die Kotflügelkante `A.ax` (98 % der Punkte im Ring 1,06–1,5 r über der Achse), schneidet das Modellrad ganz heraus (`A.xi`, unten bis 1,16 r) und rückt das Rad auf 3,5 cm innerhalb der Kante. `linerGeo`/`linerMat`: dunkles Radhaus (Bogen + Innenwand, alle 4 in 1 Zeichenaufruf). Traktor unverändert. Alt: `OLD_WHEELS`.
- Ursache Einlenken: Lenkwinkel folgte der gemessenen Drehung über zwei Glättungen (ca. 0,7 s zu spät). Neu `steerStep2`: Hinterachse läuft ohne Schräglauf auf der Spur, Karosserie dreht um die Hinterachse (`c.zr`), Lenkwinkel = atan(Radstand·Krümmung) aus Straße (`headingAt` um die Vorderachse, im Kreisel-Gegenverkehr gemessen, `c.rbA`) plus Spurwechsel, max. 0,9 rad/s, Ackermann je Rad, Wanken aus v²·Krümmung. Alt: `OLD_CARSTEER`.
- Prüfstand ohne Spiel (ca. 1 min statt 20): Thread-Scratchpad `car/` (gen.js zieht die TRAFFIC-Teile aus src.html, shot.js rendert Autos einzeln, steer.js protokolliert einen Spurwechsel). Bild vorschau/250_autoraeder.jpg. Nicht im Repo; bei Bedarf neu bauen.

**Restpunkte 0.23.1:** Details (`twend`, `OLD_STAIRFLOAT`, `terrMeshY`/`OLD_WAYMESHY`, `OLD_WAYSKIRT`, Dachschnee `NO_ROOFSNOW`, Knirschen `NO_SNOWSND`, Speichern-Fenster `saveSheet`/`CMP.sendFile`/`OLD_SAVE`) jetzt in `docs/ARCHIV.md`.

## Aus UEBERGABE.md verschoben (Stand 0.24.4): HUD/Puls 0.24.1, Regler 0.20.3

**HUD und Puls 0.24.1** (Hicore 26.11.: Puls fehlt am Handy, HUD oben überladen, Screenshot Bluefy)
- Puls: Ursache war `h:S.hr&&!S.sim?…:0` in `CMP.frame`. Hicore fährt mit Stages ohne Trainer, also immer Testmodus (`S.sim`), dann wurde nie Puls gesendet, auch mit TICKR. Neu `realHr()` (bei `let hrDev`): Pulsgurt verbunden oder Puls vom Trainer; im Testmodus ohne Gurt ist `S.hr` geschätzt → 0. Gilt auch für die Live-Anzeige im Menü (`lvH`). `thandy` prüft beides (Wartezeiten jetzt per waitForFunction, dadurch auch „Watt kommen an“ grün; weiter rot und vermutlich Testproblem: „Vorwahl gespeichert“, „Datei am Handy bestätigt 1/5“).
- HUD: `hudStack()` (vor `toast`, 10x/s im HUD-Takt) setzt `top` von `#segbox`, `#junc`, `#toast` der Reihe nach unter die Kacheln (`.hud`), je 6 px Abstand. FPS-Anzeige oben links (vorher Mitte über den Kacheln). Bergwertung eine Zeile (`.segbox.cmp .sr`: Name, Rest-m, Zeit, Best, Marke „Test“), Testmodus-Hinweis nur noch einmal je Fahrt als Meldung (`SEG.testNote`). Hauptkreuzungen erst ab max(110 m, 9 s) sichtbar (Wahl per Taste/Handy weiter ab 160 m), neben Bergwertung kleinere Knöpfe (`#junc.jseg`). Alt: `window.OLD_HUDSTACK` (Stapeln, Kreuzungsabstand, jseg).
- Test `tests/thud.js` (ca. 20 min, `ROOT=` für alten Stand, `TAG`): Bergwertung + Kreuzung + Meldung + FPS gleichzeitig, misst Überlappungen, Bilder iPad 1180×820 und Handy 390×844. Bilder vorschau/261, 262.

- 0.20.3 (Hicore: 0.20.2 lief erst 60 FPS/90 %, dann alle ~30 s Ruckler und wieder „28 FPS · max 30“): `FPSCTL.win(fps, maxFrameMs)` ersetzt `DRES.tick`/FCAP-Zweig. Unter 55 FPS Auflösung −10 % bis 70 % (nach jedem Wechsel ein Fenster Pause), kein Gewinn bei 70 % (< 3 FPS ggü. 100 %) → zurück auf 100 % und 5 min Sperre; 50–55 ungebremst, < 50 → 30er-Grenze, Probe alle 3 min; hoch +5 % nach 4×≥59, fällt es binnen 12 s → 3 min keine Erhöhung; Fenster mit Bild > 250 ms (Nachladen) zählen nicht. Alt: `window.OLD_FPSCTL`.


## 0.24.2 Bluefy-Anmeldung (aus UEBERGABE verschoben)

**Bluefy-Anmeldung 0.24.2** (Hicore 26.11.: Google geht in Bluefy nicht, E-Mail brachte nur „Confirm“-Link, keinen Code)
- Ursache E-Mail: Supabase-Vorlagen enthalten ab Werk keinen Code, und im Free-Plan sind sie nur mit eigenem SMTP änderbar (deshalb 0.24.3).
- Google in Bluefy wird gesperrt (eingebetteter Browser). `ACC.blu()` = iOS + `navigator.bluetooth`; dort öffnet der Google-Knopf die Übergabe (`ACC.handStart`): Code + QR auf `handy/login.html?c=CODE`. Die Seite (Handy oder Chrome) meldet mit Google an und sendet die Sitzung über Realtime-Kanal `hl:CODE` (`hlSend`, Wiederholung alle 2,5 s bis `ok`); Spiel macht `setSession`. Der Sender vergisst die Sitzung danach lokal (gleicher Erneuerungsschlüssel auf zwei Geräten → Supabase meldet beide ab). Code gilt 10 min.
- Angemeldetes Spiel kann unter „Anderes Gerät anmelden“ selbst übertragen (`ACC.give`, meldet sich dabei ab). Vor Google-Weiterleitung `GET /auth/v1/settings` (`googleOn`), damit keine rohe JSON-Fehlerseite kommt.
- Test `tests/thlogin.js` (Spiel ↔ login.html und Spiel → Spiel, `fake_auth.js` mit Fake-Kanal/`FAKE_OAUTH`), `tacc` weiter grün.

## Aus UEBERGABE.md verschoben (Stand 0.25.0)

**0.24.3 Passwort als Hauptweg** (Hicore 26.11.: Screenshot, Mail-Vorlagen im Free-Plan nur mit eigenem SMTP änderbar → kein Code möglich): `ACC.register` (`signUp`; mit Session = sofort angemeldet, `identities:[]` = Adresse vergeben, sonst Hinweis auf Bestätigungs-Link), Felder E-Mail + Passwort vorn, Code-Login in `<details>`. Einrichtung: „Confirm email“ aus, optional Hostinger-SMTP (`docs/KONTO_EINRICHTEN.md` Schritt 3/4). Test `tacc` (26 Prüfungen inkl. Registrieren).

**Konten 0.24.0** (Hicore 26.11.: „Accounts wäre nicht schlecht“)
- Supabase Auth im selben Projekt wie Multiplayer (`ACC` in `src.html` direkt vor `$('bTr').onclick`). Eigener Client mit `persistSession`, `flowType:'pkce'`, `storageKey:'hicoreRide.auth'`; Multiplayer/Handy-Clients bleiben ohne Sitzung. Rückkehr-Adresse = `location.origin+pathname` (nichts fest verdrahtet, eigene Domain nur in Supabase eintragen).
- Anmelden über 👤 oben rechts im Menü (`#accModal`): E-Mail-Code (`signInWithOtp` + `verifyOtp type:'email'`, Hauptweg für Bluefy, weil Links aus der Mail-App in Safari landen), Passwort (nach erster Anmeldung im Konto festlegen), Google (`signInWithOAuth`; setzt vorher `bootN`/`stage` zurück, sonst startet das iPad nach der Rückkehr im MINI-Modus). Fehlertexte deutsch (`ACC.em`). Link im falschen Browser → Hinweis, Code einzugeben.
- Daten (SQL `supabase/konto.sql`, RLS je Konto): `profiles` (Name, Gewicht, FTP, Puls max., `settings` jsonb, `total_km`), `segment_bests` (beste Zeit gewinnt, `ACC.bestPush` bei neuer Bestzeit, Abgleich in `syncBests`), `rides` + Bucket `fit` (`<uid>/<id>.fit`, nur Fahrten mit echtem Trainer ab 1 min, `ACC.saveRide` in `endRide`, Warteschlange `hicoreRide.accQ` bei fehlendem Netz/Login, max. 10), `delete_my_account()`.
- Einstellungen: `ACC.KEYS` (Gewicht, Schwierigkeit, Bots, Trikot, Watt-Glättung/-Korrektur, Rad, Tageszeit, Wetter, Schnee, Ton, Bloom, Name, Anzeige, Welt, FTP, Puls max.). Nicht synchron: Grafikstufe, Gemini-Schlüssel, Handy-Code. `store.set` ist umhüllt (`ACC.touch` setzt `hicoreRide.accLocalT`), neuere Seite gewinnt (`settings._t`), Hochladen 3 s nach Änderung. `totalKm` = Maximum.
- Konto-Fenster: Profil, Meine Fahrten (FIT herunterladen über `saveFile`, löschen mit zweitem Tipp), Bestzeiten-Zahl, Passwort, Abgleichen, Abmelden, Konto löschen (zweiter Tipp). Aus: `window.NO_ACC`.
- Einrichtung im Supabase-Dashboard: `docs/KONTO_EINRICHTEN.md` (SQL, Redirect-URLs, `{{ .Token }}` in Mail-Vorlagen, eigener SMTP für Freunde, Google-Client). Supabase-Standardversand schickt nur an Team-Mitglieder.
- Test `tests/tacc.js` (ca. 1 min, kein Spielstart nötig): `fake_auth.js` (im Browser, über `window.HC_SB`) + `fake_auth_srv.js` (Node, RLS-Nachbau), zwei Kontexte = zwei Geräte. 23 Prüfungen: Code-Login, Profil/Einstellungen hoch und runter, Bestzeiten in beide Richtungen, Fahrt + FIT, Passwort, Sitzung nach Neuladen, Google-Meldung, Konto löschen. Echte Supabase nur bei Hicore prüfbar.

## Aus UEBERGABE.md verschoben (Stand 0.25.2)

**0.24.5 Abbiege-Fehler, Welten ausgeblendet** (Hicore 26.11.: Fehler „bt.innerHTML … null“ auf der Sonneninsel vor einem Abzweig; Hügelland/Alpenpass nicht löschen, nur unsichtbar)
- Ursache: Zittau (`gJunUI`) und Rundkurs-Welten (`junUI`) teilen sich `#junc`. `junUI(null)` (auch aus `gNetStep`) setzt `dataset.g=''`, ohne den Inhalt zurückzubauen; nach einer Zittau-Fahrt in derselben Seite fand `junUI` dann keinen `[data-v=turn]`-Knopf. Jetzt baut `junUI` neu, wenn der Knopf fehlt. Elbsandstein hat keine Abzweige (`NET` null), dort tritt der Fehler nicht auf.
- Welten: `hidden:true` an `huegel`/`pass`, `wVis(w)` (nach `WORLDS`) filtert Weltauswahl, gespeicherte/Konto-Welt, Fortsetzen, Freischalt-Meldungen. Zum Testen `window.SHOW_ALL_WORLDS=1`.
- Test `tests/tworlds.js` (`W=insel,elbe`, ca. 10 min je Welt): ganze Runde mit `netStep`, frisch und mit Zittau-Kreuzungsfeld; listet Weltkarten. Alt (ROOT=webgpu-spiel): Fehler wie bei Hicore, neu 65× Abzweig angezeigt, kein Fehler. `terr2` none.

**0.24.4 Zäune, Gras, Handy, Trikots** (Hicore 26.11.: Dekozäune quer über Straßen und Bahn, Grasbüschel auf Kopfsteinpflaster, Handy-Layout springt, Trikot-Schrift zu groß)
- Zäune: `fenceHit(ax,az,bx,bz,m)` (bei `propOnWay`) prüft ein Zaunstück alle 0,5 m gegen Straßen (`gnNear`, Rand + m), Wege/Treppen (`waysNear`) und Gleise (`railNear`, eigenes 20-m-Raster aus `ZSB.lines`, Schmalspur 1,6 m, Normalspur 2,1 m halbe Bettbreite). Gilt für OSM-Zäune (`gtFenceMesh`, m 1,0), Deko-Zaun entlang der Runde (`addProps`, m 2,6 = auch nicht auf dem Pflasterstreifen), Weidezaun (m 2,6), Jägerzaun/Hecke (m 1,0 + nicht auf Pflaster, `buildFencesHedges`) und Vorgartenzäune (`gardenFences`). Vorher wurden Gleise nirgends, Wege bei Weide-/Jägerzaun gar nicht geprüft. Alt: `window.OLD_FENCECHK`.
- Gras: `gnPave(x,z,m)` (nach `gnNear`, das jetzt auch `px/pz` liefert) = liegt der Punkt auf dem Pflaster-/Splittstreifen im Ort (gleiche Breiten wie `orBuilder`). Feines Gras/Büschel (`gfCell`) und Rand-Büschel/Blumen (`buildVerge`, dort auch nicht mehr auf Wegen) lassen diese Stellen aus. Alt: `window.OLD_GRASSPAVE`.
- Handy (`quelle/handy/index.html`): Kreuzungsfeld hat feste Höhe (Text 2 Zeilen, Knopfreihe 52 px, Knöpfe einzeilig), Pfeile rutschen nicht mehr.
- Trikots: Schriftzüge aus `jer/tex_sprint.jpg` und `jer/tex_berg.jpg` entfernt (`werkzeuge/trikot_ohne_text.py`, Inpainting direkt in der UV-Textur; Originale in der Git-Historie). Vorschaubilder `thumb_*` unverändert.
- Test `tests/tfence.js` (ca. 20 min, `PRE='window.OLD_FENCECHK=1;window.OLD_GRASSPAVE=1;'` = alter Stand): zählt Zaunstücke, die Straße/Weg/Gleis berühren, und Feingras auf Pflaster. Ergebnis Start Zittau: alt 54 Zaunstücke über Wege/Gleise (Weide, Jäger, Hecke), neu 0; Ortskern Zittau Feingras auf Pflaster alt 3.653, neu 0. `terr2` none.

**0.25.4 Bergbäche und Seen**: `dolo_bau.py` exportiert `ZGNET.streams` ([Breite, x0,z0,…], stream 2,6 m, river 7 m, OSM-width) und `ZGNET.lakes`. `buildDoloWater`: Kiesbett (`geroell`-Textur) + türkises Fließwasser (`flowWaterMaterial`, schneller) knapp über dem Gelände, unter Straßen ausgespart; Seen auf tiefster Uferhöhe. Bachrauschen über `window.DLWPTS` (Ton `prep`). Aus: `window.NO_DLWATER`. Test: `WAT=1 node tdolo.js`. Offen: Bäume halten noch keinen Abstand zum Bach.

## Aus UEBERGABE.md verschoben (Stand 0.25.8)
| 0.25.5 | Drivo: Kadenz im Steuermodus (Commit c5482d0) |

## Aus UEBERGABE.md verschoben (Stand 0.25.9)
| 0.25.6 | Dolomiten realistischer: Höhenmodell TINITALY 10 m, Poly-Haven-Fels, Dunst, Bachrinnen mit Ufersteinen und Strömung, Haustypen Cortina/Chalet/Albergo/Casa, Datenquellen-Seite |

## Aus UEBERGABE.md verschoben (Stand 0.25.10)
| 0.25.7 | Dolomiten: echter Himmel als Foto (Poly Haven), Halm-Nahdetail am Boden, Almwiese höher, Randstreifen nimmt Satellitenfarbe an |


## Aus UEBERGABE.md verschoben (Stand 0.26.0): Dolomiten 0.25.0–0.25.8

**0.25.8 Dolomiten: Felsformen** (Hicore 27.11. mittags mit 6 Fotos vom Passo Giau: „Berge zu Standard, zu gleichmäßig“, „mach alles möglich was geht“; Fotos nur als Anschauung)
- Kette der Werkzeuge: `werkzeuge/dolo_bau.py` → `werkzeuge/dolo_terrassen.py` → `werkzeuge/dolo_detail.py` → `build_gpu.py`. `dolo_terrassen.py` sichert beim ersten Lauf `dolo/dem10_roh.png` und rechnet immer von dort (mehrfach ausführbar).
- `dolo_terrassen.py`: versteilt nur steilen Fels (>40–52°, nicht Wald/Siedlung, Abstand zu Straßen, Wegen, Häusern, Bächen) in Wandstufen von 105–150 m; 9,9 % der Fläche geändert, höchstens 35 m, Anteil >70° von 0,34 auf 1,46 %. Schreibt außerdem 20.000 Felsbrocken nach `meta.json` (`blk`, int16 x·2, z·2, Größe·100): bis 520 m unterhalb von Wänden >54°, bis 1 km neben der Runde, dichter nahe Wand und Straße, in Flecken, höchstens ca. 45 je Hektar.
- `dolo_detail.py`: `dolo/det10.jpg` (R/G = Geländenormale aus dem 10-m-Modell, B = Himmelssicht aus 16 Richtungen mal Hohlform). Kommt über `build_gpu.py` als `DLDETI` ins Spiel, Textur `window.DLDETT`. Im Dolomiten-Block von `gpuFx` wird daraus Licht/Schatten je Pixel gerechnet (Rinnen und Wandfüße dunkel, Sonnenseiten hell), unabhängig vom groben Netz. Aus: `NO_DLDET`.
- Fels-Shader: senkrechte Pfeiler und Risse entlang der Wand, hellerer Dolomit, schwächere waagerechte Bänder, heller Schutt am Wandfuß (alt `OLD_RIBS`); harte, leicht ausgefranste Kante Wiese/Fels (alt `OLD_ROCKEDGE`).
- `dlRockD`: stärkeres Relief und einzelne Türme im Steilen, Grate weniger zugespitzt (alt `OLD_ROCKAMP`).
- Felsbrocken: `buildDoloBlocks` (verformter Ikosaeder mit Dolomit-Textur, Größe 0,6–6 m, je 700-m-Zelle ein InstancedMesh mit Hüllkugel, Name `blockfeld`; Stufe Niedrig halbe Anzahl). Aus: `NO_DLBLK`. Lehre: zuerst waren sie „unsichtbar“, Ursache war keine Zeichenpanne, sondern zu geringe Dichte (2 je Hektar am Giau). Dichte vorab mit einem Histogramm aus `meta.json` prüfen.
- Randstreifen: Aufhellung nach Helligkeit gedeckelt, Parkplatz am Pass nicht mehr grellweiß.
- Test `tdolo.js`: `EVB` (JS vor jedem Bild).
- Offen: FPS auf „Mittel“ am iPad (Hicore testet abends), warmes Abendlicht, Grasbänder im Fels, Latschen zwischen den Brocken.

**0.25.7 Dolomiten: Himmel und Nahdetail** (Nachtarbeit 27.11., Hicores Auftrag „so nah wie möglich an Unreal“, Detail nach Entfernung)
- Himmel: `texjpg/dolosky.jpg` (Poly Haven HDRI `sunflowers_puresky`, CC0, obere Hälfte 4096×1024, aufgehellt) liegt als Foto auf der Himmelskuppel (`DLS2`, 48×24 Segmente, Horizont läuft in die Dunstfarbe). Gemalte Wolken-Sprites entfallen in den Dolomiten. Die helle Stelle dreht sich mit dem Sonnenazimut (`skyDome.userData.su`, in `ATMO.apply`), Tageszeit/Wetter tönen das Foto über die Eckfarben. `toneMapped:false`. Alt: `OLD_DLSKY2`. Bekannt: Sonne im Foto steht ca. 44° hoch, die Spielsonne nachmittags 20°; bei bedecktem Wetter bleibt es ein getönter Schönwetterhimmel.
- Halm-Nahdetail: `window.DLGRAS` (`texjpg/almgras.jpg` = die bisherige eigene Rasen-Textur) moduliert die Bodenfarbe bis ca. 100 m (zwei Lagen 1,8 m und 8 m, zweite gedreht gegen Wiederholung), nur auf grünen, flachen Flächen. Zwei Stellen: Geländekacheln (im Dolomiten-Block von `gpuFx`) und der Randstreifen neben der Straße (`buildCorridor`, Material mit `userData.alm`, Haken kurz vor `nm.colorNode=col`). Aus: `NO_DLGRAS`.
- Randstreifen: Eckfarben gehen nach außen in die Satellitenfarbe (`lcCol`) über, vorher hellgrüner Streifen mit harter Kante zur Wiese. Alt: `OLD_CORRSAT`.
- Almwiese: Grashalme um den Fahrer 10–25 cm statt 5–8 cm (`gfCell`, alt `OLD_ALMGRAS`).
- Test `tdolo.js`: `NEAR='[17000]'` (Kamera 1,3 m hoch am Straßenrand, Bilder `nah…`/`mittel…`), `EVN` (JS nach jedem Bild), Warten auf Wald nur in der eigenen Kachel. Achtung: nach einem Sprung zeigt der Cloud-Test nahe der Straße oft noch die Fernsicht-Kegel (`FV`), weil die Waldkachel im langsamen Software-Renderer nicht fertig wird; im Spiel laden die Kacheln voraus. Am iPad prüfen lassen.
- Nicht geschafft: Lärche/Zirbe, Blumen, Tiere, Yeti, Gipfelnamen, Kapellen; Nahdetail für Blätter/Rinde/Fassaden; Start in Cortina zeigt in den ersten Sekunden noch keine Häuser.

**0.25.6 Dolomiten realistischer** (Hicore 26.11. abends: „Berge zu gemalt, Wasser unecht“; Maßstab Stufe „Mittel“ auf dem iPad, nur frei und kommerziell nutzbare Quellen, siehe `docs/DATENQUELLEN.md`)
- Höhenmodell: TINITALY 1.1 (INGV, CC BY 4.0). Innen ±7,6 km mit 10 m als `dolo/dem10.png` (Rot/Grün = 16 Bit, (Höhe−900)·4, lädt `dataLoadDolo` nach `window.DEM2`), außen 25 m in `net.json`. `gdemH0` mischt mit 150 m Übergang (`NO_DEM10`). Beschaffung: `werkzeuge/tinitaly_crop.py` in der Sandbox (Kacheln w51570, w51575, w51070, w51075), PNG-Stücke, md5 geprüft, in der Cloud `/home/user/dolo/tin_inner.npy` und `tin_outer.npy` (nicht im Repo). Straßenhöhen neu gerechnet (62,72 km, 925 m).
- Grobgelände: „enge Hülle“ (`OLD_HULL`). Vorher Minimum der 8 Nachbarn, das trug Gipfel um 30–60 m ab (runde Berge, schwebende Gipfelhütten). Jetzt je Zelle 4×4 Proben des feinen Geländes, gesenkt wird nur bei Mulden und nur im Umkreis 2,6 km der Straßen.
- Fels: `dolowand` (Poly Haven cliff_side) seitlich, `dolofels` (rock_face_03) von oben, nah 9 m und fern 75 m, Stufe Mittel mit 5 statt 6 Abfragen (`gfxQ`, `OLD_ROCKTX`); Panorama als Node-Material mit Wandgliederung (`OLD_PANOTX`). Dunst 1,5–52 km bläulich, Wolken hoch und weit, kein Dunstring (`OLD_DLSKY`).
- Bäche: `dlBedIndex`/`dlBedQ`/`dlBedH` senken das Gelände in `gdemH` auf ein stetig fallendes Sohlenprofil (Sohle hw+6 m, Böschung 9 m, meist 1 m, höchstens ca. 2,7 m tief; `NO_DLBED`). Index erst nach `gnData()` bauen (sonst Sohle bei Höhe 0: war der Fehler mit den „Schluchten“). `buildDoloWater2`: Geröllband (`bachbett`, Poly Haven river_small_rocks) auf `gtMeshH` (Höhe der gezeichneten 10-m-Kachel), Ufersteine (ein InstancedMesh, nur bis 420 m um die Straßen), Wasser `dlWaterMat` (drei Fließlagen, wandernde Wirbel, Schaum an Rand und Gefälle, Himmelsspiegelung bei flachem Blick). Alt: `OLD_DLWATER`. Kein Felsrelief am Bach.
- Häuser: `CORTINA`, `CHALET`, `ALBERGO`, `CASA`, Geranienkästen, Pastell-Palette 7 (`OLD_ALPH2`). Balkone nur an annähernd rechteckigen Häusern und nicht über Straßen (`OLD_BALCHK`). Latschen (`NO_LATSCHE`).
- Startmenü, Reiter Welt: „Datenquellen und Lizenzen“.
- Tests: `tdolo.js` mit `WAT2=1` (Bachstellen an der Strecke, wartet auf Kacheln, gibt Höhenproben aus), `WJ=sek` (wartet auf Häuser), `EV='js'`. Nicht im Bild geprüft: Balkone aus der Nähe, Latschen, Ufersteine aus der Nähe, FPS auf dem iPad.


**0.25.2 Alpenhäuser, Wegkreuze, Fels** (Hicore 26.11. zu 0.25.0: „Berge verwaschen, nicht das typische Grau-Weiß, überall Umgebindehäuser“; FPS super)
- Häuser: Alpen-Atlas (`atlasFn` mit `alp`, Zellen 8–12 und 31, Giebel 1–4 ersetzt, eigener Cache `atlasA`, `GT.hm` wird in `dataReset` geleert). Typen `LAD`, `STADEL`, `TABIA`, `RIFUGIO`, `HOTELA` (`HT`, `alp`: Traufe 0,95 m, Giebel 0,7 m; `bal`: Holzbalkone an den Traufseiten, Hotel je Geschoss; Dach `rf` m = Blech grau/rot/grün, w = Lärchenschindeln). `htPick` Dolomiten neu, `dolo_bau.py` trennt Stadel/Ställe (k 3) von Hütten (k 7). Alt: `window.OLD_ALPH`.
- Wegkreuze: `buildDoloShrines` (Holzkreuz mit Dächlein, Bildstock, Marterl; OSM-Knoten `ZGNET.crosses` ohne Gipfelkreuze + an der Runde alle 1,5–2,6 km, nicht an Häusern/steilen Stellen). Aus: `window.NO_SHRINES`. Test: `SHR=3 node tdolo.js` fotografiert die ersten Kreuze.
- Fels: `dlRockD` verschiebt Kachel- und Grobgelände auf Fels/Geröll (gratige Rauschsumme, Bänder, Kanten geschärft gegen 55-m-Mittel, nie näher als 10–35 m an Straßen; nur Optik). Grobgelände Dolomiten 480 statt 320 Zellen. Fels-Erkennung zusätzlich über Helligkeit (Dolomit ist im Satellitenbild beige), Faktor 0,74 (`DLROCKF`), Shader mit Schichtbändern, Regenstreifen, Ockerflecken (`OLD_ROCKSH`). Schalter: `NO_ROCKD`, `OLD_DLROCKL`.
- Satellitenbild: Schattenseiten entsättigt (vorher cyan/neongrün), Unscharf-Maskieren.

**0.25.0 Dolomiten** (Hicore 26.11.: „wie Zittauer Gebirge, mit allen Daten“, nur Hauptstraßen befahrbar, Nebenstraßen sichtbar, Panorama „atemberaubend“; Wunschliste in Projekt-Memory `dolomiten-welt`)
- Daten: `werkzeuge/dolo_bau.py` baut `quelle/dolo/` (ca. 9 s) aus Rohdaten unter `/home/user/dolo` (nicht im Repo): Copernicus GLO-30 (S3, Kacheln N46 E011/E012), ESA WorldCover 2021 (S3, Dateiname mit kleinem „v200“), Sentinel-2 L2A Kachel **32TQS** Szene S2C_32TQS_20250919_0 (33TUM deckt das Gebiet nicht), OSM über Sandbox/Overpass (`osmc.json`, als PNG-Chunks geholt). Projektion LAT0 46.49, LON0 12.06, Welt-y = Höhe − 1200 m.
- Inhalt: DEM 25 m (x −21000…21000, z −16000…14000, Waldkorrektur −11 m), 4 Kanten per Dijkstra auf primary/secondary/tertiary (SR48 Cortina–Pocol, SP638 Giau, SP638 Giau–Selva–Caprile, SR48 Falzarego), Steigung geglättet max. 15,5 %; Runde = Pocol-Schleife, Start Cortina über `zgApplyStart`. Nebenstraßen/Wege im ZGSIDE-Format (nur sichtbar, `NO_WAYNET`). Gebäude, Ortsschilder, Bergwertungen (Giau von Pocol/Selva, Falzarego von Andraz/Pocol, Pocol), 233 Gipfel in `pois`. Landbedeckung 10 m (`lc.png`, Klassen 6 Fels, 8 Schnee, 9 Geröll, 10 Alpweide), Satellitenbild nah 10 m / fern 25 m mit Schatten-/Blaustich-Korrektur.
- Spiel: `build_gpu.py` schreibt `gpu/data/dolomiten.js` (`window.DLDATA`, ca. 7 MB, wird erst bei Weltwahl geladen). `dataSwitch(def)` tauscht die `window.ZG*`-Bündel ohne Neuladen (Bluetooth bleibt), `dataReset` leert alle Weltzwischenspeicher. `lcCol` nimmt die Satellitenfarbe (Fels grau = Kennung für den Shader), Gelände-Shader mischt Dolomit-Textur (`texjpg/dolomit.jpg`, Poly Haven marble_cliff_05) nach Farbe und Hangneigung. `buildDoloPano`: Ring aus dem ganzen DEM mit `sat_far` bis ca. 20 km, Nebel 4–62 km. Wald Fichte/Kiefer, Baumgrenze ab ca. 1.960 m. Italienische blaue Wegweiser.
- Test `tests/tdolo.js` (`W=dolo|zittau`, `OUT`, `D` Fahrerbilder in m, `V` freie Kamera `[x,z,h,lx,lz,name]`, `NF`); ein Bild mit Panorama dauert in der Cloud ca. 5–7 min.
- Farben: Satellitenwerte sind sRGB, `lcCol` setzt sie mit `THREE.SRGBColorSpace` (vorher linear gelesen = viel zu hell, alt `window.OLD_DLLIN`), Fels zusätzlich ×0,6 (`window.DLROCKF`), weil das Bild schon Sonnenlicht enthält.
- Grenzen: Gelände-Farbe = Eckpunktfarbe, fern also unscharf; Häuser vorerst Zittauer Typen; Gipfel noch ohne Beschriftung.


## Aus UEBERGABE.md verschoben (Stand 0.26.0): Treppen 0.18.0, Bäume 0.19.0

**Treppen (0.18.0)**
- Daten: `quelle/zg2/steps.bin` (11 KB, 483 Treppen, 7 km, 193 mit `step_count`), gebaut in der Higgsfield-Sandbox mit `zg2/steps.py` aus Overpass `way["highway"="steps"]` (bbox wie Straßen; overpass-api.de braucht einen User-Agent, sonst 406). Format wie ways.bin, Klasse 15, Byte 6 = Stufenzahl, Flags 1/2 incline bekannt/hoch, 4 Handlauf, 128 Schieberampe. `build_gpu.py` → `window.ZGSTEPS`, im Spiel `stairsData()`.
- Höhe (`stairInit`, seit 0.19.1): Stücke auf der Fahrbahn abgeschnitten (`T.s0/s1`), Richtung aus `incline`, sonst Gelände. Stufen folgen dem Geländeprofil `T.TS` (25 Proben), Trittflächen `T.YT[k]` einzeln (mind. `hmin` ≤ 10 cm, max. 24 cm, Tritt 4 cm über Gelände). Endet die Treppe oben an einer Straße, wird auf Fahrbahnhöhe skaliert. Was übers Gelände ragt, bekommt Seitenwände bis ins Gelände und eine grüne Böschung; oben ohne Straße läuft eine Erdrampe aus (`stairRamp`, Länge `stairRad` 2,5–7 m nach Überstand, gleiches Profil wie `stairBlend` für den Weg). Fahrlinie `stairY` stückweise linear durch die Stufen, `stairTop`/`stairStepY`. Alt: `window.OLD_STAIRFIT`.
- Netz: in `rgBuildWays` als Weg Klasse 15 (`E.st`, `E.stS0/S1`, `E.nv`), Knotenhöhen aus der Treppe, `rgPts` linear, `gRoute` rundet Treppen nicht ab. Rennrad nie (`adjS`), Routing ×6 teurer, `gRank` 9, Name „Treppe · N Stufen“. 3D-Stufen je 500-m-Kachel am Pfad-Netz (`stairsMesh`, Blöcke, Erdstufen mit Holzkante, Handlauf), Bäume halten Abstand (`stairsIdx` → `WAYS_H`).
- Ablauf (`STAIR`, `stairSpans`, `stairStep` in der Hauptschleife nach `curveVmax`): Modus `stairMode`: MTB bergab `ride` (stehend, Kurbel waagrecht, Stöße), bis 3 Stufen `lift` (links neben dem Rad, linke Hand Lenker, rechte Oberrohr, Rad über die Stufen gehoben), sonst `shoulder` (Oberrohr auf der rechten Schulter, rechter Arm um das Steuerrohr an den Lenker, linker Arm schwingt). Zonen 2,2–3,2 m vor/nach den Stufen (Ab-/Aufsteigen, rechtes Bein hinten über den Sattel), davor Bremsen auf 1,7–2,8 m/s, zur Treppe hin in die Wegmitte (`STAIR.lc`). Tempo nach Leistung (bergauf 0,5–1,25 m/s, bergab 0,7–1,3, kurz 1,0–1,4), ohne Treten bleibt man stehen. Trainer bekommt 0 %. Füße treffen die Stufenmitten (`stairCarry`), Figur waagrecht. Pose: `carryBody`, `carryRig` in `poseGLB` (opt.carry), Greifhände über `R._ghF`. Aus: `window.NO_STAIRS`.
- Test `tests/tstair.js` (`BIKE`, `PL`, `NV=min,max`, `UP=1|-1`; ohne `OUT` Logik: Tempo, Zeit, Fußfehler; mit `OUT`, `PTS=-1.6,mid,end`, `SIDE=1|-1|0` Bilder). Ergebnis: 500 Treppenstücke im Netz, keine für das Rennrad; 9 Stufen hoch in 11 s, Füße im Schnitt 5 cm über der Stufe, nie darunter.

**Rennrad nur auf Straßen (0.18.1):** Details (`okS` in `gnRG`, `OLD_ROADADJ`, Test `tadj`) jetzt in `docs/ARCHIV.md`. Gut erreichbare Treppen: Jonsdorf Auf der Heide 9 Stufen (Weg-ID 41396618), Oybin Kammstraße (Weg-ID 1209305178, ohne step_count, im Spiel „10 Stufen“, bei x 98…109, z 1072), Friedrich-Engels-Str. (S 133) 6 Felsstufen, Waltersdorf Hauptstraße 25, Kammstraße bei Hölle 3.

**Echte Bäume, Wald, Äcker überall (0.19.0)**
- Hicore (24.11.): „Jonsdorf überall, jeder Baum, Strauch, Acker an seinem Platz“, Häuser bleiben. Wald tief drin darf ausgedünnt sein, an befahrbaren Wegen nicht.
- Kette neu: `werkzeuge/dop_gebiet.py` (Sandbox, kein Credit-Verbrauch): `chm` (beide CHM-Kacheln 120212122 + 120212123 von S3, Region x −10000…6000, z −14000…8000 als chm.npy), `alle` (88 Kacheln à 2 km mit 100 m Rand, DOP20 RGB+CIR direkt mit 1 m vom WMS, je Kachel ca. 6–15 s, Zeitbudget je Lauf), `packen` → `dop_gebiet.bin` (zlib, 'DOPC') + `dop_maske.png`. Zurück per Graustufen-PNG-Chunks (470 000 Bytes) über `image_paths`, md5 geprüft. Dann `python3 werkzeuge/dop_einfuegen.py zg2/dop_gebiet.bin` (liest DOPB und DOPC, entfernt alte DOP-Bäume Typ ≥16 und 8 im Gebiet, `dopwald.json` entfällt).
- Ergebnis: 270.422 Bäume + 49.215 Sträucher (neuer Kacheltyp **8** = Strauch aus Luftbild, im Spiel bushA/bushB, auf LITE/MINI ausgedünnt), 1.056 wegen OSM-Baum weggelassen. Kacheln 2,3 → 3,7 MB. Tschechien/Polen: WMS liefert nichts → Maske 0, dort bleibt ESA/OSM wie bisher.
- Maske `zg2/dop_maske.png` (1600×2200, 10 m, R: 0 kein Luftbild/127 offen/254 Wald, G: Acker 85 grün/170 gelb (Raps/Stoppel)/255 kahl) → `window.ZGDOPM` in zittau.js, im Spiel `DOPM_READY`, `gnDopM`, `gnDopW` (Maske vor alter Liste), `gnAcker` (ersetzt den Schlag-Zufallshash in `lcCol` und `gfCell`). Acker-Zustand stammt vom Luftbild-Flugdatum (Frühjahr, deshalb Raps gelb).
- Wald: Inneres weiter prozedural mit Ausdünnung (`KEEP`), neu aber volle Dichte bis 16 m an befahrbaren Wegen (`waysNear` in `gtForestGen`, alt: `window.NO_WAYWALD`). Einzelkronen im geschlossenen Wald liefert das CHM nicht zuverlässig, deshalb dort keine echten Einzelbäume.
- Treppen: dunkle Vorderkante je Stufe (alt: `window.OLD_STAIRVIS`). Zäune: jedes Zaunfeld an 5 Punkten gegen Straßen/Wege/Treppen geprüft (vorher nur Mitte, Zaun stand quer über Treppe Oybin Kammstraße). Schultern: linker Arm hängt locker, Ellbogen nach hinten-unten (alt: `window.OLD_CARRYARM`).
- Aus: `window.NO_DOPT` (alles Luftbild-Zeug inkl. Sträucher und Acker-Zustand).

## Aus UEBERGABE.md verschoben (Stand 0.26.1)

**0.25.9 Dolomiten: Hicores iPad-Test** (27.11. 17:10, Bluefy, Stufe „Mittel“: stabil 29–30 FPS bei Grenze 30, CPU ca. 8 ms; 8 Screenshots Anstieg Pocol km 1,1–1,8)
- Kurven eckig, Fahrer ruckt: Ursache waren die Kantenpunkte (`net.json`, 5 m Abstand, 0,25 m gerastert) mit Knicken bis über 20°; das Rauschen fraß außerdem das Budget der 3000 Routenpunkte (`gRoute` verteilt nach Krümmung). Jetzt in `gnData`: zwei Glättungsgänge (höchstens 1 m Versatz, Enden fest) und Catmull-Rom-Verdichtung, bis kein Knick über ca. 2,5° bleibt (11.395 → 19.673 Punkte). Nur Dolomiten (`D.lat0<48`) oder mit `window.CURVE_ALL`; alt `OLD_CURVES`. Messung über die ganze Runde (alle 2 m `gnNear(posAt(d)).d`): Stellen über 1,2 m neben der Kantenmitte 282 → 1.
- „Sandhaufen“ auf der Straße: `baseH` blendete in 30 m von Fahrbahn −0,5 m zum Höhenmodell; im 10-m-Kachelraster stieg der Hang bergseits schon innerhalb einer Masche über die Fahrbahn. Dolomiten: bis 14 m neben dem Rand höchstens 14 % Anstieg bzw. 30 % Gefälle (Bank/Damm), danach steil. Alt `OLD_ROADBENCH`.
- Einfahrten/Nebenwege (`gtSideMesh`): Ecken, die in die Fahrbahn ragten, werden auf den Fahrbahnrand geschoben (alt `OLD_SIDECLIP`); keine Böschung mehr über dem Pflaster-/Grasstreifen (alt `OLD_SKIRTRD`). Dass Wegstücke beim Näherkommen teils verschwinden, ist nicht untersucht.
- Rütteln: `wayFeelStep` prüft alle 0,12 s, ob der Fahrer auf dem Pflaster-/Splittstreifen ist (`gnPave`), dann `WF.rough` 0,85 bzw. 0,5. Aus `NO_PAVEFEEL`. Fahrer fährt in den Dolomiten 1 m statt 0,5 m vom Rand (`TRAFFIC.rLane`, alt `OLD_RLANE`).
- Verwaschene Hänge: NICHT gelöst. Ursache sind die Eckfarben des groben Netzes (29 m), die nur weiche Flecken ergeben. Versuch im Fels-Shader (ab 350 m ein Muster von 50–160 m, das die Fels/Grün-Grenze in klare Flecken zerlegt) ist eingebaut, aber abgeschaltet, weil das Prüfbild nicht zustande kam: einschalten mit `window.DLWASH=1`, dann aus Hicores Blickrichtung (km 1,5–1,8, Blick nach Norden/Osten auf den nahen Rücken) vorher/nachher prüfen.
- Offen: Einfahrten haben am Randstreifen noch kleine Pfeilspitzen; Lehre: nach jedem Suchen-und-Ersetzen im Spielcode `node --check` auf das Skript, ein Tippfehler hat 40 min Prüflauf gekostet. Nahgras steht als dunkle Büschel auf heller Fläche (Beobachtung des Koordinators, Hicore hat es nicht bemängelt); Kurvenglättung für Zittau (`CURVE_ALL`) ungetestet.

**0.25.10 Dolomiten: Startpunkt, Fernpanorama** (Hicore 27.11. abends)
- Startpunkt: Knopf „Auf Karte wählen“ erscheint jetzt auch bei den Dolomiten (`spRender`). Im Menü sind die Dolomiten-Daten nicht die aktive Welt, daher holt die Karte ihre Kanten, Orte und das Satellitenbild direkt aus `window.DLDATA` (`bmSrc`, `bmDolo`; `dataLoadDolo()` wird beim ersten Öffnen geladen). Auswahl in `DL_PICK` (Speicher `dlStart`), beim Start `zgApplyStart(DL_PICK||Cortina)`. Wählbar ist nur die Runde selbst (4 Kanten). Liegt der Punkt auf der Hauptrunde, ist die Runde 50,3 km (ohne den Abstecher Cortina–Pocol, mit ihm 62,7 km). Test: `MENU`-Option in `tests/tdolo.js` (JS im Menü vor dem Start), Start am Passo Giau geprüft.
- Verwaschene Bergrücken: per Strahlprobe (`EVN` mit Raycaster) gefunden, dass der Rücken östlich von Cortina gar nicht zum Kachelgelände gehört, sondern zum Fernpanorama (`buildDoloPano`, eigenes Knotenmaterial, nur unscharfes Satellitenbild). Cortina liegt am Ostrand des Innengebiets. Jetzt im Panorama-Material: Waldmaske aus der 10-m-Landbedeckung (`dlWaldTex()`, `window.DLWALDT`, R8-Textur 2200×2000) zeichnet Waldränder und ein gekörntes Kronendach, Wiesen/Schutt leicht gekörnt. Alt `OLD_PANOWALD`, ganz aus `NO_DLWALD`. Dieselbe Maske wirkt im Kachel-Shader ab 1,5 km. Der Versuch aus 0.25.9 (`DLWASH`) bleibt abgeschaltet, er hatte auf diesen Rücken keine Wirkung.
- Pflasterstreifen „zu weit innen“ aus 0.25.9 war ein Irrtum: gemessen liegt die Innenkante 3,15 m neben der Mitte (halbe Fahrbahn 3,3 m), der Fahrer bei 2,3 m.
