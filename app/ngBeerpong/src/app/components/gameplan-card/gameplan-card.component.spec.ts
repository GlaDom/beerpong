import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplanCardComponent } from './gameplan-card.component';

describe('GameplanCardComponent', () => {
  let component: GameplanCardComponent;
  let fixture: ComponentFixture<GameplanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameplanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
