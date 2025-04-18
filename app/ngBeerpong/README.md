# NgBeerpong

Frontend fuer die Beerpong Applikation

## Authentifizierung

Fuer die Authentifizierung wird in diesem Projekt Auth0 verwendet. Um sich erfolgreich bei Auth0 zu authentifizieren und sich anschliessend einen validen Token
fuer die Beerpong API abholen zu koennen muessen folgende lokale Einstellungen gemacht werden.

Im File /etc/hosts muss die Zeile `127.0.0.1 skbeerpong.com` hinzugefuegt werden. 
Die Applikation wird zudem mit dem Flag `--host=skbeerpong.com` gestartet, da Auth0 keinen "Consent Skip" fuer unverfiable Hosts zulaesst und localhost
ist immer ein unverifiable Host. Dieser Workaround dient allein dazu mit der Methode `getAccessTokenSilently()` einen validen Access Token fuer 
die Beerpong API abzurufen.
Um den Workaround abzuschliessen muss die Applikation auch noch unter HTTPS gestartet werden, da fuer wurde ein self-signed Zertifikat dem Projekt 
hinzugefuegt.

## Development server

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
