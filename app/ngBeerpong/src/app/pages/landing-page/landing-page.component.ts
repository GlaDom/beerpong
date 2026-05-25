import { Component, signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrl: './landing-page.component.css',
    imports: []
})
export class LandingPageComponent {
  public openFaqIndex = signal(-1);

  public faqItems = [
    {
      q: 'Brauche ich einen Account?',
      a: 'Nur für das Organisieren — Spieler & Zuschauer können den Live‑Spielplan ohne Login ansehen. Anmeldung läuft über Auth0 (Google, Apple, E‑Mail).'
    },
    {
      q: 'Wie viele Teams sind möglich?',
      a: 'Bis zu 10 Gruppen mit jeweils 3 bis 5 Teams. Insgesamt also bis zu 50 Teams pro Turnier — das reicht für die größte Studentenparty.'
    },
    {
      q: 'Wird Schiedsrichter‑Einteilung automatisch gemacht?',
      a: 'Ja. Du trägst eine kommagetrennte Liste ein, SK Beerpong verteilt die Spiele gleichmäßig auf die Refs.'
    },
    {
      q: 'Kann ich Punktestände nachträglich ändern?',
      a: 'Ja, bis du das Spiel auf "Eintragen" sperrst. Danach nur noch der Organisator über die Adminansicht.'
    },
  ];

  public features = [
    { icon: 'users',   title: 'Gruppen & Teams',           desc: 'Bis zu 10 Gruppen mit 3–5 Teams. Namen per Hand, oder per "Random" füllen.' },
    { icon: 'tree',    title: 'K.O.‑Runde automatisch',    desc: 'Achtel‑, Viertel‑, Halbfinale und Finale. SK Beerpong setzt die Paarungen.' },
    { icon: 'gavel',   title: 'Eintragen & Sperren',       desc: 'Punkte eingeben, "Eintragen" klicken — Karte wird grün, Phase rückt vor.' },
    { icon: 'eye',     title: 'Live‑Spielplan',             desc: 'Spieler & Zuschauer sehen Ergebnisse in Echtzeit — ohne Login.' },
    { icon: 'whistle', title: 'Schiedsrichter',             desc: 'Optionale Liste an Schiedsis, automatisch auf die Spiele verteilt.' },
    { icon: 'trophy',  title: 'Endplatzierung',             desc: 'Differenz, Becher‑Hit, Becher‑Get — vollständige Tabelle 1.–letzter Platz.' },
  ];

  public freePlanFeatures: [string, boolean][] = [
    ['1 aktives Turnier', true],
    ['Bis zu 4 Gruppen', true],
    ['Live‑Spielplan teilen', true],
    ['Export (.pdf, .csv)', false],
    ['Vergangene Turniere', false],
    ['Eigene Schiedsrichter', false],
  ];

  public premiumFeatures: [string, boolean][] = [
    ['Unbegrenzte Turniere', true],
    ['Bis zu 10 Gruppen, 5 Teams', true],
    ['Live‑Spielplan + QR‑Code', true],
    ['Export (.pdf, .xlsx, .csv)', true],
    ['Komplette Turnierhistorie', true],
    ['Eigene Schiedsrichter‑Listen', true],
  ];

  constructor(private authService: AuthService) {}

  public login(): void {
    this.authService.login();
  }

  public toggleFaq(i: number): void {
    this.openFaqIndex.update(v => v === i ? -1 : i);
  }
}
