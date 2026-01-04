import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DunaIdentity } from './duna-identity';

describe('DunaIdentity', () => {
  let component: DunaIdentity;
  let fixture: ComponentFixture<DunaIdentity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DunaIdentity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DunaIdentity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
