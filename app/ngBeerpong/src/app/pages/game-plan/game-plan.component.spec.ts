import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamePlanComponent } from './game-plan.component';

describe('GamePlanComponent', () => {
  let component: GamePlanComponent;
  let fixture: ComponentFixture<GamePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GamePlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GamePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
