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
