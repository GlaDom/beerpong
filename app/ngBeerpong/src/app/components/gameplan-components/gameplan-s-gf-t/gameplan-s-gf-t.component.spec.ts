import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameplanSGfTComponent } from './gameplan-s-gf-t.component';

describe('GameplanSGfTComponent', () => {
  let component: GameplanSGfTComponent;
  let fixture: ComponentFixture<GameplanSGfTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameplanSGfTComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GameplanSGfTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
