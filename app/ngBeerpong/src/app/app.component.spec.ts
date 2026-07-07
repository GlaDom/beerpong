import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { AppComponent } from './app.component';
import { UserStore } from './store/user/user.store';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
      ],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            logout: jasmine.createSpy('logout'),
          },
        },
        {
          provide: UserStore,
          useValue: {
            isLoggedIn: signal(false),
            userDetails: signal({ name: 'Test User' }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
