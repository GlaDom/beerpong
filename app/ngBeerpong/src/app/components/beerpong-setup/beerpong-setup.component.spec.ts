import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GameModes } from '../../api/game-modes.enum';
import { BeerpongStore } from '../../store/beerpong/beerpong.store';
import { UserStore } from '../../store/user/user.store';
import { BeerpongSetupComponent } from './beerpong-setup.component';

describe('BeerpongSetupComponent', () => {
  let component: BeerpongSetupComponent;
  let fixture: ComponentFixture<BeerpongSetupComponent>;
  let createGameSpy: jasmine.Spy;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    createGameSpy = jasmine.createSpy('createGame');
    navigateSpy = jasmine.createSpy('navigate');

    await TestBed.configureTestingModule({
      imports: [BeerpongSetupComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserStore,
          useValue: {
            userDetails: signal({ sub: 'user-1' }),
          },
        },
        {
          provide: BeerpongStore,
          useValue: {
            createGame: createGameSpy,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BeerpongSetupComponent);
    component = fixture.componentInstance;
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('switches into league mode with one group and expanded team options', () => {
    component.setMode(GameModes.LEAGUE);
    component.setTeamsPerGroup(12);

    expect(component.isLeagueMode()).toBeTrue();
    expect(component.amountOfGroups.value).toBe(1);
    expect(component.maxTeamsPerGroup()).toBe(16);
    expect(component.qualifiedTeamOptions()).toEqual([2, 4, 8]);
  });

  it('sends league mode in the tournament payload', () => {
    component.setMode(GameModes.LEAGUE);
    component.setTeamsPerGroup(8);

    component.startGame();

    expect(createGameSpy).toHaveBeenCalled();
    const payload = createGameSpy.calls.mostRecent().args[0];
    expect(payload.tournament.mode).toBe(GameModes.LEAGUE);
    expect(payload.tournament.groups.length).toBe(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/adminspace']);
  });
});
