import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplanComponent } from './gameplan.component';

describe('GameplanComponent', () => {
  let component: GameplanComponent;
  let fixture: ComponentFixture<GameplanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameplanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
