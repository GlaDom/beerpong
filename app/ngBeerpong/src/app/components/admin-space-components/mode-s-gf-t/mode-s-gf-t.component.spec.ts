import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeSGfTComponent } from './mode-s-gf-t.component';

describe('ModeSGfTComponent', () => {
  let component: ModeSGfTComponent;
  let fixture: ComponentFixture<ModeSGfTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModeSGfTComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModeSGfTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
