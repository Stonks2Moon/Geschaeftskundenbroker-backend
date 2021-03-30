# Geschaeftskundenbroker

## Repos
Frontend: https://github.com/Stonks2Moon/Geschaeftskundenbroker-frontend

Dokumentation und Organisation: https://github.com/Stonks2Moon/Geschaeftskundenbroker

API: https://business.moonstonks.space/api/

Swagger: https://business.moonstonks.space/api//docs


## Firma
Eine Firma kann als Geschäftskunde auftreten.
Jede Firma hat einen eindeutigen Identifikationscode, sowie eine Adresse.

## Kunde
Ein Kunde ist eine natürliche Person, die einer Firma angehört.
Kunden können sich auf der Webseite anmelden, nachdem sie sich registriert haben.
Für die Registrierung muss vorher eine Firma angelegt werden, der der Kunde angehört.

## Depot
Das Depot gehört einem Firma und wird von einem Kunden verwaltet.
Es beinhaltet die Aktien einer Firma.
Aktien können gekauft werden und werden in das Depot der Firma aufgenommen.
Werden Aktien verkauft, sind diese nicht mehr im Depot der Firma sichtbar.

## Trendentwicklungen
Zum Abbilden von Trendentwicklungen wird eine Tabelle verwendet.
Diese beeinhaltet einen Zeitstempel, den Preis, sowie einen Identifier für die Aktie.
Ein automatisiertes Script (CronJob) wird verwendet, um die Daten für unsere Aktientabelle zu erneuern. Zudem werden die aktuellen Werte zu der Trendtabelle hinzugefügt, um Analysen bereitstellen zu können.
Ein API-Endpunkt wird verwendet, um die Daten zu Aktientrends im Geschäftskundenbroker-frontend anzeigen zu können.
