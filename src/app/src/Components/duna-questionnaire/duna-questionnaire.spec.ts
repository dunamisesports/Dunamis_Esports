import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DunaQuestionnaire } from './duna-questionnaire';

describe('DunaQuestionnaire', () => {
  let component: DunaQuestionnaire;
  let fixture: ComponentFixture<DunaQuestionnaire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DunaQuestionnaire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DunaQuestionnaire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
