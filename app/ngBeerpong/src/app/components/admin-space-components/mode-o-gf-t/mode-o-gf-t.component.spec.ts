import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeOGfTComponent } from './mode-o-gf-t.component';

describe('ModeOGfTComponent', () => {
  let component: ModeOGfTComponent;
  let fixture: ComponentFixture<ModeOGfTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeOGfTComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModeOGfTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
