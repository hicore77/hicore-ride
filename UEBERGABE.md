# Hicore Ride: Übergabe (aktueller Stand)

Stand: 28.11.2026 (Nacht). Letzte veröffentlichte Version: **0.26.1 Beta** (Dolomiten: kein Gelände mehr auf der Straße, runde Kehren, Bach in 3D mit Durchlass, Buckel, Pedal in Kurven; Zittau: Seen flach). Davor 0.26.0 (Dolomiten-Tiere), 0.25.10 (Startpunkt per Karte, Fernpanorama).
Diese Datei ist bewusst kurz und enthält nur, was ein neuer Thread zum Weiterarbeiten braucht.
Alles Ältere (Entscheidungsgeschichte, frühere Versionen, Hardware-Details, Asset-Herkunft) steht in **`docs/ARCHIV.md`**. Nur bei Bedarf gezielt darin suchen (`grep`), nicht ganz lesen.

**Arbeitsweise seit 24.11.:** Ein Thread pro Schritt bzw. Version. Am Ende jeder Version diese Datei aktualisieren: Stand, Versionsnotizen (nur die letzten 3, ältere nach `docs/ARCHIV.md` verschieben), nächster Schritt. Ziel: höchstens ca. 200 Zeilen.

---

## 1. Worum es geht

- Zwift-ähnliches Indoor-Radspiel im Browser. Three.js r187 mit WebGPU (Rückfall WebGL 2), eine große HTML-Datei plus Datenpakete, Bluetooth über Web Bluetooth.
- Hauptwelt **Zittauer Gebirge**: echtes OSM-Straßennetz (ca. 180 km), echte Höhen, Kreuzungen, Kreisel, Verkehr, Bahn, Wahrzeichen, Wetter. Weitere Welten: Sonneninsel, Elbsandstein. Hügelland und Alpenpass sind seit 0.24.5 ausgeblendet (Hicore 26.11.), Code bleibt.
- Zielgruppe: Hicore selbst und Freunde (Multiplayer über Supabase Realtime). Später eventuell öffentlich, Abo-Idee nicht entschieden.
- Bleibt im Browser (Entscheidung 19.11.). Keine Markenlogos, keine Google-/Esri-Bilder, kein Nachbau fremder Spiele.
- Hauptgerät: **iPad Air M1**, Bluetooth nur in der App **Bluefy**. Watt/Kadenz über Stages-Powermeter, Puls über Wahoo TICKR X. Elite Drivo (Name „DR“, Firmware 026) hat kein FTMS, liefert echte Watt/Kadenz über Cycling Power (seit 0.25.1 in Bluefy verbindbar); Steigung steuert seit 0.25.3 den Widerstand über Elites Kanal (kein ERG).

## 2. Links

- Spiel: https://hicore77.github.io/hicore-ride/webgpu-spiel/
- Vorschau-Bilder: https://hicore77.github.io/hicore-ride/vorschau/
- Repo: https://github.com/hicore77/hicore-ride (öffentlich, Branch `main`)
- Supabase (Multiplayer): `https://snpmmskruuzqrvvsdztz.supabase.co`, nur der publishable Key steht im Code.
- Notion: „Hicore – KI-Wissensbackup & Kontextarchiv“, Seite 04 = Hicore Ride. Ergebnisse dort nachtragen.

## 3. Hicores Regeln (immer gültig)

**Kommunikation**
- Anrede „Hicore“, Deutsch, du, kurz, direkt, Ergebnisse zuerst. Schwächen offen ansprechen.
- Bilder nicht in den Thread, sondern auf die **Vorschau-Seite** (`vorschau/`, nummeriert, neuester Abschnitt oben).
- Links immer komplett klein (`hicore-ride`).
- Er testet abends am iPad, schreibt oft per Sprache (Tippfehler wie „Polyheaven“, „Fixfield“ = Higgsfield).

**Geld und Freigaben**
- Nie automatisch nachkaufen. Higgsfield (seit 27.11. Ultra, 3.000 Credits/Monat): bis 100 Credits je Aufgabe ohne Rückfrage, danach immer Verbrauch und Restguthaben nennen; darüber erst Kosten nennen und fragen. Stand 27.11. abends: 2.931 Credits.
- Senden, Buchen, Kaufen, Löschen nur mit Zustimmung. Keine Secrets ins Repo (Gemini-Schlüssel bleibt im Browser, Mapillary-Token in der Higgsfield-Sandbox).

**Arbeitsweise**
- Selbstständig abarbeiten, nach jeder Änderung testen, dann veröffentlichen.
- Neue Version = Versionsnummer im Menü, Commit, Vorschaubilder. Schema 0.x.y (kleine Schritte 0.12.1, größere 0.13.0).
- Riskante Grafikumstellungen **umschaltbar** bauen, alt bleibt erhalten.
- Modell: Hicore bleibt bei Opus.

