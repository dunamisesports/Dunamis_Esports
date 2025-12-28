import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DunaNews } from './duna-news';

describe('DunaNews', () => {
  let component: DunaNews;
  let fixture: ComponentFixture<DunaNews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DunaNews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DunaNews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
