import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodexPrincipia } from './codex-principia';

describe('CodexPrincipia', () => {
  let component: CodexPrincipia;
  let fixture: ComponentFixture<CodexPrincipia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodexPrincipia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodexPrincipia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
