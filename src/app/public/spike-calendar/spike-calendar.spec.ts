import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { SpikeCalendar } from './spike-calendar';

/**
 * SPIKE (Tarea 2.1) — verificacion real (TestBed + Chrome via Karma, no solo build) de
 * que @fullcalendar/angular renderiza y reacciona a cambios de signal bajo
 * `provideZonelessChangeDetection` (la misma configuracion de `app.config.ts`).
 */
describe('SpikeCalendar (spike @fullcalendar/angular + zoneless)', () => {
  let fixture: ComponentFixture<SpikeCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpikeCalendar],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SpikeCalendar);
    fixture.detectChanges();
    // FullCalendar termina de montar su DOM interno de forma asincrona.
    await fixture.whenStable();
  });

  it('monta el DOM real de FullCalendar (clase .fc) dentro del componente', () => {
    const el: HTMLElement = fixture.nativeElement;
    const fcRoot = el.querySelector('.fc');
    expect(fcRoot).withContext('FullCalendar no inserto su contenedor .fc').not.toBeNull();
  });

  it('renderiza los 2 eventos iniciales como elementos .fc-event', () => {
    const el: HTMLElement = fixture.nativeElement;
    const events = el.querySelectorAll('.fc-event');
    expect(events.length).toBe(2);
  });

  it('reacciona bajo zoneless a un cambio del signal `calendarOptions` sin detectChanges manual extra', async () => {
    const component = fixture.componentInstance;
    (component as unknown as { addExtraEvent(): void }).addExtraEvent();
    // Zoneless: el signal-write dispara CD por si solo; solo esperamos estabilidad.
    await fixture.whenStable();

    const el: HTMLElement = fixture.nativeElement;
    const events = el.querySelectorAll('.fc-event');
    expect(events.length).toBe(3);
  });

  it('el click de un evento de FullCalendar actualiza el signal expuesto en la plantilla', async () => {
    const el: HTMLElement = fixture.nativeElement;
    const firstEvent = el.querySelector<HTMLElement>('.fc-event');
    expect(firstEvent).not.toBeNull();
    firstEvent!.click();
    await fixture.whenStable();

    const text = el.textContent ?? '';
    expect(text).not.toContain('(ninguno todavia)');
  });
});