**Straßennetz** (für jede neue Straße, Kreuzung, jeden Kreisel)
- Straßen enden genau im Kreuzungspunkt, Entscheidung erst dort, kein Sprung beim Umschalten.
- Kreisel = eigene Ringstraße, gegen den Uhrzeigersinn, nie abkürzen.
- Fahrlinie immer rechts auf der Fahrbahn. Kreuzungen genau eine Höhe, keine Höhensprünge.
- Danach `tturn`, `tjump` (`RBP=32`), `tjun` und eine Draufsicht.
- Sackgassen sichtbar, aber ohne Abbiegehinweis (außer Lausche, Hochwald). Seit 0.15.0 sind Wege befahrbar (je nach Rad).
- Pflicht-Straßentests laufen mit `window.GADJ='R'` auf dem reinen Straßennetz (in den Tests gesetzt). Für Wege: `twjun.js`.

**Optik, Ton, Verkehr**
- Straßenrand feines Gras, innerorts Pflaster/Splitt. Dachüberstände ca. 25 cm. Bäume nur, wo sie real stehen.
- Jedes reale Haus nur einmal. Higgsfield-3D nur für markante Bauten, sonst Hausbaukasten. Kein Türkis bei Umgebindehäusern.
- Kein Ketten-/Freilaufgeräusch. Geräusche nur mit sichtbarem Anlass.
- Verkehr außerorts 80–100, innerorts 40–50 km/h, keine Unfälle, Überholer warten oder brechen ab.
- Segment-Bestzeiten nur mit echtem Trainer, nie im Demo-Modus.

## 4. Architektur, Build, Tests, Veröffentlichen

**Code** (alles im Repo):
- `quelle/gpu/src.html`: der gesamte Spielcode (ca. 6.900 sehr lange Zeilen). Nur gezielt mit `grep -n` suchen, nie ganz lesen.
- `quelle/build_gpu.py` baut `quelle/gpu/index.html`, `gpu/data/`, `gpu/props/`.
- `quelle/gpu/three187gpu.js`: three-Bundle (aus `entry_gpu.js`, esbuild).
- Weltdaten Zittau unter `quelle/zg2/` (y in der Welt = Höhe über NN minus 300 m), Texturen `texjpg/` und `texjpg_ph/`, Modelle `props/`, Geräusche `sfx/`.
- Veröffentlichtes Spiel: `webgpu-spiel/`. Vorschau: `vorschau/`. Root-`index.html` ist das alte r128-Spiel (eingefroren).

**Wichtige Stellen in `src.html`**
- `gpuFx()`: baut aus Material-Markierungen TSL-Knoten (Gelände, Straße nass, Wind, Überblendung, Schnee).
- `snowKind()` / `SNOW`-Uniforms: Schnee je Materialart (siehe Abschnitt 5).
- **Wichtig (gelernt in 0.12.0):** Normale TSL-Uniforms (`GU`) werden auf unbewegten Meshes (Gelände, Häuser, Straßen) nach dem ersten Kompilieren nicht mehr aktualisiert. Werte, die sich zur Laufzeit ändern, mit `GUR()` anlegen (renderGroup) und nach Änderung `GURtouch()` aufrufen. `WET` und `SNOW` laufen schon so. `WIND.t` auf dem Gelände vermutlich noch betroffen.
- In `gpuFx` liefert `normalWorld` im colorNode keine brauchbaren Werte, dort `normalWorldGeometry` nehmen.
- `ATMO` (Tageszeit, Wetter, Regen, Flocken, Blitze), `RWX` (echtes Wetter über Open-Meteo), Menüs `#tod`, `#wx`, `#snow`, `#snowRd`.

**Bauen und testen**
```bash
cd quelle && python3 build_gpu.py
cd tests
node terr2.js        # Seitenfehler, muss "none" ausgeben (liefert quelle/gpu über serve.js aus, kein eigener Server nötig)
node tturn.js; RBP=32 node tjump.js; node tjun.js   # nach Straßenänderungen (brauchen Server auf 127.0.0.1:8765)
CFG='[["name","wx","snow","snowRd","tod"]]' PL='["Jonsdorf"]' OUT=… node tsnow.js   # Schnee-Renderbilder
OUT=… MODES=rut,forest,gravel,path,top PL=Jonsdorf SN=keine node tways.js   # Wege-Kontrollbilder (0.14.0)
```
- Alle Cloud-Tests laufen mit `?gl=1` (WebGL 2, Software-Rendering, 10–25 min je Lauf, im Hintergrund starten). Echtes WebGPU nur auf Hicores iPad.
- Im Cloud-Container ließ sich am 24.11. kein eigener `python3 -m http.server` starten (vom Auto-Modus abgelehnt). Deshalb `tests/serve.js`: Playwright liefert die Dateien über `page.route` direkt aus. Umgestellt sind terr2, tturn, tjump, tjun sowie die neuen tperf, tcar, ttree, tkreuz; ältere Tests lassen sich genauso umstellen.
- Blockiert aus der Cloud: github.io, Open-Meteo, Poly Haven, Overpass. Weg dorthin: Higgsfield-Sandbox (`sandbox_exec`).

