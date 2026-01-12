import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DunaContact } from './duna-contact';

describe('DunaContact', () => {
  let component: DunaContact;
  let fixture: ComponentFixture<DunaContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DunaContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DunaContact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
