import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { UnderConstruction } from './under-construction';

describe('UnderConstruction', () => {
  async function createFixture(label?: string): Promise<ComponentFixture<UnderConstruction>> {
    await TestBed.configureTestingModule({
      imports: [UnderConstruction],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { label } } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(UnderConstruction);
    fixture.detectChanges();
    return fixture;
  }

  it('con label en los datos de la ruta: lo muestra en el mensaje', async () => {
    const fixture = await createFixture('Historia');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Historia está en construcción');
  });

  it('sin label: muestra el mensaje generico', async () => {
    const fixture = await createFixture(undefined);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Esta sección está en construcción');
  });

  it('siempre ofrece un enlace para volver a inicio', async () => {
    const fixture = await createFixture('Historia');
    const link: HTMLAnchorElement | null = (fixture.nativeElement as HTMLElement).querySelector(
      'a[href="/inicio"]',
    );
    expect(link).not.toBeNull();
  });
});