**Veröffentlichen**
```bash
cp quelle/gpu/index.html webgpu-spiel/
rm -rf webgpu-spiel/data webgpu-spiel/props && cp -r quelle/gpu/data quelle/gpu/props webgpu-spiel/
# Version in src.html ("Version 0.x.y Beta"), Bilder nach vorschau/ + Eintrag oben in vorschau/index.html
# commit + push auf main; Pages aktualisiert sich nach 1–2 Minuten
```

## 5. Aktueller Stand

**Letzte Versionen**

| Version | Inhalt |
|---|---|
| **0.26.1** | **Dolomiten: Gelände nie mehr auf der Fahrbahn, Kehren rund, Bach in 3D mit Mäander und Durchlass, Einfahrten sauber, Buckel, Pedal innen oben; Zittau: alle Seen flach (Olbersdorfer See)** |
| 0.26.0 | Dolomiten: Tiere (Alpenkuh-Herden mit Glocken, Gämsen pfeifen und flüchten, Steinböcke, Murmeltiere, Yeti hinter einem Felsbrocken am Giau), Töne von Higgsfield |
| 0.25.10 | Dolomiten: Startpunkt per Karte wählbar (wie Zittau), Fernpanorama mit Waldrändern und Kronendach aus der 10-m-Waldmaske |

**Kacheln/Rand (0.17.0):** Details (Datenquellen, `rand_auffuellen.py`, `kacheln.py`, `KC`/`kcTick`/`kcReady`, Felsen, Zäune, Wanderer `HIKE`, Tests `tkc`/`thike`) jetzt in `docs/ARCHIV.md`.

**Fahrgefühl auf Wegen (0.17.1):** Details (`WF`, `wayFeelStep`, Pfützen `WET.p`, Matsch, Test `twet`) jetzt in `docs/ARCHIV.md`.

**Echte Bäume aus Luftbild (0.17.2):** Details (Quellen, Kette `werkzeuge/chm_ausschnitt|dop_holen|dop_baeume|dop_einfuegen`, `gnDopW`, `NO_DOPT`, Test `tdop`) jetzt in `docs/ARCHIV.md`. Nächste Ausschnitte: gleiche Kette mit anderer bbox.

**Hotfix 0.17.3:** Details (Nahgras/Acker auf Wegen, `gfCell`, `NO_GFWAY`, Test `tgf`) jetzt in `docs/ARCHIV.md`.

**Treppen 0.18.0, Rennrad nur auf Straßen 0.18.1, echte Bäume/Wald/Äcker 0.19.0:** Details (`stairInit`, `STAIR`, `tstair`, `okS`, `dop_gebiet.py`, `dop_maske.png`, `NO_DOPT`) jetzt in `docs/ARCHIV.md`. Gut erreichbare Treppen: Jonsdorf Auf der Heide 9 Stufen (Weg-ID 41396618), Oybin Kammstraße (1209305178).

**Tschechien (0.19.1), Hotfix Zaun/Arm (0.19.2):** Details (ČÚZK-Orthofoto, `dop_gebiet.py ergaenzen cz`, `tstairfit`, `propOnWay`, `tprobe`, `tcarry`) jetzt in `docs/ARCHIV.md`. Achtung: Weg-ID 41396618 liegt in Jonsdorf, die Oybiner Treppe ist 1209305178.

**Schultern 0.19.3–0.19.8, Gabeln 0.19.5:** Details (`carryGripPar`, `carryBody`, `carryRig`, `taperLeg`, `forkStep`, Tests `tcarry`/`tdismount`/`tbike`, Schalter `OLD_CARRY*`, `OLD_DISMOUNT`, `OLD_GRAVELFORK`, `NO_FORKMOVE`) jetzt in `docs/ARCHIV.md`.

