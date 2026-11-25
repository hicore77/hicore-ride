# Hicore Ride: Übergabe (aktueller Stand)

Stand: 25.11.2026. Letzte veröffentlichte Version: **0.19.5 Beta** (Gravel-Starrgabel aus einem Stück, MTB-Federgabel federt; davor 0.19.4 Schultern mit Unterarm hinter dem Steuerrohr).
Diese Datei ist bewusst kurz und enthält nur, was ein neuer Thread zum Weiterarbeiten braucht.
Alles Ältere (Entscheidungsgeschichte, frühere Versionen, Hardware-Details, Asset-Herkunft) steht in **`docs/ARCHIV.md`**. Nur bei Bedarf gezielt darin suchen (`grep`), nicht ganz lesen.

**Arbeitsweise seit 24.11.:** Ein Thread pro Schritt bzw. Version. Am Ende jeder Version diese Datei aktualisieren: Stand, Versionsnotizen (nur die letzten 3, ältere nach `docs/ARCHIV.md` verschieben), nächster Schritt. Ziel: höchstens ca. 200 Zeilen.

---

## 1. Worum es geht

- Zwift-ähnliches Indoor-Radspiel im Browser. Three.js r187 mit WebGPU (Rückfall WebGL 2), eine große HTML-Datei plus Datenpakete, Bluetooth über Web Bluetooth.
- Hauptwelt **Zittauer Gebirge**: echtes OSM-Straßennetz (ca. 180 km), echte Höhen, Kreuzungen, Kreisel, Verkehr, Bahn, Wahrzeichen, Wetter. Weitere Welten: Sonneninsel, Elbsandstein, Hügelland, Alpenpass.
- Zielgruppe: Hicore selbst und Freunde (Multiplayer über Supabase Realtime). Später eventuell öffentlich, Abo-Idee nicht entschieden.
- Bleibt im Browser (Entscheidung 19.11.). Keine Markenlogos, keine Google-/Esri-Bilder, kein Nachbau fremder Spiele.
- Hauptgerät: **iPad Air M1**, Bluetooth nur in der App **Bluefy**. Watt/Kadenz über Stages-Powermeter, Puls über Wahoo TICKR X. Elite Drivo hat kein FTMS, Widerstandssteuerung ungelöst.

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
- Nie automatisch nachkaufen. Vor jeder kostenpflichtigen Generierung Kosten und Restguthaben nennen, Hicore entscheidet (Stand 24.11.: Higgsfield ca. 0,5 Credits, aiqora ca. 137).
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
| 0.19.3 | Schultern: Oberkörper aufrecht, Schultern waagerecht (siehe unten) |
| 0.19.4 | Schultern: Oberarm unter dem Oberrohr, Unterarm hinter dem Steuerrohr durch an den inneren Unterlenker (siehe unten) |
| **0.19.5** | **Gabeln: Gravel Carbon-Starrgabel aus einem Stück (`taperLeg`), MTB-Federgabel federt (`forkStep`)** (siehe unten) |

**Kacheln/Rand (0.17.0):** Details (Datenquellen, `rand_auffuellen.py`, `kacheln.py`, `KC`/`kcTick`/`kcReady`, Felsen, Zäune, Wanderer `HIKE`, Tests `tkc`/`thike`) jetzt in `docs/ARCHIV.md`.

**Fahrgefühl auf Wegen (0.17.1):** Details (`WF`, `wayFeelStep`, Pfützen `WET.p`, Matsch, Test `twet`) jetzt in `docs/ARCHIV.md`.

**Echte Bäume aus Luftbild (0.17.2):** Details (Quellen, Kette `werkzeuge/chm_ausschnitt|dop_holen|dop_baeume|dop_einfuegen`, `gnDopW`, `NO_DOPT`, Test `tdop`) jetzt in `docs/ARCHIV.md`. Nächste Ausschnitte: gleiche Kette mit anderer bbox.

**Hotfix 0.17.3:** Details (Nahgras/Acker auf Wegen, `gfCell`, `NO_GFWAY`, Test `tgf`) jetzt in `docs/ARCHIV.md`.

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

