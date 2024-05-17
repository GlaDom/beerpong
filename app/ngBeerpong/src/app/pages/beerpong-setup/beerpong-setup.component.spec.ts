import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeerpongSetupComponent } from './beerpong-setup.component';

describe('BeerpongSetupComponent', () => {
  let component: BeerpongSetupComponent;
  let fixture: ComponentFixture<BeerpongSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BeerpongSetupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeerpongSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
