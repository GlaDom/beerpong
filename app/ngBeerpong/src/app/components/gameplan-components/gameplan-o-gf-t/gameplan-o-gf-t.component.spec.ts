import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplanOGfTComponent } from './gameplan-o-gf-t.component';

describe('GameplanOGfTComponent', () => {
  let component: GameplanOGfTComponent;
  let fixture: ComponentFixture<GameplanOGfTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameplanOGfTComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameplanOGfTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