**Leistung 0.20.0–0.21.0** (Details 0.20.0–0.20.2 in `docs/ARCHIV.md`): Kachelwald gebündelt (`GT.w`, `OLD_GTW`), Baumschatten nur nah (`OLD_TREESH`), HUD sparsam (`OLD_HUD`), Leistungstest per Tipp auf FPS-Anzeige (`LTEST`), Messung `tests/tgpuperf.js`. iPad-Lesart: Chrome hängt an Pixeln, Bluefy an den Bäumen.
**0.25.1 Drivo in Bluefy** (Hicore 26.11.: Drivo erscheint in der Trainersuche nie, Zwift am Apple TV kann ihn)
- Ursache: Bluefy 3.9.3 lehnt `requestDevice` mit **optionalServices als Zahlen** sofort ab (Fehler ohne Text, nur `2`, Liste öffnet sich nicht). Ohne optionalServices oder mit Text-Namen (`'cycling_power'` usw.) geht es; Bluefy gibt nach dem Verbinden ohnehin alle Dienste frei (auch den Elite-Dienst). In `connectTrainer` jetzt Text-Namen (`OPT`), alt: `window.OLD_BTOPT`. Gilt für jedes Gerät, nicht nur den Drivo.
- Drivo 1 (nRF Connect + `bt-test.html`): wirbt nur CSC 0x1816 + Elite `347b0001-…`, hat verbunden aber auch **Cycling Power 0x1818** (Feature `0d 02 01 00`, Control Point 2A66), Device Info (Elite, HW 001, FW 026), Legacy DFU. Spiel nimmt den CPS-Zweig → echte Watt/Kadenz. Elite-Merkmale: 0010 w, 0011 n (sendet `00` je Sekunde), 0012 w, 0013 r (Nullen), 0014 n, 0015 n (3 Pakete/s: `01|02|03`, u16 Zähler, dann 8×u16, vermutlich Kraftverlauf je Kurbelumdrehung), 0016 w, 0017 n. **Widerstand (0.25.3):** Zwift-Mitschnitt (Android-HCI-Snoop am Redmi, Fehlerbericht per `*#*#284#*#*`, Auswertung `btsnoop_hci.log` mit eigenem Parser) zeigt nur einen Befehl: Write-Request `[0x01, X]` auf `347b0010`, alle ~2 s, keine Elite-Notifications nötig. X = Steigung in 0,1 % + 10 (10 = flach, 0 = −1 %, 120 ≈ 11 % „fast nicht tretbar“, per W-Knöpfen in bt-test.html bestätigt). Im Spiel `eliteSlope()` aus `sendGrade` (CPS-Zweig mit `trainer.eli`), Steigung × `S.diff`, begrenzt −1 … +15 %, sofort bei ≥0,3 % Änderung, sonst alle 2 s. Aus: `window.NO_ELITESLOPE`. **Kadenz (0.25.5):** Sobald Steigungsbefehle laufen, sendet der Drivo im CPS keine Kurbeldaten mehr (auch bei Zwift: Balance-Byte `c8`, Kurbel `00 00 00 00`). Kadenz steht in Elite 0015, Byte 3 = U/min (mit Screenshots verglichen: 0x35 = 53). Spiel abonniert 0015 und nimmt dann nur noch diese Kadenz (nach 2,5 s ohne Paket 0), alt: `window.OLD_ELICAD`. Chrome braucht ELITE in optionalServices (wird außer in Bluefy mitgegeben).
- Testseite `webgpu-spiel/bt-test.html`: 10 Suchvarianten, Dienste, Geräteinfo, Watt/Kadenz live, Elite-Rohdaten, „Log kopieren“. Nützlich für jedes neue Gerät.

**0.26.1 Dolomiten-Fahrfehler, Zittauer Seen, Bach** (Heiko 27.11. abends mit Screenshots; Nachtarbeit)
- Gelände auf der Straße (große hellgrüne, kantige Flächen, Kehren): Ursache war das 10-m-Kachelnetz. Zwischen zwei Eckpunkten wird linear gemittelt; ein Eckpunkt am Hang oder an der anderen Seite einer Kehre hob das Dreieck bis 9,6 m über die Fahrbahn, obwohl `terrainH` auf der Straße stimmte. Jetzt `gnCap`: jeder Eckpunkt (Kachelbau und `gtMeshH`) wird gegen alle Straßenstücke im Umkreis von 16 m gedeckelt (0,35 m unter der Fahrbahn, 5 % bis 6 m, dann 16 %). Automatische Prüfung (`EV` mit `gtMeshH` alle 4 m an 6 Querpunkten der Runde, 94.200 Punkte): vorher 251 Treffer, jetzt 0 (schlechtester Wert 0,18 m unter der Fahrbahn). Panorama und Grobnetz waren es nicht (ebenfalls geprüft, 0 Treffer). Alt `OLD_GTCAP`.
- Kehren rund: Dolomiten haben jetzt 9000 statt 3000 Fahrlinienpunkte (`N` ist `let`, in `buildWorld` gesetzt; `gRoute` mit 13 statt 7,5 Punkten je Radiant). Alt `OLD_RTN`.
- Pedal: beim Rollen (Kadenz < 3, > 4 m/s) vor und in Kurven geht das kurveninnere Pedal nach oben (`me.turnAhead`, Kurswinkel über max(14 m, 1,8 s)). Aus `NO_COASTPEDAL`.
- Zittau, Olbersdorfer See „blauer Hügel“: Seen waren dort nur blau gefärbtes Gelände (Landbedeckung Klasse 5), das dem Höhenmodell folgte (im See bis 68 m Höhenunterschied). Jetzt `zwInit`/`zwH`/`buildZgLakes`: jede Wasserfläche ab 6 Zellen bekommt einen Spiegel (15-%-Wert der Uferhöhen minus 0,25 m; lange Flüsse örtlich, bisher keiner erkannt), Gelände darunter als Mulde, flache Ufer leicht angehoben, eigenes Wasser-Netz (`waterMaterial`), nie über Land oder Straße. 81 Seen, Prüfung `EV`: Straßen der Runde und aller Kanten nie unter dem Spiegel. Andere Welten: Teiche (`ponds`) sind schon flach und liegen unter dem Ufer, Dolomiten-Seen flach auf tiefster Uferhöhe. Alt `OLD_ZGLAKE`.
- Bach (`buildDoloWater3`, Ufer längs geglättet, alt `OLD_BANKSM`): Mäander und wechselnde Breite (`dlMeander`), eigene feine Rinne mit Ufern, Sohle und tiefer liegendem 3D-Wasser mit Wellen, Glanz und Schaum (`dlWaterMat3`); das Kachelgelände wird im Umkreis von ca. 230 m um die Kamera entlang des Bachs ausgeblendet (Maske `DLH`, 0,5 m je Pixel, `dlHoleStep`). An Straßen endet der Bach in einem Durchlass (Stirnmauer mit Rohr, `dlCulverts`). Alt `OLD_DLBACH`, nur ohne Ausblenden `NO_DLHOLE`.
- Einfahrten: Enden von Nebenwegen an der Hauptstraße werden entlang der Seitenlinie auf den Fahrbahnrand geschnitten (keine Pfeilspitzen mehr). Alt `OLD_SIDEEND`.
- Buckel: kleine Hügel 15–60 m, bis ca. ±1,5 m auf Wiesen/Almen (`dlBump`, ab 10 m neben der Straße, schwach in Orten/Fels, nicht im Bachbett). Aus `NO_DLBUMP`.
- Felsstreifen: schärfere Dreifach-Projektion und verbogene Höhenproben, damit die Wände nicht wie Höhenlinien wirken. Alt `OLD_ROCKSTRIPE`. Panorama nahe der Straße abgesenkt (`OLD_PANOLOW`, wirkungslos für den Straßenfehler, aber unschädlich).
- Prüfung abgekürzt (Heikos Wunsch): Bilder 640×360, `NF=12`, Zahlenprüfungen per `EV` statt Bilder; `tdolo.js` hat `XB` (Bachquerungen) und `XH` (Kehren). Higgsfield: nichts verbraucht.

