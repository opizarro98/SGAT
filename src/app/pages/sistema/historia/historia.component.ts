import { Component } from '@angular/core';
import { AntecedentsService } from 'src/externalService/service/antecedets/antecedentService';
import { DiagnosisService } from 'src/externalService/service/diagnosis/DiagnosisService';
import { DiagnosisPersonService } from 'src/externalService/service/diagnosisPerson/DiagnosisPersonService';
import { PersonService } from 'src/externalService/service/person/PersonService';

@Component({
  selector: 'app-historia',
  templateUrl: './historia.component.html',
})
export class HistoriaComponent {
  identification: string = '';
  paciente: any = null; // Aquí se guarda el paciente buscado
  token: string | null = null;
  attentions: any[] = []; // Lista de atenciones para el acordeón
  diagnosis: string = ''; // Diagnóstico actual
  antecedentes: string = ''; // Antecedentes actuales

  constructor(
    private personService: PersonService,
    private diagnosisService: DiagnosisPersonService,
    private antecedentsService: AntecedentsService
  ) {
    this.token = localStorage.getItem('token');
  }

  calcularEdad(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  buscarPaciente() {
    if (!this.identification) {
      console.error('La cédula no puede estar vacía');
      return;
    }

    const token = this.token || ''; // Obtener el token

    this.personService.getPersonByIdentification(this.identification).subscribe({
      next: (person) => {
        // Construir el objeto paciente
        this.paciente = {
          id: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
          birthDate: person.birthDate,
          occupancy: person.occupancy,
          history: person.history,
          appointments: person.appointments
        };

        // Obtener antecedentes
        this.antecedentsService.getAntecedentsByPersonId(person.id, token).subscribe({
          next: (antecedents) => {
            console.log(antecedents);
            this.antecedentes = antecedents.map((ant) => ant.description).join('\n');
          },
          error: () => {
            console.error('Error al obtener antecedentes');
            this.antecedentes = 'No se encontraron antecedentes.';
          }
        });

        // Obtener diagnósticos
        this.diagnosisService.getDiagnosisByPersonId(person.id, token).subscribe({
          next: (diagnosis) => {
            this.diagnosis = diagnosis.map((diag) => diag.description).join('\n');
          },
          error: () => {
            console.error('Error al obtener diagnósticos');
            this.diagnosis = 'No se encontraron diagnósticos.';
          }
        });

        // Obtener lista de atenciones
        this.attentions = person.history?.attentions || [];
      },
      error: () => {
        console.error('Error al buscar la persona');
        this.paciente = null;
        this.attentions = [];
        this.diagnosis = '';
        this.antecedentes = '';
      }
    });
  }
}