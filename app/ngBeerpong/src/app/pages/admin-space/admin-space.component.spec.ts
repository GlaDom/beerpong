import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { ConfigurationService } from '../../services/configuration.service';
import { BeerpongStore } from '../../store/beerpong/beerpong.store';
import { AdminSpaceComponent } from './admin-space.component';

describe('AdminSpaceComponent', () => {
  let component: AdminSpaceComponent;
  let fixture: ComponentFixture<AdminSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSpaceComponent],
      providers: [
        {
          provide: BeerpongStore,
          useValue: {
            isLoading: signal(false),
            gameId: signal(1),
            matches: signal([]),
            groups: signal([]),
            currentGame: signal({ tournament: { number_of_qualified_teams: 0 } }),
            toastStatus: signal('notset'),
            loadGame: jasmine.createSpy('loadGame'),
            updateRoundOfSixteen: jasmine.createSpy('updateRoundOfSixteen'),
            updateQuaterFinals: jasmine.createSpy('updateQuaterFinals'),
            updateSemiFinals: jasmine.createSpy('updateSemiFinals'),
            updateFinal: jasmine.createSpy('updateFinal'),
            finishGame: jasmine.createSpy('finishGame'),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            sortTeamsInGroups: (groups: unknown[]) => groups,
            sortMatches: () => [],
            filterMatches: () => [],
          },
        },
        {
          provide: MessageService,
          useValue: {
            add: jasmine.createSpy('add'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
