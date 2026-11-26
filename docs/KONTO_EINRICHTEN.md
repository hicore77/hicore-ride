# Konten einrichten (einmalig, Supabase-Dashboard)

Projekt: https://supabase.com/dashboard/project/snpmmskruuzqrvvsdztz

## 1. Datenbank anlegen (Pflicht, 1 Minute)
SQL Editor › New query › den Inhalt von `supabase/konto.sql` einfügen › **Run**.
Datei: https://github.com/hicore77/hicore-ride/blob/main/supabase/konto.sql (Knopf „Copy raw file“).
Legt an: `profiles`, `rides`, `segment_bests`, Speicher-Bucket `fit`, Funktion `delete_my_account`. Alles mit Row Level Security (jeder sieht nur seine Daten). Mehrfach ausführen schadet nicht.

## 2. Rückkehr-Adressen (Pflicht)
Authentication › URL Configuration:
- Site URL: `https://hicore77.github.io/hicore-ride/webgpu-spiel/`
- Redirect URLs › Add URL: `https://hicore77.github.io/hicore-ride/**`
- Später bei eigener Domain zusätzlich z. B. `https://hicore-ride.de/**` eintragen. Im Spiel ist nichts fest verdrahtet (es nimmt immer die aktuelle Seite).

## 3. Code in die E-Mail (Pflicht für Bluefy)
Authentication › Emails › Templates, bei **Magic Link** und bei **Confirm signup** jeweils eine Zeile ergänzen und speichern:
```html
<p>Dein Code für Hicore Ride: <b>{{ .Token }}</b></p>
```
Grund: Ein Link aus der Mail-App öffnet sich in Safari, nicht in Bluefy. Den Code tippt man direkt im Spiel ein.

## 4. E-Mail-Versand für Freunde (optional)
Der eingebaute Versand von Supabase schickt nur an Adressen von Mitgliedern deines Supabase-Teams und nur wenige Mails pro Stunde. Für dich selbst reicht das.
Für Freunde: Authentication › Emails › SMTP Settings › eigenen Server eintragen, z. B. ein Hostinger-Postfach: Host `smtp.hostinger.com`, Port `465`, Benutzer = Postfach-Adresse, Passwort des Postfachs, Absender = dieselbe Adresse.
Alternative ohne Mail: Freunde melden sich mit Google an.

## 5. Google-Anmeldung (optional, ca. 10 Minuten)
1. https://console.cloud.google.com › neues Projekt „Hicore Ride“.
2. APIs & Services › OAuth consent screen (bzw. „Google Auth Platform“): External, App-Name „Hicore Ride“, deine E-Mail. Danach unter Audience auf **Publish app / In production** stellen, sonst dürfen nur eingetragene Testnutzer rein.
3. Credentials › Create credentials › OAuth client ID › Web application.
   - Authorized JavaScript origins: `https://hicore77.github.io`
   - Authorized redirect URIs: `https://snpmmskruuzqrvvsdztz.supabase.co/auth/v1/callback`
4. Client ID und Client Secret kopieren.
5. Supabase › Authentication › Sign In / Providers › Google › Enable, beide Werte einfügen › Save.

Hinweis Bluefy: Google sperrt Anmeldungen aus manchen eingebetteten Browsern. Ob Bluefy betroffen ist, zeigt erst der Test. Falls ja: in Bluefy per E-Mail-Code anmelden, in Chrome per Google; beides landet im selben Konto, wenn die E-Mail-Adresse gleich ist.
