import { IsmaCursoForm } from '../../core/models/isma-curso.model';
import { validarCurso } from './isma-cursos';

const valido = (over: Partial<IsmaCursoForm> = {}): IsmaCursoForm => ({
  parroquiaId: 'p1',
  startDate: '2026-08-24',
  endDate: '2026-11-08',
  diaSemana: 2,
  horaInicio: '19:30',
  horaFin: '21:00',
  modalidad: 'presencial',
  telefonoInformes: '',
  notas: '',
  ...over,
});

describe('validarCurso', () => {
  it('acepta un curso completo coherente', () => {
    expect(validarCurso(valido())).toBeNull();
  });

  it('acepta un curso sin horario (solo fechas)', () => {
    expect(
      validarCurso(valido({ diaSemana: null, horaInicio: '', horaFin: '' })),
    ).toBeNull();
  });

  it('exige parroquia', () => {
    expect(validarCurso(valido({ parroquiaId: '' }))).not.toBeNull();
  });

  it('rechaza fin anterior al inicio', () => {
    expect(validarCurso(valido({ endDate: '2026-08-01' }))).toContain('fin');
  });

  it('exige dia cuando hay horario', () => {
    expect(validarCurso(valido({ diaSemana: null }))).toContain('día');
  });

  it('exige hora de inicio y fin cuando hay dia', () => {
    expect(validarCurso(valido({ horaFin: '' }))).toContain('hora');
  });

  it('rechaza hora de fin no posterior', () => {
    expect(validarCurso(valido({ horaInicio: '21:00', horaFin: '19:00' }))).toContain('hora de fin');
  });
});
