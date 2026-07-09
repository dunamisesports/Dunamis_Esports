import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ourgames } from './ourgames';

describe('Ourgames', () => {
  let component: Ourgames;
  let fixture: ComponentFixture<Ourgames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ourgames]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ourgames);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