**0.26.0 Tiere in den Dolomiten** (Heiko 27.11.: Higgsfield-Credits für Tiere, Kleinkram, Audio nutzen; bis 100 Credits ohne Rückfrage)
- Modelle (`quelle/props/`): `alpkuh` (Braunvieh mit Glocke), `gaemse`, `steinbock`, `murmel` (aufrecht sitzendes Murmeltier, ersetzt in den Dolomiten das alte `murmeltier`), `yeti`. Weg: Referenzbild `gpt_image_2_6` (Seitenansicht, weißer Grund, 1 Credit) → `tripo_h3_1_image_to_3d` mit `face_limit` 3000–7000 → in der Higgsfield-Sandbox `gltf-transform resize 512 / jpeg 80 / weld` (je 135–250 KB, 2,7–6,7 Tsd. Dreiecke) → als Graustufen-PNG in die Cloud (cloudfront ist aus der Cloud gesperrt), md5 geprüft. Blickrichtung/Höhe in `PROP_FIX`, Vierbeiner bekommen das Auto-Skelett aus 0.22.0 (`ANIM_CFG`: alpkuh trot, gaemse/steinbock gal).
- Töne (`quelle/sfx/`, `mirelo_text_to_audio`, je 1 Credit, mono 22 kHz 32 kbit/s, loudnorm): `dl_gaemse` (Warnpfiff + Geröll), `dl_glocken` (Herde), `dl_steinbock` (Hörner krachen), `dl_adler`, `dl_yeti` (Ruf mit Echo). Kuh-Muhen von Mirelo war fast stumm, deshalb weiter `kuh`/`kuh2`.
- Platzierung `buildDoloFauna` (nach `addProps`, fester Zufallsstart, also jedes Mal gleich): Kandidaten alle 60 m an allen 4 Kanten, beidseitig 16–320 m, bewertet nach `gnLC` (0 Wiese, 10 Alm, 6 Fels, 9 Geröll, 4 Siedlung, 1 Wald), Höhe, Hangneigung, Straßenabstand, nicht im Bachbett (`dlBedQ`), Kühe nicht an Siedlungen. Ergebnis: 12 Kuhherden, 7 Gämsenrudel, 3 Steinbockgruppen, 12 Murmeltier-Kolonien, 1 Yeti (139 Tiere, `window.DLFAUNA`). Stufe Niedrig 60 %, Minimal 35 %.
- Verhalten (`dlFaunaStep`, aus `animateCritters`): Kühe grasen/gehen (`critterAnim`), Gämsen ab 70 m und Steinböcke ab 32 m schauen und flüchten bergauf, weg vom Fahrer, nie über die Straße (`dlWildStep`), Gämsen pfeifen dabei (einmal je Rudel); Murmeltier-Wächter steht auf und taucht ab, unter 11 m bleibt es unten. Yeti (`DLF.yeti`, `window.DLYETI`): hinter einem großen Felsbrocken (`DLMETA.blk`, ≥ 2,4 m) nahe dem Passo Giau, 45–190 m von der Straße, dreht sich langsam zum Fahrer, ruft unter 130 m (alle 4 min). Ohne Felsbrocken (Minimal) auf freier Fläche. Alt `OLD_YETIPOS`.
- Ton (`AMB.near`, nur `dolo`): Glocken nah an Kuhherden alle 5–12 s (`dl_glocken`/`kuhglocken`), Adler über 1.850 m bei Tag, Muhen/Murmeltier/Steinbock über `call` (Aliasse `alpkuh→kuh`, `murmel→murmeltier`, `steinbock→dl_steinbock`).
- Leistung: jedes Tier 1 Zeichenaufruf. Weiter als `DLF.vis()` (Mittel/Hoch 380 m, Niedrig 300, Minimal 200) unsichtbar, Schatten nur unter 90 m. Zittau unverändert (nur ein zusätzlicher Vergleich je Tier in `animateCritters`).
- Ganz aus: `window.NO_DLFAUNA`. Lizenz: Higgsfield-Bedingungen 4.4 erlauben kommerzielle Nutzung in jedem Tarif (siehe `docs/DATENQUELLEN.md`), im Spiel unter „Datenquellen“ genannt. Credits: 69,5 verbraucht, Rest 2.931.
- Test: `tdolo.js` mit `EV` (Zahlen) und `V`-Bildern; die Sichtweiten-Abschaltung nimmt im Test die Position aus `window._camFix`. Bilder vorschau/260_*.jpg. Nicht geprüft: FPS am iPad, Flucht/Pfiff im echten Fahren, Ton-Lautstärken.