**Schultern 0.19.3** (Hicore am iPad: linke Schulter hängt, Körper gebogen, Griff von außen über dem Oberrohr)
- Ursache Biegung: Rücken-Bogen in `poseGLB` hatte seinen Kontrollpunkt bei x der Fahrposition (`hx/sx` ≈ Radmitte), beim Tragen stehen Becken/Schulter aber 22 cm daneben. Jetzt Mitte aus `hipL/sh`. Schlüsselbeine beim Tragen waagerecht statt vorn-unten. Alt: `window.OLD_CARRYSPINE`.
- Griff: Rad Euler x 0,2 → 0,35 (vorn tiefer), Ellbogen-Pol (−0,15, −0,6, 1): Arm unter dem Oberrohr durchs Dreieck, Hand am inneren Unterlenker (`GRIPF[2]` gespiegelt). Bei Gravel liegt die Rahmentasche im Dreieck, der Arm verschwindet dahinter (kein sichtbares Durchdringen). Alt: `window.OLD_CARRYGRIP`.
- Prüfen mit `tests/tcarry.js` (Ansichten `front,back,outer,ic,oc,left,right,q34`; `outer`/`oc` = Radseite).
- 0.19.4 (Hicore: Unterarm lag noch VOR dem Steuerrohr, Referenz Foto 1 vom 24.11.): Kontaktpunkt am Oberrohr 0,32 → 0,40, Rad Euler x 0,35 → 0,15, Ellbogen-Ziel `H.Right.E` im Rad-System (−0,3, 0,6, 0,2) als Pol, Griff am inneren Unterlenker 6 cm weiter hinten. `tcarry.js` gibt je Bild eine Zeile `mess` aus (Rad-Koordinaten): `crossFore.hinterHT` muss true sein, `dForeHT` ≥ 0,06. Stand: Gravel 12,6 cm hinter dem Steuerrohr, 9,5 cm Abstand; MTB 15,7 cm, 13,1 cm. Ansicht `fl` = Hicores Kamera vorne links. Alt: `window.OLD_CARRYGRIP2`.

**Gabeln 0.19.5** (Hicore: MTB soll federn, Gravel sah nach Federgabel aus)
- Gravel: Gabelbein jetzt `taperLeg()` (CatmullRom-Rohr, 2,0 → 1,05 cm, oval, leicht nach vorn gebogen) statt zwei `ft`-Stücken mit Absatz. Alt: `window.OLD_GRAVELFORK`.
- MTB: Tauchrohre, Brücke, Ausfallenden, Vorderrad (`wF`), Achse, Scheibe und Sattel liegen in Gruppe `r.fork.g` (aus `buildDirtBike`, nicht verschmolzen). `forkStep(r)` (aus `placeRider`, nur eigener Fahrer) = Feder-Dämpfer k 800, ζ 0,45, Ziel aus `WF.rough`·Tempo·Rauschen, `WF.y`, `STAIR.bump`, Bremsen; Weg 0–6 cm entlang Lenkachse. Schotter bei 18 km/h: 6–15 mm. Beim Tragen 0. Aus: `window.NO_FORKMOVE`.
- Test: `FORKX=0.05 BIKES=mtb VIEWS=forkS,fork node tbike.js` (Zeile `gabel` = Federweg-Simulation, Bild mit festem Einfederweg).

**Offen / unsicher**
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
- Schnee-Reste aus 0.12.0: Dach-Schneekanten, Schneegeräusche (Details in docs/ARCHIV.md).
- Poly-Haven-Texturen als Standard? Hicore soll am iPad vergleichen.
- FIT- und Fahrtbild-Download in Bluefy kaputt. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

1. Hicores Rückmeldung zu 0.13.0 und 0.14.0 (iPad).
1a. 0.19.5 am iPad prüfen: Gabeln (Gravel starr, MTB federt auf Schotter genug/zu viel?), Schultern 0.19.4, Treppe Oybin Kammstraße frei (0.19.2). Aus 0.19.1 noch offen: Tschechien-Bäume (FPS, Optik südlich der Lausche), Treppen (Böschung/Erdrampe).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
4. Leistung Teil 2 nur bei Bedarf: Modelle nach Bedarf laden, Wald-Instanzen bündeln (Rad-Verschmelzen ist seit 0.16.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. Treppen: erledigt in 0.18.0. Mögliche Verfeinerung: echte Zwischenpodeste, Treppen-Zählung aus Luftbild, Mitspieler tragen sichtbar.
7. Accounts (Supabase Auth mit Google), Easter Eggs, später Abo.
