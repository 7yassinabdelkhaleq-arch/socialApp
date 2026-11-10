import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSuggestedComponent } from './all-suggested.component';

describe('AllSuggestedComponent', () => {
  let component: AllSuggestedComponent;
  let fixture: ComponentFixture<AllSuggestedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSuggestedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllSuggestedComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