**0.25.10 Dolomiten: Startpunkt, Fernpanorama** (Hicore 27.11. abends)
- Startpunkt: Knopf „Auf Karte wählen“ erscheint jetzt auch bei den Dolomiten (`spRender`). Im Menü sind die Dolomiten-Daten nicht die aktive Welt, daher holt die Karte ihre Kanten, Orte und das Satellitenbild direkt aus `window.DLDATA` (`bmSrc`, `bmDolo`; `dataLoadDolo()` wird beim ersten Öffnen geladen). Auswahl in `DL_PICK` (Speicher `dlStart`), beim Start `zgApplyStart(DL_PICK||Cortina)`. Wählbar ist nur die Runde selbst (4 Kanten). Liegt der Punkt auf der Hauptrunde, ist die Runde 50,3 km (ohne den Abstecher Cortina–Pocol, mit ihm 62,7 km). Test: `MENU`-Option in `tests/tdolo.js` (JS im Menü vor dem Start), Start am Passo Giau geprüft.
- Verwaschene Bergrücken: per Strahlprobe (`EVN` mit Raycaster) gefunden, dass der Rücken östlich von Cortina gar nicht zum Kachelgelände gehört, sondern zum Fernpanorama (`buildDoloPano`, eigenes Knotenmaterial, nur unscharfes Satellitenbild). Cortina liegt am Ostrand des Innengebiets. Jetzt im Panorama-Material: Waldmaske aus der 10-m-Landbedeckung (`dlWaldTex()`, `window.DLWALDT`, R8-Textur 2200×2000) zeichnet Waldränder und ein gekörntes Kronendach, Wiesen/Schutt leicht gekörnt. Alt `OLD_PANOWALD`, ganz aus `NO_DLWALD`. Dieselbe Maske wirkt im Kachel-Shader ab 1,5 km. Der Versuch aus 0.25.9 (`DLWASH`) bleibt abgeschaltet, er hatte auf diesen Rücken keine Wirkung.
- Pflasterstreifen „zu weit innen“ aus 0.25.9 war ein Irrtum: gemessen liegt die Innenkante 3,15 m neben der Mitte (halbe Fahrbahn 3,3 m), der Fahrer bei 2,3 m.

**0.25.0–0.25.9 Dolomiten (Daten, Höhenmodell TINITALY, Fels, Himmel, Bäche, Häuser, Wegkreuze, Felsbrocken):** Details jetzt in `docs/ARCHIV.md` (Werkzeugkette `dolo_bau.py` → `dolo_terrassen.py` → `dolo_detail.py` → `build_gpu.py`, Test `tdolo.js` mit `V`, `EV`, `EVB`, `EVN`, `NEAR`, `WAT2`, `SHR`).

**Bluefy-Anmeldung 0.24.2:** Details (`ACC.blu`, `ACC.handStart`, Kanal `hl:CODE`, `ACC.give`, Test `thlogin`) jetzt in `docs/ARCHIV.md`.


**0.23.1 Restpunkte, 0.23.2 Autoräder:** Details (`twend`, `OLD_STAIRFLOAT`, Dachschnee `SNOWCAP`, `saveSheet`, `steerStep2`, `OLD_WHEELS`, `OLD_CARSTEER`) jetzt in `docs/ARCHIV.md`.

