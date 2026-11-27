# Datenquellen und Lizenzen

Stand 27.11.2026 (0.26.0). Maßstab: Alles muss auch bei kommerzieller Nutzung erlaubt sein (Heiko hält sich offen, später Geld damit zu verdienen). Nichts mit „nur nicht-kommerziell“ (NC) einbauen. Die Einschätzung ist nach bestem Wissen aus den veröffentlichten Lizenztexten, keine Rechtsberatung. Vor einem Verkauf die mit ⚠ markierten Punkte klären.

## Unbedenklich, auch kommerziell (teils mit Quellenangabe)

| Quelle | Wofür | Lizenz | Pflicht |
|---|---|---|---|
| OpenStreetMap | Straßen, Wege, Gebäude, Bäche, Wegkreuze, Orte (beide Welten) | ODbL 1.0 | Angabe „© OpenStreetMap-Mitwirkende“. Das Spiel selbst ist ein „Produced Work“. Unsere abgeleiteten Datendateien (z. B. `net.json`) müssen auf Wunsch unter ODbL weitergegeben werden; sie liegen ohnehin offen im Repo. |
| Overture Maps (Gebäude) | Zittau, Gebäudeumrisse | ODbL bzw. CDLA Permissive 2.0 | Quellenangabe |
| TINITALY 1.1 (INGV) | Dolomiten, Höhenmodell 10 m | CC BY 4.0 | Zitat: Tarquini S., Isola I., Favalli M., Battistini A., Dotta G. (2023), TINITALY 1.1, INGV, doi 10.13127/tinitaly/1.1 |
| Copernicus DEM GLO-30 | Höhen (Zittau; Dolomiten bis 0.25.5) | frei, auch kommerziell | „© DLR e.V. 2010–2014 und © Airbus Defence and Space GmbH 2014–2018, bereitgestellt unter COPERNICUS durch die Europäische Union und ESA“ |
| Copernicus Sentinel-2 | Dolomiten, Geländefarben | frei, auch kommerziell | „Enthält veränderte Copernicus-Sentinel-Daten 2025“ |
| ESA WorldCover 2021 | Landbedeckung beide Welten | CC BY 4.0 | „© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium“ |
| Luftbild Sachsen DOP20 (GeoSN) | Zittau, Einzelbäume | Datenlizenz Deutschland Namensnennung 2.0 | „© GeoSN, dl-de/by-2-0“ |
| Orthofoto ČÚZK | Zittau, Bäume auf tschechischer Seite | CC BY 4.0 | „© ČÚZK“ |
| Kronenhöhen Meta / WRI (1 m) | Zittau, Baumhöhen | CC BY 4.0 | Quellenangabe |
| Poly Haven | Texturen (Asphalt, Wiese, Waldboden, Fels, Felswand, Bachgeröll usw.), Himmelsfoto Dolomiten (HDRI sunflowers_puresky) | CC0 | keine, wird trotzdem genannt |
| Three.js, Supabase-Client, QR-Code-Bibliothek | Programmcode | MIT | Lizenzhinweis im Code bleibt erhalten |
| Eigene, im Spiel erzeugte Texturen und Modelle | Häuser, Fahrzeuge, Räder, Bäume | eigenes Werk | keine |
| Higgsfield (Bild: GPT Image 2.6, 3D: Tripo H3.1, Töne: Mirelo SFX) | Dolomiten-Tiere ab 0.26.0: `alpkuh`, `gaemse`, `steinbock`, `murmel`, `yeti` (props/), Töne `dl_gaemse`, `dl_glocken`, `dl_steinbock`, `dl_adler`, `dl_yeti` (sfx/) | Higgsfield-Nutzungsbedingungen 4.4 (Stand 23.10.2026): Higgsfield beansprucht keine Rechte an Ergebnissen und schränkt die kommerzielle Nutzung nicht ein, für alle Tarife (erzeugt mit Ultra, 27.11.2026). Keine Exklusivität; Higgsfield darf gespeicherte Ergebnisse zum Training nutzen. | keine Pflicht, im Spiel trotzdem genannt |

Weitere geprüfte, freie Quellen für später (noch nicht genutzt): ambientCG (CC0, Texturen), ShareTextures und cgbookcase (CC0), Quaternius und Kenney (CC0, einfache Modelle), Poly Haven Modelle (CC0, Felsen und Pflanzen als glTF), Freesound nur mit Filter CC0 (CC BY-NC dort nicht nehmen), LiDAR-Geländemodelle Provinz Bozen und Region Venetien (offen, Lizenz je Datensatz vor Nutzung prüfen).

## ⚠ Vor kommerzieller Nutzung klären oder ersetzen

| Punkt | Problem | Lösung |
|---|---|---|
| Open-Meteo (echtes Wetter) | Die kostenlose Schnittstelle ist nur für nicht-kommerzielle Nutzung. | Bei Verkauf: Bezahltarif von Open-Meteo oder echtes Wetter abschalten. |
| Geräusche von ElevenLabs | Kommerzielle Rechte gibt es nur für Töne, die mit einem Bezahltarif erzeugt wurden. Im kostenlosen Tarif: nicht kommerziell, mit Namensnennung. | Heiko prüft, mit welchem Tarif die Töne entstanden sind. Sonst neu erzeugen oder durch CC0-Aufnahmen ersetzen. |
| Polizei-Ansagen (edge-tts) | Nutzt die Vorlese-Stimmen von Microsoft Edge über eine inoffizielle Schnittstelle. Kommerzielle Nutzung ist nicht gedeckt. | Vor Verkauf mit einer lizenzierten Stimme neu erzeugen. |
| Ältere 3D-Modelle aus Higgsfield / Tripo (Fahrer, Wahrzeichen, Fahrzeuge, Zittauer Tiere) | Laut heutigen Higgsfield-Bedingungen (4.4) ist kommerzielle Nutzung in jedem Tarif erlaubt. Ob das auch für Modelle gilt, die vor dem 27.08.2026 unter älteren Bedingungen entstanden sind, ist nicht geprüft. | Vor Verkauf die damals gültigen Bedingungen prüfen oder die Modelle neu erzeugen. |
| Trikots und Namen | Keine echten Marken- oder Vereinslogos verwenden. | So beibehalten. |

## Nicht verwendet (bewusst)

- Google-, Esri-, Bing-Satellitenbilder und Google-Earth-3D-Modelle: Lizenz verbietet die Übernahme.
- Mapillary-Fotos: nur angesehen, um Häuser nachzubauen; keine Bilder im Spiel.
- Fertige 3D-Modelle der Dolomiten aus dem Netz: Herkunft meist Google Earth oder unklar. Das offene 10-m-Höhenmodell bringt mehr und ist sauber lizenziert.
- Zwift: nichts übernommen.

## Wo die Angaben im Spiel stehen

Startmenü, Reiter „Welt“, unten „Datenquellen und Lizenzen“. Bei neuen Quellen dort und hier ergänzen.
