import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {AppointmentService} from 'src/externalService/service/appointment/AppointmentService';
import {PersonService} from 'src/externalService/service/person/PersonService';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Person} from 'src/externalService/model/person/Person';
import {formatDate} from '@angular/common';
import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'nuevaPersona',
  templateUrl: 'nuevaPersona.html',
  standalone: true,
  imports: [MatDialogModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDividerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaPersonaDialog {
  personForm: FormGroup;
  isFormEnabled: boolean = false;
  isUserRegistered: boolean = false;
  token: string | null = null;// Reemplaza con el token correcto
  foundPerson: Person | null = null;

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private snackBar: MatSnackBar, // Para mostrar notificaciones 
    private dialogRef: MatDialogRef<NuevaPersonaDialog>,

  ) {
    this.token = localStorage.getItem('token');
    this.personForm = this.fb.group({
      cedula: new FormControl(''),
      nombre: new FormControl(''),
      apellido: new FormControl(''),
      fechaNacimiento: new FormControl(''),
      ocupacion: new FormControl('')
    });

    this.personForm = this.fb.group({
      cedula: ['', Validators.required],
      nombre: [{ value: '', disabled: true }, Validators.required],
      apellido: [{ value: '', disabled: true }, Validators.required],
      fechaNacimiento: [{ value: '', disabled: true }, Validators.required],
      ocupacion: [{ value: '', disabled: true }, Validators.required],
    });


  }

  buscarPersona() {
    const cedula = this.personForm.get('cedula')?.value;
    if (!this.token) {
      this.snackBar.open('Error: token no encontrado. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.personService.getPersonByIdentification(cedula).subscribe({
      next: (person: Person) => {
        this.snackBar.open('El paciente ya se encuentra registrado', 'Cerrar', { duration: 3000 });
        // Usuario encontrado, llenamos el formulario
        this.foundPerson = person;
        this.isUserRegistered = true;
        this.personForm.patchValue({
          nombre: person.first_name,
          apellido: person.last_name,
          fechaNacimiento: person.birth_date,
          ocupacion: person.occupancy,
        });
        this.personForm.disable();

      },
      error: (error) => {
        this.isUserRegistered = false;
        this.snackBar.open(error, 'Cerrar', { duration: 3000 });
        this.isFormEnabled = true;
        this.personForm.enable();
        this.snackBar.open('Usuario no registrado', 'Cerrar', { duration: 3000 });
        this.foundPerson = null;
      }
    });
  }


  onSubmit() {
    if (!this.token) {
      this.snackBar.open('Error: token no encontrado. Por favor, inicie sesión nuevamente.', 'Cerrar', { duration: 3000 });
      return;
    }
    const newPerson: Person = {
      id: '',
      identification: this.personForm.get('cedula')?.value,
      first_name: this.personForm.get('nombre')?.value,
      last_name: this.personForm.get('apellido')?.value,
      birth_date: formatDate(this.personForm.get('fechaNacimiento')?.value, 'yyyy-MM-dd', "en-US"),
      occupancy: this.personForm.get('ocupacion')?.value
    };
    this.personService.createPerson(newPerson, this.token).subscribe({
      next: () => {
        this.snackBar.open('Paciente creado con exito.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open("Error al registrar el paciente. Consulte al Administrador.", 'Cerrar', { duration: 3000 });
      }
    });
  }

}