**Handy-Fernbedienung 0.23.0:** Details (Seite `quelle/handy/`, Kanal `hc:CODE`, `CMP`, `NO_CMP`, Test `thandy` mit `fake_supabase.js`) jetzt in `docs/ARCHIV.md`. Online: https://hicore77.github.io/hicore-ride/webgpu-spiel/handy/

**Tiere und Autos 0.22.0:** Details (`ANIM_CFG`, Gangarten, `deerStep`, `blinkStep`, `wheelGeo`, `gtFinishStep`, Test `tanim`) jetzt in `docs/ARCHIV.md`.

- 0.21.0 Impostors (`IMP`, `impR` 60 m, `OLD_IMP`), Ruckler-Messung `tstutter2`, `upR`/`OLD_UPR`: Details in `docs/ARCHIV.md`. Poly Haven ist Standard.

**Offen / unsicher**
- 0.25.5 am iPad prüfen: Kadenz mit Drivo plausibel, geht beim Aufhören auf 0.
- 0.25.3 am iPad prüfen (Heiko 26.11.: „hat funktioniert“): Widerstand folgt der Steigung (Kammstraße, Lausche), Schwierigkeit-Regler wirkt, keine Aussetzer; Gefälle nur bis −1 % möglich.
- 0.25.1 am iPad prüfen: Trainersuche findet „DR“ (Stufe 1 Name), Watt/Kadenz im Spiel plausibel gegenüber Stages? Puls- und Stages-Suche weiter ok?
- 0.25.0 am iPad prüfen: Ladezeit Dolomiten, FPS mit Panorama (LITE/MINI kleiner), Felsfarbe, Steigungen Giau/Falzarego.
- 0.13.0 am iPad prüfen: Ladezeit-Meldung, Ruckler beim ersten Auto/Zug/Regen, FPS-Anzeige mit Prozent (Details 0.13.0 in docs/ARCHIV.md).
- 0.16.0 am iPad prüfen: Optik Gravel/MTB, Sitzhaltung, ob Farben direkt nach dem Radwechsel stimmen; Lenkerbreite/Flare/Hoods-Winkel ggf. in `GRAVEL_BAR` nachjustieren.
- 0.14.0 am iPad prüfen: Wege-Optik (Helligkeit, Grasnarbe, Waldboden), FPS mit den zusätzlichen Wegen.
- 0.18.0 am iPad prüfen: Treppen-Animation (Absteigen, Schultern, Drübertragen, MTB runter), Tempo auf Treppen, ob Stufen im Gelände versinken/schweben, FPS. FIT-Datei bei Strava auf den echten Straßen?
- 0.18.1 am iPad prüfen: Rennrad zeigt keine Feld-/Waldwege mehr, fehlt keine echte Straße?
- 0.17.3 am iPad prüfen: Feldwege frei, Äcker-Optik, FPS am Feld, Wackel-Phasen.
- 0.17.1 am iPad prüfen: Stärke des Wackelns (Gravel/MTB), Pfützen-Optik und Ausweichen, Matschbrocken sichtbar genug, Rutscher nicht zu oft; FPS mit dem neuen Wege-Shader. Pfützen starten bei Spielbeginn leer, auch wenn es schon lange regnet (echtes Wetter: Regen der letzten Stunden noch nicht ausgewertet).
- 0.19.0 am iPad prüfen: FPS mit Bäumen überall (v. a. Orte mit vielen Gartenbäumen, Felder), Ladezeit Kacheln, Sträucher, Acker-Farben, Waldwege dichter, Treppe Oybin Kammstraße (Zaun weg? Stufen sichtbar?), Schulter-Arm. Treppen über flachem Gelände: Stufen höchstens 40 cm Abweichung, deshalb teils halb im Boden; ggf. Gelände an Treppen anpassen.
- 0.17.0 am iPad prüfen: Ladezeit beim Start (Kacheln), Nachladen ohne Ruckler, Felswände (Jonsdorf/Oybin-Umgebung), Ränder Ost (Neiße) und Süd (Tschechien), Wanderer.
- 0.16.1 am iPad prüfen: Vorauswahl in Orten (Spitzkunnersdorf), ob dezente Abzweig-Hinweise reichen, Ruckler beim automatischen Neuberechnen, Optik der Einmündungen.
- Idee (Hicore 24.11.): Abbiegen über die Schaltgriffe der elektronischen Schaltung (links/rechts) wählen.
- 0.15.0 am iPad prüfen: Fahrgefühl Gravel/MTB, Ladezeit (+0,7 s), Wurzeln/Brücken.
- 0.24.5 am iPad prüfen: Sonneninsel Querwege links/rechts wählbar, nur noch 3 Welten in der Auswahl.
- 0.24.4 am iPad prüfen: Zäune quer über Straßen/Bahn weg? Fehlen jetzt sichtbar Zäune? Gras auf Pflaster weg, Handy-Pfeile bleiben stehen, Trikots.
- Konten bestätigt (Hicore 26.11., 19:47, Bluefy): Passwort-Login, Profil, Fahrt mit FIT und Bestzeit im Konto. Noch nicht real getestet: QR-Übergabe vom Handy, FIT-Download aus dem Konto in Bluefy.
- 0.23.2 am iPad prüfen: Räder im Radkasten, Einlenken beim Überholen und in Kurven, Kreisel-Gegenverkehr.
- 0.23.1 am iPad prüfen: Speichern in Bluefy (Teilen-Knopf, sonst „An Handy senden“), Dachschnee bei „viel“, Knirschen, Treppen/Wegenden. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

0. Dolomiten: Heikos iPad-Urteil zu 0.26.1 abwarten (FPS auf Mittel mit neuem Bach und 9000 Fahrlinienpunkten, Kehren rund genug, noch Gelände auf der Straße an Nebenstraßen?, Bach-Optik, Pedal in Kurven; Zittau: Olbersdorfer See). Dann Texturatlas-Version (Tiere, Kleinobjekte, Fassaden, mit Messung) und Blatt-/Baumbilder aus Higgsfield prüfen. Aus 0.26.0 weiter offen: FPS mit Tieren, Tiere zu klein/groß, Flucht, Glocken-Lautstärke). Offene Tier-Ideen: Kühe mit Glocken auch in Zittau, Kleinobjekte (Heuharfen, Wegweiser Wanderwege, Bänke an Aussichtspunkten), Alpendohlen. Danach 0.25.6–0.25.8-Punkte (FPS auf Mittel, Himmel, Gras, Wald nahe der Straße echt oder Kegel?). Dann weiter Nahdetail nach Entfernung (Blätter/Rinde/Gras/Fassaden: nah Struktur, ab 20–30 m schlicht, weiche Übergänge), Licht/Atmosphäre, Wolken weniger gemalt, Wasser aus der Nähe prüfen; für alle Welten Texturen/Bewuchs gegen freie Alternativen prüfen (vorher/nachher messen). Kapellen; Lärche/Zirbe/Latschen, Alpenblumen; Bäche Boite/Cordevole/Codalonga türkis mit Rauschen; Gipfelnamen.

1. Hicores Rückmeldung zu 0.13.0 und 0.14.0 (iPad).
1a. 0.19.8 am iPad prüfen: Absteigen/Aufsteigen über den Sattel natürlich? Schultern Gravel (0.19.7) hat Hicore bestätigt. Gabeln 0.19.5 (Gravel starr, MTB federt genug/zu viel?), Treppe Oybin Kammstraße frei (0.19.2). Aus 0.19.1 noch offen: Tschechien-Bäume (FPS, Optik südlich der Lausche), Treppen (Böschung/Erdrampe).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
1e. 0.23.0 testen: Spiel am iPad, 📱 oben rechts, QR mit dem Handy scannen; Abbiegen per Pfeil, Wenden, Gesten, Werte am Handy. Danach Ideen: „Ride On“, Karte am Handy, Lenker-Knöpfe.
1d. 0.22.0 am iPad prüfen: Hirsch/Reh (Kammstraße Oybin–Lückendorf) laufen/galoppieren natürlich? Weidetiere, Autos beim Überholen (Lenken, Wanken, Blinker), Räder rund, Ruckler beim Nachladen weniger? FPS unverändert?
1c. 0.21.0 am iPad prüfen (Hicore 25.11.: läuft wesentlich flüssiger) (Chrome und Bluefy): FPS am Waldrand/im Wald, fällt der Wechsel 3D ↔ Bild auf (ca. 50–60 m), Bäume von oben/Berg, Ruckler noch da? Falls Übergang sichtbar: `impR` größer, Atlas 256 → 384 px.
1b. 0.20.0 am iPad prüfen (Chrome und Bluefy): FPS-Anzeige ablesen (FPS, „max 30“, Prozent, CPU ms) an Start, im Ort, im Wald; Bäume/Wald unverändert? Stromsparmodus aus. Je nach CPU-Wert nächster Schritt: CPU hoch → weitere Zeichenaufrufe bündeln (Fahrer, Deko, Häuser); CPU niedrig → Grafiklast (Blattkarten-Bäume, Schatten, Nachbearbeitung).
4. Leistung Teil 3 nur bei Bedarf: Modelle nach Bedarf laden (Rad-Verschmelzen seit 0.16.0, Wald-Bündeln seit 0.20.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. Treppen: erledigt in 0.18.0. Mögliche Verfeinerung: echte Zwischenpodeste, Treppen-Zählung aus Luftbild, Mitspieler tragen sichtbar.
7. Konten erledigt (0.24.0). Mögliche Folgen: Bestenliste je Bergwertung unter Freunden (Leserecht `segment_bests` für angemeldete), FTP für Trainingszonen/W/kg nutzen, Easter Eggs, später Abo.
